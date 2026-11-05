'use client';

import React, { useState } from 'react';
import { Sparkles, Mail, Shield, User, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'discord' | 'email' | 'personas'>('personas');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePersonaLogin = async (persona: 'admin' | 'client') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona }),
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Introduce un correo electrónico válido');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
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

  const handleDiscordOAuth = () => {
    window.location.href = '/api/auth/discord/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-[#C084FC]/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Acceso a Synthetix Studio</h2>
              <p className="text-xs text-purple-300/70">Gestiona pedidos, entregas y descargas R2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#261442] p-1.5 bg-[#08050E]/60 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'personas'
                ? 'bg-[#120A21] text-[#C084FC] border border-[#261442] shadow-sm'
                : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Acceso Rápido
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'email'
                ? 'bg-[#120A21] text-[#C084FC] border border-[#261442] shadow-sm'
                : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Correo
          </button>
          <button
            onClick={() => setActiveTab('discord')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'discord'
                ? 'bg-[#120A21] text-[#C084FC] border border-[#261442] shadow-sm'
                : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Discord OAuth2
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200">
              {error}
            </div>
          )}

          {activeTab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-purple-300/70 mb-3">
                Selecciona una de las cuentas de prueba con proyectos reales precargados en Cloudflare D1:
              </p>

              <button
                disabled={loading}
                onClick={() => handlePersonaLogin('client')}
                className="w-full p-3.5 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC] hover:shadow-[0_0_20px_rgba(192,132,252,0.25)] transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#C084FC] transition-colors">
                      Phoenix Network [Owner]
                    </div>
                    <div className="text-xs text-purple-300/60">
                      Rol: Cliente · 2 Proyectos · 3 Entregas .jar
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
              </button>

              <button
                disabled={loading}
                onClick={() => handlePersonaLogin('admin')}
                className="w-full p-3.5 rounded-xl bg-[#08050E] border border-[#261442] hover:border-amber-400/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                      AlexDev • Synthetix Lead
                    </div>
                    <div className="text-xs text-purple-300/60">
                      Rol: Administrador · Gestión total & Subidas R2
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-purple-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dueño@tu-servidor.net"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1.5">
                  Nombre de Usuario / Tag Gamer (Opcional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-purple-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. CraftMaster99"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Ingresar al Portal
              </button>
            </form>
          )}

          {activeTab === 'discord' && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-purple-200 text-xs leading-relaxed">
                <p className="font-semibold text-white mb-1">Discord OAuth2 Oficial</p>
                Autenticación segura solicitando permisos <code className="text-[#C084FC] font-mono">identify</code> y <code className="text-[#C084FC] font-mono">email</code> para sincronizar automáticamente tu avatar y tag con tus pedidos de Minecraft.
              </div>

              <button
                onClick={handleDiscordOAuth}
                className="w-full py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm rounded-xl shadow-[0_0_25px_rgba(88,101,242,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Iniciar Sesión con Discord
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
