export type UserRole = 'client' | 'support' | 'developer_junior' | 'developer_senior' | 'admin';

export type ServiceType =
  | 'plugin_mc'        // Plugins de Minecraft a medida
  | 'setup_mc'         // Configuración de Servidores de Minecraft
  | 'setup_dc'         // Configuración de Servidores de Discord
  | 'web_portfolio'    // Creación de Web Portafolio
  | 'bot_discord'      // Bot de Discord a tu gusto
  | 'full_pack';       // Pack Completo Network

export type ProjectStatus = 'pending' | 'in_development' | 'testing' | 'completed' | 'cancelled';

export interface ServiceRate {
  service_type: ServiceType;
  name: string;
  category: string;
  base_price: number; // in USD
  delivery_time: string;
  description: string;
  features: string[];
}

export interface User {
  id: string; // Discord snowflake or ID
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid';
export type PaymentGateway = 'stripe' | 'paypal' | 'tebex' | 'crypto';

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
  payment_status?: PaymentStatus;
  paid_amount?: number;
  deposit_amount?: number | null;
  payment_method?: PaymentGateway | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  client_discord_webhook?: string | null;
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

export type WebhookNotificationType =
  | 'NEW_ORDER'
  | 'STATUS_CHANGED'
  | 'NEW_DELIVERY'
  | 'CHAT_MESSAGE'
  | 'PAYMENT_CONFIRMED'
  | 'DISCORD_DM_ALERT';

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
  amount?: number;
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
  authorName?: string;
  chatMessage?: string;
  customWebhookUrl?: string;
}

export type AuditLogAction =
  | 'STATUS_CHANGE'
  | 'DELIVERY_UPLOAD'
  | 'PRICE_UPDATE'
  | 'PROGRESS_UPDATE'
  | 'RATE_UPDATE'
  | 'PROJECT_ASSIGNMENT'
  | 'PROJECT_CREATE';

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditLogAction;
  project_id?: string | null;
  project_title?: string | null;
  details: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: {
    username: string;
    global_name: string | null;
    avatar: string | null;
    role: UserRole;
  };
}

export interface PaymentConfig {
  paypal_url: string;
  stripe_payment_link: string;
  tebex_store_url: string;
  crypto_wallet_usdt: string;
  crypto_wallet_btc: string;
  bank_transfer_info: string;
  updated_at: string;
}

