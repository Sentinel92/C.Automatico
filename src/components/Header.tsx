import React from 'react';
import { Menu, BookOpen, Calculator, Zap, Sliders, Box, GitBranch, Activity, Radio } from 'lucide-react';
import { ModuleId } from '../types';

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onOpenMobile: () => void;
}

const moduleNames: Record<ModuleId, { title: string; subtitle: string }> = {
  theory: { title: 'Módulo 1: Tutor de Teoría y Demostraciones Matemáticas', subtitle: 'KaTeX & Deducciones 1er y 2º Orden' },
  canonical: { title: 'Módulo 2: Calculadora Canónica y Sistemas 2º Orden', subtitle: '1er Orden & 2º Orden (wn, ζ, Mp, tp, ts)' },
  circuits: { title: 'Módulo 3: Calculadora de Circuitos Eléctricos', subtitle: 'RC, RL y RLC Serie' },
  simulator: { title: 'Módulo 4: Simulador Paramétrico y Perturbaciones', subtitle: 'K, τ, Escalón, Rampa & Perturbación' },
  pid: { title: 'Módulo 5: Laboratorio de Control PID en Lazo Cerrado', subtitle: 'Sintonía Ziegler-Nichols & Métricas' },
  bode: { title: 'Módulo 6: Analizador de Frecuencia (Diagrama de Bode)', subtitle: 'Magnitud (dB), Fase (°) & Sonda' },
  blockdiagram: { title: 'Módulo 7: Diagrama de Bloques Interactivo (SVG)', subtitle: 'Lazo Abierto / Cerrado con Feedback' },
  simulink: { title: 'Módulo 8: Exportador Simulink, MATLAB y Cargador CSV', subtitle: 'Generador .slx, Script .m & Ajuste de Parámetros' },
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onOpenMobile,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Brand title / mobile menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-white font-sans">
            Platinum Control Lab
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
            Sistemas, Frecuencia & PID
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (desktop quick navigation) */}
      <nav className="hidden 2xl:flex items-center gap-4 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectModule('theory')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'theory' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Teoría</span>
        </button>
        <button
          onClick={() => onSelectModule('canonical')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'canonical' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Canónica</span>
        </button>
        <button
          onClick={() => onSelectModule('circuits')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'circuits' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Circuitos</span>
        </button>
        <button
          onClick={() => onSelectModule('simulator')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'simulator' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulador</span>
        </button>
        <button
          onClick={() => onSelectModule('pid')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'pid' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>PID Lab</span>
        </button>
        <button
          onClick={() => onSelectModule('bode')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'bode' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Bode</span>
        </button>
        <button
          onClick={() => onSelectModule('blockdiagram')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'blockdiagram' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Bloques</span>
        </button>
        <button
          onClick={() => onSelectModule('simulink')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeModule === 'simulink' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Simulink & CSV</span>
        </button>
      </nav>

      {/* Zone 3: Active Module Status */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-semibold text-white">
            {moduleNames[activeModule]?.title.split(':')[1] || 'Control Lab'}
          </div>
          <div className="text-[11px] text-slate-400">
            {moduleNames[activeModule]?.subtitle}
          </div>
        </div>
      </div>
    </header>
  );
};
