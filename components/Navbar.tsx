'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/types';
import { Shield, LayoutDashboard, LogOut, Terminal, Sparkles, ChevronDown } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchPersona?: (role: 'client' | 'admin') => void;
}

export function Navbar({ user, onOpenAuth, onLogout, onSwitchPersona }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08050E]/90 backdrop-blur-md border-b border-[#261442]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
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

        {/* Zone 2: Navigation Links (Single-Line, 4 Clean Links) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-purple-200/70">
          <Link href="/#servicios" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Servicios
          </Link>
          <Link href="/#portafolio" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Portafolio
          </Link>
          <Link href="/#flujo" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Flujo de Trabajo
          </Link>
          <Link href="/#testimonios" className="hover:text-[#C084FC] transition-colors whitespace-nowrap shrink-0">
            Vouches & Opiniones
          </Link>
          {user && (
            <Link href="/dashboard" className="text-[#C084FC] font-semibold hover:text-purple-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Portal de Clientes
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Panel Admin
            </Link>
          )}
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
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
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {user.global_name || user.username}
                  </div>
                  <div className="text-[10px] text-purple-400 uppercase tracking-wider font-mono">
                    {user.role === 'admin' ? 'Studio Admin' : 'Cliente'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-400 ml-1" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#120A21] border border-[#261442] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#261442]/80">
                    <p className="text-xs text-purple-300/70">Conectado como</p>
                    <p className="text-sm font-semibold text-white truncate">{user.global_name || user.username}</p>
                    {user.email && <p className="text-xs text-purple-400/80 font-mono truncate">{user.email}</p>}
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-purple-200 hover:bg-[#261442]/60 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#C084FC]" />
                    Ir a mis Proyectos
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/30 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Panel Administrador
                    </Link>
                  )}

                  {onSwitchPersona && (
                    <div className="px-3 py-2 border-t border-[#261442]/80 mt-1">
                      <p className="text-[10px] text-purple-400 uppercase font-mono mb-1">Cambio Rápido de Rol</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onSwitchPersona('client');
                            setProfileOpen(false);
                          }}
                          className={`px-2 py-1 text-[11px] rounded font-medium flex-1 transition-colors ${
                            user.role === 'client'
                              ? 'bg-[#C084FC] text-black font-semibold'
                              : 'bg-[#261442] text-purple-200 hover:bg-[#341b5a]'
                          }`}
                        >
                          Cliente
                        </button>
                        <button
                          onClick={() => {
                            onSwitchPersona('admin');
                            setProfileOpen(false);
                          }}
                          className={`px-2 py-1 text-[11px] rounded font-medium flex-1 transition-colors ${
                            user.role === 'admin'
                              ? 'bg-amber-400 text-black font-semibold'
                              : 'bg-[#261442] text-purple-200 hover:bg-[#341b5a]'
                          }`}
                        >
                          Admin
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
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] rounded-lg shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Entrar con Discord
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
