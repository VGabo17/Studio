'use client';

import React, { useState } from 'react';
import { ServiceType } from '@/lib/types';
import { Sparkles, Terminal, Server, Bot, Layers, Loader2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('plugin_mc');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          service_type: serviceType,
          description: description.trim(),
          price: budget ? parseFloat(budget) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al crear la solicitud');
      }

      onSuccess(data.project.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      id: 'plugin_mc' as ServiceType,
      name: 'Plugin Minecraft',
      desc: 'Paper, Purpur, Spigot (Java 21/Kotlin)',
      icon: Terminal,
    },
    {
      id: 'setup_mc' as ServiceType,
      name: 'Setup de Servidor',
      desc: 'BoxPvP, Survival, 20 TPS garantizados',
      icon: Server,
    },
    {
      id: 'bot_discord' as ServiceType,
      name: 'Bot de Discord',
      desc: 'Tickets, embeds y sincronización MC',
      icon: Bot,
    },
    {
      id: 'full_pack' as ServiceType,
      name: 'Full Pack Estudio',
      desc: 'Servidor completo + Plugins + Bot',
      icon: Layers,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden">
        <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-[#C084FC]/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Nueva Solicitud de Proyecto</h2>
              <p className="text-xs text-purple-300/70">Notificación automática al equipo de desarrollo en Discord</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-2">
              Tipo de Servicio Requerido
            </label>
            <div className="grid grid-cols-2 gap-2">
              {services.map((srv) => {
                const Icon = srv.icon;
                const isSelected = serviceType === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setServiceType(srv.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-purple-950/50 border-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.3)] text-white'
                        : 'bg-[#08050E] border-[#261442] hover:border-purple-600/50 text-purple-300/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#C084FC]' : 'text-purple-400'}`} />
                    <div>
                      <div className="text-xs font-semibold">{srv.name}</div>
                      <div className="text-[10px] text-purple-400/60 leading-tight">{srv.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Título del Proyecto / Nombre del Plugin o Servidor
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. UltraEnchants NMS Core o Setup BoxPvP Season 3"
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Especificaciones Técnicas & Requerimientos
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe comandos deseados, versión de Minecraft objetivo (ej. Paper 1.21.4), integraciones con MySQL, PlaceholderAPI, Vault o comandos del bot de Discord..."
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Presupuesto Estimado (USD - Opcional)
            </label>
            <input
              type="number"
              min="10"
              step="5"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ej. 250"
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#261442]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Enviar Solicitud a Synthetix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
