'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { User } from '@/lib/types';
import {
  X,
  User as UserIcon,
  Shield,
  Key,
  CheckCircle2,
  Save,
  Loader2,
  Sparkles,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (user: User) => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: AccountSettingsModalProps) {
  const [globalName, setGlobalName] = useState(user?.global_name || user?.username || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global_name: globalName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar cambios');
      }
      onUserUpdated(data.user);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#120A21] border border-[#261442] rounded-3xl shadow-[0_0_50px_rgba(192,132,252,0.25)] p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#261442] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Configuración de Cuenta
              </h2>
              <p className="text-xs text-purple-300/70">
                Perfil de cliente y credenciales criptográficas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-400 hover:text-white bg-[#08050E] border border-[#261442] hover:bg-[#261442] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Snapshot */}
        <div className="p-4 rounded-2xl bg-[#08050E] border border-[#261442] mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-[#C084FC]/40 flex items-center justify-center text-sm font-bold text-[#C084FC] overflow-hidden shrink-0">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate">
                {user.username}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-[#C084FC] border border-[#C084FC]/30 uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-purple-300/60 font-mono truncate">
              {user.email || 'Sin correo vinculado'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Configuración de cuenta actualizada correctamente.</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Nombre Gamer / Tag de Minecraft / Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                value={globalName}
                onChange={(e) => setGlobalName(e.target.value)}
                maxLength={50}
                placeholder="Ej. PhoenixOwner / CraftMaster"
                className="w-full px-4 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] focus:border-[#C084FC] focus:outline-none text-white text-xs placeholder:text-purple-400/40"
              />
              <Terminal className="w-4 h-4 text-purple-400/50 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-purple-300/60 mt-1">
              Este nombre será visible en las entregas .jar, el chat del proyecto y las notas de entrega.
            </p>
          </div>

          {/* Security & Infrastructure Info */}
          <div className="p-4 rounded-2xl bg-[#08050E]/80 border border-[#261442] space-y-2 text-xs">
            <div className="flex items-center justify-between text-purple-300/80">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Seguridad de Sesión:
              </span>
              <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                Cifrado JWT HS256 (7 días)
              </span>
            </div>
            <div className="flex items-center justify-between text-purple-300/80">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-[#C084FC]" />
                ID de Usuario:
              </span>
              <span className="font-mono text-purple-300 text-[11px] truncate max-w-[180px]">
                {user.id}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#08050E] border border-[#261442] hover:bg-[#180d2c] text-purple-300 text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(192,132,252,0.3)] flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
