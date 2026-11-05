import { Delivery, Project, ProjectComment, ProjectStatus, ServiceType, User } from './types';
import { isUserAdmin } from './auth';

// Estado persistente en memoria para la instancia de ejecución
interface DatabaseState {
  users: Map<string, User>;
  projects: Map<string, Project>;
  deliveries: Map<string, Delivery>;
  comments: Map<string, ProjectComment>;
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

  // Usuario Admin inicial
  const adminUser: User = {
    id: '903391086054',
    username: 'alex_synthetix',
    global_name: 'AlexDev • Synthetix Lead',
    avatar: 'a_f183748291024',
    email: 'admin@synthetixstudio.dev',
    role: 'admin',
    created_at: '2026-01-10T12:00:00Z',
  };
  users.set(adminUser.id, adminUser);

  // Clientes iniciales
  const clientUser1: User = {
    id: 'client-phoenix-mc',
    username: 'phoenix_owner',
    global_name: 'Phoenix Network [Owner]',
    avatar: 'b_728491028374',
    email: 'contact@phoenixmc.net',
    role: 'client',
    created_at: '2026-02-01T15:30:00Z',
  };
  users.set(clientUser1.id, clientUser1);

  const clientUser2: User = {
    id: 'client-vortex-box',
    username: 'vortex_pvp',
    global_name: 'VortexPvP Admin',
    avatar: 'c_938172645102',
    email: 'management@vortexpvp.com',
    role: 'client',
    created_at: '2026-02-14T09:15:00Z',
  };
  users.set(clientUser2.id, clientUser2);

  // Proyectos iniciales
  const prj1024: Project = {
    id: 'PRJ-1024',
    client_id: clientUser1.id,
    title: 'SynthetixEconomy Core (Paper 1.21.4)',
    service_type: 'plugin_mc',
    description: 'Plugin de economía ultra-optimizado con soporte para SQLite/MySQL, multi-divisa (Gemas, Monedas, Cristales), transacciones atómicas NMS, GUI interactiva con paginación fluida y API de eventos para desarrolladores.',
    status: 'completed',
    progress: 100,
    price: 380,
    created_at: '2026-02-10T14:20:00Z',
    updated_at: '2026-02-28T18:45:00Z',
  };
  projects.set(prj1024.id, prj1024);

  const prj1048: Project = {
    id: 'PRJ-1048',
    client_id: clientUser1.id,
    title: 'BoxPvP Extreme Network Setup & Anti-Crash',
    service_type: 'setup_mc',
    description: 'Configuración llave en mano de modalidad BoxPvP para 200+ usuarios concurrentes a 20.0 TPS estables. Incluye 18 minas personalizadas, escalado de armaduras netherite custom, sistema de hologramas sin entidades pesadas y filtros anti-exploit de paquetes de red.',
    status: 'in_development',
    progress: 75,
    price: 540,
    created_at: '2026-02-20T11:00:00Z',
    updated_at: '2026-03-01T10:30:00Z',
  };
  projects.set(prj1048.id, prj1048);

  const prj1082: Project = {
    id: 'PRJ-1082',
    client_id: clientUser2.id,
    title: 'GuildLink & Discord Sync Bot (Discord.js v14)',
    service_type: 'bot_discord',
    description: 'Bot customizado de Discord sincronizado vía sockets con servidor Paper. Sistema de tickets con embeds dinámicos, vinculación de cuenta `/link` con verificación de UUID de Mojang, roles automáticos según rangos donadores y log de sanciones en canales privados.',
    status: 'testing',
    progress: 90,
    price: 240,
    created_at: '2026-02-25T16:00:00Z',
    updated_at: '2026-03-03T19:10:00Z',
  };
  projects.set(prj1082.id, prj1082);

  const prj1105: Project = {
    id: 'PRJ-1105',
    client_id: clientUser2.id,
    title: 'Full Pack: Survival Custom RPG 1.21 & Bot Integral',
    service_type: 'full_pack',
    description: 'Desarrollo integral de servidor Survival con misiones guiadas, generadores de items legendarios con NBT tags y Bot de estadísticas en tiempo real conectado a base de datos D1.',
    status: 'pending',
    progress: 10,
    price: 780,
    created_at: '2026-03-02T08:00:00Z',
    updated_at: '2026-03-02T08:00:00Z',
  };
  projects.set(prj1105.id, prj1105);

  // Entregas iniciales (Cloudflare R2)
  const del1: Delivery = {
    id: 'del-uuid-1024-v120',
    project_id: prj1024.id,
    version: 'v1.2.0-RELEASE',
    file_key: 'projects/PRJ-1024/SynthetixEconomy-1.2.0-RELEASE.jar',
    file_name: 'SynthetixEconomy-1.2.0-RELEASE.jar',
    file_size: 1428576, // ~1.43 MB
    changelog: '• Compilado final para Paper 1.21.4 (Java 21).\n• Corregido el memory-leak en la sincronización de transacciones asíncronas.\n• Agregado comando /eco purge para limpiar cuentas inactivas tras 90 días.',
    created_at: '2026-02-28T18:45:00Z',
  };
  deliveries.set(del1.id, del1);

