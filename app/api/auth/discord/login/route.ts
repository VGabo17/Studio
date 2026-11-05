import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/discord/callback`;

  if (!clientId || clientId === '123456789012345678') {
    // Si no hay credenciales de Discord registradas en .env, redirigir a login con aviso de demo
    return NextResponse.redirect(new URL('/?login_prompt=true&notice=discord_setup_required', req.url));
  }

  const state = Math.random().toString(36).substring(2, 15);
  const discordUrl = new URL('https://discord.com/api/oauth2/authorize');
  discordUrl.searchParams.set('client_id', clientId);
  discordUrl.searchParams.set('redirect_uri', redirectUri);
  discordUrl.searchParams.set('response_type', 'code');
  discordUrl.searchParams.set('scope', 'identify email');
  discordUrl.searchParams.set('state', state);

  return NextResponse.redirect(discordUrl.toString());
}
