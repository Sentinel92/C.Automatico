import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FirstOrderDelayModule } from './components/FirstOrderDelayModule';
import { SecondOrderExamModule } from './components/SecondOrderExamModule';
import { CircuitsCombinedModule } from './components/CircuitsCombinedModule';
import { StepByStepModule } from './components/StepByStepModule';
import { PidLabModule } from './components/PidLabModule';
import { BodeAnalyzerModule } from './components/BodeAnalyzerModule';
import { MatlabCsvModule } from './components/MatlabCsvModule';
import { GlossaryQuizModule } from './components/GlossaryQuizModule';
import { ShareSessionModal } from './components/ShareSessionModal';
import { ModuleId } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { checkUrlForSession, applySessionState } from './utils/sessionShare';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useLocalStorage<ModuleId>(
    'autocontrol_platinum_active_module',
    'first_order_delay'
  );
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sessionLoadedNotice, setSessionLoadedNotice] = useState<boolean>(false);

  // Check on initial load if URL contains a shared session
  useEffect(() => {
    const sharedData = checkUrlForSession();
    if (sharedData) {
      applySessionState(sharedData);
      setActiveModule(sharedData.activeModule);
      setSessionLoadedNotice(true);
      // Clean URL hash without reload
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [setActiveModule]);

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
          {/* Top Bar */}
          <Header
            activeModule={activeModule}
            onSelectModule={setActiveModule}
            onOpenMobile={() => setIsOpenMobile(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
          />

          {/* Shared Session Loaded Banner */}
          {sessionLoadedNotice && (
            <div className="mx-4 md:mx-6 lg:mx-8 mt-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/40 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>¡Sesión de Laboratorio compartida cargada con éxito!</strong> Los parámetros y gráficas del compañero han sido sincronizados en tu entorno.
                </span>
              </div>
              <button
                onClick={() => setSessionLoadedNotice(false)}
                className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-900 transition-colors"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Module Viewport */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {(activeModule === 'first_order_delay' ||
              activeModule === 'fundamentals' ||
              activeModule === 'theory' ||
              activeModule === 'circuit_tutor') && <FirstOrderDelayModule />}

            {(activeModule === 'second_order_exam' ||
              activeModule === 'systems_analysis' ||
              activeModule === 'simulator') && <SecondOrderExamModule />}

            {(activeModule === 'circuits' ||
              activeModule === 'circuit_blackboard') && <CircuitsCombinedModule />}

            {(activeModule === 'algebraic_tutor' ||
              activeModule === 'stepbystep' ||
              activeModule === 'canonical' ||
              activeModule === 'laplace_bridge') && <StepByStepModule />}

            {(activeModule === 'pid_lab' || activeModule === 'pid') && (
              <PidLabModule />
            )}

            {(activeModule === 'bode_analysis' || activeModule === 'bode') && (
              <BodeAnalyzerModule />
            )}

            {(activeModule === 'matlab_csv' ||
              activeModule === 'block_simulink' ||
              activeModule === 'blockdiagram' ||
              activeModule === 'matlab' ||
              activeModule === 'simulink' ||
              activeModule === 'csv_lab' ||
              activeModule === 'csvloader') && <MatlabCsvModule />}

            {(activeModule === 'glossary_quiz' ||
              activeModule === 'glossary_exam') && <GlossaryQuizModule />}
          </main>

          {/* Minimalist Professional Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">
                Platinum Control Lab
              </span>
              <span>—</span>
              <span>Edición Cuaderno Universitario & Sesiones Colaborativas</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>FOPTD (K, τ, θ)</span>
              <span>·</span>
              <span>2º Orden (wn, ζ, Mp%)</span>
              <span>·</span>
              <span>PID & Bode</span>
              <span>·</span>
              <span>Quiz 10 Preguntas</span>
              <span>·</span>
              <span>Share URL</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Share Session Modal */}
      <ShareSessionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeModule={activeModule}
      />
    </div>
  );
}
