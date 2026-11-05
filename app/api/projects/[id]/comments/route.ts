import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { z } from 'zod';

const commentSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(1000),
});

interface RouteParams {
  params: Promise<{ id: string }>;
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

  // Verificar si es dueño o admin
  if (user.role !== 'admin' && project.client_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso para comentar en este proyecto' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = commentSchema.parse(body);

    const comment = await dbService.addComment(id, user.id, validated.message);

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.flatten() }, { status: 400 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Error al enviar comentario';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
