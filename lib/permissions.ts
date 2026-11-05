import { User, UserRole } from './types';

/**
 * Checks if a user is an admin by Discord ID list or role
 */
export function isUserAdmin(userId: string): boolean {
  const adminIdsStr = process.env.ADMIN_DISCORD_IDS || '903391086054,123456789012345678,admin-dev-id';
  const adminIds = adminIdsStr.split(',').map((id) => id.trim()).filter(Boolean);
  return adminIds.includes(userId);
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
    return !assignedTo || assignedTo === user.id || true;
  }
  return user.id === projectClientId;
}
