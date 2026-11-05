import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08050E] text-[#F3E8FF] flex flex-col items-center justify-center p-4">
      <div className="p-10 rounded-3xl bg-[#120A21] border border-[#261442] text-center max-w-md w-full shadow-[0_0_35px_rgba(192,132,252,0.15)]">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-[#C084FC]/40 flex items-center justify-center text-[#C084FC] mx-auto mb-4">
          <Terminal className="w-7 h-7" />
        </div>
        <span className="text-xs font-mono font-bold text-[#C084FC] uppercase tracking-wider">
          Error 404 · Chunk Not Found
        </span>
        <h1 className="text-2xl font-bold text-white mt-2 mb-3">
          Página No Encontrada
        </h1>
        <p className="text-xs text-purple-300/70 mb-6 leading-relaxed">
          El módulo o coordenada que intentas cargar no existe en los registros de Synthetix Studio.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#A855F7] hover:to-[#D8B4FE] text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Synthetix Studio
        </Link>
      </div>
    </div>
  );
}
