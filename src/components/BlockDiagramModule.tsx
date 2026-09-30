import React, { useMemo } from 'react';
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { GitBranch, Sliders, Activity, Clock, Zap, RotateCcw, Save, Info, Gauge } from 'lucide-react';
import { MathView } from './MathView';
import { BlockDiagramParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultBlockParams: BlockDiagramParams = {
  loopMode: 'closed',
  K: 2.0,
  tau: 2.0,
  Kp: 1.5,
  H: 1.0,
  inputAmp: 1.0,
};

export const BlockDiagramModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<BlockDiagramParams>(
    'autocontrol_block_diagram_params',
    defaultBlockParams
  );

  const { loopMode, K, tau, Kp, H, inputAmp } = params;

  // Closed loop transfer function calculations:
  // Forward path: G_f(s) = Kp * K / (tau*s + 1)
  // Closed loop: T(s) = G_f(s) / (1 + G_f(s)*H)
  // T(s) = (Kp * K) / (tau * s + 1 + Kp * K * H)
  // Canonic: T(s) = K_cl / (tau_cl * s + 1)
  const denomScale = 1 + Kp * K * H;
  const K_cl = (Kp * K) / denomScale;
  const tau_cl = tau / denomScale;
  const ts_ol = 4 * tau;
  const ts_cl = 4 * tau_cl;
  const speedFactor = denomScale; // How many times faster closed-loop is

  // Simulation time span
  const tMax = Math.max(ts_ol * 1.5, 6);
  const steps = 200;

  // Comparison response data
  const chartData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      // Open loop response to step: inputAmp * K * (1 - e^(-t/tau))
      const y_ol = inputAmp * K * (1 - Math.exp(-t / tau));

      // Closed loop response to step: inputAmp * K_cl * (1 - e^(-t/tau_cl))
      const y_cl = inputAmp * K_cl * (1 - Math.exp(-t / tau_cl));

      data.push({
        time: parseFloat(t.toFixed(3)),
        referencia: inputAmp,
        y_ol: parseFloat(y_ol.toFixed(3)),
        y_cl: parseFloat(y_cl.toFixed(3)),
        y_active: parseFloat((loopMode === 'closed' ? y_cl : y_ol).toFixed(3)),
      });
    }

    return data;
  }, [tMax, steps, inputAmp, K, tau, K_cl, tau_cl, loopMode]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <GitBranch className="w-4 h-4" />
              <span>Diagramas de Bloques y Realimentación</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Visualizador de Diagrama de Bloques Interactivo
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Explora visualmente el flujo de señales en lazo abierto y lazo cerrado con realimentación negativa. Observa cómo los parámetros <MathView math="K" /> y <MathView math="\tau" /> se actualizan en vivo dentro del bloque de la planta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-indigo-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Block Diagram Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Diagrama Esquemático de Señales ({loopMode === 'closed' ? 'Lazo Cerrado' : 'Lazo Abierto'})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Topología canónica con punto de suma, controlador proporcional <MathView math="K_p" />, planta de 1er orden <MathView math="G(s)" /> y sensor <MathView math="H" />.
            </p>
          </div>

          {/* Loop Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setParams(p => ({ ...p, loopMode: 'open' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                loopMode === 'open'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lazo Abierto (G)
            </button>
            <button
              onClick={() => setParams(p => ({ ...p, loopMode: 'closed' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                loopMode === 'closed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lazo Cerrado (Realimentado)
            </button>
          </div>
        </div>

        {/* Scalable Vector Graphics Diagram */}
        <div className="w-full overflow-x-auto py-2 flex justify-center bg-slate-950/80 rounded-xl border border-slate-850 p-4">
          <svg
            width="820"
            height={loopMode === 'closed' ? "260" : "180"}
            viewBox={`0 0 820 ${loopMode === 'closed' ? 260 : 180}`}
            className="select-none font-sans"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
              </marker>
              <linearGradient id="plantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Input Signal Line: R(s) */}
            <path d="M 30 75 L 115 75" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="35" y="62" fill="#38bdf8" fontSize="12" fontWeight="600">R(s) = {inputAmp.toFixed(1)}</text>
            <text x="35" y="93" fill="#64748b" fontSize="10">Referencia</text>

            {/* Summing Junction (only active if closed loop) */}
            {loopMode === 'closed' ? (
              <g>
                <circle cx="130" cy="75" r="15" fill="#0f172a" stroke="#818cf8" strokeWidth="2.5" />
                <text x="130" y="79" textAnchor="middle" fill="#818cf8" fontSize="16" fontWeight="bold">Σ</text>
                <text x="108" y="71" fill="#38bdf8" fontSize="13" fontWeight="bold">+</text>
                <text x="135" y="105" fill="#f43f5e" fontSize="13" fontWeight="bold">−</text>
                {/* Line from Sum to Controller */}
                <path d="M 145 75 L 205 75" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
                <text x="175" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">E(s)</text>
              </g>
            ) : (
              <g>
                {/* Direct line without summing junction */}
                <path d="M 115 75 L 205 75" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
              </g>
            )}

            {/* Controller Block Kp */}
            <g>
              <rect x="210" y="45" width="85" height="60" rx="8" fill="#1e1e38" stroke="#818cf8" strokeWidth="2" />
              <text x="252" y="70" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontWeight="600">Controlador</text>
              <text x="252" y="90" textAnchor="middle" fill="#818cf8" fontSize="13" fontWeight="bold" fontFamily="monospace">Kp = {Kp.toFixed(2)}</text>
            </g>

            {/* Line from Controller to Plant */}
            <path d="M 295 75 L 365 75" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="330" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">U(s)</text>

            {/* Plant Block G(s) */}
            <g>
              <rect x="370" y="32" width="220" height="86" rx="10" fill="url(#plantGrad)" stroke="#06b6d4" strokeWidth="2.5" />
              <text x="480" y="52" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">PLANTA DE 1ER ORDEN G(s)</text>
              {/* LaTeX stylized fraction inside SVG */}
              <text x="480" y="73" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold" fontFamily="monospace">
                K = {K.toFixed(2)}
              </text>
              <line x1="410" y1="80" x2="550" y2="80" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="480" y="98" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold" fontFamily="monospace">
                {tau.toFixed(2)}·s + 1
              </text>
            </g>

            {/* Line from Plant to Branch Point */}
            <path d="M 590 75 L 680 75" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />

            {/* Branch Point */}
            <circle cx="680" cy="75" r="4" fill="#38bdf8" />

            {/* Output Line Y(s) */}
            <path d="M 680 75 L 775 75" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
            <text x="740" y="62" fill="#34d399" fontSize="13" fontWeight="bold">Y(s)</text>
            <text x="740" y="93" fill="#64748b" fontSize="10">Salida</text>

            {/* Feedback Loop (if closed loop) */}
            {loopMode === 'closed' && (
              <g>
                {/* Downward from branch point */}
                <path d="M 680 75 L 680 200 L 555 200" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Feedback Block H(s) */}
                <rect x="420" y="172" width="130" height="56" rx="8" fill="#1e1e38" stroke="#818cf8" strokeWidth="2" />
                <text x="485" y="195" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontWeight="600">Sensor / Sensor H</text>
                <text x="485" y="214" textAnchor="middle" fill="#a5b4fc" fontSize="13" fontWeight="bold" fontFamily="monospace">H = {H.toFixed(2)}</text>

                {/* Return line from H to summing junction */}
                <path d="M 420 200 L 130 200 L 130 95" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="145" y="165" fill="#f43f5e" fontSize="10">B(s) = H·Y</text>
              </g>
            )}
          </svg>
        </div>

        {/* Transfer Function Formula Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Función de Transferencia Directa (Lazo Abierto):</span>
              <span className="font-mono text-cyan-400">G_ol(s)</span>
            </div>
            <MathView math={`G_{ol}(s) = K_p \\cdot G(s) = \\frac{${(Kp * K).toFixed(3)}}{${tau.toFixed(3)}s + 1}`} block />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
              <span>Ganancia K_ol = {(Kp * K).toFixed(2)}</span>
              <span>Constante τ_ol = {tau.toFixed(2)}s</span>
              <span>ts_ol = {ts_ol.toFixed(2)}s</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-semibold">Función de Transferencia en Lazo Cerrado T(s):</span>
              <span className="font-mono text-indigo-400">T(s) = Y(s)/R(s)</span>
            </div>
            <MathView
              math={`T(s) = \\frac{K_p G(s)}{1 + K_p G(s) H} = \\frac{${K_cl.toFixed(3)}}{${tau_cl.toFixed(3)}s + 1}`}
              block
            />
            <div className="flex justify-between text-[11px] text-indigo-300 font-mono pt-1 border-t border-indigo-950">
              <span>K_cl = {K_cl.toFixed(3)}</span>
              <span>τ_cl = {tau_cl.toFixed(3)}s</span>
              <span>ts_cl = {ts_cl.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison & Sliders Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Ajuste de Parámetros de Bloques</span>
              <Sliders className="w-4 h-4 text-cyan-400" />
            </h3>

            {/* Slider K */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ganancia Planta (K):</span>
                <span className="font-mono font-bold text-cyan-400">{K.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={K}
                onChange={(e) => setParams(p => ({ ...p, K: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Slider Tau */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Constante Planta (τ):</span>
                <span className="font-mono font-bold text-cyan-400">{tau.toFixed(2)} s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={tau}
                onChange={(e) => setParams(p => ({ ...p, tau: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Slider Kp */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ganancia Controlador (Kp):</span>
                <span className="font-mono font-bold text-indigo-400">{Kp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={Kp}
                onChange={(e) => setParams(p => ({ ...p, Kp: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Slider H */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ganancia Realimentación (H):</span>
                <span className="font-mono font-bold text-indigo-400">{H.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.1}
                value={H}
                onChange={(e) => setParams(p => ({ ...p, H: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Step Amplitude */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Amplitud Escalón R(s):</span>
                <span className="font-mono font-bold text-emerald-400">{inputAmp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.5}
                value={inputAmp}
                onChange={(e) => setParams(p => ({ ...p, inputAmp: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Feedback physics card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Efecto de la Realimentación en 1er Orden</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              La realimentación negativa divide la constante de tiempo por el factor de sensibilidad <MathView math="1 + K_p K H = " /> <strong className="text-white font-mono">{denomScale.toFixed(2)}</strong>.
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="text-cyan-300">τ_ol = {tau.toFixed(2)}s → τ_cl = {tau_cl.toFixed(2)}s</div>
              <div className="text-emerald-300">El sistema es {speedFactor.toFixed(2)}x veces más rápido en lazo cerrado.</div>
            </div>
          </div>
        </div>

        {/* Right column: Comparison Curve */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Respuesta Dinámica: Lazo Abierto vs Lazo Cerrado</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparación simultánea demostrando la aceleración temporal inducida por la realimentación negativa.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                Aceleración: {speedFactor.toFixed(2)}x
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${v}s`}
                    label={{ value: 'Tiempo [s]', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    label={{ value: 'Respuesta y(t)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(l) => `t = ${l} s`}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                  {/* Reference line */}
                  <ReferenceLine y={inputAmp} stroke="#64748b" strokeDasharray="3 3" />

                  {/* Open loop */}
                  <Line
                    type="monotone"
                    dataKey="y_ol"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name={`Lazo Abierto (τ = ${tau.toFixed(1)}s, y_ss = ${(inputAmp * K).toFixed(1)})`}
                    isAnimationActive={false}
                  />

                  {/* Closed loop */}
                  <Line
                    type="monotone"
                    dataKey="y_cl"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    dot={false}
                    name={`Lazo Cerrado (τ = ${tau_cl.toFixed(2)}s, y_ss = ${(inputAmp * K_cl).toFixed(2)})`}
                    isAnimationActive={false}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">ts Lazo Abierto</div>
                <div className="text-sm font-bold font-mono text-cyan-400">{ts_ol.toFixed(2)} s</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-indigo-900/60">
                <div className="text-[10px] text-slate-500">ts Lazo Cerrado</div>
                <div className="text-sm font-bold font-mono text-indigo-300">{ts_cl.toFixed(2)} s</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Valor Final Lazo Abierto</div>
                <div className="text-sm font-bold font-mono text-cyan-400">{(inputAmp * K).toFixed(2)}</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-indigo-900/60">
                <div className="text-[10px] text-slate-500">Valor Final Lazo Cerrado</div>
                <div className="text-sm font-bold font-mono text-indigo-300">{(inputAmp * K_cl).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
