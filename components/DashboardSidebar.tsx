'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { isStaff } from '@/lib/permissions';
import {
  FolderKanban,
  Settings,
  LifeBuoy,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Terminal,
  CreditCard,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface DashboardSidebarProps {
  user: User | null;
  projectsCount?: number;
  onOpenNewProject?: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onOpenPaymentSettings?: () => void;
  onLogout: () => void;
}

export function DashboardSidebar({
  user,
  projectsCount = 0,
  onOpenNewProject,
  onOpenSettings,
  onOpenSupport,
  onOpenPaymentSettings,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const staff = isStaff(user?.role);
  const isProjectsActive = pathname === '/dashboard';
  const isAdminActive = pathname.startsWith('/admin');

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR (Sticky, Crisp, Collapsible w-64 / w-20) */}
      {/* ========================================================= */}
      <aside
        className={`
          hidden md:flex flex-col justify-between shrink-0
          sticky top-[72px] h-[calc(100vh-72px)]
          bg-[#120A21] border-r border-[#261442]
          transition-all duration-300 ease-in-out select-none z-30
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Desktop Header */}
        <div className="p-3.5 border-b border-[#261442]/80 flex items-center justify-between min-h-[64px]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden transition-opacity duration-200">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] shrink-0 shadow-[0_0_15px_rgba(192,132,252,0.2)]">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white tracking-tight truncate">
                  Synthetix<span className="text-[#C084FC]">Portal</span>
                </div>
                <div className="text-[10px] text-purple-300/60 font-mono truncate">
                  Gamer Workspace
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={() => setCollapsed(false)}
                className="w-8 h-8 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 hover:border-[#C084FC] flex items-center justify-center text-[#C084FC] transition-colors"
                title="Expandir barra lateral"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/60 text-purple-300 hover:text-white transition-colors"
              title="Colapsar barra lateral"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop Nav Items */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {onOpenNewProject && (
            <button
              onClick={onOpenNewProject}
              className={`
                w-full mb-3 py-2.5 px-3 rounded-xl
                bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE]
                text-white text-xs font-bold shadow-[0_0_15px_rgba(192,132,252,0.3)]
                flex items-center transition-all duration-200 active:scale-[0.98]
                ${collapsed ? 'justify-center' : 'justify-start gap-2.5'}
              `}
              title="Crear Nueva Solicitud"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">Nueva Solicitud</span>}
            </button>
          )}

          {/* Mis Proyectos */}
          <Link
            href="/dashboard"
            className={`
              w-full flex items-center rounded-xl py-2.5 px-3 text-xs font-semibold
              transition-all duration-200 group relative
              ${
                isProjectsActive
                  ? 'bg-[#C084FC]/15 text-[#C084FC] border border-[#C084FC]/40 shadow-[0_0_15px_rgba(192,132,252,0.15)] font-bold'
                  : 'text-purple-200/80 hover:text-white hover:bg-[#180d2c] border border-transparent'
              }
              ${collapsed ? 'justify-center' : 'justify-between'}
            `}
            title="Mis Proyectos"
          >
            <div className="flex items-center gap-3 truncate">
              <FolderKanban
                className={`w-4 h-4 shrink-0 ${
                  isProjectsActive ? 'text-[#C084FC]' : 'text-purple-400 group-hover:text-white'
                }`}
              />
              {!collapsed && <span className="truncate">Mis Proyectos</span>}
            </div>

            {!collapsed && projectsCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-[#C084FC]/30 text-[#C084FC]">
                {projectsCount}
              </span>
            )}
          </Link>

          {/* Configuración de Cuenta */}
          <button
            onClick={onOpenSettings}
            className={`
              w-full flex items-center rounded-xl py-2.5 px-3 text-xs font-semibold
              transition-all duration-200 group text-purple-200/80 hover:text-white hover:bg-[#180d2c] border border-transparent
              ${collapsed ? 'justify-center' : 'justify-start gap-3'}
            `}
            title="Configuración de Cuenta"
          >
            <Settings className="w-4 h-4 shrink-0 text-purple-400 group-hover:text-[#C084FC] transition-colors" />
            {!collapsed && <span className="truncate">Configuración de Cuenta</span>}
          </button>

          {/* Soporte Técnico */}
          <button
            onClick={onOpenSupport}
            className={`
              w-full flex items-center rounded-xl py-2.5 px-3 text-xs font-semibold
              transition-all duration-200 group text-purple-200/80 hover:text-white hover:bg-[#180d2c] border border-transparent
              ${collapsed ? 'justify-center' : 'justify-between'}
            `}
            title="Soporte Técnico & Tickets"
          >
            <div className="flex items-center gap-3 truncate">
              <LifeBuoy className="w-4 h-4 shrink-0 text-purple-400 group-hover:text-emerald-400 transition-colors" />
              {!collapsed && <span className="truncate">Soporte Técnico</span>}
            </div>
            {!collapsed && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                SLA &lt;4h
              </span>
            )}
          </button>

          {/* Pasarelas de Pago */}
          {onOpenPaymentSettings && (
            <button
              onClick={onOpenPaymentSettings}
              className={`
                w-full flex items-center rounded-xl py-2.5 px-3 text-xs font-semibold
                transition-all duration-200 group text-purple-200/80 hover:text-white hover:bg-[#180d2c] border border-transparent
                ${collapsed ? 'justify-center' : 'justify-start gap-3'}
              `}
              title="Pasarelas & URLs de Pago"
            >
              <CreditCard className="w-4 h-4 shrink-0 text-purple-400 group-hover:text-emerald-400 transition-colors" />
              {!collapsed && <span className="truncate">Pasarelas de Pago</span>}
            </button>
          )}

          {/* Panel Administrativo (Staff Autorizado) */}
          {staff && (
            <Link
              href="/admin"
              className={`
                w-full flex items-center rounded-xl py-2.5 px-3 text-xs font-semibold
                transition-all duration-200 group relative
                ${
                  isAdminActive
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/30 border border-transparent'
                }
                ${collapsed ? 'justify-center' : 'justify-between'}
              `}
              title="Panel Administrativo (Staff)"
            >
              <div className="flex items-center gap-3 truncate">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                {!collapsed && <span className="truncate">Panel Administrativo</span>}
              </div>
              {!collapsed && (
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-400 uppercase">
                  Staff
                </span>
              )}
            </Link>
          )}

          {/* Sitio Principal */}
          <Link
            href="/"
            className={`
              w-full flex items-center rounded-xl py-2 px-3 text-xs text-purple-300/60 hover:text-purple-200 hover:bg-[#180d2c]/60 transition-colors
              ${collapsed ? 'justify-center' : 'justify-start gap-3'}
            `}
            title="Ir a Inicio"
          >
            <Zap className="w-3.5 h-3.5 shrink-0 text-purple-400/70" />
            {!collapsed && <span className="truncate">Sitio Principal</span>}
          </Link>
        </div>

        {/* Desktop Footer (TPS & User Profile) */}
        <div className="p-3 border-t border-[#261442]/80 space-y-2">
          {!collapsed ? (
            <div className="p-2 rounded-xl bg-[#08050E] border border-[#261442] flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                20.0 TPS
              </span>
              <span className="text-purple-400/80 text-[10px]">Paper 1.21.x</span>
            </div>
          ) : (
            <div
              className="w-8 h-8 mx-auto rounded-lg bg-[#08050E] border border-[#261442] flex items-center justify-center cursor-pointer"
              title="Sistema Online 20.0 TPS (Clic para expandir)"
              onClick={() => setCollapsed(false)}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}

          {user && (
            <div
              className={`flex items-center gap-2 p-1.5 rounded-xl bg-[#08050E]/60 border border-[#261442]/60 ${
                collapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-[#C084FC]/30 flex items-center justify-center text-[10px] font-bold text-[#C084FC] overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/embed/avatars/${user.username.length % 5}.png`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.username.substring(0, 2).toUpperCase()
                  )}
                </div>
                {!collapsed && (
                  <div className="truncate min-w-0">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">
                      {user.global_name || user.username}
                    </div>
                    <div className="text-[9px] font-mono text-[#C084FC] uppercase truncate">
                      {user.role}
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-950/40 transition-colors shrink-0"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE TRIGGER BUTTON (Pill flotante en esquina móvil) */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C084FC] hover:bg-purple-300 text-black font-bold text-xs shadow-[0_0_25px_rgba(192,132,252,0.4)] transition-all active:scale-95"
          aria-label="Abrir menú del portal"
        >
          <Menu className="w-4 h-4" />
          <span>Menú Portal</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE DRAWER (Portal independiente a pantalla completa) */}
      {/* ========================================================= */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          />

          {/* Drawer Lateral */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#120A21] border-r border-[#261442] shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col justify-between p-5 overflow-y-auto z-50 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header con botón de cerrar visible */}
              <div className="flex items-center justify-between pb-4 border-b border-[#261442] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-tight">
                      Synthetix<span className="text-[#C084FC]">Portal</span>
                    </div>
                    <div className="text-[10px] text-purple-300/60 font-mono">
                      Menú de Navegación
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeMobile}
                  className="p-2 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442] transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Botón Nueva Solicitud */}
              {onOpenNewProject && (
                <button
                  onClick={() => {
                    closeMobile();
                    onOpenNewProject();
                  }}
                  className="w-full mb-4 py-3 px-4 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white text-xs font-bold shadow-[0_0_20px_rgba(192,132,252,0.3)] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Solicitud</span>
                </button>
              )}

              {/* Enlaces de Navegación */}
              <div className="space-y-1.5">
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className={`w-full flex items-center justify-between rounded-xl py-2.5 px-3 text-xs font-semibold transition-colors ${
                    isProjectsActive
                      ? 'bg-[#C084FC]/15 text-[#C084FC] border border-[#C084FC]/40 font-bold'
                      : 'text-purple-200 hover:bg-[#180d2c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className="w-4 h-4 text-[#C084FC]" />
                    <span>Mis Proyectos</span>
                  </div>
                  {projectsCount > 0 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-[#C084FC]/30 text-[#C084FC]">
                      {projectsCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => {
                    closeMobile();
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-xs font-semibold text-purple-200 hover:bg-[#180d2c] transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Configuración de Cuenta</span>
                </button>

                <button
                  onClick={() => {
                    closeMobile();
                    onOpenSupport();
                  }}
                  className="w-full flex items-center justify-between rounded-xl py-2.5 px-3 text-xs font-semibold text-purple-200 hover:bg-[#180d2c] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LifeBuoy className="w-4 h-4 text-purple-400" />
                    <span>Soporte Técnico</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    SLA &lt;4h
                  </span>
                </button>

                {onOpenPaymentSettings && (
                  <button
                    onClick={() => {
                      closeMobile();
                      onOpenPaymentSettings();
                    }}
                    className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-xs font-semibold text-purple-200 hover:bg-[#180d2c] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span>Pasarelas de Pago</span>
                  </button>
                )}

                {staff && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className={`w-full flex items-center justify-between rounded-xl py-2.5 px-3 text-xs font-semibold transition-colors ${
                      isAdminActive
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-amber-300 hover:bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Panel Administrativo</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950 border border-amber-500/50 px-1.5 py-0.2 rounded">
                      Staff
                    </span>
                  </Link>
                )}

                <Link
                  href="/"
                  onClick={closeMobile}
                  className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-xs text-purple-300/70 hover:bg-[#180d2c] transition-colors"
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Sitio Principal</span>
                </Link>
              </div>
            </div>

            {/* Footer Móvil */}
            <div className="pt-4 border-t border-[#261442] space-y-3">
              <div className="p-2.5 rounded-xl bg-[#08050E] border border-[#261442] flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  20.0 TPS ONLINE
                </span>
                <span className="text-purple-400 text-[10px]">Paper 1.21.x</span>
              </div>

              {user && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#08050E] border border-[#261442]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-[#C084FC]/30 flex items-center justify-center text-xs font-bold text-[#C084FC] shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={`https://cdn.discordapp.com/embed/avatars/${user.username.length % 5}.png`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user.username.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">
                        {user.global_name || user.username}
                      </div>
                      <div className="text-[10px] font-mono text-[#C084FC] uppercase truncate">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeMobile();
                      onLogout();
                    }}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
