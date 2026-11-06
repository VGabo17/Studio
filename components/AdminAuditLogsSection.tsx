'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog, AuditLogAction } from '@/lib/types';
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Tag,
  UserCheck,
  FolderPlus,
  ShieldAlert,
  Clock,
  Layers,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';

interface AuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ACTION_CONFIG: Record<
  AuditLogAction,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgAccent: string;
    borderAccent: string;
  }
> = {
  STATUS_CHANGE: {
    label: 'Cambio de Estado',
    icon: CheckCircle2,
    accentColor: 'text-emerald-400',
    bgAccent: 'bg-emerald-950/40',
    borderAccent: 'border-emerald-500/30',
  },
  DELIVERY_UPLOAD: {
    label: 'Subida de Archivo',
    icon: UploadCloud,
    accentColor: 'text-[#C084FC]',
    bgAccent: 'bg-purple-950/40',
    borderAccent: 'border-[#C084FC]/30',
  },
  PRICE_UPDATE: {
    label: 'Ajuste de Tarifa',
    icon: DollarSign,
    accentColor: 'text-amber-400',
    bgAccent: 'bg-amber-950/40',
    borderAccent: 'border-amber-500/30',
  },
  PROGRESS_UPDATE: {
    label: 'Progreso de Obra',
    icon: TrendingUp,
    accentColor: 'text-cyan-400',
    bgAccent: 'bg-cyan-950/40',
    borderAccent: 'border-cyan-500/30',
  },
  RATE_UPDATE: {
    label: 'Tarifa Oficial',
    icon: Tag,
    accentColor: 'text-fuchsia-400',
    bgAccent: 'bg-fuchsia-950/40',
    borderAccent: 'border-fuchsia-500/30',
  },
  PROJECT_ASSIGNMENT: {
    label: 'Asignación Staff',
    icon: UserCheck,
    accentColor: 'text-blue-400',
    bgAccent: 'bg-blue-950/40',
    borderAccent: 'border-blue-500/30',
  },
  PROJECT_CREATE: {
    label: 'Nuevo Proyecto',
    icon: FolderPlus,
    accentColor: 'text-violet-400',
    bgAccent: 'bg-violet-950/40',
    borderAccent: 'border-violet-500/30',
  },
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Founder & Admin',
  developer_senior: 'Senior Dev',
  developer_junior: 'Junior Dev',
  support: 'Soporte',
  client: 'Cliente',
};

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 30) return `hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function AdminAuditLogsSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);
  const deferredSearch = React.useDeferredValue(searchTerm);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchAuditData() {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '6',
          action: selectedAction,
          search: deferredSearch,
        });
        const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
        if (!ignore && res.ok) {
          const data: AuditLogsResponse = await res.json();
          if (data.success) {
            setLogs(data.logs);
            setTotal(data.total);
            setTotalPages(data.totalPages);
          }
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAuditData();
    return () => {
      ignore = true;
    };
  }, [currentPage, selectedAction, deferredSearch, refreshTrigger]);

  const handleActionFilter = (action: string) => {
    setSelectedAction(action);
    setCurrentPage(1);
    setLoading(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setLoading(true);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setLoading(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="mb-10 rounded-2xl bg-[#120A21] border border-[#261442] overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="p-5 border-b border-[#261442] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C084FC]" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Logs de Auditoría y Acciones de Staff
            </h3>
          </div>
          <p className="text-xs text-purple-300/70 mt-0.5">
            Trazabilidad de cambios de estado, publicaciones de builds, fijación de tarifas y asignaciones
          </p>
        </div>

        {/* Search & Refresh Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-purple-400/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar staff, proyecto o acción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setLoading(true);
              }}
              className="pl-8 pr-7 py-1.5 rounded-xl bg-[#08050E] border border-[#261442] text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] transition-colors w-52 sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  setLoading(true);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            title="Recargar logs"
            disabled={loading}
            className="p-2 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/50 text-purple-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C084FC]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs (Interactive Filter Controls) */}
      <div className="px-5 py-3 border-b border-[#261442]/60 bg-[#08050E]/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono text-purple-400/60 mr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" />
          <span>Filtrar:</span>
        </span>

        {[
          { id: 'ALL', label: 'Todas las Acciones' },
          { id: 'STATUS_CHANGE', label: 'Estados' },
          { id: 'DELIVERY_UPLOAD', label: 'Subidas de Archivo' },
          { id: 'PRICE_UPDATE', label: 'Tarifas & Precios' },
          { id: 'PROGRESS_UPDATE', label: 'Progreso' },
          { id: 'PROJECT_ASSIGNMENT', label: 'Asignaciones' },
          { id: 'RATE_UPDATE', label: 'Tarifas Oficiales' },
        ].map((tab) => {
          const isActive = selectedAction === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleActionFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-purple-950/80 text-[#C084FC] border border-[#C084FC]/40 shadow-sm'
                  : 'text-purple-300/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List Content */}
      <div className="divide-y divide-[#261442]/60">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-purple-300/60 font-mono flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#C084FC]" />
            <span>Consultando registro criptográfico de auditoría...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-purple-300/60 font-mono">
            No se encontraron logs de auditoría para los criterios seleccionados.
          </div>
        ) : (
          logs.map((log) => {
            const config = ACTION_CONFIG[log.action] || {
              label: log.action,
              icon: FileText,
              accentColor: 'text-purple-400',
              bgAccent: 'bg-purple-950/40',
              borderAccent: 'border-purple-500/30',
            };
            const ActionIcon = config.icon;
            const staffRole = log.user?.role ? ROLE_LABELS[log.user.role] || log.user.role : 'Staff';

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-[#180d2c]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Staff Identity + Action Icon + Description */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Action Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl ${config.bgAccent} border ${config.borderAccent} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <ActionIcon className={`w-4 h-4 ${config.accentColor}`} />
                  </div>

                  {/* Text details */}
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      {/* Staff Member Info (Zero Pill Discipline: Clean inline text with separators) */}
                      <span className="font-bold text-white tracking-tight">
                        {log.user?.global_name || log.user?.username || 'Staff Autorizado'}
                      </span>
                      <span className="text-[11px] font-mono text-purple-400">({staffRole})</span>
                      <span className="text-purple-500/60" aria-hidden="true">·</span>
                      <span className={`text-[11px] font-semibold font-mono ${config.accentColor}`}>
                        {config.label}
                      </span>
                      {log.project_id && (
                        <>
                          <span className="text-purple-500/60" aria-hidden="true">·</span>
                          <span className="text-[11px] font-mono text-purple-300/80">
                            {log.project_id}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Main Description */}
                    <div className="text-xs text-purple-200 mt-1 break-words">
                      {log.details}
                    </div>

                    {/* Quiet metadata footer */}
                    <div className="flex items-center gap-2 text-[10px] text-purple-400/60 font-mono mt-1.5">
                      {log.project_title && (
                        <>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{log.project_title}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span title={log.created_at}>{formatRelativeTime(log.created_at)}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>ID: {log.id}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Inspect Action Button */}
                <div className="flex items-center gap-2 shrink-0 sm:self-center pl-12 sm:pl-0">
                  <button
                    onClick={() => setInspectLog(log)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/40 text-purple-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Inspeccionar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#261442] bg-[#08050E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-purple-300/70 font-mono text-[11px]">
          Mostrando <span className="text-white font-bold">{logs.length}</span> de{' '}
          <span className="text-white font-bold">{total}</span> eventos registrados
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/40 text-purple-200 hover:text-white disabled:opacity-40 disabled:hover:border-[#261442] transition-colors flex items-center gap-1 text-xs font-mono"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <span className="px-3 py-1 font-mono text-[11px] text-[#C084FC] bg-purple-950/60 border border-[#C084FC]/30 rounded-lg">
            Pág {currentPage} de {Math.max(1, totalPages)}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg bg-[#120A21] border border-[#261442] hover:border-[#C084FC]/40 text-purple-200 hover:text-white disabled:opacity-40 disabled:hover:border-[#261442] transition-colors flex items-center gap-1 text-xs font-mono"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inspect Log Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#120A21] border border-[#261442] shadow-2xl p-6 relative">
            <button
              onClick={() => setInspectLog(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <ShieldAlert className="w-5 h-5 text-[#C084FC]" />
              <h4 className="text-sm font-bold text-white">Detalle de Registro de Auditoría</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#08050E] border border-[#261442]">
                <div className="text-[10px] font-mono text-purple-400 uppercase mb-0.5">Responsable</div>
                <div className="font-semibold text-white">
                  {inspectLog.user?.global_name || inspectLog.user?.username || 'Staff'} (
                  {inspectLog.user?.role ? ROLE_LABELS[inspectLog.user.role] : 'Staff'})
                </div>
                <div className="text-[11px] font-mono text-purple-400/60 mt-0.5">
                  User ID: {inspectLog.user_id}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08050E] border border-[#261442]">
                <div className="text-[10px] font-mono text-purple-400 uppercase mb-0.5">Acción Realizada</div>
                <div className="font-semibold text-white">{inspectLog.details}</div>
                {inspectLog.project_id && (
                  <div className="text-[11px] font-mono text-[#C084FC] mt-1">
                    Proyecto: {inspectLog.project_id} · {inspectLog.project_title}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#08050E] border border-[#261442]">
                <div className="text-[10px] font-mono text-purple-400 uppercase mb-1">Carga de Metadatos (JSON)</div>
                <pre className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-purple-300 overflow-x-auto">
                  {JSON.stringify(
                    {
                      id: inspectLog.id,
                      action: inspectLog.action,
                      timestamp: inspectLog.created_at,
                      metadata: inspectLog.metadata || {},
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-purple-400/60 pt-2">
                <span>Timestamp ISO:</span>
                <span className="text-white">{new Date(inspectLog.created_at).toLocaleString('es-ES')}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 rounded-xl bg-[#08050E] border border-[#261442] hover:border-[#C084FC]/50 text-xs text-white font-medium transition-colors"
              >
                Cerrar Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
