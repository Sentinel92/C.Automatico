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
import { Activity, Sliders, TrendingUp, Clock, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MathView } from './MathView';

export const SystemsAnalysisModule: React.FC = () => {
  const [orderMode, setOrderMode] = useState<'1st' | '2nd'>('2nd');

  // 1st order params
  const [K1, setK1] = useState<number>(2.0);
  const [tau1, setTau1] = useState<number>(1.5);

  // 2nd order params
  const [wn2, setWn2] = useState<number>(4.0);
  const [zeta2, setZeta2] = useState<number>(0.35); // Can be negative for unstable
  const [K2, setK2] = useState<number>(1.0);

  // 2nd order regime classification
  const regime = useMemo(() => {
    if (zeta2 < 0) return { name: 'Inestable (Exponencial Creciente)', color: 'text-rose-400', badge: 'bg-rose-950 border-rose-800' };
    if (Math.abs(zeta2) < 0.01) return { name: 'Oscilador Puro No Amortiguado (ζ=0)', color: 'text-amber-400', badge: 'bg-amber-950 border-amber-800' };
    if (zeta2 < 1) return { name: 'Subamortiguado (Oscilatorio Estable)', color: 'text-cyan-400', badge: 'bg-cyan-950 border-cyan-800' };
    if (Math.abs(zeta2 - 1) < 0.05) return { name: 'Críticamente Amortiguado (ζ=1)', color: 'text-emerald-400', badge: 'bg-emerald-950 border-emerald-800' };
    return { name: 'Sobreamortiguado (Sin oscilación, ζ>1)', color: 'text-indigo-400', badge: 'bg-indigo-950 border-indigo-800' };
  }, [zeta2]);

  // Derived metrics
  const is1st = orderMode === '1st';
  const sigma = zeta2 * wn2;
  const wd = zeta2 < 1 && zeta2 >= 0 ? wn2 * Math.sqrt(1 - zeta2 * zeta2) : 0;
  const Mp = zeta2 >= 0 && zeta2 < 1 ? Math.exp((-Math.PI * zeta2) / Math.sqrt(1 - zeta2 * zeta2)) * 100 : 0;
  const tp = zeta2 >= 0 && zeta2 < 1 && wd > 0 ? Math.PI / wd : 0;
  const ts2 = zeta2 > 0 ? 4 / (zeta2 * wn2) : 10;
  const peakY = K2 * (1 + Mp / 100);

  // Simulation data
  const chartData = useMemo(() => {
    const tMax = is1st ? tau1 * 6 : Math.max(ts2 * 1.5, 6);
    const steps = 150;
    const dt = tMax / steps;
    const data = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;

      if (is1st) {
        y = K1 * (1 - Math.exp(-t / Math.max(tau1, 0.01)));
      } else {
        if (zeta2 < 0) {
          // Unstable divergence
          y = K2 * (1 - Math.exp(-sigma * t) * Math.cos(wn2 * t));
        } else if (zeta2 < 1) {
          const expD = Math.exp(-sigma * t);
          y = K2 * (1 - expD * (Math.cos(wd * t) + (zeta2 / Math.sqrt(1 - zeta2 * zeta2)) * Math.sin(wd * t)));
        } else if (Math.abs(zeta2 - 1) < 0.05) {
          y = K2 * (1 - (1 + wn2 * t) * Math.exp(-wn2 * t));
        } else {
          // Overdamped
          const s1 = -sigma + wn2 * Math.sqrt(zeta2 * zeta2 - 1);
          const s2 = -sigma - wn2 * Math.sqrt(zeta2 * zeta2 - 1);
          y = K2 * (1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1));
        }
      }

      data.push({
        t: parseFloat(t.toFixed(3)),
        y: parseFloat(Math.min(Math.max(y, -20), 20).toFixed(3)),
        ref: is1st ? K1 : K2,
      });
    }

    return data;
  }, [is1st, K1, tau1, K2, wn2, zeta2, sigma, wd, ts2]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
          <Activity className="w-4 h-4" />
          <span>Dinámica Temporal Comparada</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
          Módulo 4: Análisis de Sistemas de 1er y 2º Orden
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Visualiza los 4 regímenes canónicos según el factor de amortiguamiento <MathView math="\zeta" />, el significado físico del 63.2% en <MathView math="t = \tau" /> y por qué el tiempo de establecimiento al 2% equivale a <MathView math="4\tau" />.
        </p>

        {/* Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setOrderMode('1st')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              is1st ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Sistemas de 1er Orden
          </button>
          <button
            onClick={() => setOrderMode('2nd')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              !is1st ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Sistemas de 2º Orden (4 Regímenes)
          </button>
        </div>
      </div>

      {/* Grid: Controls + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Ajuste de Parámetros</span>
              {!is1st && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${regime.badge} ${regime.color}`}>
                  {regime.name}
                </span>
              )}
            </h3>

            {is1st ? (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Ganancia K:</span>
                    <span className="font-mono text-cyan-400 font-bold">{K1.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={K1}
                    onChange={(e) => setK1(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Constante de Tiempo (τ):</span>
                    <span className="font-mono text-cyan-400 font-bold">{tau1.toFixed(2)} s</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={tau1}
                    onChange={(e) => setTau1(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                  <div>• y(τ) = 0.632 · K = {(0.632 * K1).toFixed(2)} (63.2%)</div>
                  <div>• ts = 4·τ = {(4 * tau1).toFixed(2)} s (98.2%)</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Factor de Amortiguamiento (ζ):</span>
                    <span className="font-mono text-indigo-400 font-bold">{zeta2.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.4"
                    max="2.0"
                    step="0.05"
                    value={zeta2}
                    onChange={(e) => setZeta2(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">
                    Prueba ζ &lt; 0 para ver inestabilidad, 0 &lt; ζ &lt; 1 para subamortiguado, ζ = 1 para crítico.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Frecuencia Natural (wn):</span>
                    <span className="font-mono text-cyan-400 font-bold">{wn2.toFixed(2)} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={wn2}
                    onChange={(e) => setWn2(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Respuesta Temporal al Escalón Unitario</h3>
            <span className="text-xs text-slate-400 font-mono">
              {!is1st && zeta2 >= 0 && zeta2 < 1 ? `Mp = ${Mp.toFixed(1)}% | tp = ${tp.toFixed(2)}s` : ''}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLine data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="t" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                <ReferenceLine y={is1st ? K1 : K2} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Valor Final', fill: '#94a3b8', fontSize: 10, position: 'right' }} />

                {is1st && (
                  <>
                    <ReferenceLine x={tau1} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: `τ = ${tau1.toFixed(1)}s`, fill: '#06b6d4', fontSize: 10, position: 'top' }} />
                    <ReferenceLine x={4 * tau1} stroke="#818cf8" strokeDasharray="3 3" label={{ value: `4τ = ${(4 * tau1).toFixed(1)}s`, fill: '#818cf8', fontSize: 10, position: 'top' }} />
                  </>
                )}

                {!is1st && zeta2 >= 0 && zeta2 < 1 && (
                  <ReferenceDot x={tp} y={peakY} r={5} fill="#f59e0b" stroke="#fff" label={{ value: `Mp=${Mp.toFixed(1)}%`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                )}

                <Line type="monotone" dataKey="y" name="Salida y(t)" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </RechartsLine>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
