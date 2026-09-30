import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TheoryModule } from './components/TheoryModule';
import { CanonicalCalculatorModule } from './components/CanonicalCalculatorModule';
import { CircuitCalculatorModule } from './components/CircuitCalculatorModule';
import { ParametricSimulatorModule } from './components/ParametricSimulatorModule';
import { PidLabModule } from './components/PidLabModule';
import { BodeAnalyzerModule } from './components/BodeAnalyzerModule';
import { BlockDiagramModule } from './components/BlockDiagramModule';
import { SimulinkGeneratorModule } from './components/SimulinkGeneratorModule';
import { ModuleId } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [activeModule, setActiveModule] = useLocalStorage<ModuleId>('autocontrol_active_module', 'theory');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Top Bar Contract (3 zones) */}
          <Header
            activeModule={activeModule}
            onSelectModule={setActiveModule}
            onOpenMobile={() => setIsOpenMobile(true)}
          />

          {/* Module Viewport */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {activeModule === 'theory' && <TheoryModule />}
            {activeModule === 'canonical' && <CanonicalCalculatorModule />}
            {activeModule === 'circuits' && <CircuitCalculatorModule />}
            {activeModule === 'simulator' && <ParametricSimulatorModule />}
            {activeModule === 'pid' && <PidLabModule />}
            {activeModule === 'bode' && <BodeAnalyzerModule />}
            {activeModule === 'blockdiagram' && <BlockDiagramModule />}
            {activeModule === 'simulink' && <SimulinkGeneratorModule />}
          </main>

          {/* Minimalist Professional Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Platinum Control Lab</span>
              <span>—</span>
              <span>Sistemas de 1er y 2º Orden, Frecuencia Bode, Control PID y Simulink</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>G(s) = K / (τs + 1)</span>
              <span>·</span>
              <span>G(s) = ωn² / (s² + 2ζωns + ωn²)</span>
              <span>·</span>
              <span>PID & Bode Analyzer</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
