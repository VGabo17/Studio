'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Shield, FileText } from 'lucide-react';

export function Footer() {
  const [tosOpen, setTosOpen] = useState(false);

  return (
    <footer className="w-full bg-[#08050E] border-t border-[#261442] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#120A21] border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC]">
            <Terminal className="w-4 h-4 text-[#C084FC]" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              Synthetix<span className="text-[#C084FC]">Studio</span>
            </span>
            <p className="text-xs text-purple-300/60 mt-0.5">
              Arquitectura de software gamer para Minecraft, Paper & Discord.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-purple-300/70">
          <Link href="/#servicios" className="hover:text-[#C084FC] transition-colors">Servicios</Link>
          <Link href="/#portafolio" className="hover:text-[#C084FC] transition-colors">Portafolio</Link>
          <Link href="/#flujo" className="hover:text-[#C084FC] transition-colors">Cómo Trabajamos</Link>
          <button onClick={() => setTosOpen(true)} className="hover:text-[#C084FC] transition-colors flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Términos del Servicio (TOS)
          </button>
          <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Portal Administrativo
          </Link>
        </div>

        <div className="text-xs text-purple-400/60 font-mono text-center md:text-right">
          © {new Date().getFullYear()} Synthetix Studio · Infraestructura Privada & Entregas Cifradas
        </div>
      </div>

      {/* TOS Modal */}
      {tosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#120A21] border border-[#261442] rounded-2xl max-w-lg w-full p-6 text-purple-200 shadow-[0_0_35px_rgba(192,132,252,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#261442]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C084FC]" />
                Términos del Servicio (TOS)
              </h3>
              <button
                onClick={() => setTosOpen(false)}
                className="text-purple-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed max-h-80 overflow-y-auto pr-1 text-purple-300/90">
              <p>
                <strong>1. Licencia de Software:</strong> Cada plugin compilado (.jar) o paquete de servidor (.zip) entregado a través del portal de Synthetix Studio se concede bajo licencia de uso exclusiva para el cliente o su network registrada.
              </p>
              <p>
                <strong>2. Soporte y Actualizaciones:</strong> Todos los pedidos incluyen 30 días de garantía y corrección de bugs sin costo adicional tras la entrega de la versión RELEASE.
              </p>
              <p>
                <strong>3. Entregas Autónomas:</strong> Los binarios permanecen resguardados de forma inmutable en Cloudflare R2 con hashes de integridad verificados.
              </p>
              <p>
                <strong>4. Reembolsos:</strong> Los proyectos cancelados antes de iniciar el desarrollo técnico reciben reembolso del 100%. Una vez comenzada la fase de código NMS, se prorratea el trabajo realizado.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setTosOpen(false)}
                className="px-4 py-2 bg-[#C084FC] text-black font-semibold text-xs rounded-lg hover:bg-purple-300 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
