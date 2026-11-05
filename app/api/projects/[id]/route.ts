import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { z } from 'zod';

const updateProjectSchema = z.object({
  status: z.enum(['pending', 'in_development', 'testing', 'completed', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  price: z.number().positive().nullable().optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
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

  // Verificar permisos: dueño del proyecto o administrador
  if (user.role !== 'admin' && project.client_id !== user.id) {
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

  // Solo administradores pueden modificar estados, progreso y costos
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores del estudio pueden modificar este proyecto' }, { status: 403 });
  }

  const existingProject = await dbService.getProjectById(id);
  if (!existingProject) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const validated = updateProjectSchema.parse(body);

    const previousStatus = existingProject.status;
    const previousProgress = existingProject.progress;

    const updated = await dbService.updateProject(id, validated);
    if (!updated) {
      return NextResponse.json({ error: 'Error al actualizar el proyecto' }, { status: 500 });
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
