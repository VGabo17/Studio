import {
  Delivery,
  Project,
  ProjectComment,
  ProjectChatMessage,
  ProjectStatus,
  ServiceType,
  ServiceRate,
  User,
  UserRole,
} from './types';
import { isUserAdmin } from './auth';

// Estado persistente en memoria para la instancia de ejecución
interface DatabaseState {
  users: Map<string, User>;
  projects: Map<string, Project>;
  deliveries: Map<string, Delivery>;
  comments: Map<string, ProjectComment>;
  chatMessages: Map<string, ProjectChatMessage>;
  chatSubscribers: Map<string, Set<(msg: ProjectChatMessage) => void>>;
  serviceRates: Map<ServiceType, ServiceRate>;
}

declare global {
  var __synthetix_db: DatabaseState | undefined;
}

function initDb(): DatabaseState {
  if (global.__synthetix_db) {
    return global.__synthetix_db;
  }

  const users = new Map<string, User>();
  const projects = new Map<string, Project>();
  const deliveries = new Map<string, Delivery>();
  const comments = new Map<string, ProjectComment>();
  const chatMessages = new Map<string, ProjectChatMessage>();
  const chatSubscribers = new Map<string, Set<(msg: ProjectChatMessage) => void>>();
  const serviceRates = new Map<ServiceType, ServiceRate>();

  // 0. TARIFAS Y PRECIOS BASE DE SERVICIOS
  const defaultRates: ServiceRate[] = [
    {
      service_type: 'setup_dc',
      name: 'Configuración Servidor Discord',
      category: 'Discord & Community',
      base_price: 15,
      delivery_time: '24-48 horas',
      description: 'Arquitectura completa de roles, permisos anti-raid, tickets de soporte y embeds personalizados.',
      features: ['Estructura de canales y roles', 'Sistema de tickets de soporte', 'Bots de moderación y auto-rol', 'Protección anti-raid y anti-spam', 'Estética gamer con embeds'],
    },
    {
      service_type: 'bot_discord',
      name: 'Bot de Discord a tu Gusto',
      category: 'Desarrollo a Medida',
      base_price: 20,
      delivery_time: '2-4 días',
      description: 'Bot personalizado en Node.js/Discord.js con comandos slash, sincronización Minecraft y embeds interactivos.',
      features: ['Comandos Slash (/verificar, /tienda, /stats)', 'Sincronización cuenta Minecraft y roles', 'Sistemas de sorteos y bienvenidas dinámicas', 'Panel de botones y modales interactivos', 'Hosting listo para 24/7'],
    },
    {
      service_type: 'plugin_mc',
      name: 'Plugins de Minecraft a Medida',
      category: 'Java / Paper / Purpur',
      base_price: 25,
      delivery_time: '3-7 días',
      description: 'Desarrollo en Paper, Purpur y Spigot (Java 17/21). NMS limpio, bases de datos MySQL/SQLite y 0% lag.',
      features: ['Código nativo PaperMC & Purpur', 'Mapeo NMS optimizado', 'Integración con PlaceholderAPI y Vault', 'Configs en YAML 100% editables', '30 días de garantía y soporte'],
    },
    {
      service_type: 'setup_mc',
      name: 'Configuración Servidor Minecraft',
      category: 'Setup & Optimización',
      base_price: 35,
      delivery_time: '2-5 días',
      description: 'Configuración llave en mano para Survival Custom, BoxPvP, Skyblock o Practice. Optimización de TPS garantizada a 20.0.',
      features: ['20.0 TPS estables con 80+ jugadores', 'Economía balanceada y rangos configurados', 'Anti-cheat configurado sin falsos positivos', 'Traducción de mensajes al español', 'Guía de mantenimiento y backup'],
    },
    {
      service_type: 'web_portfolio',
      name: 'Creación de Web Portafolio',
      category: 'Desarrollo Frontend',
      base_price: 40,
      delivery_time: '3-6 días',
      description: 'Sitio web moderno y responsivo para tu servidor o marca personal gamer con diseño Cyber Lilac.',
      features: ['Diseño responsive móvil y desktop', 'Integración con tienda Tebex/CraftingStore', 'Visualización de jugadores online en vivo', 'Animaciones fluidas y modo oscuro nativo', 'Dominio personalizado y SSL'],
    },
    {
      service_type: 'full_pack',
      name: 'Pack Completo Network',
      category: 'Solución Integral',
      base_price: 80,
      delivery_time: '5-10 días',
      description: 'Solución todo en uno: Bungee/Velocity + Servidores + Discord sincronizado + Web + Plugins a medida.',
      features: ['Proxy Velocity ultra optimizado', '2 o más modalidades configuradas', 'Bot de Discord totalmente vinculado', 'Web informativa y portal de usuarios', 'Soporte prioritario 1 a 1 por 60 días'],
    },
  ];

  defaultRates.forEach((rate) => {
    serviceRates.set(rate.service_type, rate);
  });

  // 1. USUARIOS CON ROLES GRANULARES
  const adminUser: User = {
    id: '903391086054',
    username: 'alex_synthetix',
    global_name: 'AlexDev • Studio Founder',
    avatar: 'a_f183748291024',
    email: 'admin@synthetixstudio.dev',
    role: 'admin',
    created_at: '2026-01-10T12:00:00Z',
  };
  users.set(adminUser.id, adminUser);

  const seniorDev: User = {
    id: 'dev-senior-marcus',
    username: 'marcus_dev',
    global_name: 'MarcusDev • Lead NMS & Java',
    avatar: 'd_192837465',
    email: 'marcus@synthetixstudio.dev',
    role: 'developer_senior',
    created_at: '2026-01-15T10:00:00Z',
  };
  users.set(seniorDev.id, seniorDev);

  const juniorDev: User = {
    id: 'dev-junior-leo',
    username: 'leo_dev',
    global_name: 'LeoDev • Junior Dev',
    avatar: 'e_582910293',
    email: 'leo@synthetixstudio.dev',
    role: 'developer_junior',
    created_at: '2026-02-01T08:00:00Z',
  };
  users.set(juniorDev.id, juniorDev);

  const supportUser: User = {
    id: 'support-elena',
    username: 'elena_support',
    global_name: 'Elena • Soporte & Tickets',
    avatar: 'f_849201837',
    email: 'soporte@synthetixstudio.dev',
    role: 'support',
    created_at: '2026-02-05T11:00:00Z',
  };
  users.set(supportUser.id, supportUser);

  const clientUser: User = {
    id: 'client-phoenix-mc',
    username: 'phoenix_owner',
    global_name: 'Phoenix Network [Owner]',
    avatar: 'b_728491028374',
    email: 'contact@phoenixmc.net',
    role: 'client',
    created_at: '2026-02-01T15:30:00Z',
  };
  users.set(clientUser.id, clientUser);

  // 2. TRABAJOS Y PROYECTOS REALES DE SYNTHETIX STUDIO
  // Proyecto Real 1: isrewards (Plugin Minecraft)
  const prjRewards: Project = {
    id: 'PRJ-101',
    client_id: clientUser.id,
    assigned_to: seniorDev.id,
    title: 'isrewards • Sistema de Recompensas Diarias & Rachas',
    service_type: 'plugin_mc',
    description: 'Plugin personalizado para Spigot/Paper con sistema de recompensas por tiempo jugado, ruleta de premios con GUI interactiva sin lag y rachas diarias con sincronización de base de datos segura.',
    status: 'completed',
    progress: 100,
    price: 45,
    created_at: '2026-01-20T14:00:00Z',
    updated_at: '2026-02-02T19:00:00Z',
  };
  projects.set(prjRewards.id, prjRewards);

  // Proyecto Real 2: issecurity (Plugin Minecraft)
  const prjSecurity: Project = {
    id: 'PRJ-102',
    client_id: clientUser.id,
    assigned_to: seniorDev.id,
    title: 'issecurity • Protección de Cuentas, Anti-Bot & Anti-Exploit',
    service_type: 'plugin_mc',
    description: 'Plugin avanzado de seguridad para servidores de Minecraft: autenticación 2FA en chat, filtrado de paquetes corruptos, limitador de conexiones simultáneas y protección de permisos contra inyecciones.',
    status: 'completed',
    progress: 100,
    price: 60,
    created_at: '2026-01-25T11:30:00Z',
    updated_at: '2026-02-10T16:20:00Z',
  };
  projects.set(prjSecurity.id, prjSecurity);

  // Proyecto Real 3: Nixer Network (Network vendida)
  const prjNixer: Project = {
    id: 'PRJ-103',
    client_id: clientUser.id,
    assigned_to: adminUser.id,
    title: 'Nixer Network • Modalidad Completa & Optimización TPS',
    service_type: 'setup_mc',
    description: 'Network completa desarrollada, optimizada y vendida exitosamente: configuración de proxy Bungee/Velocity, modalidades Survival Custom y BoxPvP con economías balanceadas y 20.0 TPS estables.',
    status: 'completed',
    progress: 100,
    price: 180,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-25T18:00:00Z',
  };
  projects.set(prjNixer.id, prjNixer);

  // Proyecto Activo 4: Bot de Discord a medida
  const prjBot: Project = {
    id: 'PRJ-104',
    client_id: clientUser.id,
    assigned_to: juniorDev.id,
    title: 'Bot de Discord a tu Gusto (Tickets & Sincronización MC)',
    service_type: 'bot_discord',
    description: 'Bot personalizado en Discord.js v14 con transcripciones automáticas de tickets, comandos slash interactivos y sincronización de rangos de Minecraft.',
    status: 'in_development',
    progress: 65,
    price: 35,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-04T12:00:00Z',
  };
  projects.set(prjBot.id, prjBot);

  // 3. ENTREGAS REALES
  const delRewards: Delivery = {
    id: 'del-isrewards-v142',
    project_id: prjRewards.id,
    version: 'v1.4.2-RELEASE',
    file_key: 'deliveries/isrewards-v1.4.2.jar',
    file_name: 'isrewards-v1.4.2.jar',
    file_size: 894020,
    changelog: '• Sistema de recompensas diarias por racha.\n• Soporte para PlaceholderAPI (%isrewards_streak%).\n• Guardado atómico asíncrono.',
    created_at: '2026-02-02T19:00:00Z',
  };
  deliveries.set(delRewards.id, delRewards);

  const delSecurity: Delivery = {
    id: 'del-issecurity-v210',
    project_id: prjSecurity.id,
    version: 'v2.1.0-RELEASE',
    file_key: 'deliveries/issecurity-v2.1.0.jar',
    file_name: 'issecurity-v2.1.0.jar',
    file_size: 1240180,
    changelog: '• Bloqueo de paquetes maliciosos nbt.\n• Pin de seguridad para operadores y staff.\n• 0 lag en el hilo principal de Paper.',
    created_at: '2026-02-10T16:20:00Z',
  };
  deliveries.set(delSecurity.id, delSecurity);

  const delNixer: Delivery = {
    id: 'del-nixer-network',
    project_id: prjNixer.id,
    version: 'v1.0.0-RELEASE',
    file_key: 'deliveries/Nixer-Network-Release.zip',
    file_name: 'Nixer-Network-Release.zip',
    file_size: 45290110,
    changelog: '• Paquete de archivos y configuraciones de Nixer Network.\n• Chunks pregenerados y optimización para 20.0 TPS.',
    created_at: '2026-02-25T18:00:00Z',
  };
  deliveries.set(delNixer.id, delNixer);

  // 4. CHAT EN TIEMPO REAL INICIAL
  const msg1: ProjectChatMessage = {
    id: 'chat-msg-1',
    project_id: prjBot.id,
    user_id: clientUser.id,
    message: 'Hola equipo, ¿sería posible que el bot cree los tickets directamente en un canal privado por cada usuario?',
    created_at: '2026-03-02T14:10:00Z',
  };
  chatMessages.set(msg1.id, msg1);

  const msg2: ProjectChatMessage = {
    id: 'chat-msg-2',
    project_id: prjBot.id,
    user_id: juniorDev.id,
    message: '¡Hola! Sí, ya implementé esa lógica con Discord.js v14 creando canales de texto dinámicos con permisos exclusivos para el creador y el staff.',
    created_at: '2026-03-02T14:15:00Z',
  };
  chatMessages.set(msg2.id, msg2);

  const msg3: ProjectChatMessage = {
    id: 'chat-msg-3',
    project_id: prjBot.id,
    user_id: seniorDev.id,
    message: 'Supervisé el código y el manejo de rate-limits de Discord está óptimo. Estamos afinando las transcripciones automáticas.',
    created_at: '2026-03-03T10:00:00Z',
  };
  chatMessages.set(msg3.id, msg3);

  const state: DatabaseState = {
    users,
    projects,
    deliveries,
    comments,
    chatMessages,
    chatSubscribers,
    serviceRates,
  };

  global.__synthetix_db = state;
  return state;
}

