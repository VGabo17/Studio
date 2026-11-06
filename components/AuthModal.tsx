'use client';

import React, { useState } from 'react';
import { Mail, User as UserIcon, Loader2, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDiscordOAuth = () => {
    window.location.href = '/api/auth/discord/login';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor introduce un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#120A21] border border-[#261442] rounded-3xl shadow-[0_0_50px_rgba(192,132,252,0.25)] overflow-hidden flex flex-col">
        {/* Header con estética gamer Modrinth */}
        <div className="relative p-6 pb-4 border-b border-[#261442] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9333EA] to-[#C084FC] p-0.5 shadow-[0_0_20px_rgba(192,132,252,0.4)]">
              <div className="w-full h-full bg-[#120A21] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#C084FC]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Synthetix</span>
                <span className="text-[#C084FC]">Portal</span>
              </h2>
              <p className="text-xs text-purple-300/70">
                Acceso a pedidos, builds .jar y soporte técnico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-xl bg-[#08050E] border border-[#261442] hover:bg-[#261442] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón Principal: Discord OAuth2 Estilo Modrinth */}
          <div>
            <button
              onClick={handleDiscordOAuth}
              className="w-full py-3.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm rounded-2xl shadow-[0_0_25px_rgba(88,101,242,0.35)] hover:shadow-[0_0_35px_rgba(88,101,242,0.5)] transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Continuar con Discord</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-purple-300/50 text-center mt-2">
              Sincroniza tus roles de Discord y notificaciones automáticas
            </p>
          </div>

          {/* Separador */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#261442]" />
            <span className="absolute bg-[#120A21] px-3 text-[11px] font-mono text-purple-400/60 uppercase">
              o con correo
            </span>
          </div>

          {/* Formulario de Email */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@servidor-minecraft.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/30 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5 flex items-center justify-between">
                <span>Nick en Minecraft / Tag Gamer</span>
                <span className="text-[10px] text-purple-400/50 font-mono">Opcional</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-purple-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: Steve, CraftBoss99"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/30 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Ingresar a mi Portal</span>
            </button>
          </form>

          {/* Badge de Seguridad Estilo Enterprise Gamer */}
          <div className="pt-2 border-t border-[#261442]/60 flex items-center gap-2 text-[11px] text-purple-400/60 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Autenticación cifrada · Descargas con hash SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
