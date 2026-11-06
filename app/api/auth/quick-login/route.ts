import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { COOKIE_NAME, createSessionToken, isUserAdmin } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const email = validated.email.trim().toLowerCase();
    const username = (validated.username || email.split('@')[0]).trim();
    const customId = `user-${Math.abs(hashString(email))}`;

    // 1. Verificar si el usuario ya existe en D1 para no perder su rol
    const existingUser = await dbService.getUserById(customId);

    // 2. Asignar rol: Preserva el de D1 o evalúa si el email/ID es admin
    let role: UserRole = 'client';
    if (existingUser && existingUser.role) {
      role = existingUser.role as UserRole;
    } else if (isUserAdmin(email) || isUserAdmin(customId)) {
      role = 'admin';
    }

    const userId = existingUser?.id || customId;

    const user = await dbService.upsertUser({
      id: userId,
      username: existingUser?.username || username,
      global_name: existingUser?.global_name || username,
      email,
      role,
    });

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
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
    const errorMsg = err instanceof Error ? err.message : 'Invalid login request';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
