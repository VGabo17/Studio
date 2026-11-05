export type UserRole = 'client' | 'support' | 'developer_junior' | 'developer_senior' | 'admin';

export type ServiceType =
  | 'plugin_mc'        // Plugins de Minecraft a medida
  | 'setup_mc'         // Configuración de Servidores de Minecraft
  | 'setup_dc'         // Configuración de Servidores de Discord
  | 'web_portfolio'    // Creación de Web Portafolio
  | 'bot_discord'      // Bot de Discord a tu gusto
  | 'full_pack';       // Pack Completo Network

export type ProjectStatus = 'pending' | 'in_development' | 'testing' | 'completed' | 'cancelled';

export interface User {
  id: string; // Discord snowflake or ID
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string; // 'PRJ-XXXX'
  client_id: string;
  assigned_to?: string | null; // Staff asignado
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
  chat_messages?: ProjectChatMessage[];
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
    role: UserRole;
  };
}

export interface ProjectChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  created_at: string;
  author?: {
    username: string;
    global_name: string | null;
    avatar: string | null;
    role: UserRole;
  };
}

export interface JWTPayload {
  userId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  email: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type WebhookNotificationType = 'NEW_ORDER' | 'STATUS_CHANGED' | 'NEW_DELIVERY' | 'CHAT_MESSAGE';

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
