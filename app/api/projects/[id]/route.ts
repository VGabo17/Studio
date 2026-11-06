import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isStaff, canCompleteProject, canSetPrice, canUpdateProgress } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { z } from 'zod';

const updateProjectSchema = z.object({
  status: z.enum(['pending', 'in_development', 'testing', 'completed', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  price: z.number().positive().nullable().optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  assigned_to: z.string().nullable().optional(),
  client_discord_webhook: z.string().url().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const project = await dbService.getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  // Verificar permisos: dueño del proyecto o miembro del staff
  const staff = isStaff(user.role);
  if (!staff && project.client_id !== user.id) {
    return NextResponse.json({ error: 'Acceso no autorizado a este proyecto' }, { status: 403 });
  }

  return NextResponse.json({ success: true, project });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const existingProject = await dbService.getProjectById(id);
  if (!existingProject) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const staff = isStaff(user.role);
  const isOwner = existingProject.client_id === user.id;

  if (!staff && !isOwner) {
    return NextResponse.json({ error: 'Acceso no autorizado a este proyecto' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = updateProjectSchema.parse(body);

    if (!staff) {
      // Clientes únicamente pueden configurar su webhook personal de Discord
      if (
        validated.status !== undefined ||
        validated.progress !== undefined ||
        validated.price !== undefined ||
        validated.title !== undefined ||
        validated.description !== undefined ||
        validated.assigned_to !== undefined
      ) {
        return NextResponse.json(
          { error: 'Los clientes únicamente pueden configurar sus preferencias de notificaciones Discord' },
          { status: 403 }
        );
      }
    }

    // REGLA GRANULAR 1: Solo developer_senior y admin pueden marcar 'completed'
    if (validated.status === 'completed' && !canCompleteProject(user.role)) {
      return NextResponse.json(
        { error: 'Permiso denegado: Únicamente los roles "developer_senior" y "admin" pueden marcar un proyecto como completado.' },
        { status: 403 }
      );
    }

    // REGLA GRANULAR 2: Solo admin puede modificar precios
    if (validated.price !== undefined && !canSetPrice(user.role)) {
      return NextResponse.json(
        { error: 'Permiso denegado: Únicamente los administradores pueden fijar o modificar tarifas acordadas.' },
        { status: 403 }
      );
    }

    // REGLA GRANULAR 3: Restricción de progreso para developers juniors
    if (validated.progress !== undefined && !canUpdateProgress(user.role, validated.progress)) {
      return NextResponse.json(
        { error: 'Permiso denegado: Tu rol como Developer Junior puede registrar avances hasta el 85% (Fase de Pruebas). La aprobación final requiere Developer Senior o Admin.' },
        { status: 403 }
      );
    }

    const previousStatus = existingProject.status;
    const previousProgress = existingProject.progress;
    const previousPrice = existingProject.price;

    const updated = await dbService.updateProject(id, validated);
    if (!updated) {
      return NextResponse.json({ error: 'Error al actualizar el proyecto' }, { status: 500 });
    }

    // Registrar logs de auditoría para acciones del staff
    if (staff) {
      if (validated.status && validated.status !== previousStatus) {
        await dbService.createAuditLog({
          user_id: user.id,
          action: 'STATUS_CHANGE',
          project_id: updated.id,
          project_title: updated.title,
          details: `Cambió el estado de "${previousStatus}" a "${validated.status}"`,
          metadata: { previousStatus, newStatus: validated.status },
        });
      }
      if (validated.progress !== undefined && validated.progress !== previousProgress) {
        await dbService.createAuditLog({
          user_id: user.id,
          action: 'PROGRESS_UPDATE',
          project_id: updated.id,
          project_title: updated.title,
          details: `Actualizó el progreso de desarrollo de ${previousProgress}% a ${validated.progress}%`,
          metadata: { previousProgress, newProgress: validated.progress },
        });
      }
      if (validated.price !== undefined && validated.price !== previousPrice) {
        await dbService.createAuditLog({
          user_id: user.id,
          action: 'PRICE_UPDATE',
          project_id: updated.id,
          project_title: updated.title,
          details: `Fijó la tarifa acordada en $${validated.price} USD (anterior: ${previousPrice !== null ? `$${previousPrice} USD` : 'Sin cotizar'})`,
          metadata: { previousPrice, newPrice: validated.price },
        });
      }
      if (validated.assigned_to !== undefined && validated.assigned_to !== existingProject.assigned_to) {
        await dbService.createAuditLog({
          user_id: user.id,
          action: 'PROJECT_ASSIGNMENT',
          project_id: updated.id,
          project_title: updated.title,
          details: `Reasignó el proyecto al desarrollador con ID ${validated.assigned_to || 'Sin asignar'}`,
          metadata: { previousAssignee: existingProject.assigned_to, newAssignee: validated.assigned_to },
        });
      }
    }

    // Si el estado o progreso cambian sustancialmente, disparar Discord Webhook
    if (
      (validated.status && validated.status !== previousStatus) ||
      (validated.progress !== undefined && Math.abs((validated.progress ?? 0) - previousProgress) >= 15)
    ) {
      await sendDiscordNotification('STATUS_CHANGED', {
        projectId: updated.id,
        projectTitle: updated.title,
        status: updated.status,
        previousStatus,
        progress: updated.progress,
        customWebhookUrl: updated.client_discord_webhook || undefined,
      });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.flatten() }, { status: 400 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Error al actualizar proyecto';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
