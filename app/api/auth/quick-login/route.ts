import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { COOKIE_NAME, createSessionToken, isUserAdmin } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { z } from 'zod';

const loginSchema = z.object({
  persona: z
    .enum(['admin', 'developer_senior', 'developer_junior', 'support', 'client', 'custom'])
    .optional(),
  email: z.string().email().optional(),
  username: z.string().min(2).max(32).optional(),
  targetRole: z
    .enum(['admin', 'developer_senior', 'developer_junior', 'support', 'client'])
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    let user;

    if (validated.persona === 'admin') {
      user = await dbService.getUserById('903391086054');
      if (!user) {
        user = await dbService.upsertUser({
          id: '903391086054',
          username: 'alex_synthetix',
          global_name: 'AlexDev • Studio Founder',
          avatar: 'a_f183748291024',
          email: 'admin@synthetixstudio.dev',
          role: 'admin',
        });
      }
    } else if (validated.persona === 'developer_senior') {
      user = await dbService.getUserById('dev-senior-marcus');
      if (!user) {
        user = await dbService.upsertUser({
          id: 'dev-senior-marcus',
          username: 'marcus_dev',
          global_name: 'MarcusDev • Lead NMS & Java',
          avatar: 'd_192837465',
          email: 'marcus@synthetixstudio.dev',
          role: 'developer_senior',
        });
      }
    } else if (validated.persona === 'developer_junior') {
      user = await dbService.getUserById('dev-junior-leo');
      if (!user) {
        user = await dbService.upsertUser({
          id: 'dev-junior-leo',
          username: 'leo_dev',
          global_name: 'LeoDev • Junior Dev',
          avatar: 'e_582910293',
          email: 'leo@synthetixstudio.dev',
          role: 'developer_junior',
        });
      }
    } else if (validated.persona === 'support') {
      user = await dbService.getUserById('support-elena');
      if (!user) {
        user = await dbService.upsertUser({
          id: 'support-elena',
          username: 'elena_support',
          global_name: 'Elena • Soporte & Tickets',
          avatar: 'f_849201837',
          email: 'soporte@synthetixstudio.dev',
          role: 'support',
        });
      }
    } else if (validated.persona === 'client') {
      user = await dbService.getUserById('client-phoenix-mc');
      if (!user) {
        user = await dbService.upsertUser({
          id: 'client-phoenix-mc',
          username: 'phoenix_owner',
          global_name: 'Phoenix Network [Owner]',
          avatar: 'b_728491028374',
          email: 'contact@phoenixmc.net',
          role: 'client',
        });
      }
    } else {
      // Login por Correo / Nombre
      const email = validated.email || 'cliente@synthetix.dev';
      const username = validated.username || email.split('@')[0];
      const customId = `user-${Math.abs(hashString(email))}`;
      const role: UserRole =
        validated.targetRole ||
        (isUserAdmin(customId) || email.includes('admin') ? 'admin' : 'client');

      user = await dbService.upsertUser({
        id: customId,
        username,
        global_name: username,
        email,
        role,
      });
    }

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
