'use client';

import React, { useEffect, useState } from 'react';
import { DispatchedNotificationLog } from '@/lib/discord-webhook';
import { Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface DiscordEmbedAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiscordEmbedAuditModal({ isOpen, onClose }: DiscordEmbedAuditModalProps) {
  const [logs, setLogs] = useState<DispatchedNotificationLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/audit');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch {
      // Ignorar error de lectura de logs
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (isOpen) {
      fetch('/api/webhooks/audit')
        .then((res) => res.json())
        .then((data) => {
          if (active && data.success && data.logs) {
            setLogs(data.logs);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/50 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Auditoría de Discord Webhooks (Color #C084FC)
              </h2>
              <p className="text-xs text-purple-300/70">
                Visualización en tiempo real de los Rich Embeds enviados por Synthetix Bot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 text-purple-400 hover:text-white rounded-lg hover:bg-[#261442] transition-colors"
              title="Recargar logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-purple-400/60 text-xs">
              Aún no se han disparado webhooks en esta sesión. Crea un proyecto o sube una entrega para presenciar el embed.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#2B2D31] rounded-lg p-4 font-sans text-white text-xs border-l-4 border-[#C084FC] shadow-lg"
              >
                {/* Simulated Discord Embed */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px] font-bold text-white">
                    SB
                  </div>
                  <span className="font-bold text-sm text-white">Synthetix Studio Bot</span>
                  <span className="bg-[#5865F2] text-white text-[9px] px-1 py-0.5 rounded font-mono font-bold">
                    BOT
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="bg-[#1E1F22] rounded p-3 border-l-[3px] border-[#C084FC] mt-2 space-y-2">
                  <div className="text-[#C084FC] font-bold text-sm hover:underline cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {log.title}
                  </div>
                  <div className="text-zinc-300 text-xs">{log.description}</div>

                  {log.fields && log.fields.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-2 mt-2 border-t border-zinc-800">
                      {log.fields.map((f, idx) => (
                        <div key={idx} className={f.inline === false ? 'col-span-2' : ''}>
                          <div className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                            {f.name}
                          </div>
                          <div className="text-xs text-zinc-200 mt-0.5 whitespace-pre-line">
                            {f.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-[10px] text-zinc-400 flex items-center gap-1 border-t border-zinc-800 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-[#C084FC]" />
                    <span>Synthetix Studio • Sistema Automatizado de Notificaciones</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
