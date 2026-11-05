# Synthetix Studio — Plataforma de Desarrollo Gamer & Portal Autónomo de Entregas

Plataforma fullstack de alto rendimiento para **Synthetix Studio**, estudio especializado en ingeniería de plugins de Minecraft (Paper/Purpur/Spigot), setups avanzados de servidores y bots de Discord a medida. Incorpora una landing page de alta conversión, un portal de clientes con seguimiento de progreso 0-100%, centro de descargas seguras para ejecutables `.jar` y configuraciones `.zip` (Cloudflare R2), panel de administración integral y webhooks automatizados de Discord con estética *Cyber Lilac / Deep Void*.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario:**
> - **Nombre de marca**: `Synthetix Studio` (con estética gamer de alta fidelidad técnica).
> - **Método de Autenticación**: Sistema dual de acceso con **Discord OAuth2** oficial y acceso rápido por **Correo Electrónico / Persona Switcher** (cliente y administrador) para pruebas sin fricción tanto en desarrollo como en producción.
> - **Especialidades en Portafolio**: Cobertura balanceada de las 3 ramas de especialidad técnica: (1) Plugins Spigot/Paper/Purpur con NMS y optimización TPS, (2) Setups de modalidades completas (BoxPvP, Survival Custom, Skyblock), y (3) Bots de Discord avanzados (tickets, sincronización MC-DC y embeds).

- **Persistencia y Entorno Cloudflare**:
  - `schema.sql` estándar para Cloudflare D1 con claves foráneas e índices.
  - Almacén de base de datos SQLite / D1 compatible en Next.js App Router para soportar ejecución serverless inmediata.
  - Almacén de objetos Cloudflare R2 con soporte para streaming seguro de descargas con headers `Content-Disposition: attachment; filename="..."` y generación de URLs temporales.
- **Notificaciones Webhook**:
  - Helper tipado `sendDiscordNotification(type, payload)` con color hex `#C084FC` (`0xC084FC`), campos ricos (`fields`), avatares dinámicos y enlaces directos al proyecto.

---

### 1. Overview & Core Concept

- **Qué hace la plataforma**:
  - **Landing Page Pública**: Presenta a Synthetix Studio con propuesta de valor clara, catálogo de servicios, portafolio interactivo con capturas/demos de GUIs de Minecraft y bots de Discord, flujo de trabajo transparente ("Cómo Trabajamos"), testimonios de servidores reales y solicitud directa de cotización.
  - **Portal del Cliente (`/dashboard`)**: Espacio privado donde el cliente consulta el estado de sus proyectos (`pending`, `in_development`, `testing`, `completed`), visualiza la barra de progreso en tiempo real (0–100%), intercambia feedback técnico en el hilo del proyecto y descarga las versiones compiladas (`.jar`, `.zip`) junto con sus changelogs.
  - **Centro de Descargas Autónomo**: Acceso controlado a versiones con verificación estricta de propiedad o rol de administrador.
  - **Panel de Administrador (`/admin`)**: Vista global de todos los proyectos solicitados, control granular de progreso mediante slider, cambio de estado, presupuestos en USD y carga directa de nuevas entregas/builds a R2.
- **Audiencia Objetivo**: Dueños de networks de Minecraft, administradores de servidores (Survival, BoxPvP, Anarquía, Skyblock) y comunidades de Discord que buscan desarrollo profesional libre de lag.
- **Propuesta de Valor**: Eliminar la desorganización de pedidos en chats informales de Discord, otorgando un portal transparente con versionado formal, control de progreso verificable y descargas automáticas.

---

### 2. User Experience & Visual Design

- **Sistema de Diseño "Cyber Lilac / Deep Void"**:
  - `bg-dark-bg`: `#08050E` (Negro abisal con matiz violeta profundo).
  - `bg-dark-card`: `#120A21` (Púrpura oscuro mate con acabado limpio).
  - `border-dark-border`: `#261442` (Borde sutil con contraste controlado).
  - `accent-primary`: `#C084FC` (Lila Neón Tailwind purple-400).
  - `accent-glow`: `#A855F7` y `#9333EA` (Resplandores sutiles en hover y barras de progreso activas).
- **Tipografía y Jerarquía**:
  - Display y titulares: `Plus Jakarta Sans` con tracking ajustado y `text-wrap: balance`.
  - Métricas, IDs de proyectos (`PRJ-XXXX`), versiones (`v1.2.0-RELEASE`) y tamaños de archivos: `font-mono tabular-nums`.
- **Top Bar Contract (3 Zonas Estrictas)**:
  - **Zona 1 (Marca)**: Logotipo limpio `Synthetix Studio` con isotipo neón lila.
  - **Zona 2 (Navegación)**: Enlaces de una sola línea (`Servicios`, `Portafolio`, `Flujo`, `Testimonios`).
  - **Zona 3 (Acción)**: Botón de acceso directo (`Entrar con Discord` o `Mi Dashboard` / Perfil de usuario con avatar).
