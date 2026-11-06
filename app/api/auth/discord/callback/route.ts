import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { COOKIE_NAME, createSessionToken, isUserAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=oauth_cancelled', req.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/discord/callback`;

  try {
    // 1. Intercambio de code por access_token con la API de Discord
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Discord Token Exchange Error:', errText);
      return NextResponse.redirect(new URL('/?error=discord_exchange_failed', req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Obtener perfil del usuario desde Discord API
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/?error=discord_profile_failed', req.url));
    }

    const discordUser = await userRes.json();

    // 3. Obtener el usuario actual en D1 (si existe) para no perder el rol manual
    const existingUser = await dbService.getUserById(discordUser.id);

    let userRole = 'client';
    if (isUserAdmin(discordUser.id)) {
      userRole = 'admin';
    } else if (existingUser && existingUser.role) {
      userRole = existingUser.role; // Preserva 'admin', 'developer_senior', etc.
    }

    const dbUser = await dbService.upsertUser({
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar,
      email: discordUser.email || null,
      role: userRole,
    });

    // 4. Crear JWT seguro para la cookie de sesión
    const token = await createSessionToken(dbUser);

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (err) {
    console.error('OAuth Callback Exception:', err);
    return NextResponse.redirect(new URL('/?error=oauth_internal_error', req.url));
  }
}
