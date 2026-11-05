-- Cloudflare D1 Database Schema for Synthetix Studio
-- Execution: npx wrangler d1 execute synthetix-db --file=./schema.sql

-- 1. Tabla de Usuarios (Discord & Clientes)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                       -- Discord Snowflake ID o UUID
  username TEXT NOT NULL,                   -- Discord username o handle
  global_name TEXT,                         -- Display Name en Discord
  avatar TEXT,                              -- Avatar hash de Discord
  email TEXT,                               -- Email verificado
  role TEXT DEFAULT 'client',               -- 'client' o 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,                       -- Formato 'PRJ-XXXX'
  client_id TEXT NOT NULL,                  -- FK a users(id)
  title TEXT NOT NULL,                      -- Nombre del plugin / setup / bot
  service_type TEXT NOT NULL,               -- 'plugin_mc' | 'setup_mc' | 'bot_discord' | 'full_pack'
  description TEXT NOT NULL,                -- Especificaciones técnicas
  status TEXT DEFAULT 'pending',            -- 'pending' | 'in_development' | 'testing' | 'completed' | 'cancelled'
  progress INTEGER DEFAULT 0,               -- 0 a 100%
  price REAL,                               -- Costo acordado en USD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabla de Entregas y Builds (Cloudflare R2)
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,                       -- UUID de la entrega
  project_id TEXT NOT NULL,                 -- FK a projects(id)
  version TEXT NOT NULL,                    -- ej: 'v1.0.0-ALPHA', 'v1.2.1-RELEASE'
  file_key TEXT NOT NULL,                   -- Key en Cloudflare R2 (ej: 'projects/PRJ-1024/NexusEconomy-1.0.jar')
  file_name TEXT NOT NULL,                  -- Nombre original (ej: 'NexusEconomy-1.0.jar')
  file_size INTEGER NOT NULL,               -- Peso en bytes
  changelog TEXT,                           -- Notas de parche e instrucciones
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Tabla de Comentarios y Feedback Interno
CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY,                       -- UUID del mensaje
  project_id TEXT NOT NULL,                 -- FK a projects(id)
  user_id TEXT NOT NULL,                    -- FK a users(id)
  message TEXT NOT NULL,                    -- Contenido del mensaje
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_project_id ON deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
