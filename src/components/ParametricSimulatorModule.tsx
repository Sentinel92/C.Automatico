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

  const { K, tau, A, t_pert, amp_pert } = params;

  // Maximum time span for simulation: exactly 10*tau or after disturbance
  const tMax = useMemo(() => {
    return Math.max(tau * 10, t_pert + tau * 4, 10);
  }, [tau, t_pert]);

  // Derived key points
  const yFinalStep = A * K;
  const yTau = yFinalStep * 0.63212;
  const y4Tau = yFinalStep * 0.98168;
  const ts = 4 * tau;
  const essStep = A * (1 - K);
  const essRamp = A * tau; // only when K=1

  // 300 equispaced points from t = 0 to t = 10*tau (or tMax)
  const steps = 300;

  // 1. Step Response Data (300 points)
  const stepData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const y = yFinalStep * (1 - Math.exp(-t / tau));
      data.push({
        time: parseFloat(t.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        input: A,
        yFinal: parseFloat(yFinalStep.toFixed(3)),
      });
    }
    return data;
  }, [tMax, yFinalStep, tau, A, steps]);

  // 2. Ramp Response Data: u(t) = A*t, y(t) = A*K*[t - tau*(1 - e^(-t/tau))] (300 points)
  const rampData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const u = A * t;
      const y = A * K * (t - tau * (1 - Math.exp(-t / tau)));
      const error = u - y;

      data.push({
        time: parseFloat(t.toFixed(3)),
        reference: parseFloat(u.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        error: parseFloat(error.toFixed(3)),
      });
    }
    return data;
  }, [tMax, A, K, tau, steps]);

  // 3. Disturbance Response Data (300 points)
  const disturbanceData = useMemo(() => {
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      // Normal response to input A
      const yStep = yFinalStep * (1 - Math.exp(-t / tau));

      // Response to disturbance
      let yDist = 0;
      let dVal = 0;
      if (t >= t_pert) {
        dVal = amp_pert;
        const dtDist = t - t_pert;
        if (distType === 'input') {
          yDist = amp_pert * K * (1 - Math.exp(-dtDist / tau));
        } else {
          yDist = amp_pert; // direct additive output disturbance
        }
      }

      const totalY = yStep + yDist;

      data.push({
        time: parseFloat(t.toFixed(3)),
        yTotal: parseFloat(totalY.toFixed(3)),
        yNominal: parseFloat(yStep.toFixed(3)),
        disturbance: parseFloat(dVal.toFixed(3)),
      });
    }
    return data;
  }, [tMax, yFinalStep, tau, t_pert, amp_pert, distType, K, steps]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const dt = tMax / steps;
    let csv = 'Tiempo_s,Escalon_Entrada,Salida_Escalon,Rampa_Entrada,Salida_Rampa,Error_Rampa,Perturbacion,Salida_Total_Perturbacion\n';

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const stepIn = A;
      const stepOut = parseFloat((yFinalStep * (1 - Math.exp(-t / tau))).toFixed(4));

      const rampIn = parseFloat((A * t).toFixed(4));
      const rampOut = parseFloat((A * K * (t - tau * (1 - Math.exp(-t / tau)))).toFixed(4));
      const rampErr = parseFloat((rampIn - rampOut).toFixed(4));

      let dVal = 0;
      let dOut = 0;
      if (t >= t_pert) {
        dVal = amp_pert;
        const dtD = t - t_pert;
        dOut = distType === 'input' ? amp_pert * K * (1 - Math.exp(-dtD / tau)) : amp_pert;
      }
      const distTotalOut = parseFloat((stepOut + dOut).toFixed(4));

      csv += `${t},${stepIn},${stepOut},${rampIn},${rampOut},${rampErr},${dVal},${distTotalOut}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datos_simulacion_1er_orden_K${K}_tau${tau}.csv`;
    link.click();
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
              <span>Simulación Paramétrica Multivariable</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Simulador Paramétrico de 1er Orden (K, τ, Perturbación)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Experimenta de forma interactiva la influencia de la ganancia estática <MathView math="K" />, la constante de tiempo <MathView math="\tau" />, entradas tipo rampa y perturbaciones externas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-cyan-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/60 hover:bg-cyan-900/60 text-xs text-cyan-200 transition-colors"
              title="Descarga los 300 puntos de la simulación en formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar CSV (300 pts)</span>
            </button>
            <button
              onClick={() => {
                resetParams();
                setActiveTab('step');
                setDistType('input');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Restablecer simulación a valores por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Variables de Control Dinámico</span>
              <span className="text-[11px] font-mono text-cyan-400">Slid & Run</span>
            </h3>

            {/* Slider K */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Ganancia Estática (K):</span>
                <span className="font-mono font-bold text-emerald-400">{K.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={K}
                onChange={(e) => setParams(p => ({ ...p, K: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.2</span>
                <span>2.5</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Slider Tau */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Constante de Tiempo (τ):</span>
                <span className="font-mono font-bold text-cyan-400">{tau.toFixed(2)} s</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.1}
                value={tau}
                onChange={(e) => setParams(p => ({ ...p, tau: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.2 s (Rápido)</span>
                <span>2.0 s</span>
                <span>4.0 s (Lento)</span>
              </div>
            </div>

            {/* Slider A */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Amplitud Escalón Entrada (A):</span>
                <span className="font-mono font-bold text-indigo-400">{A.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={A}
                onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5</span>
                <span>2.5</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Disturbance controls divider */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Perturbación Externa</span>
                </span>
                <div className="flex text-[11px] bg-slate-950 p-0.5 rounded border border-slate-800">
                  <button
                    onClick={() => setDistType('input')}
                    className={`px-2 py-0.5 rounded ${distType === 'input' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400'}`}
                  >
                    Entrada
                  </button>
                  <button
                    onClick={() => setDistType('output')}
                    className={`px-2 py-0.5 rounded ${distType === 'output' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400'}`}
                  >
                    Salida
                  </button>
                </div>
              </div>

              {/* Slider t_pert */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Instante de Inyección (t_pert):</span>
                  <span className="font-mono font-bold text-amber-400">{t_pert.toFixed(1)} s</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.5}
                  value={t_pert}
                  onChange={(e) => setParams(p => ({ ...p, t_pert: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider amp_pert */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Amplitud de Perturbación:</span>
                  <span className="font-mono font-bold text-amber-400">{amp_pert.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-3.0}
                  max={3.0}
                  step={0.5}
                  value={amp_pert}
                  onChange={(e) => setParams(p => ({ ...p, amp_pert: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-3.0</span>
                  <span>0.0</span>
                  <span>+3.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Diagnóstico en Tiempo Real
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Valor Final Escalón (A·K):</span>
              <strong className="text-white font-mono">{yFinalStep.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Error Escalón e_ss: A(1-K):</span>
              <strong className={`font-mono ${Math.abs(essStep) < 1e-4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {essStep.toFixed(2)} {Math.abs(essStep) < 1e-4 ? '(K=1, e=0)' : ''}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Tiempo de Establecimiento (4τ):</span>
              <strong className="text-cyan-400 font-mono">{ts.toFixed(2)} s</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Error en Rampa e_ss:</span>
              <strong className={`font-mono ${Math.abs(K - 1) < 1e-4 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.abs(K - 1) < 1e-4 ? `${essRamp.toFixed(2)} (A·τ)` : 'Diverge (K ≠ 1)'}
              </strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Nuevo Estado Estable c/Perturbación:</span>
              <strong className="text-emerald-400 font-mono">
                {(yFinalStep + (distType === 'input' ? amp_pert * K : amp_pert)).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Right column: 3 Charts with View Selector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Chart View Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setActiveTab('step')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'step'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Respuesta al Escalón
              </button>
              <button
                onClick={() => setActiveTab('ramp')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'ramp'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Entrada Rampa u(t)=t
              </button>
              <button
                onClick={() => setActiveTab('disturbance')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'disturbance'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Inyección Perturbación
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ver Todos (3 Gráficos)
              </button>
            </div>
          </div>

          {/* Chart 1: Step Response */}
          {(activeTab === 'step' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>1. Respuesta al Escalón con Marcas en t = τ (63.2%) y t = 4τ (98.2%)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    A = {A.toFixed(1)}, K = {K.toFixed(1)} → y_final = {yFinalStep.toFixed(2)}
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
                  ts(2%) = {ts.toFixed(2)}s
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={stepData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
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
                      label={{ value: 'Salida y(t)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(l) => `t = ${l} s`}
                    />
                    {/* Final value asymptote */}
                    <ReferenceLine y={yFinalStep} stroke="#10b981" strokeDasharray="4 4" label={{ value: `y_ss = ${yFinalStep.toFixed(2)}`, fill: '#10b981', position: 'right', fontSize: 10 }} />

                    {/* Tau Marker */}
                    <ReferenceLine x={parseFloat(tau.toFixed(2))} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: `τ = ${tau.toFixed(1)}s (63.2%)`, fill: '#38bdf8', position: 'top', fontSize: 10 }} />
                    <ReferenceDot x={parseFloat(tau.toFixed(2))} y={parseFloat(yTau.toFixed(2))} r={4} fill="#38bdf8" stroke="#0284c7" />

                    {/* 4Tau Marker */}
                    <ReferenceLine x={parseFloat(ts.toFixed(2))} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: `4τ = ${ts.toFixed(1)}s (98.2%)`, fill: '#fbbf24', position: 'top', fontSize: 10 }} />
                    <ReferenceDot x={parseFloat(ts.toFixed(2))} y={parseFloat(y4Tau.toFixed(2))} r={4} fill="#fbbf24" stroke="#d97706" />

                    <Line type="monotone" dataKey="y" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Salida y(t)" isAnimationActive={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Ramp Response */}
          {(activeTab === 'ramp' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>2. Respuesta a Entrada Rampa u(t) = t y Desfase/Error e_ss = K·τ</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    La salida sigue a la rampa con un retraso asintótico constante de <MathView math="e_{ss} = K \cdot \tau" /> = {essRamp.toFixed(2)} unidades
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
                  e_ss = {essRamp.toFixed(2)}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={rampData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
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
                      label={{ value: 'Magnitud', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(l) => `t = ${l} s`}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />

                    <Line type="monotone" dataKey="reference" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.8} dot={false} name="Referencia Rampa u(t)" isAnimationActive={false} />
                    <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2.5} dot={false} name="Salida y(t)" isAnimationActive={false} />
                    <Line type="monotone" dataKey="error" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Error e(t) = u - y" isAnimationActive={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Disturbance Injection */}
          {(activeTab === 'disturbance' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>3. Inyección de Perturbación Externa en t = {t_pert.toFixed(1)} s</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Excitación inicial en t=0 con escalón A={A.toFixed(1)}, inyección de perturbación de amplitud {amp_pert > 0 ? `+${amp_pert}` : amp_pert} en t={t_pert.toFixed(1)}s ({distType === 'input' ? 'a la entrada' : 'a la salida'}).
                  </p>
                </div>
                <div className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
                  t_pert = {t_pert.toFixed(1)}s
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={disturbanceData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
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
                      label={{ value: 'Salida y(t)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                      labelFormatter={(l) => `t = ${l} s`}
                    />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />

                    {/* Disturbance time vertical marker */}
                    <ReferenceLine
                      x={parseFloat(t_pert.toFixed(2))}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: `t_pert = ${t_pert.toFixed(1)}s`, fill: '#f59e0b', position: 'top', fontSize: 10 }}
                    />

                    <Line type="monotone" dataKey="yNominal" stroke="#64748b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Sin Perturbación" isAnimationActive={false} />
                    <Line type="monotone" dataKey="yTotal" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Salida Real con Perturbación" isAnimationActive={false} />
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
