'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { UploadCloud, FileCode2, Sparkles, Loader2, Check } from 'lucide-react';

interface DeliveryUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: string;
  onSuccess: () => void;
}

export function DeliveryUploaderModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onSuccess,
}: DeliveryUploaderModalProps) {
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [version, setVersion] = useState('v1.0.0-RELEASE');
  const [fileName, setFileName] = useState('');
  const [changelog, setChangelog] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const handleQuickPreset = (type: 'jar' | 'zip') => {
    if (type === 'jar') {
      setFileName(`SynthetixPlugin-${version}.jar`);
      setChangelog('• Optimización de rendimiento en eventos asíncronos (Paper/Purpur).\n• Sincronización atómica con base de datos Cloudflare D1/SQLite.\n• Compatibilidad validada con Java 21.');
    } else {
      setFileName(`ServerSetup-${version}.zip`);
      setChangelog('• Paquete de configuración completa listo para arrancar.\n• Includes purpur.yml, paper-world-defaults.yml y plugins preconfigurados.\n• 20.0 TPS garantizados en servidores dedicados.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !version || (!fileName && !selectedFile)) {
      setError('Por favor indica el proyecto, la versión y el nombre del archivo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetFileName = fileName || selectedFile?.name || 'build.jar';

      if (selectedFile) {
        // Upload multipart
        const formData = new FormData();
        formData.append('project_id', projectId);
        formData.append('version', version.trim());
        formData.append('changelog', changelog.trim());
        formData.append('file', selectedFile);

        const res = await fetch('/api/deliveries/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Error al subir entrega a Cloudflare R2');
        }
      } else {
        // Generar binario directo en el servidor R2
        const res = await fetch('/api/deliveries/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            version: version.trim(),
            file_name: targetFileName.trim(),
            changelog: changelog.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Error al alojar entrega en Cloudflare R2');
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#120A21] border border-[#261442] rounded-2xl shadow-[0_0_40px_rgba(192,132,252,0.3)] overflow-hidden">
        <div className="p-6 pb-4 border-b border-[#261442] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-[#C084FC]/50 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-[#C084FC]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Subir Entrega de Compilación</h2>
              <p className="text-xs text-purple-300/70">Alojamiento cifrado de archivos .jar y .zip con notificación automática a Discord</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-white text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261442]"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">¡Build Publicada con Éxito!</h3>
            <p className="text-xs text-purple-300/70">
              El cliente ha sido notificado mediante Rich Embed en Discord y ya puede descargar su versión de forma segura.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                Proyecto Destinatario
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-sm text-white focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1.5">
                  Versión (SemVer)
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0-RELEASE"
                  className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1.5">
                  Nombre del Archivo
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="MiPlugin-1.0.jar"
                  className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
                />
              </div>
            </div>

            {/* Selector de Archivo o Preset */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                Archivo Ejecutable (.jar o .zip)
              </label>
              <div className="border border-dashed border-[#261442] hover:border-[#C084FC]/60 rounded-xl p-4 bg-[#08050E]/80 text-center transition-all">
                <input
                  type="file"
                  accept=".jar,.zip,.tar.gz"
                  onChange={handleFileChange}
                  className="hidden"
                  id="delivery-file-input"
                />
                <label htmlFor="delivery-file-input" className="cursor-pointer block">
                  <FileCode2 className="w-7 h-7 text-[#C084FC] mx-auto mb-1.5" />
                  <span className="text-xs text-white font-semibold">
                    {selectedFile ? selectedFile.name : 'Selecciona un archivo local o arrástralo aquí'}
                  </span>
                  <p className="text-[10px] text-purple-400/60 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB listos para R2`
                      : 'O presiona un preset de compilación rápida:'}
                  </p>
                </label>
                {!selectedFile && (
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPreset('jar')}
                      className="px-2.5 py-1 rounded bg-[#120A21] border border-[#261442] hover:border-[#C084FC] text-[10px] text-purple-200 font-mono transition-colors"
                    >
                      Preset .JAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPreset('zip')}
                      className="px-2.5 py-1 rounded bg-[#120A21] border border-[#261442] hover:border-[#C084FC] text-[10px] text-purple-200 font-mono transition-colors"
                    >
                      Preset .ZIP
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5">
                Changelog / Notas de la Versión
              </label>
              <textarea
                rows={3}
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="• Instrucciones de instalación&#10;• Bugs solucionados&#10;• Permisos agregados..."
                className="w-full px-3.5 py-2.5 bg-[#08050E] border border-[#261442] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C084FC] focus:ring-1 focus:ring-[#C084FC]"
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
                Publicar Build & Notificar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