  const del2: Delivery = {
    id: 'del-uuid-1024-v110',
    project_id: prj1024.id,
    version: 'v1.1.0-RC2',
    file_key: 'projects/PRJ-1024/SynthetixEconomy-1.1.0-RC2.jar',
    file_name: 'SynthetixEconomy-1.1.0-RC2.jar',
    file_size: 1389020,
    changelog: '• Release Candidate 2: pruebas de carga con 150 jugadores artificiales.\n• Soporte para Placeholders de PlaceholderAPI (%synthetixeco_balance_formatted%).',
    created_at: '2026-02-22T14:10:00Z',
  };
  deliveries.set(del2.id, del2);

  const del3: Delivery = {
    id: 'del-uuid-1048-v065',
    project_id: prj1048.id,
    version: 'v0.6.5-BETA',
    file_key: 'projects/PRJ-1048/BoxPvP-Network-Configurations-v2.1.zip',
    file_name: 'BoxPvP-Setup-v0.6.5.zip',
    file_size: 48920110, // ~48.9 MB
    changelog: '• Incluye el paquete completo de mapas de minas pre-generados.\n• Configuración optimizada de purpur.yml y paper-world-defaults.yml para 20 TPS.\n• Requiere ProtocolLib v5.2+ en el directorio plugins/.',
    created_at: '2026-03-01T10:30:00Z',
  };
  deliveries.set(del3.id, del3);

  const del4: Delivery = {
    id: 'del-uuid-1082-v100',
    project_id: prj1082.id,
    version: 'v1.0.0-RC1',
    file_key: 'projects/PRJ-1082/GuildLinkBot-v1.0.jar',
    file_name: 'GuildLinkBot-v1.0.jar',
    file_size: 8388608, // 8 MB
    changelog: '• Build ejecutable con dependencias sombreadas (shadowJar).\n• Incluye el archivo config.yml con los intents de Discord pre-configurados.',
    created_at: '2026-03-03T19:10:00Z',
  };
  deliveries.set(del4.id, del4);

  // Comentarios iniciales
  const com1: ProjectComment = {
    id: 'com-uuid-1',
    project_id: prj1024.id,
    user_id: clientUser1.id,
    message: 'Hola Alex, probamos la build en el test server y el balance formateado con comas (ej. $1,500,000) funciona de maravilla. ¡Excelente trabajo!',
    created_at: '2026-02-27T10:00:00Z',
  };
  comments.set(com1.id, com1);

  const com2: ProjectComment = {
    id: 'com-uuid-2',
    project_id: prj1024.id,
    user_id: adminUser.id,
    message: '¡Genial! Acabo de subir la v1.2.0-RELEASE final a la plataforma. Ya pueden descargarla e instalarla en producción con Java 21.',
    created_at: '2026-02-28T18:50:00Z',
  };
  comments.set(com2.id, com2);

  const com3: ProjectComment = {
    id: 'com-uuid-3',
    project_id: prj1048.id,
    user_id: adminUser.id,
    message: 'Progreso actualizado al 75%. Las 18 minas ya tienen los cooldowns de regeneración ajustados para evitar caídas de frames en el cliente.',
    created_at: '2026-03-01T11:00:00Z',
  };
  comments.set(com3.id, com3);

  const state: DatabaseState = { users, projects, deliveries, comments };
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
    role?: 'client' | 'admin';
  }): Promise<User> {
    const existing = db.users.get(userData.id);
    const role: 'client' | 'admin' =
      isUserAdmin(userData.id) || userData.role === 'admin' || existing?.role === 'admin'
        ? 'admin'
        : 'client';

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
    return list.map((p) => this.attachProjectRelations(p)).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async getProjectsByClientId(clientId: string): Promise<Project[]> {
    const list = Array.from(db.projects.values()).filter((p) => p.client_id === clientId);
    return list.map((p) => this.attachProjectRelations(p)).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
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
    };
  },

  async createProject(data: {
    client_id: string;
    title: string;
    service_type: ServiceType;
    description: string;
    price?: number;
  }): Promise<Project> {
    // Generar ID tipo 'PRJ-XXXX' (4 dígitos numéricos)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
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
    updates: Partial<Pick<Project, 'status' | 'progress' | 'price' | 'title' | 'description'>>
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

  // ENTREGAS (BUILDS R2)
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

  // COMENTARIOS / FEEDBACK
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
};
