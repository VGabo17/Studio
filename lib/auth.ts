import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload, User } from './types';

const DEFAULT_SECRET = 'synthetix_cyber_lilac_secret_key_prod_2026_d1_r2_jwt';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_SECRET);

export const COOKIE_NAME = 'synthetix_session';

/**
 * Checks if a given Discord snowflake / user ID is listed in ADMIN_DISCORD_IDS
 */
export function isUserAdmin(userId: string): boolean {
  const adminIdsStr = process.env.ADMIN_DISCORD_IDS || '903391086054,123456789012345678,admin-dev-id';
  const adminIds = adminIdsStr.split(',').map((id) => id.trim()).filter(Boolean);
  return adminIds.includes(userId);
}

/**
 * Signs a JWT session token valid for 7 days
 */
export async function createSessionToken(user: {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  role: 'client' | 'admin';
}): Promise<string> {
  const role: 'client' | 'admin' = isUserAdmin(user.id) || user.role === 'admin' ? 'admin' : 'client';

  return new SignJWT({
    userId: user.id,
    username: user.username,
    globalName: user.global_name,
    avatar: user.avatar,
    email: user.email,
    role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT session token and returns the payload or null
 */
export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      globalName: (payload.globalName as string) || null,
      avatar: (payload.avatar as string) || null,
      email: (payload.email as string) || null,
      role: (payload.role as 'client' | 'admin') || 'client',
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current user from Next.js cookies
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    username: payload.username,
    global_name: payload.globalName,
    avatar: payload.avatar,
    email: payload.email,
    role: payload.role,
    created_at: new Date().toISOString(),
  };
}
