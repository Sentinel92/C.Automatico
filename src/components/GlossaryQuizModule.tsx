import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Layers,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Gauge,
  Sliders,
  Compass,
} from 'lucide-react';
import { MathView } from './MathView';

interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  mathPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  mathExplanation?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: 'Polos y Estabilidad BIBO',
    question:
      '¿Qué condición matemática sobre la parte real de los polos de la función de transferencia en lazo cerrado T(s) garantiza que un sistema continuo sea asintóticamente estable (BIBO)?',
    mathPrompt: 'T(s) = \\frac{N(s)}{\\prod_{i=1}^n (s - p_i)} \\quad \\implies \\quad p_i = \\sigma_i + j\\omega_i',
    options: [
      'Todos los polos deben tener parte real estrictamente negativa: Re(pi) = σi < 0.',
      'Al menos un polo debe ubicarse en el origen s = 0 para garantizar ganancia unitaria.',
      'Todos los polos deben situarse sobre el eje imaginario: Re(pi) = 0.',
      'La parte real de los polos debe ser estrictamente positiva para asegurar convergencia rápida.',
    ],
    correctIndex: 0,
    explanation:
      'Cada polo p_i = σ_i + jω_i genera un modo temporal proporcional a e^(σ_i · t). Para que los transitorios tiendan a cero cuando t tiende a infinito, la envolvente exponencial requiere estrictamente σ_i < 0 (todos los polos en el semiplano izquierdo del plano s).',
    mathExplanation: 'y_{\\text{transitorio}}(t) = \\sum_{i=1}^n C_i \\, e^{(\\sigma_i + j\\omega_i)t} \\xrightarrow{t \\to \\infty} 0 \\iff \\sigma_i < 0 \\quad \\forall i',
  },
  {
    id: 2,
    topic: 'Constante de Tiempo (1er Orden)',
    question:
      'En la respuesta al escalón unitario de un sistema de primer orden sin retardo, ¿por qué en el instante t = τ la salida alcanza exactamente el 63.2% de su valor final?',
    mathPrompt: 'y(t) = K \\left(1 - e^{-t/\\tau}\\right) \\quad \\xrightarrow{t = \\tau} \\quad y(\\tau) = ?',
    options: [
      'Porque e^(-1) ≈ 0.368, de modo que (1 - e^(-1)) = 1 - 0.3679 = 0.6321 (63.2%).',
      'Porque la pendiente inicial es K/τ y tras un segundo la salida se satura en 63.2%.',
      'Porque el 63.2% es la integral normalizada de la campana de Gauss en un desvío estándar.',
      'Porque el tiempo de muestreo mínimo de Shannon-Nyquist introduce una pérdida de 36.8%.',
    ],
    correctIndex: 0,
    explanation:
      'Evaluando la solución analítica en t = τ se obtiene y(τ) = K·(1 - e^(-1)). Como el número e elevado a la -1 es aproximadamente 0.36788, la diferencia es exactamente 0.63212, correspondiente al 63.2%.',
    mathExplanation: 'y(\\tau) = K \\left(1 - \\frac{1}{e}\\right) \\approx K(1 - 0.36788) = 0.63212 \\, K \\implies 63.2\\%',
  },
  {
    id: 3,
    topic: 'Factor de Amortiguamiento (2º Orden)',
    question:
      '¿En qué intervalo debe ubicarse el factor de amortiguamiento adimensional ζ de un sistema de segundo orden para que presente respuesta subamortiguada (oscilatoria convergente)?',
    mathPrompt: 'G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2} \\quad \\implies \\quad p_{1,2} = -\\zeta\\omega_n \\pm j\\omega_n\\sqrt{1 - \\zeta^2}',
    options: [
      '0 < ζ < 1 (Polos complejos conjugados con parte real negativa).',
      'ζ = 1 (Dos polos reales repetidos en el eje real).',
      'ζ > 1 (Dos polos reales distintos no oscilatorios).',
      'ζ < 0 (Polos en el semiplano derecho divergentes).',
    ],
    correctIndex: 0,
    explanation:
      'Cuando 0 < ζ < 1, el radicando (1 - ζ²) es positivo, lo que genera polos complejos conjugados con parte imaginaria ±j·ω_d = ±j·ω_n·√(1 - ζ²). Esto produce una respuesta senoidal amortiguada que oscila alrededor del valor de referencia.',
    mathExplanation: '\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2} > 0 \\iff 0 \\le \\zeta < 1',
  },
  {
    id: 4,
    topic: 'Control Integral (PID)',
    question:
      '¿Cuál es la función primordial de la acción integral (Ki / s) en un controlador PID en lazo cerrado?',
    mathPrompt: 'C(s) = K_p + \\frac{K_i}{s} + K_d s \\quad \\implies \\quad e_{ss} = \\lim_{s \\to 0} s E(s)',
    options: [
      'Eliminar por completo el error en régimen permanente (ess = 0) ante entradas de tipo escalón acumulando el error en el tiempo.',
      'Aumentar la velocidad inicial de respuesta reduciendo el tiempo de levantamiento tr sin introducir sobreimpulso.',
      'Anticipar perturbaciones derivando la tasa de cambio de la señal de error.',
      'Reducir la ganancia en baja frecuencia para proteger a los actuadores mecánicos contra saturación.',
    ],
    correctIndex: 0,
    explanation:
      'La acción integral introduce un polo en el origen s = 0 en la función de transferencia de lazo abierto. Esto aumenta el Tipo del sistema en 1, elevando la ganancia estática a infinito y forzando a que el error en régimen permanente ante escalón sea idénticamente cero (ess = 0).',
    mathExplanation: 'u_I(t) = K_i \\int_0^t e(\\tau)\\,d\\tau \\quad \\implies \\quad \\text{mientras } e(t) \\ne 0, u_I \\text{ continúa ajustando la planta.}',
  },
  {
    id: 5,
    topic: 'Control Derivativo (PID)',
    question:
      '¿Por qué se describe comúnmente a la acción derivativa (Kd · s) como un "freno predictivo o amortiguador dinámico"?',
    mathPrompt: 'u_D(t) = K_d \\frac{de(t)}{dt} = K_d \\left(\\frac{dr(t)}{dt} - \\frac{dy(t)}{dt}\\right)',
    options: [
      'Porque reacciona a la velocidad con la que cambia el error, produciendo una señal correctiva opuesta a la velocidad de la salida que reduce el sobrepico Mp.',
      'Porque añade un retardo puro de fase de -90° que estabiliza las frecuencias resonantes del proceso.',
      'Porque multiplica la amplitud del error en estado estacionario para forzar la convergencia asintótica.',
      'Porque atenúa el ruido de alta frecuencia proveniente de los sensores de medición analógicos.',
    ],
    correctIndex: 0,
    explanation:
      'Al calcular la derivada instantánea de(t)/dt, el término derivativo proyecta la tendencia futura del error. Si la salida se aproxima rápidamente a la referencia, de/dt es negativo, aplicando un esfuerzo de control contrario que frena la planta y suprime drásticamente el sobreimpulso (overshoot).',
    mathExplanation: '\\text{Para } r(t) \\text{ constante: } u_D(t) = -K_d \\frac{dy(t)}{dt} \\quad \\implies \\quad \\text{amortigua el movimiento de la salida.}',
  },
  {
    id: 6,
    topic: 'Respuesta en Frecuencia (Bode)',
    question:
      'En el diagrama de Bode de un sistema de 1er orden G(s) = K / (τs + 1), ¿qué valores de magnitud relativa y fase caracterizan a la frecuencia de corte ωc = 1/τ?',
    mathPrompt: 'G(j\\omega_c) = \\frac{K}{j\\tau(1/\\tau) + 1} = \\frac{K}{1 + j1}',
    options: [
      'Caída de -3 dB en la magnitud respecto a baja frecuencia y un desfase exacto de -45°.',
      'Caída de -6 dB en la magnitud y un desfase exacto de -90°.',
      'Ganancia unitaria 0 dB y desfase nulo de 0°.',
      'Pico resonante de +3 dB y adelanto de fase de +45°.',
    ],
    correctIndex: 0,
    explanation:
      'En ω = 1/τ, |1 + j1| = √2 ≈ 1.414. En decibelios: 20·log10(1/√2) = -3.01 dB. El ángulo de fase es arctan(-1/1) = -45°. Por ello ωc se denomina también frecuencia de media potencia o frecuencia de -3 dB.',
    mathExplanation: '20\\log_{10}|G(j\\omega_c)| = 20\\log_{10}(K) - 20\\log_{10}(\\sqrt{2}) = 20\\log_{10}(K) - 3.01\\,\\text{dB}, \\quad \\angle G(j\\omega_c) = -45^\\circ',
  },
  {
    id: 7,
    topic: 'Márgenes de Estabilidad (Bode)',
    question:
      '¿Cómo se define rigurosamente el Margen de Fase (MF) en el análisis de estabilidad en frecuencia de lazo abierto?',
    mathPrompt: 'MF = 180^\\circ + \\angle G(j\\omega_{gc}) \\quad \\text{donde } |G(j\\omega_{gc})| = 1 \\,(0\\,\\text{dB})',
    options: [
      'Es la cantidad de retraso de fase adicional en grados necesaria a la frecuencia de cruce de ganancia (0 dB) para llevar al sistema al límite de inestabilidad.',
      'Es la ganancia en decibelios cuando la fase cruza exactamente los 0°.',
      'Es el ángulo de corte a la frecuencia de resonancia máxima del lazo cerrado.',
      'Es la relación entre la frecuencia de corte y el ancho de banda a -3 dB.',
    ],
    correctIndex: 0,
    explanation:
      'El Margen de Fase (MF) mide cuán cerca está el lazo abierto del punto crítico de Nyquist (-1 + j0). En la frecuencia ω_gc donde el módulo es 1 (0 dB), el MF representa el desfase negativo que falta para alcanzar -180°. Se recomienda MF entre 45° y 60° para un buen compromiso entre velocidad y estabilidad.',
    mathExplanation: 'MF = 180^\\circ + \\angle L(j\\omega_{gc}) > 0 \\quad \\iff \\quad \\text{Lazo cerrado estable por criterio de Bode/Nyquist.}',
  },
  {
    id: 8,
    topic: 'Teorema del Valor Final',
    question:
      '¿Bajo qué condición matemática fundamental es estrictamente válido aplicar el Teorema del Valor Final de Laplace para calcular el régimen permanente y(∞)?',
    mathPrompt: 'y(\\infty) = \\lim_{s \\to 0} s \\cdot Y(s)',
    options: [
      'Todos los polos de s·Y(s) deben ubicarse estrictamente en el semiplano izquierdo Re(s) < 0 (el sistema debe ser estable).',
      'El sistema debe poseer al menos un polo puramente imaginario en ±j·ω.',
      'La función de transferencia debe ser impropia con más ceros que polos.',
      'La señal de entrada debe ser necesariamente una función rampa unitaria.',
    ],
    correctIndex: 0,
    explanation:
      'El Teorema del Valor Final asume que el límite en el tiempo existe y es finito. Si el sistema es inestable o contiene polos oscilatorios sin amortiguar sobre el eje imaginario (ej. un oscilador senoidal), la función s·Y(s) en s=0 entregará un valor numérico erróneo porque en el tiempo la señal oscila o diverge.',
    mathExplanation: '\\lim_{t \\to \\infty} y(t) = \\lim_{s \\to 0} s Y(s) \\quad \\text{válido únicamente si } s Y(s) \\text{ es analítica en } \\text{Re}(s) \\ge 0.',
  },
  {
    id: 9,
    topic: 'Retardo Puro (Tiempo Muerto)',
    question:
      '¿Qué efecto provoca la presencia de un retardo puro (tiempo muerto) de transporte e^(-θ·s) en el comportamiento en frecuencia de un lazo de control?',
    mathPrompt: '\\mathcal{L}\\{f(t - \\theta)\\} = F(s) \\, e^{-\\theta s} \\quad \\implies \\quad |e^{-j\\omega\\theta}| = 1, \\quad \\angle e^{-j\\omega\\theta} = -\\omega\\theta',
    options: [
      'No altera la magnitud (|G(jω)| = 1), pero introduce un atraso de fase continuo que crece linealmente con la frecuencia (-ωθ), reduciendo severamente el Margen de Fase y tendiendo a desestabilizar el lazo.',
      'Reduce la ganancia en decibelios en altas frecuencias actuando como un filtro pasa-bajos pasivo.',
      'Aumenta el Margen de Fase permitiendo utilizar ganancias de control Kp arbitrariamente elevadas.',
      'Elimina automáticamente el error en estado estacionario sin necesidad de acción integral.',
    ],
    correctIndex: 0,
    explanation:
      'El retardo puro tiene magnitud estrictamente unitaria para cualquier frecuencia. Sin embargo, su fase decae sin cota: -ω·θ radianes (-57.3·ω·θ grados). Esta pérdida drástica de fase deteriora el margen de estabilidad y limita la ganancia máxima utilizable en el controlador.',
    mathExplanation: '\\angle G_{\\text{total}}(j\\omega) = \\angle G(j\\omega) - \\omega\\theta \\quad \\implies \\quad \\text{Disminuye } MF \\text{ y genera oscilaciones sostenidas.}',
  },
  {
    id: 10,
    topic: 'Sintonía de Ziegler-Nichols (Lazo Cerrado)',
    question:
      'En el método de sintonía en lazo cerrado de Ziegler-Nichols (oscilación sostenida), ¿cómo se obtienen la Ganancia Crítica (Kcr) y el Período Crítico (Pcr)?',
    mathPrompt: 'C(s) = K_p \\quad (K_i = 0, K_d = 0) \\quad \\implies \\quad K_p = K_{cr} \\text{ con oscilación pura}',
    options: [
      'Se anulan las acciones Ki y Kd, y se incrementa Kp gradualmente hasta que la salida oscila con amplitud constante y sostenida; Kcr es dicha ganancia y Pcr es el período medido de oscilación.',
      'Se mide el tiempo en que la respuesta al escalón en lazo abierto alcanza el 63.2% de su valor final.',
      'Se colocan los polos en el semiplano derecho para forzar una respuesta exponencial divergente.',
      'Se sintoniza primero Kd hasta eliminar el ruido y luego se duplica Ki periódicamente.',
    ],
    correctIndex: 0,
    explanation:
      'El método experimental en lazo cerrado de Ziegler-Nichols lleva el sistema a la estabilidad marginal utilizando únicamente control proporcional. En Kp = Kcr, los polos de lazo cerrado tocan el eje imaginario jω_cr, y Pcr = 2π / ω_cr es el período de la onda sinusoidal resultante.',
    mathExplanation: 'K_p = 0.6 K_{cr}, \\quad T_i = 0.5 P_{cr} \\implies K_i = \\frac{K_p}{T_i}, \\quad T_d = 0.125 P_{cr} \\implies K_d = K_p T_d',
  },
];

