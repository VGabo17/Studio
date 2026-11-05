'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ProjectChatMessage, User, UserRole } from '@/lib/types';
import { Send, MessageSquare, Shield, Sparkles, Code2, Headphones, User as UserIcon, Loader2, Wifi } from 'lucide-react';

interface ProjectChatProps {
  projectId: string;
  currentUser: User;
}

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  admin: {
    label: 'ADMIN',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
  },
  developer_senior: {
    label: 'DEV SENIOR',
    bg: 'bg-purple-950/60',
    text: 'text-[#C084FC]',
    border: 'border-[#C084FC]/40',
  },
  developer_junior: {
    label: 'DEV JUNIOR',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
  },
  support: {
    label: 'SOPORTE',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  client: {
    label: 'CLIENTE',
    bg: 'bg-slate-900',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
  },
};

export function ProjectChat({ projectId, currentUser }: ProjectChatProps) {
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar mensajes iniciales
  useEffect(() => {
    let active = true;

    const fetchInitial = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/chat`);
        const data = await res.json();
        if (active && data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch {
        // Ignorar error inicial
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitial();

    // Conexión en tiempo real vía Server-Sent Events (SSE / WebSocket compatible)
    const eventSource = new EventSource(`/api/projects/${projectId}/chat/stream`);

    eventSource.addEventListener('connected', () => {
      if (active) setConnected(true);
    });

    eventSource.addEventListener('message', (event) => {
      try {
        const newMsg: ProjectChatMessage = JSON.parse(event.data);
        if (active) {
          setMessages((prev) => {
            // Evitar duplicados si ya existe el ID
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      } catch {}
    });

    eventSource.onerror = () => {
      if (active) setConnected(false);
    };

    return () => {
      active = false;
      eventSource.close();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar mensaje');
      }

      // Optimistic update si SSE aún no transmitió
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al enviar mensaje');
      setInputText(textToSend); // Recuperar texto
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl bg-[#120A21] border border-[#261442] shadow-[0_0_25px_rgba(192,132,252,0.12)] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#261442] flex items-center justify-between shrink-0 bg-[#08050E]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Chat del Proyecto en Tiempo Real
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-purple-300/70 font-mono">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {connected ? 'Conexión Segura en Vivo' : 'Sincronizado'}
              </span>
              <span>·</span>
              <span>Mensajes Cifrados</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-purple-400">
          {messages.length} mensaje(s)
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-purple-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#C084FC] mb-2" />
            <p className="font-mono text-[11px]">Cargando mensajes del canal...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-purple-400/60 text-xs p-6">
            <MessageSquare className="w-8 h-8 text-purple-400/40 mb-2" />
            <p className="font-semibold text-white">Canal de comunicación directo</p>
            <p className="text-[11px] mt-1 text-purple-300/60 max-w-xs">
              Envía tus preguntas o requerimientos adicionales. Clientes, administradores y desarrolladores responderán al instante.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser.id;
            const authorRole = msg.author?.role || 'client';
            const badge = ROLE_BADGES[authorRole];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-white">
                    {msg.author?.global_name || msg.author?.username || (isMe ? 'Tú' : 'Usuario')}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-purple-400/50 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    isMe
                      ? 'bg-gradient-to-r from-[#7E22CE] to-[#9333EA] text-white rounded-tr-none shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                      : 'bg-[#08050E] border border-[#261442] text-purple-100 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-[#261442] bg-[#08050E] flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Escribe un mensaje como ${currentUser.global_name || currentUser.username}...`}
          className="flex-1 px-3.5 py-2.5 bg-[#120A21] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC]"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-4 py-2.5 bg-[#C084FC] hover:bg-purple-300 disabled:opacity-50 text-black font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(192,132,252,0.3)] shrink-0"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
}
