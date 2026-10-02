import React from 'react';
import {
  Compass,
  Layers,
  Clock,
  Calculator,
  Zap,
  Activity,
  Sliders,
  Radio,
  GitBranch,
  FileSpreadsheet,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ModuleId } from '../types';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ModuleId;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    id: 'mod01_fundamentals',
    number: '01',
    title: 'Fundamentos de Control',
    subtitle: 'u(t), y(t), x(t), d(t) & Lazo Abierto/Cerrado',
    icon: Compass,
  },
  {
    id: 'mod02_laplace_bridge',
    number: '02',
    title: 'Plano s y Polos/Ceros',
    subtitle: 'Mapa s (σ + jω), Estabilidad & Oscilación',
    icon: Layers,
  },
  {
    id: 'mod03_first_order_delay',
    number: '03',
    title: '1er Orden & Tiempo Muerto',
    subtitle: 'G(s) = (K/(τs+1))·e^(-θs) & Tabla 1τ a 5τ',
    icon: Clock,
  },
  {
    id: 'mod04_second_order_exam',
    number: '04',
    title: '2º Orden: Fórmulas de Examen',
    subtitle: 'wn, ζ, wd, β, tr, tp, Mp% & ts(2%/5%)',
    icon: Calculator,
  },
  {
    id: 'mod05_circuits',
    number: '05',
    title: 'Deducción Circuitos Eléctricos',
    subtitle: 'RC, RL y RLC Serie (LVK & Z(s))',
    icon: Zap,
  },
  {
    id: 'mod06_laplace_tutor',
    number: '06',
    title: 'Tutor de Laplace & Residuos',
    subtitle: 'EDOs, Fracciones Parciales C1, C2, C3 & y(t)',
    icon: Activity,
  },
  {
    id: 'mod07_pid_lab',
    number: '07',
    title: 'Laboratorio de Control PID',
    subtitle: 'T(s) = C·G/(1+C·G), Ziegler-Nichols & ess',
    icon: Sliders,
  },
  {
    id: 'mod08_bode',
    number: '08',
    title: 'Respuesta en Frecuencia (Bode)',
    subtitle: 'Magnitud (dB), Fase (°) & Frecuencia wc',
    icon: Radio,
  },
  {
    id: 'mod09_block_simulink',
    number: '09',
    title: 'Diagrama SVG & MATLAB/Simulink',
    subtitle: 'Esquema Vectorial y Script .m con syms',
    icon: GitBranch,
  },
  {
    id: 'mod10_csv_glossary_exam',
    number: '10',
    title: 'Modo Examen, CSV & Glosario',
    subtitle: 'Certamen 60 min, Bloqueo de Fórmulas & CSV',
    icon: FileSpreadsheet,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-cyan-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Platinum Control Lab</span>
              </div>
              <div className="text-[11px] text-cyan-400 font-mono">Edición Cuaderno Universitario</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Cuaderno de Cátedra (8 Módulos)
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            // Check direct match or aliases
            const isActive =
              activeModule === item.id ||
              (item.id === 'first_order_delay' &&
                (activeModule === 'fundamentals' ||
                  activeModule === 'theory' ||
                  activeModule === 'circuit_tutor')) ||
              (item.id === 'second_order_exam' &&
                (activeModule === 'systems_analysis' || activeModule === 'simulator')) ||
              (item.id === 'circuits' && activeModule === 'circuit_blackboard') ||
              (item.id === 'algebraic_tutor' &&
                (activeModule === 'stepbystep' ||
                  activeModule === 'canonical' ||
                  activeModule === 'laplace_bridge')) ||
              (item.id === 'pid_lab' && activeModule === 'pid') ||
              (item.id === 'bode_analysis' && activeModule === 'bode') ||
              (item.id === 'matlab_csv' &&
                (activeModule === 'block_simulink' ||
                  activeModule === 'blockdiagram' ||
                  activeModule === 'matlab' ||
                  activeModule === 'simulink' ||
                  activeModule === 'csv_lab' ||
                  activeModule === 'csvloader'));

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-2.5 group relative ${
                  isActive
                    ? 'bg-slate-900 border border-slate-700/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-500 to-indigo-500 rounded-r" />
                )}

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {item.number}
                    </span>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer info card */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <span>Modo Examen Activo</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400">
              KaTeX · Recharts · Simulink .m
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
