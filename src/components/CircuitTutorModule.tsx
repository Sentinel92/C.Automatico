import React, { useState } from 'react';
import {
  Zap,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
  Activity,
  GitFork,
  Radio,
} from 'lucide-react';
import { MathView } from './MathView';
import { CircuitType, CircuitTopology } from '../types';

export const CircuitTutorModule: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitType>('RC');
  const [topology, setTopology] = useState<CircuitTopology>('series');
  const [activeTab, setActiveTab] = useState<'kirchhoff' | 'differential' | 'impedance' | 'schematic'>('differential');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({ 1: null, 2: null });
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleQuiz = (q: number, opt: number) => {
    setQuizAnswers(p => ({ ...p, [q]: opt }));
    setShowExplanation(p => ({ ...p, [q]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-4 h-4" />
              <span>Fundamentos Físicos & Leyes de Conservación</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 1: Tutor Integral y Desglose Físico de Circuitos
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Deducción rigurosa a partir de las Leyes de Kirchhoff (LVK, LCK), relaciones constitutivas V-I de componentes pasivos (R, L, C), formulación de ecuaciones diferenciales en el tiempo y método de impedancias generalizadas de Laplace.
            </p>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['RC', 'RL', 'RLC'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCircuit(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    selectedCircuit === c
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Circuito {c}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setTopology('series')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  topology === 'series'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Serie
              </button>
              <button
                onClick={() => setTopology('parallel')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  topology === 'parallel'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Paralelo
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          {[
            { id: 'differential', label: '1. Deducción Ecuación Diferencial', icon: Activity },
            { id: 'impedance', label: '2. Impedancias de Laplace (s)', icon: Layers },
            { id: 'kirchhoff', label: '3. Leyes V-I de Kirchhoff', icon: BookOpen },
            { id: 'schematic', label: '4. Esquema Circuital SVG Dinámico', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Tab 1: Differential Equation Derivation */}
        {activeTab === 'differential' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">DEDUCCIÓN RIGUROSA PASO A PASO</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Ecuación Diferencial del Circuito {selectedCircuit} {topology === 'series' ? 'Serie' : 'Paralelo'}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                {selectedCircuit === 'RLC' ? 'Orden 2' : 'Orden 1'}
              </span>
            </div>

            {selectedCircuit === 'RC' && (
              <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 1: Planteamiento de la Ley de Voltajes de Kirchhoff (LVK)</h4>
                  <p>En la malla serie simple, la suma algebraica de caídas de tensión es igual a la fuente de excitación:</p>
                  <MathView math="v_{\text{in}}(t) = v_R(t) + v_C(t)" block />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 2: Sustitución de Relaciones Constitutivas</h4>
                  <p>Por Ley de Ohm <MathView math="v_R(t) = R \cdot i(t)" />, y la corriente que atraviesa el capacitor es <MathView math="i(t) = C \frac{dv_C(t)}{dt}" />:</p>
                  <MathView math="v_R(t) = R \left( C \frac{dv_C(t)}{dt} \right) = R C \frac{dv_C(t)}{dt}" block />
                  <p>Sustituyendo en la ecuación de malla:</p>
                  <MathView math="R C \frac{dv_C(t)}{dt} + v_C(t) = v_{\text{in}}(t)" block />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm">Paso 3: Transformada de Laplace y Función de Transferencia Canónica</h4>
                  <p>Aplicando Laplace con condiciones iniciales nulas (<MathView math="v_C(0^-) = 0" />):</p>
                  <MathView math="(R C s + 1) \, V_C(s) = V_{\text{in}}(s) \implies G(s) = \frac{V_C(s)}{V_{\text{in}}(s)} = \frac{1}{R C s + 1} = \frac{1}{\tau s + 1}" block />
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-400">
                    Constante de tiempo: τ = R·C [s] | Ganancia DC K = 1.0 (V/V) | Polo: s = -1/(RC) rad/s
                  </div>
                </div>
              </div>
            )}

            {selectedCircuit === 'RL' && (
              <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 1: Malla de Kirchhoff LVK</h4>
                  <MathView math="v_{\text{in}}(t) = v_R(t) + v_L(t) = R \, i(t) + L \frac{di(t)}{dt}" block />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 2: Ecuación Normalizada de Corriente</h4>
                  <p>Dividiendo toda la ecuación diferencial por la resistencia <MathView math="R" />:</p>
                  <MathView math="\frac{L}{R} \frac{di(t)}{dt} + i(t) = \frac{1}{R} v_{\text{in}}(t)" block />
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-400">
                    Constante de tiempo inductiva: τ = L / R [s] | Polo: s = -R/L rad/s
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm">Paso 3: Funciones de Transferencia Resultantes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 mb-1">Tensión en Inductor VL(s)/Vin(s):</div>
                      <MathView math="\frac{V_L(s)}{V_{\text{in}}(s)} = \frac{s}{s + R/L} = \frac{\tau s}{\tau s + 1}" block />
                      <span className="text-slate-400 text-[10px]">Pasa-altos: salto inicial a Vin y decaimiento a 0.</span>
                    </div>
                    <div className="p-3 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 mb-1">Corriente de Malla IL(s)/Vin(s):</div>
                      <MathView math="\frac{I_L(s)}{V_{\text{in}}(s)} = \frac{1/R}{\tau s + 1} = \frac{1/L}{s + R/L}" block />
                      <span className="text-slate-400 text-[10px]">Pasa-bajos: crecimiento exponencial suave hasta I = Vin/R.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCircuit === 'RLC' && (
              <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 1: Ley de Malla Serie (LVK)</h4>
                  <MathView math="v_{\text{in}}(t) = v_R(t) + v_L(t) + v_C(t) = R \, i(t) + L \frac{di(t)}{dt} + v_C(t)" block />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Paso 2: Expresión en función de la tensión en el capacitor vC(t)</h4>
                  <p>Dado que <MathView math="i(t) = C \frac{dv_C}{dt}" />, su derivada temporal es <MathView math="\frac{di}{dt} = C \frac{d^2v_C}{dt^2}" />:</p>
                  <MathView math="L C \frac{d^2 v_C(t)}{dt^2} + R C \frac{dv_C(t)}{dt} + v_C(t) = v_{\text{in}}(t)" block />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
                  <h4 className="font-bold text-cyan-300 text-sm">Paso 3: Identificación con la Forma Canónica de 2º Orden</h4>
                  <p>Dividiendo por <MathView math="LC" />:</p>
                  <MathView math="\frac{d^2 v_C}{dt^2} + \frac{R}{L} \frac{dv_C}{dt} + \frac{1}{LC} v_C = \frac{1}{LC} v_{\text{in}} \quad \equiv \quad \frac{d^2 y}{dt^2} + 2\zeta \omega_n \frac{dy}{dt} + \omega_n^2 y = \omega_n^2 r" block />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-400">
                      Frecuencia Natural: ωn = 1 / √(L·C) [rad/s]
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-400">
                      Factor Amortiguamiento: ζ = (R / 2) · √(C / L)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Laplace Impedance Method */}
        {activeTab === 'impedance' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400">MÉTODO OPERACIONAL EN EL PLANO S</span>
              <h3 className="text-xl font-bold text-white mt-1">
                Transformación de Impedancias Complejas en Laplace
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Resistor Puro</span>
                <h4 className="font-bold text-white text-sm">Z_R(s) = R</h4>
                <MathView math="V_R(s) = R \cdot I(s)" block />
                <p className="text-slate-400 text-[11px]">Disipa energía en calor (Efecto Joule). No almacena energía ni introduce retardo de fase puro.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-[10px] font-mono text-amber-500 uppercase">Inductor Puro</span>
                <h4 className="font-bold text-white text-sm">Z_L(s) = L · s</h4>
                <MathView math="V_L(s) = L s \cdot I(s)" block />
                <p className="text-slate-400 text-[11px]">Almacena energía en campo magnético (<MathView math="E = \frac{1}{2} L i^2" />). Se opone a cambios bruscos de corriente.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Capacitor Puro</span>
                <h4 className="font-bold text-white text-sm">Z_C(s) = 1 / (C · s)</h4>
                <MathView math="V_C(s) = \frac{1}{C s} \cdot I(s)" block />
                <p className="text-slate-400 text-[11px]">Almacena energía en campo electrostático (<MathView math="E = \frac{1}{2} C v^2" />). Se opone a cambios súbitos de voltaje.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-indigo-900/60 text-xs text-slate-300 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Teorema del Divisor de Voltaje Generalizado en Laplace</span>
              </h4>
              <p>
                Permite encontrar la función de transferencia <MathView math="G(s)" /> de cualquier circuito lineal sin plantear ni una sola derivada temporal:
              </p>
              <MathView math="V_{\text{out}}(s) = V_{\text{in}}(s) \cdot \frac{Z_{\text{out}}(s)}{Z_{\text{total}}(s)} \implies G(s) = \frac{Z_{\text{out}}(s)}{\sum Z_i(s)}" block />
              <p className="text-slate-400">
                Por ejemplo, para el circuito RLC serie tomando salida en el capacitor:
              </p>
              <MathView math="G(s) = \frac{Z_C(s)}{Z_R(s) + Z_L(s) + Z_C(s)} = \frac{1/Cs}{R + Ls + 1/Cs} = \frac{1}{LC s^2 + RC s + 1}" block />
            </div>
          </div>
        )}

        {/* Tab 3: Kirchhoff Laws & V-I relations */}
        {activeTab === 'kirchhoff' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400">LEYES CONSTITUTIVAS</span>
              <h3 className="text-xl font-bold text-white mt-1">
                Leyes de Kirchhoff y Relaciones Voltaje-Corriente (V-I)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Ley de Voltajes de Kirchhoff (LVK)</h4>
                <p>La suma algebraica de diferencias de potencial en cualquier trayectoria cerrada (malla) es nula:</p>
                <MathView math="\sum_{k=1}^N v_k(t) = 0" block />
                <p className="text-slate-400 text-[11px]">Principio físico: Conservación de la energía eléctrica en el campo electrostático.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Ley de Corrientes de Kirchhoff (LCK)</h4>
                <p>La suma de corrientes entrantes a cualquier nodo es igual a la suma de corrientes salientes:</p>
                <MathView math="\sum_{k=1}^M i_k(t) = 0" block />
                <p className="text-slate-400 text-[11px]">Principio físico: Conservación estricta de la carga eléctrica.</p>
              </div>
            </div>

            {/* Self-check Quiz */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Autocomprobación de Concepto</span>
              </h4>
              <p className="text-xs text-slate-300">
                En un circuito RLC serie, ¿qué condición entre los componentes produce una respuesta críticamente amortiguada (<MathView math="\zeta = 1" />)?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { text: 'R = 2 · √(L / C)', correct: true },
                  { text: 'R = 0 (Sin resistencia)', correct: false },
                  { text: 'L = C', correct: false },
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuiz(1, i)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      quizAnswers[1] === i
                        ? opt.correct
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-600 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
              {showExplanation[1] && (
                <div className={`p-3 rounded-lg text-xs ${quizAnswers[1] === 0 ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'}`}>
                  {quizAnswers[1] === 0 ? '✓ ¡Exacto! Dado que ζ = (R/2)·√(C/L), para que ζ = 1 se requiere R = 2·√(L/C).' : '✗ Revisa: ζ = (R/2)·√(C/L) = 1 implica R = 2·√(L/C).'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Dynamic SVG Circuit Schematic */}
        {activeTab === 'schematic' && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4 text-center">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Esquema Circuital Interactivo: Circuito {selectedCircuit} Serie</span>
            </h3>

            <div className="w-full flex justify-center py-4">
              <svg width="420" height="180" viewBox="0 0 420 180" className="font-mono text-xs select-none">
                {/* Wires */}
                <path d="M 50 60 L 110 60" stroke="#64748b" strokeWidth="2.5" fill="none" />
                <path d="M 180 60 L 220 60" stroke="#64748b" strokeWidth="2.5" fill="none" />
                <path d="M 290 60 L 340 60 L 340 90" stroke="#64748b" strokeWidth="2.5" fill="none" />
                <path d="M 340 120 L 340 140 L 50 140 L 50 100" stroke="#64748b" strokeWidth="2.5" fill="none" />

                {/* Source Vin at (50, 80) */}
                <circle cx="50" cy="80" r="18" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
                <text x="50" y="85" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">Vin(t)</text>

                {/* Resistor R (110 to 180) */}
                <rect x="110" y="48" width="70" height="24" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                <text x="145" y="64" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">R (Ω)</text>

                {/* Second element */}
                {selectedCircuit === 'RC' ? (
                  // Capacitor at 340
                  <g>
                    <line x1="320" y1="95" x2="360" y2="95" stroke="#34d399" strokeWidth="3" />
                    <line x1="320" y1="108" x2="360" y2="108" stroke="#34d399" strokeWidth="3" />
                    <text x="380" y="105" fill="#34d399" fontSize="11" fontWeight="bold">C (F)</text>
                    <text x="340" y="130" textAnchor="middle" fill="#94a3b8" fontSize="9">Vc(t)</text>
                  </g>
                ) : selectedCircuit === 'RL' ? (
                  // Inductor at 220 to 290
                  <g>
                    <path d="M 220 60 C 235 45 245 45 250 60 C 255 45 265 45 270 60 C 275 45 285 45 290 60" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                    <text x="255" y="40" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">L (H)</text>
                    <path d="M 290 60 L 340 60 L 340 140" stroke="#64748b" strokeWidth="2.5" fill="none" />
                    <text x="360" y="100" fill="#94a3b8" fontSize="10">VL(t)</text>
                  </g>
                ) : (
                  // RLC Series
                  <g>
                    {/* Inductor at 220 to 290 */}
                    <path d="M 220 60 C 235 45 245 45 250 60 C 255 45 265 45 270 60 C 275 45 285 45 290 60" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                    <text x="255" y="40" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">L</text>
                    {/* Capacitor at 340 */}
                    <line x1="320" y1="95" x2="360" y2="95" stroke="#34d399" strokeWidth="3" />
                    <line x1="320" y1="108" x2="360" y2="108" stroke="#34d399" strokeWidth="3" />
                    <text x="380" y="105" fill="#34d399" fontSize="11" fontWeight="bold">C</text>
                  </g>
                )}

                {/* Current arrow */}
                <path d="M 70 50 L 95 50" stroke="#f43f5e" strokeWidth="2" />
                <text x="82" y="43" textAnchor="middle" fill="#f43f5e" fontSize="9">i(t)</text>
              </svg>
            </div>
            <p className="text-xs text-slate-400">
              Circuito de parámetros concentrados ideal. En el Módulo 2 puedes ingresar valores numéricos reales con desglose algebraico en pizarra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
