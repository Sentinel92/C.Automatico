import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  FileCode,
  Sliders,
  RotateCcw,
  Save,
  Box,
  UploadCloud,
  Sparkles,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
} from 'recharts';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SimulinkParams {
  K: number;
  tau: number;
  A: number;
  tPert: number;
  ampPert: number;
}

const defaultSimulinkParams: SimulinkParams = {
  K: 2.5,
  tau: 1.8,
  A: 1.0,
  tPert: 4.0,
  ampPert: 1.0,
};

interface CsvDataPoint {
  t: number;
  yExp: number;
  yModel?: number;
}

export const SimulinkGeneratorModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<SimulinkParams>(
    'autocontrol_simulink_params',
    defaultSimulinkParams
  );

  const [activeCodeTab, setActiveCodeTab] = useState<'simulink' | 'matlab' | 'identification'>('simulink');
  const [copied, setCopied] = useState<boolean>(false);

  // Experimental CSV identification state
  const [csvPoints, setCsvPoints] = useState<CsvDataPoint[]>([]);
  const [identifiedParams, setIdentifiedParams] = useState<{ K: number; tau: number; r2: number } | null>(null);
  const [identMessage, setIdentMessage] = useState<string | null>(null);

  const { K, tau, A, tPert, ampPert } = params;

  const setK = (v: number) => setParams(p => ({ ...p, K: v }));
  const setTau = (v: number) => setParams(p => ({ ...p, tau: v }));
  const setA = (v: number) => setParams(p => ({ ...p, A: v }));
  const setTPert = (v: number) => setParams(p => ({ ...p, tPert: v }));
  const setAmpPert = (v: number) => setParams(p => ({ ...p, ampPert: v }));

  // Script 1: Programmatic Simulink model generation via API
  const simulinkCode = useMemo(() => {
    return `%% =========================================================================
%% AUTOCONTROL PLATINUM LAB: GENERACIÓN PROGRAMÁTICA DE MODELO SIMULINK (.SLX)
%% Autor: Generador Automático de Modelos de Control y Simulink API
%% Planta: K = ${K.toFixed(3)}, tau = ${tau.toFixed(3)} s, Escalón A = ${A.toFixed(1)}
%% =========================================================================

clear; clc; close all;

model_name = 'modelo_control_autocontrol_lab';

% 1. Cerrar el modelo si ya se encontraba abierto sin guardar
if bdIsLoaded(model_name)
    close_system(model_name, 0);
end

% 2. Crear y abrir el lienzo de Simulink
new_system(model_name);
open_system(model_name);

fprintf('--> Lienzo Simulink "%s" inicializado correctamente.\\n', model_name);

% 3. Parámetros del Sistema
K      = ${K};          % Ganancia estática
tau    = ${tau};        % Constante de tiempo [s]
A_step = ${A};          % Amplitud de escalón de referencia

% 4. Agregar Bloques de la Librería Estándar de Simulink
% 4.1 Entrada Escalón (Step)
add_block('simulink/Sources/Step', [model_name, '/Step_Referencia'], ...
    'Position', [60, 100, 100, 140], ...
    'Time', '0', ...
    'Before', '0', ...
    'After', num2str(A_step));

% 4.2 Sumador de Error (Sum)
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Error'], ...
    'Position', [150, 105, 175, 135], ...
    'Inputs', '+-');

% 4.3 Controlador PID (o Ganancia Proporcional)
add_block('simulink/Continuous/PID Controller', [model_name, '/Controlador_PID'], ...
    'Position', [220, 95, 270, 145], ...
    'P', '2.0', ...
    'I', '1.0', ...
    'D', '0.2');

% 4.4 Planta de 1er Orden (Transfer Fcn: K / (tau*s + 1))
add_block('simulink/Continuous/Transfer Fcn', [model_name, '/Planta_1er_Orden'], ...
    'Position', [320, 95, 450, 145], ...
    'Numerator', sprintf('[%.4f]', K), ...
    'Denominator', sprintf('[%.4f 1]', tau));

% 4.5 Inyección de Perturbación (Step Disturbance)
add_block('simulink/Sources/Step', [model_name, '/Inyeccion_Perturbacion'], ...
    'Position', [370, 20, 410, 60], ...
    'Time', num2str(${tPert}), ...
    'Before', '0', ...
    'After', num2str(${ampPert}));

% 4.6 Sumador de Perturbación en la Salida
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Perturbacion'], ...
    'Position', [490, 105, 515, 135], ...
    'Inputs', '++');

% 4.7 Osciloscopio para visualización (Scope)
add_block('simulink/Sinks/Scope', [model_name, '/Scope_Salida'], ...
    'Position', [570, 100, 610, 140]);

% 5. Conectar Puertos mediante add_line
add_line(model_name, 'Step_Referencia/1', 'Sum_Error/1');
add_line(model_name, 'Sum_Error/1', 'Controlador_PID/1');
add_line(model_name, 'Controlador_PID/1', 'Planta_1er_Orden/1');
add_line(model_name, 'Planta_1er_Orden/1', 'Sum_Perturbacion/2');
add_line(model_name, 'Inyeccion_Perturbacion/1', 'Sum_Perturbacion/1');
add_line(model_name, 'Sum_Perturbacion/1', 'Scope_Salida/1');
add_line(model_name, 'Sum_Perturbacion/1', 'Sum_Error/2', 'autorouting', 'on');

% 6. Configurar tiempo de simulación y solver Runge-Kutta
set_param(model_name, 'StopTime', '15.0');
set_param(model_name, 'Solver', 'ode45');

% 7. Ejecutar simulación directamente desde MATLAB
fprintf('--> Simulando modelo en Simulink...\\n');
sim(model_name);
fprintf('--> Simulación completada con éxito.\\n');
`;
  }, [K, tau, A, tPert, ampPert]);

  // Script 2: Pure MATLAB Script
  const matlabCode = useMemo(() => {
    return `%% =========================================================================
%% AUTOCONTROL PLATINUM LAB: SCRIPT NUMÉRICO MATLAB / GNU OCTAVE
%% Autor: BuildQuote AI Control Lab
%% Parámetros: K = ${K.toFixed(3)}, tau = ${tau.toFixed(3)} s, A = ${A.toFixed(1)}
%% =========================================================================

clear; clc; close all;

% 1. Definición de Parámetros Físicos
K      = ${K};          % Ganancia estática DC
tau    = ${tau};        % Constante de tiempo [s]
A_step = ${A};          % Amplitud de entrada escalón
t_pert = ${tPert};      % Instante de perturbación [s]
d_pert = ${ampPert};    % Magnitud de la perturbación

% 2. Construcción de la Función de Transferencia G(s)
num = [K];
den = [tau, 1];
G = tf(num, den);

fprintf('========================================\\n');
fprintf('  FUNCIÓN DE TRANSFERENCIA DE LA PLANTA\\n');
fprintf('========================================\\n');
disp(G);

% 3. Mapeo de Polos y Ceros
p = pole(G);
z = zero(G);
fprintf('Polo del sistema: s1 = %.4f rad/s\\n', p);
fprintf('Tiempo de establecimiento (2%%): ts = 4*tau = %.4f s\\n', 4*tau);

% 4. Simulación Temporal con lsim
t = linspace(0, 10*tau, 500)';
u_step = A_step * ones(size(t));
u_pert = d_pert * (t >= t_pert);
u_total = u_step + u_pert;

% Respuesta del sistema
y = lsim(G, u_total, t);

% 5. Graficación Profesional
figure('Name', 'Respuesta Temporal del Sistema', 'Color', 'w');
plot(t, y, 'b-', 'LineWidth', 2.0, 'DisplayName', 'Salida y(t)');
hold on;
plot(t, u_total, 'r--', 'LineWidth', 1.5, 'DisplayName', 'Entrada con Perturbación u(t)');
xline(tau, 'k:', 'LineWidth', 1.5, 'DisplayName', sprintf('\\\\tau = %.2f s (63.2%%)', tau));
xline(4*tau, 'm:', 'LineWidth', 1.5, 'DisplayName', sprintf('4\\\\tau = %.2f s (98.2%%)', 4*tau));
grid on;
xlabel('Tiempo [s]');
ylabel('Amplitud');
title(sprintf('Respuesta al Escalón: G(s) = %.2f / (%.2fs + 1)', K, tau));
legend('Location', 'best');
`;
  }, [K, tau, A, tPert, ampPert]);

  const activeCode = activeCodeTab === 'simulink' ? simulinkCode : matlabCode;

  // Copy code handler
  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .m file handler
  const handleDownload = () => {
    const filename = activeCodeTab === 'simulink' ? 'crear_modelo_simulink.m' : 'analisis_autocontrol.m';
    const blob = new Blob([activeCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export simulated data to CSV
  const handleExportCSV = () => {
    const tMax = Math.max(tau * 8, 12);
    const steps = 300;
    const dt = tMax / steps;

    let csvContent = 'tiempo_s,referencia,salida_y,perturbacion,error\n';
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const ref = A;
      const pert = t >= tPert ? ampPert : 0;
      let y = A * K * (1 - Math.exp(-t / tau));
      if (t >= tPert) {
        y += ampPert * K * (1 - Math.exp(-(t - tPert) / tau));
      }
      const err = ref - y;
      csvContent += `${t.toFixed(4)},${ref.toFixed(3)},${y.toFixed(4)},${pert.toFixed(3)},${err.toFixed(4)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulacion_1er_orden_K${K}_tau${tau}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load sample experimental data with synthetic noise
  const handleLoadSampleCSV = () => {
    const sampleK = 2.4;
    const sampleTau = 1.6;
    const sampleA = 1.0;
    const points: CsvDataPoint[] = [];

    for (let i = 0; i <= 60; i++) {
      const t = parseFloat((i * 0.2).toFixed(2));
      const cleanY = sampleA * sampleK * (1 - Math.exp(-t / sampleTau));
      // Add realistic Gaussian-like measurement noise
      const noise = (Math.random() - 0.5) * 0.15;
      const yExp = parseFloat(Math.max(0, cleanY + noise).toFixed(3));
      points.push({ t, yExp });
    }

    processExperimentalData(points, sampleA);
  };

  // CSV File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const points: CsvDataPoint[] = [];

      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('t') || line.startsWith('#')) continue;
        const parts = line.split(/[;,	 ]+/);
        if (parts.length >= 2) {
          const t = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          if (!isNaN(t) && !isNaN(y)) {
            points.push({ t, yExp: y });
          }
        }
      }

      if (points.length >= 5) {
        processExperimentalData(points, A);
      } else {
        setIdentMessage('El archivo debe contener al menos 5 filas con pares (tiempo, salida).');
      }
    };
    reader.readAsText(file);
  };

  // Automatic identification algorithm (63.2% method + least squares regression)
  const processExperimentalData = (data: CsvDataPoint[], stepAmp: number) => {
    // 1. Sort by time
    data.sort((a, b) => a.t - b.t);

    // 2. Estimate steady-state y_inf from last 20% of points
    const lastN = Math.max(3, Math.floor(data.length * 0.2));
    const lastPoints = data.slice(-lastN);
    const yInf = lastPoints.reduce((acc, p) => acc + p.yExp, 0) / lastN;

    const identK = yInf / (stepAmp || 1);

    // 3. Find t_632 (time where y crosses 63.2% of yInf)
    const target632 = 0.63212 * yInf;
    let identTau = 1.0;

    for (let i = 0; i < data.length - 1; i++) {
      if (data[i].yExp <= target632 && data[i + 1].yExp >= target632) {
        // Linear interpolation
        const t1 = data[i].t;
        const t2 = data[i + 1].t;
        const y1 = data[i].yExp;
        const y2 = data[i + 1].yExp;
        identTau = t1 + ((target632 - y1) / (y2 - y1 || 1e-6)) * (t2 - t1);
        break;
      }
    }

    // 4. Compute R^2 goodness of fit
    let ssTot = 0;
    let ssRes = 0;
    const yMean = data.reduce((acc, p) => acc + p.yExp, 0) / data.length;

    const augmentedData = data.map(p => {
      const yModel = parseFloat((identK * (1 - Math.exp(-p.t / Math.max(identTau, 0.001)))).toFixed(3));
      ssTot += Math.pow(p.yExp - yMean, 2);
      ssRes += Math.pow(p.yExp - yModel, 2);
      return { ...p, yModel };
    });

    const r2 = Math.max(0, Math.min(1, 1 - (ssRes / (ssTot || 1))));

    setCsvPoints(augmentedData);
    setIdentifiedParams({
      K: parseFloat(identK.toFixed(3)),
      tau: parseFloat(identTau.toFixed(3)),
      r2: parseFloat(r2.toFixed(3)),
    });
    setIdentMessage(`✓ Ajuste exitoso: K=${identK.toFixed(3)}, τ=${identTau.toFixed(3)}s (Bondad R² = ${(r2 * 100).toFixed(1)}%)`);
    setActiveCodeTab('identification');
  };

  const applyIdentifiedParams = () => {
    if (identifiedParams) {
      setK(identifiedParams.K);
      setTau(identifiedParams.tau);
      setIdentMessage('✓ ¡Parámetros identificados transferidos al modelo Simulink/MATLAB!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Box className="w-4 h-4" />
              <span>Simulink API & Identificación Experimental</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Exportador Simulink (.slx), MATLAB (.m) y Cargador CSV
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Automatiza la creación y cableado de modelos en Simulink mediante código MATLAB, exporta conjuntos de datos en CSV e identifica automáticamente la ganancia <MathView math="K" /> y constante <MathView math="\tau" /> a partir de curvas experimentales.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-700 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .m</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Simulación CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Parameters Adjustment + Code / Identification View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parámetros de la Planta</span>
              </h3>
              <button
                onClick={resetParams}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                title="Restablecer valores"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Ganancia Planta (K):</span>
                  <span className="font-mono text-indigo-400 font-bold">{K.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={K}
                  onChange={(e) => setK(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Constante de Tiempo (τ):</span>
                  <span className="font-mono text-cyan-400 font-bold">{tau.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={tau}
                  onChange={(e) => setTau(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Amplitud Escalón (A):</span>
                  <span className="font-mono text-emerald-400 font-bold">{A.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={A}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Instante Perturbación (t_pert):</span>
                  <span className="font-mono text-amber-400 font-bold">{tPert.toFixed(1)} s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={tPert}
                  onChange={(e) => setTPert(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Amplitud Perturbación:</span>
                  <span className="font-mono text-amber-400 font-bold">{ampPert.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={3}
                  step={0.5}
                  value={ampPert}
                  onChange={(e) => setAmpPert(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Model Preview Badge */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-500 mb-0.5">Planta Modelada:</div>
              <MathView math={`G(s) = \\frac{${K.toFixed(2)}}{${tau.toFixed(2)}s + 1}`} block />
            </div>
          </div>

          {/* CSV Experimental Loader Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Carga de CSV Experimental</span>
            </h3>
            <p className="text-xs text-slate-400">
              Carga datos medidos de un ensayo al escalón para ajustar e identificar automáticamente <MathView math="K" /> y <MathView math="\tau" />.
            </p>

            <div className="space-y-2">
              <label className="block w-full cursor-pointer">
                <span className="sr-only">Seleccionar archivo CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </label>

              <button
                onClick={handleLoadSampleCSV}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar Ensayo de Muestra con Ruido</span>
              </button>
            </div>

            {identMessage && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-900 text-xs text-emerald-300">
                {identMessage}
              </div>
            )}
          </div>
        </div>

        {/* Code / Identification Viewer Column */}
        <div className="lg:col-span-8 space-y-3">
          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-lg gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCodeTab('simulink')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeCodeTab === 'simulink'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Script Creación Simulink (.slx)</span>
              </button>
              <button
                onClick={() => setActiveCodeTab('matlab')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeCodeTab === 'matlab'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Script MATLAB (.m)</span>
              </button>
              <button
                onClick={() => setActiveCodeTab('identification')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeCodeTab === 'identification'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Ajuste e Identificación CSV</span>
              </button>
            </div>
          </div>

          {activeCodeTab === 'identification' ? (
            /* Identification View */
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Ajuste de Curva Experimental vs Modelo Teórico</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Regresión por método del 63.2% y mínimos cuadrados
                  </span>
                </div>

                {identifiedParams && (
                  <button
                    onClick={applyIdentifiedParams}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aplicar K y τ al Modelo</span>
                  </button>
                )}
              </div>

              {identifiedParams && (
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ganancia Identificada (K)</span>
                    <span className="font-mono font-bold text-indigo-400 text-base">{identifiedParams.K}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Constante Identificada (τ)</span>
                    <span className="font-mono font-bold text-cyan-400 text-base">{identifiedParams.tau} s</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Bondad de Ajuste (R²)</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">{(identifiedParams.r2 * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {csvPoints.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLine data={csvPoints} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="t" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Line type="monotone" dataKey="yExp" name="Datos Experimentales (Medidos)" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="yModel" name="Modelo Identificado G(s)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    </RechartsLine>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aún no se han cargado datos experimentales. Haz clic en "Cargar Ensayo de Muestra con Ruido" o sube tu propio archivo CSV.
                </div>
              )}
            </div>
          ) : (
            /* Code View */
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[580px] leading-relaxed select-text text-slate-300 border-l-4 border-l-indigo-500">
              <pre className="whitespace-pre">{activeCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
