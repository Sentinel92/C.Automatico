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
  Radio,
  Eye,
  Zap,
  Info,
  Maximize2,
  TrendingDown,
} from 'lucide-react';
import { MathView } from './MathView';
import { BodeParams } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultBodeParams: BodeParams = {
  systemType: '1st',
  K: 2.0,
  tau: 1.0,
  wn: 5.0,
  zeta: 0.35,
  freqMinExp: -2, // 0.01 rad/s
  freqMaxExp: 3,  // 1000 rad/s
  probeFreq: 1.0,
};

export const BodeAnalyzerModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<BodeParams>(
    'autocontrol_bode_params',
    defaultBodeParams
  );

  const [activePlot, setActivePlot] = useState<'both' | 'magnitude' | 'phase'>('both');
  const [showProbe, setShowProbe] = useState<boolean>(true);

  const { systemType, K, tau, wn, zeta, freqMinExp, freqMaxExp, probeFreq } = params;

  // Cutoff / resonance frequencies
  const omegaC = useMemo(() => 1 / Math.max(tau, 0.001), [tau]);
  const omegaR = useMemo(() => {
    if (zeta < 0.7071) {
      return wn * Math.sqrt(Math.max(0, 1 - 2 * zeta * zeta));
    }
    return wn;
  }, [wn, zeta]);

  // Compute Bode frequency response points
  const bodeData = useMemo(() => {
    const totalPoints = 120;
    const expStep = (freqMaxExp - freqMinExp) / (totalPoints - 1);
    const data = [];

    for (let i = 0; i < totalPoints; i++) {
      const exp = freqMinExp + i * expStep;
      const omega = Math.pow(10, exp);

      let magDb = 0;
      let phaseDeg = 0;

      if (systemType === '1st') {
        // G(jw) = K / (1 + j*w*tau)
        const denomMag = Math.sqrt(1 + Math.pow(omega * tau, 2));
        magDb = 20 * Math.log10(K) - 20 * Math.log10(denomMag);
        phaseDeg = -Math.atan(omega * tau) * (180 / Math.PI);
      } else {
        // G(jw) = K * wn^2 / ( -w^2 + 2j*zeta*wn*w + wn^2 )
        const u = omega / Math.max(wn, 0.001);
        const real = 1 - u * u;
        const imag = 2 * zeta * u;
        const denomMag = Math.sqrt(real * real + imag * imag);
        magDb = 20 * Math.log10(K) - 20 * Math.log10(Math.max(denomMag, 1e-6));
        phaseDeg = -Math.atan2(imag, real) * (180 / Math.PI);
      }

      data.push({
        omega: parseFloat(omega.toFixed(3)),
        logOmega: parseFloat(exp.toFixed(2)),
        magDb: parseFloat(magDb.toFixed(2)),
        phaseDeg: parseFloat(phaseDeg.toFixed(2)),
      });
    }

    return data;
  }, [systemType, K, tau, wn, zeta, freqMinExp, freqMaxExp]);

  // Evaluate G(j*w) at probe frequency
  const probeResponse = useMemo(() => {
    let mag = 1;
    let magDb = 0;
    let phaseDeg = 0;

    if (systemType === '1st') {
      const denomMag = Math.sqrt(1 + Math.pow(probeFreq * tau, 2));
      mag = K / denomMag;
      magDb = 20 * Math.log10(mag);
      phaseDeg = -Math.atan(probeFreq * tau) * (180 / Math.PI);
    } else {
      const u = probeFreq / Math.max(wn, 0.001);
      const real = 1 - u * u;
      const imag = 2 * zeta * u;
      const denomMag = Math.sqrt(real * real + imag * imag);
      mag = K / Math.max(denomMag, 1e-6);
      magDb = 20 * Math.log10(mag);
      phaseDeg = -Math.atan2(imag, real) * (180 / Math.PI);
    }

    return {
      mag: parseFloat(mag.toFixed(3)),
      magDb: parseFloat(magDb.toFixed(2)),
      phaseDeg: parseFloat(phaseDeg.toFixed(2)),
      phaseRad: (phaseDeg * Math.PI) / 180,
    };
  }, [systemType, K, tau, wn, zeta, probeFreq]);

  // Sinusoidal steady-state wave points for the probe
  const probeWaveData = useMemo(() => {
    const period = (2 * Math.PI) / Math.max(probeFreq, 0.001);
    const tMax = period * 2.5;
    const steps = 100;
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const u = Math.sin(probeFreq * t);
      const y = probeResponse.mag * Math.sin(probeFreq * t + probeResponse.phaseRad);

      data.push({
        t: parseFloat(t.toFixed(4)),
        entrada: parseFloat(u.toFixed(3)),
        salida: parseFloat(y.toFixed(3)),
      });
    }

    return data;
  }, [probeFreq, probeResponse]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Radio className="w-4 h-4" />
              <span>Análisis en el Dominio de la Frecuencia</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Analizador de Frecuencia: Diagramas de Bode
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Visualiza con precisión analítica las curvas logarítmicas de Magnitud [dB] y Fase [°]. Identifica la pulsación de corte <MathView math="\omega_c = 1/\tau" />, resonancias secundarias y atenuación asintótica.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-cyan-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Restablecer parámetros de Bode"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Order Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setParams(p => ({ ...p, systemType: '1st' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemType === '1st'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sistema 1er Orden: G(s) = K / (τs + 1)
            </button>
            <button
              onClick={() => setParams(p => ({ ...p, systemType: '2nd' }))}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                systemType === '2nd'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sistema 2º Orden Canónico
            </button>
          </div>

          {/* Plot Display Tabs */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActivePlot('both')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activePlot === 'both' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ambos Gráficos
            </button>
            <button
              onClick={() => setActivePlot('magnitude')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activePlot === 'magnitude' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sólo Magnitud (dB)
            </button>
            <button
              onClick={() => setActivePlot('phase')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activePlot === 'phase' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sólo Fase (°)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Parámetros del Sistema</span>
              <span className="text-xs font-mono text-cyan-400">
                {systemType === '1st' ? `ωc = ${omegaC.toFixed(2)} rad/s` : `ωn = ${wn.toFixed(2)} rad/s`}
              </span>
            </h3>

            {/* Gain K */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Ganancia Estática (K):</span>
                <span className="font-mono text-cyan-400 font-bold">{K.toFixed(2)} ({ (20*Math.log10(K)).toFixed(1) } dB)</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10.0"
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
                  min="0.05"
                  max="5.0"
                  step="0.05"
                  value={tau}
                  onChange={(e) => setParams(p => ({ ...p, tau: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Pulsación de corte asociada: ω_c = 1/τ = {omegaC.toFixed(2)} rad/s</span>
              </div>
            ) : (
              /* 2nd Order wn and zeta */
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Frecuencia Natural (ω_n):</span>
                    <span className="font-mono text-cyan-400 font-bold">{wn.toFixed(2)} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20.0"
                    step="0.5"
                    value={wn}
                    onChange={(e) => setParams(p => ({ ...p, wn: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Factor de Amortiguamiento (ζ):</span>
                    <span className="font-mono text-cyan-400 font-bold">{zeta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={zeta}
                    onChange={(e) => setParams(p => ({ ...p, zeta: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">
                    {zeta < 0.707 ? `Pico resonante en ωr = ${omegaR.toFixed(2)} rad/s` : 'Sin pico de resonancia (ζ ≥ 0.707)'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Probe Tool */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Sonda de Excitación Sinusoidal</span>
              </h3>
              <button
                onClick={() => setShowProbe(!showProbe)}
                className="text-xs text-slate-400 hover:text-white"
              >
                {showProbe ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showProbe && (
              <>
                <p className="text-xs text-slate-400">
                  Aplica una señal sinusoidal <MathView math="u(t) = \sin(\omega_0 t)" /> y comprueba visualmente cómo la amplitud y el desfase coinciden exactamente con el punto del diagrama de Bode.
                </p>

                {/* Probe frequency slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Pulsación de Prueba (ω₀):</span>
                    <span className="font-mono text-amber-400 font-bold">{probeFreq.toFixed(2)} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={probeFreq}
                    onChange={(e) => setParams(p => ({ ...p, probeFreq: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Probe metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Magnitud |G(jω₀)|</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">{probeResponse.mag} ({probeResponse.magDb} dB)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Desfase ∠G(jω₀)</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{probeResponse.phaseDeg}°</span>
                  </div>
                </div>

                {/* Mini sinusoidal time plot */}
                <div className="h-40 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLine data={probeWaveData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="t" stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v}s`} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                        }}
                      />
                      <Line type="monotone" dataKey="entrada" name="u(t) Entrada" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                      <Line type="monotone" dataKey="salida" name="y(t) Salida" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </RechartsLine>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Magnitude Plot */}
          {(activePlot === 'both' || activePlot === 'magnitude') && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">1. Diagrama de Magnitud [dB] vs Pulsación ω</h3>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  {systemType === '1st' ? `Corte (-3 dB): ωc = ${omegaC.toFixed(2)} rad/s` : `Resonancia: ωr = ${omegaR.toFixed(2)} rad/s`}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={bodeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis
                      dataKey="omega"
                      scale="log"
                      domain={['auto', 'auto']}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => `${v}`}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit=" dB"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} dB`, 'Magnitud']}
                      labelFormatter={(l) => `ω = ${l} rad/s`}
                    />
                    {systemType === '1st' && (
                      <ReferenceLine
                        x={omegaC}
                        stroke="#06b6d4"
                        strokeDasharray="4 4"
                        label={{ value: `ωc = ${omegaC.toFixed(2)}`, fill: '#06b6d4', fontSize: 10, position: 'top' }}
                      />
                    )}
                    <ReferenceLine
                      x={probeFreq}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      label={{ value: `ω₀ = ${probeFreq.toFixed(1)}`, fill: '#f59e0b', fontSize: 10, position: 'insideBottom' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="magDb"
                      name="Magnitud 20log|G(jω)|"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Phase Plot */}
          {(activePlot === 'both' || activePlot === 'phase') && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">2. Diagrama de Fase [°] vs Pulsación ω</h3>
                </div>
                <div className="text-xs font-mono text-amber-400">
                  {systemType === '1st' ? 'Fase en corte: -45° | Asíntota: -90°' : 'Asíntota en alta frecuencia: -180°'}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={bodeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis
                      dataKey="omega"
                      scale="log"
                      domain={['auto', 'auto']}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => `${v}`}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit="°"
                      domain={systemType === '1st' ? [-95, 5] : [-185, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val}°`, 'Fase']}
                      labelFormatter={(l) => `ω = ${l} rad/s`}
                    />
                    {systemType === '1st' && (
                      <ReferenceLine
                        y={-45}
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        label={{ value: '-45°', fill: '#94a3b8', fontSize: 10, position: 'left' }}
                      />
                    )}
                    <ReferenceLine
                      x={probeFreq}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      label={{ value: `ω₀ = ${probeFreq.toFixed(1)}`, fill: '#f59e0b', fontSize: 10, position: 'insideTop' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="phaseDeg"
                      name="Fase ∠G(jω)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Educational summary card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-white">Conclusiones Clave de Respuesta en Frecuencia:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                En bajas frecuencias (<MathView math="\omega \ll \omega_c" />), la magnitud se mantiene plana en <MathView math="20 \log_{10}(K)" /> dB y el desfase es prácticamente 0°.
              </li>
              <li>
                En la frecuencia de corte (<MathView math="\omega = \omega_c = 1/\tau" />), la potencia cae a la mitad (-3.01 dB) y el desfase es exactamente <MathView math="-45^\circ" />.
              </li>
              <li>
                Para altas frecuencias (<MathView math="\omega \gg \omega_c" />), la curva decae con una pendiente asintótica estricta de <strong className="text-cyan-300">-20 dB por década</strong> (-6 dB por octava).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