interface GlossaryTerm {
  term: string;
  category: 'fundamentos' | 'tiempo' | 'frecuencia' | 'control';
  mathFormula?: string;
  definition: string;
  relevance: string;
}

const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    term: 'Función de Transferencia G(s)',
    category: 'fundamentos',
    mathFormula: 'G(s) = \\frac{Y(s)}{R(s)} = \\frac{b_m s^m + \\dots + b_0}{a_n s^n + \\dots + a_0}',
    definition: 'Cociente algebraico entre la Transformada de Laplace de la salida y de la entrada bajo condiciones iniciales rigurosamente nulas.',
    relevance: 'Caracteriza la dinámica intrínseca del sistema físico, independiente de la excitación aplicada.',
  },
  {
    term: 'Polos y Ceros',
    category: 'fundamentos',
    mathFormula: 'D(s) = 0 \\implies \\text{Polos}, \\quad N(s) = 0 \\implies \\text{Ceros}',
    definition: 'Los polos son las raíces del denominador (determinan los modos naturales y la estabilidad); los ceros son las raíces del numerador (modifican las amplitudes de los modos y la fase).',
    relevance: 'La parte real de los polos en lazo cerrado define si el sistema es estable (Re < 0), marginal (Re = 0) o inestable (Re > 0).',
  },
  {
    term: 'Constante de Tiempo (τ)',
    category: 'tiempo',
    mathFormula: '\\tau = R C = \\frac{L}{R} = \\frac{a_1}{a_0} \\quad \\implies \\quad y(\\tau) = 0.632 \\, y(\\infty)',
    definition: 'Tiempo requerido para que la respuesta al escalón de un sistema de primer orden alcance el 63.2% de su excursión final.',
    relevance: 'Determina la rapidez del proceso: tras 4τ se alcanza el 98% del valor final (criterio estándar de establecimiento ts al 2%).',
  },
  {
    term: 'Retardo Puro / Tiempo Muerto (θ)',
    category: 'tiempo',
    mathFormula: 'G(s) = \\frac{K}{\\tau s + 1} e^{-\\theta s}',
    definition: 'Lapso finito durante el cual una perturbación o acción de control no produce ningún efecto medible en la salida del proceso.',
    relevance: 'Típico en transporte de fluidos, cintas transportadoras e intercambiadores térmicos. Resta fase (-ωθ) y desestabiliza el control.',
  },
  {
    term: 'Factor de Amortiguamiento (ζ)',
    category: 'tiempo',
    mathFormula: '\\zeta = \\frac{a_1}{2\\sqrt{a_2 a_0}} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}',
    definition: 'Razón adimensional que indica la disipación energética relativa de un sistema oscilatorio de segundo orden.',
    relevance: 'Si 0 < ζ < 1 es subamortiguado con sobrepico; si ζ = 1 es críticamente amortiguado (el más veloz sin oscilar); si ζ > 1 es sobreamortiguado.',
  },
  {
    term: 'Frecuencia Natural no Amortiguada (ωn)',
    category: 'tiempo',
    mathFormula: '\\omega_n = \\sqrt{a_0 / a_2} = \\frac{1}{\\sqrt{LC}}',
    definition: 'Frecuencia a la que oscilaría libremente el sistema si el amortiguamiento fuese nulo (ζ = 0).',
    relevance: 'Escala el eje temporal: cuanto mayor sea ωn, más veloces serán todos los transitorios.',
  },
  {
    term: 'Sobrepico Porcentual (Mp %)',
    category: 'tiempo',
    mathFormula: 'M_p\\% = 100 \\cdot e^{-\\frac{\\zeta \\pi}{\\sqrt{1 - \\zeta^2}}}',
    definition: 'Máxima excursión de la salida por encima del valor final en régimen permanente durante la respuesta al escalón.',
    relevance: 'Métrica crítica de diseño: un sobreimpulso excesivo puede dañar componentes mecánicos o saturar actuadores.',
  },
  {
    term: 'Tiempo de Establecimiento al 2% (ts)',
    category: 'tiempo',
    mathFormula: 't_{s2\\%} \\approx \\frac{4}{\\zeta \\omega_n} = \\frac{4}{\\sigma} \\quad (\\text{2º orden}) \\quad \\text{ó} \\quad t_s \\approx 4\\tau \\quad (\\text{1er orden})',
    definition: 'Tiempo transcurrido desde la aplicación del escalón hasta que la salida entra y permanece dentro de la banda de tolerancia de ±2%.',
    relevance: 'Define el tiempo necesario para considerar que el proceso ha alcanzado un estado productivo estacionario.',
  },
  {
    term: 'Frecuencia de Corte (-3 dB / ωc)',
    category: 'frecuencia',
    mathFormula: '|G(j\\omega_c)| = \\frac{|G(0)|}{\\sqrt{2}} \\implies 20\\log_{10}|G(j\\omega_c)| = 20\\log_{10}|G(0)| - 3\\,\\text{dB}',
    definition: 'Frecuencia angular a la cual la potencia de salida cae al 50% de su valor en continua (caída de -3 dB en tensión).',
    relevance: 'Delimita el ancho de banda efectivo del sistema; para frecuencias superiores las señales son atenuadas progresivamente.',
  },
  {
    term: 'Margen de Fase (MF) y Margen de Ganancia (MG)',
    category: 'frecuencia',
    mathFormula: 'MF = 180^\\circ + \\angle G(j\\omega_{gc}), \\quad MG = -20\\log_{10}|G(j\\omega_{pc})|',
    definition: 'Distancias de seguridad de la respuesta en frecuencia de lazo abierto respecto al punto crítico de inestabilidad (-1 + j0).',
    relevance: 'Garantizan que variaciones en los parámetros físicos del proceso no provoquen inestabilidad en el sistema real.',
  },
  {
    term: 'Control PID (Proporcional-Integral-Derivativo)',
    category: 'control',
    mathFormula: 'u(t) = K_p \\, e(t) + K_i \\int_0^t e(\\tau)\\,d\\tau + K_d \\frac{de(t)}{dt}',
    definition: 'Estructura clásica de realimentación que actúa sobre el presente (Kp), pasado acumulado (Ki) y futuro proyectado (Kd) del error.',
    relevance: 'Es el algoritmo de control industrial más utilizado en el mundo, presente en más del 90% de los lazos de control de procesos.',
  },
  {
    term: 'Error en Estado Estacionario (ess)',
    category: 'control',
    mathFormula: 'e_{ss} = \\lim_{t \\to \\infty} e(t) = \\lim_{s \\to 0} s \\, E(s) = \\lim_{s \\to 0} \\frac{s \\, R(s)}{1 + C(s)G(s)}',
    definition: 'Diferencia persistente entre la referencia deseada r(t) y la salida medida y(t) una vez extinguidos todos los transitorios.',
    relevance: 'Determina la precisión del servomecanismo o proceso. Se anula ante escalón añadiendo acción integral (Ki/s).',
  },
];

