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
  Users,
  Headphones,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchPersona?: (role: UserRole) => void;
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

export function Navbar({ user, onOpenAuth, onLogout, onSwitchPersona }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleBadge = user ? ROLE_BADGES[user.role] : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08050E]/95 backdrop-blur-md border-b border-[#261442]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single Element) */}
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#120A21] border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] group-hover:border-[#C084FC] group-hover:shadow-[0_0_15px_rgba(192,132,252,0.4)] transition-all">
            <Terminal className="w-5 h-5 text-[#C084FC]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              Synthetix<span className="text-[#C084FC]">Studio</span>
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links (Desktop - Single-Line Clean Links) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-purple-200/70">
          <Link href="/#servicios" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Servicios
          </Link>
          <Link href="/#portafolio" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Portafolio Real
          </Link>
          <Link href="/#tarifas" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Tarifas & Precios
          </Link>
          <Link href="/#flujo" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Cómo Trabajamos
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-[#C084FC] font-semibold hover:text-purple-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <LayoutDashboard className="w-4 h-4" />
              Portal de Clientes
            </Link>
          )}
          {user && isStaff(user.role) && (
            <Link
              href="/admin"
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <Shield className="w-4 h-4" />
              Panel Staff ({roleBadge?.label})
            </Link>
          )}
        </nav>

        {/* Zone 3: Primary Action Zone & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/50 transition-all text-left text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-[#C084FC]/30 flex items-center justify-center text-xs font-bold text-[#C084FC] overflow-hidden">
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
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#120A21] border border-[#261442] shadow-[0_10px_35px_rgba(0,0,0,0.85)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#261442]/80">
                    <p className="text-xs text-purple-300/70">Sesión iniciada como</p>
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
                    className="flex items-center gap-2 px-3 py-2 text-xs text-purple-200 hover:bg-[#261442]/60 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#C084FC]" />
                    Ir a mis Proyectos
                  </Link>

                  {isStaff(user.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/30 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Panel Administrativo & Staff
                    </Link>
                  )}

                  {onSwitchPersona && (
                    <div className="px-3 py-2 border-t border-[#261442]/80 mt-1">
                      <p className="text-[10px] text-purple-400 uppercase font-mono mb-1.5">
                        Roles Granulares (Pruebas)
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <button
                          onClick={() => {
                            onSwitchPersona('admin');
                            setProfileOpen(false);
                          }}
                          className={`p-1.5 rounded font-mono transition-colors text-left truncate ${
                            user.role === 'admin' ? 'bg-amber-400 text-black font-bold' : 'bg-[#08050E] text-amber-300 hover:bg-[#261442]'
                          }`}
                        >
                          👑 Admin
                        </button>
                        <button
                          onClick={() => {
                            onSwitchPersona('developer_senior');
                            setProfileOpen(false);
                          }}
                          className={`p-1.5 rounded font-mono transition-colors text-left truncate ${
                            user.role === 'developer_senior' ? 'bg-[#C084FC] text-black font-bold' : 'bg-[#08050E] text-[#C084FC] hover:bg-[#261442]'
                          }`}
                        >
                          ⚡ Dev Senior
                        </button>
                        <button
                          onClick={() => {
                            onSwitchPersona('developer_junior');
                            setProfileOpen(false);
                          }}
                          className={`p-1.5 rounded font-mono transition-colors text-left truncate ${
                            user.role === 'developer_junior' ? 'bg-cyan-400 text-black font-bold' : 'bg-[#08050E] text-cyan-300 hover:bg-[#261442]'
                          }`}
                        >
                          🛠️ Dev Junior
                        </button>
                        <button
                          onClick={() => {
                            onSwitchPersona('support');
                            setProfileOpen(false);
                          }}
                          className={`p-1.5 rounded font-mono transition-colors text-left truncate ${
                            user.role === 'support' ? 'bg-emerald-400 text-black font-bold' : 'bg-[#08050E] text-emerald-300 hover:bg-[#261442]'
                          }`}
                        >
                          🎧 Soporte
                        </button>
                        <button
                          onClick={() => {
                            onSwitchPersona('client');
                            setProfileOpen(false);
                          }}
                          className={`col-span-2 p-1.5 rounded font-mono transition-colors text-center ${
                            user.role === 'client' ? 'bg-purple-300 text-black font-bold' : 'bg-[#08050E] text-purple-200 hover:bg-[#261442]'
                          }`}
                        >
                          👤 Cliente
                        </button>
                      </div>
                    </div>
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
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] rounded-lg shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Acceder al Portal
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#120A21] border border-[#261442] text-purple-200 hover:text-white hover:border-[#C084FC] transition-colors lg:hidden"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#C084FC]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer / Hamburger Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#120A21] border-l border-[#261442] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#08050E] border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-white tracking-tight">
                    Synthetix<span className="text-[#C084FC]">Studio</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-[#261442]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile in Mobile Drawer */}
              {user ? (
                <div className="p-3.5 rounded-xl bg-[#08050E] border border-[#261442] mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-900/60 border border-[#C084FC]/40 flex items-center justify-center text-xs font-bold text-[#C084FC] overflow-hidden">
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
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border mt-0.5 ${roleBadge?.bg} ${roleBadge?.text} ${roleBadge?.border}`}>
                        {roleBadge?.label}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Iniciar Sesión / Registro
                  </button>
                </div>
              )}

              {/* Navigation Links in Mobile */}
              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/#servicios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-200 hover:text-white hover:bg-[#261442]/60 transition-colors"
                >
                  <Terminal className="w-4 h-4 text-[#C084FC]" />
                  Servicios de Desarrollo
                </Link>
                <Link
                  href="/#portafolio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-200 hover:text-white hover:bg-[#261442]/60 transition-colors"
                >
                  <Code2 className="w-4 h-4 text-[#C084FC]" />
                  Portafolio Real (isrewards / Nixer)
                </Link>
                <Link
                  href="/#tarifas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-200 hover:text-white hover:bg-[#261442]/60 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#C084FC]" />
                  Tarifas & Precios
                </Link>
                <Link
                  href="/#flujo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-200 hover:text-white hover:bg-[#261442]/60 transition-colors"
                >
                  <Users className="w-4 h-4 text-[#C084FC]" />
                  Cómo Trabajamos
                </Link>

                {user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#C084FC] font-semibold hover:bg-purple-950/40 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#C084FC]" />
                    Portal de Clientes
                  </Link>
                )}

                {user && isStaff(user.role) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-300 font-semibold hover:bg-amber-950/30 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    Panel Staff & Admin
                  </Link>
                )}
              </nav>

              {/* Mobile Role Switcher for Testing */}
              {onSwitchPersona && (
                <div className="mt-6 pt-5 border-t border-[#261442]">
                  <p className="text-[10px] text-purple-400 uppercase font-mono mb-2">
                    Probar Rol Granular
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['admin', 'developer_senior', 'developer_junior', 'support', 'client'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onSwitchPersona(r);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-2 rounded-lg font-mono text-[11px] text-left transition-colors truncate ${
                          user?.role === r
                            ? 'bg-[#C084FC] text-black font-bold'
                            : 'bg-[#08050E] text-purple-300 hover:bg-[#261442]'
                        }`}
                      >
                        {r === 'admin' && '👑 Admin'}
                        {r === 'developer_senior' && '⚡ Dev Senior'}
                        {r === 'developer_junior' && '🛠️ Dev Junior'}
                        {r === 'support' && '🎧 Soporte'}
                        {r === 'client' && '👤 Cliente'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout at bottom */}
            {user && (
              <div className="pt-6 border-t border-[#261442] mt-6">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-semibold hover:bg-red-900/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}
