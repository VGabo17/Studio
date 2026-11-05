# Synthetix Studio — Plan de Despliegue a Producción (Cloudflare Pages, D1 & R2)

Guía técnica, validación de dependencias y procedimiento paso a paso para desplegar **Synthetix Studio** en **Cloudflare Pages** conectando la base de datos serverless **Cloudflare D1** y el almacenamiento de objetos **Cloudflare R2** para la distribución de ejecutables `.jar` y `.zip`.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmaciones del usuario para producción:**
> - **Entorno de Despliegue**: **Cloudflare Pages** con bindings nativos para D1 (`DB`) y R2 (`BUCKET`).
> - **Credenciales de Discord**: El usuario ya cuenta con su Application ID, Client Secret y Webhook configurados en el portal de desarrolladores de Discord.
> - **Estado del Código**: El proyecto compila limpiamente (`next build` / `npm run build` exitoso) y pasa todas las reglas estrictas de tipado y ESLint.

---

### 1. Overview & Core Concept

La plataforma ya cuenta con todo el código fuente modular, tipado estricto con TypeScript, esquemas de validación Zod, autenticación JWT con `jose`, plantillas de Discord Webhook con estética Cyber Lilac (`0xC084FC`) y el esquema SQL compatible con Cloudflare D1.

Para llevar la plataforma a producción en Cloudflare Pages, solo se requiere ejecutar 4 pasos clave de aprovisionamiento en la cuenta de Cloudflare del usuario:
1. **Creación de la base de datos D1** y ejecución de `schema.sql`.
2. **Creación del Bucket R2** (`synthetix-deliveries`).
3. **Configuración del Redirect URI de Discord** hacia el dominio final de producción.
4. **Carga de variables de entorno** en Cloudflare Pages.

---

### 2. User Experience & Visual Design en Producción

- **Dominio de Producción**: La interfaz mantendrá su estética *Cyber Lilac / Deep Void* permanente (`#08050E`, `#120A21`, `#261442`, `#C084FC`).
- **Rendimiento Edge**: Al ejecutarse sobre la red global de Cloudflare con Pages y D1/R2, los clientes de todo el mundo experimentarán tiempos de carga inferiores a 50ms para consultar el estado de sus proyectos y latencia mínima al descargar archivos `.jar` y `.zip`.
- **Modo Producción vs Modo Pruebas**: En producción, el login de Discord interactúa directamente con los servidores de autenticación de Discord (`https://discord.com/api/oauth2/authorize`), manteniendo también disponible el acceso administrativo mediante la lista blanca de snowflakes en `ADMIN_DISCORD_IDS`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Despliegue con OpenNext / @cloudflare/next-on-pages**:
  - *Enfoque*: Utilizar el adaptador oficial de Cloudflare Pages para Next.js App Router, permitiendo que las rutas de API (`/api/*`) se ejecuten como Cloudflare Workers Edge Functions con acceso directo a `env.DB` y `env.BUCKET`.
  - *Por qué*: Elimina la necesidad de servidores dedicados (VPS), escala a 0 cuando no hay tráfico y reduce costos a prácticamente $0 USD en el tier gratuito de Cloudflare.
- **Decisión 2: Migración D1 Declarativa con `schema.sql`**:
  - *Enfoque*: Ejecutar `npx wrangler d1 execute synthetix-db --file=./schema.sql` de forma idempotente.
  - *Por qué*: Inicializa las tablas `users`, `projects`, `deliveries`, `project_comments` y sus índices directamente en el cluster SQLite global de Cloudflare.
- **Decisión 3: Seguridad de Descargas en R2**:
  - *Enfoque*: Los archivos `.jar` y `.zip` no son públicos por defecto en R2; se descargan únicamente a través de `/api/deliveries/download/[id]`, validando que el usuario autenticado sea el dueño legítimo del proyecto o el administrador del estudio.

---

### 4. Technical Architecture & Procedimiento de Despliegue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DESPLIEGUE A PRODUCCIÓN                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CLOUDFLARE CLI (WRANGLER)                                               │
│     npx wrangler d1 create synthetix-db                                     │
│     npx wrangler d1 execute synthetix-db --file=./schema.sql                │
│     npx wrangler r2 bucket create synthetix-deliveries                       │
│                                                                             │
│  2. DISCORD DEVELOPER PORTAL                                                │
│     Redirects: https://tu-dominio.pages.dev/api/auth/discord/callback       │
│                                                                             │
│  3. VARIABLES DE ENTORNO EN CLOUDFLARE PAGES                                │
│     DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI          │
│     DISCORD_WEBHOOK_URL, JWT_SECRET, ADMIN_DISCORD_IDS, APP_URL             │
│                                                                             │
│  4. BUILD & DEPLOY                                                          │
│     npx @cloudflare/next-on-pages  o  GitHub Actions / Git Push             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Checklist de Comandos para Producción:

1. **Aprovisionar Base de Datos Cloudflare D1:**
   ```bash
   npx wrangler d1 create synthetix-db
   npx wrangler d1 execute synthetix-db --file=./schema.sql --remote
   ```

2. **Aprovisionar Bucket de Archivos Cloudflare R2:**
   ```bash
   npx wrangler r2 bucket create synthetix-deliveries
   ```

3. **Configurar Discord Developer Portal:**
   - Enlace OAuth2 Redirects: `https://<tu-app>.pages.dev/api/auth/discord/callback` (y tu dominio custom si tienes uno, ej: `https://synthetixstudio.dev/api/auth/discord/callback`).

4. **Variables de Entorno Requeridas en Cloudflare Pages (Settings > Environment variables):**
   - `DISCORD_CLIENT_ID`: Tu Client ID de Discord.
   - `DISCORD_CLIENT_SECRET`: Tu Client Secret de Discord.
   - `DISCORD_REDIRECT_URI`: La URL final de callback en producción.
   - `DISCORD_WEBHOOK_URL`: El webhook del canal de Discord donde llegarán los embeds lila.
   - `JWT_SECRET`: Cadena aleatoria segura de 32+ caracteres.
   - `ADMIN_DISCORD_IDS`: Tu ID de Discord (snowflake) para tener acceso inmediato a `/admin`.
   - `APP_URL`: La URL pública de la aplicación.
