import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Timer,
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Send,
  Lock,
  Unlock,
  HelpCircle,
  Clock,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { MathView } from './MathView';

interface ExamField {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  correctValue: number;
  tolerancePercent: number; // e.g., 4%
  weight: number; // points weight
}

interface SolutionStep {
  title: string;
  math: string;
  explanation: string;
}

interface ExamProblem {
  id: string;
  type: string;
  title: string;
  context: string;
  problemStatement: string;
  systemG: string;
  fields: ExamField[];
  solutionSteps: SolutionStep[];
}

export const ExamModeModule: React.FC = () => {
  const [examState, setExamState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 60 minutes = 3600 seconds
  const [activeProblem, setActiveProblem] = useState<ExamProblem | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generator of Randomized University Control Exam Problems
  const generateRandomProblem = (): ExamProblem => {
    const problemTypes = ['second_order_specs', 'foptd_identification', 'pid_closed_loop', 'rlc_filter'];
    const chosenType = problemTypes[Math.floor(Math.random() * problemTypes.length)];

    if (chosenType === 'second_order_specs') {
      // G(s) = b0 / (s^2 + a1*s + a0) with underdamped response
      const a2 = 1;
      const wn = parseFloat((Math.floor(Math.random() * 5) + 3).toFixed(1)); // 3 to 7 rad/s
      const zeta = parseFloat((0.2 + Math.random() * 0.5).toFixed(2)); // 0.2 to 0.7
      const a0 = parseFloat((wn * wn).toFixed(2));
      const a1 = parseFloat((2 * zeta * wn).toFixed(2));
      const K = parseFloat((1 + Math.random() * 2).toFixed(1)); // 1 to 3
      const b0 = parseFloat((K * a0).toFixed(2));
      const A = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const beta = Math.acos(zeta);
      const tr = (Math.PI - beta) / wd;
      const tp = Math.PI / wd;
      const Mp = 100 * Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta));
      const ts2 = 4 / (zeta * wn);
      const yFinal = A * K;

      return {
        id: 'exam_2nd_order',
        type: 'Sistemas de Segundo Orden',
        title: 'Examen de Certamen: Especificaciones Temporales en Régimen Subamortiguado',
        context:
          'Se somete una planta electro-mecánica a una prueba de laboratorio con una entrada escalón de referencia r(t) = A·u(t).',
        problemStatement: `Dada la función de transferencia de la planta en lazo abierto G(s) y una excitación escalón de amplitud A = ${A}:`,
        systemG: `G(s) = \\frac{${b0}}{s^2 + ${a1}s + ${a0}}, \\quad R(s) = \\frac{${A}}{s}`,
        fields: [
          { id: 'wn', label: 'Frecuencia Natural no Amortiguada (wn)', symbol: '\\omega_n', unit: 'rad/s', correctValue: wn, tolerancePercent: 3, weight: 15 },
          { id: 'zeta', label: 'Factor de Amortiguamiento Relativo (ζ)', symbol: '\\zeta', unit: 'adimensional', correctValue: zeta, tolerancePercent: 3, weight: 15 },
          { id: 'wd', label: 'Frecuencia Natural Amortiguada (wd)', symbol: '\\omega_d', unit: 'rad/s', correctValue: wd, tolerancePercent: 4, weight: 15 },
          { id: 'tp', label: 'Tiempo de Pico (tp)', symbol: 't_p', unit: 's', correctValue: tp, tolerancePercent: 4, weight: 15 },
          { id: 'mp', label: 'Sobreimpulso Porcentual Máximo (Mp%)', symbol: 'M_p', unit: '%', correctValue: Mp, tolerancePercent: 5, weight: 20 },
          { id: 'ts', label: 'Tiempo de Asentamiento al 2% (ts 2%)', symbol: 't_s(2\\%)', unit: 's', correctValue: ts2, tolerancePercent: 4, weight: 20 },
        ],
        solutionSteps: [
          {
            title: '1. Identificación de Coeficientes de la Forma Canónica',
            math: `s^2 + 2\\zeta \\omega_n s + \\omega_n^2 = s^2 + ${a1}s + ${a0}`,
            explanation: `Se iguala término a término: \\omega_n = \\sqrt{${a0}} = ${wn.toFixed(3)}\\text{ rad/s}, y 2\\zeta \\omega_n = ${a1} \\implies \\zeta = \\frac{${a1}}{2(${wn.toFixed(3)})} = ${zeta.toFixed(3)}.`,
          },
          {
            title: '2. Frecuencia Amortiguada y Ángulo Beta',
            math: `\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2} = ${wn.toFixed(3)} \\sqrt{1 - ${zeta.toFixed(2)}^2} = ${wd.toFixed(4)}\\text{ rad/s}`,
            explanation: `Frecuencia real con la que oscila la respuesta transitoria en el tiempo.`,
          },
          {
            title: '3. Tiempo de Pico tp y Sobreimpulso Mp',
            math: `t_p = \\frac{\\pi}{\\omega_d} = \\frac{3.14159}{${wd.toFixed(4)}} = ${tp.toFixed(4)}\\text{ s}, \\quad M_p = 100 \\cdot e^{-\\frac{\\zeta \\pi}{\\sqrt{1 - \\zeta^2}}} = ${Mp.toFixed(2)}\\%`,
            explanation: `El sobrepico relativo depende exclusivamente de \\zeta y no de \\omega_n.`,
          },
          {
            title: '4. Tiempo de Asentamiento al 2%',
            math: `t_s(2\\%) = \\frac{4}{\\zeta \\omega_n} = \\frac{4}{${(zeta * wn).toFixed(4)}} = ${ts2.toFixed(4)}\\text{ s}`,
            explanation: `Tiempo necesario para que la señal permanezca dentro de la banda del \\pm 2\\% del valor final (y_final = ${yFinal.toFixed(2)}).`,
          },
        ],
      };
    } else if (chosenType === 'foptd_identification') {
      // FOPTD: K, tau, theta
      const K = parseFloat((1.5 + Math.random() * 3).toFixed(1));
      const tau = parseFloat((2 + Math.random() * 4).toFixed(1));
      const theta = parseFloat((0.8 + Math.random() * 1.5).toFixed(1));
      const A = 2.0;
      const yFinal = A * K;
      const y63 = 0.632 * yFinal;
      const t63 = theta + tau;

      return {
        id: 'exam_foptd',
        type: 'Modelado FOPTD y Retardo Puro',
        title: 'Examen de Certamen: Estimación de Parámetros FOPTD desde Curva Experimental',
        context:
          'En un banco de pruebas térmico industrial, se registra la curva de respuesta ante un escalón de entrada u(t) = 2.0·u(t).',
        problemStatement: `Del oscilograma experimental se extrae: la salida inicial permanece en reposo hasta t = ${theta.toFixed(2)} s; luego asciende y alcanza el valor y(t) = ${y63.toFixed(2)} en t = ${t63.toFixed(2)} s; estabilizándose finalmente en y(∞) = ${yFinal.toFixed(2)}.`,
        systemG: `G(s) = \\frac{K}{\\tau s + 1} e^{-\\theta s}`,
        fields: [
          { id: 'K', label: 'Ganancia Estática DC (K)', symbol: 'K', unit: 'adimensional', correctValue: K, tolerancePercent: 3, weight: 30 },
          { id: 'tau', label: 'Constante de Tiempo (τ)', symbol: '\\tau', unit: 's', correctValue: tau, tolerancePercent: 4, weight: 40 },
          { id: 'theta', label: 'Tiempo Muerto o Retardo Puro (θ)', symbol: '\\theta', unit: 's', correctValue: theta, tolerancePercent: 4, weight: 30 },
        ],
        solutionSteps: [
          {
            title: '1. Cálculo de la Ganancia Estática DC K',
            math: `K = \\frac{y(\\infty) - y(0)}{\\Delta u} = \\frac{${yFinal.toFixed(2)} - 0}{${A.toFixed(1)}} = ${K.toFixed(3)}`,
            explanation: 'Cociente entre la variación total en régimen permanente de la salida y la amplitud del escalón.',
          },
          {
            title: '2. Estimación del Tiempo Muerto θ',
            math: `\\theta = ${theta.toFixed(2)}\\,\\text{s}`,
            explanation: 'Instante en que la salida comienza a despegarse del reposo tras la inyección del escalón.',
          },
          {
            title: '3. Método del 63.2% para la Constante de Tiempo τ',
            math: `t_{63.2\\%} = \\theta + \\tau = ${t63.toFixed(2)}\\,\\text{s} \\implies \\tau = ${t63.toFixed(2)} - ${theta.toFixed(2)} = ${tau.toFixed(3)}\\,\\text{s}`,
            explanation: 'La constante de tiempo es el intervalo transcurrido desde que finaliza el retardo hasta alcanzar el 63.2% de la variación.',
          },
        ],
      };
    } else if (chosenType === 'pid_closed_loop') {
      // PID Loop: Kp, Ki, Kd and steady state error
      const plantK = 2.0;
      const plantTau = 3.0;
      const Kp = parseFloat((2 + Math.random() * 2).toFixed(1));
      const Ki = parseFloat((1 + Math.random() * 1.5).toFixed(1));
      const Kd = 0.5;

      // Characteristic polynomial in closed loop: (tau + K*Kd)s^2 + (1 + K*Kp)s + K*Ki
      const coefS2 = plantTau + plantK * Kd;
      const coefS1 = 1 + plantK * Kp;
      const coefS0 = plantK * Ki;
      const ess = 0; // Type 1 system due to integral action

      return {
        id: 'exam_pid_loop',
        type: 'Control PID en Lazo Cerrado',
        title: 'Examen de Certamen: Ecuación Característica y Error Permanente con Controlador PID',
        context:
          'Se implementa un controlador PID C(s) = Kp + Ki/s + Kd·s en lazo cerrado con realimentación unitaria H(s) = 1 sobre una planta de primer orden G(s) = 2.0 / (3.0s + 1).',
        problemStatement: `Con ganancias fijadas en Kp = ${Kp}, Ki = ${Ki} y Kd = ${Kd}, analice el polinomio característico de lazo cerrado 1 + C(s)G(s) = 0 y determine sus coeficientes normalizados [a2·s² + a1·s + a0 = 0] y el error estacionario ante escalón:`,
        systemG: `G(s) = \\frac{2.0}{3.0s + 1}, \\quad C(s) = ${Kp} + \\frac{${Ki}}{s} + ${Kd}s, \\quad H(s) = 1`,
        fields: [
          { id: 'coefS2', label: 'Coeficiente del término s² (a2)', symbol: 'a_2', unit: 'adimensional', correctValue: coefS2, tolerancePercent: 3, weight: 25 },
          { id: 'coefS1', label: 'Coeficiente del término s (a1)', symbol: 'a_1', unit: 'adimensional', correctValue: coefS1, tolerancePercent: 3, weight: 25 },
          { id: 'coefS0', label: 'Término independiente s⁰ (a0)', symbol: 'a_0', unit: 'adimensional', correctValue: coefS0, tolerancePercent: 3, weight: 25 },
          { id: 'ess', label: 'Error en Régimen Permanente (ess)', symbol: 'e_{ss}', unit: 'adimensional', correctValue: ess, tolerancePercent: 0.01, weight: 25 },
        ],
        solutionSteps: [
          {
            title: '1. Planteamiento de la Ecuación Característica',
            math: `1 + C(s)G(s) = 1 + \\left( \\frac{${Kd}s^2 + ${Kp}s + ${Ki}}{s} \\right) \\left( \\frac{2.0}{3.0s + 1} \\right) = 0`,
            explanation: 'Se multiplican ambos lados por s(3.0s + 1) para despejar el denominador común.',
          },
          {
            title: '2. Agrupación Polinómica Término a Término',
            math: `s(3.0s + 1) + 2.0(${Kd}s^2 + ${Kp}s + ${Ki}) = 0 \\implies (${coefS2.toFixed(2)})s^2 + (${coefS1.toFixed(2)})s + (${coefS0.toFixed(2)}) = 0`,
            explanation: `a2 = 3.0 + 2.0(${Kd}) = ${coefS2}, a1 = 1.0 + 2.0(${Kp}) = ${coefS1}, a0 = 2.0(${Ki}) = ${coefS0}.`,
          },
          {
            title: '3. Error en Régimen Permanente ante Escalón',
            math: `e_{ss} = \\lim_{s \\to 0} s E(s) = \\lim_{s \\to 0} \\frac{s \\cdot (1/s)}{1 + C(s)G(s)} = \\frac{1}{1 + \\infty} = 0`,
            explanation: 'La presencia de Ki/s convierte el lazo abierto en Sistema de Tipo 1, forzando un error estático rigurosamente nulo.',
          },
        ],
      };
    } else {
      // RLC filter
      const R = 40;
      const L = 0.1; // 100 mH
      const C = 0.0001; // 100 uF
      const wn = 1 / Math.sqrt(L * C); // 316.23 rad/s
      const zeta = (R / 2) * Math.sqrt(C / L); // 20 * 0.03162 = 0.6325

      return {
        id: 'exam_rlc_physics',
        type: 'Física de Circuitos Eléctricos',
        title: 'Examen de Certamen: Parámetros Canónicos de Filtro RLC Serie',
        context:
          'Se diseña una etapa de filtrado pasivo RLC serie con R = 40 Ω, L = 100 mH (0.10 H) y C = 100 µF (0.00010 F) con salida tomada en el condensador.',
        problemStatement: 'A partir de las Leyes de Kirchhoff y las impedancias de Laplace, calcule la frecuencia natural de oscilación wn y el factor de amortiguamiento físico ζ:',
        systemG: `G(s) = \\frac{V_C(s)}{V_{in}(s)} = \\frac{1}{LC s^2 + RC s + 1} = \\frac{\\frac{1}{LC}}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}}`,
        fields: [
          { id: 'wn', label: 'Frecuencia de Resonancia Natural (wn)', symbol: '\\omega_n', unit: 'rad/s', correctValue: wn, tolerancePercent: 3, weight: 50 },
          { id: 'zeta', label: 'Factor de Amortiguamiento Circuital (ζ)', symbol: '\\zeta', unit: 'adimensional', correctValue: zeta, tolerancePercent: 4, weight: 50 },
        ],
        solutionSteps: [
          {
            title: '1. Frecuencia Natural de Resonancia',
            math: `\\omega_n = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{0.10 \\cdot 0.00010}} = \\frac{1}{\\sqrt{0.00001}} = ${wn.toFixed(2)}\\,\\text{rad/s}`,
            explanation: 'Determinada exclusivamente por la reactancia inductiva y capacitiva.',
          },
          {
            title: '2. Factor de Amortiguamiento Físico',
            math: `2\\zeta \\omega_n = \\frac{R}{L} \\implies \\zeta = \\frac{R}{2L \\omega_n} = \\frac{R}{2} \\sqrt{\\frac{C}{L}} = \\frac{40}{2} \\sqrt{\\frac{0.00010}{0.10}} = 20 \\cdot 0.03162 = ${zeta.toFixed(4)}`,
            explanation: 'El resistor disipa energía en forma de calor joule, amortiguando la oscilación LC.',
          },
        ],
      };
    }
  };

  // Start exam handler
  const handleStartExam = () => {
    const problem = generateRandomProblem();
    setActiveProblem(problem);
    setUserInputs({});
    setTimeLeft(3600); // 60 minutes
    setIsTimeExpired(false);
    setExamStartTime(Date.now());
    setExamState('running');
  };

  // Timer countdown hook
  useEffect(() => {
    if (examState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimeExpired(true);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  // Finish and Grade Exam
  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (examStartTime) {
      setTimeSpent(Math.round((Date.now() - examStartTime) / 1000));
    }
    setExamState('finished');
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Grading calculation
  const gradeResults = useMemo(() => {
    if (!activeProblem || examState !== 'finished') return null;

    let totalPoints = 0;
    let earnedPoints = 0;

    const evaluatedFields = activeProblem.fields.map((field) => {
      totalPoints += field.weight;
      const rawInput = userInputs[field.id]?.trim()?.replace(',', '.') || '';
      const numInput = parseFloat(rawInput);
      const isProvided = !isNaN(numInput);

      let isCorrect = false;
      let errorPct = 100;

      if (isProvided) {
        if (field.correctValue === 0) {
          isCorrect = Math.abs(numInput) <= 0.05;
          errorPct = Math.abs(numInput) * 100;
        } else {
          errorPct = Math.abs((numInput - field.correctValue) / field.correctValue) * 100;
          isCorrect = errorPct <= field.tolerancePercent;
        }
      }

      if (isCorrect) {
        earnedPoints += field.weight;
      }

      return {
        ...field,
        userValue: isProvided ? numInput : null,
        userRaw: rawInput,
        isCorrect,
        errorPct,
      };
    });

    const scorePct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    // Chilean standard grading: 1.0 to 7.0, pass threshold 4.0 at 60%
    let universityGrade = 1.0;
    if (scorePct >= 60) {
      universityGrade = 4.0 + (3.0 * (scorePct - 60)) / 40;
    } else {
      universityGrade = 1.0 + (3.0 * scorePct) / 60;
    }

    const passed = universityGrade >= 4.0;

    return {
      totalPoints,
      earnedPoints,
      scorePct: parseFloat(scorePct.toFixed(1)),
      universityGrade: parseFloat(universityGrade.toFixed(1)),
      passed,
      evaluatedFields,
    };
  }, [activeProblem, examState, userInputs]);

  return (
    <div className="space-y-6">
      {/* Exam Header Banner */}
      <div className="rounded-xl border border-rose-900/60 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold tracking-wider uppercase font-mono">
              <ShieldAlert className="w-4 h-4" />
              <span>Entorno Seguro de Evaluación Universitaria</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
              <span>Modo Examen Oficial (60 Minutos)</span>
              {examState === 'running' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono animate-pulse">
                  EN CURSO
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Simulación estricta de certamen de cátedra con <strong>bloqueo total de fórmulas y tutoriales</strong>. Resuelve el ejercicio con lápiz y papel, ingresa tus resultados y obtén una calificación inmediata con informe de tolerancias.
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3 shrink-0">
            {examState === 'running' && (
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-mono font-bold text-xl shadow-lg transition-colors ${
                  timeLeft <= 300
                    ? 'border-rose-500 bg-rose-950 text-rose-400 animate-pulse'
                    : timeLeft <= 900
                    ? 'border-amber-500 bg-amber-950/60 text-amber-300'
                    : 'border-slate-700 bg-slate-900 text-cyan-300'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {examState === 'running' && (
              <button
                onClick={handleFinishExam}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Entregar Examen</span>
              </button>
            )}

            {examState === 'finished' && (
              <button
                onClick={handleStartExam}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rendir Otro Examen</span>
              </button>
            )}
          </div>
        </div>

        {/* Security / Formula Blocking Notice */}
        <div className="mt-4 pt-3 border-t border-rose-900/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              <strong>Bloqueo Activo:</strong> Fórmulas simbólicas, ayudas guiadas y glosario se encuentran inhabilitados durante la sesión evaluativa.
            </span>
          </div>
          <span className="font-mono text-slate-500 hidden sm:inline">
            Tolerancia numérica aceptada: ±3% a ±5%
          </span>
        </div>
      </div>

      {/* VIEW 1: IDLE / INSTRUCTIONS SCREEN */}
      {examState === 'idle' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center space-y-6 max-w-3xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Instrucciones del Certamen de Cátedra</h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Esta modalidad evalúa tus competencias analíticas en Ingeniería de Control en condiciones reales de examen universitario.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>Tiempo Límite</span>
              </div>
              <p className="text-slate-400">
                Dispones de exactamente <strong>60 minutos</strong> (1 hora). Al agotarse el cronómetro, la prueba se cerrará y calificará automáticamente.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Sin Formularios</span>
              </div>
              <p className="text-slate-400">
                Las deducciones y tablas auxiliares permanecen ocultas. Debes aplicar las fórmulas matemáticas de memoria.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Award className="w-4 h-4" />
                <span>Calificación 1.0 a 7.0</span>
              </div>
              <p className="text-slate-400">
                Aprobación con nota <strong>4.0 (60% de exigencia)</strong>. Tras entregar, se desbloquea la resolución completa paso a paso en KaTeX.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartExam}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Comenzar Examen de Control (Iniciar Temporizador)</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: EXAM IN PROGRESS (ACTIVE EVALUATION) */}
      {examState === 'running' && activeProblem && (
        <div className="space-y-6">
          {/* Problem Statement Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                {activeProblem.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeProblem.fields.length} Preguntas Numéricas
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{activeProblem.title}</h3>
              <p className="text-sm text-slate-300 mt-1">{activeProblem.context}</p>
              <p className="text-sm font-semibold text-slate-200 mt-2">{activeProblem.problemStatement}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <MathView math={activeProblem.systemG} display />
            </div>
          </div>

          {/* Form Fields for Student Input */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Ingreso de Respuestas Numéricas
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresa tus valores calculados con punto o coma decimal. No olvides respetar las unidades solicitadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProblem.fields.map((field, idx) => (
                <div key={field.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 font-mono">
                      {idx + 1}. {field.label}
                    </span>
                    <span className="text-[11px] text-indigo-400 font-semibold font-mono">
                      {field.weight} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-cyan-300 text-xs shrink-0">
                      <MathView math={field.symbol} />
                    </div>
                    <input
                      type="text"
                      placeholder={`Ej: 0.00`}
                      value={userInputs[field.id] || ''}
                      onChange={(e) =>
                        setUserInputs((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-mono shrink-0 min-w-10">
                      {field.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleFinishExam}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar y Calificar Examen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FINISHED & GRADED EXAM SCREEN */}
      {examState === 'finished' && gradeResults && activeProblem && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Certificate / Result Card */}
          <div
            className={`rounded-xl border p-6 text-center space-y-4 shadow-xl ${
              gradeResults.passed
                ? 'border-emerald-700 bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950'
                : 'border-rose-700 bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                gradeResults.passed
                  ? 'bg-emerald-900 text-emerald-300 border border-emerald-600'
                  : 'bg-rose-900 text-rose-300 border border-rose-600'
              }`}
            >
              {gradeResults.passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest font-bold text-slate-400">
                Resultado Oficial de Evaluación
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                {gradeResults.passed ? '¡Aprobado con Éxito!' : 'Examen No Aprobado'}
              </h3>
              <p className="text-xs text-slate-300">
                Tiempo empleado:{' '}
                <strong>
                  {Math.floor(timeSpent / 60)} min {timeSpent % 60} s
                </strong>{' '}
                de los 60 minutos permitidos.
              </p>
            </div>

            {/* Score Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 min-w-32">
                <span className="text-[11px] text-slate-400 block font-mono">Nota Final</span>
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    gradeResults.universityGrade >= 4.0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {gradeResults.universityGrade.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 block">Escala 1.0 a 7.0</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 min-w-32">
                <span className="text-[11px] text-slate-400 block font-mono">Puntaje Obtenido</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-300">
                  {gradeResults.scorePct}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {gradeResults.earnedPoints} / {gradeResults.totalPoints} pts
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 min-w-32">
                <span className="text-[11px] text-slate-400 block font-mono">Estado</span>
                <span
                  className={`text-xl font-bold font-mono mt-1 block ${
                    gradeResults.passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {gradeResults.passed ? 'APROBADO' : 'REPROBADO'}
                </span>
                <span className="text-[10px] text-slate-500 block">Exigencia 60%</span>
              </div>
            </div>
          </div>

          {/* Detailed Item by Item Evaluation */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Desglose Detallado de Respuestas y Tolerancias
                </h4>
                <span className="text-xs text-slate-400">
                  Comparación estricta entre tu respuesta ingresada y el valor analítico exacto
                </span>
              </div>
              <span className="text-xs text-indigo-400 font-mono font-bold">
                Tolerancia de Cátedra: ±3% a ±5%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Parámetro</th>
                    <th className="py-2.5 px-3">Tu Respuesta</th>
                    <th className="py-2.5 px-3">Valor Exacto</th>
                    <th className="py-2.5 px-3">Error Relativo</th>
                    <th className="py-2.5 px-3">Puntaje</th>
                    <th className="py-2.5 px-3 text-center">Veredicto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gradeResults.evaluatedFields.map((field) => (
                    <tr key={field.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3 text-slate-200">
                        <div className="font-bold flex items-center gap-1.5">
                          <MathView math={field.symbol} />
                          <span>{field.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={field.userValue !== null ? 'text-white' : 'text-slate-500 italic'}>
                          {field.userValue !== null
                            ? `${field.userValue} ${field.unit}`
                            : 'Sin responder'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-bold">
                        {field.correctValue.toFixed(3)} {field.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={
                            field.errorPct <= field.tolerancePercent
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400'
                          }
                        >
                          {field.userValue !== null ? `${field.errorPct.toFixed(2)}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={field.isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {field.isCorrect ? `${field.weight} pts` : '0 pts'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {field.isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Correcto</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                            <XCircle className="w-3 h-3" />
                            <span>Incorrecto</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* UNLOCKED STEP-BY-STEP SOLUTION */}
          <div className="rounded-xl border border-indigo-900/60 bg-slate-900 p-6 space-y-4">
            <div className="border-b border-indigo-900/40 pb-3 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Solución Oficial Demostrativa Desbloqueada (Paso a Paso en KaTeX)
              </h4>
            </div>

            <div className="space-y-4">
              {activeProblem.solutionSteps.map((step, sIdx) => (
                <div key={sIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-300 font-mono block">
                    {step.title}
                  </span>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <MathView math={step.math} display />
                  </div>
                  <p className="text-xs text-slate-400">{step.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
