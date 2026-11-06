import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isStaff, canSetPrice } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { z } from 'zod';

const updatePaymentConfigSchema = z.object({
  paypal_url: z.string().url('Debe ser una URL válida de PayPal (ej: https://paypal.me/tu_usuario)').optional().or(z.literal('')),
  stripe_payment_link: z.string().url('Debe ser una URL válida de Stripe Checkout (ej: https://buy.stripe.com/...)').optional().or(z.literal('')),
  tebex_store_url: z.string().url('Debe ser una URL válida de Tebex/CraftingStore').optional().or(z.literal('')),
  crypto_wallet_usdt: z.string().min(5, 'Dirección de USDT requerida').optional().or(z.literal('')),
  crypto_wallet_btc: z.string().optional().or(z.literal('')),
  bank_transfer_info: z.string().optional().or(z.literal('')),
});

export async function GET() {
  try {
    const config = await dbService.getPaymentConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al consultar configuración de pagos', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (!canSetPrice(user.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Únicamente los administradores pueden modificar las pasarelas y URLs oficiales de cobro.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updatePaymentConfigSchema.parse(body);

    const updated = await dbService.updatePaymentConfig(validated);

    // Registrar en auditoría
    await dbService.createAuditLog({
      user_id: user.id,
      action: 'RATE_UPDATE',
      project_id: null,
      project_title: 'Pasarelas de Pago del Estudio',
      details: `El administrador ${user.global_name || user.username} actualizó las URLs y pasarelas oficiales de cobro (PayPal/Stripe/Tebex/Cripto)`,
      metadata: { ...validated },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: err.flatten() }, { status: 400 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Error al guardar configuración de pagos';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
