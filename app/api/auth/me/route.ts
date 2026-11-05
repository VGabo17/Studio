import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

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
