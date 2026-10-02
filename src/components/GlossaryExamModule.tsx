import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Calculator,
  Compass,
  Zap,
} from 'lucide-react';
import { MathView } from './MathView';

interface GlossaryTerm {
  term: string;
  category: 'fundamentos' | 'tiempo' | 'frecuencia' | 'control';
  symbol?: string;
  mathFormula?: string;
  definition: string;
  relevance: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Función de Transferencia G(s)',
    category: 'fundamentos',
    symbol: 'G(s)',
    mathFormula: 'G(s) = \\frac{Y(s)}{R(s)} = \\frac{b_m s^m + \\dots + b_0}{a_n s^n + \\dots + a_0}',
    definition: 'Cociente algebraico entre la Transformada de Laplace de la salida y de la entrada bajo condiciones iniciales rigurosamente nulas.',
    relevance: 'Caracteriza la dinámica intrínseca del sistema físico, independiente de la excitación aplicada.',
  },
  {
    term: 'Polo de un Sistema',
    category: 'fundamentos',
    symbol: 'p_i',
    mathFormula: 'D(s) = 0 \\implies (s - p_1)(s - p_2)\\dots(s - p_n) = 0',
    definition: 'Raíz del polinomio denominador de la función de transferencia donde la magnitud |G(s)| tiende a infinito.',
    relevance: 'La parte real de los polos determina la velocidad de decaimiento y la estabilidad BIBO (deben situarse en el semiplano izquierdo Re(s) < 0).',
  },
  {
    term: 'Cero de un Sistema',
    category: 'fundamentos',
    symbol: 'z_i',
    mathFormula: 'N(s) = 0 \\implies (s - z_1)(s - z_2)\\dots(s - z_m) = 0',
    definition: 'Raíz del polinomio numerador donde la transmisión de señal hacia la salida se anula idénticamente.',
    relevance: 'Modifican las amplitudes de los modos naturales e introducen adelantos de fase o efectos de fase no mínima.',
  },
  {
    term: 'Constante de Tiempo (τ)',
    category: 'tiempo',
    symbol: '\\tau',
    mathFormula: '\\tau = R C \\quad \\text{ó} \\quad \\tau = \\frac{L}{R} \\quad \\text{ó} \\quad \\tau = \\frac{a_1}{a_0}',
    definition: 'Tiempo requerido para que la respuesta al escalón de un sistema de primer orden alcance el 63.2% de su valor final.',
    relevance: 'Define la celeridad del sistema. Tras 4 constantes de tiempo (4τ) el sistema alcanza el 98.2% del estado estacionario.',
  },
  {
    term: 'Ganancia Estacionaria (K)',
    category: 'tiempo',
    symbol: 'K',
    mathFormula: 'K = \\lim_{s \\to 0} G(s) = \\frac{y(\\infty)}{u(\\infty)}',
    definition: 'Relación entre la variación de la salida y la variación de la entrada una vez extinguidos todos los transitorios.',
    relevance: 'Escalar que multiplica la respuesta forzada. Para entrada escalón unitario, el valor final es exactamente K.',
  },
  {
    term: 'Frecuencia Natural no Amortiguada (ωn)',
    category: 'tiempo',
    symbol: '\\omega_n',
    mathFormula: '\\omega_n = \\sqrt{a_0 / a_2} = \\frac{1}{\\sqrt{LC}}',
    definition: 'Frecuencia angular a la cual oscilaría libremente un sistema de segundo orden si no existiese disipación energética.',
    relevance: 'Parámetro de diseño clave: mayor ωn implica transitorios más veloces pero mayor demanda de ancho de banda.',
  },
  {
    term: 'Factor de Amortiguamiento (ζ)',
    category: 'tiempo',
    symbol: '\\zeta',
    mathFormula: '\\zeta = \\frac{a_1}{2\\sqrt{a_2 a_0}} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}',
    definition: 'Razón adimensional entre el amortiguamiento real del sistema y el amortiguamiento crítico necesario para evitar oscilaciones.',
    relevance: 'Si 0 ≤ ζ < 1 es subamortiguado; si ζ = 1 es críticamente amortiguado; si ζ > 1 es sobreamortiguado; si ζ < 0 es inestable.',
  },
  {
    term: 'Sobrepico Porcentual (Mp %)',
    category: 'tiempo',
    symbol: 'M_p',
    mathFormula: 'M_p = e^{-\\frac{\\pi \\zeta}{\\sqrt{1 - \\zeta^2}}} \\times 100\\%',
    definition: 'Máxima excursión de la salida por encima de su valor final en régimen permanente durante la respuesta al escalón.',
    relevance: 'Métrica crítica de calidad en servomecanismos: un sobreimpulso excesivo puede dañar componentes mecánicos o saturar actuadores.',
  },
  {
    term: 'Tiempo de Establecimiento al 2% (ts)',
    category: 'tiempo',
    symbol: 't_s',
    mathFormula: 't_s \\approx \\frac{4}{\\sigma} = \\frac{4}{\\zeta \\omega_n} \\quad (\\text{2º orden}) \\quad \\text{ó} \\quad t_s \\approx 4\\tau \\quad (\\text{1er orden})',
    definition: 'Tiempo transcurrido desde la aplicación del escalón hasta que la salida se confina definitivamente dentro del ±2% de su valor final.',
    relevance: 'Determina cuándo el proceso industrial puede considerarse listo para la siguiente operación.',
  },
  {
    term: 'Frecuencia de Corte (-3 dB / ωc)',
    category: 'frecuencia',
    symbol: '\\omega_c',
    mathFormula: '|G(j\\omega_c)| = \\frac{|G(0)|}{\\sqrt{2}} \\implies 20\\log_{10}|G(j\\omega_c)| = 20\\log_{10}|G(0)| - 3\\,\\text{dB}',
    definition: 'Frecuencia en la cual la potencia de salida cae a la mitad de la potencia de baja frecuencia.',
    relevance: 'En circuitos RC/RL coincide exactamente con 1/τ, donde el desfase introducido es de -45°.',
  },
  {
    term: 'Margen de Fase (MF)',
    category: 'frecuencia',
    symbol: 'MF',
    mathFormula: 'MF = 180^\\circ + \\angle G(j\\omega_{gc}) \\quad \\text{donde } |G(j\\omega_{gc})| = 1\\,(0\\,\\text{dB})',
    definition: 'Cantidad de atraso de fase adicional a la frecuencia de cruce de ganancia que llevaría al sistema al límite de inestabilidad.',
    relevance: 'Un margen de fase saludable en la industria oscila típicamente entre 45° y 60°.',
  },
  {
    term: 'Margen de Ganancia (MG)',
    category: 'frecuencia',
    symbol: 'MG',
    mathFormula: 'MG = -20\\log_{10}|G(j\\omega_{pc})| \\quad \\text{donde } \\angle G(j\\omega_{pc}) = -180^\\circ',
    definition: 'Factor en decibelios por el cual se puede incrementar la ganancia de lazo antes de que el lazo cerrado se vuelva inestable.',
    relevance: 'Se exige convencionalmente un MG superior a +6 dB para tolerar variaciones térmicas o tolerancias de componentes.',
  },
  {
    term: 'Acción de Control Integral (Ki / s)',
    category: 'control',
    symbol: 'K_i / s',
    mathFormula: 'u_I(t) = K_i \\int_0^t e(\\tau)\\,d\\tau',
    definition: 'Término de control que acumula el historial del error a lo largo del tiempo.',
    relevance: 'Aumenta el tipo del sistema en 1, garantizando error en régimen permanente estrictamente nulo (ess = 0) ante entradas escalón.',
  },
  {
    term: 'Acción de Control Derivativa (Kd · s)',
    category: 'control',
    symbol: 'K_d s',
    mathFormula: 'u_D(t) = K_d \\frac{de(t)}{dt}',
    definition: 'Término de control que anticipa la tendencia futura del error basándose en su velocidad de cambio instantánea.',
    relevance: 'Añade amortiguamiento dinámico efectivo al lazo cerrado, reduciendo sobrepicos y acelerando el asentamiento.',
  },
];

