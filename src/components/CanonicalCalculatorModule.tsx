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
import {
  Calculator,
  RotateCcw,
  Save,
  Activity,
  Compass,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import { MathView } from './MathView';
import { CanonicalParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultParams: CanonicalParams = {
  systemOrder: '2nd',
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

export const CanonicalCalculatorModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<CanonicalParams>(
    'autocontrol_canonical_module_params',
    defaultParams
  );

  const { systemOrder, a1, a0, b0, A, a2, a1_2, a0_2, b0_2 } = params;

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

    // Poles
    let poleDesc = '';
    if (isUnderdamped) {
      poleDesc = `s = -${sigma.toFixed(2)} ± j${wd.toFixed(2)} rad/s`;
    } else if (isCriticallyDamped) {
      poleDesc = `s = -${wn.toFixed(2)} (Polo real doble)`;
    } else {
      const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
      const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
      poleDesc = `s1 = ${s1.toFixed(2)}, s2 = ${s2.toFixed(2)} rad/s`;
    }

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
      poleDesc,
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

  // Chart data
  const chartData = useMemo(() => {
    const is1st = systemOrder === '1st';
    const tMax = is1st ? Math.max(firstOrder.ts * 1.5, 6) : Math.max(secondOrder.ts * 1.5, 8);
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
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = yFinal * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
      }

      data.push({
        t: parseFloat(t.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        referencia: is1st ? firstOrder.yFinal : secondOrder.yFinal,
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
              <span>Análisis de Modelos Dinámicos Continuos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 3: Calculadora Canónica y Sistemas de 2º Orden Generales
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Calcula instantáneamente la respuesta canónica de cualquier sistema lineal diferencial de 1er o 2º orden a partir de coeficientes arbitrarios (<MathView math="a_2 \ddot{y} + a_1 \dot{y} + a_0 y = b_0 r" />). Mapeo de polos en el plano complejo y simulación temporal.
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
              title="Restablecer coeficientes"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Order Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setParams(p => ({ ...p, systemOrder: '1st' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemOrder === '1st'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sistema de 1er Orden Canónico
            </button>
            <button
              onClick={() => setParams(p => ({ ...p, systemOrder: '2nd' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemOrder === '2nd'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sistema de 2º Orden General
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters Form & Instant Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Coeficientes de la Ecuación</span>
              <span className="text-xs font-mono text-indigo-400">
                {systemOrder === '1st' ? 'a1·y\' + a0·y = b0·r' : 'a2·y\'\' + a1·y\' + a0·y = b0·r'}
              </span>
            </h3>

            {systemOrder === '1st' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente a1 (y'):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a1}
                    onChange={(e) => setParams(p => ({ ...p, a1: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente a0 (y):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a0}
                    onChange={(e) => setParams(p => ({ ...p, a0: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente b0 (r):</label>
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
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente a2 (y''):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a2}
                    onChange={(e) => setParams(p => ({ ...p, a2: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente a1 (y'):</label>
                  <input
                    type="number"
                    step="0.2"
                    value={a1_2}
                    onChange={(e) => setParams(p => ({ ...p, a1_2: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente a0 (y):</label>
                  <input
                    type="number"
                    step="1"
                    value={a0_2}
                    onChange={(e) => setParams(p => ({ ...p, a0_2: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Coeficiente b0 (r):</label>
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

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Amplitud Escalón Entrada (A):</label>
              <input
                type="number"
                step="0.5"
                value={A}
                onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 1 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Model Summary Badge */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
            <span className="text-xs font-semibold text-white">Función de Transferencia G(s):</span>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              {systemOrder === '1st' ? (
                <MathView math={`G(s) = \\frac{${firstOrder.K.toFixed(3)}}{${firstOrder.tau.toFixed(3)}s + 1}`} block />
              ) : (
                <MathView math={`G(s) = \\frac{${(b0_2/a2).toFixed(2)}}{s^2 + ${(a1_2/a2).toFixed(2)}s + ${(a0_2/a2).toFixed(2)}}`} block />
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Metric Cards & Response Chart */}
        <div className="lg:col-span-8 space-y-4">
          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Tiempo Asentamiento</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {systemOrder === '1st' ? `${firstOrder.ts.toFixed(2)} s` : `${secondOrder.ts.toFixed(2)} s`}
              </div>
              <span className="text-[10px] text-slate-500">Criterio banda ±2%</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Sobrepico (Mp)</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-300">
                {systemOrder === '1st' ? '0%' : `${secondOrder.MpPercent.toFixed(1)}%`}
              </div>
              <span className="text-[10px] text-slate-500">
                {systemOrder === '1st' ? 'Monótono' : `Pico: ${secondOrder.peakY.toFixed(2)}`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Amortiguamiento ζ</span>
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-lg font-bold font-mono text-indigo-300">
                {systemOrder === '1st' ? 'N/A (1er Ord)' : secondOrder.zeta.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-500">
                {systemOrder === '2nd' && (secondOrder.isUnderdamped ? 'Subamortiguado' : secondOrder.isCriticallyDamped ? 'Crítico' : 'Sobreamortiguado')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Polos en Plano s</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-bold font-mono text-emerald-300 truncate">
                {systemOrder === '1st' ? `s1 = ${firstOrder.pole.toFixed(2)}` : secondOrder.poleDesc}
              </div>
              <span className="text-[10px] text-slate-500">Estabilidad garantizada</span>
            </div>
          </div>

          {/* Interactive Recharts Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Respuesta al Escalón Temporal y(t)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
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
                    <ReferenceDot x={secondOrder.tp} y={secondOrder.peakY} r={5} fill="#f59e0b" stroke="#fff" label={{ value: `Mp = ${secondOrder.MpPercent.toFixed(1)}%`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                  )}
                  <Line type="monotone" dataKey="y" name="Salida y(t)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </RechartsLine>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
