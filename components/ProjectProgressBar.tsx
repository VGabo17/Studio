'use client';

import React from 'react';
import { CheckCircle2, Clock, Terminal, Sparkles } from 'lucide-react';

interface ProjectProgressBarProps {
  progress: number; // 0 to 100
  status: string;
}

export function ProjectProgressBar({ progress, status }: ProjectProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const stages = [
    { label: 'Requerimientos', min: 0, max: 25, icon: Terminal },
    { label: 'Desarrollo NMS', min: 25, max: 70, icon: Clock },
    { label: 'Pruebas QA & TPS', min: 70, max: 95, icon: Sparkles },
    { label: 'Build Compilada', min: 95, max: 100, icon: CheckCircle2 },
  ];

  return (
    <div className="w-full bg-[#120A21] border border-[#261442] rounded-2xl p-5 shadow-[0_0_20px_rgba(192,132,252,0.15)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-200">Progreso en Vivo</span>
          <span className="text-xs text-purple-400 font-mono">
            {status === 'completed' ? 'Completado' : `${clampedProgress}% completado`}
          </span>
        </div>
        <div className="text-sm font-bold text-[#C084FC] font-mono tabular-nums">
          {clampedProgress}%
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-3 bg-[#08050E] rounded-full overflow-hidden border border-[#261442] p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#C084FC] shadow-[0_0_15px_rgba(192,132,252,0.6)] transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Milestones */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#261442]/60">
        {stages.map((stage, idx) => {
          const isDone = clampedProgress >= stage.max;
          const isCurrent = clampedProgress >= stage.min && clampedProgress < stage.max;
          const Icon = stage.icon;

          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs transition-colors ${
                  isDone
                    ? 'bg-[#C084FC] text-black font-bold shadow-[0_0_10px_rgba(192,132,252,0.5)]'
                    : isCurrent
                    ? 'bg-purple-900/80 text-[#C084FC] border border-[#C084FC] animate-pulse'
                    : 'bg-[#08050E] text-purple-400/40 border border-[#261442]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[11px] font-medium leading-tight ${
                  isDone || isCurrent ? 'text-purple-200' : 'text-purple-400/40'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
