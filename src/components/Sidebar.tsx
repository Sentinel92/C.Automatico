import React from 'react';
import {
  BookOpen,
  Calculator,
  Zap,
  Sliders,
  FileCode,
  Layers,
  ChevronRight,
  GitBranch,
  Box,
  Radio,
  SlidersHorizontal,
  Activity,
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
    id: 'theory',
    number: '01',
    title: 'Tutor de Teoría',
    subtitle: 'Deducciones & LaTeX',
    icon: BookOpen,
  },
  {
    id: 'canonical',
    number: '02',
    title: 'Calculadora Canónica',
    subtitle: '1er y 2º Orden (wn, ζ)',
    icon: Calculator,
  },
  {
    id: 'circuits',
    number: '03',
    title: 'Circuitos Eléctricos',
    subtitle: 'RC, RL y RLC Serie',
    icon: Zap,
  },
  {
    id: 'simulator',
    number: '04',
    title: 'Simulador Paramétrico',
    subtitle: 'K, τ y Perturbaciones',
    icon: Sliders,
  },
  {
    id: 'pid',
    number: '05',
    title: 'Laboratorio Control PID',
    subtitle: 'Lazo Cerrado & Ziegler-Nichols',
    icon: Activity,
  },
  {
    id: 'bode',
    number: '06',
    title: 'Diagramas de Bode',
    subtitle: 'Magnitud (dB) y Fase (°)',
    icon: Radio,
  },
  {
    id: 'blockdiagram',
    number: '07',
    title: 'Diagrama de Bloques',
    subtitle: 'Lazo Abierto / Cerrado SVG',
    icon: GitBranch,
  },
  {
    id: 'simulink',
    number: '08',
    title: 'Simulink, MATLAB & CSV',
    subtitle: 'Generador .slx y Ajuste CSV',
    icon: Box,
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-850 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-950">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Platinum Control Lab</span>
              </div>
              <div className="text-[11px] text-slate-400">Sistemas, Frecuencia y PID</div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            8 Módulos de Control
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 group relative ${
                  isActive
                    ? 'bg-slate-900 border border-slate-700/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-500 to-indigo-500 rounded-r" />
                )}

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
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
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-850/80">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <span>Estado del Sistema</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              8 Módulos activos | Persistencia LocalStorage habilitada
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
