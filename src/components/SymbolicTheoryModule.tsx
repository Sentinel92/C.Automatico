import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  Calculator,
  Compass,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { MathView } from './MathView';

type SymbolicTopic =
  | 'lti_laplace'
  | 'first_order'
  | 'second_order'
  | 'exam_formulas'
  | 'circuits_kirchhoff';

export const SymbolicTheoryModule: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<SymbolicTopic>('lti_laplace');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Regla Pedagógica de Cátedra: Álgebra Simbólica Primero</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 1: Teoría y Deducción Simbólica Completa (Solo Letras)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Todas las transformadas de Laplace, funciones de transferencia y especificaciones temporales deducidas rigurosamente con variables literales (<MathView math="a_2, a_1, a_0, b_0, K, \tau, \omega_n, \zeta, R, C, L, s, t" />) antes de evaluar ningún número.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>100% Simbólico & Formal</span>
            </span>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4 border-t border-slate-800/80">
          {[
            {
              id: 'lti_laplace',
              label: '1. Sistemas LTI & Laplace',
              sub: 'Superposición & Autofunciones',
              icon: BookOpen,
            },
            {
              id: 'first_order',
              label: '2. EDO 1er Orden Simbólica',
              sub: 'a1·y\' + a0·y = b0·r',
              icon: Activity,
            },
            {
              id: 'second_order',
              label: '3. EDO 2º Orden Simbólica',
              sub: 'a2·y\'\' + a1·y\' + a0·y = b0·r',
              icon: Layers,
            },
            {
              id: 'exam_formulas',
              label: '4. Fórmulas de Examen',
              sub: 'wn, ζ, wd, β, tr, tp, Mp, ts',
              icon: Calculator,
            },
            {
              id: 'circuits_kirchhoff',
              label: '5. Circuitos RC, RL, RLC',
              sub: 'LVK e Impedancias Z(s)',
              icon: Zap,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTopic === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTopic(tab.id as SymbolicTopic)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-950/50 shadow-lg shadow-indigo-950/50 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {tab.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono truncate">{tab.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
        {/* TOPIC 1: LTI & LAPLACE */}
        {activeTopic === 'lti_laplace' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                Sección 1.1 — Fundamentos de Modelado Dinámico
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                ¿Qué es un Sistema LTI y por qué se utiliza la Transformada de Laplace?
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Fundamentación matemática de por qué la ingeniería de control traslada el análisis desde el dominio temporal <MathView math="t \in \mathbb{R}^+" /> al dominio algebraico complejo <MathView math="s \in \mathbb{C}" />.
              </p>
            </div>

            {/* Sub-block 1: Definición LTI */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>1. Definición Formal de un Sistema LTI (Linear Time-Invariant)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Un operador de sistema <MathView math="\mathcal{T}\{\cdot\}" /> que mapea una entrada <MathView math="u(t)" /> a una salida <MathView math="y(t) = \mathcal{T}\{u(t)\}" /> es <strong>LTI</strong> si satisface simultáneamente dos principios inviolables:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5">
                  <span className="font-semibold text-cyan-300">A. Principio de Superposición (Linealidad):</span>
                  <div className="py-1">
                    <MathView math="\mathcal{T}\{\alpha u_1(t) + \beta u_2(t)\} = \alpha \mathcal{T}\{u_1(t)\} + \beta \mathcal{T}\{u_2(t)\}" display />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Garantiza la homogeneidad escalar y la aditividad de respuestas sin acoplamientos no lineales ni productos cruzados.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5">
                  <span className="font-semibold text-emerald-300">B. Invarianza en el Tiempo (Estacionariedad):</span>
                  <div className="py-1">
                    <MathView math="\text{Si } y(t) = \mathcal{T}\{u(t)\} \implies \mathcal{T}\{u(t - \tau)\} = y(t - \tau)" display />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Los coeficientes intrínsecos de la planta física no cambian con el calendario ni con la hora del experimento.
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-block 2: Por qué Laplace */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2. ¿Por qué usamos la Transformada Unilateral de Laplace?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                La Transformada de Laplace está definida formalmente para una función continua por tramos <MathView math="f(t)" /> como:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <MathView math="\mathcal{L}\{f(t)\} = F(s) = \int_{0^{-}}^{\infty} f(t) e^{-st} \, dt, \quad s = \sigma + j\omega \in \mathbb{C}" display />
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Autofunciones de Sistemas Convolutivos:</strong> Las exponenciales complejas <MathView math="e^{st}" /> son <em>autofunciones</em> de cualquier operador lineal convolutivo: la salida a <MathView math="e^{st}" /> es simplemente <MathView math="G(s) \cdot e^{st}" />, transformando la convolución temporal en un producto puramente algebraico.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Propiedad de la Derivación:</strong> Convierte ecuaciones diferenciales ordinarias (EDO) en polinomios algebraicos:
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 text-center font-mono">
                  <MathView math="\mathcal{L}\left\{\frac{d^n y(t)}{dt^n}\right\} = s^n Y(s) - \sum_{k=1}^n s^{n-k} y^{(k-1)}(0^-) \quad \xrightarrow{\text{C.I. nulas}} \quad s^n Y(s)" display />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPIC 2: FIRST ORDER SYMBOLIC */}
        {activeTopic === 'first_order' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Sección 1.2 — Ecuación Diferencial de Primer Orden
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Deducción Simbólica Completa: <MathView math="a_1 \dot{y}(t) + a_0 y(t) = b_0 r(t)" />
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Despeje algebraico estricto desde los coeficientes diferenciales generales hasta la Forma Canónica Estándar <MathView math="G(s) = \frac{K}{\tau s + 1}" />.
              </p>
            </div>

            <div className="space-y-4">
              {/* Paso 1 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400">PASO 1: APLICACIÓN DE LA TRANSFORMADA DE LAPLACE</span>
                <p className="text-xs text-slate-300">
                  Asumiendo condiciones iniciales nulas (<MathView math="y(0^-) = 0" />) y aplicando linealidad:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="\mathcal{L}\left\{ a_1 \frac{dy(t)}{dt} + a_0 y(t) \right\} = \mathcal{L}\{ b_0 r(t) \}" display />
                  <MathView math="a_1 \left[ s Y(s) - y(0^-) \right] + a_0 Y(s) = b_0 R(s)" display />
                  <MathView math="a_1 s Y(s) + a_0 Y(s) = b_0 R(s)" display />
                </div>
              </div>

              {/* Paso 2 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400">PASO 2: FACTORIZACIÓN Y DESPEJE DE LA FUNCIÓN DE TRANSFERENCIA G(s)</span>
                <p className="text-xs text-slate-300">
                  Agrupando los términos con el operador <MathView math="Y(s)" /> en el miembro izquierdo:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="(a_1 s + a_0) Y(s) = b_0 R(s)" display />
                  <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{b_0}{a_1 s + a_0}" display />
                </div>
              </div>

              {/* Paso 3 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400">PASO 3: NORMALIZACIÓN A LA FORMA CANÓNICA DE PRIMER ORDEN</span>
                <p className="text-xs text-slate-300">
                  Para obtener el término independiente del denominador igual a la unidad (<MathView math="+1" />), dividimos numerador y denominador por el coeficiente <MathView math="a_0" />:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <MathView math="G(s) = \frac{\frac{b_0}{a_0}}{\frac{a_1}{a_0} s + 1} = \frac{K}{\tau s + 1}" display />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-left">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-xs font-semibold">Ganancia Estática (DC Gain):</span>
                      <MathView math="K = \frac{b_0}{a_0} \quad \left[\text{Unidades de Salida / Entrada}\right]" display />
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 text-xs font-semibold">Constante de Tiempo:</span>
                      <MathView math="\tau = \frac{a_1}{a_0} \quad [\text{segundos}]" display />
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 4: Respuesta Temporal Exacta */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-400">PASO 4: RESPUESTA AL ESCALÓN UNITARIO DE AMPLITUD A: r(t) = A·u(t)</span>
                <p className="text-xs text-slate-300">
                  Con <MathView math="R(s) = \frac{A}{s}" />, la salida en el dominio s es <MathView math="Y(s) = G(s) R(s) = \frac{A \cdot K}{s(\tau s + 1)}" />:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                  <MathView math="Y(s) = \frac{A \cdot K}{s} - \frac{A \cdot K \cdot \tau}{\tau s + 1} = A \cdot K \left[ \frac{1}{s} - \frac{1}{s + \frac{1}{\tau}} \right]" display />
                  <p className="text-xs text-slate-400 text-left pt-2">
                    Aplicando la Transformada Inversa de Laplace <MathView math="\mathcal{L}^{-1}\{\cdot\}" />:
                  </p>
                  <div className="p-2 rounded bg-indigo-950/40 border border-indigo-900/60">
                    <MathView math="y(t) = A \cdot K \left( 1 - e^{-\frac{t}{\tau}} \right) u(t)" display />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPIC 3: SECOND ORDER SYMBOLIC */}
        {activeTopic === 'second_order' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                Sección 1.3 — Ecuación Diferencial de Segundo Orden
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Deducción Simbólica Completa: <MathView math="a_2 \ddot{y}(t) + a_1 \dot{y}(t) + a_0 y(t) = b_0 r(t)" />
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Demostración formal hacia la Forma Canónica Estándar <MathView math="G(s) = \frac{K \omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}" />.
              </p>
            </div>

            <div className="space-y-4">
              {/* Paso 1 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-400">PASO 1: TRANSFORMADA DE LAPLACE (CONDICIONES INICIALES NULAS)</span>
                <p className="text-xs text-slate-300">
                  Con <MathView math="y(0^-) = 0" /> y <MathView math="\dot{y}(0^-) = 0" />:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="\mathcal{L}\left\{ a_2 \frac{d^2 y(t)}{dt^2} + a_1 \frac{dy(t)}{dt} + a_0 y(t) \right\} = \mathcal{L}\{ b_0 r(t) \}" display />
                  <MathView math="a_2 s^2 Y(s) + a_1 s Y(s) + a_0 Y(s) = b_0 R(s)" display />
                  <MathView math="(a_2 s^2 + a_1 s + a_0) Y(s) = b_0 R(s)" display />
                </div>
              </div>

              {/* Paso 2 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400">PASO 2: DESPEJE DE LA FUNCIÓN DE TRANSFERENCIA MONOMIAL</span>
                <p className="text-xs text-slate-300">
                  Dividiendo numerador y denominador entre el coeficiente principal <MathView math="a_2" /> para hacer el término <MathView math="s^2" /> mónico:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="G(s) = \frac{Y(s)}{R(s)} = \frac{b_0}{a_2 s^2 + a_1 s + a_0} = \frac{\frac{b_0}{a_2}}{s^2 + \frac{a_1}{a_2} s + \frac{a_0}{a_2}}" display />
                </div>
              </div>

              {/* Paso 3 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400">PASO 3: IDENTIFICACIÓN CON LA FORMA CANÓNICA UNIVERSITARIA</span>
                <p className="text-xs text-slate-300">
                  El polinomio característico estándar de segundo orden se define universalmente como:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-3">
                  <MathView math="P(s) = s^2 + 2\zeta \omega_n s + \omega_n^2" display />
                  <p className="text-xs text-slate-400 text-left">
                    Igualando coeficientes término a término con <MathView math="s^2 + \frac{a_1}{a_2} s + \frac{a_0}{a_2}" />:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs text-cyan-300 font-bold">1. Término Independiente:</span>
                      <MathView math="\omega_n^2 = \frac{a_0}{a_2} \implies \omega_n = \sqrt{\frac{a_0}{a_2}}" display />
                      <span className="text-[11px] text-slate-400">Frecuencia natural no amortiguada [rad/s].</span>
                    </div>

                    <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs text-emerald-300 font-bold">2. Término Lineal en s:</span>
                      <MathView math="2\zeta \omega_n = \frac{a_1}{a_2} \implies \zeta = \frac{a_1}{2 a_2 \omega_n} = \frac{a_1}{2\sqrt{a_0 a_2}}" display />
                      <span className="text-[11px] text-slate-400">Factor de amortiguamiento adimensional.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 text-left">
                    <span className="text-xs text-indigo-300 font-bold">3. Ganancia Estática DC:</span>
                    <MathView math="K = G(0) = \frac{b_0}{a_0} \implies \frac{b_0}{a_2} = K \cdot \frac{a_0}{a_2} = K \omega_n^2" display />
                    <div className="mt-2 p-2 rounded bg-indigo-950/40 border border-indigo-900/60 text-center">
                      <MathView math="G(s) = \frac{K \omega_n^2}{s^2 + 2\zeta \omega_n s + \omega_n^2}" display />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPIC 4: EXAM FORMULAS */}
        {activeTopic === 'exam_formulas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
                Sección 1.4 — Fórmulas Simbólicas Exactas de Examen
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Catálogo de Fórmulas Literales de Evaluación Universitaria
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Fórmulas analíticas rigurosas para el régimen subamortiguado (<MathView math="0 \le \zeta < 1" />) utilizadas en exámenes de grado y certámenes de ingeniería.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formula 1: wd */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono">Frecuencia Natural Amortiguada</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">wd</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="\omega_d = \omega_n \sqrt{1 - \zeta^2}" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  Frecuencia de oscilación real en el tiempo. Representa la coordenada imaginaria de los polos complejos conjugados: <MathView math="s_{1,2} = -\sigma \pm j \omega_d" />.
                </p>
              </div>

              {/* Formula 2: beta */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 font-mono">Ángulo de Amortiguamiento</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">beta</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="\beta = \arccos(\zeta) = \arctan\left(\frac{\sqrt{1-\zeta^2}}{\zeta}\right)" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  Ángulo medido en radianes desde el eje real negativo hacia los polos complejos en el plano s.
                </p>
              </div>

              {/* Formula 3: tr */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 font-mono">Tiempo de Levantamiento (Rise Time)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">tr</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="t_r = \frac{\pi - \beta}{\omega_d}" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  Instante en que la respuesta temporal alcanza por primera vez el 100% de su valor final (<MathView math="y(t_r) = y_{final}" />).
                </p>
              </div>

              {/* Formula 4: tp */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">Tiempo de Pico (Peak Time)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">tp</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="t_p = \frac{\pi}{\omega_d} = \frac{\pi}{\omega_n \sqrt{1 - \zeta^2}}" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  Instante en que la primera derivada temporal se anula (<MathView math="\left.\frac{dy}{dt}\right|_{t_p} = 0" />), alcanzando el máximo absoluto.
                </p>
              </div>

              {/* Formula 5: Mp% */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 font-mono">Sobrepico Porcentual Máximo</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">Mp%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <MathView math="M_p(\%) = 100 \cdot e^{-\frac{\zeta \pi}{\sqrt{1 - \zeta^2}}}" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  El sobreimpulso relativo depende <strong>única y exclusivamente</strong> de <MathView math="\zeta" />, sin verse afectado por la velocidad <MathView math="\omega_n" />.
                </p>
              </div>

              {/* Formula 6: ts (2% y 5%) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 font-mono">Tiempos de Asentamiento (Settling Time)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">ts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                  <MathView math="t_s(2\%) = \frac{4}{\zeta \omega_n} = \frac{4}{\sigma} \quad (\text{criterio } \pm 2\%)" display />
                  <MathView math="t_s(5\%) = \frac{3}{\zeta \omega_n} = \frac{3}{\sigma} \quad (\text{criterio } \pm 5\%)" display />
                </div>
                <p className="text-[11px] text-slate-400">
                  Donde <MathView math="\sigma = \zeta \omega_n" /> es la atenuación exponencial del envolvente: <MathView math="e^{-\sigma t}" />.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOPIC 5: CIRCUITS KIRCHHOFF */}
        {activeTopic === 'circuits_kirchhoff' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Sección 1.5 — Física y Circuitos Eléctricos
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Deducción por Leyes de Kirchhoff e Impedancias Complejas en Laplace
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Relación directa entre las leyes fundamentales de la física circuital y la teoría de control.
              </p>
            </div>

            {/* Impedance Table */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Impedancias de Componentes Pasivos en el Dominio Complejo <MathView math="s" />:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900">
                  <span className="text-amber-400 font-bold block mb-1">Resistor (R)</span>
                  <MathView math="Z_R(s) = R" display />
                  <span className="text-[10px] text-slate-400">Disipativo puro, fase 0°</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900">
                  <span className="text-cyan-400 font-bold block mb-1">Inductor (L)</span>
                  <MathView math="Z_L(s) = Ls" display />
                  <span className="text-[10px] text-slate-400">Inercia magnética, adelanta +90°</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900">
                  <span className="text-emerald-400 font-bold block mb-1">Capacitor (C)</span>
                  <MathView math="Z_C(s) = \frac{1}{Cs}" display />
                  <span className="text-[10px] text-slate-400">Almacenador electrostático, atrasa -90°</span>
                </div>
              </div>
            </div>

            {/* Circuit 1: RC */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <span className="text-xs font-bold text-cyan-300 font-mono">1. CIRCUITO RC SERIE (FILTRO PASA-BAJOS DE 1ER ORDEN)</span>
              <p className="text-xs text-slate-300">
                Por Ley de Voltajes de Kirchhoff (LVK) en lazo único:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                <MathView math="V_{in}(s) = V_R(s) + V_C(s) = R \cdot I(s) + \frac{1}{Cs} \cdot I(s) = \left( R + \frac{1}{Cs} \right) I(s)" display />
                <p className="text-xs text-slate-400 text-left">
                  Tomando la tensión de salida sobre el capacitor: <MathView math="V_{out}(s) = V_C(s) = \frac{1}{Cs} I(s)" />:
                </p>
                <MathView math="G_{RC}(s) = \frac{V_{out}(s)}{V_{in}(s)} = \frac{\frac{1}{Cs}}{R + \frac{1}{Cs}} = \frac{1}{RCs + 1} \implies K = 1, \quad \tau = RC" display />
              </div>
            </div>

            {/* Circuit 2: RL */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <span className="text-xs font-bold text-amber-300 font-mono">2. CIRCUITO RL SERIE</span>
              <p className="text-xs text-slate-300">
                Por LVK: <MathView math="V_{in}(s) = (R + Ls)I(s)" />. Tomando salida sobre la resistencia <MathView math="V_{out}(s) = R \cdot I(s)" />:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <MathView math="G_{RL}(s) = \frac{V_{out}(s)}{V_{in}(s)} = \frac{R}{Ls + R} = \frac{1}{\frac{L}{R}s + 1} \implies K = 1, \quad \tau = \frac{L}{R}" display />
              </div>
            </div>

            {/* Circuit 3: RLC */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <span className="text-xs font-bold text-purple-300 font-mono">3. CIRCUITO RLC SERIE (SISTEMA DE 2º ORDEN)</span>
              <p className="text-xs text-slate-300">
                LVK: <MathView math="V_{in}(s) = \left( Ls + R + \frac{1}{Cs} \right) I(s)" />. Tensión de salida en el capacitor:
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-2">
                <MathView math="G_{RLC}(s) = \frac{\frac{1}{Cs}}{Ls + R + \frac{1}{Cs}} = \frac{1}{LC s^2 + RC s + 1} = \frac{\frac{1}{LC}}{s^2 + \frac{R}{L}s + \frac{1}{LC}}" display />
                <p className="text-xs text-slate-400 text-left pt-1">
                  Comparando término a término con la forma canónica <MathView math="\frac{\omega_n^2}{s^2 + 2\zeta \omega_n s + \omega_n^2}" />:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold">Frecuencia Natural de Resonancia:</span>
                    <MathView math="\omega_n = \frac{1}{\sqrt{LC}}" display />
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold">Factor de Amortiguamiento Físico:</span>
                    <MathView math="2\zeta \omega_n = \frac{R}{L} \implies \zeta = \frac{R}{2} \sqrt{\frac{C}{L}}" display />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