const db = initDb();

export const dbService = {
  // USUARIOS
  async getUserById(id: string): Promise<User | null> {
    return db.users.get(id) || null;
  },

  async upsertUser(userData: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    email?: string | null;
    role?: UserRole;
  }): Promise<User> {
    const existing = db.users.get(userData.id);
    let role: UserRole = userData.role || existing?.role || 'client';
    if (isUserAdmin(userData.id)) {
      role = 'admin';
    }

    const user: User = {
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name ?? existing?.global_name ?? null,
      avatar: userData.avatar ?? existing?.avatar ?? null,
      email: userData.email ?? existing?.email ?? null,
      role,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    db.users.set(user.id, user);
    return user;
  },

  // PROYECTOS
  async getAllProjects(): Promise<Project[]> {
    const list = Array.from(db.projects.values());
    return list
      .map((p) => this.attachProjectRelations(p))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async getProjectsByClientId(clientId: string): Promise<Project[]> {
    const list = Array.from(db.projects.values()).filter((p) => p.client_id === clientId);
    return list
      .map((p) => this.attachProjectRelations(p))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async getProjectById(id: string): Promise<Project | null> {
    const project = db.projects.get(id);
    if (!project) return null;
    return this.attachProjectRelations(project);
  },

  attachProjectRelations(project: Project): Project {
    const client = db.users.get(project.client_id);
    const deliveries = Array.from(db.deliveries.values())
      .filter((d) => d.project_id === project.id)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    const comments = Array.from(db.comments.values())
      .filter((c) => c.project_id === project.id)
      .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
      .map((c) => {
        const author = db.users.get(c.user_id);
        return {
          ...c,
          author: author
            ? {
                username: author.username,
                global_name: author.global_name,
                avatar: author.avatar,
                role: author.role,
              }
            : undefined,
        };
      });

    const chat_messages = Array.from(db.chatMessages.values())
      .filter((m) => m.project_id === project.id)
      .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
      .map((m) => {
        const author = db.users.get(m.user_id);
        return {
          ...m,
          author: author
            ? {
                username: author.username,
                global_name: author.global_name,
                avatar: author.avatar,
                role: author.role,
              }
            : undefined,
        };
      });

    return {
      ...project,
      client: client
        ? {
            username: client.username,
            global_name: client.global_name,
            avatar: client.avatar,
          }
        : undefined,
      deliveries,
      comments,
      chat_messages,
    };
  },

  async createProject(data: {
    client_id: string;
    title: string;
    service_type: ServiceType;
    description: string;
    price?: number;
  }): Promise<Project> {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const id = `PRJ-${randomNum}`;

    const newProject: Project = {
      id,
      client_id: data.client_id,
      title: data.title,
      service_type: data.service_type,
      description: data.description,
      status: 'pending',
      progress: 0,
      price: data.price || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.projects.set(newProject.id, newProject);
    return this.attachProjectRelations(newProject);
  },

  async updateProject(
    id: string,
    updates: Partial<Pick<Project, 'status' | 'progress' | 'price' | 'title' | 'description' | 'assigned_to'>>
  ): Promise<Project | null> {
    const existing = db.projects.get(id);
    if (!existing) return null;

    const updated: Project = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    db.projects.set(id, updated);
    return this.attachProjectRelations(updated);
  },

  // ENTREGAS
  async createDelivery(data: {
    project_id: string;
    version: string;
    file_key: string;
    file_name: string;
    file_size: number;
    changelog?: string;
  }): Promise<Delivery> {
    const id = `del-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const delivery: Delivery = {
      id,
      project_id: data.project_id,
      version: data.version,
      file_key: data.file_key,
      file_name: data.file_name,
      file_size: data.file_size,
      changelog: data.changelog || null,
      created_at: new Date().toISOString(),
    };

    db.deliveries.set(id, delivery);
    return delivery;
  },

  async getDeliveryById(id: string): Promise<Delivery | null> {
    return db.deliveries.get(id) || null;
  },

  // CHAT EN TIEMPO REAL & COMENTARIOS
  async addChatMessage(projectId: string, userId: string, message: string): Promise<ProjectChatMessage> {
    const id = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const chatMsg: ProjectChatMessage = {
      id,
      project_id: projectId,
      user_id: userId,
      message,
      created_at: new Date().toISOString(),
    };

    db.chatMessages.set(id, chatMsg);
    const author = db.users.get(userId);
    const enrichedMsg: ProjectChatMessage = {
      ...chatMsg,
      author: author
        ? {
            username: author.username,
            global_name: author.global_name,
            avatar: author.avatar,
            role: author.role,
          }
        : undefined,
    };

    // Notificar suscriptores SSE / WebSocket en tiempo real
    const subscribers = db.chatSubscribers.get(projectId);
    if (subscribers) {
      subscribers.forEach((cb) => {
        try {
          cb(enrichedMsg);
        } catch {
          // Ignorar suscriptor desconectado
        }
      });
    }

    return enrichedMsg;
  },

  async getChatMessagesByProjectId(projectId: string): Promise<ProjectChatMessage[]> {
    return Array.from(db.chatMessages.values())
      .filter((m) => m.project_id === projectId)
      .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
      .map((m) => {
        const author = db.users.get(m.user_id);
        return {
          ...m,
          author: author
            ? {
                username: author.username,
                global_name: author.global_name,
                avatar: author.avatar,
                role: author.role,
              }
            : undefined,
        };
      });
  },

  subscribeToChat(projectId: string, callback: (msg: ProjectChatMessage) => void): () => void {
    if (!db.chatSubscribers.has(projectId)) {
      db.chatSubscribers.set(projectId, new Set());
    }
    const set = db.chatSubscribers.get(projectId)!;
    set.add(callback);
    return () => {
      set.delete(callback);
    };
  },

  async addComment(projectId: string, userId: string, message: string): Promise<ProjectComment> {
    const id = `com-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const comment: ProjectComment = {
      id,
      project_id: projectId,
      user_id: userId,
      message,
      created_at: new Date().toISOString(),
    };

    db.comments.set(id, comment);
    const author = db.users.get(userId);

    return {
      ...comment,
      author: author
        ? {
            username: author.username,
            global_name: author.global_name,
            avatar: author.avatar,
            role: author.role,
          }
        : undefined,
    };
  },

  // TARIFAS Y PRECIOS OFICIALES EDITABLES
  async getServiceRates(): Promise<ServiceRate[]> {
    return Array.from(db.serviceRates.values());
  },

  async getServiceRate(serviceType: ServiceType): Promise<ServiceRate | null> {
    return db.serviceRates.get(serviceType) || null;
  },

  async updateServiceRate(
    serviceType: ServiceType,
    updates: Partial<ServiceRate>
  ): Promise<ServiceRate | null> {
    const existing = db.serviceRates.get(serviceType);
    if (!existing) return null;
    const updated: ServiceRate = {
      ...existing,
      ...updates,
      service_type: serviceType,
    };
    db.serviceRates.set(serviceType, updated);
    return updated;
  },
};
