# Guía de Despliegue a Producción — Synthetix Studio

Esta guía detalla los pasos exactos para publicar la plataforma en **Cloudflare Pages** conectada a la base de datos **Cloudflare D1** y al bucket **Cloudflare R2**.

---

## 1. Requisitos Previos

1. Cuenta activa en [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. [Node.js 20+](https://nodejs.org/) instalado localmente.
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) instalado:
   ```bash
   npm install -g wrangler
   # o usar directamente con npx wrangler
   ```
4. Autenticar Wrangler en tu terminal:
   ```bash
   npx wrangler login
   ```

---

## 2. Aprovisionar Base de Datos Cloudflare D1

1. Crear la base de datos D1:
   ```bash
   npx wrangler d1 create synthetix-db
   ```
   *Guarda el `database_id` que te devuelva la consola (ej: `4a8f9b2c-...`) y actualízalo en `wrangler.jsonc`.*

2. Ejecutar el esquema SQL para crear las tablas (`users`, `projects`, `deliveries`, `project_comments`):
   ```bash
   # En producción (remoto):
   npx wrangler d1 execute synthetix-db --file=./schema.sql --remote

   # (Opcional) Para pruebas locales en tu máquina:
   npx wrangler d1 execute synthetix-db --file=./schema.sql --local
   ```

---

## 3. Aprovisionar Bucket de Archivos Cloudflare R2

1. Crear el bucket donde se almacenarán los `.jar` y `.zip`:
   ```bash
   npx wrangler r2 bucket create synthetix-deliveries
   ```

2. Los bindings ya están configurados en `wrangler.jsonc`:
   ```jsonc
   "r2_buckets": [
     {
       "binding": "BUCKET",
       "bucket_name": "synthetix-deliveries"
     }
   ]
   ```

---

## 4. Configurar Aplicación en Discord Developer Portal

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications).
2. Selecciona tu aplicación (o crea una nueva: **Synthetix Studio**).
3. En la sección **OAuth2 > General**:
   - Copia tu **Client ID** (`DISCORD_CLIENT_ID`).
   - Genera y copia tu **Client Secret** (`DISCORD_CLIENT_SECRET`).
   - En **Redirects**, agrega la URL de producción:
     ```
     https://<tu-proyecto>.pages.dev/api/auth/discord/callback
     https://tu-dominio-personalizado.com/api/auth/discord/callback
     ```
4. En tu servidor de Discord:
   - Entra al canal de pedidos (ej. `#studio-notificaciones`).
   - Ve a **Ajustes del Canal > Integraciones > Webhooks**.
   - Crea un webhook, nómbralo "Synthetix Bot" y copia su **Webhook URL** (`DISCORD_WEBHOOK_URL`).

---

## 5. Variables de Entorno en Cloudflare Pages

En el panel de Cloudflare:
**Workers & Pages > Tu Proyecto > Settings > Environment variables**:

| Variable | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- |
| `DISCORD_CLIENT_ID` | Application ID de Discord | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Secreto OAuth2 de Discord | `aBcDeFgHiJkLmNoP...` |
| `DISCORD_REDIRECT_URI` | URL de retorno de OAuth2 | `https://tu-app.pages.dev/api/auth/discord/callback` |
| `DISCORD_WEBHOOK_URL` | Webhook para embeds lila | `https://discord.com/api/webhooks/...` |
| `JWT_SECRET` | Clave secreta para tokens (32+ chars) | `tu_clave_super_secreta_cyber_lilac_2026` |
| `ADMIN_DISCORD_IDS` | Discord Snowflake IDs con rol admin | `903391086054,TU_DISCORD_SNOWFLAKE` |
| `APP_URL` | Dominio final de la web | `https://tu-app.pages.dev` |

---

## 6. Despliegue en Cloudflare Pages

### Método A: Mediante Conexión con GitHub / Git (Recomendado)
1. Sube este repositorio a tu GitHub o GitLab.
2. En Cloudflare Dashboard, ve a **Workers & Pages > Create application > Pages > Connect to Git**.
3. Selecciona tu repositorio y configura el build:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages` (o `npm run build`)
   - **Build output directory**: `.vercel/output/static` (o `.open-next/assets`)
   - **Compatibility flag**: `nodejs_compat`
   - **Compatibility date**: `2025-01-01`
4. En **Settings > Functions > D1 database bindings**:
   - Variable name: `DB`
   - D1 database: `synthetix-db`
5. En **Settings > Functions > R2 bucket bindings**:
   - Variable name: `BUCKET`
   - R2 bucket: `synthetix-deliveries`
6. Presiona **Save and Deploy**.

### Método B: Despliegue Directo por CLI
```bash
npx wrangler pages deploy .
```

---

## 7. Verificación Post-Despliegue

1. Abre tu URL de Pages (`https://<tu-app>.pages.dev`).
2. Haz clic en **Entrar con Discord** y autoriza la aplicación.
3. Si tu ID de Discord está en `ADMIN_DISCORD_IDS`, verás el badge **Studio Lead** y el enlace al **Panel Admin**.
4. Crea un proyecto de prueba y comprueba que llegue el Rich Embed lila (`#C084FC`) a tu canal de Discord.
5. Sube una entrega `.jar` desde `/admin` y descárgala desde `/dashboard/project/[id]`.
