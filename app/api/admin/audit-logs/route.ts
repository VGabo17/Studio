import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isStaff } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (!isStaff(user.role)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requiere rol de staff o administrador para ver los logs de auditoría.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const action = searchParams.get('action') || 'ALL';
    const search = searchParams.get('search') || '';

    const result = await dbService.getAuditLogs({
      page,
      limit,
      action,
      search,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los logs de auditoría', details: String(error) },
      { status: 500 }
    );
  }
}
