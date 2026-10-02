import React from 'react';
import {
  Menu,
  Clock,
  Calculator,
  Zap,
  Activity,
  Sliders,
  Radio,
  FileCode,
  Award,
  Share2,
} from 'lucide-react';
import { ModuleId } from '../types';

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onOpenMobile: () => void;
  onOpenShare?: () => void;
}

const moduleNames: Record<string, { title: string; subtitle: string }> = {
  first_order_delay: {
    title: 'Módulo 1: Sistemas de 1er Orden y Retardo Puro (Tiempo Muerto)',
    subtitle: 'Modelo FOPTD G(s) = (K/(τs+1))·e^(-θs), Tabla 1τ a 5τ e Identificación Gráfica',
  },
  second_order_exam: {
    title: 'Módulo 2: Sistemas de 2º Orden y Fórmulas Exactas de Examen',
    subtitle: 'Cálculo de wn, ζ, wd, β, tr, tp, Mp%, ts(2%) y ts(5%) con Resolución Paso a Paso',
  },
  circuits: {
    title: 'Módulo 3: Deducción de Circuitos Eléctricos (RC, RL, RLC)',
    subtitle: 'Leyes de Kirchhoff (LVK), Impedancias de Laplace Z(s) y Simulación V e I',
  },
  algebraic_tutor: {
    title: 'Módulo 4: Calculadora y Tutor de Laplace Paso a Paso',
    subtitle: 'Transformada Término a Término, Fracciones Parciales en KaTeX y Solución Temporal y(t)',
  },
  pid_lab: {
    title: 'Módulo 5: Laboratorio de Control PID en Lazo Cerrado',
    subtitle: 'Simulación Kp, Ki, Kd, Sintonía Ziegler-Nichols y Análisis de Error ess',
  },
  bode_analysis: {
    title: 'Módulo 6: Analizador de Bode y Frecuencia',
    subtitle: 'Curvas Semilogarítmicas de Magnitud (dB) y Fase (grados), Frecuencia de Corte y Resonancia',
  },
  matlab_csv: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Script .m Automático para .slx y Cargador CSV para Estimación de K, τ y θ',
  },
  glossary_quiz: {
    title: 'Módulo 8: Glosario y Autoevaluación de Cátedra',
    subtitle: 'Cuestionario Dinámico de 10 Preguntas y Diccionario de Control',
  },
  // Compatibility aliases
  fundamentals: {
    title: 'Módulo 1: Sistemas de 1er Orden y Retardo Puro (Tiempo Muerto)',
    subtitle: 'Modelo FOPTD e Identificación Gráfica',
  },
  laplace_bridge: {
    title: 'Módulo 4: Calculadora y Tutor de Laplace Paso a Paso',
    subtitle: 'Transformada de Laplace y Plano Complejo',
  },
  systems_analysis: {
    title: 'Módulo 2: Sistemas de 2º Orden y Fórmulas Exactas de Examen',
    subtitle: 'Fórmulas y Comportamiento Temporal',
  },
  block_simulink: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Simulink API y Scripts .m',
  },
  csv_lab: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Cargador e Identificador CSV',
  },
  theory: {
    title: 'Módulo 1: Sistemas de 1er Orden y Retardo Puro (Tiempo Muerto)',
    subtitle: 'Modelo FOPTD',
  },
  stepbystep: {
    title: 'Módulo 4: Calculadora y Tutor de Laplace Paso a Paso',
    subtitle: 'Desglose en Pizarra KaTeX',
  },
  simulator: {
    title: 'Módulo 2: Sistemas de 2º Orden y Fórmulas Exactas de Examen',
    subtitle: 'Simulador Paramétrico',
  },
  pid: {
    title: 'Módulo 5: Laboratorio de Control PID en Lazo Cerrado',
    subtitle: 'Control PID',
  },
  bode: {
    title: 'Módulo 6: Analizador de Bode y Frecuencia',
    subtitle: 'Diagramas de Bode',
  },
  matlab: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Exportador MATLAB y Simulink',
  },
  simulink: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Modelos Simulink',
  },
  csvloader: {
    title: 'Módulo 7: Exportador MATLAB, Simulink y Identificador CSV',
    subtitle: 'Cargador de Datos CSV',
  },
  glossary_exam: {
    title: 'Módulo 8: Glosario y Autoevaluación de Cátedra',
    subtitle: 'Cuestionario y Glosario',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onOpenMobile,
  onOpenShare,
}) => {
  const currentInfo = moduleNames[activeModule] || moduleNames['first_order_delay'];

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
          <span className="hidden sm:inline-block text-xs text-cyan-400 font-mono">
            Cuaderno Universitario
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (desktop quick navigation) */}
      <nav className="hidden 2xl:flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectModule('first_order_delay')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'first_order_delay' ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>1er Orden & Retardo</span>
        </button>
        <button
          onClick={() => onSelectModule('second_order_exam')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'second_order_exam' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>2º Orden Examen</span>
        </button>
        <button
          onClick={() => onSelectModule('circuits')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'circuits' ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Circuitos</span>
        </button>
        <button
          onClick={() => onSelectModule('algebraic_tutor')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'algebraic_tutor' ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Laplace</span>
        </button>
        <button
          onClick={() => onSelectModule('pid_lab')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'pid_lab' ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Control PID</span>
        </button>
        <button
          onClick={() => onSelectModule('bode_analysis')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'bode_analysis' ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Bode</span>
        </button>
        <button
          onClick={() => onSelectModule('matlab_csv')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'matlab_csv' ? 'bg-violet-500/10 text-violet-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Simulink & CSV</span>
        </button>
        <button
          onClick={() => onSelectModule('glossary_quiz')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeModule === 'glossary_quiz' ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Autoevaluación</span>
        </button>
      </nav>

      {/* Zone 3: Share Session & Module Info */}
      <div className="flex items-center gap-3">
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all shadow-cyan-950"
            title="Compartir configuración actual del laboratorio con un enlace único"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir Sesión</span>
          </button>
        )}

        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-white">
            {currentInfo.title.split(':')[1] || currentInfo.title}
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-[200px] md:max-w-xs">
            {currentInfo.subtitle}
          </div>
        </div>
      </div>
    </header>
  );
};
