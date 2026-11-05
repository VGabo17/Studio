import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canSetPrice } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { ServiceType } from '@/lib/types';
import { z } from 'zod';

const updateRateSchema = z.object({
  service_type: z.enum([
    'plugin_mc',
    'setup_mc',
    'setup_dc',
    'web_portfolio',
    'bot_discord',
    'full_pack',
  ]),
  base_price: z.number().min(5).max(10000),
  delivery_time: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(500).optional(),
});

export async function GET() {
  try {
    const rates = await dbService.getServiceRates();
    return NextResponse.json({ success: true, rates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al consultar tarifas oficiales', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Autenticación requerida para modificar precios oficiales' },
        { status: 401 }
      );
    }

    if (!canSetPrice(currentUser.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Solo el Administrador Lead puede modificar las tarifas oficiales del estudio' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateRateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos para actualizar tarifa', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await dbService.updateServiceRate(
      parsed.data.service_type as ServiceType,
      {
        base_price: parsed.data.base_price,
        delivery_time: parsed.data.delivery_time,
        description: parsed.data.description,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'No se encontró el servicio solicitado' },
        { status: 404 }
      );
    }

    // Registro de auditoría a Discord
    await sendDiscordNotification('STATUS_CHANGED', {
      projectId: `RATE-${parsed.data.service_type.toUpperCase()}`,
      projectTitle: `Actualización de Tarifa Oficial: ${updated.name}`,
      serviceType: updated.service_type,
      clientName: currentUser.global_name || currentUser.username,
      description: `El administrador ${currentUser.global_name || currentUser.username} actualizó el precio base a $${updated.base_price} USD (Tiempo: ${updated.delivery_time}).`,
      price: updated.base_price,
    });

    return NextResponse.json({ success: true, rate: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar tarifa', details: String(error) },
      { status: 500 }
    );
  }
}
