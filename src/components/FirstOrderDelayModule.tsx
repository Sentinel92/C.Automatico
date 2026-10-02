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
  Clock,
  Sliders,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FirstOrderDelayParams {
  K: number;
  tau: number;
  theta: number; // Dead time
  A: number;     // Step amplitude
}

const defaultParams: FirstOrderDelayParams = {
  K: 2.5,
  tau: 1.8,
  theta: 0.8,
  A: 1.0,
};

export const FirstOrderDelayModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<FirstOrderDelayParams>(
    'autocontrol_first_order_delay_params',
    defaultParams
  );

  const [activeTab, setActiveTab] = useState<'grafico' | 'metodos' | 'tabla'>('grafico');

  const { K, tau, theta, A } = params;

  // Key metrics
  const yFinal = K * A;
  const t63 = theta + tau;
  const t86 = theta + 2 * tau;
  const t95 = theta + 3 * tau; // ts 5%
  const t98 = theta + 4 * tau; // ts 2%
  const t99 = theta + 5 * tau;

  // Chart data generation
  const chartData = useMemo(() => {
    const tMax = Math.max(theta + 5.5 * tau, 6);
    const steps = 180;
    const dt = tMax / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let y = 0;
      if (t >= theta) {
        y = yFinal * (1 - Math.exp(-(t - theta) / Math.max(tau, 0.001)));
      }
      points.push({
        t: Number(t.toFixed(3)),
        y: Number(y.toFixed(3)),
        input: t >= 0 ? A : 0,
      });
    }
    return points;
  }, [K, tau, theta, A, yFinal]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Clock className="w-4 h-4" />
              <span>Edición Cuaderno Universitario · Modelo FOPTD</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 1: Sistemas de 1er Orden y Retardo Puro (Tiempo Muerto)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Deducción rigurosa del modelo First Order Plus Time Delay (FOPTD):{' '}
              <MathView math="G(s) = \frac{K}{\tau s + 1} e^{-\theta s}" />, tabla porcentual exacta y métodos gráficos de identificación de parámetros en exámenes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetParams}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Valores Típicos</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('grafico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'grafico'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Curva Temporal & Marcadores
          </button>
          <button
            onClick={() => setActiveTab('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tabla'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Tabla Porcentual de Examen (1τ a 5τ)
          </button>
          <button
            onClick={() => setActiveTab('metodos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'metodos'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Métodos Gráficos de Identificación
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Parámetros FOPTD</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              G(s)
            </span>
          </div>

          {/* Slider K */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Ganancia Estática (K):</span>
              <span className="font-mono text-cyan-400 font-bold">{K.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="6.0"
              step="0.1"
              value={K}
              onChange={(e) => setParams((p) => ({ ...p, K: parseFloat(e.target.value) }))}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg"
            />
            <div className="text-[10px] text-slate-400">
              Valor final estacionario: <MathView math={`y(\\infty) = K \\cdot A = ${(K * A).toFixed(2)}`} />
            </div>
          </div>

          {/* Slider Tau */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Constante de Tiempo (τ):</span>
              <span className="font-mono text-emerald-400 font-bold">{tau.toFixed(2)} s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={tau}
              onChange={(e) => setParams((p) => ({ ...p, tau: parseFloat(e.target.value) }))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg"
            />
            <div className="text-[10px] text-slate-400">
              Celeridad intrínseca del proceso físico.
            </div>
          </div>

          {/* Slider Theta */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Retardo / Tiempo Muerto (θ):</span>
              <span className="font-mono text-amber-400 font-bold">{theta.toFixed(2)} s</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={theta}
              onChange={(e) => setParams((p) => ({ ...p, theta: parseFloat(e.target.value) }))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg"
            />
            <div className="text-[10px] text-slate-400">
              Lapso en que la salida permanece en reposo total: <MathView math="y(t) = 0 \quad (t < \theta)" />
            </div>
          </div>

          {/* Slider Step Amplitude A */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Amplitud del Escalón (A):</span>
              <span className="font-mono text-indigo-400 font-bold">{A.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={A}
              onChange={(e) => setParams((p) => ({ ...p, A: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg"
            />
          </div>

          {/* Formula Display Box */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Función de Transferencia Actual:
            </div>
            <div className="text-cyan-300 py-1">
              <MathView
                math={`G(s) = \\frac{${K.toFixed(2)}}{${tau.toFixed(2)}s + 1} e^{-${theta.toFixed(2)}s}`}
                block
              />
            </div>
          </div>
        </div>

        {/* Display / Plots Column */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'grafico' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Respuesta Temporal al Escalón con Retardo</span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-amber-400">θ = {theta.toFixed(2)} s</span>
                  <span>·</span>
                  <span className="text-emerald-400">τ = {tau.toFixed(2)} s</span>
                  <span>·</span>
                  <span className="text-cyan-400">y(∞) = {yFinal.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine
                    data={chartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="t"
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'Tiempo t (s)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any) => [Number(val).toFixed(3), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />

                    {/* Step input reference */}
                    <Line
                      type="stepAfter"
                      dataKey="input"
                      name="Entrada r(t)"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />

                    {/* Output curve */}
                    <Line
                      type="monotone"
                      dataKey="y"
                      name="Salida y(t)"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={false}
                    />

                    {/* Markers */}
                    {theta > 0 && (
                      <ReferenceLine
                        x={theta}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{ value: `θ = ${theta.toFixed(2)}s`, position: 'top', fill: '#f59e0b', fontSize: 10 }}
                      />
                    )}
                    <ReferenceLine
                      x={t63}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{ value: '63.2% (θ+τ)', position: 'top', fill: '#10b981', fontSize: 10 }}
                    />
                    <ReferenceLine
                      x={t98}
                      stroke="#38bdf8"
                      strokeDasharray="3 3"
                      label={{ value: 'ts(2%) (θ+4τ)', position: 'top', fill: '#38bdf8', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={yFinal}
                      stroke="#94a3b8"
                      strokeDasharray="2 2"
                      label={{ value: `y(∞) = ${yFinal.toFixed(2)}`, position: 'right', fill: '#94a3b8', fontSize: 10 }}
                    />

                    {/* Reference dots */}
                    <ReferenceDot x={t63} y={yFinal * 0.632} r={4} fill="#10b981" stroke="#fff" />
                    <ReferenceDot x={t98} y={yFinal * 0.98} r={4} fill="#38bdf8" stroke="#fff" />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>

              {/* Instant KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-center">
                  <div className="text-[10px] text-slate-400">Inicio de Respuesta</div>
                  <div className="text-xs font-bold text-amber-400 font-mono">t = {theta.toFixed(2)} s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-center">
                  <div className="text-[10px] text-slate-400">Alcanza 63.2%</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">t = {t63.toFixed(2)} s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-center">
                  <div className="text-[10px] text-slate-400">ts 5% (95.0%)</div>
                  <div className="text-xs font-bold text-indigo-400 font-mono">t = {t95.toFixed(2)} s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-center">
                  <div className="text-[10px] text-slate-400">ts 2% (98.0%)</div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">t = {t98.toFixed(2)} s</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tabla' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Tabla Porcentual Exacta de Examen Universitario</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evolución temporal evaluada en múltiplos enteros de la constante de tiempo: <MathView math="y(t) = y(\infty) \cdot [1 - e^{-(t - \theta)/\tau}]" />.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Multiplo de τ</th>
                      <th className="p-3">Tiempo Total (t)</th>
                      <th className="p-3">% del Valor Final</th>
                      <th className="p-3">Valor Numérico y(t)</th>
                      <th className="p-3">Criterio Académico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-300">0 · τ (t = θ)</td>
                      <td className="p-3 text-amber-400">{theta.toFixed(2)} s</td>
                      <td className="p-3 text-slate-400">0.0 %</td>
                      <td className="p-3 text-slate-400">0.000 V</td>
                      <td className="p-3 text-slate-500 font-sans">Fin del tiempo muerto (retardo)</td>
                    </tr>
                    <tr className="bg-emerald-950/20 hover:bg-emerald-950/30 transition-colors">
                      <td className="p-3 font-bold text-emerald-400">1 · τ</td>
                      <td className="p-3 text-emerald-300">{t63.toFixed(2)} s</td>
                      <td className="p-3 font-bold text-emerald-400">63.2 %</td>
                      <td className="p-3 text-emerald-300">{(yFinal * 0.632).toFixed(3)}</td>
                      <td className="p-3 text-emerald-400 font-sans font-semibold">
                        Constante de tiempo τ (Punto de inflexión Heaviside)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-300">2 · τ</td>
                      <td className="p-3 text-slate-300">{t86.toFixed(2)} s</td>
                      <td className="p-3 text-cyan-300">86.5 %</td>
                      <td className="p-3 text-slate-300">{(yFinal * 0.865).toFixed(3)}</td>
                      <td className="p-3 text-slate-400 font-sans">Segundo punto del método de Smith</td>
                    </tr>
                    <tr className="bg-indigo-950/20 hover:bg-indigo-950/30 transition-colors">
                      <td className="p-3 font-bold text-indigo-400">3 · τ</td>
                      <td className="p-3 text-indigo-300">{t95.toFixed(2)} s</td>
                      <td className="p-3 font-bold text-indigo-400">95.0 %</td>
                      <td className="p-3 text-indigo-300">{(yFinal * 0.950).toFixed(3)}</td>
                      <td className="p-3 text-indigo-400 font-sans font-semibold">
                        Criterio ts al 5% (Banda de tolerancia ±5%)
                      </td>
                    </tr>
                    <tr className="bg-cyan-950/20 hover:bg-cyan-950/30 transition-colors">
                      <td className="p-3 font-bold text-cyan-400">4 · τ</td>
                      <td className="p-3 text-cyan-300">{t98.toFixed(2)} s</td>
                      <td className="p-3 font-bold text-cyan-400">98.0 %</td>
                      <td className="p-3 text-cyan-300">{(yFinal * 0.982).toFixed(3)}</td>
                      <td className="p-3 text-cyan-400 font-sans font-semibold">
                        Criterio estándar ts al 2% (Banda de tolerancia ±2%)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-300">5 · τ</td>
                      <td className="p-3 text-slate-300">{t99.toFixed(2)} s</td>
                      <td className="p-3 text-slate-200">99.3 %</td>
                      <td className="p-3 text-slate-200">{(yFinal * 0.993).toFixed(3)}</td>
                      <td className="p-3 text-slate-400 font-sans">Régimen permanente prácticamente alcanzado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'metodos' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Métodos de Identificación en Exámenes Universitarios</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Procedimientos gráficos analíticos para determinar K, τ y θ a partir de la curva del osciloscopio:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Metodo 1: 63.2% */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Método Clásico del 63.2%</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    1. Mida el valor final <MathView math="y(\infty)" /> y la entrada <MathView math="A" /> para hallar la ganancia:
                  </p>
                  <div className="py-1 text-cyan-300">
                    <MathView math="K = \frac{y(\infty)}{A}" block />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    2. Localice en el eje vertical el valor correspondiente al 63.2% del salto:
                  </p>
                  <div className="py-1 text-emerald-300">
                    <MathView math="y(t_{63}) = 0.632 \cdot y(\infty)" block />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    3. Proyecte al eje de tiempo para leer <MathView math="t_{63}" />. La constante de tiempo es:
                  </p>
                  <div className="py-1 text-cyan-300">
                    <MathView math="\tau = t_{63} - \theta" block />
                  </div>
                </div>

                {/* Metodo 2: Tangente Ziegler-Nichols */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                  <div className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Método de la Recta Tangente</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    1. Trace la recta tangente a la curva en su punto de máxima pendiente (punto de inflexión inicial).
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    2. La intersección de la tangente con el eje horizontal <MathView math="y = 0" /> determina el retardo <MathView math="\theta" />.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    3. La intersección de la misma tangente con la asíntota superior <MathView math="y = y(\infty)" /> ocurre en el instante <MathView math="t = \theta + \tau" />.
                  </p>
                  <div className="py-1 text-indigo-300">
                    <MathView math="\tau = t_{\text{intersección}} - \theta" block />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
