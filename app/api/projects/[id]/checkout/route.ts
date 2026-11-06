import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { sendDiscordNotification } from '@/lib/discord-webhook';
import { canAccessProject } from '@/lib/permissions';
import { PaymentGateway, PaymentStatus } from '@/lib/types';
import { z } from 'zod';

const checkoutSchema = z.object({
  type: z.enum(['deposit', 'full']),
  gateway: z.enum(['stripe', 'paypal', 'tebex', 'crypto']),
  clientNotes: z.string().max(300).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const project = await dbService.getProjectById(id);
  if (!project) {
    return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
  }

  if (!canAccessProject(user, project.client_id, project.assigned_to)) {
    return NextResponse.json({ success: false, error: 'Acceso no autorizado a este proyecto' }, { status: 403 });
  }

  if (!project.price || project.price <= 0) {
    return NextResponse.json({
      success: false,
      error: 'El proyecto aún no tiene una tarifa acordada por el administrador',
    }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const totalPrice = project.price;
    const currentPaid = project.paid_amount || 0;
    const halfPrice = Math.round((totalPrice / 2) * 100) / 100;

    let amountToPay = 0;
    let newPaymentStatus: PaymentStatus = 'fully_paid';
    let newPaidAmount = totalPrice;
    let depositAmount = project.deposit_amount || null;

    if (validated.type === 'deposit') {
      if (project.payment_status === 'fully_paid') {
        return NextResponse.json({ success: false, error: 'El proyecto ya está completamente pagado' }, { status: 400 });
      }
      amountToPay = halfPrice;
      newPaymentStatus = 'deposit_paid';
      newPaidAmount = halfPrice;
      depositAmount = halfPrice;
    } else {
      // Full payment (either 100% or remaining 50%)
      amountToPay = totalPrice - currentPaid;
      if (amountToPay <= 0) {
        return NextResponse.json({ success: false, error: 'El proyecto ya está liquidado' }, { status: 400 });
      }
      newPaymentStatus = 'fully_paid';
      newPaidAmount = totalPrice;
    }

    const txnId = `TXN-SYNTH-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const paidAt = new Date().toISOString();

    // Actualizar proyecto en base de datos
    const updated = await dbService.updateProject(id, {
      payment_status: newPaymentStatus,
      paid_amount: newPaidAmount,
      deposit_amount: depositAmount,
      payment_method: validated.gateway as PaymentGateway,
      transaction_id: txnId,
      paid_at: paidAt,
      // Si estaba pendiente, se activa a desarrollo automáticamente
      status: project.status === 'pending' ? 'in_development' : project.status,
    });

    // Registrar mensaje en el hilo del proyecto
    await dbService.addChatMessage(
      id,
      user.id,
      `💳 **Pago Confirmado**: Se abonaron **$${amountToPay.toFixed(2)} USD** mediante **${validated.gateway.toUpperCase()}** (N° Transacción: \`${txnId}\`). ${
        newPaymentStatus === 'fully_paid'
          ? 'El proyecto está 100% liquidado y las descargas han sido desbloqueadas.'
          : 'Se ha registrado el 50% de anticipo para inicio de desarrollo.'
      }`
    );

    // Despacho de Notificación Rich Embed a Discord (Studio + Webhook del cliente si existe)
    await sendDiscordNotification('PAYMENT_CONFIRMED', {
      projectId: project.id,
      projectTitle: project.title,
      clientName: user.global_name || user.username,
      clientId: user.id,
      amount: amountToPay,
      price: totalPrice,
      paymentMethod: validated.gateway,
      transactionId: txnId,
      customWebhookUrl: project.client_discord_webhook || undefined,
    });

    return NextResponse.json({
      success: true,
      receipt: {
        transaction_id: txnId,
        amount_paid: amountToPay,
        total_price: totalPrice,
        payment_status: newPaymentStatus,
        payment_method: validated.gateway,
        paid_at: paidAt,
        deliveries_unlocked: newPaymentStatus === 'fully_paid',
      },
      project: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error al procesar el pago';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
