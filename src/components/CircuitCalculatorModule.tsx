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
} from 'recharts';
import { Cpu, Zap, Activity, Info, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { MathView } from './MathView';
import { CircuitType, CircuitStorageState } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TransferFunctionInfo {
  id: string;
  circuit: CircuitType;
  name: string;
  outputVar: string;
  inputVar: string;
  latexTF: string;
  latexCanonical: string;
  zeros: string;
  poles: string;
  poleVal?: number;
  K: number;
  KUnit: string;
  tau?: number;
  tauFormula?: string;
  responseDesc: string;
  calcResponse: (t: number, V: number, R: number, C: number, L: number) => number;
  yUnit: string;
}

const defaultCircuitState: CircuitStorageState = {
  circuitType: 'RC',
  rVal: 100,
  rUnit: 1,
  cVal: 22,
  cUnit: 1e-6,
  lVal: 680,
  lUnit: 1e-6,
  vIn: 5.0,
  activeTfId: 'rc_vc_v',
};

export const CircuitCalculatorModule: React.FC = () => {
  const [circuitState, setCircuitState, resetCircuitState] = useLocalStorage<CircuitStorageState>(
    'autocontrol_circuit_params',
    defaultCircuitState
  );

  const { circuitType, rVal, rUnit, cVal, cUnit, lVal, lUnit, vIn, activeTfId } = circuitState;

  const setCircuitType = (type: CircuitType) => {
    setCircuitState(prev => ({
      ...prev,
      circuitType: type,
      activeTfId: type === 'RC' ? 'rc_vc_v' : type === 'RL' ? 'rl_vl_v' : 'rlc_vc_v',
    }));
  };

  const setRVal = (val: number) => setCircuitState(prev => ({ ...prev, rVal: val }));
  const setRUnit = (unit: number) => setCircuitState(prev => ({ ...prev, rUnit: unit }));
  const setCVal = (val: number) => setCircuitState(prev => ({ ...prev, cVal: val }));
  const setCUnit = (unit: number) => setCircuitState(prev => ({ ...prev, cUnit: unit }));
  const setLVal = (val: number) => setCircuitState(prev => ({ ...prev, lVal: val }));
  const setLUnit = (unit: number) => setCircuitState(prev => ({ ...prev, lUnit: unit }));
  const setVIn = (val: number) => setCircuitState(prev => ({ ...prev, vIn: val }));
  const setActiveTfId = (id: string) => setCircuitState(prev => ({ ...prev, activeTfId: id }));

  // Actual physical values in SI base units
  const R = useMemo(() => Math.max(rVal * rUnit, 1e-6), [rVal, rUnit]);
  const C = useMemo(() => Math.max(cVal * cUnit, 1e-15), [cVal, cUnit]);
  const L = useMemo(() => Math.max(lVal * lUnit, 1e-15), [lVal, lUnit]);

  // Electrical time constants & 2nd order parameters
  const tauRC = useMemo(() => R * C, [R, C]);
  const tauRL = useMemo(() => L / R, [L, R]);

  // RLC parameters: wn = 1/sqrt(LC), zeta = (R/2)*sqrt(C/L)
  const rlcParams = useMemo(() => {
    const wn = 1 / Math.sqrt(L * C);
    const zeta = (R / 2) * Math.sqrt(C / L);
    const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
    let typeDesc = 'Subamortiguado (Oscilatorio)';
    if (Math.abs(zeta - 1) < 0.01) typeDesc = 'Críticamente Amortiguado';
    else if (zeta > 1) typeDesc = 'Sobreamortiguado (Sin oscilación)';

    return { wn, zeta, wd, typeDesc };
  }, [R, L, C]);

  // Transfer Functions definitions
  const transferFunctions: TransferFunctionInfo[] = useMemo(() => {
    return [
      // 1. RC: Ic(s) / V(s)
      {
        id: 'rc_ic_v',
        circuit: 'RC',
        name: '1. Corriente de Carga Ic(s) / V(s)',
        outputVar: 'i_c(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{I_c(s)}{V(s)} = \\frac{\\frac{1}{R}s}{s + \\frac{1}{RC}}',
        latexCanonical: `\\frac{I_c(s)}{V(s)} = \\frac{${(1 / R).toExponential(3)} \\cdot s}{s + ${(1 / tauRC).toExponential(3)}}`,
        zeros: 's = 0 (Cero en el origen)',
        poles: `s = -1/(RC) = -${(1 / tauRC).toExponential(3)} rad/s`,
        poleVal: -(1 / tauRC),
        K: 1 / R,
        KUnit: 'A/V (Siemens)',
        tau: tauRC,
        tauFormula: '\\tau = RC',
        responseDesc: 'Pasa-altos / Diferenciador: Salto inicial instantáneo a V/R y decaimiento exponencial a 0.',
        calcResponse: (t, V, r, c) => (V / r) * Math.exp(-t / (r * c)),
        yUnit: 'A',
      },
      // 2. RC: Vc(s) / I(s)
      {
        id: 'rc_vc_i',
        circuit: 'RC',
        name: '2. Voltaje en Capacitor por Corriente Vc(s) / I(s)',
        outputVar: 'v_c(t)',
        inputVar: 'i(t)',
        latexTF: '\\frac{V_c(s)}{I(s)} = \\frac{1/C}{s}',
        latexCanonical: `\\frac{V_c(s)}{I(s)} = \\frac{${(1 / C).toExponential(3)}}{s}`,
        zeros: 'Ninguno (sin ceros finitos)',
        poles: 's = 0 (Integrador puro ideal)',
        poleVal: 0,
        K: 1 / C,
        KUnit: 'V/(A·s)',
        tau: 0,
        tauFormula: 'Integrador puro',
        responseDesc: 'Integrador Puro: Ante un escalón de corriente I_0 = 1A, el voltaje crece como rampa lineal ilimitada.',
        calcResponse: (t, _, __, c) => (1.0 / c) * t,
        yUnit: 'V',
      },
      // 3. RC: Vc(s) / V(s)
      {
        id: 'rc_vc_v',
        circuit: 'RC',
        name: '3. Voltaje en Capacitor Vc(s) / V(s)',
        outputVar: 'v_c(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{V_c(s)}{V(s)} = \\frac{1/RC}{s + 1/RC} = \\frac{1}{RCs + 1}',
        latexCanonical: `\\frac{V_c(s)}{V(s)} = \\frac{1}{${tauRC.toExponential(3)}s + 1}`,
        zeros: 'Ninguno',
        poles: `s = -1/(RC) = -${(1 / tauRC).toExponential(3)} rad/s`,
        poleVal: -(1 / tauRC),
        K: 1.0,
        KUnit: 'Adimensional (V/V)',
        tau: tauRC,
        tauFormula: '\\tau = RC',
        responseDesc: 'Pasa-bajos Canónico: Carga exponencial suave hasta alcanzar el 100% de la tensión de entrada.',
        calcResponse: (t, V, r, c) => V * (1 - Math.exp(-t / (r * c))),
        yUnit: 'V',
      },
      // 4. RL: VL(s) / V(s)
      {
        id: 'rl_vl_v',
        circuit: 'RL',
        name: '4. Voltaje en Inductor VL(s) / V(s)',
        outputVar: 'v_L(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{V_L(s)}{V(s)} = \\frac{s}{s + R/L} = \\frac{\\frac{L}{R}s}{\\frac{L}{R}s + 1}',
        latexCanonical: `\\frac{V_L(s)}{V(s)} = \\frac{${tauRL.toExponential(3)}s}{${tauRL.toExponential(3)}s + 1}`,
        zeros: 's = 0 (Cero en el origen)',
        poles: `s = -R/L = -${(1 / tauRL).toExponential(3)} rad/s`,
        poleVal: -(1 / tauRL),
        K: 1.0,
        KUnit: 'Adimensional (V/V)',
        tau: tauRL,
        tauFormula: '\\tau = L/R',
        responseDesc: 'Pasa-altos Inductivo: Pico instantáneo de tensión V_in al inicio y decaimiento a 0 conforme la corriente se estabiliza.',
        calcResponse: (t, V, r, _, l) => V * Math.exp(-t / (l / r)),
        yUnit: 'V',
      },
      // 5. RL: IL(s) / V(s)
      {
        id: 'rl_il_v',
        circuit: 'RL',
        name: '5. Corriente en Inductor IL(s) / V(s)',
        outputVar: 'i_L(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{I_L(s)}{V(s)} = \\frac{1/L}{s + R/L} = \\frac{1/R}{\\frac{L}{R}s + 1}',
        latexCanonical: `\\frac{I_L(s)}{V(s)} = \\frac{${(1 / R).toExponential(3)}}{${tauRL.toExponential(3)}s + 1}`,
        zeros: 'Ninguno',
        poles: `s = -R/L = -${(1 / tauRL).toExponential(3)} rad/s`,
        poleVal: -(1 / tauRL),
        K: 1 / R,
        KUnit: 'A/V (Siemens)',
        tau: tauRL,
        tauFormula: '\\tau = L/R',
        responseDesc: 'Pasa-bajos Inductivo: Crecimiento exponencial suave de la corriente hasta el límite óhmico I_max = V/R.',
        calcResponse: (t, V, r, _, l) => (V / r) * (1 - Math.exp(-t / (l / r))),
        yUnit: 'A',
      },
      // 6. RLC: Vc(s) / V(s)
      {
        id: 'rlc_vc_v',
        circuit: 'RLC',
        name: '6. Voltaje en Capacitor Vc(s) / V(s) (2º Orden)',
        outputVar: 'v_C(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{V_C(s)}{V(s)} = \\frac{1/(LC)}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}} = \\frac{\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2}',
        latexCanonical: `\\frac{V_C(s)}{V(s)} = \\frac{${(rlcParams.wn * rlcParams.wn).toExponential(3)}}{s^2 + ${(2 * rlcParams.zeta * rlcParams.wn).toExponential(3)}s + ${(rlcParams.wn * rlcParams.wn).toExponential(3)}}`,
        zeros: 'Ninguno',
        poles: rlcParams.zeta < 1
          ? `s = -${(rlcParams.zeta * rlcParams.wn).toFixed(1)} \\pm j${rlcParams.wd.toFixed(1)} rad/s`
          : `Polos reales en s = -${(rlcParams.wn * (rlcParams.zeta - Math.sqrt(rlcParams.zeta**2 - 1))).toFixed(1)}, -${(rlcParams.wn * (rlcParams.zeta + Math.sqrt(rlcParams.zeta**2 - 1))).toFixed(1)}`,
        K: 1.0,
        KUnit: 'V/V',
        responseDesc: 'Filtro Pasa-bajos de 2º Orden. Respuesta al escalón con posible sobreimpulso oscilatorio si ζ < 1.',
        calcResponse: (t, V) => {
          const { wn, zeta, wd } = rlcParams;
          if (zeta < 1) {
            const expDecay = Math.exp(-zeta * wn * t);
            return V * (1 - expDecay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
          } else if (Math.abs(zeta - 1) < 0.01) {
            return V * (1 - (1 + wn * t) * Math.exp(-wn * t));
          } else {
            const s1 = -zeta * wn + wn * Math.sqrt(zeta * zeta - 1);
            const s2 = -zeta * wn - wn * Math.sqrt(zeta * zeta - 1);
            return V * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
          }
        },
        yUnit: 'V',
      },
      // 7. RLC: I(s) / V(s)
      {
        id: 'rlc_i_v',
        circuit: 'RLC',
        name: '7. Corriente de Malla I(s) / V(s) (Pasa-banda)',
        outputVar: 'i(t)',
        inputVar: 'v(t)',
        latexTF: '\\frac{I(s)}{V(s)} = \\frac{\\frac{1}{L}s}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}}',
        latexCanonical: `\\frac{I(s)}{V(s)} = \\frac{${(1 / L).toExponential(3)}s}{s^2 + ${(2 * rlcParams.zeta * rlcParams.wn).toExponential(3)}s + ${(rlcParams.wn * rlcParams.wn).toExponential(3)}}`,
        zeros: 's = 0 (Cero en el origen)',
        poles: rlcParams.zeta < 1 ? `s = -${(rlcParams.zeta * rlcParams.wn).toFixed(1)} \\pm j${rlcParams.wd.toFixed(1)} rad/s` : 'Polos reales',
        K: 1 / R,
        KUnit: 'A/V',
        responseDesc: 'Respuesta Pasa-banda resonante. Corriente transitoria oscilatoria que decae a cero en régimen permanente.',
        calcResponse: (t, V, _, __, l) => {
          const { wn, zeta, wd } = rlcParams;
          if (zeta < 1 && wd > 0) {
            return (V / (wd * l)) * Math.exp(-zeta * wn * t) * Math.sin(wd * t);
          } else {
            return (V / Math.max(R, 1)) * (Math.exp(-wn * 0.5 * t) - Math.exp(-wn * 2 * t));
          }
        },
        yUnit: 'A',
      },
    ];
  }, [R, C, L, tauRC, tauRL, rlcParams]);

  // Current active TF
  const activeTf = useMemo(() => {
    return transferFunctions.find(tf => tf.id === activeTfId) || transferFunctions[circuitType === 'RLC' ? 5 : 2];
  }, [transferFunctions, activeTfId, circuitType]);

  // Helper for SI prefix scaling of time
  const timeScale = useMemo(() => {
    let tRef = tauRC;
    if (activeTf.circuit === 'RL') tRef = tauRL;
    if (activeTf.circuit === 'RLC') tRef = 4 / Math.max(rlcParams.zeta * rlcParams.wn, 1e-4);

    if (tRef < 1e-6) return { mult: 1e9, unit: 'ns', label: 'Nanosegundos [ns]' };
    if (tRef < 1e-3) return { mult: 1e6, unit: 'µs', label: 'Microsegundos [µs]' };
    if (tRef < 1) return { mult: 1e3, unit: 'ms', label: 'Milisegundos [ms]' };
    return { mult: 1, unit: 's', label: 'Segundos [s]' };
  }, [activeTf, tauRC, tauRL, rlcParams]);

  // Helper for SI prefix scaling of output variable
  const outputScale = useMemo(() => {
    if (activeTf.yUnit === 'A') {
      const maxVal = vIn / R;
      if (maxVal < 1e-3) return { mult: 1e6, unit: 'µA' };
      if (maxVal < 1) return { mult: 1e3, unit: 'mA' };
      return { mult: 1, unit: 'A' };
    }
    return { mult: 1, unit: 'V' };
  }, [activeTf, vIn, R]);

  // Generate chart data for active TF
  const chartData = useMemo(() => {
    let tMax = 1e-3;
    if (activeTf.circuit === 'RC') tMax = tauRC * 5.5;
    else if (activeTf.circuit === 'RL') tMax = tauRL * 5.5;
    else {
      // RLC: approx 5 time constants or 4/sigma
      const sigma = Math.max(rlcParams.zeta * rlcParams.wn, 1e-6);
      tMax = (5 / sigma);
    }

    const steps = 120;
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const valRaw = activeTf.calcResponse(t, vIn, R, C, L);
      data.push({
        timeRaw: t,
        timeScaled: parseFloat((t * timeScale.mult).toFixed(3)),
        yScaled: parseFloat((valRaw * outputScale.mult).toFixed(4)),
      });
    }

    return data;
  }, [activeTf, vIn, R, C, L, tauRC, tauRL, rlcParams, timeScale, outputScale]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-4 h-4" />
              <span>Modelado Circuital y Respuesta Física</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Calculadora de Circuitos Eléctricos RC, RL y RLC
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Análisis completo de funciones de transferencia fundamentales en circuitos serie RC, RL y RLC. Cálculo de constante <MathView math="\tau" />, frecuencia natural <MathView math="\omega_n" /> y factor de amortiguamiento <MathView math="\zeta" />.
            </p>
          </div>

          {/* Actions & Circuit Type Selector Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Save className="w-3 h-3 text-emerald-400" />
                <span>LocalStorage</span>
              </span>
              <button
                onClick={resetCircuitState}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
                title="Restablecer circuito a valores por defecto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setCircuitType('RC')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  circuitType === 'RC'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RC Serie
              </button>
              <button
                onClick={() => setCircuitType('RL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  circuitType === 'RL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RL Serie
              </button>
              <button
                onClick={() => setCircuitType('RLC')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  circuitType === 'RLC'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RLC Serie (2º Orden)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Schematic & Component Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Component Values Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Parámetros de Componentes</span>
              <span className="text-xs font-mono text-emerald-400">
                {circuitType === 'RC'
                  ? `τ = ${(tauRC * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                  : circuitType === 'RL'
                  ? `τ = ${(tauRL * timeScale.mult).toFixed(2)} ${timeScale.unit}`
                  : `ζ = ${rlcParams.zeta.toFixed(2)}, ωn = ${rlcParams.wn.toFixed(1)}`}
              </span>
            </h3>

            {/* Resistor R input */}
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
                  onChange={(e) => setRVal(parseFloat(e.target.value) || 1)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={rUnit}
                  onChange={(e) => setRUnit(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                >
                  <option value={1}>Ω</option>
                  <option value={1e3}>kΩ</option>
                  <option value={1e6}>MΩ</option>
                </select>
              </div>
            </div>

            {/* Capacitor C input (shown if RC or RLC) */}
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
                    onChange={(e) => setCVal(parseFloat(e.target.value) || 1)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={cUnit}
                    onChange={(e) => setCUnit(parseFloat(e.target.value))}
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

            {/* Inductor L input (shown if RL or RLC) */}
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
                    onChange={(e) => setLVal(parseFloat(e.target.value) || 1)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={lUnit}
                    onChange={(e) => setLUnit(parseFloat(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                  >
                    <option value={1e-6}>µH</option>
                    <option value={1e-3}>mH</option>
                    <option value={1}>H</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step voltage input */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Amplitud Escalón Entrada (V):
              </label>
              <input
                type="number"
                step="0.5"
                value={vIn}
                onChange={(e) => setVIn(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* RLC Dynamic metrics badge */}
            {circuitType === 'RLC' && (
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-900/60 text-xs space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Régimen Circuital RLC:</span>
                  <span className="text-emerald-400 font-mono">{rlcParams.typeDesc}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 font-mono pt-1">
                  <span>ωn = {rlcParams.wn.toFixed(1)} rad/s</span>
                  <span>ζ = {rlcParams.zeta.toFixed(3)}</span>
                  {rlcParams.zeta < 1 && <span>ωd = {rlcParams.wd.toFixed(1)} rad/s</span>}
                </div>
              </div>
            )}
          </div>

          {/* Circuit Vector Diagram SVG */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Esquema Circuital Serie {circuitType}</span>
            </div>
            <div className="w-full flex justify-center py-2">
              <svg width="280" height="130" viewBox="0 0 280 130" className="text-slate-300 font-mono text-xs">
                {/* Wires */}
                <path d="M 40 40 L 80 40" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M 130 40 L 160 40" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M 210 40 L 230 40 L 230 60" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M 230 80 L 230 100 L 40 100" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M 40 100 L 40 40" stroke="#64748b" strokeWidth="2" fill="none" />

                {/* Source V(t) at (40, 70) */}
                <circle cx="40" cy="70" r="14" fill="#090d16" stroke="#10b981" strokeWidth="2" />
                <text x="40" y="74" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">V(t)</text>

                {/* Resistor R (80 to 130) */}
                <rect x="80" y="32" width="46" height="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="2" />
                <text x="103" y="44" textAnchor="middle" fill="#38bdf8" fontSize="9">R</text>

                {circuitType === 'RLC' ? (
                  <>
                    {/* Inductor at (160 to 210) */}
                    <path d="M 160 40 C 170 30 180 30 185 40 C 190 30 200 30 210 40" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                    <text x="185" y="26" textAnchor="middle" fill="#fbbf24" fontSize="9">L</text>
                    {/* Capacitor at (230, 70) */}
                    <line x1="215" y1="65" x2="245" y2="65" stroke="#34d399" strokeWidth="3" />
                    <line x1="215" y1="75" x2="245" y2="75" stroke="#34d399" strokeWidth="3" />
                    <text x="255" y="73" fill="#34d399" fontSize="9">C</text>
                  </>
                ) : circuitType === 'RC' ? (
                  // RC Only
                  <g>
                    <path d="M 130 40 L 230 40 L 230 60" stroke="#64748b" strokeWidth="2" fill="none" />
                    <line x1="215" y1="65" x2="245" y2="65" stroke="#34d399" strokeWidth="3" />
                    <line x1="215" y1="75" x2="245" y2="75" stroke="#34d399" strokeWidth="3" />
                    <text x="255" y="74" fill="#34d399" fontSize="10">C</text>
                  </g>
                ) : (
                  // RL Only
                  <g>
                    <path d="M 130 40 L 230 40 L 230 60" stroke="#64748b" strokeWidth="2" fill="none" />
                    <path d="M 230 60 C 245 60 245 70 230 70 C 245 70 245 80 230 80" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                    <text x="255" y="74" fill="#fbbf24" fontSize="10">L</text>
                  </g>
                )}

                {/* Current arrow */}
                <path d="M 55 33 L 70 33" stroke="#f43f5e" strokeWidth="2" />
                <text x="63" y="27" textAnchor="middle" fill="#f43f5e" fontSize="9">i(t)</text>
              </svg>
            </div>
            <div className="text-[11px] text-slate-400">
              Circuito lineal serie con disipador óhmico R y elementos reactivos.
            </div>
          </div>
        </div>

        {/* Transfer Functions list & Active Simulation */}
        <div className="lg:col-span-8 space-y-6">
          {/* Transfer functions cards for current circuit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Selecciona la Función de Transferencia a Analizar y Simular:</span>
              <span>{circuitType === 'RC' ? 'Funciones RC' : circuitType === 'RL' ? 'Funciones RL' : 'Funciones RLC'}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {transferFunctions
                .filter(tf => tf.circuit === circuitType)
                .map((tf) => {
                  const isSelected = activeTfId === tf.id;
                  return (
                    <div
                      key={tf.id}
                      onClick={() => setActiveTfId(tf.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-sm shadow-emerald-950/20'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                            )}
                            <h4 className="text-sm font-bold text-white">{tf.name}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 pl-6">{tf.responseDesc}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${isSelected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                            {tf.id}
                          </span>
                        </div>
                      </div>

                      {/* Math rendering and specs */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pl-6">
                        <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-0.5">Formulación Formal:</div>
                          <MathView math={tf.latexTF} block />
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-0.5">Polos y Ceros:</div>
                          <div className="text-slate-300 font-mono text-[11px]">{tf.poles}</div>
                          <div className="text-amber-400 font-mono mt-0.5 text-[11px]">{tf.zeros}</div>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-0.5">Parámetros Clave:</div>
                          <div className="text-slate-200 font-mono">K = {tf.K.toFixed(2)} {tf.KUnit}</div>
                          {tf.tau && (
                            <div className="text-cyan-400 font-mono mt-0.5">
                              τ = {(tf.tau * timeScale.mult).toFixed(2)} {timeScale.unit}
                            </div>
                          )}
                          {tf.circuit === 'RLC' && (
                            <div className="text-cyan-400 font-mono mt-0.5">
                              ζ = {rlcParams.zeta.toFixed(2)}, ωn = {rlcParams.wn.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Active Response Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Respuesta al Escalón para: {activeTf.outputVar}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulación con excitación escalón <MathView math={`V(t) = ${vIn}\\text{ V}`} /> | Base temporal: {timeScale.label}
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                Escala: {outputScale.unit} vs {timeScale.unit}
              </div>
            </div>

            {/* Recharts responsive container */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timeScaled"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${v}${timeScale.unit}`}
                    label={{ value: `Tiempo [${timeScale.unit}]`, position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    label={{ value: `Magnitud [${outputScale.unit}]`, angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(label) => `Tiempo: ${label} ${timeScale.unit}`}
                    formatter={(value: any) => [`${value} ${outputScale.unit}`, `Respuesta ${activeTf.outputVar}`]}
                  />

                  {activeTf.tau && activeTf.tau > 0 && (
                    <ReferenceLine
                      x={parseFloat((activeTf.tau * timeScale.mult).toFixed(2))}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{ value: `τ = ${(activeTf.tau * timeScale.mult).toFixed(1)} ${timeScale.unit}`, fill: '#10b981', position: 'top', fontSize: 10 }}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="yScaled"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    name={activeTf.outputVar}
                    isAnimationActive={false}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </div>

            {/* Explanation Note */}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Interpretación Física:</strong> {activeTf.responseDesc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
