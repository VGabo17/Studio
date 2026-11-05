export type ServiceType = 'plugin_mc' | 'setup_mc' | 'bot_discord' | 'full_pack';

export type ProjectStatus = 'pending' | 'in_development' | 'testing' | 'completed' | 'cancelled';

export interface User {
  id: string; // Discord snowflake or ID
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  role: 'client' | 'admin';
  created_at: string;
}

export interface Project {
  id: string; // 'PRJ-XXXX'
  client_id: string;
  title: string;
  service_type: ServiceType;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  price: number | null; // in USD
  created_at: string;
  updated_at: string;
  client?: {
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
  deliveries?: Delivery[];
  comments?: ProjectComment[];
}

export interface Delivery {
  id: string;
  project_id: string;
  version: string;
  file_key: string;
  file_name: string;
  file_size: number;
  changelog: string | null;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  created_at: string;
  author?: {
    username: string;
    global_name: string | null;
    avatar: string | null;
    role: 'client' | 'admin';
  };
}

export interface JWTPayload {
  userId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  email: string | null;
  role: 'client' | 'admin';
  iat?: number;
  exp?: number;
}

export type WebhookNotificationType = 'NEW_ORDER' | 'STATUS_CHANGED' | 'NEW_DELIVERY';

export interface WebhookNotificationPayload {
  projectId: string;
  projectTitle: string;
  serviceType?: ServiceType;
  clientName?: string;
  clientId?: string;
  status?: ProjectStatus;
  previousStatus?: ProjectStatus;
  progress?: number;
  version?: string;
  fileName?: string;
  changelog?: string;
  price?: number;
  description?: string;
}
