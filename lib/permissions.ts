import { User, UserRole } from './types';

// Lista por defecto con tus credenciales de Administrador
const HARDCODED_ADMINS = [
  'gaboalejandro153@gmail.com',
  '1568295392322392065',
  'ishadowz',
];

/**
 * Checks if a user is an admin by Discord ID, Email, or Username
 */
export function isUserAdmin(identifier?: string | null): boolean {
  if (!identifier) return false;

  const envAdminsStr = process.env.ADMIN_DISCORD_IDS || '';
  const envAdmins = envAdminsStr
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);

  const allAdmins = [...HARDCODED_ADMINS, ...envAdmins];
  const cleanIdentifier = identifier.trim().toLowerCase();

  return allAdmins.includes(cleanIdentifier);
}

/**
 * Granular RBAC Permissions
 * Roles: 'client' | 'support' | 'developer_junior' | 'developer_senior' | 'admin'
 */
export function isStaff(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'support' || role === 'developer_junior' || role === 'developer_senior' || role === 'admin';
}

export function canCompleteProject(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'developer_senior' || role === 'admin';
}

export function canUploadDeliveries(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'developer_senior' || role === 'admin';
}

export function canSetPrice(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'admin';
}

export function canUpdateProgress(role: UserRole | undefined | null, targetProgress: number): boolean {
  if (!role) return false;
  if (role === 'admin' || role === 'developer_senior') return true;
  if (role === 'developer_junior') return targetProgress <= 85;
  return false;
}

export function canAccessProject(user: User, projectClientId: string, assignedTo?: string | null): boolean {
  if (user.role === 'admin' || user.role === 'support' || user.role === 'developer_senior') return true;
  if (user.role === 'developer_junior') {
    return !assignedTo || assignedTo === user.id;
  }
  return user.id === projectClientId;
}
