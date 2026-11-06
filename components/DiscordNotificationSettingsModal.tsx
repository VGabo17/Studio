'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import {
  X,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DiscordNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export function DiscordNotificationSettingsModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}: DiscordNotificationSettingsModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(project.client_discord_webhook || '');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const trimmed = webhookUrl.trim();
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_discord_webhook: trimmed || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar webhook');
      }

      onProjectUpdated(data.project);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim() || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setError('Por favor ingresa una URL válida de Webhook de Discord (https://discord.com/api/webhooks/...)');
      return;
    }

    setTesting(true);
    setError(null);
    setTestSuccess(false);

    try {
      const res = await fetch('/api/audit/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'test_client_webhook',
          title: `🔔 Prueba de Conexión — ${project.title}`,
          description: `¡Hola! Tu servidor de Discord ha sido vinculado exitosamente a **Synthetix Studio** para el proyecto \`${project.id}\`.\n\nRecibirás alertas instantáneas cuando se compilen nuevas versiones .jar, se registren pagos y cuando el staff responda tus mensajes.`,
          customWebhookUrl: webhookUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar webhook de prueba');
      }

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo contactar el webhook de Discord');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#120A21] border border-[#261442] rounded-3xl shadow-[0_0_50px_rgba(192,132,252,0.25)] p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/50 flex items-center justify-center text-[#5865F2]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Alertas Discord en Tiempo Real
              </h2>
              <p className="text-xs text-purple-300/70">
                Recibe notificaciones automáticas en tu propio servidor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442] hover:bg-[#261442] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {testSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡Notificación de prueba enviada con éxito a tu canal de Discord!</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-[#C084FC] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Configuración de webhook guardada correctamente.</span>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] space-y-2 mb-5 text-xs">
          <div className="text-[11px] font-mono text-purple-400 uppercase font-bold tracking-wider mb-1">
            Eventos que recibirás en tu Discord:
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span><strong>Nuevas Compilaciones:</strong> Aviso con changelog y botón de descarga .jar</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] shrink-0" />
            <span><strong>Mensajes de Chat:</strong> Respuestas directas del staff técnico</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span><strong>Progreso y Sprints:</strong> Actualizaciones de avance del código</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span><strong>Comprobantes de Pago:</strong> Recibos verificados y confirmaciones</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveWebhook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              URL de Discord Webhook de tu Servidor
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/123456789/token..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] focus:border-[#5865F2] focus:outline-none text-white text-xs font-mono placeholder:text-purple-400/30"
            />
            <p className="text-[11px] text-purple-300/60 mt-1">
              En Discord: Ajustes de Canal &gt; Integraciones &gt; Webhooks &gt; Copiar URL del Webhook.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testing || !webhookUrl.trim()}
              className="px-4 py-2 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 hover:bg-[#5865F2]/30 text-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5865F2]" />
                  <span>Enviando prueba...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Probar Webhook</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#08050E] border border-[#261442] text-xs text-purple-300 hover:text-white"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(192,132,252,0.3)] flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Webhook</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
