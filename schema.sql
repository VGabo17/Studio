-- Database Schema for Synthetix Studio
-- Roles: 'client', 'support', 'developer_junior', 'developer_senior', 'admin'

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                       -- Discord Snowflake ID o UUID
  username TEXT NOT NULL,                   -- Discord username o handle
  global_name TEXT,                         -- Display Name en Discord
  avatar TEXT,                              -- Avatar hash de Discord
  email TEXT,                               -- Email verificado
  role TEXT DEFAULT 'client',               -- 'client' | 'support' | 'developer_junior' | 'developer_senior' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,                       -- Formato 'PRJ-XXXX'
  client_id TEXT NOT NULL,                  -- FK a users(id)
  assigned_to TEXT,                         -- FK a users(id) (staff asignado)
  title TEXT NOT NULL,                      -- Título del proyecto
  service_type TEXT NOT NULL,               -- 'plugin_mc' | 'setup_mc' | 'setup_dc' | 'web_portfolio' | 'bot_discord' | 'full_pack'
  description TEXT NOT NULL,                -- Especificaciones técnicas
  status TEXT DEFAULT 'pending',            -- 'pending' | 'in_development' | 'testing' | 'completed' | 'cancelled'
  progress INTEGER DEFAULT 0,               -- 0 a 100%
  price REAL,                               -- Costo acordado en USD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Tabla de Entregas y Builds (.jar / .zip)
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,                       -- UUID de la entrega
  project_id TEXT NOT NULL,                 -- FK a projects(id)
  version TEXT NOT NULL,                    -- ej: 'v1.0.0-RELEASE'
  file_key TEXT NOT NULL,                   -- Identificador seguro del archivo
  file_name TEXT NOT NULL,                  -- Nombre original (ej: 'isrewards-v1.0.jar')
  file_size INTEGER NOT NULL,               -- Peso en bytes
  changelog TEXT,                           -- Notas de versión
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Tabla de Comentarios Formales
CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY,                       -- UUID del comentario
  project_id TEXT NOT NULL,                 -- FK a projects(id)
  user_id TEXT NOT NULL,                    -- FK a users(id)
  message TEXT NOT NULL,                    -- Contenido
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabla de Mensajes de Chat en Tiempo Real
CREATE TABLE IF NOT EXISTS project_chat_messages (
  id TEXT PRIMARY KEY,                       -- UUID del mensaje
  project_id TEXT NOT NULL,                 -- FK a projects(id)
  user_id TEXT NOT NULL,                    -- FK a users(id)
  message TEXT NOT NULL,                    -- Texto del mensaje
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_project_id ON deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_chat_messages_project_id ON project_chat_messages(project_id);
