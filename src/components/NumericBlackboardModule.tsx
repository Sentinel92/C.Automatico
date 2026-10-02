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
  Layers,
  Zap,
  TrendingUp,
  Clock,
  Activity,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface NumericParams {
  mode: 'second_order_ode' | 'first_order_ode' | 'rlc_circuit';
  // 2nd Order ODE: a2*y'' + a1*y' + a0*y = b0*r
  a2: number;
  a1: number;
  a0: number;
  b0: number;
  A: number;
  // 1st Order ODE: a1*y' + a0*y = b0*r
  a1_1st: number;
  a0_1st: number;
  b0_1st: number;
  A_1st: number;
  // RLC Circuit: R (Ohm), L (H), C (F), Vin (V)
  R: number;
  L: number;
  C: number;
  Vin: number;
}

const defaultParams: NumericParams = {
  mode: 'second_order_ode',
  a2: 1,
  a1: 4,
  a0: 16,
  b0: 20,
  A: 1,
  a1_1st: 2,
  a0_1st: 1,
  b0_1st: 3,
  A_1st: 2,
  R: 50,
  L: 0.1, // 100 mH
  C: 0.0001, // 100 uF
  Vin: 5,
};

export const NumericBlackboardModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<NumericParams>(
    'autocontrol_numeric_blackboard_params',
    defaultParams
  );

  const { mode, a2, a1, a0, b0, A, a1_1st, a0_1st, b0_1st, A_1st, R, L, C, Vin } = params;

  // Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'classic_exam') {
      setParams(p => ({
        ...p,
        mode: 'second_order_ode',
        a2: 1,
        a1: 4,
        a0: 16,
        b0: 20,
        A: 1,
      }));
    } else if (presetName === 'critically_damped') {
      setParams(p => ({
        ...p,
        mode: 'second_order_ode',
        a2: 1,
        a1: 8,
        a0: 16,
        b0: 16,
        A: 1,
      }));
    } else if (presetName === 'underdamped_light') {
      setParams(p => ({
        ...p,
        mode: 'second_order_ode',
        a2: 1,
        a1: 1.5,
        a0: 25,
        b0: 25,
        A: 1,
      }));
    } else if (presetName === 'first_order_thermo') {
      setParams(p => ({
        ...p,
        mode: 'first_order_ode',
        a1_1st: 5,
        a0_1st: 1,
        b0_1st: 2.5,
        A_1st: 10,
      }));
    } else if (presetName === 'rlc_audio') {
      setParams(p => ({
        ...p,
        mode: 'rlc_circuit',
        R: 20,
        L: 0.05,
        C: 0.00005,
        Vin: 10,
      }));
    }
  };

  // 2nd Order Calculations
  const calc2nd = useMemo(() => {
    const valid = a2 > 0 && a0 > 0 && a1 >= 0;
    if (!valid) {
      return { valid: false, wn: 0, zeta: 0, K: 0, wd: 0, beta: 0, tr: 0, tp: 0, Mp: 0, ts2: 0, ts5: 0, yFinal: 0, yPeak: 0, isUnderdamped: false, sigma: 0 };
    }
    const wn = Math.sqrt(a0 / a2);
    const zeta = a1 / (2 * Math.sqrt(a0 * a2));
    const K = b0 / a0;
    const isUnderdamped = zeta >= 0 && zeta < 1;
    const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    const beta = isUnderdamped ? Math.acos(zeta) : 0;
    const tr = isUnderdamped && wd > 0 ? (Math.PI - beta) / wd : 0;
    const tp = isUnderdamped && wd > 0 ? Math.PI / wd : 0;
    const Mp = isUnderdamped && zeta < 1 ? 100 * Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) : 0;
    const sigma = zeta * wn;
    const ts2 = sigma > 0 ? 4 / sigma : 0;
    const ts5 = sigma > 0 ? 3 / sigma : 0;
    const yFinal = A * K;
    const yPeak = yFinal * (1 + Mp / 100);

    return {
      valid: true,
      wn,
      zeta,
      K,
      wd,
      beta,
      tr,
      tp,
      Mp,
      ts2,
      ts5,
      yFinal,
      yPeak,
      isUnderdamped,
      sigma,
    };
  }, [a2, a1, a0, b0, A]);

  // 1st Order Calculations
  const calc1st = useMemo(() => {
    const valid = a1_1st > 0 && a0_1st > 0;
    if (!valid) {
      return { valid: false, K: 0, tau: 0, ts2: 0, ts5: 0, tr: 0, yFinal: 0, pole: 0 };
    }
    const K = b0_1st / a0_1st;
    const tau = a1_1st / a0_1st;
    const ts2 = 4 * tau;
    const ts5 = 3 * tau;
    const tr = 2.2 * tau;
    const yFinal = A_1st * K;
    const pole = -1 / tau;
    return { valid: true, K, tau, ts2, ts5, tr, yFinal, pole };
  }, [a1_1st, a0_1st, b0_1st, A_1st]);

  // RLC Calculations
  const calcRLC = useMemo(() => {
    const valid = R > 0 && L > 0 && C > 0;
    if (!valid) {
      return { valid: false, wn: 0, zeta: 0, K: 0, wd: 0, beta: 0, tr: 0, tp: 0, Mp: 0, ts2: 0, yFinal: 0, yPeak: 0, isUnderdamped: false, sigma: 0 };
    }
    const wn = 1 / Math.sqrt(L * C);
    const zeta = (R / 2) * Math.sqrt(C / L);
    const K = 1;
    const isUnderdamped = zeta < 1;
    const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    const beta = isUnderdamped ? Math.acos(zeta) : 0;
    const tr = isUnderdamped && wd > 0 ? (Math.PI - beta) / wd : 0;
    const tp = isUnderdamped && wd > 0 ? Math.PI / wd : 0;
    const Mp = isUnderdamped ? 100 * Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) : 0;
    const sigma = zeta * wn;
    const ts2 = sigma > 0 ? 4 / sigma : 0;
    const yFinal = Vin * K;
    const yPeak = yFinal * (1 + Mp / 100);

    return {
      valid: true,
      wn,
      zeta,
      K,
      wd,
      beta,
      tr,
      tp,
      Mp,
      ts2,
      yFinal,
      yPeak,
      isUnderdamped,
      sigma,
    };
  }, [R, L, C, Vin]);

  // Generate Simulation Data for Recharts
  const chartData = useMemo(() => {
    if (mode === 'second_order_ode') {
      if (!calc2nd.valid) return [];
      const tMax = Math.max(calc2nd.ts2 * 1.5, 4);
      const points = 150;
      const dt = tMax / points;
      const data = [];
      const { wn, zeta, wd, sigma, isUnderdamped, yFinal } = calc2nd;

      for (let i = 0; i <= points; i++) {
        const t = i * dt;
        let y = 0;
        if (isUnderdamped) {
          const decay = Math.exp(-sigma * t);
          y = yFinal * (1 - decay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
        } else if (Math.abs(zeta - 1) < 0.001) {
          y = yFinal * (1 - (1 + wn * t) * Math.exp(-wn * t));
        } else {
          // Overdamped
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = yFinal * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
        data.push({
          t: parseFloat(t.toFixed(3)),
          y: parseFloat(y.toFixed(4)),
          yFinal: parseFloat(yFinal.toFixed(4)),
          bandUpper: parseFloat((yFinal * 1.02).toFixed(4)),
          bandLower: parseFloat((yFinal * 0.98).toFixed(4)),
        });
      }
      return data;
    } else if (mode === 'first_order_ode') {
      if (!calc1st.valid) return [];
      const tMax = Math.max(calc1st.ts2 * 1.5, 5);
      const points = 150;
      const dt = tMax / points;
      const data = [];
      for (let i = 0; i <= points; i++) {
        const t = i * dt;
        const y = calc1st.yFinal * (1 - Math.exp(-t / Math.max(calc1st.tau, 0.0001)));
        data.push({
          t: parseFloat(t.toFixed(3)),
          y: parseFloat(y.toFixed(4)),
          yFinal: parseFloat(calc1st.yFinal.toFixed(4)),
          bandUpper: parseFloat((calc1st.yFinal * 1.02).toFixed(4)),
          bandLower: parseFloat((calc1st.yFinal * 0.98).toFixed(4)),
        });
      }
      return data;
    } else {
      // RLC Circuit
      if (!calcRLC.valid) return [];
      const tMax = Math.max(calcRLC.ts2 * 1.5, 0.05);
      const points = 150;
      const dt = tMax / points;
      const data = [];
      const { wn, zeta, wd, sigma, isUnderdamped, yFinal } = calcRLC;

      for (let i = 0; i <= points; i++) {
        const t = i * dt;
        let y = 0;
        if (isUnderdamped) {
          const decay = Math.exp(-sigma * t);
          y = yFinal * (1 - decay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
        } else {
          y = yFinal * (1 - (1 + wn * t) * Math.exp(-wn * t));
        }
        data.push({
          t: parseFloat(t.toFixed(5)),
          y: parseFloat(y.toFixed(4)),
          yFinal: parseFloat(yFinal.toFixed(4)),
          bandUpper: parseFloat((yFinal * 1.02).toFixed(4)),
          bandLower: parseFloat((yFinal * 0.98).toFixed(4)),
        });
      }
      return data;
    }
  }, [mode, calc2nd, calc1st, calcRLC]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-4 h-4" />
              <span>Metodología de 4 Pasos Obligatorios</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 2: Pizarra de Cálculo y Evaluación Numérica
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              1º Fórmula Simbólica literal <ArrowRight className="inline w-3.5 h-3.5 text-cyan-400 mx-1" /> 2º Entrada de Valores Numéricos <ArrowRight className="inline w-3.5 h-3.5 text-cyan-400 mx-1" /> 3º Sustitución Paso a Paso en KaTeX <ArrowRight className="inline w-3.5 h-3.5 text-cyan-400 mx-1" /> 4º Gráfica con Marcadores en <MathView math="t_p, t_s, M_p" />.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setParams(p => ({ ...p, mode: 'second_order_ode' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'second_order_ode'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sistema 2º Orden: <MathView math="a_2 \ddot{y} + a_1 \dot{y} + a_0 y = b_0 r" /></span>
          </button>

          <button
            onClick={() => setParams(p => ({ ...p, mode: 'first_order_ode' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'first_order_ode'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sistema 1er Orden: <MathView math="a_1 \dot{y} + a_0 y = b_0 r" /></span>
          </button>

          <button
            onClick={() => setParams(p => ({ ...p, mode: 'rlc_circuit' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'rlc_circuit'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Circuito Físico RLC Serie (R, L, C, Vin)</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Ejemplos Rápidos:</span>
          {mode === 'second_order_ode' && (
            <>
              <button
                onClick={() => applyPreset('classic_exam')}
                className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                G(s) = 20/(s² + 4s + 16) (Examen Clásico)
              </button>
              <button
                onClick={() => applyPreset('critically_damped')}
                className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                ζ = 1 (Críticamente Amortiguado)
              </button>
              <button
                onClick={() => applyPreset('underdamped_light')}
                className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                ζ = 0.15 (Muy Oscilatorio)
              </button>
            </>
          )}
          {mode === 'first_order_ode' && (
            <button
              onClick={() => applyPreset('first_order_thermo')}
              className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Proceso Térmico: 5·y' + y = 2.5·r
            </button>
          )}
          {mode === 'rlc_circuit' && (
            <button
              onClick={() => applyPreset('rlc_audio')}
              className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Filtro Audio RLC (R=20Ω, L=50mH, C=50µF)
            </button>
          )}
        </div>
      </div>

      {/* 4 PASOS ESTRUCTURADOS */}
      <div className="space-y-6">
        {/* PASO 1: FÓRMULA SIMBÓLICA CON LETRAS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
              1
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Paso 1: Muestra de la Fórmula Simbólica con Letras (Solo Variables)
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-3">
            {mode === 'second_order_ode' && (
              <>
                <p className="text-xs text-slate-400 text-left">
                  Ecuación diferencial general y forma canónica equivalente:
                </p>
                <MathView math="a_2 \frac{d^2 y(t)}{dt^2} + a_1 \frac{dy(t)}{dt} + a_0 y(t) = b_0 r(t) \quad \xrightarrow{\mathcal{L}} \quad G(s) = \frac{b_0}{a_2 s^2 + a_1 s + a_0} = \frac{K \omega_n^2}{s^2 + 2\zeta \omega_n s + \omega_n^2}" display />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\omega_n = \sqrt{\frac{a_0}{a_2}}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\zeta = \frac{a_1}{2\sqrt{a_0 a_2}}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\omega_d = \omega_n \sqrt{1 - \zeta^2}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="M_p = 100 \cdot e^{-\frac{\zeta \pi}{\sqrt{1-\zeta^2}}}" display />
                  </div>
                </div>
              </>
            )}

            {mode === 'first_order_ode' && (
              <>
                <p className="text-xs text-slate-400 text-left">
                  Ecuación diferencial de primer orden y su constante de tiempo literal:
                </p>
                <MathView math="a_1 \frac{dy(t)}{dt} + a_0 y(t) = b_0 r(t) \quad \xrightarrow{\mathcal{L}} \quad G(s) = \frac{b_0}{a_1 s + a_0} = \frac{\frac{b_0}{a_0}}{\frac{a_1}{a_0}s + 1} = \frac{K}{\tau s + 1}" display />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="K = \frac{b_0}{a_0}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\tau = \frac{a_1}{a_0}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="t_s(2\%) = 4\tau" display />
                  </div>
                </div>
              </>
            )}

            {mode === 'rlc_circuit' && (
              <>
                <p className="text-xs text-slate-400 text-left">
                  Deducción literal por Ley de Kirchhoff en Laplace con impedancias <MathView math="Z(s)" />:
                </p>
                <MathView math="V_{in}(s) = \left( Ls + R + \frac{1}{Cs} \right) I(s) \implies G_{RLC}(s) = \frac{\frac{1}{Cs}}{Ls + R + \frac{1}{Cs}} = \frac{\frac{1}{LC}}{s^2 + \frac{R}{L}s + \frac{1}{LC}}" display />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\omega_n = \frac{1}{\sqrt{LC}}" display />
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <MathView math="\zeta = \frac{R}{2}\sqrt{\frac{C}{L}}" display />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PASO 2: FORMULARIO DE VALORES NUMÉRICOS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
              2
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Paso 2: Formulario para Ingresar Valores Numéricos
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            {mode === 'second_order_ode' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente a2:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a2}
                    onChange={(e) => setParams(p => ({ ...p, a2: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de ÿ(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente a1:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a1}
                    onChange={(e) => setParams(p => ({ ...p, a1: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de ẏ(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente a0:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a0}
                    onChange={(e) => setParams(p => ({ ...p, a0: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de y(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente b0:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={b0}
                    onChange={(e) => setParams(p => ({ ...p, b0: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de r(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Amplitud Escalón A:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={A}
                    onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">r(t) = A·u(t)</span>
                </div>
              </div>
            )}

            {mode === 'first_order_ode' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente a1:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a1_1st}
                    onChange={(e) => setParams(p => ({ ...p, a1_1st: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de ẏ(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente a0:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a0_1st}
                    onChange={(e) => setParams(p => ({ ...p, a0_1st: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de y(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Coeficiente b0:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={b0_1st}
                    onChange={(e) => setParams(p => ({ ...p, b0_1st: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Término de r(t)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Amplitud Escalón A:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={A_1st}
                    onChange={(e) => setParams(p => ({ ...p, A_1st: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">r(t) = A·u(t)</span>
                </div>
              </div>
            )}

            {mode === 'rlc_circuit' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Resistencia R (Ω):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={R}
                    onChange={(e) => setParams(p => ({ ...p, R: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Resistor disipativo</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Inductancia L (H):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={L}
                    onChange={(e) => setParams(p => ({ ...p, L: parseFloat(e.target.value) || 0.001 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">0.05 H = 50 mH</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Capacitancia C (F):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={C}
                    onChange={(e) => setParams(p => ({ ...p, C: parseFloat(e.target.value) || 0.000001 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">0.0001 F = 100 µF</span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Tensión Escalón Vin (V):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={Vin}
                    onChange={(e) => setParams(p => ({ ...p, Vin: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-purple-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Voltaje de excitación</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PASO 3: SUSTITUCIÓN PASO A PASO EN KATEX */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
              3
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Paso 3: Sustitución Paso a Paso de Números Dentro de las Letras (KaTeX)
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            {mode === 'second_order_ode' && calc2nd.valid && (
              <div className="space-y-3 text-xs">
                {/* 1. Función de transferencia */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">
                    1. Reemplazo en la Función de Transferencia G(s):
                  </span>
                  <MathView
                    math={`G(s) = \\frac{b_0}{a_2 s^2 + a_1 s + a_0} = \\frac{${b0}}{${a2} s^2 + ${a1} s + ${a0}}`}
                    display
                  />
                </div>

                {/* 2. wn */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">
                    2. Frecuencia Natural (wn):
                  </span>
                  <MathView
                    math={`\\omega_n = \\sqrt{\\frac{a_0}{a_2}} = \\sqrt{\\frac{${a0}}{${a2}}} = \\sqrt{${(a0 / a2).toFixed(3)}} = ${calc2nd.wn.toFixed(4)}\\text{ rad/s}`}
                    display
                  />
                </div>

                {/* 3. zeta */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">
                    3. Factor de Amortiguamiento (ζ):
                  </span>
                  <MathView
                    math={`\\zeta = \\frac{a_1}{2\\sqrt{a_0 \\cdot a_2}} = \\frac{${a1}}{2\\sqrt{${a0} \\cdot ${a2}}} = \\frac{${a1}}{${(2 * Math.sqrt(a0 * a2)).toFixed(3)}} = ${calc2nd.zeta.toFixed(4)}`}
                    display
                  />
                  <div className="mt-1 text-[11px] text-slate-400">
                    Régimen:{' '}
                    <strong className="text-emerald-300">
                      {calc2nd.zeta < 1
                        ? `Subamortiguado (0 ≤ ζ < 1, oscilatorio)`
                        : calc2nd.zeta === 1
                        ? `Críticamente Amortiguado (ζ = 1)`
                        : `Sobreamortiguado (ζ > 1, no oscilatorio)`}
                    </strong>
                  </div>
                </div>

                {/* 4. Ganancia K */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">
                    4. Ganancia Estática DC (K):
                  </span>
                  <MathView
                    math={`K = \\frac{b_0}{a_0} = \\frac{${b0}}{${a0}} = ${calc2nd.K.toFixed(4)}`}
                    display
                  />
                  <MathView
                    math={`y_{final} = A \\cdot K = ${A} \\cdot ${calc2nd.K.toFixed(4)} = ${calc2nd.yFinal.toFixed(4)}`}
                    display
                  />
                </div>

                {/* 5. Subamortiguado: wd, beta, tr, tp, Mp, ts */}
                {calc2nd.isUnderdamped && (
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/60 space-y-2">
                    <span className="text-indigo-300 font-bold block">
                      5. Fórmulas de Examen para Régimen Subamortiguado:
                    </span>
                    <MathView
                      math={`\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2} = ${calc2nd.wn.toFixed(3)} \\cdot \\sqrt{1 - (${calc2nd.zeta.toFixed(3)})^2} = ${calc2nd.wd.toFixed(4)}\\text{ rad/s}`}
                      display
                    />
                    <MathView
                      math={`\\beta = \\arccos(\\zeta) = \\arccos(${calc2nd.zeta.toFixed(3)}) = ${calc2nd.beta.toFixed(4)}\\text{ rad} = ${(calc2nd.beta * 180 / Math.PI).toFixed(2)}^\\circ`}
                      display
                    />
                    <MathView
                      math={`t_p = \\frac{\\pi}{\\omega_d} = \\frac{3.14159}{${calc2nd.wd.toFixed(4)}} = ${calc2nd.tp.toFixed(4)}\\text{ s}`}
                      display
                    />
                    <MathView
                      math={`M_p(\\%) = 100 \\cdot \\exp\\left(-\\frac{${calc2nd.zeta.toFixed(3)} \\cdot \\pi}{\\sqrt{1 - (${calc2nd.zeta.toFixed(3)})^2}}\\right) = ${calc2nd.Mp.toFixed(3)}\\%`}
                      display
                    />
                    <MathView
                      math={`t_s(2\\%) = \\frac{4}{\\zeta \\omega_n} = \\frac{4}{${(calc2nd.zeta * calc2nd.wn).toFixed(4)}} = ${calc2nd.ts2.toFixed(4)}\\text{ s}`}
                      display
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'first_order_ode' && calc1st.valid && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">
                    1. Reemplazo en la Función de Transferencia:
                  </span>
                  <MathView
                    math={`G(s) = \\frac{b_0}{a_1 s + a_0} = \\frac{${b0_1st}}{${a1_1st} s + ${a0_1st}} = \\frac{\\frac{${b0_1st}}{${a0_1st}}}{\\frac{${a1_1st}}{${a0_1st}}s + 1} = \\frac{${calc1st.K.toFixed(3)}}{${calc1st.tau.toFixed(3)}s + 1}`}
                    display
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">
                    2. Constante de Tiempo y Tiempo de Asentamiento:
                  </span>
                  <MathView
                    math={`\\tau = \\frac{a_1}{a_0} = \\frac{${a1_1st}}{${a0_1st}} = ${calc1st.tau.toFixed(4)}\\text{ s}`}
                    display
                  />
                  <MathView
                    math={`t_s(2\\%) = 4\\tau = 4 \\cdot ${calc1st.tau.toFixed(3)} = ${calc1st.ts2.toFixed(4)}\\text{ s}`}
                    display
                  />
                </div>
              </div>
            )}

            {mode === 'rlc_circuit' && calcRLC.valid && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">
                    1. Sustitución de Componentes Físicos en Laplace:
                  </span>
                  <MathView
                    math={`G_{RLC}(s) = \\frac{\\frac{1}{LC}}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}} = \\frac{\\frac{1}{${L} \\cdot ${C}}}{s^2 + \\frac{${R}}{${L}}s + \\frac{1}{${L} \\cdot ${C}}}`}
                    display
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">
                    2. Frecuencia y Amortiguamiento Circuital:
                  </span>
                  <MathView
                    math={`\\omega_n = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{${L} \\cdot ${C}}} = ${calcRLC.wn.toFixed(2)}\\text{ rad/s}`}
                    display
                  />
                  <MathView
                    math={`\\zeta = \\frac{R}{2}\\sqrt{\\frac{C}{L}} = \\frac{${R}}{2}\\sqrt{\\frac{${C}}{${L}}} = ${calcRLC.zeta.toFixed(4)}`}
                    display
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PASO 4: GRÁFICA TEMPORAL CON RECHARTS Y MARCADORES EN TP, TS, MP */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
                4
              </span>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Paso 4: Gráfica Temporal Dinámica con Marcadores en tp, ts y Mp
                </h3>
                <span className="text-xs text-slate-400">
                  Visualización exacta generada con Recharts SVG
                </span>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {mode === 'second_order_ode' && calc2nd.valid && (
                <>
                  <span className="px-2 py-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                    tp = {calc2nd.tp.toFixed(3)}s
                  </span>
                  <span className="px-2 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                    Mp = {calc2nd.Mp.toFixed(2)}%
                  </span>
                  <span className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                    ts(2%) = {calc2nd.ts2.toFixed(3)}s
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLine data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="t"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'Tiempo t [segundos]', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                {/* Reference Lines */}
                {mode === 'second_order_ode' && calc2nd.valid && (
                  <>
                    <ReferenceLine
                      y={calc2nd.yFinal}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: `y_final = ${calc2nd.yFinal.toFixed(2)}`, fill: '#10b981', fontSize: 10, position: 'right' }}
                    />
                    {calc2nd.isUnderdamped && calc2nd.tp > 0 && (
                      <ReferenceLine
                        x={parseFloat(calc2nd.tp.toFixed(3))}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{ value: `tp = ${calc2nd.tp.toFixed(2)}s`, fill: '#f59e0b', fontSize: 10, position: 'top' }}
                      />
                    )}
                    {calc2nd.ts2 > 0 && (
                      <ReferenceLine
                        x={parseFloat(calc2nd.ts2.toFixed(3))}
                        stroke="#06b6d4"
                        strokeDasharray="3 3"
                        label={{ value: `ts(2%) = ${calc2nd.ts2.toFixed(2)}s`, fill: '#06b6d4', fontSize: 10, position: 'top' }}
                      />
                    )}
                    {calc2nd.isUnderdamped && calc2nd.tp > 0 && (
                      <ReferenceDot
                        x={parseFloat(calc2nd.tp.toFixed(3))}
                        y={parseFloat(calc2nd.yPeak.toFixed(4))}
                        r={5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    )}
                  </>
                )}

                <Line
                  type="monotone"
                  dataKey="y"
                  name="Respuesta y(t)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                />
              </RechartsLine>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Marcador circular rojo en el punto <MathView math="(t_p, y_{pico})" />. Líneas punteadas en <MathView math="t_p" /> (Tiempo de pico) y <MathView math="t_s(2\%)" /> (Tiempo de asentamiento).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
