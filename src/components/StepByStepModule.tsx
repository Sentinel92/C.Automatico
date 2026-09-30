import React, { useMemo, useState } from 'react';
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
import {
  Calculator,
  RotateCcw,
  Save,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MathView } from './MathView';
import { CanonicalParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultParams: CanonicalParams = {
  systemOrder: '1st',
  a1: 2.0,
  a0: 1.0,
  b0: 3.0,
  A: 2.0,
  a2: 1.0,
  a1_2: 2.4,
  a0_2: 16.0,
  b0_2: 16.0,
  inputMode: 'diff_eq',
  wn: 4.0,
  zeta: 0.3,
  K2: 1.0,
};

export const StepByStepModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<CanonicalParams>(
    'autocontrol_stepbystep_params',
    defaultParams
  );

  const [activeStepTab, setActiveStepTab] = useState<'pizarra' | 'grafico'>('pizarra');

  const {
    systemOrder,
    a1,
    a0,
    b0,
    A,
    a2,
    a1_2,
    a0_2,
    b0_2,
  } = params;

  // 1st order calculations
  const firstOrder = useMemo(() => {
    const valid = a1 !== 0 && a0 !== 0;
    const K = valid ? b0 / a0 : 0;
    const tau = valid ? a1 / a0 : 0;
    const pole = valid ? -a0 / a1 : 0;
    const ts = valid ? 4 * Math.abs(tau) : 0;
    const tr = valid ? 2.2 * Math.abs(tau) : 0;
    const yFinal = A * K;
    return { valid, K, tau, pole, ts, tr, yFinal };
  }, [a1, a0, b0, A]);

  // 2nd order calculations
  const secondOrder = useMemo(() => {
    const valid = a2 !== 0 && a0_2 > 0;
    const wn = valid ? Math.sqrt(a0_2 / a2) : 1;
    const zeta = valid ? a1_2 / (2 * a2 * wn) : 0.5;
    const K = valid ? b0_2 / a0_2 : 1;
    const isUnderdamped = zeta < 1;
    const isCriticallyDamped = Math.abs(zeta - 1) < 0.01;
    const isOverdamped = zeta > 1.01;

    const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    const sigma = zeta * wn;

    // Transient metrics for underdamped
    const MpPercent = isUnderdamped
      ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100
      : 0;
    const tp = isUnderdamped && wd > 0 ? Math.PI / wd : 0;
    const ts = valid ? 4 / Math.max(sigma, 0.001) : 0;
    const tr = isUnderdamped && wd > 0 ? (Math.PI - Math.atan(Math.sqrt(1 - zeta * zeta) / zeta)) / wd : 1.5 / wn;
    const yFinal = A * K;
    const peakY = yFinal * (1 + MpPercent / 100);

    return {
      valid,
      wn,
      zeta,
      K,
      wd,
      sigma,
      isUnderdamped,
      isCriticallyDamped,
      isOverdamped,
      MpPercent,
      tp,
      ts,
      tr,
      yFinal,
      peakY,
    };
  }, [a2, a1_2, a0_2, b0_2, A]);

  // Chart data generation
  const chartData = useMemo(() => {
    const is1st = systemOrder === '1st';
    const tMax = is1st
      ? Math.max(firstOrder.ts * 1.5, 5)
      : Math.max(secondOrder.ts * 1.5, 6);

    const steps = 150;
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;

      if (is1st) {
        y = firstOrder.yFinal * (1 - Math.exp(-t / Math.max(firstOrder.tau, 0.001)));
      } else {
        const { wn, zeta, wd, sigma, isUnderdamped, isCriticallyDamped, yFinal } = secondOrder;
        if (isUnderdamped) {
          const expDecay = Math.exp(-sigma * t);
          y = yFinal * (1 - expDecay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
        } else if (isCriticallyDamped) {
          y = yFinal * (1 - (1 + wn * t) * Math.exp(-wn * t));
        } else {
          // Overdamped
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = yFinal * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
      }

      data.push({
        t: parseFloat(t.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        referencia: systemOrder === '1st' ? firstOrder.yFinal : secondOrder.yFinal,
      });
    }

    return data;
  }, [systemOrder, firstOrder, secondOrder]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-4 h-4" />
              <span>Calculadora Demostrativa en Pizarra Académica</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 2: Desglose Algebraico Paso a Paso
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Ingresa los coeficientes de la ecuación diferencial ordinaria y visualiza en la <strong className="text-indigo-300">pizarra matemática</strong> cada paso de deducción: Laplace, factorización, identificación paramétrica, descomposición en fracciones parciales e inversión a <MathView math="y(t)" />.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-indigo-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Restablecer coeficientes a valores por defecto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Order Selector Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setParams(p => ({ ...p, systemOrder: '1st' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemOrder === '1st'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ecuación de 1er Orden (a1·y' + a0·y = b0·r)
            </button>
            <button
              onClick={() => setParams(p => ({ ...p, systemOrder: '2nd' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemOrder === '2nd'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ecuación de 2º Orden (a2·y'' + a1·y' + a0·y = b0·r)
            </button>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveStepTab('pizarra')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeStepTab === 'pizarra' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Desglose en Pizarra
            </button>
            <button
              onClick={() => setActiveStepTab('grafico')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeStepTab === 'grafico' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gráfico Temporal y(t)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters Form & Blackboard Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Coeficientes de la Ecuación</span>
              <span className="text-xs font-mono text-indigo-400">
                {systemOrder === '1st' ? "1er Orden" : "2º Orden"}
              </span>
            </h3>

            {systemOrder === '1st' ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <MathView math={`${a1} \\, \\dot{y}(t) + ${a0} \\, y(t) = ${b0} \\, r(t)`} block />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente a1 (de y'):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={a1}
                    onChange={(e) => setParams(p => ({ ...p, a1: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente a0 (de y):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={a0}
                    onChange={(e) => setParams(p => ({ ...p, a0: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente b0 (de r):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={b0}
                    onChange={(e) => setParams(p => ({ ...p, b0: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <MathView math={`${a2} \\, \\ddot{y} + ${a1_2} \\, \\dot{y} + ${a0_2} \\, y = ${b0_2} \\, r`} block />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente a2 (de y''):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={a2}
                    onChange={(e) => setParams(p => ({ ...p, a2: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente a1 (de y'):
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    value={a1_2}
                    onChange={(e) => setParams(p => ({ ...p, a1_2: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente a0 (de y):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={a0_2}
                    onChange={(e) => setParams(p => ({ ...p, a0_2: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Coeficiente b0 (de r):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={b0_2}
                    onChange={(e) => setParams(p => ({ ...p, b0_2: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step amplitude A */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Amplitud Escalón Entrada (A):
              </label>
              <input
                type="number"
                step="0.5"
                value={A}
                onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 1 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Metrics Summary Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Métricas Transitorias Finales</span>
            </h4>
            {systemOrder === '1st' ? (
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tiempo Asentamiento (ts)</span>
                  <span className="text-cyan-400 font-bold">{firstOrder.ts.toFixed(2)} s</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tiempo Levantamiento (tr)</span>
                  <span className="text-indigo-400 font-bold">{firstOrder.tr.toFixed(2)} s</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Valor Final y(∞)</span>
                  <span className="text-white font-bold">{firstOrder.yFinal.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Sobrepico (Mp)</span>
                  <span className="text-emerald-400 font-bold">0% (Monótono)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Sobreimpulso (Mp)</span>
                  <span className="text-amber-400 font-bold">{secondOrder.MpPercent.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tiempo de Pico (tp)</span>
                  <span className="text-amber-400 font-bold">{secondOrder.tp.toFixed(2)} s</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tiempo Asentamiento (ts)</span>
                  <span className="text-cyan-400 font-bold">{secondOrder.ts.toFixed(2)} s</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tiempo Subida (tr)</span>
                  <span className="text-indigo-400 font-bold">{secondOrder.tr.toFixed(2)} s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Blackboard Demonstration Steps */}
        <div className="lg:col-span-8 space-y-4">
          {activeStepTab === 'pizarra' ? (
            /* Blackboard View */
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Pizarra de Demostración Rigurosa (Paso a Paso en KaTeX)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">5 Pasos Formales</span>
              </div>

              {systemOrder === '1st' ? (
                /* 1st Order 5 Steps */
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">Paso 1</span>
                      <span>Aplicación de la Transformada de Laplace</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Asumiendo condiciones iniciales nulas en reposo (<MathView math="y(0^-) = 0" />):
                    </p>
                    <MathView math={`\\mathcal{L}\\{ ${a1}\\,\\dot{y}(t) + ${a0}\\,y(t) \\} = \\mathcal{L}\\{ ${b0}\\,r(t) \\}`} block />
                    <MathView math={`${a1}\\,s\\,Y(s) + ${a0}\\,Y(s) = ${b0}\\,R(s)`} block />
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800">Paso 2</span>
                      <span>Factorización y Despeje de G(s) = Y(s) / R(s)</span>
                    </div>
                    <MathView math={`(${a1}\\,s + ${a0})\\,Y(s) = ${b0}\\,R(s)`} block />
                    <MathView math={`G(s) = \\frac{Y(s)}{R(s)} = \\frac{${b0}}{${a1}\\,s + ${a0}} = \\frac{${b0} / ${a0}}{(${a1} / ${a0})\\,s + 1}`} block />
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">Paso 3</span>
                      <span>Identificación Explícita de Parámetros Físicos</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Ganancia DC (K)</span>
                        <MathView math={`K = \\frac{${b0}}{${a0}} = ${firstOrder.K.toFixed(3)}`} block />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Constante τ [s]</span>
                        <MathView math={`\\tau = \\frac{${a1}}{${a0}} = ${firstOrder.tau.toFixed(3)}\\text{ s}`} block />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Polo en Plano s</span>
                        <MathView math={`s_1 = -\\frac{1}{\\tau} = ${firstOrder.pole.toFixed(3)}\\text{ rad/s}`} block />
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">Paso 4</span>
                      <span>Descomposición en Fracciones Parciales (Heaviside)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Entrada escalón <MathView math={`r(t) = ${A}\\,u(t) \\implies R(s) = \\frac{${A}}{s}`} />:
                    </p>
                    <MathView math={`Y(s) = G(s) \\cdot R(s) = \\frac{${(A * b0).toFixed(2)}}{s (${a1}s + ${a0})} = \\frac{C_1}{s} + \\frac{C_2}{s + ${ (1/firstOrder.tau).toFixed(3) }}`} block />
                    <p className="text-xs text-slate-400">Cálculo de residuos:</p>
                    <MathView math={`C_1 = \\lim_{s \\to 0} s \\, Y(s) = A \\cdot K = ${(A * firstOrder.K).toFixed(3)}`} block />
                    <MathView math={`C_2 = \\lim_{s \\to -1/\\tau} \\left(s + \\frac{1}{\\tau}\\right) Y(s) = -A \\cdot K = ${(-A * firstOrder.K).toFixed(3)}`} block />
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/60 space-y-2">
                    <div className="text-xs font-mono text-indigo-300 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700">Paso 5</span>
                      <span>Transformada Inversa de Laplace: Ecuación y(t) Exacta</span>
                    </div>
                    <MathView math={`y(t) = \\mathcal{L}^{-1}\\{ Y(s) \\} = ${firstOrder.yFinal.toFixed(3)} \\left(1 - e^{-t / ${firstOrder.tau.toFixed(3)}}\\right) u(t)`} block />
                  </div>
                </div>
              ) : (
                /* 2nd Order 5 Steps */
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">Paso 1</span>
                      <span>Aplicación de la Transformada de Laplace</span>
                    </div>
                    <MathView math={`\\mathcal{L}\\{ ${a2}\\,\\ddot{y} + ${a1_2}\\,\\dot{y} + ${a0_2}\\,y \\} = \\mathcal{L}\\{ ${b0_2}\\,r \\}`} block />
                    <MathView math={`(${a2}\\,s^2 + ${a1_2}\\,s + ${a0_2})\\,Y(s) = ${b0_2}\\,R(s)`} block />
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800">Paso 2</span>
                      <span>Despeje y Normalización de G(s)</span>
                    </div>
                    <MathView math={`G(s) = \\frac{Y(s)}{R(s)} = \\frac{${b0_2}}{${a2}\\,s^2 + ${a1_2}\\,s + ${a0_2}} = \\frac{${(b0_2/a2).toFixed(2)}}{s^2 + ${(a1_2/a2).toFixed(2)}\\,s + ${(a0_2/a2).toFixed(2)}}`} block />
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">Paso 3</span>
                      <span>Identificación Paramétrica Canónica: wn, ζ, wd</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Frecuencia Natural (wn)</span>
                        <MathView math={`\\omega_n = \\sqrt{\\frac{${a0_2}}{${a2}}} = ${secondOrder.wn.toFixed(2)}`} block />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Amortiguamiento (ζ)</span>
                        <MathView math={`\\zeta = \\frac{${a1_2}}{2\\cdot ${a2}\\cdot ${secondOrder.wn.toFixed(2)}} = ${secondOrder.zeta.toFixed(3)}`} block />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Ganancia DC (K)</span>
                        <MathView math={`K = \\frac{${b0_2}}{${a0_2}} = ${secondOrder.K.toFixed(2)}`} block />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Pulsación Amortiguada</span>
                        <MathView math={`\\omega_d = ${secondOrder.wd.toFixed(2)}\\text{ rad/s}`} block />
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">Paso 4</span>
                      <span>Descomposición en Fracciones Parciales</span>
                    </div>
                    <MathView math={`Y(s) = \\frac{${(A * secondOrder.K * secondOrder.wn**2).toFixed(2)}}{s ( (s + ${secondOrder.sigma.toFixed(2)})^2 + ${secondOrder.wd.toFixed(2)}^2 )}`} block />
                    <MathView math={`Y(s) = \\frac{${secondOrder.yFinal.toFixed(2)}}{s} - \\frac{${secondOrder.yFinal.toFixed(2)} (s + ${secondOrder.sigma.toFixed(2)})}{(s + ${secondOrder.sigma.toFixed(2)})^2 + ${secondOrder.wd.toFixed(2)}^2} - \\frac{${(secondOrder.yFinal * secondOrder.zeta / Math.sqrt(1 - secondOrder.zeta**2)).toFixed(2)} \\cdot ${secondOrder.wd.toFixed(2)}}{(s + ${secondOrder.sigma.toFixed(2)})^2 + ${secondOrder.wd.toFixed(2)}^2}`} block />
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/60 space-y-2">
                    <div className="text-xs font-mono text-indigo-300 font-bold uppercase flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700">Paso 5</span>
                      <span>Respuesta Temporal Analítica Exacta y(t)</span>
                    </div>
                    <MathView math={`y(t) = ${secondOrder.yFinal.toFixed(2)} \\left[ 1 - e^{-${secondOrder.sigma.toFixed(2)}t} \\left( \\cos(${secondOrder.wd.toFixed(2)}t) + \\frac{${secondOrder.zeta.toFixed(2)}}{\\sqrt{1-${secondOrder.zeta.toFixed(2)}^2}} \\sin(${secondOrder.wd.toFixed(2)}t) \\right) \\right]`} block />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Interactive Recharts Graph */
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Respuesta al Escalón en el Dominio del Tiempo y(t)</span>
                </h3>
                <span className="text-xs text-indigo-300 font-mono">
                  Entrada A = {A}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="t" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <ReferenceLine y={systemOrder === '1st' ? firstOrder.yFinal : secondOrder.yFinal} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Valor Final', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                    {systemOrder === '2nd' && secondOrder.isUnderdamped && (
                      <ReferenceDot x={secondOrder.tp} y={secondOrder.peakY} r={5} fill="#f59e0b" stroke="#fff" label={{ value: `Pico Mp=${secondOrder.MpPercent.toFixed(1)}%`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                    )}
                    <Line type="monotone" dataKey="y" name="Salida y(t)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
