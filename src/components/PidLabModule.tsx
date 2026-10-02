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
  Legend,
} from 'recharts';
import {
  Activity,
  Sliders,
  RotateCcw,
  Save,
  Wand2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MathView } from './MathView';
import { PIDLabParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultPIDParams: PIDLabParams = {
  plantK: 2.0,
  plantTau: 1.5,
  Kp: 2.5,
  Ki: 1.2,
  Kd: 0.35,
  setpoint: 1.0,
  tSim: 10.0,
  controllerMode: 'PID',
};

export const PidLabModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<PIDLabParams>(
    'autocontrol_pid_params',
    defaultPIDParams
  );

  const [activeTab, setActiveTab] = useState<'response' | 'control_effort'>('response');
  const [tuningToast, setTuningToast] = useState<string | null>(null);

  const { plantK, plantTau, Kp, Ki, Kd, setpoint, tSim, controllerMode } = params;

  // Active controller gains according to mode
  const activeKp = Kp;
  const activeKi = controllerMode === 'P' ? 0 : Ki;
  const activeKd = controllerMode === 'PID' ? Kd : 0;

  // RK4 Simulation of Closed-Loop PID + Plant
  // Plant: tau * dy/dt + y = K * u  =>  dy/dt = (K*u - y) / tau
  // Controller: u(t) = Kp*e + Ki*integral(e) + Kd*de/dt
  // To avoid derivative kick on step, derivative acts on output: de/dt = -dy/dt
  // State variables: x1 = y(t), x2 = int_0^t (r - y) dt
  // Then u(t) = Kp*(r - y) + Ki*x2 - Kd * dy/dt
  // dy/dt = (K*(Kp*(r - y) + Ki*x2 - Kd*dy/dt) - y) / tau
  // dy/dt * (tau + K*Kd) = K*(Kp*(r - y) + Ki*x2) - y
  // dy/dt = [ K*(Kp*(r - y) + Ki*x2) - y ] / (tau + K*Kd)
  const simulationData = useMemo(() => {
    const steps = 300;
    const dt = Math.max(tSim / steps, 0.001);
    const data = [];

    let y_cl = 0;
    let int_e = 0;
    let y_ol = 0;

    const denom = Math.max(plantTau + plantK * activeKd, 0.001);

    const calcDeriv = (currY: number, currIntE: number) => {
      const e = setpoint - currY;
      const u_ideal = plantK * (activeKp * e + activeKi * currIntE) - currY;
      const dy = u_ideal / denom;
      return { dy, de: e };
    };

    let peakY = 0;
    let peakTime = 0;
    let riseTime: number | null = null;
    let settlingTime: number | null = null;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;

      // Closed loop RK4 step
      const k1 = calcDeriv(y_cl, int_e);
      const k2 = calcDeriv(y_cl + 0.5 * dt * k1.dy, int_e + 0.5 * dt * k1.de);
      const k3 = calcDeriv(y_cl + 0.5 * dt * k2.dy, int_e + 0.5 * dt * k2.de);
      const k4 = calcDeriv(y_cl + dt * k3.dy, int_e + dt * k3.de);

      // Open loop 1st order step response: y_ol(t) = setpoint * plantK * (1 - exp(-t/plantTau))
      y_ol = setpoint * plantK * (1 - Math.exp(-t / Math.max(plantTau, 0.001)));

      const err = setpoint - y_cl;
      const dy_dt = k1.dy;
      // Control action u(t) = Kp*e + Ki*int_e - Kd*dy_dt
      const u = activeKp * err + activeKi * int_e - activeKd * dy_dt;

      data.push({
        time: parseFloat(t.toFixed(3)),
        referencia: setpoint,
        salida_pid: parseFloat(y_cl.toFixed(3)),
        salida_ol: parseFloat(y_ol.toFixed(3)),
        control_u: parseFloat(u.toFixed(2)),
        error: parseFloat(err.toFixed(3)),
      });

      // Track transient metrics
      if (y_cl > peakY) {
        peakY = y_cl;
        peakTime = t;
      }
      if (riseTime === null && y_cl >= 0.9 * setpoint) {
        riseTime = t;
      }
      // Settling time within 2% band of steady state
      const targetVal = activeKi > 0 ? setpoint : setpoint * ((plantK * activeKp) / (1 + plantK * activeKp));
      if (Math.abs(y_cl - targetVal) > 0.02 * Math.abs(targetVal || 1)) {
        settlingTime = t;
      }

      // Advance state
      y_cl += (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);
      int_e += (dt / 6) * (k1.de + 2 * k2.de + 2 * k3.de + k4.de);
    }

    const finalY = data[data.length - 1].salida_pid;
    const ess = Math.abs(setpoint - finalY);
    const overshootPercent = Math.max(0, ((peakY - setpoint) / (setpoint || 1)) * 100);

    return {
      points: data,
      metrics: {
        peakY: parseFloat(peakY.toFixed(3)),
        peakTime: parseFloat(peakTime.toFixed(2)),
        riseTime: riseTime ? parseFloat(riseTime.toFixed(2)) : 0,
        settlingTime: settlingTime ? parseFloat(settlingTime.toFixed(2)) : 0,
        overshootPercent: parseFloat(overshootPercent.toFixed(1)),
        ess: parseFloat(ess.toFixed(4)),
        finalY: parseFloat(finalY.toFixed(3)),
      },
    };
  }, [tSim, setpoint, plantK, plantTau, activeKp, activeKi, activeKd]);

  // Automatic Tuning Presets
  const applyZieglerNichols = () => {
    // Equivalent dead-time theta ~ 0.18 * tau for reaction curve of lag
    const theta = 0.18 * plantTau;
    const aVal = (plantK * theta) / plantTau;
    let newKp = 0;
    let newKi = 0;
    let newKd = 0;

    if (controllerMode === 'P') {
      newKp = 1 / aVal;
    } else if (controllerMode === 'PI') {
      newKp = 0.9 / aVal;
      const Ti = 3.33 * theta;
      newKi = newKp / Ti;
    } else {
      // Full PID
      newKp = 1.2 / aVal;
      const Ti = 2.0 * theta;
      const Td = 0.5 * theta;
      newKi = newKp / Ti;
      newKd = newKp * Td;
    }

    setParams(p => ({
      ...p,
      Kp: parseFloat(newKp.toFixed(2)),
      Ki: parseFloat(newKi.toFixed(2)),
      Kd: parseFloat(newKd.toFixed(2)),
    }));
    setTuningToast('✓ Sintonía Ziegler-Nichols (Respuesta rápida con rechazo de perturbaciones aplicada)');
    setTimeout(() => setTuningToast(null), 4000);
  };

  const applyLambdaIMC = () => {
    // IMC / Lambda tuning for critically damped, zero overshoot response
    // Desired closed-loop time constant lambda = 1.0 * tau
    const lambda = plantTau * 0.8;
    const newKp = plantTau / (plantK * lambda);
    const newKi = newKp / plantTau;
    const newKd = 0; // IMC for 1st order requires PI

    setParams(p => ({
      ...p,
      Kp: parseFloat(newKp.toFixed(2)),
      Ki: parseFloat(newKi.toFixed(2)),
      Kd: 0,
      controllerMode: 'PI',
    }));
    setTuningToast('✓ Sintonía IMC / Lambda aplicada (Respuesta suave sin sobrepico Mp=0%)');
    setTimeout(() => setTuningToast(null), 4000);
  };

  const applyAggressiveTuning = () => {
    // Fast Tracking PID
    const newKp = parseFloat(((3.5 * plantTau) / plantK).toFixed(2));
    const newKi = parseFloat((newKp / (plantTau * 0.6)).toFixed(2));
    const newKd = parseFloat((newKp * (plantTau * 0.12)).toFixed(2));

    setParams(p => ({
      ...p,
      Kp: newKp,
      Ki: newKi,
      Kd: newKd,
      controllerMode: 'PID',
    }));
    setTuningToast('✓ Sintonía de Alta Velocidad (Minimización de tiempo de subida tr)');
    setTimeout(() => setTuningToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Sliders className="w-4 h-4" />
              <span>Control Clásico en Lazo Cerrado</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Laboratorio de Control PID en Lazo Cerrado
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Diseña, sintoniza y compara controladores P, PI y PID aplicados a plantas de 1er orden. Observa la eliminación de error permanente, tiempo de asentamiento y esfuerzo de control.
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
              title="Restablecer parámetros PID"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Controller mode toggles */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['P', 'PI', 'PID'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setParams(p => ({ ...p, controllerMode: mode }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  controllerMode === mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Controlador {mode}
              </button>
            ))}
          </div>

          {/* Quick Tuning Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={applyZieglerNichols}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 text-xs font-medium transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Sintonía Ziegler-Nichols</span>
            </button>
            <button
              onClick={applyLambdaIMC}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sintonía IMC / Lambda (Mp=0%)</span>
            </button>
            <button
              onClick={applyAggressiveTuning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-600/40 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Rápido / Agresivo</span>
            </button>
          </div>
        </div>

        {/* Tuning notification toast */}
        {tuningToast && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{tuningToast}</span>
          </div>
        )}
      </div>

      {/* DEDUCCIÓN SIMBÓLICA EN LAZO CERRADO T(s) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
              Σ
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Análisis Simbólico Formal de la Función de Transferencia en Lazo Cerrado T(s)
            </h3>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono">
            T(s) = Y(s) / R(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">1. Controlador PID en Laplace:</span>
            <MathView math="C(s) = K_p + \frac{K_i}{s} + K_d s = \frac{K_d s^2 + K_p s + K_i}{s}" display />
            <span className="text-[10px] text-slate-400">Introduce un polo en el origen (s=0) para eliminar ess.</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block">2. Planta en Lazo Abierto:</span>
            <MathView math="G(s) = \frac{K}{\tau s + 1}" display />
            <span className="text-[10px] text-slate-400">Ganancia K y constante de inercia tau.</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">3. Lazo Cerrado con Realimentación:</span>
            <MathView math="T(s) = \frac{C(s)G(s)}{1 + C(s)G(s)H(s)} \quad (H=1)" display />
            <span className="text-[10px] text-slate-400">Polinomio de 2º orden: (tau + K·Kd)s² + (1 + K·Kp)s + K·Ki</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & Interactive Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-4 space-y-4">
          {/* Plant G(s) settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Planta a Controlar G(s)</span>
              </h3>
              <div className="text-[11px] font-mono text-cyan-400">
                G(s) = {plantK.toFixed(1)} / ({plantTau.toFixed(1)}s + 1)
              </div>
            </div>

            {/* Plant K slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Estática (K):</span>
                <span className="font-mono text-cyan-400 font-bold">{plantK.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={plantK}
                onChange={(e) => setParams(p => ({ ...p, plantK: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Plant Tau slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Constante de Tiempo (τ):</span>
                <span className="font-mono text-cyan-400 font-bold">{plantTau.toFixed(2)} s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={plantTau}
                onChange={(e) => setParams(p => ({ ...p, plantTau: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Setpoint Step */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Amplitud del Setpoint (r):</span>
                <span className="font-mono text-white font-bold">{setpoint.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={setpoint}
                onChange={(e) => setParams(p => ({ ...p, setpoint: parseFloat(e.target.value) }))}
                className="w-full accent-slate-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* PID Gains Sliders */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parámetros del Controlador</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono font-bold">
                Modo {controllerMode}
              </span>
            </div>

            {/* Kp Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Proporcional (Kp):</span>
                <span className="font-mono text-indigo-300 font-bold">{Kp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15.0"
                step="0.1"
                value={Kp}
                onChange={(e) => setParams(p => ({ ...p, Kp: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Incrementa la rapidez de reacción y reduce error offset.</span>
            </div>

            {/* Ki Slider */}
            <div className={controllerMode === 'P' ? 'opacity-40 pointer-events-none' : ''}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Integral (Ki):</span>
                <span className="font-mono text-emerald-400 font-bold">{controllerMode === 'P' ? '0.00 (Inactivo)' : Ki.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.1"
                value={Ki}
                disabled={controllerMode === 'P'}
                onChange={(e) => setParams(p => ({ ...p, Ki: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Elimina completamente el error permanente en estado estable (ess = 0).</span>
            </div>

            {/* Kd Slider */}
            <div className={controllerMode !== 'PID' ? 'opacity-40 pointer-events-none' : ''}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Derivativa (Kd):</span>
                <span className="font-mono text-amber-400 font-bold">{controllerMode !== 'PID' ? '0.00 (Inactivo)' : Kd.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.05"
                value={Kd}
                disabled={controllerMode !== 'PID'}
                onChange={(e) => setParams(p => ({ ...p, Kd: parseFloat(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Frena oscilaciones y reduce el sobrepico máximo (Mp).</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Transient Metric Cards */}
        <div className="lg:col-span-8 space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Tiempo Asentamiento</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {simulationData.metrics.settlingTime} s
              </div>
              <span className="text-[10px] text-slate-500">Criterio banda ±2%</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Sobrepico (Mp)</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-300">
                {simulationData.metrics.overshootPercent}%
              </div>
              <span className="text-[10px] text-slate-500">Pico: {simulationData.metrics.peakY} en {simulationData.metrics.peakTime}s</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Tiempo de Subida (tr)</span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-lg font-bold font-mono text-indigo-300">
                {simulationData.metrics.riseTime} s
              </div>
              <span className="text-[10px] text-slate-500">0% a 90% del setpoint</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Error Estable (ess)</span>
                <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className={`text-lg font-bold font-mono ${simulationData.metrics.ess < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {simulationData.metrics.ess}
              </div>
              <span className="text-[10px] text-slate-500">
                {activeKi > 0 ? '✓ Nulo por Acción Integral' : 'Con offset residual'}
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Respuesta Temporal Comparada</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Lazo Cerrado con PID vs Planta Libre en Lazo Abierto
                </span>
              </div>

              {/* Chart tabs */}
              <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
                <button
                  onClick={() => setActiveTab('response')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'response'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Salida y(t)
                </button>
                <button
                  onClick={() => setActiveTab('control_effort')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'control_effort'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Esfuerzo u(t)
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine
                  data={simulationData.points}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${v}s`}
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

                  {activeTab === 'response' ? (
                    <>
                      <ReferenceLine
                        y={setpoint}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        label={{ value: `Ref = ${setpoint}`, fill: '#94a3b8', fontSize: 10, position: 'right' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="salida_pid"
                        name="Lazo Cerrado (PID)"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="salida_ol"
                        name="Lazo Abierto (Sin Control)"
                        stroke="#64748b"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </>
                  ) : (
                    <>
                      <Line
                        type="monotone"
                        dataKey="control_u"
                        name="Señal de Control u(t)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="error"
                        name="Error e(t)"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </>
                  )}
                </RechartsLine>
              </ResponsiveContainer>
            </div>

            {/* Analysis card */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-white">Interpretación de Ingeniería de Control:</span>
              <p className="text-slate-400">
                La adición del término integral <MathView math="K_i" /> eleva el tipo del sistema a Tipo 1, forzando la señal de error <MathView math="e(t) \to 0" /> asintóticamente. Por otro lado, la acción derivativa <MathView math="K_d" /> actúa como amortiguador viscoso dinámico, frenando el avance cuando la velocidad de salida <MathView math="\dot{y}" /> es elevada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
