# ⚡ Synthetix Studio — Plataforma de Desarrollo Gamer & Portal Autónomo de Entregas

> **Plataforma web de alto rendimiento para estudios de desarrollo de Minecraft (Paper/Purpur/Spigot), configuraciones de servidores y bots de Discord, con sistema de roles granular, chat en tiempo real y portal seguro de entregas.**

---

## 📑 Tabla de Contenidos
1. [Características Principales](#-características-principales)
2. [Arquitectura y Sistema de Seguridad](#-arquitectura-y-sistema-de-seguridad)
3. [Guía de Despliegue con Cloudflare Tunnel (`cloudflared`)](#-despliegue-con-cloudflare-tunnel-cloudflared)
4. [Guía de Despliegue en Cloudflare Pages con D1 y R2](#-despliegue-en-cloudflare-pages-con-d1-y-r2)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Sistema de Roles Granular (RBAC)](#-sistema-de-roles-granular-rbac)
7. [Gestión de Tarifas y Precios Oficiales](#-gestión-de-tarifas-y-precios-oficiales)
8. [Estrategias & Ideas para Escalar Synthetix Studio](#-ideas-para-hacer-crecer-el-estudio)

---

## 🚀 Características Principales

- **Diseño Cyber Lilac / Deep Void Permanente**:
  - Paleta gamer oscura (`#08050E`, `#120A21`, `#261442`, `#C084FC`) con micro-interacciones y animaciones de hover en Framer Motion (`whileHover` con escalado sutil y resplandor violeta neón).
- **Portafolio Auténtico Verificado**:
  - **`isrewards`**: Plugin para Paper/Purpur de rachas diarias y recompensas progresivas.
  - **`issecurity`**: Suite de seguridad para Minecraft contra bots, exploits y validación de cuentas.
  - **`Nixer Network`**: Red integral de Minecraft optimizada a 20.0 TPS y transferida/vendida con éxito.
- **Servicios Oficiales con Tarifas Editables**:
  - Configuración de Servidores de Discord (desde $15 USD).
  - Bot de Discord a tu Gusto (desde $20 USD).
  - Plugins de Minecraft a Medida (desde $25 USD).
  - Configuración de Servidores de Minecraft (desde $35 USD).
  - Creación de Web Portafolio (desde $40 USD).
  - Pack Completo Network (desde $80 USD).
- **Portal de Clientes Autónomo**:
  - El cliente inicia sesión con Discord o correo seguro, monitorea el sprint técnico de sus órdenes y descarga directamente sus binarios compilados `.jar` y configuraciones `.zip`.
- **Chat Técnico en Tiempo Real**:
  - Hilo de conversación persistente por proyecto (`project_chat_messages`) con transmisión Server-Sent Events (SSE) y distintivos oficiales por rol (`ADMIN`, `DEV SENIOR`, `DEV JUNIOR`, `SOPORTE`, `CLIENTE`).
- **Gestor Dinámico de Precios para Administradores**:
  - Solo el Administrador Lead puede modificar las tarifas del catálogo oficial y cotizar proyectos específicos, reflejándose inmediatamente en toda la web.

---

## 🛡️ Arquitectura y Sistema de Seguridad

A diferencia de plantillas web genéricas vulnerables, Synthetix Studio implementa una arquitectura defensiva en profundidad:

1. **Cero Exposición Pública de Paneles Administrativos**:
   - Se removió cualquier enlace de `/admin` en el pie de página público (anti-scraping y seguridad por diseño).
   - Acceso a `/admin` protegido con respuesta HTTP `403 Forbidden` y pantalla blindada para usuarios sin credenciales de staff.
2. **Sesiones Seguras HTTP-Only con JWT (HS256)**:
   - Cookies con flags `HttpOnly`, `SameSite=Lax` y `Secure` que impiden ataques XSS contra el token de sesión.
3. **Verificación Estricta en API Routes**:
   - Cada endpoint (`/api/projects/[id]`, `/api/deliveries/upload`, `/api/admin/rates`) valida criptográficamente el rol del emisor antes de ejecutar cualquier mutación en base de datos.
4. **Protección de Almacenamiento**:
   - Los binarios `.jar` y `.zip` no tienen URLs públicas indexables. Las descargas se sirven mediante streaming con validación de sesión y hashes SHA-256.

---

## 🌐 Despliegue con Cloudflare Tunnel (`cloudflared`)

**¿Por qué Cloudflare Tunnel?**
Cloudflare Tunnel conecta tu servidor local, VPS o contenedor Docker directamente a la red perimetral de Cloudflare **sin abrir ningún puerto en tu router/firewall** (sin port-forwarding). Tu IP de origen queda 100% oculta contra ataques DDoS.

### Paso 1: Instalar `cloudflared` en tu Servidor / VPS

**En Ubuntu / Debian:**
```bash
# Descargar el repositorio oficial de Cloudflare
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Instalar el paquete
sudo apt-get update && sudo apt-get install cloudflared -y
```

**En Windows (PowerShell con Winget):**
```powershell
winget install --id Cloudflare.cloudflared
```

---

### Paso 2: Autenticar `cloudflared` con tu Cuenta de Cloudflare
Ejecuta el siguiente comando en tu terminal:
```bash
cloudflared tunnel login
```
Esto abrirá una URL en tu navegador donde seleccionarás el dominio que tienes alojado en Cloudflare (ej. `synthetixstudio.dev`). Una vez aprobado, se generará el archivo de certificado `cert.pem`.

---

### Paso 3: Crear el Túnel Seguro
```bash
cloudflared tunnel create synthetix-tunnel
```
Este comando devolverá un UUID del túnel (ej. `a1b2c3d4-e5f6-7890-abcd-1234567890ab`) y creará el archivo de credenciales en `~/.cloudflared/<UUID>.json`.

---

### Paso 4: Crear el Archivo de Configuración (`config.yml`)
Crea o edita el archivo en `~/.cloudflared/config.yml`:

```yaml
tunnel: a1b2c3d4-e5f6-7890-abcd-1234567890ab
credentials-file: /home/usuario/.cloudflared/a1b2c3d4-e5f6-7890-abcd-1234567890ab.json

ingress:
  # Enrutamiento de tu dominio principal a tu app Next.js local en puerto 3000
  - hostname: studio.tudominio.com
    service: http://localhost:3000

  # Opcional: Subdominio para descargas o websocket
  - hostname: portal.tudominio.com
    service: http://localhost:3000

  # Regla final obligatoria (catch-all)
  - service: http_status:404
```

---

### Paso 5: Enrutar el DNS en Cloudflare
Asocia tu túnel a tu subdominio o dominio raíz:
```bash
cloudflared tunnel route dns synthetix-tunnel studio.tudominio.com
```
Cloudflare creará automáticamente un registro CNAME en tu zona DNS apuntando de forma segura a la red de Cloudflare.

---

### Paso 6: Ejecutar como Servicio Permanente (systemd en Linux)
Para que el túnel se inicie automáticamente con tu servidor y nunca se caiga:
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```
¡Listo! Tu web estará accesible globalmente con SSL/TLS automático, protección WAF de Cloudflare y tu IP privada protegida.

---

## 📦 Despliegue en Cloudflare Pages con D1 y R2

Si prefieres el modelo Serverless Edge directo en la nube de Cloudflare:

### 1. Crear la Base de Datos D1 (SQLite Serverless)
```bash
npx wrangler d1 create synthetix-db
```
Copia el `database_id` devuelto y agrégalo a tu `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "synthetix-db"
database_id = "TU_DATABASE_ID_AQUI"
```

Aplica el esquema SQL estructurado:
```bash
npx wrangler d1 execute synthetix-db --file=./schema.sql
```

### 2. Crear el Bucket de Almacenamiento R2
```bash
npx wrangler r2 bucket create synthetix-deliveries
```
Configura la vinculación en `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "synthetix-deliveries"
```

### 3. Desplegar en Cloudflare Pages
```bash
# Compilar proyecto optimizado para Pages
npm run build
npx wrangler pages deploy .next
```

---

## 🔑 Variables de Entorno

Configura las siguientes variables en tu archivo `.env.local` (o en la sección de Secrets de Cloudflare):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `JWT_SECRET` | Clave secreta para firmar tokens JWT de sesión | `synthetix_ultra_secret_key_32_chars_min` |
| `ADMIN_DISCORD_IDS` | IDs de Snowflake de Discord autorizados como Admin Lead | `903391086054,123456789012345678` |
| `DISCORD_CLIENT_ID` | Client ID de tu Discord Developer Application | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Secret de tu Discord Developer Application | `xyzABC123...` |
| `DISCORD_REDIRECT_URI` | Callback de OAuth2 de Discord | `https://studio.tudominio.com/api/auth/discord/callback` |
| `DISCORD_WEBHOOK_URL` | Webhook de Discord para alertas y embeds automáticos | `https://discord.com/api/webhooks/...` |

---

## 👥 Sistema de Roles Granular (RBAC)

Synthetix Studio cuenta con 5 niveles de privilegios estricto:

| Rol | Privilegios y Restricciones |
|---|---|
| **`client`** | Puede crear solicitudes, chatear en sus órdenes y descargar builds compiladas de sus propios proyectos. |
| **`support`** | Acceso a chats de soporte, lectura de especificaciones técnicas y asistencia a clientes. |
| **`developer_junior`** | Puede registrar avances técnicos hasta un **máximo del 85%**. **No puede** marcar proyectos como completados ni subir builds finales. |
| **`developer_senior`** | Supervisión de código, puede subir binarios `.jar`/`.zip` al centro de entregas y marcar proyectos como **`completed`**. |
| **`admin`** | Acceso total: editor de tarifas oficiales, cotización de proyectos, gestión de miembros del staff y auditoría de webhooks. |

---

## 💰 Gestión de Tarifas y Precios Oficiales

1. Inicia sesión con una cuenta de rol `admin` (configurada en `ADMIN_DISCORD_IDS`).
2. Accede a tu **Panel Staff & Admin** desde el menú de usuario.
3. Haz clic en el botón dorado **"Editar Tarifas del Catálogo"**.
4. Modifica el precio base de cualquiera de los 6 servicios oficiales o ajusta el tiempo de entrega.
5. Haz clic en **Guardar**:
   - La base de datos actualiza el registro atómicamente.
   - El landing page y el modal de nueva solicitud reflejan la nueva tarifa de inmediato.
   - Se despacha un Rich Embed automático a tu canal de Discord registrando la auditoría.

---

## 💡 Ideas para Hacer Crecer el Estudio

Para transformar a Synthetix Studio en la plataforma gamer líder de la comunidad hispanohablante:

1. **Sistema de Licencias & HWID Anti-Leak para tus Plugins (`isrewards`, `issecurity`)**:
   - Genera licencias criptográficas vinculadas al IP del servidor del cliente.
   - Si el plugin es filtrado o compartido sin permiso, el panel de Synthetix puede revocar la licencia de forma remota en tiempo real.
2. **Verificación en el Servidor In-Game de Minecraft**:
   - Comando `/verificar <código>` dentro de tu servidor de Minecraft que enlace automáticamente la cuenta de Minecraft con su usuario de Discord y portal web.
3. **Generador de Portafolios con Subdominio Dinámico**:
   - Ofrece el servicio de Web Portafolio con hosting incluido bajo `nombre.synthetix.dev` utilizando Cloudflare for SaaS (SSL for SaaS).
4. **Calculadora Interactiva de Presupuestos**:
   - Permite a los dueños de servidores armar su paquete eligiendo modalidades (Survival + Discord + 2 Plugins Custom) y ver el descuento automático por volumen.
5. **Telemetría Opcional de Rendimiento**:
   - Un módulo liviano para tus clientes donde puedan ver en su portal el gráfico de TPS, uso de memoria RAM y jugadores concurrentes de sus servidores.