interface ExamProblem {
  id: number;
  title: string;
  statement: string;
  mathPrompt: string;
  type: 'numeric' | 'multiple';
  options?: string[];
  correctAnswer: string;
  tolerance?: number;
  unit?: string;
  hints: string[];
  solutionSteps: { step: string; math: string; desc: string }[];
}

const EXAM_PROBLEMS: ExamProblem[] = [
  {
    id: 1,
    title: 'Ejercicio 1: Identificación a partir de la Curva Temporal Escalón',
    statement:
      'Un ensayo experimental aplica un escalón de amplitud A = 2.0 V a un circuito RC. La salida estacionaria medida en osciloscopio es y(∞) = 6.0 V y se constata que la señal tarda exactamente t = 0.45 s en alcanzar 3.792 V (que corresponde al 63.2% de su excursión total). Calcule la ganancia estática K del sistema.',
    mathPrompt: 'K = \\frac{y(\\infty)}{A}',
    type: 'numeric',
    correctAnswer: '3.0',
    tolerance: 0.1,
    unit: 'adimensional (V/V)',
    hints: [
      'Recuerde que el valor final ante un escalón de amplitud A es y(∞) = K · A.',
      'Despeje K dividiendo el valor estacionario y(∞) entre la amplitud A del escalón.',
    ],
    solutionSteps: [
      {
        step: '1. Relación de Ganancia en Régimen Permanente',
        math: 'y(\\infty) = \\lim_{s \\to 0} s \\cdot Y(s) = \\lim_{s \\to 0} s \\cdot \\left[\\frac{K}{\\tau s + 1} \\frac{A}{s}\\right] = K \\cdot A',
        desc: 'Por el Teorema del Valor Final de Laplace para entrada escalón.',
      },
      {
        step: '2. Despeje de la Ganancia Estática K',
        math: 'K = \\frac{y(\\infty)}{A} = \\frac{6.0\\,\\text{V}}{2.0\\,\\text{V}} = 3.0',
        desc: 'La ganancia del sistema es exactamente K = 3.0.',
      },
      {
        step: '3. Constante de Tiempo τ',
        math: '\\tau = 0.45\\,\\text{s} \\implies G(s) = \\frac{3.0}{0.45 s + 1}',
        desc: 'El tiempo de alcance del 63.2% equivale rigurosamente a una constante de tiempo τ = 0.45 s.',
      },
    ],
  },
  {
    id: 2,
    title: 'Ejercicio 2: Amortiguamiento y Sobrepico de un Sistema de 2º Orden',
    statement:
      'Considere un servomotor cuya función de transferencia canónica en lazo cerrado es T(s) = 25 / (s² + 6s + 25). Calcule el factor de amortiguamiento adimensional ζ del sistema.',
    mathPrompt: 's^2 + 2\\zeta \\omega_n s + \\omega_n^2 = s^2 + 6s + 25',
    type: 'numeric',
    correctAnswer: '0.6',
    tolerance: 0.02,
    unit: 'adimensional',
    hints: [
      'Compare el denominador con la forma canónica s² + 2ζωn s + ωn².',
      'Primero determine ωn = √25, y luego iguale 2ζωn = 6.',
    ],
    solutionSteps: [
      {
        step: '1. Identificación de la Frecuencia Natural ωn',
        math: '\\omega_n^2 = 25 \\implies \\omega_n = 5.0\\,\\text{rad/s}',
        desc: 'La frecuencia natural no amortiguada del sistema es 5 rad/s.',
      },
      {
        step: '2. Cálculo de Factor de Amortiguamiento ζ',
        math: '2\\zeta \\omega_n = 6 \\implies 2\\zeta(5) = 6 \\implies 10\\zeta = 6 \\implies \\zeta = 0.60',
        desc: 'Dado que 0 < ζ < 1, el sistema es subamortiguado y oscilatorio.',
      },
      {
        step: '3. Cálculo del Sobreimpulso Teórico Mp',
        math: 'M_p = e^{-\\frac{\\pi(0.6)}{\\sqrt{1 - 0.6^2}}} = e^{-\\frac{1.88496}{0.8}} = e^{-2.3562} \\approx 0.0948 \\implies 9.48\\%',
        desc: 'El sobreimpulso máximo esperado ante escalón es de 9.48%.',
      },
    ],
  },
  {
    id: 3,
    title: 'Ejercicio 3: Descomposición en Fracciones Parciales (Residuo C1)',
    statement:
      'Dada la salida en Laplace Y(s) = 10 / [s (s + 2)] resultante de excitar la planta G(s) = 10 / (s + 2) con un escalón unitario R(s) = 1/s, determine el coeficiente de régimen permanente C1 en la descomposición Y(s) = C1/s + C2/(s+2).',
    mathPrompt: 'C_1 = \\lim_{s \\to 0} [s \\cdot Y(s)]',
    type: 'numeric',
    correctAnswer: '5.0',
    tolerance: 0.1,
    unit: 'V o unidades de salida',
    hints: [
      'Use el método de los residuos de Heaviside: C1 = lim_{s->0} s · Y(s).',
      'Cancele el término s en el denominador y sustituya s = 0: 10 / (0 + 2).',
    ],
    solutionSteps: [
      {
        step: '1. Método de Residuos de Heaviside para Polo Simple en el Origen',
        math: 'C_1 = \\left. s \\cdot Y(s) \\right|_{s = 0} = \\left. \\frac{10}{s + 2} \\right|_{s = 0} = \\frac{10}{2} = 5.0',
        desc: 'El residuo correspondiente al término estacionario 1/s es exactamente 5.0.',
      },
      {
        step: '2. Cálculo del Residuo del Modo Transitorio C2',
        math: 'C_2 = \\left. (s + 2) \\cdot Y(s) \\right|_{s = -2} = \\left. \\frac{10}{s} \\right|_{s = -2} = \\frac{10}{-2} = -5.0',
        desc: 'El residuo del polo transitorio en s = -2 es -5.0.',
      },
      {
        step: '3. Transformada Inversa Temporal Exacta y(t)',
        math: 'y(t) = \\mathcal{L}^{-1}\\left\\{ \\frac{5}{s} - \\frac{5}{s + 2} \\right\\} = 5 - 5 e^{-2t} = 5(1 - e^{-2t}) \\quad (t \\ge 0)',
        desc: 'La respuesta temporal converge monótonamente a y(∞) = 5.',
      },
    ],
  },
  {
    id: 4,
    title: 'Ejercicio 4: Estabilidad en Lazo Cerrado con Acción Integral',
    statement:
      '¿Qué ventaja fundamental aporta incluir la acción integral Ki/s en un controlador PI o PID frente a un controlador puramente proporcional Kp para la regulación de procesos?',
    mathPrompt: 'e_{ss} = \\lim_{s \\to 0} s \\cdot E(s) = \\lim_{s \\to 0} \\frac{s \\cdot (1/s)}{1 + C(s)G(s)}',
    type: 'multiple',
    options: [
      'Aumenta la velocidad de respuesta inicial reduciendo el tiempo de levantamiento tr.',
      'Elimina rigurosamente el error en régimen permanente (ess = 0) ante entradas escalón aumentando el Tipo del lazo a 1.',
      'Disminuye el sobreimpulso máximo Mp amortiguando las oscilaciones de alta frecuencia.',
      'Permite operar el sistema en lazo abierto sin necesidad de sensor de realimentación.',
    ],
    correctAnswer: 'Elimina rigurosamente el error en régimen permanente (ess = 0) ante entradas escalón aumentando el Tipo del lazo a 1.',
    hints: [
      'Piense en el Teorema del Valor Final y qué ocurre con el polo en el origen s=0 cuando s tiende a cero.',
      'La integral acumula el área bajo el error hasta que este se hace exactamente cero.',
    ],
    solutionSteps: [
      {
        step: '1. Expresión del Error en Lazo Cerrado',
        math: 'E(s) = \\frac{1}{1 + C(s)G(s)} R(s) = \\frac{1}{1 + \\left(K_p + \\frac{K_i}{s}\\right) G(s)} \\frac{A}{s} = \\frac{A}{s + (s K_p + K_i) G(s)}',
        desc: 'La presencia de Ki/s en el denominador eleva la ganancia en DC a infinito.',
      },
      {
        step: '2. Aplicación del Teorema del Valor Final',
        math: 'e(\\infty) = \\lim_{s \\to 0} s E(s) = \\lim_{s \\to 0} \\frac{s A}{s + (s K_p + K_i) G(s)} = \\frac{0}{0 + K_i G(0)} = 0',
        desc: 'Siempre que el lazo sea estable y G(0) ≠ 0, el error de seguimiento estacionario es rigurosamente cero.',
      },
    ],
  },
];

