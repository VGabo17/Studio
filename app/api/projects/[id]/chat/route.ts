import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isStaff } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { z } from 'zod';

const postMessageSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(1500),
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

  // Comprobar autorización: cliente del proyecto o miembro del staff
  const staff = isStaff(user.role);
  if (!staff && project.client_id !== user.id) {
    return NextResponse.json({ error: 'No tienes acceso al chat de este proyecto' }, { status: 403 });
  }

  const messages = await dbService.getChatMessagesByProjectId(id);
  return NextResponse.json({ success: true, messages });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const project = await dbService.getProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const staff = isStaff(user.role);
  if (!staff && project.client_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso para enviar mensajes en este proyecto' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = postMessageSchema.parse(body);

    const message = await dbService.addChatMessage(id, user.id, validated.message);

    // Despacho de notificación Discord en tiempo real
    await sendDiscordNotification('CHAT_MESSAGE', {
      projectId: project.id,
      projectTitle: project.title,
      clientName: user.global_name || user.username,
      authorName: user.global_name || user.username,
      chatMessage: validated.message,
      customWebhookUrl: project.client_discord_webhook || undefined,
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.flatten() }, { status: 400 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Error al enviar mensaje de chat';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
