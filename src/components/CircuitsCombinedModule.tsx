import React, { useState } from 'react';
import { BookOpen, Calculator, Zap } from 'lucide-react';
import { CircuitTutorModule } from './CircuitTutorModule';
import { CircuitBlackboardModule } from './CircuitBlackboardModule';

export const CircuitsCombinedModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deduccion' | 'calculadora'>('deduccion');

  return (
    <div className="space-y-6">
      {/* Tab Switcher Banner */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Módulo 3: Deducción y Cálculo de Circuitos Eléctricos (RC, RL, RLC)
            </h3>
            <p className="text-[11px] text-slate-400">
              Leyes de Kirchhoff (LVK), Impedancias de Laplace Z(s) y Simulación Dinámica.
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('deduccion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'deduccion'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Deducción LVK & Z(s)</span>
          </button>
          <button
            onClick={() => setActiveTab('calculadora')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'calculadora'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Calculadora & Gráficos V-I</span>
          </button>
        </div>
      </div>

      {activeTab === 'deduccion' ? <CircuitTutorModule /> : <CircuitBlackboardModule />}
    </div>
  );
};
