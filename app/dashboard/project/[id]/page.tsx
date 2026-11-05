'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { ProjectProgressBar } from '@/components/ProjectProgressBar';
import { DeliveryUploaderModal } from '@/components/DeliveryUploaderModal';
import { DiscordEmbedAuditModal } from '@/components/DiscordEmbedAuditModal';
import { Project, ProjectStatus, User } from '@/lib/types';
import {
  ArrowLeft,
  Terminal,
  Server,
  Bot,
  Layers,
  Download,
  Calendar,
  MessageSquare,
  Send,
  UploadCloud,
  FileCode,
  Shield,
  Loader2,
  AlertCircle,
  FileText,
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

const SERVICE_CONFIG = {
  plugin_mc: { name: 'Plugin Paper/Purpur', icon: Terminal },
  setup_mc: { name: 'Setup Servidor', icon: Server },
  bot_discord: { name: 'Bot de Discord', icon: Bot },
  full_pack: { name: 'Full Pack Estudio', icon: Layers },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchProjectData = async () => {
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

      const prjRes = await fetch(`/api/projects/${id}`);
      const prjData = await prjRes.json();
      if (!prjRes.ok || !prjData.success) {
        throw new Error(prjData.error || 'No se pudo cargar el proyecto');
      }
      setProject(prjData.project);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el proyecto');
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

        const prjRes = await fetch(`/api/projects/${id}`);
        const prjData = await prjRes.json();
        if (!active) return;
        if (!prjRes.ok || !prjData.success) {
          throw new Error(prjData.error || 'No se pudo cargar el proyecto');
        }
        setProject(prjData.project);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Error al cargar el proyecto');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const handleSwitchPersona = async (role: 'client' | 'admin') => {
    await fetch('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: role }),
    });
    fetchProjectData();
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar mensaje');
      }
      setCommentText('');
      fetchProjectData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al publicar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C084FC] mb-3" />
        <p className="text-xs text-purple-300/70 font-mono">Consultando datos del proyecto {id}...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col items-center justify-center p-4">
        <div className="p-8 rounded-2xl bg-[#120A21] border border-[#261442] text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">No se pudo acceder al proyecto</h2>
          <p className="text-xs text-purple-300/70 mb-5">{error || 'Proyecto no disponible'}</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#C084FC] text-black font-semibold text-xs rounded-xl"
          >
            Regresar al Portal
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
  const srvCfg = SERVICE_CONFIG[project.service_type] || SERVICE_CONFIG.plugin_mc;
  const SrvIcon = srvCfg.icon;

  return (
    <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col selection:bg-[#C084FC]/30 selection:text-white">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchPersona={handleSwitchPersona}
      />

      {/* Role Switcher Toolbar */}
      <div className="w-full bg-[#120A21]/90 border-b border-[#261442] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-mono">Modo de Vista:</span>
            <span className="text-white font-semibold">
              {user ? (user.role === 'admin' ? '🛡️ Administrador del Estudio' : '👤 Cliente Autenticado') : 'Invitado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchPersona('client')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                user?.role === 'client'
                  ? 'bg-[#C084FC] text-black font-semibold'
                  : 'bg-[#261442] text-purple-300 hover:text-white'
              }`}
            >
              Vista Cliente
            </button>
            <button
              onClick={() => handleSwitchPersona('admin')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                user?.role === 'admin'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-[#261442] text-purple-300 hover:text-white'
              }`}
            >
              Vista Admin (Gestionar todo)
            </button>
            <button
              onClick={() => setAuditModalOpen(true)}
              className="px-2.5 py-1 rounded bg-[#261442] hover:bg-[#341b5a] text-purple-200 transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3 text-[#C084FC]" />
              Ver Webhooks Discord
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Lista de Proyectos
          </Link>
        </div>

        {/* Project Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#120A21] border border-[#261442] mb-8 shadow-[0_0_30px_rgba(192,132,252,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#261442]">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold text-[#C084FC] bg-[#08050E] px-3 py-1 rounded-md border border-[#261442]">
                  {project.id}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
                  <SrvIcon className="w-4 h-4 text-purple-400" />
                  {srvCfg.name}
                </span>
                <span
                  className={`text-xs px-3 py-0.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {project.price && (
                <div className="text-right">
                  <div className="text-[10px] text-purple-400 uppercase font-mono">Costo Acordado</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
                    ${project.price} USD
                  </div>
                </div>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setUploaderOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Subir Entrega R2
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider font-mono mb-2">
              Especificaciones Técnicas del Requerimiento
            </h4>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed whitespace-pre-line bg-[#08050E] p-4 rounded-xl border border-[#261442]">
              {project.description}
            </p>
          </div>
        </div>

        {/* Live Progress Bar Milestone Component */}
        <div className="mb-10">
          <ProjectProgressBar progress={project.progress} status={project.status} />
        </div>

        {/* 2-Column Split: Builds Downloads (R2) + Comments Thread */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Centro de Descargas de Builds (Cloudflare R2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-[#C084FC]" />
                  Centro de Descargas de Builds (Cloudflare R2)
                </h3>
                <p className="text-xs text-purple-300/70">
                  Binarios ejecutables .jar y paquetes .zip listos para instalar con Java 21.
                </p>
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setUploaderOpen(true)}
                  className="text-xs text-[#C084FC] hover:underline flex items-center gap-1 font-semibold"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Subir Build
                </button>
              )}
            </div>

            {project.deliveries && project.deliveries.length > 0 ? (
              <div className="space-y-4">
                {project.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-5 rounded-2xl bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/60 hover:shadow-[0_0_20px_rgba(192,132,252,0.15)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-bold font-mono text-[#C084FC] bg-[#08050E] px-2.5 py-0.5 rounded border border-[#261442]">
                          {delivery.version}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">
                          {delivery.file_name}
                        </span>
                        <span className="text-xs text-purple-400 font-mono tabular-nums">
                          ({formatFileSize(delivery.file_size)})
                        </span>
                      </div>

                      {delivery.changelog && (
                        <div className="mt-2 text-xs text-purple-300/80 bg-[#08050E] p-3 rounded-lg border border-[#261442] font-mono whitespace-pre-line text-[11px] leading-relaxed">
                          {delivery.changelog}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-purple-400/60 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>Key R2: {delivery.file_key}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <a
                        href={`/api/deliveries/download/${delivery.id}`}
                        download
                        className="px-4 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Build</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#120A21] border border-dashed border-[#261442] text-center">
                <FileCode className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white mb-1">Aún no hay builds compiladas</h4>
                <p className="text-xs text-purple-300/60 max-w-sm mx-auto mb-4">
                  El desarrollador asignado subirá los ejecutables .jar y las notas de parche conforme avance el sprint.
                </p>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setUploaderOpen(true)}
                    className="px-4 py-2 bg-[#C084FC] text-black font-semibold text-xs rounded-xl"
                  >
                    Subir la Primera Entrega a R2
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Column 3: Hilo de Mensajes / Feedback Interno */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C084FC]" />
                Feedback & Hilo Interno
              </h3>
              <span className="text-xs text-purple-400 font-mono">
                {project.comments?.length || 0} mensaje(s)
              </span>
            </div>

            {/* Comments List */}
            <div className="p-4 rounded-2xl bg-[#120A21] border border-[#261442] space-y-4 max-h-[480px] overflow-y-auto">
              {project.comments && project.comments.length > 0 ? (
                project.comments.map((comment) => {
                  const isAuthorAdmin = comment.author?.role === 'admin';
                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        isAuthorAdmin
                          ? 'bg-purple-950/30 border-[#C084FC]/30'
                          : 'bg-[#08050E] border-[#261442]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">
                            {comment.author?.global_name || comment.author?.username || 'Usuario'}
                          </span>
                          {isAuthorAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              STUDIO LEAD
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-purple-400/60 font-mono">
                          {new Date(comment.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-purple-200/90 leading-relaxed whitespace-pre-line">
                        {comment.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-purple-400/60">
                  No hay mensajes en este hilo. Deja una consulta o feedback sobre el requerimiento.
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendComment} className="pt-2 border-t border-[#261442]">
                <textarea
                  rows={2}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe una pregunta o feedback técnico..."
                  className="w-full px-3 py-2 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-3.5 py-1.5 bg-[#C084FC] hover:bg-purple-300 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={fetchProjectData}
      />
      <DeliveryUploaderModal
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        projects={[project]}
        defaultProjectId={project.id}
        onSuccess={fetchProjectData}
      />
      <DiscordEmbedAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
