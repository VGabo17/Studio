import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, COOKIE_NAME, createSessionToken } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  global_name: z.string().min(2).max(50).optional(),
});

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Refrescar desde la base de datos
  const freshUser = await dbService.getUserById(sessionUser.id);
  const user = freshUser || sessionUser;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      global_name: user.global_name,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    const updated = await dbService.upsertUser({
      id: sessionUser.id,
      username: sessionUser.username,
      global_name: validated.global_name !== undefined ? validated.global_name : sessionUser.global_name,
      avatar: sessionUser.avatar,
      email: sessionUser.email,
      role: sessionUser.role,
    });

    const token = await createSessionToken(updated);
    const response = NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        global_name: updated.global_name,
        avatar: updated.avatar,
        email: updated.email,
        role: updated.role,
        created_at: updated.created_at,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar configuración';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

