import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronRight, HelpCircle, Layers, LineChart, Sparkles } from 'lucide-react';
import { MathView } from './MathView';

interface Topic {
  id: string;
  number: string;
  title: string;
  badge: string;
}

const topics: Topic[] = [
  { id: 'diff-to-laplace', number: '01', title: 'Ecuación Diferencial a Laplace', badge: 'Deducción 1er Orden' },
  { id: 'k-and-tau', number: '02', title: 'Parámetros Físicos: K y τ', badge: 'Fundamentos' },
  { id: 'partial-fractions', number: '03', title: 'Respuesta al Escalón (Fracciones Parciales)', badge: 'Solución Temporal' },
  { id: 'key-points', number: '04', title: 'Puntos Clave: τ (63.2%) y 4τ (98.2%)', badge: 'Análisis Temporal' },
  { id: 'ramp-fvt', number: '05', title: 'Error Permanente: Escalón y Rampa', badge: 'Teorema Valor Final' },
  { id: 'pole-zero-types', number: '06', title: 'Clasificación Polinomial y Polos/Ceros', badge: 'Arquitectura s' },
  { id: 'second-order', number: '07', title: 'Sistemas de 2º Orden (wn, ζ, Mp, tp, ts)', badge: 'Deducción 2º Orden' },
  { id: 'pid-theory', number: '08', title: 'Control PID en Lazo Cerrado', badge: 'Acciones P-I-D' },
  { id: 'bode-theory', number: '09', title: 'Respuesta en Frecuencia y Bode', badge: 'Dominio Frecuencial' },
];

