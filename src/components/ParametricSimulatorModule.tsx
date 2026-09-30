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
  Legend,
} from 'recharts';
import { Sliders, Activity, TrendingUp, AlertTriangle, RotateCcw, Save, Download } from 'lucide-react';
import { MathView } from './MathView';
import { SimulationParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultSimParams: SimulationParams = {
  K: 2.0,
  tau: 1.5,
  wn: 4.0,
  zeta: 0.35,
  systemType: '1st',
  A: 1.0,
  rampSlope: 1.0,
  t_pert: 4.0,
  amp_pert: 1.0,
};

export const ParametricSimulatorModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<SimulationParams>(
    'autocontrol_simulator_params',
    defaultSimParams
  );

  const [activeTab, setActiveTab] = useLocalStorage<'step' | 'ramp' | 'disturbance' | 'all'>(
    'autocontrol_simulator_active_tab',
    'step'
  );
  const [distType, setDistType] = useLocalStorage<'input' | 'output'>(
    'autocontrol_simulator_dist_type',
    'input'
  );

  const { K, tau, wn = 4.0, zeta = 0.35, systemType = '1st', A, t_pert, amp_pert } = params;

  // Maximum time span for simulation: exactly 10*tau (or 6/sigma for 2nd order)
  const tMax = useMemo(() => {
    if (systemType === '1st') {
      return Math.max(tau * 10, t_pert + tau * 4, 10);
    } else {
      const sigma = Math.max(zeta * wn, 0.2);
      return Math.max(8 / sigma, t_pert + 4, 10);
    }
  }, [tau, t_pert, systemType, zeta, wn]);

  // Derived key points 1st order
  const yFinalStep = A * K;
  const yTau = yFinalStep * 0.63212;
  const y4Tau = yFinalStep * 0.98168;
  const ts1st = 4 * tau;

  // Derived key points 2nd order
  const wd = useMemo(() => (zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0), [wn, zeta]);
  const sigma = useMemo(() => zeta * wn, [zeta, wn]);
  const MpPercent = useMemo(() => (zeta < 1 ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100 : 0), [zeta]);
  const tp = useMemo(() => (zeta < 1 && wd > 0 ? Math.PI / wd : 0), [zeta, wd]);
  const ts2nd = useMemo(() => (sigma > 0 ? 4 / sigma : 10), [sigma]);
  const peakY = useMemo(() => yFinalStep * (1 + MpPercent / 100), [yFinalStep, MpPercent]);

  const steps = 300;

  // 1. Step Response Data (300 points)
  const stepData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;

      if (systemType === '1st') {
        y = yFinalStep * (1 - Math.exp(-t / Math.max(tau, 0.001)));
      } else {
        if (zeta < 1) {
          const expDecay = Math.exp(-sigma * t);
          y = yFinalStep * (1 - expDecay * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
        } else if (Math.abs(zeta - 1) < 0.01) {
          y = yFinalStep * (1 - (1 + wn * t) * Math.exp(-wn * t));
        } else {
          const s1 = -sigma + wn * Math.sqrt(zeta * zeta - 1);
          const s2 = -sigma - wn * Math.sqrt(zeta * zeta - 1);
          y = yFinalStep * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
      }

      data.push({
        time: parseFloat(t.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        input: A,
        yFinal: parseFloat(yFinalStep.toFixed(3)),
      });
    }
    return data;
  }, [tMax, yFinalStep, tau, A, steps, systemType, zeta, wn, wd, sigma]);

  // 2. Ramp Response Data: u(t) = A*t
  const rampData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const u = A * t;
      let y = 0;

      if (systemType === '1st') {
        y = A * K * (t - tau * (1 - Math.exp(-t / Math.max(tau, 0.001))));
      } else {
        // 2nd order ramp response: steady error = 2*zeta/wn if K=1
        y = A * K * (t - (2 * zeta / wn) * (1 - Math.exp(-sigma * t) * Math.cos(wd * t)));
      }
      const error = u - y;

      data.push({
        time: parseFloat(t.toFixed(3)),
        reference: parseFloat(u.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        error: parseFloat(error.toFixed(3)),
      });
    }
    return data;
  }, [tMax, A, K, tau, steps, systemType, zeta, wn, sigma, wd]);

  // 3. Disturbance Response Data (300 points)
  const disturbanceData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let yNominal = 0;
      let yDist = 0;
      let dVal = 0;

      if (systemType === '1st') {
        yNominal = yFinalStep * (1 - Math.exp(-t / Math.max(tau, 0.001)));
        if (t >= t_pert) {
          dVal = amp_pert;
          const dtDist = t - t_pert;
          yDist = distType === 'input' ? amp_pert * K * (1 - Math.exp(-dtDist / Math.max(tau, 0.001))) : amp_pert;
        }
      } else {
        if (zeta < 1) {
          yNominal = yFinalStep * (1 - Math.exp(-sigma * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t)));
          if (t >= t_pert) {
            dVal = amp_pert;
            const dtDist = t - t_pert;
            yDist = distType === 'input'
              ? amp_pert * K * (1 - Math.exp(-sigma * dtDist) * (Math.cos(wd * dtDist) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * dtDist)))
              : amp_pert;
          }
        } else {
          yNominal = yFinalStep * (1 - (1 + wn * t) * Math.exp(-wn * t));
          if (t >= t_pert) {
            dVal = amp_pert;
            yDist = amp_pert;
          }
        }
      }

      const totalY = yNominal + yDist;

      data.push({
        time: parseFloat(t.toFixed(3)),
        yTotal: parseFloat(totalY.toFixed(3)),
        yNominal: parseFloat(yNominal.toFixed(3)),
        disturbance: parseFloat(dVal.toFixed(3)),
      });
    }
    return data;
  }, [tMax, yFinalStep, tau, t_pert, amp_pert, distType, K, steps, systemType, zeta, wn, sigma, wd]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const dt = tMax / steps;
    let csv = 'Tiempo_s,Escalon_Entrada,Salida_Escalon,Rampa_Entrada,Salida_Rampa,Error_Rampa,Perturbacion,Salida_Total_Perturbacion\n';

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const stepIn = A;
      const stepOut = parseFloat(stepData[i]?.y.toFixed(4) || '0');
      const rampIn = parseFloat(rampData[i]?.reference.toFixed(4) || '0');
      const rampOut = parseFloat(rampData[i]?.y.toFixed(4) || '0');
      const rampErr = parseFloat(rampData[i]?.error.toFixed(4) || '0');
      const dVal = parseFloat(disturbanceData[i]?.disturbance.toFixed(4) || '0');
      const distTotalOut = parseFloat(disturbanceData[i]?.yTotal.toFixed(4) || '0');

      csv += `${t},${stepIn},${stepOut},${rampIn},${rampOut},${rampErr},${dVal},${distTotalOut}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulador_${systemType}_K${K}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Sliders className="w-4 h-4" />
              <span>Simulación Dinámica Multivariable</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 4: Simulador Paramétrico y Comportamiento Temporal
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Explora en tiempo real las respuestas ante entrada escalón, rampa y perturbaciones externas. Observa con precisión gráfica los puntos críticos: <MathView math="\tau" />, <MathView math="4\tau" />, tiempo de pico <MathView math="t_p" />, sobrepaso <MathView math="M_p" /> y error permanente <MathView math="e_{ss}" />.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-cyan-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-200 transition-colors"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Exportar CSV</span>
            </button>
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

        {/* System Order & Tabs Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setParams(p => ({ ...p, systemType: '1st' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                systemType === '1st'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Planta 1er Orden (K, τ)
            </button>
            <button
              onClick={() => setParams(p => ({ ...p, systemType: '2nd' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                systemType === '2nd'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Planta 2º Orden (wn, ζ, K)
            </button>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('step')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'step' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Escalón
            </button>
            <button
              onClick={() => setActiveTab('ramp')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'ramp' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Rampa & Error
            </button>
            <button
              onClick={() => setActiveTab('disturbance')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'disturbance' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Perturbación
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders Controls + Selected Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Parámetros de Simulación</span>
              <span className="text-xs font-mono text-cyan-400">
                {systemType === '1st' ? `ts = ${(4 * tau).toFixed(2)}s` : `ts ≈ ${ts2nd.toFixed(2)}s`}
              </span>
            </h3>

            {/* Gain K */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Estática (K):</span>
                <span className="font-mono text-cyan-400 font-bold">{K.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={K}
                onChange={(e) => setParams(p => ({ ...p, K: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {systemType === '1st' ? (
              /* Tau Slider */
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Constante de Tiempo (τ):</span>
                  <span className="font-mono text-cyan-400 font-bold">{tau.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={tau}
                  onChange={(e) => setParams(p => ({ ...p, tau: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ) : (
              /* 2nd order wn and zeta */
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Frecuencia Natural (wn):</span>
                    <span className="font-mono text-cyan-400 font-bold">{wn.toFixed(2)} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={wn}
                    onChange={(e) => setParams(p => ({ ...p, wn: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Amortiguamiento (ζ):</span>
                    <span className="font-mono text-cyan-400 font-bold">{zeta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={zeta}
                    onChange={(e) => setParams(p => ({ ...p, zeta: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Amplitude A */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Amplitud Escalón (A):</span>
                <span className="font-mono text-white font-bold">{A.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={A}
                onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) }))}
                className="w-full accent-slate-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Perturbation Time */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Instante de Perturbación (t_pert):</span>
                <span className="font-mono text-amber-400 font-bold">{t_pert.toFixed(1)} s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={t_pert}
                onChange={(e) => setParams(p => ({ ...p, t_pert: parseFloat(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Perturbation Amplitude */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Amplitud Perturbación:</span>
                <span className="font-mono text-amber-400 font-bold">{amp_pert.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="3.0"
                step="0.5"
                value={amp_pert}
                onChange={(e) => setParams(p => ({ ...p, amp_pert: parseFloat(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>
                  {activeTab === 'step' && '1. Respuesta al Escalón con Marcadores de Régimen Transitorio'}
                  {activeTab === 'ramp' && '2. Respuesta a la Rampa u(t) = A·t y Brecha de Error Permanente'}
                  {activeTab === 'disturbance' && '3. Respuesta Dinámica ante Inyección de Perturbación Externa'}
                </span>
              </h3>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'step' ? (
                  <RechartsLine data={stepData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine y={yFinalStep} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `y(∞)=${yFinalStep.toFixed(2)}`, fill: '#94a3b8', fontSize: 10, position: 'right' }} />

                    {systemType === '1st' ? (
                      <>
                        <ReferenceLine x={tau} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: `τ = ${tau.toFixed(1)}s (63.2%)`, fill: '#06b6d4', fontSize: 10, position: 'top' }} />
                        <ReferenceLine x={ts1st} stroke="#818cf8" strokeDasharray="3 3" label={{ value: `4τ = ${ts1st.toFixed(1)}s (98.2%)`, fill: '#818cf8', fontSize: 10, position: 'top' }} />
                        <ReferenceDot x={tau} y={yTau} r={4} fill="#06b6d4" />
                        <ReferenceDot x={ts1st} y={y4Tau} r={4} fill="#818cf8" />
                      </>
                    ) : (
                      <>
                        {zeta < 1 && (
                          <ReferenceDot x={tp} y={peakY} r={5} fill="#f59e0b" stroke="#fff" label={{ value: `Mp = ${MpPercent.toFixed(1)}%`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                        )}
                        <ReferenceLine x={ts2nd} stroke="#818cf8" strokeDasharray="3 3" label={{ value: `ts ≈ ${ts2nd.toFixed(1)}s`, fill: '#818cf8', fontSize: 10, position: 'top' }} />
                      </>
                    )}

                    <Line type="monotone" dataKey="y" name="Salida y(t)" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                  </RechartsLine>
                ) : activeTab === 'ramp' ? (
                  <RechartsLine data={rampData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="reference" name="Entrada Rampa r(t)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                    <Line type="monotone" dataKey="y" name="Salida y(t)" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="error" name="Brecha de Error e(t)" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </RechartsLine>
                ) : (
                  <RechartsLine data={disturbanceData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine x={t_pert} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `t_pert = ${t_pert}s`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                    <Line type="monotone" dataKey="yNominal" name="Salida Nominal (Sin Perturbación)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="yTotal" name="Salida con Perturbación y(t)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                  </RechartsLine>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
