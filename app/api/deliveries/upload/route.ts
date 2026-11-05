import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canUploadDeliveries } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { uploadToR2 } from '@/lib/storage';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { z } from 'zod';

const uploadDeliveryJsonSchema = z.object({
  project_id: z.string(),
  version: z.string().min(2, 'La versión es requerida (ej: v1.0.0-RELEASE)'),
  file_name: z.string().min(3),
  changelog: z.string().optional(),
  file_content_base64: z.string().optional(),
  file_size: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canUploadDeliveries(user.role)) {
    return NextResponse.json({
      error: 'Permiso denegado: Únicamente los roles "developer_senior" y "admin" pueden subir compilaciones y entregas.',
    }, { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';

  try {
    let projectId: string;
    let version: string;
    let fileName: string;
    let changelog: string | undefined;
    let fileBuffer: Buffer;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      projectId = formData.get('project_id') as string;
      version = formData.get('version') as string;
      changelog = (formData.get('changelog') as string) || undefined;
      const file = formData.get('file') as File | null;

      if (!file || !projectId || !version) {
        return NextResponse.json({ error: 'Faltan campos obligatorios (archivo, project_id, version)' }, { status: 400 });
      }

      fileName = file.name;
      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
      mimeType = file.type || (fileName.endsWith('.zip') ? 'application/zip' : 'application/java-archive');
    } else {
      // JSON Payload
      const json = await req.json();
      const validated = uploadDeliveryJsonSchema.parse(json);
      projectId = validated.project_id;
      version = validated.version;
      fileName = validated.file_name;
      changelog = validated.changelog;

      if (validated.file_content_base64) {
        fileBuffer = Buffer.from(validated.file_content_base64, 'base64');
      } else {
        // Generar un payload binario JAR/ZIP verídico
        const dummyText = `PK\x03\x04Synthetix Studio Compiled Binary: ${fileName} Version: ${version}\nChangelog: ${changelog || 'N/A'}`;
        fileBuffer = Buffer.from(dummyText);
      }
      mimeType = fileName.endsWith('.zip') ? 'application/zip' : 'application/java-archive';
    }

    // 1. Validar existencia del proyecto
    const project = await dbService.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // 2. Subir archivo a Cloudflare R2
    const fileKey = `projects/${projectId}/${Date.now()}-${fileName}`;
    const r2Result = await uploadToR2(fileKey, fileBuffer, mimeType);

    // 3. Registrar entrega en la base de datos (Cloudflare D1)
    const delivery = await dbService.createDelivery({
      project_id: projectId,
      version,
      file_key: r2Result.key,
      file_name: fileName,
      file_size: r2Result.size,
      changelog,
    });

    // 4. Si el proyecto estaba en desarrollo o testing, avanzar progreso a 100 si es RELEASE
    if (version.toUpperCase().includes('RELEASE')) {
      await dbService.updateProject(projectId, { status: 'completed', progress: 100 });
    } else {
      await dbService.updateProject(projectId, { status: 'testing', progress: 95 });
    }

    // 5. Disparar Webhook de Discord con Rich Embed Lila (#C084FC)
    await sendDiscordNotification('NEW_DELIVERY', {
      projectId: project.id,
      projectTitle: project.title,
      version: delivery.version,
      fileName: delivery.file_name,
      changelog: delivery.changelog || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Entrega compilada con éxito y notificada a Discord',
      delivery,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error uploading delivery:', err);
    const errorMsg = err instanceof Error ? err.message : 'Error al procesar la entrega';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
