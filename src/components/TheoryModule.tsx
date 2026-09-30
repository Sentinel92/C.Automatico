import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Compass,
  Building2,
  Binary,
  GraduationCap,
  Activity,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { MathView } from './MathView';

interface MasterclassTopic {
  id: string;
  number: string;
  title: string;
  badge: string;
  whatIs: string;
  industryUse: string;
  algebraicMath: string;
}

export const TheoryModule: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>('laplace-intro');
  const [activeAxis, setActiveAxis] = useState<'what' | 'industry' | 'algebra'>('what');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null });
  const [showQuizExplanation, setShowQuizExplanation] = useState<Record<number, boolean>>({});

  const handleQuizSelect = (qId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setShowQuizExplanation(prev => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Cátedra Universitaria de Ingeniería de Control</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 1: Masterclass Teórica y Álgebra de Laplace
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Dominio riguroso estructurado en los 3 ejes fundamentales de la ingeniería: <strong className="text-cyan-300">¿Qué es?</strong>, <strong className="text-emerald-300">¿Para qué sirve en la industria?</strong> y <strong className="text-amber-300">¿Cómo funciona algebraicamente?</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              Plano Complejo s = σ + jω
            </span>
          </div>
        </div>

        {/* 3 Pedagogical Axes Tab Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Eje de Aprendizaje:</span>
          <button
            onClick={() => setActiveAxis('what')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeAxis === 'what'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. ¿Qué es? (Fundamento Teórico)</span>
          </button>
          <button
            onClick={() => setActiveAxis('industry')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeAxis === 'industry'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2. ¿Para qué sirve en la industria?</span>
          </button>
          <button
            onClick={() => setActiveAxis('algebra')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeAxis === 'algebra'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>3. ¿Cómo funciona algebraicamente?</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Navigation Topics + Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Topic Selector */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Lecciones de la Cátedra
          </div>

          {[
            { id: 'laplace-intro', num: '01', title: 'Transformada de Laplace & Polos/Ceros', badge: 'Fundamento' },
            { id: 'first-order', num: '02', title: 'Sistemas de 1er Orden Canónicos', badge: 'G(s) = K/(τs+1)' },
            { id: 'second-order', num: '03', title: 'Sistemas de 2º Orden (wn, ζ, wd)', badge: 'G(s) = wn²/(s²+2ζwns+wn²)' },
            { id: 'partial-fractions', num: '04', title: 'Fracciones Parciales en los 3 Casos', badge: 'Sub / Crítico / Sobre' },
            { id: 'pid-control', num: '05', title: 'Control PID en Lazo Cerrado', badge: 'P - I - D' },
            { id: 'bode-response', num: '06', title: 'Respuesta en Frecuencia (Bode)', badge: '20log|G| & Fase' },
          ].map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                activeTopicId === topic.id
                  ? 'bg-slate-900 border-cyan-500 shadow-sm text-white'
                  : 'bg-slate-950/70 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                activeTopicId === topic.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-500'
              }`}>
                {topic.num}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold leading-snug">{topic.title}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{topic.badge}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Right Side: Topic Content Structured along the 3 Axes */}
        <div className="lg:col-span-8 space-y-5">
          {/* Topic 1: Laplace Intro */}
          {activeTopicId === 'laplace-intro' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 01 / DOMINIO DE LAPLACE</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Transformada Unilateral de Laplace y Álgebra de Polos y Ceros
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      <span>¿Qué es la Transformada de Laplace?</span>
                    </h4>
                    <p>
                      Es una transformación integral lineal que proyecta funciones en el dominio del tiempo continuo <MathView math="f(t)" /> hacia el dominio de la frecuencia compleja <MathView math="s = \sigma + j\omega" />:
                    </p>
                    <MathView math="\mathcal{L}\{f(t)\} = F(s) = \int_{0^-}^{\infty} f(t) \, e^{-st} \, dt" block />
                    <p>
                      Su poder fundamental radica en transformar <strong>ecuaciones diferenciales ordinarias (EDOs)</strong> con coeficientes constantes en <strong>ecuaciones puramente algebraicas</strong>, donde la operación de diferenciación temporal se traduce en una simple multiplicación por la variable compleja <MathView math="s" />:
                    </p>
                    <MathView math="\mathcal{L}\left\{\frac{d^n y(t)}{dt^n}\right\} = s^n Y(s) - \sum_{k=1}^n s^{n-k} y^{(k-1)}(0^-)" block />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="font-semibold text-white">Polos del Sistema:</div>
                      <p className="text-slate-400">
                        Raíces del polinomio denominador <MathView math="D(s) = 0" />. Determinan la <strong>estabilidad estricta</strong> y la dinámica natural transitoria (frecuencias propias y amortiguamiento).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="font-semibold text-white">Ceros del Sistema:</div>
                      <p className="text-slate-400">
                        Raíces del polinomio numerador <MathView math="N(s) = 0" />. Modulan la amplitud relativa de los modos transitorios y pueden generar sub-oscilaciones o respuesta inversa (ceros en el semiplano derecho).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>¿Para qué sirve en la industria de automatización y robótica?</span>
                    </h4>
                    <p>
                      En plantas petroquímicas, centrales termoeléctricas, actuadores aeroespaciales y control vehicular, los ingenieros nunca resuelven ecuaciones diferenciales mediante integración manual continua en el tiempo.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-400">
                      <li>
                        <strong className="text-white">Garantía Absoluta de Estabilidad:</strong> Si todos los polos de la función de transferencia poseen parte real negativa (<MathView math="\text{Re}(p_i) < 0" />), se certifica que la caldera, brazo robótico o dron nunca entrará en régimen resonante destructivo.
                      </li>
                      <li>
                        <strong className="text-white">Diseño Modular en Cascada:</strong> Permite interconectar subsistemas mediante diagramas de bloques multiplicando directamente sus funciones de transferencia individuales: <MathView math="G_{\text{total}}(s) = G_1(s) \cdot G_2(s)" />.
                      </li>
                      <li>
                        <strong className="text-white">Síntesis Analítica de Controladores:</strong> Facilita ubicar los polos en posiciones específicas para satisfacer normativas industriales de tiempo de asentamiento <MathView math="t_s \le 2\text{ s}" /> y sobreimpulso <MathView math="M_p \le 5\%" />.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Binary className="w-4 h-4" />
                      <span>Mecanismo Algebraico Formal</span>
                    </h4>
                    <p>
                      Consideremos la ecuación general lineal de orden <MathView math="n" /> con entrada <MathView math="r(t)" />:
                    </p>
                    <MathView math="a_n \frac{d^n y}{dt^n} + \dots + a_1 \frac{dy}{dt} + a_0 y = b_m \frac{d^m r}{dt^m} + \dots + b_0 r" block />
                    <p>
                      Bajo condiciones iniciales nulas (<MathView math="y(0^-)=0, \dot{y}(0^-)=0" />), aplicamos linealidad de Laplace:
                    </p>
                    <MathView math="\left(a_n s^n + \dots + a_1 s + a_0\right) Y(s) = \left(b_m s^m + \dots + b_0\right) R(s)" block />
                    <p>
                      Despejando algebraicamente el cociente Salida / Entrada obtenemos la <strong>Función de Transferencia</strong> canónica:
                    </p>
                    <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{b_m s^m + \dots + b_0}{a_n s^n + \dots + a_1 s + a_0} = \frac{N(s)}{D(s)}" block />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic 2: First Order */}
          {activeTopicId === 'first-order' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 02 / MODELO DE 1ER ORDEN</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Sistemas Canónicos de Primer Orden: G(s) = K / (τs + 1)
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">Definición y Significado Físico</h4>
                    <p>
                      Un sistema de primer orden contiene <strong>un único elemento acumulador de energía</strong> (capacitor eléctrico <MathView math="C" />, inductor <MathView math="L" />, inercia térmica <MathView math="mc" />, o masa con amortiguador viscoso).
                    </p>
                    <MathView math="a \frac{dy(t)}{dt} + b y(t) = c r(t) \quad \longrightarrow \quad G(s) = \frac{Y(s)}{R(s)} = \frac{c/b}{(a/b)s + 1} = \frac{K}{\tau s + 1}" block />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="font-mono text-cyan-400 font-bold block">K = c / b</span>
                        <span>Ganancia Estática DC: valor asintótico ante escalón unitario.</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="font-mono text-amber-400 font-bold block">τ = a / b</span>
                        <span>Constante de Tiempo [s]: inercia temporal del proceso.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Ejemplos Industriales Reales</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-400">
                      <li>
                        <strong className="text-white">Hornos y Termopares Industriales:</strong> La temperatura <MathView math="T(t)" /> sigue la ley de enfriamiento de Newton: <MathView math="mc \frac{dT}{dt} + hA(T - T_\infty) = q_{\text{calefactor}}" /> con <MathView math="\tau = \frac{mc}{hA}" />.
                      </li>
                      <li>
                        <strong className="text-white">Tanques de Almacenamiento Hidráulico:</strong> El nivel de líquido <MathView math="h(t)" /> ante caudal entrante <MathView math="q_{\text{in}}" />: <MathView math="A \frac{dh}{dt} + \frac{h}{R_{\text{válvula}}} = q_{\text{in}}" /> con <MathView math="\tau = A \cdot R" />.
                      </li>
                      <li>
                        <strong className="text-white">Circuitos Filtros RC:</strong> Carga de capacitores en etapas de desacoplo de fuentes conmutadas con <MathView math="\tau = R \cdot C" />.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300">Deducción de la Respuesta al Escalón A</h4>
                    <p>
                      Si la entrada es un escalón de amplitud <MathView math="A" />, <MathView math="R(s) = \frac{A}{s}" />:
                    </p>
                    <MathView math="Y(s) = G(s) \cdot R(s) = \frac{K}{\tau s + 1} \cdot \frac{A}{s} = \frac{A K}{s (\tau s + 1)}" block />
                    <p>
                      Descomponiendo en fracciones parciales de Heaviside:
                    </p>
                    <MathView math="Y(s) = \frac{C_1}{s} + \frac{C_2}{s + 1/\tau} \quad \implies \quad C_1 = A K, \quad C_2 = -A K" block />
                    <p>
                      Aplicando la transformada inversa directa <MathView math="\mathcal{L}^{-1}" />:
                    </p>
                    <MathView math="y(t) = A K \left(1 - e^{-t/\tau}\right) \cdot u(t)" block />
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                      <div>• En t = τ: y(τ) = AK(1 - e⁻¹) = 0.63212 AK (63.2% de avance)</div>
                      <div>• En t = 4τ: y(4τ) = AK(1 - e⁻⁴) = 0.98168 AK (98.2% - Tiempo de establecimiento ts)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic 3: Second Order */}
          {activeTopicId === 'second-order' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 03 / SISTEMAS DE 2º ORDEN</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Ecuación Canónica: G(s) = K·wn² / (s² + 2ζwn·s + wn²)
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">Parámetros Canónicos Universales</h4>
                    <p>
                      Sistemas que acumulan energía en <strong>dos formas complementarias</strong> (cinética y potencial en mecánica: masa-resorte; magnética y electrostática en electricidad: LC).
                    </p>
                    <MathView math="G(s) = \frac{K \, \omega_n^2}{s^2 + 2\zeta \omega_n s + \omega_n^2}" block />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="font-mono text-cyan-400 font-bold block">ωn (Pulsación Natural)</span>
                        <span>Frecuencia angular de oscilación si no existiera disipación de fricción.</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="font-mono text-amber-400 font-bold block">ζ (Factor de Amortiguamiento)</span>
                        <span>Razón entre amortiguamiento real y amortiguamiento crítico.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Relevancia Industrial del Factor ζ</h4>
                    <p>
                      En el diseño de servomotores CNC y robótica articulada, el valor óptimo de compromiso entre velocidad y vida útil de los rodamientos mecánicos se sitúa en <MathView math="\zeta \approx 0.6 \text{ a } 0.7" /> (sobreimpulso tolerable del 5% al 10%).
                    </p>
                    <p>
                      En trenes de aterrizaje y suspensiones vehiculares, valores con <MathView math="\zeta < 0.2" /> provocarían náuseas e inestabilidad dinámica severa por rebote continuo.
                    </p>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300">Raíces de la Ecuación Característica</h4>
                    <MathView math="s^2 + 2\zeta \omega_n s + \omega_n^2 = 0 \quad \implies \quad s_{1,2} = -\zeta \omega_n \pm \omega_n \sqrt{\zeta^2 - 1}" block />
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                      <div className="font-semibold text-white">Métricas Analíticas en Caso Subamortiguado (0 &lt; ζ &lt; 1):</div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div>• wd = wn√(1 - ζ²)</div>
                        <div>• Mp = e^(-πζ / √(1-ζ²)) × 100%</div>
                        <div>• tp = π / wd</div>
                        <div>• ts (2%) ≈ 4 / (ζ·wn)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic 4: Partial Fractions 3 cases */}
          {activeTopicId === 'partial-fractions' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 04 / RESOLUCIÓN POR FRACCIONES PARCIALES</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Fracciones Parciales en los 3 Casos: Sub, Crítico y Sobreamortiguado
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">Los Tres Regímenes Físicos Posibles</h4>
                    <p>
                      Dependiendo del discriminante <MathView math="\Delta = \zeta^2 - 1" />, los polos adoptan naturalezas matemáticas totalmente diferentes:
                    </p>
                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded bg-slate-900 border border-cyan-900/60">
                        <strong className="text-cyan-300">1. Subamortiguado (0 &lt; ζ &lt; 1):</strong> Polos complejos conjugados <MathView math="s = -\sigma \pm j\omega_d" />. Respuesta con oscilaciones sinusoidales amortiguadas exponencialmente.
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-emerald-900/60">
                        <strong className="text-emerald-300">2. Críticamente Amortiguado (ζ = 1):</strong> Polo real doble <MathView math="s = -\omega_n" />. Transición más rápida al valor final sin oscilaciones ni sobrepico.
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-amber-900/60">
                        <strong className="text-amber-300">3. Sobreamortiguado (ζ &gt; 1):</strong> Dos polos reales negativos distintos <MathView math="s_1 \neq s_2" />. Respuesta lenta dominada por el polo más cercano al eje imaginario.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Criterio de Selección en Plantas Industriales</h4>
                    <p>
                      • <strong>Básculas y Sensores de Pesaje:</strong> Requieren <MathView math="\zeta = 1" /> (críticamente amortiguado) para que la lectura digital marque el peso exacto en milisegundos sin oscilar entre valores falsos.
                    </p>
                    <p>
                      • <strong>Válvulas de Alivio de Seguridad:</strong> Deben ser sobreamortiguadas (<MathView math="\zeta > 1.2" />) para impedir que el pistón golpee mecánicamente contra su tope en el cierre súbito.
                    </p>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300">Descomposición y Cálculo de Residuos</h4>
                    <p>Para entrada escalón <MathView math="R(s) = A/s" />:</p>
                    <MathView math="Y(s) = \frac{A K \omega_n^2}{s (s^2 + 2\zeta \omega_n s + \omega_n^2)}" block />
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white">• Caso Subamortiguado (0 &lt; ζ &lt; 1):</div>
                      <MathView math="Y(s) = \frac{A K}{s} - \frac{A K (s + \zeta \omega_n)}{(s + \zeta \omega_n)^2 + \omega_d^2} - \frac{A K \frac{\zeta}{\sqrt{1-\zeta^2}} \omega_d}{(s + \zeta \omega_n)^2 + \omega_d^2}" block />
                      <div className="text-emerald-400 font-mono text-[11px]">
                        y(t) = AK [ 1 - e^(-ζ·wn·t)·( cos(wd·t) + (ζ/√(1-ζ²))·sin(wd·t) ) ]
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-semibold text-white">• Caso Críticamente Amortiguado (ζ = 1):</div>
                      <MathView math="Y(s) = \frac{A K}{s} - \frac{A K}{s + \omega_n} - \frac{A K \omega_n}{(s + \omega_n)^2}" block />
                      <div className="text-cyan-400 font-mono text-[11px]">
                        y(t) = AK [ 1 - (1 + wn·t)·e^(-wn·t) ]
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic 5: PID Control */}
          {activeTopicId === 'pid-control' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 05 / CONTROL CLÁSICO PID</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Control PID en Lazo Cerrado y Función de Transferencia T(s)
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">Algoritmo Universal PID</h4>
                    <p>
                      Combina tres acciones complementarias en paralelo calculadas a partir del error instantáneo <MathView math="e(t) = r(t) - y(t)" />:
                    </p>
                    <MathView math="u(t) = K_p \, e(t) + K_i \int_0^t e(\tau) \, d\tau + K_d \, \frac{de(t)}{dt}" block />
                    <MathView math="C(s) = K_p + \frac{K_i}{s} + K_d s = \frac{K_d s^2 + K_p s + K_i}{s}" block />
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Más del 90% del Control Industrial Mundial</h4>
                    <p>
                      Sistemas PLC (Siemens, Rockwell, Schneider) y SCADA implementan bucles PID en refinerías de petróleo, turbinas hidroeléctricas y extrusoras plásticas debido a su robustez y simplicidad de mantenimiento por técnicos de campo.
                    </p>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300">Deducción de la Función de Transferencia de Lazo Cerrado</h4>
                    <MathView math="T(s) = \frac{Y(s)}{R(s)} = \frac{C(s) G(s)}{1 + C(s) G(s)}" block />
                    <p>
                      Para planta de 1er orden <MathView math="G(s) = \frac{K}{\tau s + 1}" /> con PID:
                    </p>
                    <MathView math="T(s) = \frac{K(K_d s^2 + K_p s + K_i)}{(\tau + K K_d) s^2 + (1 + K K_p) s + K K_i}" block />
                    <p>
                      El término integral <MathView math="K_i" /> añade un polo en el origen que garantiza <MathView math="e_{ss} = 0" /> ante escalón, y <MathView math="K_d" /> incrementa el amortiguamiento efectivo del lazo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topic 6: Bode Response */}
          {activeTopicId === 'bode-response' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400">LECCIÓN 06 / RESPUESTA EN FRECUENCIA</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Diagramas de Bode: Magnitud (dB) y Fase (°)
                </h3>
              </div>

              {activeAxis === 'what' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">Representación Asintótica Logarítmica</h4>
                    <p>
                      Evalúa la respuesta en régimen permanente al sustituir <MathView math="s \leftarrow j\omega" /> ante entradas sinusoidales puras <MathView math="r(t) = A \sin(\omega t)" />:
                    </p>
                    <MathView math="|G(j\omega)|_{\text{dB}} = 20 \log_{10} |G(j\omega)|, \quad \phi(\omega) = \angle G(j\omega) = \arctan\left(\frac{\text{Im}}{\text{Re}}\right)" block />
                  </div>
                </div>
              )}

              {activeAxis === 'industry' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Márgenes de Estabilidad Industrial</h4>
                    <p>
                      Permite calcular sin necesidad de simular el tiempo:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li><strong>Margen de Fase (PM):</strong> Se exige típicamente <MathView math="PM \ge 45^\circ \text{ a } 60^\circ" /> para absorber retrasos y variaciones térmicas de los sensores.</li>
                      <li><strong>Margen de Ganancia (GM):</strong> Se exige <MathView math="GM \ge 6 \text{ dB}" /> (factor 2 de seguridad frente a saturación de ganancia).</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeAxis === 'algebra' && (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-amber-300">Asíntotas Matemáticas de 1er Orden</h4>
                    <MathView math="G(j\omega) = \frac{K}{1 + j\omega\tau} \implies |G(j\omega)| = \frac{K}{\sqrt{1 + (\omega\tau)^2}}" block />
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                      <div>• Frecuencia de corte ωc = 1/τ: |G|dB = 20log10(K) - 3.01 dB, Fase = -45°</div>
                      <div>• En alta frecuencia (ω &gt;&gt; 1/τ): Pendiente = -20 dB/década (-6 dB/octava), Fase = -90°</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conceptual Self-Check Quiz */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Verificación Conceptual de Cátedra</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Pregunta de Control y Estabilidad
            </h3>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-medium text-slate-200">
                ¿Qué condición matemática sobre los polos de <MathView math="G(s)" /> garantiza que un sistema físico sea estrictamente estable (BIBO Estable)?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { text: 'Todos los polos tengan parte real estrictamente negativa (Re(p) < 0)', correct: true },
                  { text: 'Todos los polos estén ubicados sobre el eje imaginario (Re(p) = 0)', correct: false },
                  { text: 'El sistema posea al menos un cero en el semiplano derecho', correct: false },
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
                  {quizAnswers[1] === 0 ? '✓ ¡Correcto! Los modos transitorios contienen factores e^(Re(p)·t). Solo si Re(p) < 0 la exponencial decae a cero asegurando estabilidad asintótica.' : '✗ Incorrecto. Si un polo tiene Re(p) ≥ 0, la respuesta diverge o se mantiene oscilando indefinidamente.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