export const TheoryModule: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string>('diff-to-laplace');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null });
  const [showQuizExplanation, setShowQuizExplanation] = useState<Record<number, boolean>>({});

  // Interactive mini-simulator for topic 4
  const [demoTau, setDemoTau] = useState<number>(2.0);
  const [demoK, setDemoK] = useState<number>(1.0);

  const handleQuizSelect = (qId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setShowQuizExplanation(prev => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Fundamentos Rigurosos de Control Automático</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Tutor de Teoría, Deducciones y Física de 1er Orden
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Comprende el paso a paso matemático desde las leyes físicas de conservación hasta la función de transferencia canónica, la respuesta temporal analítica y el comportamiento asintótico.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
              6 Temas Maestros
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
              Render LaTeX KaTeX
            </span>
          </div>
        </div>
      </div>

      {/* Main layout: Topic navigator + Content card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation pills / list */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Módulos Temáticos
          </div>
          <div className="space-y-1.5">
            {topics.map((t) => {
              const isActive = activeTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-sm text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {t.number}
                    </span>
                    <div>
                      <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.badge}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick formula reminder box */}
          <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Forma Estándar Canónica</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
              <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{K}{\tau s + 1}" block />
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-200">K:</strong> Ganancia estática adimensional o dimensional</div>
              <div><strong className="text-slate-200">τ:</strong> Constante de tiempo en segundos [s]</div>
              <div><strong className="text-slate-200">Polo:</strong> En el plano complejo en <MathView math="s = -1/\tau" /></div>
            </div>
          </div>
        </div>

        {/* Detailed Topic Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTopic === 'diff-to-laplace' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 01 / DEDUCCIÓN RIGUROSA</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  De la Ecuación Diferencial a la Función de Transferencia Canónica
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Los sistemas de primer orden modelan procesos con acumulación de un solo elemento de almacenamiento energético (masa térmica, capacitor eléctrico, inductancia o reservorio de fluido).
                </p>
              </div>

              {/* Step 1 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs flex items-center justify-center font-mono">1</span>
                  Ecuación diferencial general lineal e invariante en el tiempo (LTI):
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <MathView math="a \cdot \frac{dy(t)}{dt} + b \cdot y(t) = c \cdot r(t)" block />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Donde <MathView math="r(t)" /> es la señal de entrada o excitación, <MathView math="y(t)" /> es la señal de salida o respuesta del proceso, y los coeficientes reales <MathView math="a, b, c > 0" /> representan parámetros físicos (como resistencia, capacitancia, masa o coeficiente de convección térmica).
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs flex items-center justify-center font-mono">2</span>
                  Aplicación de la Transformada de Laplace con Condiciones Iniciales Nulas:
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-500">Recordando la propiedad de la derivada: <MathView math="\mathcal{L}\left\{\frac{dy}{dt}\right\} = s Y(s) - y(0^-)" /> con <MathView math="y(0^-) = 0" />:</div>
                  <MathView math="a \cdot \left[ s Y(s) \right] + b \cdot Y(s) = c \cdot R(s)" block />
                  <MathView math="(a \cdot s + b) \cdot Y(s) = c \cdot R(s)" block />
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs flex items-center justify-center font-mono">3</span>
                  Definición de Función de Transferencia y Normalización Canónica:
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-3">
                  <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{c}{a \cdot s + b}" block />
                  <p className="text-xs text-slate-400">
                    Para llevarlo a la <strong>Forma Canónica de Bode / Control</strong>, dividimos tanto el numerador como el denominador entre el término independiente <MathView math="b" /> (de modo que el término independiente del denominador sea exactamente 1):
                  </p>
                  <MathView math="G(s) = \frac{\frac{c}{b}}{\frac{a}{b}s + 1} = \frac{K}{\tau s + 1}" block />
                </div>
              </div>

              <div className="rounded-lg bg-cyan-950/30 border border-cyan-800/40 p-4 text-xs text-cyan-200 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Conclusión Fundamental:</strong> Cualquier ecuación diferencial lineal de 1er orden queda unívocamente caracterizada en el dominio transformado por dos únicos parámetros: la ganancia estática <MathView math="K = c/b" /> y la constante de tiempo <MathView math="\tau = a/b" />.
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'k-and-tau' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 02 / SIGNIFICADO FÍSICO</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Física e Interpretación de la Ganancia K y la Constante de Tiempo τ
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  En ingeniería de control, estos dos parámetros describen completamente la escala final y la velocidad de respuesta del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* K Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">Parámetro K</span>
                    <span className="text-xs text-slate-500">Amplitud en DC</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Ganancia Estática (DC Gain)</h4>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <MathView math="K = \frac{c}{b} = \lim_{s \to 0} G(s)" block />
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>Indica la <strong>relación de amplificación o atenuación</strong> entre la salida en régimen permanente y la entrada constante.</li>
                    <li>Si la entrada cambia en <MathView math="\Delta r" />, la salida en estado estable cambiará en <MathView math="\Delta y_{ss} = K \cdot \Delta r" />.</li>
                    <li>En sistemas mecánicos representa flexibilidad/rigidez; en térmicos, la resistencia térmica frente a la potencia disipada.</li>
                  </ul>
                </div>

                {/* Tau Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">Parámetro τ</span>
                    <span className="text-xs text-slate-500">Inercia Temporal [s]</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Constante de Tiempo (τ)</h4>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <MathView math="\tau = \frac{a}{b} = -\frac{1}{p}" block />
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>Mide la <strong>inercia o lentitud</strong> con que el sistema responde a estímulos.</li>
                    <li>A mayor <MathView math="\tau" />, más lento es el sistema para alcanzar su nuevo punto de operación.</li>
                    <li>Está inversamente relacionada con la distancia del polo al eje imaginario: <MathView math="p = -1/\tau" />. Cuanto más lejos a la izquierda esté el polo, menor es <MathView math="\tau" /> y más rápido es el sistema.</li>
                  </ul>
                </div>
              </div>

              {/* Physical analog table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Analogías Físicas de τ en la Ingeniería:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Dominio Físico</th>
                        <th className="py-2.5 px-3">Ecuación Físico-Diferencial</th>
                        <th className="py-2.5 px-3">Constante τ</th>
                        <th className="py-2.5 px-3">Ganancia K</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Circuito RC</td>
                        <td className="py-2.5 px-3 font-mono">R·C · v_c' + v_c = v_in</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">τ = R · C</td>
                        <td className="py-2.5 px-3 font-mono">K = 1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Circuito RL</td>
                        <td className="py-2.5 px-3 font-mono">(L/R) · i_L' + i_L = v_in / R</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">τ = L / R</td>
                        <td className="py-2.5 px-3 font-mono">K = 1 / R</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Sensor Térmico</td>
                        <td className="py-2.5 px-3 font-mono">M·c_p · T' + h·A·T = h·A·T_amb</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">τ = (M·c_p)/(h·A)</td>
                        <td className="py-2.5 px-3 font-mono">K = 1</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Tanque con Válvula</td>
                        <td className="py-2.5 px-3 font-mono">A_t · R_v · h' + h = R_v · q_in</td>
                        <td className="py-2.5 px-3 text-cyan-400 font-mono">τ = A_t · R_v</td>
                        <td className="py-2.5 px-3 font-mono">K = R_v</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'partial-fractions' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 03 / RESOLUCIÓN ANALÍTICA</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Deducción de la Respuesta al Escalón mediante Fracciones Parciales
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Demostración formal y matemática de cómo la entrada escalón genera la curva exponencial característica <MathView math="y(t) = A K (1 - e^{-t/\tau})" />.
                </p>
              </div>

              {/* Step A */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Paso 1: Planteamiento en el Dominio Transformado de Laplace</div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">Para una entrada escalón de magnitud <MathView math="A" />, <MathView math="r(t) = A \cdot u(t) \implies R(s) = \frac{A}{s}" />:</p>
                  <MathView math="Y(s) = G(s) \cdot R(s) = \frac{K}{\tau s + 1} \cdot \frac{A}{s} = \frac{A \cdot K}{s (\tau s + 1)}" block />
                  <p className="text-xs text-slate-400">Dividiendo el factor <MathView math="(\tau s + 1)" /> entre <MathView math="\tau" /> para aislar el polo en formato de raíz:</p>
                  <MathView math="Y(s) = \frac{A \cdot K / \tau}{s \left( s + \frac{1}{\tau} \right)}" block />
                </div>
              </div>

              {/* Step B */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Paso 2: Expansión en Fracciones Parciales Simples</div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-3">
                  <MathView math="\frac{A \cdot K / \tau}{s \left( s + \frac{1}{\tau} \right)} = \frac{C_1}{s} + \frac{C_2}{s + \frac{1}{\tau}}" block />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-cyan-300 font-semibold mb-1">Cálculo de Residuo C₁:</div>
                      <MathView math="C_1 = \left. s \cdot Y(s) \right|_{s = 0} = \frac{A K / \tau}{0 + \frac{1}{\tau}} = A \cdot K" block />
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-amber-300 font-semibold mb-1">Cálculo de Residuo C₂:</div>
                      <MathView math="C_2 = \left. \left(s + \frac{1}{\tau}\right) Y(s) \right|_{s = -1/\tau} = \frac{A K / \tau}{-1/\tau} = -A \cdot K" block />
                    </div>
                  </div>
                  <MathView math="Y(s) = \frac{A \cdot K}{s} - \frac{A \cdot K}{s + \frac{1}{\tau}} = A \cdot K \cdot \left[ \frac{1}{s} - \frac{1}{s + \frac{1}{\tau}} \right]" block />
                </div>
              </div>

              {/* Step C */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Paso 3: Antitransformada de Laplace Inversa</div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">
                    Aplicando la tabla de transformadas: <MathView math="\mathcal{L}^{-1}\left\{\frac{1}{s}\right\} = 1" /> y <MathView math="\mathcal{L}^{-1}\left\{\frac{1}{s+a}\right\} = e^{-a t}" />:
                  </div>
                  <MathView math="y(t) = \mathcal{L}^{-1}\{Y(s)\} = A \cdot K \cdot \left( 1 - e^{-\frac{t}{\tau}} \right) \cdot u(t)" block />
                </div>
              </div>

              <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-4 text-xs text-emerald-200">
                <strong>Resultado Demostrado:</strong> La respuesta temporal consta de una <em>componente forzada permanente</em> <MathView math="y_{p}(t) = A K" /> y una <em>componente natural transitoria</em> <MathView math="y_{h}(t) = -A K e^{-t/\tau}" /> que decae asintóticamente a cero conforme <MathView math="t \to \infty" />.
              </div>
            </div>
          )}

          {activeTopic === 'key-points' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 04 / PUNTOS CRÍTICOS TEMPORALES</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Puntos Clave: t = τ (63.2%), t = 4τ (98.2%) y la Tangente en el Origen
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Reglas matemáticas exactas utilizadas por ingenieros para identificar parámetros a partir de curvas experimentales de respuesta.
                </p>
              </div>

              {/* Table of Tau multiples */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Tiempo (t)</th>
                        <th className="py-2.5 px-3">Fórmula Exponencial</th>
                        <th className="py-2.5 px-3">% de Valor Final (AK)</th>
                        <th className="py-2.5 px-3">Significado en Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      <tr className="bg-cyan-950/20">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">t = 1τ</td>
                        <td className="py-2.5 px-3 font-mono">1 - e⁻¹ = 1 - 0.3679</td>
                        <td className="py-2.5 px-3 font-bold text-white">63.21 %</td>
                        <td className="py-2.5 px-3 text-slate-300">Punto de definición oficial de la constante τ</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-slate-300">t = 2τ</td>
                        <td className="py-2.5 px-3 font-mono">1 - e⁻² = 1 - 0.1353</td>
                        <td className="py-2.5 px-3 text-white">86.47 %</td>
                        <td className="py-2.5 px-3 text-slate-400">Transitorio avanzado</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-slate-300">t = 3τ</td>
                        <td className="py-2.5 px-3 font-mono">1 - e⁻³ = 1 - 0.0498</td>
                        <td className="py-2.5 px-3 text-white">95.02 %</td>
                        <td className="py-2.5 px-3 text-slate-400">Criterio industrial del 5%</td>
                      </tr>
                      <tr className="bg-amber-950/20">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">t = 4τ</td>
                        <td className="py-2.5 px-3 font-mono">1 - e⁻⁴ = 1 - 0.0183</td>
                        <td className="py-2.5 px-3 font-bold text-white">98.17 %</td>
                        <td className="py-2.5 px-3 text-slate-300"><strong>Tiempo de establecimiento (t_s)</strong> (Banda del 2%)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono text-slate-300">t = 5τ</td>
                        <td className="py-2.5 px-3 font-mono">1 - e⁻⁵ = 1 - 0.0067</td>
                        <td className="py-2.5 px-3 text-white">99.33 %</td>
                        <td className="py-2.5 px-3 text-slate-400">Criterio estricto del 1% (estado estable pleno)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tangent in origin property */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <LineChart className="w-4 h-4" />
                  <span>Propiedad Geométrica: La Tangente en el Origen</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Si derivamos la respuesta temporal con respecto al tiempo:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="\frac{dy(t)}{dt} = A K \cdot \left( \frac{1}{\tau} e^{-\frac{t}{\tau}} \right)" block />
                  <MathView math="\left. \frac{dy(t)}{dt} \right|_{t=0} = \frac{A K}{\tau}" block />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La pendiente inicial de la curva es exactamente <MathView math="m_0 = \frac{AK}{\tau}" />. Por lo tanto, si la respuesta mantuviera constante su velocidad inicial, alcanzaría el 100% del valor final (<MathView math="y = AK" />) en exactamente el instante <MathView math="t = \tau" />. Esta propiedad permite calcular <MathView math="\tau" /> gráficamente trazando una recta tangente en el origen.
                </p>
              </div>

              {/* Interactive Tau explorer */}
              <div className="rounded-xl border border-cyan-800/40 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300">Explorador Interactivo de Puntos</span>
                  <span className="text-xs text-slate-400 font-mono">τ = {demoTau.toFixed(1)} s | K = {demoK.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Constante τ: {demoTau.toFixed(1)} s</label>
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={demoTau}
                      onChange={(e) => setDemoTau(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Ganancia K: {demoK.toFixed(1)}</label>
                    <input
                      type="range"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={demoK}
                      onChange={(e) => setDemoK(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500">t = τ ({demoTau.toFixed(1)}s)</div>
                    <div className="text-sm font-bold text-cyan-400">{(demoK * 0.6321).toFixed(3)}</div>
                    <div className="text-[10px] text-slate-400">63.2% de {(demoK).toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500">t = 4τ ({(demoTau * 4).toFixed(1)}s)</div>
                    <div className="text-sm font-bold text-amber-400">{(demoK * 0.9817).toFixed(3)}</div>
                    <div className="text-[10px] text-slate-400">98.2% (t_s)</div>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Pendiente t=0</div>
                    <div className="text-sm font-bold text-white">{(demoK / demoTau).toFixed(3)}/s</div>
                    <div className="text-[10px] text-slate-400">AK / τ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'ramp-fvt' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 05 / ERROR EN RÉGIMEN PERMANENTE (e_ss)</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Teorema del Valor Final: Error ante Escalón y ante Rampa
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Análisis riguroso de precisión y seguimiento asintótico mediante el Teorema del Valor Final (TVF).
                </p>
              </div>

              {/* FVT Theorem statement */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="text-xs font-semibold text-amber-400">Enunciado del Teorema del Valor Final (TVF):</div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="e_{ss} = \lim_{t \to \infty} e(t) = \lim_{s \to 0} s \cdot E(s) = \lim_{s \to 0} s \cdot R(s) \cdot \left[ 1 - G(s) \right]" block />
                </div>
                <p className="text-xs text-slate-400">
                  Condición de validez: Todos los polos de <MathView math="s \cdot E(s)" /> deben encontrarse estrictamente en el semiplano izquierdo abierto (LHP).
                </p>
              </div>

              {/* Error ante Escalón */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">Caso 1: Entrada Escalón</span>
                  <span className="text-xs font-mono text-slate-400">r(t) = A · u(t) → R(s) = A/s</span>
                </div>
                <h4 className="text-sm font-bold text-white">Error en Régimen Permanente ante Escalón</h4>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <MathView math="E(s) = \frac{A}{s} \cdot \left[ 1 - \frac{K}{\tau s + 1} \right] = \frac{A}{s} \cdot \frac{\tau s + (1 - K)}{\tau s + 1}" block />
                  <MathView math="e_{ss,\text{escalón}} = \lim_{s \to 0} s \cdot E(s) = \lim_{s \to 0} \frac{s \cdot A}{s} \cdot \frac{\tau s + (1 - K)}{\tau s + 1} = A \cdot (1 - K)" block />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/60 text-emerald-300">
                    <strong>Si K = 1:</strong> <MathView math="e_{ss} = A \cdot (1 - 1) = 0" />. La salida alcanza exactamente el valor de referencia <MathView math="y_{ss} = A" />, sin ningún error estático.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-amber-900/60 text-amber-300">
                    <strong>Si K ≠ 1:</strong> <MathView math="e_{ss} = A \cdot (1 - K) \neq 0" />. Queda un offset o error permanente constante proporcional a la amplitud de la entrada.
                  </div>
                </div>
              </div>

              {/* Error ante Rampa */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Caso 2: Entrada Rampa</span>
                  <span className="text-xs font-mono text-slate-400">r(t) = A · t · u(t) → R(s) = A / s²</span>
                </div>
                <h4 className="text-sm font-bold text-white">Error en Régimen Permanente ante Rampa</h4>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-3">
                  <MathView math="E(s) = \frac{A}{s^2} \cdot \left[ 1 - \frac{K}{\tau s + 1} \right] = \frac{A}{s^2} \cdot \frac{(1 - K) + \tau s}{\tau s + 1} = \frac{A(1 - K)}{s^2(\tau s + 1)} + \frac{A \cdot \tau}{s(\tau s + 1)}" block />
                  <p className="text-xs text-slate-400">
                    Aplicando el Teorema del Valor Final al producto <MathView math="s \cdot E(s)" />:
                  </p>
                  <MathView math="s \cdot E(s) = \frac{A(1 - K)}{s(\tau s + 1)} + \frac{A \cdot \tau}{\tau s + 1}" block />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-900/60 space-y-1.5">
                    <span className="font-semibold text-cyan-300">Sub-caso A: Ganancia Unitaria (K = 1)</span>
                    <p className="text-slate-300">
                      El primer término se anula (<MathView math="1 - K = 0" />). El límite resulta:
                    </p>
                    <div className="p-2 bg-slate-950 rounded text-center">
                      <MathView math="e_{ss,\text{rampa}} = \lim_{s \to 0} \frac{A \cdot \tau}{\tau s + 1} = A \cdot \tau" block />
                    </div>
                    <p className="text-slate-400">
                      La salida sigue a la rampa con la misma pendiente, pero con un <strong>desfase temporal constante de exactamente <MathView math="\tau" /> segundos</strong> (error vertical igual a <MathView math="A \cdot \tau" />).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-rose-900/60 space-y-1.5">
                    <span className="font-semibold text-rose-300">Sub-caso B: Ganancia No Unitaria (K ≠ 1)</span>
                    <p className="text-slate-300">
                      El primer término tiene un polo en el origen (<MathView math="s = 0" /> en el denominador):
                    </p>
                    <div className="p-2 bg-slate-950 rounded text-center">
                      <MathView math="e_{ss,\text{rampa}} = \lim_{s \to 0} \frac{A(1 - K)}{s} = \pm \infty \quad (\text{DIVERGE})" block />
                    </div>
                    <p className="text-slate-400">
                      <strong>¡El error diverge al infinito!</strong> Dado que la salida tiene pendiente <MathView math="A \cdot K" /> y la entrada tiene pendiente <MathView math="A" />, ambas rectas se separan indefinidamente con el paso del tiempo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Physical conclusion */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Conclusión para Ingeniería de Control:</div>
                <p>
                  Un sistema de 1er orden canónico es de <strong>Tipo 0</strong> (cero integradores puros en lazo abierto). Para eliminar el error permanente ante rampa (<MathView math="e_{ss} \to 0" />) o forzar seguimiento exacto cuando <MathView math="K \neq 1" />, es indispensable incorporar un <strong>controlador con acción integral (PI o PID)</strong>, elevando el tipo del sistema a Tipo 1 o superior.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Ante un <strong>escalón</strong>: <MathView math="e_{ss} = A(1 - K)" /> (cero únicamente si <MathView math="K = 1" />).</li>
                  <li>Ante una <strong>rampa</strong>: <MathView math="e_{ss} = A \cdot \tau" /> si <MathView math="K = 1" /> (desfase temporal constante de <MathView math="\tau" /> s); si <MathView math="K \neq 1" />, el error <strong>diverge al infinito</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTopic === 'pole-zero-types' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 06 / ARQUITECTURA EN EL PLANO S</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Clasificación Polinomial y Realizabilidad Física de Polos y Ceros
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Comportamiento del grado del numerador (<MathView math="m" />) y denominador (<MathView math="n" />) en funciones racionales <MathView math="G(s) = N(s)/D(s)" />.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">m &lt; n</div>
                  <h4 className="text-sm font-bold text-white">Estrictamente Propia</h4>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center font-mono text-xs">
                    G(s) = K / (τs + 1)
                  </div>
                  <p className="text-xs text-slate-400">
                    El grado del denominador supera al del numerador. El sistema tiene atenuación a altas frecuencias (<MathView math="\lim_{s \to \infty} G(s) = 0" />). Es causal, realizable físicamente y modela casi todos los procesos físicos reales con inercia.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold uppercase">m = n</div>
                  <h4 className="text-sm font-bold text-white">Propia (Biprobable)</h4>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center font-mono text-xs">
                    G(s) = (T·s + 1) / (τs + 1)
                  </div>
                  <p className="text-xs text-slate-400">
                    Grados iguales. Presenta un salto instantáneo (feedthrough directo <MathView math="D \neq 0" />). Posee ganancia finita a alta frecuencia. Ejemplos: compensadores de adelanto/atraso, circuitos RL con salida en el inductor <MathView math="V_L/V" />.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="text-xs font-mono text-rose-400 font-semibold uppercase">m &gt; n</div>
                  <h4 className="text-sm font-bold text-white">Impropia</h4>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center font-mono text-xs">
                    G(s) = s / 1 (Derivador puro)
                  </div>
                  <p className="text-xs text-slate-400">
                    El numerador tiene mayor grado. Requeriría ganancia infinita a frecuencia infinita (<MathView math="\lim_{s \to \infty} |G(j\omega)| = \infty" />). Es <strong>físicamente irrealizable</strong> en sistemas pasivos o analógicos sin polos parásitos.
                  </p>
                </div>
              </div>

              {/* Physical interpretation of Poles and Zeros */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <span>Física Fundamental de Polos y Ceros en 1er Orden</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Polos (Raíces de D(s) = 0)</span>
                      <span className="font-mono text-cyan-400">s = -1/τ</span>
                    </div>
                    <p className="text-slate-400">
                      Definen los <strong>modos naturales libres</strong> del sistema (<MathView math="e^{pt}" />).
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>Si el polo es real y negativo (<MathView math="p < 0" />): el sistema es <strong>asintóticamente estable</strong> y decae suavemente sin oscilación.</li>
                      <li>Distancia al eje imaginario: <MathView math="|p| = 1/\tau" /> define el ancho de banda y la velocidad de disipación energética.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Ceros (Raíces de N(s) = 0)</span>
                      <span className="font-mono text-amber-400">s = z</span>
                    </div>
                    <p className="text-slate-400">
                      Modifican las <strong>condiciones iniciales relativas y derivadas</strong> de la señal de entrada.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>Un cero en el origen (<MathView math="s=0" />): bloquea componentes DC y actúa como diferenciador (filtro pasa-altos).</li>
                      <li>Un cero no altera los valores de los polos ni la estabilidad intrínseca, pero pondera los residuos de cada modo.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'second-order' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 07 / DINÁMICA DE SEGUNDO ORDEN</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Sistemas de 2º Orden Canónicos: Parámetros y Transitorio
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Modelado de sistemas con dos elementos de almacenamiento de energía (RLC, masa-resorte-amortiguador, péndulos).
                </p>
              </div>

              {/* Canonical form */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Forma Canónica Estándar de 2º Orden:</h4>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                  <MathView math="G(s) = \frac{\omega_n^2}{s^2 + 2\zeta \omega_n s + \omega_n^2}" block />
                  <div className="text-xs text-slate-400">
                    Donde <MathView math="\omega_n" /> es la frecuencia natural no amortiguada [rad/s] y <MathView math="\zeta" /> (zeta) es el factor de amortiguamiento adimensional.
                  </div>
                </div>
              </div>

              {/* Poles and classification */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">Ecuación Característica y Polos en el Plano s</h4>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="s^2 + 2\zeta \omega_n s + \omega_n^2 = 0 \implies s_{1,2} = -\zeta \omega_n \pm \omega_n \sqrt{\zeta^2 - 1}" block />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-900/50">
                    <span className="text-cyan-300 font-bold">0 &lt; ζ &lt; 1: Subamortiguado</span>
                    <p className="text-slate-400 mt-1">Polos complejos conjugados <MathView math="s = -\sigma \pm j\omega_d" />. Respuesta oscilatoria con sobrepico.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50">
                    <span className="text-emerald-300 font-bold">ζ = 1: Crítico</span>
                    <p className="text-slate-400 mt-1">Dos polos reales iguales en <MathView math="s = -\omega_n" />. Transición más rápida sin oscilación.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-amber-900/50">
                    <span className="text-amber-300 font-bold">ζ &gt; 1: Sobreamortiguado</span>
                    <p className="text-slate-400 mt-1">Dos polos reales distintos y negativos. Respuesta lenta y suave sin sobrepaso.</p>
                  </div>
                </div>
              </div>

              {/* Transient specs formulas */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">Métricas Analíticas del Régimen Transitorio (Subamortiguado)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-white">Frecuencia Amortiguada (ω_d):</div>
                    <MathView math="\omega_d = \omega_n \sqrt{1 - \zeta^2}" block />
                    <span className="text-[11px] text-slate-400">Frecuencia real de las oscilaciones sinusoidales.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-white">Sobrepico Máximo (M_p):</div>
                    <MathView math="M_p = e^{-\frac{\zeta \pi}{\sqrt{1 - \zeta^2}}} \times 100\%" block />
                    <span className="text-[11px] text-slate-400">Porcentaje de pico respecto al valor de estado estable.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-white">Tiempo de Pico (t_p):</div>
                    <MathView math="t_p = \frac{\pi}{\omega_d} = \frac{\pi}{\omega_n \sqrt{1 - \zeta^2}}" block />
                    <span className="text-[11px] text-slate-400">Instante donde la respuesta alcanza su primer máximo.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-white">Tiempo de Asentamiento (t_s 2%):</div>
                    <MathView math="t_s \approx \frac{4}{\zeta \omega_n} = \frac{4}{\sigma}" block />
                    <span className="text-[11px] text-slate-400">Tiempo en entrar y quedarse en la banda del ±2%.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'pid-theory' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 08 / CONTROL CLÁSICO PID</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Control Proporcional-Integral-Derivativo (PID) en Lazo Cerrado
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Estructura universal del algoritmo PID para control de plantas industriales de 1er y 2º orden.
                </p>
              </div>

              {/* Equation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <div className="text-xs text-slate-400">Ecuación temporal y función de transferencia del controlador:</div>
                <MathView math="u(t) = K_p \, e(t) + K_i \int_0^t e(\tau)\,d\tau + K_d \, \frac{de(t)}{dt}" block />
                <MathView math="C(s) = K_p + \frac{K_i}{s} + K_d \, s = \frac{K_d s^2 + K_p s + K_i}{s}" block />
              </div>

              {/* 3 Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase">Acción Proporcional (Kp)</div>
                  <h4 className="text-sm font-semibold text-white">Velocidad y Fuerza</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reacciona proporcionalmente al error actual. Aumentar <MathView math="K_p" /> reduce el tiempo de subida, pero ganancias muy elevadas provocan sobrepicos y oscilaciones.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Acción Integral (Ki)</div>
                  <h4 className="text-sm font-semibold text-white">Eliminación de Error Offset</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Acumula el error histórico en el tiempo. Añade un polo en el origen (<MathView math="s=0" />) que eleva el tipo del sistema a Tipo 1, garantizando <MathView math="e_{ss} = 0" /> ante escalón.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">Acción Derivativa (Kd)</div>
                  <h4 className="text-sm font-semibold text-white">Amortiguamiento Predictivo</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Anticipa el comportamiento calculando la pendiente de variación del error. Frena el sistema cerca del setpoint, disminuyendo el sobrepico <MathView math="M_p" /> y estabilizando el lazo.
                  </p>
                </div>
              </div>

              {/* Closed loop transfer function */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Función de Transferencia en Lazo Cerrado T(s):</div>
                <MathView math="T(s) = \frac{Y(s)}{R(s)} = \frac{C(s) \cdot G(s)}{1 + C(s) \cdot G(s)}" block />
                <p className="text-slate-400">
                  Para una planta de 1er orden <MathView math="G(s) = \frac{K}{\tau s + 1}" />, el controlador PI o PID ubica los nuevos polos en posiciones deseadas del semiplano izquierdo para cumplir requerimientos estrictos de tiempo de asentamiento y sobrepico.
                </p>
              </div>
            </div>
          )}

          {activeTopic === 'bode-theory' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">TEMA 09 / ANÁLISIS EN FRECUENCIA</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Respuesta en Frecuencia y Diagrama de Bode
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Comportamiento en régimen permanente ante entradas sinusoidales <MathView math="r(t) = A \sin(\omega t)" /> al sustituir <MathView math="s \leftarrow j\omega" />.
                </p>
              </div>

              {/* Bode Definition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">1. Diagrama de Magnitud</div>
                  <MathView math="|G(j\omega)|_{\text{dB}} = 20 \log_{10} |G(j\omega)|" block />
                  <p className="text-xs text-slate-400">
                    Escala logarítmica de decibelios (dB). Permite sumar gráficamente las curvas de polos y ceros individuales.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold uppercase">2. Diagrama de Fase</div>
                  <MathView math="\phi(\omega) = \angle G(j\omega) = \arctan\left(\frac{\text{Im}[G(j\omega)]}{\text{Re}[G(j\omega)]}\right)" block />
                  <p className="text-xs text-slate-400">
                    Desfase angular en grados [°] entre la salida y la entrada como función de la pulsación <MathView math="\omega" /> [rad/s].
                  </p>
                </div>
              </div>

              {/* 1st order Bode characteristics */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Propiedades Notables para G(s) = K / (τs + 1)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-semibold text-white mb-1">Baja Frecuencia (ω &lt;&lt; 1/τ):</div>
                    <div className="font-mono text-cyan-400">|G| ≈ 20 log10(K) dB</div>
                    <div className="font-mono text-slate-400 mt-1">Fase ≈ 0°</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-indigo-900/60">
                    <div className="font-semibold text-white mb-1">Frecuencia de Corte (ω_c = 1/τ):</div>
                    <div className="font-mono text-indigo-300">Caída de -3.01 dB</div>
                    <div className="font-mono text-indigo-300 mt-1">Fase exactamente -45°</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-semibold text-white mb-1">Alta Frecuencia (ω &gt;&gt; 1/τ):</div>
                    <div className="font-mono text-amber-400">Pendiente: -20 dB/década</div>
                    <div className="font-mono text-slate-400 mt-1">Fase asintótica: -90°</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conceptual Self-Check Quiz */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Autoevaluación Rápida de Conceptos Clave</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Comprueba tu Comprensión Teórica
            </h3>

            {/* Question 1 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-medium text-slate-200">
                1. Si un sistema de 1er orden con <MathView math="G(s) = \frac{4}{2s + 1}" /> recibe un escalón de amplitud <MathView math="A = 3" />, ¿cuál es el valor de la salida en <MathView math="t = 2\text{ s}" />?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { text: '7.58 (63.2% de 12)', correct: true, exp: '¡Correcto! Aquí tau = 2s y K = 4. El valor final es A*K = 3*4 = 12. En t = tau = 2s, la respuesta alcanza el 63.2% del valor final: 12 * 0.6321 = 7.58.' },
                  { text: '12.00 (100% de 12)', correct: false, exp: 'Incorrecto. En t = tau apenas se alcanza el 63.21%. El 100% se alcanza asintóticamente en t -> infinito.' },
                  { text: '4.00 (Ganancia K)', correct: false, exp: 'Incorrecto. 4 es la ganancia estática K, pero la entrada tiene amplitud A=3, por lo que el estado estable es 12.' },
                ].map((opt, i) => {
                  const isSelected = quizAnswers[1] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizSelect(1, i)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        isSelected
                          ? opt.correct
                            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-600 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {showQuizExplanation[1] && (
                <div className={`p-3 rounded-lg text-xs ${quizAnswers[1] === 0 ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'}`}>
                  {quizAnswers[1] === 0 ? '✓ ¡Excelente! Tau = a/b = 2/1 = 2s. En t = tau, la respuesta es 63.2% de 12 = 7.58.' : '✗ Revisa: en t = tau = 2s, la respuesta es A·K·(1 - e⁻¹) = 3·4·0.6321 = 7.585.'}
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-medium text-slate-200">
                2. Si aumentamos la constante de tiempo <MathView math="\tau" /> al doble en un sistema de 1er orden, ¿qué ocurre con el tiempo de establecimiento <MathView math="t_s" />?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { text: 'Se reduce a la mitad', correct: false },
                  { text: 'Se duplica (ts = 4*tau)', correct: true },
                  { text: 'Permanece igual', correct: false },
                ].map((opt, i) => {
                  const isSelected = quizAnswers[2] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizSelect(2, i)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        isSelected
                          ? opt.correct
                            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-600 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {showQuizExplanation[2] && (
                <div className={`p-3 rounded-lg text-xs ${quizAnswers[2] === 1 ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'}`}>
                  {quizAnswers[2] === 1 ? '✓ ¡Exacto! Dado que ts = 4·tau, el tiempo de establecimiento es estrictamente proporcional a la constante de tiempo tau.' : '✗ Recuerda: ts = 4·tau. Si tau se duplica, ts también se duplica, haciendo el sistema dos veces más lento.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