export const GlossaryExamModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'glosario' | 'examen'>('glosario');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Exam state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [validatedStatus, setValidatedStatus] = useState<Record<number, 'correct' | 'incorrect' | null>>({});
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

  // Filter glossary
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relevance.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleValidate = (problem: ExamProblem) => {
    const rawInput = (userAnswers[problem.id] || '').trim();
    if (!rawInput) return;

    if (problem.type === 'multiple') {
      const isCorrect = rawInput === problem.correctAnswer;
      setValidatedStatus((prev) => ({ ...prev, [problem.id]: isCorrect ? 'correct' : 'incorrect' }));
      setShowSolution((prev) => ({ ...prev, [problem.id]: true }));
      return;
    }

    const numericVal = parseFloat(rawInput.replace(',', '.'));
    const targetVal = parseFloat(problem.correctAnswer);
    const tol = problem.tolerance || 0.05;

    const isCorrect = Math.abs(numericVal - targetVal) <= tol;
    setValidatedStatus((prev) => ({ ...prev, [problem.id]: isCorrect ? 'correct' : 'incorrect' }));
    setShowSolution((prev) => ({ ...prev, [problem.id]: true }));
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setShowSolution({});
    setValidatedStatus({});
    setExpandedHints({});
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Cátedra Universitaria & Evaluación Académica</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 10: Glosario Académico y Verificador de Exámenes
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Enciclopedia técnica de conceptos fundamentales de ingeniería de control automático con formulación rigurosa en KaTeX, junto con un verificador interactivo de problemas de examen universitario paso a paso.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('glosario')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'glosario'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glosario Técnico ({GLOSSARY_TERMS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('examen')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'examen'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Verificador de Exámenes ({EXAM_PROBLEMS.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GLOSARIO */}
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
                placeholder="Buscar término, fórmula, polo, tau, margen de fase, etc..."
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

          {/* Cards Grid */}
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

      {/* TAB 2: VERIFICADOR DE EXÁMENES */}
      {activeTab === 'examen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Pruebe su conocimiento resolviendo ejercicios típicos de examen. Ingrese su resultado numérico o seleccione la opción adecuada y verifique su procedimiento.
            </div>
            <button
              onClick={handleResetExam}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Respuestas</span>
            </button>
          </div>

          <div className="space-y-5">
            {EXAM_PROBLEMS.map((problem) => {
              const currentInput = userAnswers[problem.id] || '';
              const status = validatedStatus[problem.id];
              const isSolutionOpen = showSolution[problem.id];
              const isHintOpen = expandedHints[problem.id];

              return (
                <div
                  key={problem.id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>{problem.title}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Tipo: {problem.type === 'numeric' ? 'Numérico con Tolerancia' : 'Selección Conceptual'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {problem.statement}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-cyan-300 text-xs">
                    <MathView math={problem.mathPrompt} block />
                  </div>

                  {/* Hints collapsible */}
                  <div>
                    <button
                      onClick={() =>
                        setExpandedHints((p) => ({ ...p, [problem.id]: !p[problem.id] }))
                      }
                      className="text-xs text-amber-400 flex items-center gap-1 hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isHintOpen ? 'Ocultar Pistas' : 'Ver Pistas Académicas'}</span>
                      {isHintOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isHintOpen && (
                      <ul className="mt-2 pl-4 list-disc space-y-1 text-xs text-amber-300/90 bg-amber-950/20 p-3 rounded-lg border border-amber-900/30">
                        {problem.hints.map((hint, hIdx) => (
                          <li key={hIdx}>{hint}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Input form */}
                  <div className="pt-2">
                    {problem.type === 'numeric' ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-xs text-slate-300 font-medium">
                          Tu Respuesta:
                        </label>
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [problem.id]: e.target.value,
                            }))
                          }
                          placeholder={`Ej: ${problem.correctAnswer}`}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500 w-36"
                        />
                        {problem.unit && (
                          <span className="text-xs text-slate-500 font-mono">
                            {problem.unit}
                          </span>
                        )}
                        <button
                          onClick={() => handleValidate(problem)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          Verificar Respuesta
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-300 font-medium mb-1">
                          Seleccione la opción correcta:
                        </div>
                        {problem.options?.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              currentInput === opt
                                ? 'bg-indigo-950/40 border-indigo-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`prob-${problem.id}`}
                              checked={currentInput === opt}
                              onChange={() =>
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [problem.id]: opt,
                                }))
                              }
                              className="mt-0.5 text-indigo-600 focus:ring-0"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                        <div className="pt-2">
                          <button
                            onClick={() => handleValidate(problem)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          >
                            Verificar Respuesta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Badge */}
                  {status && (
                    <div
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                        status === 'correct'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {status === 'correct' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>
                          {status === 'correct'
                            ? '¡Respuesta correcta! Excelente rigor analítico.'
                            : `Respuesta incorrecta o fuera de tolerancia. Valor esperado: ${problem.correctAnswer}.`}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setShowSolution((p) => ({ ...p, [problem.id]: !p[problem.id] }))
                        }
                        className="text-xs underline font-semibold text-white hover:text-slate-200 shrink-0"
                      >
                        {isSolutionOpen ? 'Ocultar Solución' : 'Ver Solución Paso a Paso'}
                      </button>
                    </div>
                  )}

                  {/* Step by Step Solution */}
                  {isSolutionOpen && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mt-3">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Demostración Rigurosa en Pizarra KaTeX:
                      </div>
                      <div className="space-y-3">
                        {problem.solutionSteps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-850 space-y-1"
                          >
                            <div className="text-xs font-bold text-slate-200">
                              {step.step}
                            </div>
                            <div className="py-1 text-cyan-300 text-xs">
                              <MathView math={step.math} block />
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {step.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
