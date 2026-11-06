'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import Link from 'next/link';
import { User, UserRole } from '@/lib/types';
import { isStaff } from '@/lib/permissions';
import {
  Shield,
  LayoutDashboard,
  LogOut,
  Terminal,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Code2,
  Download,
  DollarSign,
  Send,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNewProject?: () => void;
}

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  admin: {
    label: 'Studio Founder',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
  },
  developer_senior: {
    label: 'Senior Dev',
    bg: 'bg-purple-950/60',
    text: 'text-[#C084FC]',
    border: 'border-[#C084FC]/40',
  },
  developer_junior: {
    label: 'Junior Dev',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
  },
  support: {
    label: 'Soporte',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  client: {
    label: 'Cliente',
    bg: 'bg-slate-900',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
  },
};

export function Navbar({ user, onOpenAuth, onLogout, onOpenNewProject }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleBadge = user ? ROLE_BADGES[user.role] : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#08050E]/95 backdrop-blur-md border-b border-[#261442]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Modrinth / Studio Gaming Style) */}
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#C084FC] p-0.5 shadow-[0_0_15px_rgba(192,132,252,0.35)] group-hover:shadow-[0_0_25px_rgba(192,132,252,0.6)] transition-all">
            <div className="w-full h-full bg-[#120A21] rounded-[10px] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#C084FC]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-sans">
              Synthetix<span className="text-[#C084FC]">Studio</span>
            </span>
          </div>
        </Link>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-purple-200/70">
          <Link href="/#servicios" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Servicios
          </Link>
          <Link href="/#portafolio" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <span>Portafolio</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-[#C084FC] border border-[#C084FC]/30">
              isrewards / Nixer
            </span>
          </Link>
          <Link href="/#tarifas" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Tarifas & Precios
          </Link>
          <Link href="/#flujo" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Garantía SLA
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-[#C084FC] font-semibold hover:text-purple-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/40 border border-[#C084FC]/30"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Portal de Clientes
            </Link>
          )}
          {user && isStaff(user.role) && (
            <Link
              href="/admin"
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/30 border border-amber-500/40"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Panel Staff
            </Link>
          )}
        </nav>

        {/* Zone 3: Primary Actions & Interactive Corner Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick CTA on Desktop */}
          {onOpenNewProject && (
            <button
              onClick={onOpenNewProject}
              className="hidden md:flex px-3.5 py-1.5 text-xs font-semibold text-purple-200 bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/60 hover:text-white rounded-xl transition-all items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Cotizar Proyecto</span>
            </button>
          )}

          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/50 transition-all text-left text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-[#C084FC]/30 flex items-center justify-center text-xs font-bold text-[#C084FC] overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/embed/avatars/${(user.username.length % 5)}.png`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.username.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {user.global_name || user.username}
                  </div>
                  <div className={`text-[10px] uppercase font-mono font-bold ${roleBadge?.text}`}>
                    {roleBadge?.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-400 ml-1" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#120A21] border border-[#261442] shadow-[0_15px_40px_rgba(0,0,0,0.9)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-[#261442]/80">
                    <p className="text-[11px] text-purple-300/70">Sesión Verificada</p>
                    <p className="text-sm font-semibold text-white truncate">{user.global_name || user.username}</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleBadge?.bg} ${roleBadge?.text} ${roleBadge?.border}`}>
                        {roleBadge?.label}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-purple-200 hover:bg-[#261442]/60 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#C084FC]" />
                    <span>Mis Proyectos y Descargas</span>
                  </Link>

                  {isStaff(user.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/30 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Panel Staff Autorizado</span>
                    </Link>
                  )}

                  <div className="border-t border-[#261442]/80 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acceder al Portal</span>
            </button>
          )}

          {/* Menú de la Esquina (Hamburger / Dynamic Command Menu) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#120A21] border border-[#261442] text-purple-200 hover:text-white hover:border-[#C084FC] transition-colors relative group"
            aria-label="Abrir Menú de Control"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#C084FC]" /> : <Menu className="w-5 h-5" />}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#08050E] animate-pulse" />
          </button>
        </div>
      </div>
    </header>

    {/* Menú de la Esquina Dinámico (Modrinth Style Command Center Drawer) - FUERA de header */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop Fullscreen */}
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Lateral Full Height */}
        <aside className="fixed inset-y-0 right-0 w-80 sm:w-96 max-w-[88vw] bg-[#120A21] border-l border-[#261442] shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto z-50 animate-in slide-in-from-right duration-200">
          <div>
            {/* Encabezado del Drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#C084FC] p-0.5">
                    <div className="w-full h-full bg-[#120A21] rounded-[10px] flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-[#C084FC]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-base font-bold text-white tracking-tight">
                      Synthetix<span className="text-[#C084FC]">Hub</span>
                    </span>
                    <p className="text-[10px] text-purple-300/60 font-mono">Modrinth & Spigot Tech</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442] hover:bg-[#261442] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Widget de Estado en Vivo (Minecraft / Modrinth Live Status) */}
              <div className="p-3.5 rounded-2xl bg-[#08050E] border border-[#261442] mb-5 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    SISTEMA ONLINE · 20.0 TPS
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">Ping &lt;15ms</span>
                </div>
                <div className="text-[11px] text-purple-300/70 font-mono leading-relaxed">
                  Compatibilidad nativa con Paper, Purpur y Folia (Java 17/21). Entregas autónomas y seguras.
                </div>
              </div>

              {/* Botón de Acción Rápida: Solicitar / Cotizar */}
              {onOpenNewProject ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNewProject();
                  }}
                  className="w-full mb-5 py-3 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold rounded-2xl shadow-[0_0_25px_rgba(192,132,252,0.35)] flex items-center justify-center gap-2 group active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Crear Nueva Solicitud</span>
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full mb-5 py-3 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold rounded-2xl shadow-[0_0_25px_rgba(192,132,252,0.35)] flex items-center justify-center gap-2 group active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Crear Nueva Solicitud</span>
                </Link>
              )}

              {/* Grid de Botones Dinámicos de Acceso Rápido */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] text-purple-400 uppercase font-mono tracking-wider px-1">
                  Navegación & Catálogo
                </p>

                <Link
                  href="/#servicios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/60 hover:bg-[#180d2c] flex items-center justify-between text-xs text-purple-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C084FC] transition-colors">
                        Servicios Gamer
                      </div>
                      <div className="text-[10px] text-purple-300/60">Plugins, Setups y Bots</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-purple-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/#portafolio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/60 hover:bg-[#180d2c] flex items-center justify-between text-xs text-purple-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C084FC] transition-colors">
                        Portafolio Real
                      </div>
                      <div className="text-[10px] text-purple-300/60">isrewards, issecurity, Nixer</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-purple-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/#tarifas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/60 hover:bg-[#180d2c] flex items-center justify-between text-xs text-purple-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C084FC] transition-colors">
                        Tarifas Transparentes
                      </div>
                      <div className="text-[10px] text-purple-300/60">Desde $15 hasta $80+ USD</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-purple-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-[#08050E] border border-[#261442] hover:border-emerald-500/50 hover:bg-[#180d2c] flex items-center justify-between text-xs text-purple-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Bóveda de Builds .jar
                      </div>
                      <div className="text-[10px] text-purple-300/60">Entregas con hash SHA-256</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-purple-400 group-hover:text-white transition-colors" />
                </Link>

                {user && isStaff(user.role) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/30 flex items-center justify-between text-xs text-amber-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-500/50 flex items-center justify-center text-amber-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          Panel Staff Autorizado
                        </div>
                        <div className="text-[10px] text-amber-300/60">Gestión de Builds y Precios</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-amber-400" />
                  </Link>
                )}
              </div>

              {/* Botón Oficial Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/40 hover:bg-[#5865F2]/25 text-purple-200 text-xs font-semibold flex items-center justify-between transition-colors mb-4"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>Discord Oficial</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              </a>
            </div>

            {/* Bottom: User Card / Login CTA */}
            <div className="pt-4 border-t border-[#261442]">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#08050E] border border-[#261442]">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-[#C084FC]/40 flex items-center justify-center text-xs font-bold text-[#C084FC] overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img
                          src={`https://cdn.discordapp.com/embed/avatars/${(user.username.length % 5)}.png`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user.username.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {user.global_name || user.username}
                      </div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border mt-0.5 ${roleBadge?.bg} ${roleBadge?.text} ${roleBadge?.border}`}>
                        {roleBadge?.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 border border-red-800/30 text-red-300 text-xs font-semibold hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Iniciar Sesión / Portal</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
