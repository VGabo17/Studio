import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { getFromR2 } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ deliveryId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { deliveryId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para descargar este archivo' }, { status: 401 });
  }

  const delivery = await dbService.getDeliveryById(deliveryId);
  if (!delivery) {
    return NextResponse.json({ error: 'Archivo de entrega no encontrado' }, { status: 404 });
  }

  const project = await dbService.getProjectById(delivery.project_id);
  if (!project) {
    return NextResponse.json({ error: 'Proyecto asociado no encontrado' }, { status: 404 });
  }

  // Comprobar que el usuario sea el dueño o admin
  if (user.role !== 'admin' && project.client_id !== user.id) {
    return NextResponse.json({ error: 'No tienes autorización para descargar este archivo' }, { status: 403 });
  }

  // Obtener stream/buffer desde Cloudflare R2
  const r2Object = await getFromR2(delivery.file_key);
  if (!r2Object) {
    return NextResponse.json({ error: 'El archivo binario no está disponible en R2' }, { status: 404 });
  }

  const filename = delivery.file_name || 'download.jar';
  const encodedFilename = encodeURIComponent(filename);

  // Devolver el archivo como stream binario con headers de descarga directa
  return new NextResponse(new Uint8Array(r2Object.buffer), {
    status: 200,
    headers: {
      'Content-Type': r2Object.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': r2Object.buffer.byteLength.toString(),
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
