import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MathView } from './MathView';

export const LaplaceBridgeModule: React.FC = () => {
  // Interactive pole placement in s-plane: sigma and omega
  const [poleSigma, setPoleSigma] = useState<number>(-2.0);
  const [poleOmega, setPoleOmega] = useState<number>(3.0);

  const isStable = poleSigma < 0;
  const isMarginal = Math.abs(poleSigma) < 0.05;
  const isOscillatory = Math.abs(poleOmega) > 0.1;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
          <Layers className="w-4 h-4" />
          <span>Puente Matemático: Del Tiempo t al Dominio Complejo s</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
          Módulo 2: La Transformada de Laplace y el Plano Complejo s
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          ¿Por qué transformar ecuaciones diferenciales ordinarias en álgebra? Porque la convolución en el tiempo se convierte en una simple multiplicación algebraica en el dominio <MathView math="s = \sigma + j\omega" />.
        </p>
      </div>

      {/* Conceptual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-indigo-400 text-sm">1. La Transformada de Laplace</div>
          <MathView math="F(s) = \mathcal{L}\{f(t)\} = \int_{0^-}^{\infty} f(t) \, e^{-st} \, dt" block />
          <p className="text-slate-400">
            Convierte operadores integro-diferenciales en potencias algebraicas de <MathView math="s" />, transformando <MathView math="\frac{d}{dt} \to s" /> y <MathView math="\int dt \to \frac{1}{s}" />.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-cyan-400 text-sm">2. Función de Transferencia G(s)</div>
          <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{N(s)}{D(s)}" block />
          <p className="text-slate-400">
            Relación de entrada-salida bajo condiciones iniciales nulas. Modela la respuesta intrínseca del sistema físico independientemente de la señal de entrada.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-emerald-400 text-sm">3. Polos y Ceros</div>
          <div className="font-mono text-slate-300">
            • Polos: <MathView math="D(s) = 0" /> (Definen estabilidad y velocidad)
          </div>
          <div className="font-mono text-slate-300">
            • Ceros: <MathView math="N(s) = 0" /> (Modulan la amplitud transitoria)
          </div>
          <p className="text-slate-400 pt-1">
            Los polos generan los modos exponenciales naturales <MathView math="e^{p_i t} = e^{\sigma t} e^{j\omega t}" />.
          </p>
        </div>
      </div>

      {/* Interactive S-Plane Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Ubicación de Polo en s = σ + jω</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                isStable ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : isMarginal ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {isStable ? 'Estable' : isMarginal ? 'Marginal' : 'Inestable'}
              </span>
            </h3>

            {/* Sigma Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Parte Real (σ - Atenuación):</span>
                <span className="font-mono text-cyan-400 font-bold">{poleSigma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="3.0"
                step="0.2"
                value={poleSigma}
                onChange={(e) => setPoleSigma(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                {poleSigma < 0 ? 'Decaimiento exponencial hacia 0 (Estable)' : poleSigma === 0 ? 'Amplitud constante (Marginal)' : 'Exponencial divergente (Inestable)'}
              </span>
            </div>

            {/* Omega Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Parte Imaginaria (ω - Frecuencia):</span>
                <span className="font-mono text-amber-400 font-bold">±{Math.abs(poleOmega).toFixed(2)} rad/s</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="8.0"
                step="0.5"
                value={poleOmega}
                onChange={(e) => setPoleOmega(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                {poleOmega === 0 ? 'Respuesta puramente monótona (sin oscilaciones)' : `Oscilaciones a wd = ${poleOmega.toFixed(1)} rad/s`}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-500 block text-[10px]">Modo Temporal Asociado:</span>
              <div className="text-indigo-300 font-bold text-sm">
                y(t) ∝ e^({poleSigma.toFixed(1)}·t) · {poleOmega > 0 ? `cos(${poleOmega.toFixed(1)}·t)` : '1'}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive S-Plane Diagram (SVG) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Mapeo Gráfico en el Plano Complejo s</h3>
            <span className="text-xs text-slate-400 font-mono">Semiplano Izquierdo = Estabilidad</span>
          </div>

          <div className="w-full flex justify-center py-2">
            <svg width="480" height="260" viewBox="0 0 480 260" className="select-none font-sans text-xs">
              {/* Stable background (Left Half Plane) */}
              <rect x="20" y="20" width="220" height="220" fill="#042f2e" opacity="0.4" rx="4" />
              <text x="70" y="45" fill="#14b8a6" fontSize="11" fontWeight="bold">Semiplano Izquierdo (Estable)</text>

              {/* Unstable background (Right Half Plane) */}
              <rect x="240" y="20" width="220" height="220" fill="#450a0a" opacity="0.3" rx="4" />
              <text x="270" y="45" fill="#f87171" fontSize="11" fontWeight="bold">Semiplano Derecho (Inestable)</text>

              {/* Axes */}
              <line x1="20" y1="130" x2="460" y2="130" stroke="#64748b" strokeWidth="1.5" />
              <line x1="240" y1="20" x2="240" y2="240" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

              <text x="455" y="145" fill="#94a3b8" fontSize="11">σ (Real)</text>
              <text x="245" y="32" fill="#94a3b8" fontSize="11">jω (Imag)</text>

              {/* Dynamic Poles plotting */}
              {/* Map sigma: -6 -> x=40, 0 -> x=240, +3 -> x=390 (scale ~30px per unit) */}
              {(() => {
                const cx = 240 + poleSigma * 33;
                const cy1 = 130 - poleOmega * 12;
                const cy2 = 130 + poleOmega * 12;

                return (
                  <g>
                    {/* Pole 1 */}
                    <g transform={`translate(${cx}, ${cy1})`}>
                      <line x1="-6" y1="-6" x2="6" y2="6" stroke="#f59e0b" strokeWidth="2.5" />
                      <line x1="-6" y1="6" x2="6" y2="-6" stroke="#f59e0b" strokeWidth="2.5" />
                      <text x="10" y="4" fill="#f59e0b" fontSize="10" fontWeight="bold">s₁</text>
                    </g>

                    {/* Pole 2 (conjugate if omega > 0) */}
                    {poleOmega > 0 && (
                      <g transform={`translate(${cx}, ${cy2})`}>
                        <line x1="-6" y1="-6" x2="6" y2="6" stroke="#f59e0b" strokeWidth="2.5" />
                        <line x1="-6" y1="6" x2="6" y2="-6" stroke="#f59e0b" strokeWidth="2.5" />
                        <text x="10" y="4" fill="#f59e0b" fontSize="10" fontWeight="bold">s₂</text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="text-xs text-slate-400 text-center">
            Arrastra los sliders a la izquierda para alejar los polos del eje imaginario y observar cómo la respuesta se vuelve exponencialmente más rápida.
          </div>
        </div>
      </div>
    </div>
  );
};
