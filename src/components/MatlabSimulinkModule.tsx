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
} from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SimulinkParams {
  K: number;
  tau: number;
  A: number;
  tPert: number;
  ampPert: number;
}

const defaultParams: SimulinkParams = {
  K: 2.5,
  tau: 1.8,
  A: 1.0,
  tPert: 4.0,
  ampPert: 1.0,
};

export const MatlabSimulinkModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<SimulinkParams>(
    'autocontrol_matlab_simulink_params',
    defaultParams
  );

  const [activeCodeTab, setActiveCodeTab] = useState<'simulink' | 'matlab'>('simulink');
  const [copied, setCopied] = useState<boolean>(false);

  const { K, tau, A, tPert, ampPert } = params;

  const setK = (v: number) => setParams(p => ({ ...p, K: v }));
  const setTau = (v: number) => setParams(p => ({ ...p, tau: v }));
  const setA = (v: number) => setParams(p => ({ ...p, A: v }));
  const setTPert = (v: number) => setParams(p => ({ ...p, tPert: v }));
  const setAmpPert = (v: number) => setParams(p => ({ ...p, ampPert: v }));

  // Script 1: Programmatic Simulink model generation via API
  const simulinkCode = useMemo(() => {
    return `%% =========================================================================
%% AUTOCONTROL LAB: GENERACIÓN PROGRAMÁTICA DE MODELO SIMULINK (.SLX)
%% Cátedra de Control Automático
%% Planta de 1er Orden: K = ${K.toFixed(3)}, tau = ${tau.toFixed(3)} s, Escalón A = ${A.toFixed(1)}
%% =========================================================================

clear; clc; close all;

model_name = 'modelo_autocontrol_simulink';

% 1. Cerrar el modelo si ya se encontraba abierto en memoria
if bdIsLoaded(model_name)
    close_system(model_name, 0);
end

% 2. Crear y abrir el lienzo de Simulink
new_system(model_name);
open_system(model_name);

fprintf('--> Modelo de Simulink "%s" inicializado correctamente.\\n', model_name);

% 3. Parámetros del Sistema
K      = ${K};          % Ganancia estática
tau    = ${tau};        % Constante de tiempo [s]
A_step = ${A};          % Amplitud de escalón

% 4. Agregar Bloques desde la Librería Estándar de Simulink
% 4.1 Entrada Escalón (Step)
add_block('simulink/Sources/Step', [model_name, '/Step_Referencia'], ...
    'Position', [60, 100, 100, 140], ...
    'Time', '0', ...
    'Before', '0', ...
    'After', num2str(A_step));

% 4.2 Sumador de Error (Sum Junction)
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Error'], ...
    'Position', [150, 105, 175, 135], ...
    'Inputs', '+-');

% 4.3 Bloque de Planta de 1er Orden: G(s) = K / (tau*s + 1)
add_block('simulink/Continuous/Transfer Fcn', [model_name, '/Planta_1er_Orden'], ...
    'Position', [230, 95, 360, 145], ...
    'Numerator', sprintf('[%.4f]', K), ...
    'Denominator', sprintf('[%.4f 1]', tau));

% 4.4 Inyección de Perturbación Externa (Disturbance Step)
add_block('simulink/Sources/Step', [model_name, '/Inyeccion_Perturbacion'], ...
    'Position', [280, 20, 320, 60], ...
    'Time', num2str(${tPert}), ...
    'Before', '0', ...
    'After', num2str(${ampPert}));

% 4.5 Sumador de Perturbación en la Salida
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Perturbacion'], ...
    'Position', [410, 105, 435, 135], ...
    'Inputs', '++');

% 4.6 Osciloscopio para Visualización (Scope)
add_block('simulink/Sinks/Scope', [model_name, '/Scope_Salida'], ...
    'Position', [500, 100, 540, 140]);

% 5. Conectar Puertos mediante el comando add_line
add_line(model_name, 'Step_Referencia/1', 'Sum_Error/1');
add_line(model_name, 'Sum_Error/1', 'Planta_1er_Orden/1');
add_line(model_name, 'Planta_1er_Orden/1', 'Sum_Perturbacion/2');
add_line(model_name, 'Inyeccion_Perturbacion/1', 'Sum_Perturbacion/1');
add_line(model_name, 'Sum_Perturbacion/1', 'Scope_Salida/1');

% Línea de Realimentación Unitaria
add_line(model_name, 'Sum_Perturbacion/1', 'Sum_Error/2', 'autorouting', 'on');

% 6. Configurar tiempo de simulación y ejecutar
set_param(model_name, 'StopTime', '12.0');
fprintf('--> Simulando modelo...\\n');
sim(model_name);
fprintf('--> Modelo construido y simulado exitosamente en Simulink.\\n');
`;
  }, [K, tau, A, tPert, ampPert]);

  // Script 2: Numerical MATLAB script
  const matlabCode = useMemo(() => {
    return `%% =========================================================================
%% AUTOCONTROL LAB: ANÁLISIS NUMÉRICO Y CONTROL EN MATLAB
%% Cátedra de Control Automático
%% Planta: K = ${K.toFixed(3)}, tau = ${tau.toFixed(3)} s, Escalón A = ${A.toFixed(1)}
%% =========================================================================

clear; clc; close all;

% 1. Parámetros Físicos
K      = ${K};          % Ganancia estática
tau    = ${tau};        % Constante de tiempo [s]
A_step = ${A};          % Amplitud de escalón
t_pert = ${tPert};      % Tiempo de perturbación [s]
d_pert = ${ampPert};    % Magnitud de perturbación

% 2. Definición de la Función de Transferencia G(s)
num = [K];
den = [tau, 1];
G = tf(num, den);

fprintf('Función de Transferencia G(s):\\n');
disp(G);

% 3. Polos y Tiempo de Asentamiento
p = pole(G);
fprintf('Polo del sistema: s1 = %.4f rad/s\\n', p);
fprintf('Tiempo de establecimiento ts (2%%) = 4*tau = %.4f s\\n', 4*tau);

% 4. Simulación Temporal con lsim
t = linspace(0, 10*tau, 600)';
u_step = A_step * ones(size(t));
u_pert = d_pert * (t >= t_pert);
u_total = u_step + u_pert;

y = lsim(G, u_total, t);

% 5. Graficación de Curvas
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

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeCodeTab === 'simulink' ? 'crear_modelo_simulink.m' : 'analisis_control.m';
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Box className="w-4 h-4" />
              <span>Automatización Simulink & Scripts MATLAB</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 8: Exportador de Código MATLAB y Simulink
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Genera scripts ejecutables que automatizan la construcción visual completa de modelos en Simulink (.slx) mediante comandos de API (<code className="text-indigo-300">new_system</code>, <code className="text-indigo-300">add_block</code>, <code className="text-indigo-300">add_line</code>) y scripts analíticos con <code className="text-cyan-300">tf</code> y <code className="text-cyan-300">lsim</code>.
            </p>
          </div>

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
          </div>
        </div>
      </div>

      {/* Grid: Parameters Form + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Parámetros para el Script</span>
              </h3>
              <button
                onClick={resetParams}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                title="Restablecer"
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

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-500 mb-0.5">Planta Modelada:</div>
              <MathView math={`G(s) = \\frac{${K.toFixed(2)}}{${tau.toFixed(2)}s + 1}`} block />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instrucciones de Uso:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Haz clic en <strong>Copiar Código</strong> o <strong>Descargar .m</strong>.</li>
              <li>Abre <strong>MATLAB</strong> y ejecuta el script (F5).</li>
              <li>Simulink abrirá el modelo creado, colocará los bloques y realizará el cableado automático.</li>
            </ol>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-lg">
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
                <span>Script Simulink (.slx Automático)</span>
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
                <span>Script Numérico MATLAB (.m)</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-text text-slate-300 border-l-4 border-l-indigo-500">
            <pre className="whitespace-pre">{activeCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
