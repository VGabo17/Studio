import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  service_type: z.enum(['plugin_mc', 'setup_mc', 'bot_discord', 'full_pack']),
  description: z.string().min(10, 'Describe con mayor detalle los requerimientos técnicos'),
  price: z.number().positive().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    let projects;
    if (user.role === 'admin') {
      projects = await dbService.getAllProjects();
    } else {
      projects = await dbService.getProjectsByClientId(user.id);
    }

    return NextResponse.json({ success: true, projects });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error interno al consultar proyectos';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para solicitar un proyecto' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const project = await dbService.createProject({
      client_id: user.id,
      title: validated.title,
      service_type: validated.service_type,
      description: validated.description,
      price: validated.price,
    });

    // Disparar Webhook de Discord (NEW_ORDER con color Lila #C084FC)
    await sendDiscordNotification('NEW_ORDER', {
      projectId: project.id,
      projectTitle: project.title,
      serviceType: project.service_type,
      clientName: user.global_name || user.username,
      clientId: user.id,
      description: project.description,
      price: project.price || undefined,
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.flatten() }, { status: 400 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Error al procesar la solicitud';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
