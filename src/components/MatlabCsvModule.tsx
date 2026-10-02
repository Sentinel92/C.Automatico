import React, { useState } from 'react';
import { Box, FileSpreadsheet, GitBranch, Sparkles } from 'lucide-react';
import { BlockSimulinkModule } from './BlockSimulinkModule';
import { ExperimentalCsvModule } from './ExperimentalCsvModule';

export const MatlabCsvModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulink' | 'csv'>('simulink');

  return (
    <div className="space-y-6">
      {/* Sub-header switch */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            {activeSubTab === 'simulink' ? <Box className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Módulo 7: Exportador MATLAB/Simulink y Cargador CSV
            </h3>
            <p className="text-[11px] text-slate-400">
              Generación de modelos ejecutables .slx y ajuste experimental de parámetros K, τ y θ.
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('simulink')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'simulink'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Simulink API & Script .m</span>
          </button>
          <button
            onClick={() => setActiveSubTab('csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'csv'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Identificador CSV (K, τ, θ)</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeSubTab === 'simulink' ? <BlockSimulinkModule /> : <ExperimentalCsvModule />}
    </div>
  );
};
