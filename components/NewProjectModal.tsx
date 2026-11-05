'use client';

import React, { useState } from 'react';
import { ServiceType } from '@/lib/types';
import { Sparkles, Terminal, Server, Bot, Layers, Globe, Shield, Loader2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('plugin_mc');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('35');
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

  const services: {
    id: ServiceType;
    name: string;
    desc: string;
    startingRate: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'plugin_mc',
      name: 'Plugin Minecraft a Medida',
      desc: 'Paper, Purpur, Spigot en Java 21 / Kotlin (0 lag)',
      startingRate: 'Desde $25 USD',
      icon: Terminal,
    },
    {
      id: 'setup_mc',
      name: 'Setup Servidor Minecraft',
      desc: 'Survival, BoxPvP, Skyblock, 20.0 TPS estables',
      startingRate: 'Desde $35 USD',
      icon: Server,
    },
    {
      id: 'setup_dc',
      name: 'Setup Servidor Discord',
      desc: 'Estructura de canales, roles y permisos blindados',
      startingRate: 'Desde $15 USD',
      icon: Shield,
    },
    {
      id: 'web_portfolio',
      name: 'Web Portafolio Personalizada',
      desc: 'Web moderna para comunidades gaming y servidores',
      startingRate: 'Desde $40 USD',
      icon: Globe,
    },
    {
      id: 'bot_discord',
      name: 'Bot de Discord a tu Gusto',
      desc: 'Tickets, embeds personalizados, sincronización MC',
      startingRate: 'Desde $20 USD',
      icon: Bot,
    },
    {
      id: 'full_pack',
      name: 'Pack Completo Network',
      desc: 'Servidor + Plugins + Bot Discord + Web',
      startingRate: 'Desde $80 USD',
      icon: Layers,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-[#C084FC]/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Nueva Solicitud de Servicio</h2>
              <p className="text-xs text-purple-300/70">Notificación inmediata al equipo de Synthetix Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-2">
              Selecciona el Servicio Requerido
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((srv) => {
                const Icon = srv.icon;
                const isSelected = serviceType === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      setServiceType(srv.id);
                      if (srv.id === 'plugin_mc') setBudget('25');
                      if (srv.id === 'setup_mc') setBudget('35');
                      if (srv.id === 'setup_dc') setBudget('15');
                      if (srv.id === 'web_portfolio') setBudget('40');
                      if (srv.id === 'bot_discord') setBudget('20');
                      if (srv.id === 'full_pack') setBudget('80');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-purple-950/60 border-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.3)] text-white'
                        : 'bg-[#08050E] border-[#261442] hover:border-purple-600/50 text-purple-300/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#C084FC]' : 'text-purple-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{srv.name}</div>
                      <div className="text-[10px] text-purple-400/60 line-clamp-1">{srv.desc}</div>
                      <div className="text-[10px] font-mono text-[#C084FC] font-bold mt-1">
                        {srv.startingRate}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Título del Proyecto / Nombre del Servidor
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Plugin de Recompensas Personalizado o Setup Servidor BoxPvP"
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Requerimientos y Especificaciones Técnicas
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué funciones deseas: comandos, versión de Minecraft objetivo (ej. Paper 1.21), canales del bot, integración de discord, o secciones de la web..."
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#C084FC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-purple-200 mb-1.5">
              Presupuesto Propuesto (USD)
            </label>
            <input
              type="number"
              min="10"
              step="5"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#C084FC]"
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
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
