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
  ReferenceDot,
} from 'recharts';
import { Calculator, Clock, Compass, Activity, ArrowUpRight, RotateCcw, Sliders, Eye, Save, AlertTriangle, Target, Zap } from 'lucide-react';
import { MathView } from './MathView';
import { CanonicalParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Preset1st {
  name: string;
  desc: string;
  a: number;
  b: number;
  c: number;
  A: number;
}

const presets1st: Preset1st[] = [
  { name: 'Sensor PT100', desc: 'Termoresistencia con inercia media', a: 3.5, b: 1, c: 1, A: 20 },
  { name: 'Motor DC (Velocidad)', desc: 'Constante electromecánica', a: 0.8, b: 2.5, c: 15, A: 12 },
  { name: 'Tanque Hidráulico', desc: 'Resistencia y capacitancia de área', a: 12.0, b: 2.0, c: 4.0, A: 5 },
  { name: 'Filtro RC Rápido', desc: 'Pasa-bajos canónico veloz', a: 0.15, b: 1.0, c: 1.0, A: 3.3 },
];

interface Preset2nd {
  name: string;
  desc: string;
  wn: number;
  zeta: number;
  K2: number;
  A: number;
}

const presets2nd: Preset2nd[] = [
  { name: 'Servomotor Posición (ζ=0.5)', desc: 'Subamortiguado estándar (Mp ≈ 16%)', wn: 4.0, zeta: 0.5, K2: 1.0, A: 1.0 },
  { name: 'Suspensión Auto (ζ=0.25)', desc: 'Altamente oscilatorio (Mp ≈ 44%)', wn: 6.0, zeta: 0.25, K2: 1.0, A: 2.0 },
  { name: 'Circuito RLC Crítico (ζ=1.0)', desc: 'Respuesta más rápida sin sobrepaso', wn: 5.0, zeta: 1.0, K2: 1.0, A: 5.0 },
  { name: 'Proceso Sobreamortiguado (ζ=1.8)', desc: 'Dos polos reales separados', wn: 3.0, zeta: 1.8, K2: 1.0, A: 10.0 },
];

const defaultParams: CanonicalParams = {
  systemOrder: '1st',
  a: 2.0,
  b: 1.0,
  c: 3.0,
  A: 2.0,
  wn: 4.0,
  zeta: 0.45,
  K2: 1.0,
};

export const CanonicalCalculatorModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<CanonicalParams>(
    'autocontrol_canonical_params',
    defaultParams
  );

  const [showTangent, setShowTangent] = useLocalStorage<boolean>(
    'autocontrol_canonical_show_tangent',
    true
  );
  const [showToleranceBand, setShowToleranceBand] = useLocalStorage<boolean>(
    'autocontrol_canonical_show_band',
    true
  );

  const { systemOrder, a, b, c, A, wn, zeta, K2 } = params;

  // --- 1st Order Calculations ---
  const isValid1st = b !== 0 && a !== 0;
  const K1 = useMemo(() => (b !== 0 ? c / b : 0), [c, b]);
  const tau1 = useMemo(() => (b !== 0 ? a / b : 0), [a, b]);
  const pole1 = useMemo(() => (tau1 !== 0 ? -1 / tau1 : 0), [tau1]);
  const ts1_2 = useMemo(() => 4 * tau1, [tau1]);
  const tr1 = useMemo(() => 2.197 * tau1, [tau1]);
  const yFinal1 = useMemo(() => A * K1, [A, K1]);
  const essStep1 = useMemo(() => A * (1 - K1), [A, K1]);
  const initialSlope1 = useMemo(() => (tau1 !== 0 ? yFinal1 / tau1 : 0), [yFinal1, tau1]);
  const yTau1 = useMemo(() => yFinal1 * 0.63212, [yFinal1]);
  const y4Tau1 = useMemo(() => yFinal1 * 0.98168, [yFinal1]);

  // --- 2nd Order Calculations ---
  const isValid2nd = wn > 0 && zeta >= 0;
  const sigma = useMemo(() => zeta * wn, [zeta, wn]);
  const wd = useMemo(() => (zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0), [zeta, wn]);
  const Mp = useMemo(() => {
    if (zeta >= 1 || zeta <= 0) return 0;
    return Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) * 100;
  }, [zeta]);
  const tp = useMemo(() => (zeta < 1 && wd > 0 ? Math.PI / wd : 0), [zeta, wd]);
  const ts2_2 = useMemo(() => (sigma > 0 ? 4 / sigma : 0), [sigma]);
  const tr2 = useMemo(() => {
    if (zeta < 1 && wd > 0) {
      const beta = Math.acos(zeta);
      return (Math.PI - beta) / wd;
    }
    return 2.2 / (zeta * wn || 1);
  }, [zeta, wn, wd]);
  const yFinal2 = useMemo(() => A * K2, [A, K2]);
  const essStep2 = useMemo(() => A * (1 - K2), [A, K2]);

  // Poles string for 2nd order
  const poles2ndStr = useMemo(() => {
    if (zeta < 1) {
      return `s = -${sigma.toFixed(3)} ± j${wd.toFixed(3)}`;
    } else if (Math.abs(zeta - 1) < 1e-4) {
      return `s₁ = s₂ = -${wn.toFixed(3)} (doble real)`;
    } else {
      const r = wn * Math.sqrt(zeta * zeta - 1);
      return `s₁ = ${(-sigma + r).toFixed(3)}, s₂ = ${(-sigma - r).toFixed(3)}`;
    }
  }, [zeta, sigma, wd, wn]);

  // Classification label for 2nd order
  const classification2nd = useMemo(() => {
    if (zeta < 1) return { label: 'Subamortiguado (0 < ζ < 1)', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
    if (Math.abs(zeta - 1) < 1e-4) return { label: 'Críticamente Amortiguado (ζ = 1)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    return { label: 'Sobreamortiguado (ζ > 1)', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
  }, [zeta]);

  // --- Dynamic Curve Points ---
  const chartData = useMemo(() => {
    if (systemOrder === '1st') {
      if (!isValid1st || tau1 <= 0) return [];
      const tMax = Math.max(tau1 * 6, 1);
      const steps = 150;
      const dt = tMax / steps;
      const data = [];

      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const y = yFinal1 * (1 - Math.exp(-t / tau1));
        const tangentVal = t <= tau1 * 1.15 ? initialSlope1 * t : null;

        data.push({
          time: parseFloat(t.toFixed(3)),
          y: parseFloat(y.toFixed(3)),
          yFinal: parseFloat(yFinal1.toFixed(3)),
          upperBand: parseFloat((yFinal1 * 1.02).toFixed(3)),
          lowerBand: parseFloat((yFinal1 * 0.98).toFixed(3)),
          tangent: tangentVal !== null ? parseFloat(tangentVal.toFixed(3)) : null,
        });
      }
      return data;
    } else {
      if (!isValid2nd) return [];
      const tMax = Math.max(ts2_2 * 1.5, 4);
      const steps = 250;
      const dt = tMax / steps;
      const data = [];

      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        let y = 0;

        if (zeta < 1) {
          // Underdamped
          const beta = Math.acos(zeta);
          y = yFinal2 * (1 - (Math.exp(-sigma * t) / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t + beta));
        } else if (Math.abs(zeta - 1) < 1e-4) {
          // Critically damped
          y = yFinal2 * (1 - Math.exp(-wn * t) * (1 + wn * t));
        } else {
          // Overdamped
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = yFinal2 * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }

        data.push({
          time: parseFloat(t.toFixed(3)),
          y: parseFloat(y.toFixed(3)),
          yFinal: parseFloat(yFinal2.toFixed(3)),
          upperBand: parseFloat((yFinal2 * 1.02).toFixed(3)),
          lowerBand: parseFloat((yFinal2 * 0.98).toFixed(3)),
          tangent: null,
        });
      }
      return data;
    }
  }, [systemOrder, isValid1st, tau1, yFinal1, initialSlope1, isValid2nd, ts2_2, zeta, sigma, wd, yFinal2, wn]);

  const isValidCurrent = systemOrder === '1st' ? isValid1st : isValid2nd;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-4 h-4" />
              <span>Cálculo Inmediato y Normalización</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Calculadora de Sistemas Canónicos (1er y 2º Orden)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Configura y simula la respuesta temporal analítica para sistemas de 1er orden (<MathView math="a \cdot y' + b \cdot y = c \cdot r" />) o de 2º orden estándar (<MathView math="\omega_n, \zeta, K" />) con visualización de polos y métricas de transitorio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            {/* System Order Selector */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setParams(p => ({ ...p, systemOrder: '1st' }))}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  systemOrder === '1st'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1er Orden
              </button>
              <button
                onClick={() => setParams(p => ({ ...p, systemOrder: '2nd' }))}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  systemOrder === '2nd'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2º Orden
              </button>
            </div>

            <button
              onClick={() => {
                resetParams();
                setShowTangent(true);
                setShowToleranceBand(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Restablecer valores por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset selector bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Presets de Procesos ({systemOrder === '1st' ? '1er Orden' : '2º Orden'}):
        </span>
        {systemOrder === '1st' ? (
          presets1st.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setParams(p => ({ ...p, a: preset.a, b: preset.b, c: preset.c, A: preset.A }))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-indigo-500/50 hover:text-white text-slate-300 transition-all shrink-0"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))
        ) : (
          presets2nd.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setParams(p => ({ ...p, wn: preset.wn, zeta: preset.zeta, K2: preset.K2, A: preset.A }))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-indigo-500/50 hover:text-white text-slate-300 transition-all shrink-0"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))
        )}
      </div>

      {/* Input panel & Live Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Inputs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>{systemOrder === '1st' ? 'Coeficientes de 1er Orden' : 'Parámetros de 2º Orden'}</span>
              <span className="text-[11px] font-mono text-indigo-400">{systemOrder === '1st' ? 'a·y\' + b·y = c·r' : 'wn & zeta'}</span>
            </h3>

            {systemOrder === '1st' ? (
              <div className="space-y-3">
                {/* Coeff a */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-mono font-semibold">Coeficiente a (de y'(t)):</span>
                    <span className="text-indigo-400 font-mono font-bold">{a}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={a}
                    onChange={(e) => setParams(p => ({ ...p, a: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Coeff b */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-mono font-semibold">Coeficiente b (de y(t)):</span>
                    <span className="text-indigo-400 font-mono font-bold">{b}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={b}
                    onChange={(e) => setParams(p => ({ ...p, b: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Coeff c */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-mono font-semibold">Coeficiente c (de r(t)):</span>
                    <span className="text-indigo-400 font-mono font-bold">{c}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={c}
                    onChange={(e) => setParams(p => ({ ...p, c: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Step A */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-mono font-semibold">Amplitud de Escalón (A):</span>
                    <span className="text-indigo-400 font-mono font-bold">{A}</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={A}
                    onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Wn */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold">Frecuencia Natural (ω_n):</span>
                    <span className="text-indigo-400 font-mono font-bold">{wn} rad/s</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={wn}
                    onChange={(e) => setParams(p => ({ ...p, wn: Math.max(parseFloat(e.target.value) || 0.1, 0.1) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Zeta */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold">Amortiguamiento (ζ):</span>
                    <span className="text-indigo-400 font-mono font-bold">{zeta.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.5"
                    step="0.05"
                    value={zeta}
                    onChange={(e) => setParams(p => ({ ...p, zeta: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.1 (Sub)</span>
                    <span>1.0 (Crítico)</span>
                    <span>2.5 (Sobre)</span>
                  </div>
                </div>

                {/* K2 */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold">Ganancia Estática (K):</span>
                    <span className="text-indigo-400 font-mono font-bold">{K2}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={K2}
                    onChange={(e) => setParams(p => ({ ...p, K2: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Step A */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold">Amplitud de Escalón (A):</span>
                    <span className="text-indigo-400 font-mono font-bold">{A}</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={A}
                    onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Differential Equation Live Display */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1">Modelo Matemático:</div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-center text-xs text-white overflow-x-auto">
                {systemOrder === '1st' ? (
                  <MathView
                    math={`${a} \\cdot \\frac{dy(t)}{dt} + ${b} \\cdot y(t) = ${c} \\cdot r(t)`}
                    block
                  />
                ) : (
                  <MathView
                    math={`G(s) = \\frac{${(K2 * wn * wn).toFixed(2)}}{s^2 + ${(2 * zeta * wn).toFixed(2)}s + ${(wn * wn).toFixed(2)}}`}
                    block
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mathematical Expressions card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Expresiones Analíticas Formales
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-0.5">Función de Transferencia G(s):</div>
                {systemOrder === '1st' ? (
                  <MathView
                    math={`G(s) = \\frac{${K1.toFixed(3)}}{${tau1.toFixed(3)}s + 1}`}
                    block
                  />
                ) : (
                  <MathView
                    math={`G(s) = \\frac{${(K2 * wn * wn).toFixed(2)}}{s^2 + ${(2 * sigma).toFixed(2)}s + ${(wn * wn).toFixed(2)}}`}
                    block
                  />
                )}
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-0.5">Ubicación de Polos en el Plano s:</div>
                <div className="text-xs font-mono text-cyan-300 py-1 text-center">
                  {systemOrder === '1st' ? `s = ${pole1.toFixed(3)} rad/s` : poles2ndStr}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Metrics & Recharts Graph */}
        <div className="lg:col-span-8 space-y-6">
          {!isValidCurrent ? (
            <div className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-base font-bold text-amber-200">
                  Advertencia de Consistencia Física
                </h4>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  {systemOrder === '1st'
                    ? 'Los coeficientes a y b deben ser distintos de cero para definir un sistema dinámico LTI de primer orden.'
                    : 'La frecuencia natural wn debe ser estrictamente positiva (wn > 0).'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              {systemOrder === '1st' ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Ganancia K</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-2">{K1.toFixed(3)}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">c/b = {c}/{b}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Constante τ</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 mt-2">{tau1.toFixed(3)} s</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">a/b = {a}/{b}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Establec. t_s</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-2">{ts1_2.toFixed(3)} s</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">4 · τ (2%)</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Polo s₁</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-2">{pole1.toFixed(3)}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">s = -1/τ</div>
                  </div>
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between col-span-2 sm:col-span-1 ${
                    Math.abs(essStep1) < 1e-4 ? 'border-emerald-800/80 bg-emerald-950/20' : 'border-amber-800/80 bg-amber-950/20'
                  }`}>
                    <span className="text-xs text-slate-400">Error e_ss</span>
                    <div className={`text-lg sm:text-xl font-bold font-mono mt-2 ${Math.abs(essStep1) < 1e-4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {essStep1.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">A(1-K)</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Amortiguam. ζ</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 mt-2">{zeta.toFixed(3)}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">wn = {wn.toFixed(1)} r/s</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Sobrepico Mp</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-2">{Mp.toFixed(2)} %</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{zeta < 1 ? 'e^(-ζπ/√(1-ζ²))' : 'Sin sobrepico'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Tiempo Pico tp</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-2">
                      {tp > 0 ? `${tp.toFixed(3)} s` : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">π / ω_d</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Asentam. t_s</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-2">{ts2_2.toFixed(3)} s</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">4 / (ζ·ω_n) (2%)</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-400">Frec. Amort. ω_d</span>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white mt-2">
                      {wd > 0 ? `${wd.toFixed(3)}` : '0'} <span className="text-xs text-slate-400 font-sans">rad/s</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">ω_n·√(1-ζ²)</div>
                  </div>
                </div>
              )}

              {/* Classification badge for 2nd order */}
              {systemOrder === '2nd' && (
                <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${classification2nd.color}`}>
                  <span className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Régimen Dinámico: {classification2nd.label}</span>
                  </span>
                  <span className="font-mono text-[11px]">{poles2ndStr}</span>
                </div>
              )}
            </>
          )}

          {/* Dynamic Recharts Response Plot */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Respuesta al Escalón y(t) vs Tiempo ({systemOrder === '1st' ? '1er Orden' : '2º Orden'})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulación analítica exacta con marcas características
                </p>
              </div>

              {/* Graph toggles */}
              <div className="flex items-center gap-2 text-xs">
                {systemOrder === '1st' && (
                  <button
                    onClick={() => setShowTangent(!showTangent)}
                    className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                      showTangent
                        ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Tangente t=0</span>
                  </button>
                )}
                <button
                  onClick={() => setShowToleranceBand(!showToleranceBand)}
                  className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                    showToleranceBand
                      ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Banda ±2%</span>
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-72 w-full pt-2">
              {!isValidCurrent ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
                  <AlertTriangle className="w-8 h-8 text-amber-400/70" />
                  <span className="text-xs text-slate-400">Parámetros no válidos para el cálculo</span>
                </div>
              ) : (
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
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
                      label={{ value: 'Amplitud y(t)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(label) => `Tiempo: ${label} s`}
                      formatter={(value: any, name: any) => {
                        if (name === 'y') return [`${value}`, 'Respuesta y(t)'];
                        if (name === 'tangent') return [`${value}`, 'Tangente Inicial'];
                        if (name === 'yFinal') return [`${value}`, 'Valor Final'];
                        return [`${value}`, `${name ?? ''}`];
                      }}
                    />

                    {/* Final value asymptote */}
                    <ReferenceLine
                      y={systemOrder === '1st' ? yFinal1 : yFinal2}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: `y_ss = ${(systemOrder === '1st' ? yFinal1 : yFinal2).toFixed(2)}`, fill: '#10b981', position: 'right', fontSize: 11 }}
                    />

                    {/* Tolerance band */}
                    {showToleranceBand && (
                      <>
                        <ReferenceLine y={(systemOrder === '1st' ? yFinal1 : yFinal2) * 1.02} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.4} />
                        <ReferenceLine y={(systemOrder === '1st' ? yFinal1 : yFinal2) * 0.98} stroke="#f59e0b" strokeDasharray="2 2" strokeOpacity={0.4} />
                      </>
                    )}

                    {/* Markers for 1st order */}
                    {systemOrder === '1st' && tau1 > 0 && (
                      <>
                        <ReferenceLine x={parseFloat(tau1.toFixed(2))} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: `τ = ${tau1.toFixed(1)}s (63.2%)`, fill: '#38bdf8', position: 'top', fontSize: 10 }} />
                        <ReferenceDot x={parseFloat(tau1.toFixed(2))} y={parseFloat(yTau1.toFixed(2))} r={4} fill="#38bdf8" stroke="#0284c7" />
                        <ReferenceLine x={parseFloat(ts1_2.toFixed(2))} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: `4τ = ${ts1_2.toFixed(1)}s (98.2%)`, fill: '#fbbf24', position: 'top', fontSize: 10 }} />
                        <ReferenceDot x={parseFloat(ts1_2.toFixed(2))} y={parseFloat(y4Tau1.toFixed(2))} r={4} fill="#fbbf24" stroke="#d97706" />
                      </>
                    )}

                    {/* Markers for 2nd order */}
                    {systemOrder === '2nd' && tp > 0 && zeta < 1 && (
                      <>
                        <ReferenceLine x={parseFloat(tp.toFixed(2))} stroke="#ec4899" strokeDasharray="3 3" label={{ value: `tp = ${tp.toFixed(2)}s (Pico)`, fill: '#ec4899', position: 'top', fontSize: 10 }} />
                        <ReferenceLine x={parseFloat(ts2_2.toFixed(2))} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: `ts = ${ts2_2.toFixed(2)}s`, fill: '#fbbf24', position: 'top', fontSize: 10 }} />
                      </>
                    )}

                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={false}
                      name="y"
                      isAnimationActive={false}
                    />

                    {systemOrder === '1st' && showTangent && (
                      <Line
                        type="monotone"
                        dataKey="tangent"
                        stroke="#818cf8"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name="tangent"
                        isAnimationActive={false}
                        connectNulls={false}
                      />
                    )}
                  </RechartsLine>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
