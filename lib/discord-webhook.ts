import { WebhookNotificationPayload, WebhookNotificationType } from './types';

// Color Hexadecimal 0xC084FC en formato decimal para la API de Discord
export const LILAC_EMBED_COLOR = 0xC084FC;

export interface DispatchedNotificationLog {
  id: string;
  type: WebhookNotificationType;
  title: string;
  description: string;
  fields: { name: string; value: string; inline?: boolean }[];
  timestamp: string;
  delivered: boolean;
}

// Registro global en memoria para inspeccionar eventos de Discord en vivo
const globalWebhookLogs: DispatchedNotificationLog[] = [];

export function getWebhookLogs(): DispatchedNotificationLog[] {
  return [...globalWebhookLogs].reverse().slice(0, 20);
}

const SERVICE_LABELS: Record<string, string> = {
  plugin_mc: '⚡ Plugin de Minecraft (Paper/Purpur/Spigot)',
  setup_mc: '🏰 Setup & Configuración Servidor (BoxPvP/Survival)',
  bot_discord: '🤖 Bot de Discord Personalizado (Discord.js)',
  full_pack: '💎 Full Pack: Servidor + Plugins + Bot Discord',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pendiente de Aprobación',
  in_development: '🛠️ En Desarrollo Activo',
  testing: '🧪 Fase de Pruebas / QA',
  completed: '✅ Completado & Entregado',
  cancelled: '❌ Cancelado',
};

/**
 * Envia notificaciones ricas con formato Discord Embed (Color #C084FC)
 */
export async function sendDiscordNotification(
  type: WebhookNotificationType,
  payload: WebhookNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const projectLink = `${appUrl}/dashboard/project/${payload.projectId}`;

  let embedTitle = '';
  let embedDescription = '';
  const fields: { name: string; value: string; inline?: boolean }[] = [];

  switch (type) {
    case 'NEW_ORDER':
      embedTitle = '✨ Nueva Solicitud de Proyecto — Synthetix Studio';
      embedDescription = `Un cliente ha creado una nueva solicitud de servicio en el portal de clientes.`;
      fields.push(
        { name: '🆔 Proyecto', value: `\`${payload.projectId}\``, inline: true },
        { name: '👤 Cliente', value: payload.clientName || 'Cliente Discord', inline: true },
        { name: '🛠️ Servicio', value: SERVICE_LABELS[payload.serviceType || 'plugin_mc'] || payload.serviceType || 'Servicio', inline: false },
        { name: '📝 Título', value: `**${payload.projectTitle}**`, inline: false },
        { name: '📋 Requerimientos', value: payload.description ? (payload.description.length > 300 ? payload.description.substring(0, 297) + '...' : payload.description) : 'Sin detalles adicionales', inline: false },
        { name: '🔗 Enlace al Proyecto', value: `[Ver en Portal de Clientes](${projectLink})`, inline: false }
      );
      break;

    case 'STATUS_CHANGED':
      embedTitle = '🔄 Actualización de Estado de Proyecto';
      embedDescription = `El proyecto **${payload.projectTitle}** (\`${payload.projectId}\`) ha cambiado de estado de desarrollo.`;
      fields.push(
        { name: '📌 Estado Anterior', value: STATUS_LABELS[payload.previousStatus || 'pending'] || 'N/A', inline: true },
        { name: '🚀 Nuevo Estado', value: `**${STATUS_LABELS[payload.status || 'in_development'] || payload.status}**`, inline: true },
        { name: '📊 Progreso', value: `\`${payload.progress ?? 0}%\``, inline: true },
        { name: '🔗 Ver Progreso en Vivo', value: `[Ir al Proyecto](${projectLink})`, inline: false }
      );
      break;

    case 'NEW_DELIVERY':
      embedTitle = '📦 ¡Nueva Versión Lista para Descarga! (.jar / .zip)';
      embedDescription = `Se ha compilado y alojado una nueva versión en Cloudflare R2 para el proyecto **${payload.projectTitle}** (\`${payload.projectId}\`).`;
      fields.push(
        { name: '🏷️ Versión', value: `\`${payload.version || 'v1.0.0'}\``, inline: true },
        { name: '📁 Archivo', value: `\`${payload.fileName || 'build.jar'}\``, inline: true },
        { name: '📝 Notas del Parche / Changelog', value: payload.changelog || 'Optimizaciones generales y correcciones.', inline: false },
        { name: '⚡ Descargar Build', value: `[Descargar desde el Portal](${projectLink})`, inline: false }
      );
      break;
  }

  const embed = {
    title: embedTitle,
    description: embedDescription,
    color: LILAC_EMBED_COLOR, // 0xC084FC (12616956)
    fields,
    footer: {
      text: 'Synthetix Studio • Sistema Automatizado de Notificaciones',
      icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    },
    timestamp: new Date().toISOString(),
  };

  const logEntry: DispatchedNotificationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title: embedTitle,
    description: embedDescription,
    fields,
    timestamp: new Date().toISOString(),
    delivered: false,
  };

  if (!webhookUrl || webhookUrl.includes('your_webhook_id')) {
    // Modo simulación registrado para la UI en vivo
    logEntry.delivered = true;
    globalWebhookLogs.push(logEntry);
    return { success: true };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Synthetix Studio Bot',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      logEntry.delivered = false;
      globalWebhookLogs.push(logEntry);
      return { success: false, error: `Discord Webhook returned status ${res.status}` };
    }

    logEntry.delivered = true;
    globalWebhookLogs.push(logEntry);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logEntry.delivered = false;
    globalWebhookLogs.push(logEntry);
    return { success: false, error: errorMsg };
  }
}
