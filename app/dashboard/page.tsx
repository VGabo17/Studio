'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { AccountSettingsModal } from '@/components/AccountSettingsModal';
import { SupportModal } from '@/components/SupportModal';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { DiscordEmbedAuditModal } from '@/components/DiscordEmbedAuditModal';
import { PaymentSettingsModal } from '@/components/PaymentSettingsModal';
import { Project, ProjectStatus, User, UserRole } from '@/lib/types';
import {
  Terminal,
  Server,
  Bot,
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Send,
  Loader2,
  Shield,
  Globe,
  Code2,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; border: string; bg: string }
> = {
  pending: {
    label: 'Pendiente de Aprobación',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-950/40',
  },
  in_development: {
    label: 'En Desarrollo Activo',
    color: 'text-[#C084FC]',
    border: 'border-[#C084FC]/40',
    bg: 'bg-purple-950/40',
  },
  testing: {
    label: 'Fase de Pruebas (QA)',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/40',
  },
  completed: {
    label: 'Completado & Entregado',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/40',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-950/40',
  },
};

const SERVICE_CONFIG: Record<string, { name: string; icon: React.ElementType }> = {
  plugin_mc: { name: 'Plugin Minecraft a Medida', icon: Terminal },
  setup_mc: { name: 'Setup Servidor Minecraft', icon: Server },
  setup_dc: { name: 'Setup Servidor Discord', icon: Shield },
  web_portfolio: { name: 'Web Portafolio Personalizada', icon: Globe },
  bot_discord: { name: 'Bot de Discord a tu Gusto', icon: Bot },
  full_pack: { name: 'Pack Completo Network', icon: Layers },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [paymentSettingsModalOpen, setPaymentSettingsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        setUser(null);
        setAuthModalOpen(true);
        setLoading(false);
        return;
      }
      setUser(authData.user);

      const prjRes = await fetch('/api/projects');
      const prjData = await prjRes.json();
      if (prjData.success) {
        setProjects(prjData.projects);
      }
    } catch {
      // Ignorar error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (!active) return;
        if (!authData.authenticated) {
          setUser(null);
          setAuthModalOpen(true);
          setLoading(false);
          return;
        }
        setUser(authData.user);

        const prjRes = await fetch('/api/projects');
        const prjData = await prjRes.json();
        if (active && prjData.success) {
          setProjects(prjData.projects);
        }
      } catch {
        // Ignorar error
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const activeProjectsCount = projects.filter(
    (p) => p.status === 'in_development' || p.status === 'testing'
  ).length;
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const totalDeliveries = projects.reduce((acc, p) => acc + (p.deliveries?.length || 0), 0);

  const filteredProjects = projects.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col selection:bg-[#C084FC]/30 selection:text-white">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNewProject={() => setNewProjectModalOpen(true)}
      />

      {/* Security Status Ribbon (Modrinth / Gaming Tech Style) */}
      <div className="w-full bg-[#120A21]/70 border-b border-[#261442] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-300/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-purple-200">
              CONEXIÓN SEGURA · SSL / SHA-256 · CLIENT PORTAL SYNTHETIX
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-purple-400/80">
            <span>Usuario: <strong className="text-white font-semibold">{user?.username || 'Gamer'}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Rol Verificado: <strong className="text-[#C084FC] uppercase">{user?.role || 'client'}</strong></span>
            {user && (user.role === 'admin' || user.role === 'developer_senior') && (
              <Link
                href="/admin"
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                Panel Staff
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Body with Responsive Collapsible Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full min-h-[calc(100vh-4.5rem)]">
        <DashboardSidebar
          user={user}
          projectsCount={projects.length}
          onOpenNewProject={() => setNewProjectModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenSupport={() => setSupportModalOpen(true)}
          onOpenPaymentSettings={() => setPaymentSettingsModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 min-w-0">
        {/* Welcome Banner & KPI Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#261442]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-[#C084FC]/50 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(192,132,252,0.3)]">
              {user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/embed/avatars/${(user.username.length % 5)}.png`}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Terminal className="w-7 h-7 text-[#C084FC]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hola, {user?.global_name || user?.username || 'Gamer'}
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C084FC]/10 border border-[#C084FC]/30 text-[#C084FC]">
                  {user?.role === 'admin' ? 'Studio Lead' : 'Client Portal'}
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mt-1">
                Panel centralizado para el seguimiento técnico de tus plugins y configuraciones.
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewProjectModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Crear Nueva Solicitud
          </button>
        </div>

        {/* 3 Metrics Cards with Framer Motion hover scale & shadow glow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <motion.div
            whileHover={{ scale: 1.025, y: -3 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-5 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/60 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-medium">Proyectos en Desarrollo</span>
              <Clock className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {activeProjectsCount}
            </div>
            <div className="text-[11px] text-purple-300/60 mt-1">
              Monitoreo de avance y sprints
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.025, y: -3 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-5 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-medium">Proyectos Finalizados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {completedProjectsCount}
            </div>
            <div className="text-[11px] text-purple-300/60 mt-1">
              Versiones estables y garantizadas
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.025, y: -3 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="p-5 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/60 hover:shadow-[0_0_30px_rgba(192,132,252,0.35)] transition-all cursor-default"
          >
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-medium">Builds & Entregas Seguras</span>
              <Download className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div className="text-3xl font-extrabold text-[#C084FC] font-mono tabular-nums">
              {totalDeliveries}
            </div>
            <div className="text-[11px] text-purple-300/60 mt-1">
              Binarios .jar y configuraciones .zip
            </div>
          </motion.div>
        </div>

        {/* Project Section Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Tus Proyectos y Pedidos</h2>
            <p className="text-xs text-purple-300/70">
              {user?.role === 'admin'
                ? 'Mostrando todos los pedidos del estudio (Modo Admin activo)'
                : 'Accede al hilo técnico, changelogs y descargas de tus builds'}
            </p>
          </div>

          {/* Segmented Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#120A21] border border-[#261442] rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#C084FC] text-black font-semibold'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              Todos ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_development')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'in_development'
                  ? 'bg-[#C084FC] text-black font-semibold'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              En Desarrollo
            </button>
            <button
              onClick={() => setStatusFilter('testing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'testing'
                  ? 'bg-[#C084FC] text-black font-semibold'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              En Pruebas
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'completed'
                  ? 'bg-[#C084FC] text-black font-semibold'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              Completados
            </button>
          </div>
        </div>

        {/* Projects List / Cards */}
        {loading ? (
          <div className="p-16 text-center text-purple-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#C084FC] mb-3" />
            <p className="text-xs">Cargando proyectos y órdenes activas...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#120A21] border border-[#261442] text-center max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-purple-400/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No se encontraron proyectos</h3>
            <p className="text-xs text-purple-300/70 mb-5">
              No tienes ningún proyecto bajo este filtro actualmente.
            </p>
            <button
              onClick={() => setNewProjectModalOpen(true)}
              className="px-4 py-2 bg-[#C084FC] text-black font-semibold text-xs rounded-xl hover:bg-purple-300 transition-colors"
            >
              Crear Nueva Solicitud
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
              const srvCfg = SERVICE_CONFIG[project.service_type] || SERVICE_CONFIG.plugin_mc;
              const SrvIcon = srvCfg.icon;

              return (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.015, y: -2 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="p-6 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/60 hover:shadow-[0_0_30px_rgba(192,132,252,0.22)] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-xs font-bold text-[#C084FC] bg-[#08050E] px-2.5 py-1 rounded-md border border-[#261442]">
                        {project.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
                        <SrvIcon className="w-3.5 h-3.5 text-purple-400" />
                        {srvCfg.name}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                      {project.price && (
                        <div className="flex items-center gap-1.5 ml-auto lg:ml-0 font-mono">
                          <span className="text-xs text-emerald-400 font-semibold">
                            ${project.price} USD
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full border font-bold ${
                              project.payment_status === 'fully_paid'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                                : project.payment_status === 'deposit_paid'
                                ? 'bg-blue-950/80 text-cyan-400 border-blue-500/30'
                                : 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {project.payment_status === 'fully_paid'
                              ? 'Liquidado'
                              : project.payment_status === 'deposit_paid'
                              ? 'Anticipo 50%'
                              : 'Pendiente'}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">{project.title}</h3>
                    <p className="text-xs text-purple-200/70 line-clamp-2 mb-4 leading-relaxed max-w-3xl">
                      {project.description}
                    </p>

                    {/* Progress Bar Strip */}
                    <div className="max-w-md">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span className="text-purple-300/70">Progreso Técnico</span>
                        <span className="text-[#C084FC] font-bold tabular-nums">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#08050E] border border-[#261442] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#9333EA] to-[#C084FC]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Deliveries Counter */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#261442]">
                    <div className="text-xs text-purple-300/70 flex items-center gap-1.5 font-mono">
                      <FileCode className="w-4 h-4 text-[#C084FC]" />
                      <span>{project.deliveries?.length || 0} build(s) compilada(s)</span>
                    </div>

                    <Link
                      href={`/dashboard/project/${project.id}`}
                      className="px-4 py-2.5 bg-[#261442] hover:bg-[#C084FC] hover:text-black text-purple-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 group whitespace-nowrap"
                    >
                      <span>Gestionar & Descargar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      </div>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={fetchData}
      />
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onSuccess={(id) => {
          router.push(`/dashboard/project/${id}`);
        }}
      />
      <DiscordEmbedAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
      <AccountSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        onUserUpdated={(updatedUser) => setUser(updatedUser)}
      />
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        user={user}
      />
      <PaymentSettingsModal
        isOpen={paymentSettingsModalOpen}
        onClose={() => setPaymentSettingsModalOpen(false)}
        canEdit={user?.role === 'admin'}
      />
    </div>
  );
}
