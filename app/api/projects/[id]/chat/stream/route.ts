import { NextRequest } from 'next/server';
import { getCurrentUser, isStaff } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { ProjectChatMessage } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const project = await dbService.getProjectById(id);
  if (!project) {
    return new Response('Project Not Found', { status: 404 });
  }

  const staff = isStaff(user.role);
  if (!staff && project.client_id !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Enviar evento de conexión exitosa
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userRole: user.role })}\n\n`));

      // 2. Suscribirse a nuevos mensajes en dbService
      const unsubscribe = dbService.subscribeToChat(id, (msg: ProjectChatMessage) => {
        try {
          controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(msg)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // 3. Heartbeat cada 25 segundos
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: "keep-alive"\n\n`));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