export const GlossaryQuizModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'glosario'>('quiz');

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Glossary State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Score calculation
  const { answeredCount, correctCount } = useMemo(() => {
    let answered = 0;
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] !== undefined) {
        answered++;
        if (selectedAnswers[q.id] === q.correctIndex) {
          correct++;
        }
      }
    });
    return { answeredCount: answered, correctCount: correct };
  }, [selectedAnswers]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentQuestionIdx(0);
  };

  // Filtered glossary
  const filteredTerms = useMemo(() => {
    return GLOSSARY_DATA.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relevance.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const currentQ = QUIZ_QUESTIONS[currentQuestionIdx];
  const isCurrentAnswered = selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Verificación de Conocimiento & Diccionario Técnico</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo: Glosario y Autoevaluación de Cátedra
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Cuestionario dinámico interactivo con <strong className="text-indigo-300">10 preguntas fundamentales</strong> de ingeniería de control con resolución demostrativa en KaTeX y glosario técnico con motor de búsqueda en tiempo real.
            </p>
          </div>

          {/* Module Switcher Buttons */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Autoevaluación ({answeredCount}/10)</span>
            </button>
            <button
              onClick={() => setActiveTab('glosario')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'glosario'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glosario Técnico ({GLOSSARY_DATA.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AUTOEVALUACIÓN DINÁMICA */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Progress & Score Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">
                  Progreso del Cuestionario
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Pregunta {currentQuestionIdx + 1} de {QUIZ_QUESTIONS.length} ({answeredCount} respondidas)
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Puntaje:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {correctCount} / {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({Math.round((correctCount / QUIZ_QUESTIONS.length) * 100)}%)
                </span>
              </div>

              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
                title="Reiniciar cuestionario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Question Index Pills Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCorrect = selectedAnswers[q.id] === q.correctIndex;
              const isCurrent = idx === currentQuestionIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all shrink-0 flex items-center justify-center border ${
                    isCurrent
                      ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                      : 'border-slate-800'
                  } ${
                    !isAnswered
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : isCorrect
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80 text-[10px] font-mono uppercase tracking-wider font-bold">
                Pregunta {currentQ.id} · {currentQ.topic}
              </span>
              <span className="text-xs text-slate-400">
                Selecciona una alternativa para comprobar instantáneamente.
              </span>
            </div>

            <h3 className="text-base font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {currentQ.mathPrompt && (
              <div className="py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-850 text-cyan-300 text-xs overflow-x-auto">
                <MathView math={currentQ.mathPrompt} block />
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;
                const answered = selectedAnswers[currentQ.id] !== undefined;

                let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850';
                if (answered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-medium';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/40 border-rose-600 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950 border-slate-850 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={answered}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                    {answered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {answered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer */}
            {isCurrentAnswered && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  {selectedAnswers[currentQ.id] === currentQ.correctIndex ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Respuesta Correcta! Rigor conceptual comprobado.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>Respuesta incorrecta. Analicemos la deducción teórica:</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>

                {currentQ.mathExplanation && (
                  <div className="py-2 text-cyan-300 text-xs">
                    <MathView math={currentQ.mathExplanation} block />
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                disabled={currentQuestionIdx === QUIZ_QUESTIONS.length - 1}
                onClick={() => setCurrentQuestionIdx((p) => Math.min(QUIZ_QUESTIONS.length - 1, p + 1))}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-sm"
              >
                <span>Siguiente Pregunta</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOSARIO TÉCNICO CON BUSCADOR */}
      {activeTab === 'glosario' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar término clave, fórmula, polo, sobrepico, margen de fase, etc..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'fundamentos', label: 'Fundamentos' },
                { id: 'tiempo', label: 'Dominio Temporal' },
                { id: 'frecuencia', label: 'Frecuencia (Bode)' },
                { id: 'control', label: 'Control PID' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glossary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.term}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-slate-950 text-indigo-400 border border-indigo-500/30">
                      {item.category}
                    </span>
                  </div>

                  {item.mathFormula && (
                    <div className="py-2 px-3 rounded-lg bg-slate-950 border border-slate-850 overflow-x-auto text-cyan-300 text-xs">
                      <MathView math={item.mathFormula} block />
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-850 text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-semibold">Importancia Práctica: </span>
                  {item.relevance}
                </div>
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-slate-900 border border-slate-800">
              No se encontraron términos que coincidan con &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
