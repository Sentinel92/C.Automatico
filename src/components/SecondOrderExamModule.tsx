import React, { useState, useMemo } from 'react';
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
  Legend,
} from 'recharts';
import {
  Calculator,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  Award,
  Layers,
  Sliders,
} from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SecondOrderExamParams {
  inputMode: 'poly' | 'canonical';
  // Polynomial form: b0 / (s^2 + a1*s + a0)
  b0: number;
  a1: number;
  a0: number;
  // Canonical form: K*wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
  K_can: number;
  zeta_can: number;
  wn_can: number;
  stepAmp: number;
}

const defaultParams: SecondOrderExamParams = {
  inputMode: 'poly',
  b0: 20.0,
  a1: 4.0,
  a0: 16.0,
  K_can: 1.25,
  zeta_can: 0.5,
  wn_can: 4.0,
  stepAmp: 1.0,
};

export const SecondOrderExamModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<SecondOrderExamParams>(
    'autocontrol_second_order_exam_params',
    defaultParams
  );

  const [activeTab, setActiveTab] = useState<'calculos' | 'grafico' | 'ejemplo_examen'>('calculos');

  const { inputMode, b0, a1, a0, K_can, zeta_can, wn_can, stepAmp } = params;

  // Compute canonical parameters from either form
  const derived = useMemo(() => {
    let K = 1;
    let wn = 1;
    let zeta = 0.5;

    if (inputMode === 'poly') {
      const validA0 = a0 > 0;
      wn = validA0 ? Math.sqrt(a0) : 1;
      zeta = validA0 && wn > 0 ? a1 / (2 * wn) : 0.5;
      K = validA0 ? b0 / a0 : 1;
    } else {
      K = K_can;
      zeta = zeta_can;
      wn = wn_can;
    }

    const isUnderdamped = zeta >= 0 && zeta < 1;
    const isCriticallyDamped = Math.abs(zeta - 1) < 0.02;
    const isOverdamped = zeta > 1.02;
    const isUnstable = zeta < 0;

    const sigma = zeta * wn;
    const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    const beta = isUnderdamped ? Math.acos(Math.max(-1, Math.min(1, zeta))) : 0; // radians
    const betaDeg = (beta * 180) / Math.PI;

    // Transient Metrics
    const tr = isUnderdamped && wd > 0 ? (Math.PI - beta) / wd : 1.8 / wn;
    const tp = isUnderdamped && wd > 0 ? Math.PI / wd : 0;
    const MpPercent = isUnderdamped
      ? Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) * 100
      : 0;
    const ts2 = sigma > 0 ? 4 / sigma : 10;
    const ts5 = sigma > 0 ? 3 / sigma : 8;

    const yFinal = K * stepAmp;
    const peakY = isUnderdamped ? yFinal * (1 + MpPercent / 100) : yFinal;

    return {
      K,
      wn,
      zeta,
      sigma,
      wd,
      beta,
      betaDeg,
      tr,
      tp,
      MpPercent,
      ts2,
      ts5,
      yFinal,
      peakY,
      isUnderdamped,
      isCriticallyDamped,
      isOverdamped,
      isUnstable,
    };
  }, [inputMode, b0, a1, a0, K_can, zeta_can, wn_can, stepAmp]);

  // Simulation Points
  const chartData = useMemo(() => {
    const tMax = Math.max(derived.ts2 * 1.4, 6);
    const steps = 180;
    const dt = tMax / steps;
    const pts = [];

    const { K, wn, zeta, wd, sigma, beta, yFinal, isUnderdamped } = derived;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;

      if (isUnderdamped && wd > 0) {
        // Exact solution: y(t) = yFinal * [1 - (e^(-sigma*t)/sqrt(1-zeta^2)) * sin(wd*t + beta)]
        const factor = Math.exp(-sigma * t) / Math.sqrt(1 - zeta * zeta);
        y = yFinal * (1 - factor * Math.sin(wd * t + beta));
      } else if (Math.abs(zeta - 1) < 0.05) {
        // Critically damped: y(t) = yFinal * [1 - e^(-wn*t)*(1 + wn*t)]
        y = yFinal * (1 - Math.exp(-wn * t) * (1 + wn * t));
      } else if (zeta > 1) {
        // Overdamped
        const s1 = -zeta * wn + wn * Math.sqrt(zeta * zeta - 1);
        const s2 = -zeta * wn - wn * Math.sqrt(zeta * zeta - 1);
        y = yFinal * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
      } else {
        // Unstable / growing
        y = yFinal * (1 - Math.exp(-sigma * t) * Math.cos(wn * t));
      }

      pts.push({
        t: Number(t.toFixed(3)),
        y: Number(y.toFixed(3)),
        finalRef: Number(yFinal.toFixed(3)),
        bandUpper2: Number((yFinal * 1.02).toFixed(3)),
        bandLower2: Number((yFinal * 0.98).toFixed(3)),
      });
    }

    return pts;
  }, [derived]);

  // Load classic exam exercise
  const loadExamExercise = () => {
    setParams({
      inputMode: 'poly',
      b0: 20.0,
      a1: 4.0,
      a0: 16.0,
      K_can: 1.25,
      zeta_can: 0.5,
      wn_can: 4.0,
      stepAmp: 1.0,
    });
    setActiveTab('ejemplo_examen');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-4 h-4" />
              <span>Edición Cuaderno Universitario · Fórmulas Exactas</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 2: Sistemas de 2º Orden y Fórmulas Exactas de Examen
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Cálculo paso a paso de cada fórmula evaluada en exámenes universitarios: <MathView math="\omega_n, \zeta, \omega_d, \beta, t_r, t_p, M_p\%, t_{s2\%}" /> y <MathView math="t_{s5\%}" />, con resolución guiada del problema canónico <MathView math="G(s) = \frac{20}{s^2 + 4s + 16}" />.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadExamExercise}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Cargar Ejercicio de Examen</span>
            </button>
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Valores Iniciales</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('calculos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'calculos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Fórmulas & Cuaderno de Examen
          </button>
          <button
            onClick={() => setActiveTab('grafico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'grafico'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Curva Temporal & Puntos Clave
          </button>
          <button
            onClick={() => setActiveTab('ejemplo_examen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ejemplo_examen'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Resolución Paso a Paso: G(s) = 20/(s² + 4s + 16)
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs Column */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Entrada de Parámetros</span>
            </h3>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setParams((p) => ({ ...p, inputMode: 'poly' }))}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  inputMode === 'poly' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Polinomio
              </button>
              <button
                onClick={() => setParams((p) => ({ ...p, inputMode: 'canonical' }))}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  inputMode === 'canonical' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                (K, ζ, ωn)
              </button>
            </div>
          </div>

          {inputMode === 'poly' ? (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400">
                Forma polinomial: <MathView math="G(s) = \frac{b_0}{s^2 + a_1 s + a_0}" />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Numerador b₀:</label>
                <input
                  type="number"
                  step="0.5"
                  value={b0}
                  onChange={(e) => setParams((p) => ({ ...p, b0: parseFloat(e.target.value) || 0 }))}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Coeficiente a₁ (Término en s):</label>
                <input
                  type="number"
                  step="0.2"
                  value={a1}
                  onChange={(e) => setParams((p) => ({ ...p, a1: parseFloat(e.target.value) || 0 }))}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Coeficiente a₀ (Término independiente):</label>
                <input
                  type="number"
                  step="0.5"
                  value={a0}
                  onChange={(e) => setParams((p) => ({ ...p, a0: parseFloat(e.target.value) || 1 }))}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400">
                Forma canónica: <MathView math="G(s) = \frac{K \omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}" />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Ganancia K:</span>
                  <span className="font-mono text-cyan-400">{K_can.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.05"
                  value={K_can}
                  onChange={(e) => setParams((p) => ({ ...p, K_can: parseFloat(e.target.value) }))}
                  className="w-full mt-1 accent-cyan-500 bg-slate-800 h-1.5 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Amortiguamiento ζ:</span>
                  <span className="font-mono text-indigo-400 font-bold">{zeta_can.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.5"
                  step="0.05"
                  value={zeta_can}
                  onChange={(e) => setParams((p) => ({ ...p, zeta_can: parseFloat(e.target.value) }))}
                  className="w-full mt-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Frecuencia Natural ωn (rad/s):</span>
                  <span className="font-mono text-emerald-400 font-bold">{wn_can.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.2"
                  value={wn_can}
                  onChange={(e) => setParams((p) => ({ ...p, wn_can: parseFloat(e.target.value) }))}
                  className="w-full mt-1 accent-emerald-500 bg-slate-800 h-1.5 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step Amplitude */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-300 font-medium">Amplitud Escalón A:</label>
            <input
              type="number"
              step="0.5"
              value={stepAmp}
              onChange={(e) => setParams((p) => ({ ...p, stepAmp: parseFloat(e.target.value) || 1 }))}
              className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Current Transfer Function */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Función de Transferencia:
            </div>
            <div className="text-indigo-300 py-1">
              <MathView
                math={`G(s) = \\frac{${(derived.K * derived.wn * derived.wn).toFixed(2)}}{s^2 + ${(2 * derived.zeta * derived.wn).toFixed(2)}s + ${(derived.wn * derived.wn).toFixed(2)}}`}
                block
              />
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'calculos' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>Fórmulas de Examen y Desglose Exacto</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  derived.isUnderdamped ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {derived.isUnderdamped ? 'Subamortiguado (0 < ζ < 1)' : derived.isCriticallyDamped ? 'Crítico (ζ = 1)' : 'Sobreamortiguado (ζ > 1)'}
                </span>
              </div>

              {/* Exact Formula Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. wn */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>1. Frecuencia Natural (ωn)</span>
                    <span className="font-mono text-emerald-400 font-bold">{derived.wn.toFixed(3)} rad/s</span>
                  </div>
                  <MathView math={`\\omega_n = \\sqrt{a_0} = \\sqrt{${(derived.wn * derived.wn).toFixed(2)}} = ${derived.wn.toFixed(3)}\\,\\text{rad/s}`} block />
                </div>

                {/* 2. zeta */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>2. Amortiguamiento (ζ)</span>
                    <span className="font-mono text-indigo-400 font-bold">{derived.zeta.toFixed(4)}</span>
                  </div>
                  <MathView math={`\\zeta = \\frac{a_1}{2\\omega_n} = \\frac{${(2 * derived.zeta * derived.wn).toFixed(2)}}{2(${derived.wn.toFixed(2)})} = ${derived.zeta.toFixed(4)}`} block />
                </div>

                {/* 3. wd */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>3. Frecuencia Amortiguada (ωd)</span>
                    <span className="font-mono text-cyan-400 font-bold">{derived.wd.toFixed(3)} rad/s</span>
                  </div>
                  <MathView math={`\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2} = ${derived.wn.toFixed(2)} \\sqrt{1 - ${derived.zeta.toFixed(2)}^2} = ${derived.wd.toFixed(3)}\\,\\text{rad/s}`} block />
                </div>

                {/* 4. beta */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>4. Ángulo Beta (β)</span>
                    <span className="font-mono text-amber-400 font-bold">{derived.beta.toFixed(3)} rad ({derived.betaDeg.toFixed(1)}°)</span>
                  </div>
                  <MathView math={`\\beta = \\arccos(\\zeta) = \\arccos(${derived.zeta.toFixed(3)}) = ${derived.beta.toFixed(3)}\\,\\text{rad}`} block />
                </div>

                {/* 5. tr */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>5. Tiempo Levantamiento (tr)</span>
                    <span className="font-mono text-emerald-400 font-bold">{derived.tr.toFixed(3)} s</span>
                  </div>
                  <MathView math={`t_r = \\frac{\\pi - \\beta}{\\omega_d} = \\frac{\\pi - ${derived.beta.toFixed(3)}}{${derived.wd.toFixed(3)}} = ${derived.tr.toFixed(3)}\\,\\text{s}`} block />
                </div>

                {/* 6. tp */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>6. Tiempo de Pico (tp)</span>
                    <span className="font-mono text-rose-400 font-bold">{derived.tp.toFixed(3)} s</span>
                  </div>
                  <MathView math={`t_p = \\frac{\\pi}{\\omega_d} = \\frac{\\pi}{${derived.wd.toFixed(3)}} = ${derived.tp.toFixed(3)}\\,\\text{s}`} block />
                </div>

                {/* 7. Mp */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>7. Sobrepico (Mp %)</span>
                    <span className="font-mono text-amber-400 font-bold">{derived.MpPercent.toFixed(2)} %</span>
                  </div>
                  <MathView math={`M_p\\% = 100 \\cdot e^{-\\frac{\\zeta \\pi}{\\sqrt{1-\\zeta^2}}} = ${derived.MpPercent.toFixed(2)}\\%`} block />
                </div>

                {/* 8. ts 2% & ts 5% */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="text-slate-400 font-semibold flex justify-between">
                    <span>8. Asentamiento (ts 2% & 5%)</span>
                    <span className="font-mono text-indigo-400 font-bold">{derived.ts2.toFixed(3)} s (2%)</span>
                  </div>
                  <MathView math={`t_{s2\\%} = \\frac{4}{\\zeta \\omega_n} = ${derived.ts2.toFixed(3)}\\,\\text{s} \\quad | \\quad t_{s5\\%} = \\frac{3}{\\zeta \\omega_n} = ${derived.ts5.toFixed(3)}\\,\\text{s}`} block />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grafico' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Respuesta Temporal al Escalón con Marcadores de Examen</span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-rose-400">tp = {derived.tp.toFixed(2)} s</span>
                  <span>·</span>
                  <span className="text-amber-400">Mp = {derived.MpPercent.toFixed(1)}%</span>
                  <span>·</span>
                  <span className="text-indigo-400">ts(2%) = {derived.ts2.toFixed(2)} s</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine
                    data={chartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="t"
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'Tiempo t (s)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any) => [Number(val).toFixed(3), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />

                    {/* Final value */}
                    <Line
                      type="monotone"
                      dataKey="finalRef"
                      name="Valor Final y(∞)"
                      stroke="#64748b"
                      strokeDasharray="4 4"
                      dot={false}
                    />

                    {/* Band 2% */}
                    <Line
                      type="monotone"
                      dataKey="bandUpper2"
                      name="+2% Tolerancia"
                      stroke="#334155"
                      strokeDasharray="2 2"
                      dot={false}
                    />

                    {/* Response y(t) */}
                    <Line
                      type="monotone"
                      dataKey="y"
                      name="Salida y(t)"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={false}
                    />

                    {/* Markers */}
                    {derived.isUnderdamped && derived.tp > 0 && (
                      <ReferenceLine
                        x={Number(derived.tp.toFixed(3))}
                        stroke="#f43f5e"
                        strokeDasharray="3 3"
                        label={{ value: `tp=${derived.tp.toFixed(2)}s`, position: 'top', fill: '#f43f5e', fontSize: 10 }}
                      />
                    )}
                    <ReferenceLine
                      x={Number(derived.ts2.toFixed(3))}
                      stroke="#818cf8"
                      strokeDasharray="3 3"
                      label={{ value: `ts(2%)=${derived.ts2.toFixed(2)}s`, position: 'top', fill: '#818cf8', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={derived.peakY}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      label={{ value: `Pico=${derived.peakY.toFixed(2)}`, position: 'right', fill: '#f59e0b', fontSize: 10 }}
                    />

                    {/* Dots */}
                    {derived.isUnderdamped && (
                      <ReferenceDot
                        x={Number(derived.tp.toFixed(3))}
                        y={Number(derived.peakY.toFixed(3))}
                        r={4}
                        fill="#f43f5e"
                        stroke="#fff"
                      />
                    )}
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'ejemplo_examen' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Problema Típico de Examen Universitario</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Enunciado: Dado el sistema <MathView math="G(s) = \frac{20}{s^2 + 4s + 16}" /> excitado por un escalón unitario, determine todas sus especificaciones temporales.
                </h3>
              </div>

              {/* Step by step blackboard */}
              <div className="space-y-3 text-xs">
                {/* Paso 1 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <div className="font-bold text-indigo-400">Paso 1: Identificación con la Forma Canónica</div>
                  <MathView math="s^2 + 2\zeta\omega_n s + \omega_n^2 = s^2 + 4s + 16" block />
                  <div className="text-slate-300">
                    • <MathView math="\omega_n^2 = 16 \implies \omega_n = 4.0\,\text{rad/s}" />
                  </div>
                  <div className="text-slate-300">
                    • <MathView math="2\zeta\omega_n = 4 \implies 2\zeta(4) = 4 \implies 8\zeta = 4 \implies \zeta = 0.5" />
                  </div>
                  <div className="text-slate-300">
                    • Ganancia estática: <MathView math="K = \frac{b_0}{a_0} = \frac{20}{16} = 1.25" />
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    Conclusión: Como <MathView math="0 < \zeta = 0.5 < 1" />, el sistema es subamortiguado.
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <div className="font-bold text-cyan-400">Paso 2: Frecuencia Amortiguada y Ángulo Beta</div>
                  <MathView math="\omega_d = \omega_n \sqrt{1 - \zeta^2} = 4 \sqrt{1 - 0.5^2} = 4 \sqrt{0.75} = 4(0.866) = 3.464\,\text{rad/s}" block />
                  <MathView math="\beta = \arccos(\zeta) = \arccos(0.5) = \frac{\pi}{3} \approx 1.0472\,\text{rad} \quad (60^\circ)" block />
                </div>

                {/* Paso 3 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <div className="font-bold text-emerald-400">Paso 3: Tiempos de Levantamiento (tr) y Pico (tp)</div>
                  <MathView math="t_r = \frac{\pi - \beta}{\omega_d} = \frac{\pi - \frac{\pi}{3}}{3.464} = \frac{2\pi / 3}{3.464} = \frac{2.0944}{3.464} = 0.605\,\text{s}" block />
                  <MathView math="t_p = \frac{\pi}{\omega_d} = \frac{3.1416}{3.464} = 0.907\,\text{s}" block />
                </div>

                {/* Paso 4 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <div className="font-bold text-amber-400">Paso 4: Sobreimpulso Porcentual (Mp %)</div>
                  <MathView math="M_p = e^{-\frac{\zeta \pi}{\sqrt{1-\zeta^2}}} = e^{-\frac{0.5 \pi}{\sqrt{0.75}}} = e^{-\frac{1.5708}{0.8660}} = e^{-1.8138} \approx 0.163 \implies 16.3\%" block />
                  <div className="text-slate-300">
                    Valor máximo de la salida: <MathView math="y_{\text{pico}} = K \cdot A \cdot (1 + M_p) = 1.25 \times 1 \times 1.163 = 1.454\,\text{V}" />
                  </div>
                </div>

                {/* Paso 5 */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <div className="font-bold text-rose-400">Paso 5: Tiempos de Establecimiento al 2% y al 5%</div>
                  <MathView math="t_{s2\%} = \frac{4}{\zeta \omega_n} = \frac{4}{0.5 \times 4} = \frac{4}{2} = 2.0\,\text{s}" block />
                  <MathView math="t_{s5\%} = \frac{3}{\zeta \omega_n} = \frac{3}{0.5 \times 4} = \frac{3}{2} = 1.5\,\text{s}" block />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
