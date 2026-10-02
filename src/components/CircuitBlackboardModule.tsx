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
  TrendingUp,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { MathView } from './MathView';
import { CircuitType, CircuitBlackboardParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultParams: CircuitBlackboardParams = {
  circuitType: 'RC',
  rVal: 100,
  rUnit: 1, // Ohms
  cVal: 22,
  cUnit: 1e-6, // uF
  lVal: 680,
  lUnit: 1e-6, // uH
  vIn: 5.0, // Volts
};

export const CircuitBlackboardModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<CircuitBlackboardParams>(
    'autocontrol_circuit_blackboard_params',
    defaultParams
  );

  const [activeTab, setActiveTab] = useState<'pizarra' | 'grafico'>('pizarra');

  const { circuitType, rVal, rUnit, cVal, cUnit, lVal, lUnit, vIn } = params;

  // Actual physical values in SI base units
  const R = useMemo(() => Math.max(rVal * rUnit, 1e-6), [rVal, rUnit]);
  const C = useMemo(() => Math.max(cVal * cUnit, 1e-15), [cVal, cUnit]);
  const L = useMemo(() => Math.max(lVal * lUnit, 1e-15), [lVal, lUnit]);

  // Electrical parameter calculations
  const tauRC = useMemo(() => R * C, [R, C]);
  const tauRL = useMemo(() => L / R, [L, R]);

  const rlcMetrics = useMemo(() => {
    const wn = 1 / Math.sqrt(L * C);
    const zeta = (R / 2) * Math.sqrt(C / L);
    const isUnderdamped = zeta < 1;
    const isCriticallyDamped = Math.abs(zeta - 1) < 0.01;
    const isOverdamped = zeta > 1.01;
    const wd = isUnderdamped ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    const sigma = zeta * wn;

    const MpPercent = isUnderdamped
      ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100
      : 0;
    const tp = isUnderdamped && wd > 0 ? Math.PI / wd : 0;
    const ts = 4 / Math.max(sigma, 0.001);
    const tr = isUnderdamped && wd > 0
      ? (Math.PI - Math.atan(Math.sqrt(1 - zeta * zeta) / zeta)) / wd
      : 1.5 / wn;
    const peakY = vIn * (1 + MpPercent / 100);

    return {
      wn,
      zeta,
      wd,
      sigma,
      isUnderdamped,
      isCriticallyDamped,
      isOverdamped,
      MpPercent,
      tp,
      ts,
      tr,
      peakY,
    };
  }, [R, L, C, vIn]);

  // Determine optimal time scaling for chart display
  const timeScale = useMemo(() => {
    let tRef = tauRC;
    if (circuitType === 'RL') tRef = tauRL;
    if (circuitType === 'RLC') tRef = rlcMetrics.ts;

    if (tRef < 1e-6) return { mult: 1e9, unit: 'ns', label: 'Nanosegundos [ns]' };
    if (tRef < 1e-3) return { mult: 1e6, unit: 'µs', label: 'Microsegundos [µs]' };
    if (tRef < 1) return { mult: 1e3, unit: 'ms', label: 'Milisegundos [ms]' };
    return { mult: 1, unit: 's', label: 'Segundos [s]' };
  }, [circuitType, tauRC, tauRL, rlcMetrics]);

  // Chart data simulation
  const chartData = useMemo(() => {
    let tMax = 1e-3;
    if (circuitType === 'RC') tMax = tauRC * 6;
    else if (circuitType === 'RL') tMax = tauRL * 6;
    else tMax = rlcMetrics.ts * 1.5;

    const steps = 150;
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;

      if (circuitType === 'RC') {
        // v_C(t) = Vin * (1 - exp(-t/tau))
        y = vIn * (1 - Math.exp(-t / Math.max(tauRC, 1e-12)));
      } else if (circuitType === 'RL') {
        // i_L(t) = (Vin/R) * (1 - exp(-t/tau))
        y = (vIn / R) * (1 - Math.exp(-t / Math.max(tauRL, 1e-12)));
      } else {
        // RLC series capacitor voltage v_C(t)
        const { wn, zeta, wd, sigma, isUnderdamped, isCriticallyDamped } = rlcMetrics;
        if (isUnderdamped) {
          const expDecay = Math.exp(-sigma * t);
          y = vIn * (1 - expDecay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
        } else if (isCriticallyDamped) {
          y = vIn * (1 - (1 + wn * t) * Math.exp(-wn * t));
        } else {
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = vIn * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
      }

      data.push({
        timeRaw: t,
        timeScaled: parseFloat((t * timeScale.mult).toFixed(3)),
        y: parseFloat(y.toFixed(4)),
        referencia: circuitType === 'RL' ? parseFloat((vIn / R).toFixed(4)) : vIn,
      });
    }

    return data;
  }, [circuitType, vIn, R, tauRC, tauRL, rlcMetrics, timeScale]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-4 h-4" />
              <span>Calculadora Demostrativa de Circuitos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 2: Desglose Algebraico Paso a Paso en Pizarra
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Configura los valores de componentes pasivos con unidades reales y visualiza en la <strong className="text-indigo-300">Pizarra Académica</strong> la deducción analítica completa en KaTeX en 6 pasos formales.
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
              title="Restablecer valores"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Circuit Selector Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(['RC', 'RL', 'RLC'] as const).map(c => (
              <button
                key={c}
                onClick={() => setParams(p => ({ ...p, circuitType: c }))}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  circuitType === c
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Circuito {c} Serie
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('pizarra')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'pizarra' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Demostración Pizarra KaTeX
            </button>
            <button
              onClick={() => setActiveTab('grafico')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'grafico' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gráfico Temporal v_out(t)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs Form & Blackboard Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Componentes del Circuito</span>
              <span className="text-xs font-mono text-indigo-400">
                {circuitType === 'RC'
                  ? `τ = ${(tauRC * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                  : circuitType === 'RL'
                  ? `τ = ${(tauRL * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                  : `ζ = ${rlcMetrics.zeta.toFixed(2)}, ωn = ${rlcMetrics.wn.toFixed(1)}`}
              </span>
            </h3>

            {/* Resistor */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Resistencia (R):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="1"
                  value={rVal}
                  onChange={(e) => setParams(p => ({ ...p, rVal: parseFloat(e.target.value) || 1 }))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
                <select
                  value={rUnit}
                  onChange={(e) => setParams(p => ({ ...p, rUnit: parseFloat(e.target.value) }))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                >
                  <option value={1}>Ω</option>
                  <option value={1e3}>kΩ</option>
                  <option value={1e6}>MΩ</option>
                </select>
              </div>
            </div>

            {/* Capacitor */}
            {(circuitType === 'RC' || circuitType === 'RLC') && (
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Capacitancia (C):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="1"
                    value={cVal}
                    onChange={(e) => setParams(p => ({ ...p, cVal: parseFloat(e.target.value) || 1 }))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={cUnit}
                    onChange={(e) => setParams(p => ({ ...p, cUnit: parseFloat(e.target.value) }))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={1e-12}>pF</option>
                    <option value={1e-9}>nF</option>
                    <option value={1e-6}>µF</option>
                    <option value={1e-3}>mF</option>
                  </select>
                </div>
              </div>
            )}

            {/* Inductor */}
            {(circuitType === 'RL' || circuitType === 'RLC') && (
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Inductancia (L):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="1"
                    value={lVal}
                    onChange={(e) => setParams(p => ({ ...p, lVal: parseFloat(e.target.value) || 1 }))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={lUnit}
                    onChange={(e) => setParams(p => ({ ...p, lUnit: parseFloat(e.target.value) }))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={1e-6}>µH</option>
                    <option value={1e-3}>mH</option>
                    <option value={1}>H</option>
                  </select>
                </div>
              </div>
            )}

            {/* Voltage Vin */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Voltaje de Entrada Escalón (Vin):
              </label>
              <input
                type="number"
                step="0.5"
                value={vIn}
                onChange={(e) => setParams(p => ({ ...p, vIn: parseFloat(e.target.value) || 1 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Métricas Transitorias del Circuito</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 pt-1">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Tiempo Asentamiento (ts)</span>
                <span className="text-cyan-400 font-bold">
                  {circuitType === 'RC'
                    ? `${(4 * tauRC * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                    : circuitType === 'RL'
                    ? `${(4 * tauRL * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                    : `${(rlcMetrics.ts * timeScale.mult).toFixed(2)} ${timeScale.unit}`}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Sobreimpulso (Mp)</span>
                <span className="text-amber-400 font-bold">
                  {circuitType === 'RLC' ? `${rlcMetrics.MpPercent.toFixed(1)}%` : '0% (Monótono)'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Voltaje Final de Salida</span>
                <span className="text-white font-bold">{circuitType === 'RL' ? `${(vIn / R).toFixed(3)} A` : `${vIn} V`}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Régimen Dinámico</span>
                <span className="text-emerald-400 font-bold">
                  {circuitType === 'RLC' ? (rlcMetrics.isUnderdamped ? 'Subamortiguado' : rlcMetrics.isCriticallyDamped ? 'Crítico' : 'Sobreamortiguado') : '1er Orden'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Blackboard KaTeX 6 Steps */}
        <div className="lg:col-span-8 space-y-4">
          {activeTab === 'pizarra' ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6 font-sans">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Demostración en Pizarra KaTeX: Circuito {circuitType} Serie
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">6 Pasos Matemáticos</span>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">Paso 1</span>
                  <span>Planteamiento de la Ley de Voltajes de Kirchhoff (LVK)</span>
                </div>
                {circuitType === 'RC' && (
                  <MathView math={`v_{\\text{in}}(t) = v_R(t) + v_C(t) = ${R.toFixed(1)}\\,i(t) + v_C(t)`} block />
                )}
                {circuitType === 'RL' && (
                  <MathView math={`v_{\\text{in}}(t) = v_R(t) + v_L(t) = ${R.toFixed(1)}\\,i(t) + ${L.toExponential(3)}\\,\\frac{di(t)}{dt}`} block />
                )}
                {circuitType === 'RLC' && (
                  <MathView math={`v_{\\text{in}}(t) = v_R(t) + v_L(t) + v_C(t) = ${R.toFixed(1)}\\,i(t) + ${L.toExponential(3)}\\,\\frac{di}{dt} + v_C(t)`} block />
                )}
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800">Paso 2</span>
                  <span>Sustitución de Derivadas y Transformada de Laplace</span>
                </div>
                {circuitType === 'RC' && (
                  <>
                    <p className="text-xs text-slate-400">Sustituyendo <MathView math={`i(t) = C \\frac{dv_C}{dt} = ${C.toExponential(3)} \\frac{dv_C}{dt}`} />:</p>
                    <MathView math={`${R.toFixed(1)} \\cdot ${C.toExponential(3)}\\,\\frac{dv_C(t)}{dt} + v_C(t) = v_{\\text{in}}(t) \\implies ${tauRC.toExponential(3)}\\,\\frac{dv_C}{dt} + v_C = v_{\\text{in}}`} block />
                    <MathView math={`(${tauRC.toExponential(3)}\\,s + 1) V_C(s) = V_{\\text{in}}(s)`} block />
                  </>
                )}
                {circuitType === 'RL' && (
                  <>
                    <MathView math={`(${L.toExponential(3)}\\,s + ${R.toFixed(1)}) I(s) = V_{\\text{in}}(s)`} block />
                  </>
                )}
                {circuitType === 'RLC' && (
                  <>
                    <p className="text-xs text-slate-400">Sustituyendo <MathView math="i = C \dot{v}_C, \dot{i} = C \ddot{v}_C" />:</p>
                    <MathView math={`${(L * C).toExponential(3)}\\,\\frac{d^2v_C}{dt^2} + ${(R * C).toExponential(3)}\\,\\frac{dv_C}{dt} + v_C = v_{\\text{in}}(t)`} block />
                    <MathView math={`[ ${(L * C).toExponential(3)}\\,s^2 + ${(R * C).toExponential(3)}\\,s + 1 ] V_C(s) = V_{\\text{in}}(s)`} block />
                  </>
                )}
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">Paso 3</span>
                  <span>Obtención de la Función de Transferencia G(s)</span>
                </div>
                {circuitType === 'RC' && (
                  <MathView math={`G(s) = \\frac{V_C(s)}{V_{\\text{in}}(s)} = \\frac{1}{${tauRC.toExponential(3)}\\,s + 1} = \\frac{${(1/tauRC).toExponential(3)}}{s + ${(1/tauRC).toExponential(3)}}`} block />
                )}
                {circuitType === 'RL' && (
                  <MathView math={`G(s) = \\frac{I(s)}{V_{\\text{in}}(s)} = \\frac{1/R}{\\frac{L}{R}s + 1} = \\frac{${(1/R).toExponential(3)}}{${tauRL.toExponential(3)}s + 1}`} block />
                )}
                {circuitType === 'RLC' && (
                  <MathView math={`G(s) = \\frac{V_C(s)}{V_{\\text{in}}(s)} = \\frac{${(rlcMetrics.wn**2).toExponential(3)}}{s^2 + ${(2 * rlcMetrics.zeta * rlcMetrics.wn).toExponential(3)}\\,s + ${(rlcMetrics.wn**2).toExponential(3)}}`} block />
                )}
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">Paso 4</span>
                  <span>Cálculo de Parámetros Físicos y Clasificación</span>
                </div>
                {circuitType === 'RC' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Constante de Tiempo τ</span>
                      <MathView math={`\\tau = R \\cdot C = ${tauRC.toExponential(3)}\\text{ s}`} block />
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Polo del Circuito</span>
                      <MathView math={`s_1 = -\\frac{1}{RC} = -${(1/tauRC).toExponential(3)}\\text{ rad/s}`} block />
                    </div>
                  </div>
                )}
                {circuitType === 'RL' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Constante de Tiempo τ</span>
                      <MathView math={`\\tau = \\frac{L}{R} = ${tauRL.toExponential(3)}\\text{ s}`} block />
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Polo del Circuito</span>
                      <MathView math={`s_1 = -\\frac{R}{L} = -${(1/tauRL).toExponential(3)}\\text{ rad/s}`} block />
                    </div>
                  </div>
                )}
                {circuitType === 'RLC' && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Pulsación Natural wn</span>
                      <MathView math={`\\omega_n = \\frac{1}{\\sqrt{LC}} = ${rlcMetrics.wn.toFixed(1)}\\text{ rad/s}`} block />
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Amortiguamiento ζ</span>
                      <MathView math={`\\zeta = \\frac{R}{2}\\sqrt{\\frac{C}{L}} = ${rlcMetrics.zeta.toFixed(3)}`} block />
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Clasificación</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {rlcMetrics.isUnderdamped ? 'Subamortiguado (ζ < 1)' : rlcMetrics.isCriticallyDamped ? 'Crítico (ζ = 1)' : 'Sobreamortiguado (ζ > 1)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">Paso 5</span>
                  <span>Expansión en Fracciones Parciales para Entrada Escalón Vin</span>
                </div>
                <p className="text-xs text-slate-400">Para escalón <MathView math={`V_{\\text{in}}(s) = \\frac{${vIn}}{s}`} />:</p>
                {circuitType === 'RC' && (
                  <>
                    <MathView math={`V_C(s) = \\frac{${vIn}}{s (${tauRC.toExponential(3)}s + 1)} = \\frac{${vIn}}{s} - \\frac{${vIn}}{s + ${(1/tauRC).toExponential(3)}}`} block />
                  </>
                )}
                {circuitType === 'RL' && (
                  <>
                    <MathView math={`I(s) = \\frac{${vIn}}{s (${L.toExponential(3)}s + ${R.toFixed(1)})} = \\frac{${(vIn/R).toFixed(3)}}{s} - \\frac{${(vIn/R).toFixed(3)}}{s + ${(R/L).toExponential(3)}}`} block />
                  </>
                )}
                {circuitType === 'RLC' && (
                  <>
                    <MathView math={`V_C(s) = \\frac{${vIn}}{s} - \\frac{${vIn}(s + ${rlcMetrics.sigma.toFixed(2)})}{(s + ${rlcMetrics.sigma.toFixed(2)})^2 + ${rlcMetrics.wd.toFixed(2)}^2} - \\frac{${(vIn * rlcMetrics.zeta / Math.max(Math.sqrt(1 - rlcMetrics.zeta**2), 0.01)).toFixed(2)} \\cdot ${rlcMetrics.wd.toFixed(2)}}{(s + ${rlcMetrics.sigma.toFixed(2)})^2 + ${rlcMetrics.wd.toFixed(2)}^2}`} block />
                  </>
                )}
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-900/60 space-y-2">
                <div className="text-xs font-mono text-indigo-300 font-bold uppercase flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700">Paso 6</span>
                  <span>Transformada Inversa de Laplace v_out(t) y Métricas</span>
                </div>
                {circuitType === 'RC' && (
                  <MathView math={`v_C(t) = ${vIn} \\left(1 - e^{-t / ${tauRC.toExponential(3)}}\\right) \\text{ V}`} block />
                )}
                {circuitType === 'RL' && (
                  <MathView math={`i_L(t) = ${(vIn/R).toFixed(4)} \\left(1 - e^{-t / ${tauRL.toExponential(3)}}\\right) \\text{ A}`} block />
                )}
                {circuitType === 'RLC' && (
                  <MathView math={`v_C(t) = ${vIn} \\left[ 1 - e^{-${rlcMetrics.sigma.toFixed(2)}t} \\left( \\cos(${rlcMetrics.wd.toFixed(2)}t) + \\frac{${rlcMetrics.zeta.toFixed(2)}}{\\sqrt{1-${rlcMetrics.zeta.toFixed(2)}^2}} \\sin(${rlcMetrics.wd.toFixed(2)}t) \\right) \\right] \\text{ V}`} block />
                )}
              </div>
            </div>
          ) : (
            /* Interactive Chart Tab */
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Respuesta Temporal del Circuito {circuitType} Serie</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Base temporal: {timeScale.label}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="timeScaled" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}${timeScale.unit}`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <ReferenceLine y={circuitType === 'RL' ? vIn / R : vIn} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Valor Final', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                    {circuitType === 'RLC' && rlcMetrics.isUnderdamped && (
                      <ReferenceDot x={parseFloat((rlcMetrics.tp * timeScale.mult).toFixed(2))} y={parseFloat(rlcMetrics.peakY.toFixed(2))} r={5} fill="#f59e0b" stroke="#fff" label={{ value: `Mp=${rlcMetrics.MpPercent.toFixed(1)}%`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                    )}
                    <Line type="monotone" dataKey="y" name={circuitType === 'RL' ? 'Corriente i_L(t) [A]' : 'Voltaje v_C(t) [V]'} stroke="#6366f1" strokeWidth={2.5} dot={false} />
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
