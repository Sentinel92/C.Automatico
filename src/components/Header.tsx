import React from 'react';
import { Menu, BookOpen, Calculator, Zap, Sliders, Box, GitBranch, Activity, Radio, FileSpreadsheet } from 'lucide-react';
import { ModuleId } from '../types';

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onOpenMobile: () => void;
}

const moduleNames: Record<ModuleId, { title: string; subtitle: string }> = {
  theory: { title: 'Módulo 1: Masterclass Teórica y Álgebra de Laplace', subtitle: 'Explicación en 3 Ejes & Polos/Ceros' },
  stepbystep: { title: 'Módulo 2: Desglose Algebraico Paso a Paso', subtitle: 'Pizarra Demostrativa en KaTeX (5 Pasos)' },
  circuits: { title: 'Módulo 3: Calculadora de Circuitos Eléctricos', subtitle: 'RC, RL y RLC Serie con Respuesta Física' },
  simulator: { title: 'Módulo 4: Simulador Paramétrico y Comportamiento Temporal', subtitle: 'K, τ, ζ, wn, Escalón, Rampa & Perturbaciones' },
  pid: { title: 'Módulo 5: Laboratorio de Control PID en Lazo Cerrado', subtitle: 'Sintonía Ziegler-Nichols, Esfuerzo u(t) y T(s)' },
  bode: { title: 'Módulo 6: Analizador en Frecuencia (Diagrama de Bode)', subtitle: 'Magnitud (dB), Fase (°) & Sonda Sinusoidal' },
  blockdiagram: { title: 'Módulo 7: Visualizador de Diagrama de Bloques SVG', subtitle: 'Lazo Abierto / Cerrado Interactivo Vectorial' },
  matlab: { title: 'Módulo 8: Exportador de Código MATLAB y Simulink', subtitle: 'Generación Automática .slx y Script .m' },
  csvloader: { title: 'Módulo 9: Cargador de Datos Experimentales (CSV)', subtitle: 'Identificación de Parámetros K y τ por Regresión' },
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
            9 Módulos Universitarios
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (desktop quick navigation) */}
      <nav className="hidden 2xl:flex items-center gap-3 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectModule('theory')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'theory' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Teoría</span>
        </button>
        <button
          onClick={() => onSelectModule('stepbystep')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'stepbystep' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Paso a Paso</span>
        </button>
        <button
          onClick={() => onSelectModule('circuits')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'circuits' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Circuitos</span>
        </button>
        <button
          onClick={() => onSelectModule('simulator')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'simulator' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulador</span>
        </button>
        <button
          onClick={() => onSelectModule('pid')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'pid' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>PID</span>
        </button>
        <button
          onClick={() => onSelectModule('bode')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'bode' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Bode</span>
        </button>
        <button
          onClick={() => onSelectModule('blockdiagram')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'blockdiagram' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Bloques</span>
        </button>
        <button
          onClick={() => onSelectModule('matlab')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'matlab' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Simulink</span>
        </button>
        <button
          onClick={() => onSelectModule('csvloader')}
          className={`transition-colors flex items-center gap-1 ${
            activeModule === 'csvloader' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>
      </nav>

      {/* Zone 3: Active Module Status */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-semibold text-white">
            {moduleNames[activeModule]?.title.split(':')[1] || 'Cátedra de Control'}
          </div>
          <div className="text-[11px] text-slate-400">
            {moduleNames[activeModule]?.subtitle}
          </div>
        </div>
      </div>
    </header>
  );
};
