'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { DeliveryUploaderModal } from '@/components/DeliveryUploaderModal';
import { DiscordEmbedAuditModal } from '@/components/DiscordEmbedAuditModal';
import { Project, ProjectStatus, ServiceRate, User, UserRole } from '@/lib/types';
import {
  isStaff,
  canCompleteProject,
  canUploadDeliveries,
  canSetPrice,
  canUpdateProgress,
} from '@/lib/permissions';
import {
  Shield,
  UploadCloud,
  Sliders,
  DollarSign,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Loader2,
  Terminal,
  Server,
  Bot,
  MessageSquare,
  Lock,
  ArrowLeft,
  Tag,
  Save,
  X,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; border: string; bg: string }
> = {
  pending: {
    label: 'Pendiente',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-950/40',
  },
  in_development: {
    label: 'En Desarrollo',
    color: 'text-[#C084FC]',
    border: 'border-[#C084FC]/40',
    bg: 'bg-purple-950/40',
  },
  testing: {
    label: 'En Pruebas (QA)',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/40',
  },
  completed: {
    label: 'Completado',
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

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedProjectIdForUpload, setSelectedProjectIdForUpload] = useState<string | undefined>();
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [ratesModalOpen, setRatesModalOpen] = useState(false);

  // Modal de edición de proyecto
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectStatus>('in_development');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Edición de tarifas oficiales
  const [editingRate, setEditingRate] = useState<ServiceRate | null>(null);
  const [ratePriceInput, setRatePriceInput] = useState<string>('');
  const [rateDeliveryInput, setRateDeliveryInput] = useState<string>('');
  const [savingRate, setSavingRate] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(authData.user);

      if (isStaff(authData.user.role)) {
        const [prjRes, ratesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/admin/rates'),
        ]);
        const prjData = await prjRes.json();
        const ratesData = await ratesRes.json();
        if (prjData.success) {
          setProjects(prjData.projects);
        }
        if (ratesData.success) {
          setRates(ratesData.rates);
        }
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
          setLoading(false);
          return;
        }
        setUser(authData.user);

        if (isStaff(authData.user.role)) {
          const [prjRes, ratesRes] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/admin/rates'),
          ]);
          const prjData = await prjRes.json();
          const ratesData = await ratesRes.json();
          if (active) {
            if (prjData.success) setProjects(prjData.projects);
            if (ratesData.success) setRates(ratesData.rates);
          }
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

  const handleSwitchPersona = async (role: UserRole) => {
    await fetch('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: role }),
    });
    fetchAdminData();
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setEditStatus(project.status);
    setEditProgress(project.progress);
    setEditPrice(project.price ? project.price.toString() : '');
  };

  const handleOpenRateEdit = (rate: ServiceRate) => {
    setEditingRate(rate);
    setRatePriceInput(rate.base_price.toString());
    setRateDeliveryInput(rate.delivery_time);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    setSavingRate(true);
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: editingRate.service_type,
          base_price: parseFloat(ratePriceInput),
          delivery_time: rateDeliveryInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar tarifa');
      }

      setRates((prev) =>
        prev.map((r) => (r.service_type === editingRate.service_type ? data.rate : r))
      );
      setEditingRate(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar tarifa');
    } finally {
      setSavingRate(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          progress: Number(editProgress),
          price: editPrice ? parseFloat(editPrice) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar proyecto');
      }

      setEditingProject(null);
      fetchAdminData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setSavingEdit(false);
    }
  };

  const userRole = user?.role || 'client';
  const staffMember = isStaff(userRole);
  const canComplete = canCompleteProject(userRole);
  const canUpload = canUploadDeliveries(userRole);
  const canPrice = canSetPrice(userRole);

  const totalRevenue = projects.reduce((acc, p) => acc + (p.price || 0), 0);
  const totalDeliveries = projects.reduce((acc, p) => acc + (p.deliveries?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col selection:bg-[#C084FC]/30 selection:text-white">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchPersona={handleSwitchPersona}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!staffMember ? (
          <div className="p-12 rounded-3xl bg-[#120A21] border border-red-500/30 text-center max-w-lg mx-auto shadow-[0_0_35px_rgba(239,68,68,0.15)] my-12">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">403 · Acceso Administrativo Restringido</h2>
            <p className="text-xs text-purple-300/70 mb-6 leading-relaxed">
              Este portal técnico está estrictamente restringido a desarrolladores y administradores autorizados mediante Discord OAuth2 y claves de sesión encriptadas.
            </p>
            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#261442] hover:bg-[#3b1a6b] text-purple-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a mi Portal de Cliente
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#261442]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Panel de Gestión & Staff del Estudio
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-300/70">
                  <span>Tu rol activo:</span>
                  <span className="font-mono font-bold text-[#C084FC] uppercase bg-[#120A21] px-2 py-0.5 rounded border border-[#261442]">
                    {userRole}
                  </span>
                  <span>·</span>
                  <span>Permisos granulares en vigor</span>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-3">
                {canPrice && (
                  <button
                    onClick={() => setRatesModalOpen(true)}
                    className="px-4 py-2.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Editar Tarifas del Catálogo
                  </button>
                )}
                <button
                  onClick={() => setAuditModalOpen(true)}
                  className="px-4 py-2.5 bg-[#261442] hover:bg-[#341b5a] text-purple-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#C084FC]" />
                  Auditoría Webhooks (#C084FC)
                </button>
                {canUpload && (
                  <button
                    onClick={() => {
                      setSelectedProjectIdForUpload(projects[0]?.id);
                      setUploaderOpen(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Subir Build
                  </button>
                )}
              </div>
            </div>

            {/* Studio Revenue & Ops KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
              <div className="p-5 rounded-2xl bg-[#120A21] border border-[#261442]">
                <div className="text-xs font-medium text-purple-400 mb-1">Volumen Acordado</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  ${totalRevenue.toLocaleString()} USD
                </div>
                <div className="text-[11px] text-purple-300/60 mt-1">Total de proyectos registrados</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#120A21] border border-[#261442]">
                <div className="text-xs font-medium text-purple-400 mb-1">Proyectos Totales</div>
                <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                  {projects.length}
                </div>
                <div className="text-[11px] text-purple-300/60 mt-1">Trabajos gestionados</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#120A21] border border-[#261442]">
                <div className="text-xs font-medium text-purple-400 mb-1">Builds Publicadas</div>
                <div className="text-2xl font-extrabold text-[#C084FC] font-mono tabular-nums">
                  {totalDeliveries}
                </div>
                <div className="text-[11px] text-purple-300/60 mt-1">Archivos .jar y .zip seguros</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#120A21] border border-[#261442]">
                <div className="text-xs font-medium text-purple-400 mb-1">Sistema de Roles</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  Granular
                </div>
                <div className="text-[11px] text-purple-300/60 mt-1">5 niveles de privilegios</div>
              </div>
            </div>

            {/* Master Table of Studio Projects */}
            <div className="rounded-2xl bg-[#120A21] border border-[#261442] overflow-hidden shadow-xl">
              <div className="p-5 border-b border-[#261442] flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Tabla Maestra de Pedidos</h3>
                <span className="text-xs font-mono text-purple-400">{projects.length} registrados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#261442] bg-[#08050E]/60 text-purple-400 uppercase font-mono text-[10px]">
                      <th className="p-4">ID</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Título & Servicio</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Progreso</th>
                      <th className="p-4">Tarifa</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#261442]/60">
                    {projects.map((p) => {
                      const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={p.id} className="hover:bg-[#180d2c]/60 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#C084FC] whitespace-nowrap">
                            {p.id}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="font-semibold text-white">
                              {p.client?.global_name || p.client?.username || p.client_id}
                            </div>
                            <div className="text-[10px] text-purple-400/60 font-mono">
                              {p.client_id}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white max-w-xs truncate">{p.title}</div>
                            <div className="text-[11px] text-purple-300/70 font-mono">
                              {p.service_type}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] border font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-[#08050E] overflow-hidden border border-[#261442]">
                                <div
                                  className="h-full bg-gradient-to-r from-[#9333EA] to-[#C084FC]"
                                  style={{ width: `${p.progress}%` }}
                                />
                              </div>
                              <span className="font-mono text-purple-300 tabular-nums">
                                {p.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-emerald-400 font-semibold whitespace-nowrap">
                            {p.price ? `$${p.price} USD` : '—'}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#261442] hover:bg-[#C084FC] hover:text-black text-purple-200 transition-colors flex items-center gap-1 font-medium"
                                title="Editar estado y progreso"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Ajustar</span>
                              </button>
                              {canUpload && (
                                <button
                                  onClick={() => {
                                    setSelectedProjectIdForUpload(p.id);
                                    setUploaderOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#261442] hover:bg-[#C084FC] hover:text-black text-purple-200 transition-colors flex items-center gap-1 font-medium"
                                  title="Subir entrega"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>Build</span>
                                </button>
                              )}
                              <Link
                                href={`/dashboard/project/${p.id}`}
                                className="p-1.5 rounded-lg hover:bg-[#261442] text-purple-400 hover:text-white transition-colors"
                                title="Ver vista detallada y chat"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Project Modal */}
            {editingProject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="relative w-full max-w-md bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden">
                  <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#C084FC]" />
                        Gestionar {editingProject.id}
                      </h2>
                      <p className="text-xs text-purple-300/70 truncate max-w-xs">
                        {editingProject.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProject} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-purple-200 mb-1.5">
                        Estado de Desarrollo
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                        className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white focus:outline-none focus:border-[#C084FC]"
                      >
                        <option value="pending">⏳ Pendiente de Aprobación</option>
                        <option value="in_development">🛠️ En Desarrollo Activo</option>
                        <option value="testing">🧪 Fase de Pruebas (QA)</option>
                        <option value="completed" disabled={!canComplete}>
                          {canComplete ? '✅ Completado & Entregado' : '🔒 Completado (Solo Dev Senior / Admin)'}
                        </option>
                        <option value="cancelled" disabled={userRole !== 'admin'}>
                          {userRole === 'admin' ? '❌ Cancelado' : '🔒 Cancelado (Solo Admin)'}
                        </option>
                      </select>
                      {!canComplete && editStatus === 'completed' && (
                        <p className="text-[10px] text-amber-400 mt-1">
                          * Requiere rol Developer Senior o Admin para marcar como completado.
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-purple-200">
                          Progreso del Proyecto
                        </label>
                        <span className="text-xs font-mono font-bold text-[#C084FC] tabular-nums">
                          {editProgress}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={userRole === 'developer_junior' ? 85 : 100}
                        value={editProgress}
                        onChange={(e) => setEditProgress(Number(e.target.value))}
                        className="w-full accent-[#C084FC] bg-[#08050E] h-2 rounded-lg cursor-pointer"
                      />
                      {userRole === 'developer_junior' && (
                        <p className="text-[10px] text-cyan-400 mt-1">
                          * Como Developer Junior tu límite de avance es 85% (Fase de Pruebas).
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-purple-200 mb-1.5 flex items-center justify-between">
                        <span>Tarifa Acordada (USD)</span>
                        {!canPrice && <span className="text-[10px] text-purple-400 font-mono">Solo lectura (Admin)</span>}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        disabled={!canPrice}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Ej. 45"
                        className={`w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C084FC] ${
                          !canPrice ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-[#261442]">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="px-5 py-2.5 bg-[#C084FC] hover:bg-purple-300 text-black font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                      >
                        {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de Tarifas Oficiales del Catálogo */}
            {ratesModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#120A21] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 text-purple-200 shadow-[0_0_40px_rgba(245,158,11,0.2)] max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-[#261442] mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Tarifas & Catálogo Oficial</h3>
                        <p className="text-xs text-purple-300/70">
                          Modifica los precios base y tiempos de entrega que se muestran a los clientes.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setRatesModalOpen(false);
                        setEditingRate(null);
                      }}
                      className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-[#261442] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {rates.map((rate) => {
                      const isEditingThis = editingRate?.service_type === rate.service_type;

                      return (
                        <div
                          key={rate.service_type}
                          className="p-4 rounded-xl bg-[#08050E] border border-[#261442] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                {rate.service_type}
                              </span>
                              <h4 className="text-sm font-bold text-white">{rate.name}</h4>
                            </div>
                            <p className="text-xs text-purple-300/70">{rate.description}</p>
                            <div className="text-[11px] text-purple-400 font-mono mt-1">
                              Entrega: {rate.delivery_time}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isEditingThis ? (
                              <form onSubmit={handleSaveRate} className="flex items-center gap-2">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-xs font-mono text-purple-400">$</span>
                                  <input
                                    type="number"
                                    min="5"
                                    max="5000"
                                    value={ratePriceInput}
                                    onChange={(e) => setRatePriceInput(e.target.value)}
                                    className="w-20 pl-6 pr-2 py-1.5 rounded-lg bg-[#120A21] border border-amber-500 text-xs font-mono font-bold text-white focus:outline-none"
                                    required
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={rateDeliveryInput}
                                  onChange={(e) => setRateDeliveryInput(e.target.value)}
                                  className="w-24 px-2 py-1.5 rounded-lg bg-[#120A21] border border-amber-500 text-xs text-white focus:outline-none"
                                  placeholder="Tiempo"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={savingRate}
                                  className="p-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                                  title="Guardar"
                                >
                                  {savingRate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRate(null)}
                                  className="p-2 rounded-lg bg-[#261442] text-purple-300 hover:text-white transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-extrabold text-emerald-400 font-mono">
                                    ${rate.base_price} USD
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleOpenRateEdit(rate)}
                                  className="px-3 py-1.5 rounded-lg bg-[#261442] hover:bg-amber-400 hover:text-black text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                                >
                                  <Sliders className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#261442] flex justify-end">
                    <button
                      onClick={() => {
                        setRatesModalOpen(false);
                        setEditingRate(null);
                      }}
                      className="px-4 py-2 bg-[#261442] hover:bg-[#341b5a] text-purple-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Cerrar Panel de Tarifas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={fetchAdminData}
      />
      <DeliveryUploaderModal
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        projects={projects}
        defaultProjectId={selectedProjectIdForUpload}
        onSuccess={fetchAdminData}
      />
      <DiscordEmbedAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
