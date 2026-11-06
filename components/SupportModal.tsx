'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import {
  X,
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function SupportModal({ isOpen, onClose, user }: SupportModalProps) {
  const [topic, setTopic] = useState<'plugin_bug' | 'setup_question' | 'delivery_help' | 'general'>('plugin_bug');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      // Intentar notificar por webhook de auditoría / soporte
      await fetch('/api/audit/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'ticket_support',
          title: `Nuevo Ticket de Soporte · ${topic.toUpperCase()}`,
          description: `Cliente: **${user?.global_name || user?.username || 'Gamer'}** (${user?.email || 'N/A'})\n\nMensaje:\n${message}`,
        }),
      });

      setTicketSent(true);
      setMessage('');
    } catch {
      // Ignorar fallback
      setTicketSent(true);
    } finally {
      setSending(false);
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
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Centro de Soporte Técnico
              </h2>
              <p className="text-xs text-purple-300/70">
                Atención directa para servidores, plugins y configuraciones
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

        {/* SLA Guarantee Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[#08050E] border border-[#261442]">
            <div className="flex items-center gap-1.5 text-xs text-[#C084FC] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Tiempo de Respuesta</span>
            </div>
            <p className="text-[11px] text-purple-300/70 leading-snug">
              Respuesta garantizada en menos de 4 horas en Discord.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#08050E] border border-[#261442]">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantía de Código</span>
            </div>
            <p className="text-[11px] text-purple-300/70 leading-snug">
              30 días de corrección de bugs y soporte técnico post-entrega.
            </p>
          </div>
        </div>

        {ticketSent ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¡Ticket de Soporte Enviado!</h3>
              <p className="text-xs text-purple-300/70 max-w-sm mx-auto mt-1 leading-relaxed">
                Nuestro equipo técnico ha recibido tu requerimiento. Te responderemos directamente en tu panel de proyecto o en el canal de soporte de Discord.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setTicketSent(false)}
                className="px-4 py-2 rounded-xl bg-[#08050E] border border-[#261442] text-xs font-semibold text-purple-200 hover:text-white"
              >
                Enviar Otro Mensaje
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#C084FC] text-black text-xs font-bold hover:bg-purple-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Motivo de la Consulta
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] focus:border-[#C084FC] focus:outline-none text-white text-xs"
              >
                <option value="plugin_bug">Reportar Incidencia o Bug en Plugin</option>
                <option value="setup_question">Duda sobre Configuración / Optimización TPS</option>
                <option value="delivery_help">Ayuda con Descarga de Archivos .jar / .zip</option>
                <option value="general">Consulta General de Servicio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Detalle del Requerimiento o Error
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe el problema, versión de servidor (ej. Purpur 1.21.4) o consulta..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] focus:border-[#C084FC] focus:outline-none text-white text-xs placeholder:text-purple-400/40 resize-none"
              />
            </div>

            {/* Direct Discord Channel Link */}
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 hover:bg-[#5865F2]/20 text-xs text-purple-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                <span>¿Prefieres atención inmediata? Canal de Discord</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </a>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] hover:bg-[#180d2c] text-purple-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(192,132,252,0.3)] flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar a Soporte</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