- **Disciplina Anti-Slop**:
  - Sin píldoras estáticas de metadatos; fechas, categorías y tamaños se presentan con separadores discretos (`·`, `/`).
  - Sin comentarios mecánicos falsos (`// 01 ARCHITECTURE`), usando numeración editorial natural (`01. Plugins Paper/Purpur`).
  - Sin falsas métricas de cockpit artificiales; solo contadores reales de entregas, horas y proyectos completados.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Compatibilidad Cloudflare D1 + Next.js App Router**:
  - *Enfoque*: Implementar la capa de acceso a datos modular (`lib/db.ts`) ejecutando el esquema `schema.sql` nativo de D1 y manteniendo persistencia local lista para producción y previsualización inmediata.
  - *Por qué*: Permite probar todas las mutaciones, comentarios, proyectos y entregas en tiempo real en la vista previa de AI Studio, y al mismo tiempo desplegar directamente a Cloudflare Pages/Workers mediante `wrangler.jsonc`.
- **Decisión 2: Almacenamiento Cloudflare R2 con Fallback de Emulación de Archivos**:
  - *Enfoque*: El endpoint `/api/deliveries/upload` y `/api/deliveries/download/[id]` utiliza los headers exactos de R2 y S3-compatible API, permitiendo tanto presigned URLs como streaming binario con verificación estricta de propiedad de proyecto.
  - *Por qué*: Garantiza que los archivos `.jar` de Minecraft y `.zip` de configuraciones sean descargables de forma verídica y segura.
- **Decisión 3: Autenticación Dual (Discord OAuth2 + Acceso por Correo/Persona)**:
  - *Enfoque*: Configuración completa de endpoints OAuth2 de Discord (`/api/auth/discord/login` y `/api/auth/discord/callback`) con persistencia en cookie HTTP-Only cifrada con JWT, complementada con un modal de acceso rápido por correo/test personas (`Admin: Studio Founder`, `Client: Network Owner`) para testing instantáneo sin depender de credenciales Discord externas en el sandbox.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYNTHETIX STUDIO PLATFORM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ Public Visitors ]          [ Authenticated Clients ]      [ Studio Admin ]│
│         │                                │                          │       │
│         ▼                                ▼                          ▼       │
│  Landing Page (/)           Client Portal (/dashboard)      Admin (/admin)  │
│  - Hero Showcase            - Project List & Stats          - Master Table  │
│  - 3 Core Services          - Project Detail (/project/id)  - Status & Slid.│
│  - Filterable Portfolio     - Realtime Progress (0-100%)    - R2 Uploader   │
│  - How We Work              - Build Downloads (.jar/.zip)   - Budget Sync   │
│  - Testimonials             - Internal Feedback Thread                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                API ROUTERS                                  │
│                                                                             │
│  /api/auth/discord/*  ──► OAuth2 / Cookie JWT Session                       │
│  /api/projects/*      ──► CRUD, RBAC, Filters, Comments                     │
│  /api/deliveries/*    ──► R2 Object Storage (.jar/.zip Streaming)           │
│  lib/discord-webhook  ──► Rich Lilac Embeds (0xC084FC)                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DATA & STORAGE LAYER                              │
│                                                                             │
│  Cloudflare D1 (schema.sql)             Cloudflare R2 Bucket                │
│  - users                                - projects/{PRJ-ID}/build.jar       │
│  - projects                             - projects/{PRJ-ID}/setup.zip       │
│  - deliveries                           (Secure token-gated streaming)      │
│  - project_comments                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Esquema de Base de Datos (`schema.sql`):
1. `users`: `id` (TEXT, PK), `username` (TEXT), `global_name` (TEXT), `avatar` (TEXT), `email` (TEXT), `role` (TEXT DEFAULT 'client'), `created_at` (DATETIME).
2. `projects`: `id` (TEXT, PK, formato `PRJ-XXXX`), `client_id` (TEXT, FK), `title` (TEXT), `service_type` ('plugin_mc' | 'setup_mc' | 'bot_discord' | 'full_pack'), `description` (TEXT), `status` ('pending' | 'in_development' | 'testing' | 'completed' | 'cancelled'), `progress` (INTEGER 0-100), `price` (REAL), `created_at`, `updated_at`.
3. `deliveries`: `id` (TEXT, PK UUID), `project_id` (TEXT, FK), `version` (TEXT), `file_key` (TEXT), `file_name` (TEXT), `file_size` (INTEGER), `changelog` (TEXT), `created_at`.
4. `project_comments`: `id` (TEXT, PK UUID), `project_id` (TEXT, FK), `user_id` (TEXT, FK), `message` (TEXT), `created_at`.

#### Archivos de Despliegue y Configuración:
- `wrangler.jsonc` con bindings `d1_databases` (`DB`) y `r2_buckets` (`BUCKET`).
- `.env.example` con las variables `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `DISCORD_WEBHOOK_URL`, `JWT_SECRET`, y `ADMIN_DISCORD_IDS`.
