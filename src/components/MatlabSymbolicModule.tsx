import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  FileCode,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
} from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MatlabSymbolicParams {
  systemOrder: '2nd' | '1st';
  a2: number;
  a1: number;
  a0: number;
  b0: number;
  A: number;
  // 1st order
  a1_1st: number;
  a0_1st: number;
  b0_1st: number;
  A_1st: number;
}

const defaultParams: MatlabSymbolicParams = {
  systemOrder: '2nd',
  a2: 1,
  a1: 4,
  a0: 16,
  b0: 20,
  A: 1,
  a1_1st: 2,
  a0_1st: 1,
  b0_1st: 3,
  A_1st: 2,
};

export const MatlabSymbolicModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<MatlabSymbolicParams>(
    'autocontrol_matlab_symbolic_params',
    defaultParams
  );

  const { systemOrder, a2, a1, a0, b0, A, a1_1st, a0_1st, b0_1st, A_1st } = params;
  const [activeTab, setActiveTab] = useState<'combined' | 'symbolic_only' | 'simulink_only'>('combined');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate the complete professional MATLAB script
  const generatedScript = useMemo(() => {
    const is2nd = systemOrder === '2nd';
    const a2Val = is2nd ? a2 : 0;
    const a1Val = is2nd ? a1 : a1_1st;
    const a0Val = is2nd ? a0 : a0_1st;
    const b0Val = is2nd ? b0 : b0_1st;
    const AVal = is2nd ? A : A_1st;

    return `%% =========================================================================
%% PLATINUM CONTROL LAB: EDICIÓN ÁLGEBRA SIMBÓLICA Y SIMULINK PROGRAMÁTICO
%% Cátedra Universitaria de Control Automático - Script Generador .m
%% =========================================================================

clear; clc; close all;

%% =========================================================================
%% 1. ÁLGEBRA SIMBÓLICA PURA CON 'syms' (CÁLCULO CON LETRAS)
%% =========================================================================
fprintf('=======================================================\\n');
fprintf('  1. DEDUCCIÓN SIMBÓLICA EN MATLAB (Álgebra de Letras) \\n');
fprintf('=======================================================\\n');

syms s t positive;
syms a2 a1 a0 b0 A real;
assume(a0 > 0);

${
  is2nd
    ? `% Definición Simbólica de G(s) para Sistema de 2º Orden
G_sym = b0 / (a2*s^2 + a1*s + a0);
R_sym = A / s;
Y_sym = G_sym * R_sym;

fprintf('\\n--- Función de Transferencia Simbólica G(s): ---\\n');
pretty(G_sym);

fprintf('\\n--- Salida Simbólica en Laplace Y(s) = G(s)*R(s): ---\\n');
pretty(Y_sym);

% Descomposición y transformada inversa simbólica con ilaplace()
fprintf('\\n--- Transformada Inversa Simbólica y(t) = ilaplace(Y(s)): ---\\n');
y_t_sym = ilaplace(Y_sym, s, t);
pretty(y_t_sym);`
    : `% Definición Simbólica de G(s) para Sistema de 1er Orden
G_sym = b0 / (a1*s + a0);
R_sym = A / s;
Y_sym = G_sym * R_sym;

fprintf('\\n--- Función de Transferencia Simbólica G(s): ---\\n');
pretty(G_sym);

fprintf('\\n--- Salida Simbólica en Laplace Y(s): ---\\n');
pretty(Y_sym);

% Transformada Inversa simbólica
fprintf('\\n--- Transformada Inversa Simbólica y(t) = ilaplace(Y(s)): ---\\n');
y_t_sym = ilaplace(Y_sym, s, t);
pretty(y_t_sym);`
}

%% =========================================================================
%% 2. SUSTITUCIÓN NUMÉRICA CON 'subs' Y CONTROL SYSTEM TOOLBOX
%% =========================================================================
fprintf('\\n=======================================================\\n');
fprintf('  2. EVALUACIÓN Y SUSTITUCIÓN NUMÉRICA DE PARÁMETROS   \\n');
fprintf('=======================================================\\n');

% Parámetros numéricos ingresados en la Web App
a2_val = ${a2Val};
a1_val = ${a1Val};
a0_val = ${a0Val};
b0_val = ${b0Val};
A_val  = ${AVal};

${
  is2nd
    ? `% Fórmulas Analíticas Exactas de Examen Universitario
wn_val   = sqrt(a0_val / a2_val);
zeta_val = a1_val / (2 * sqrt(a0_val * a2_val));
K_val    = b0_val / a0_val;

fprintf('Frecuencia Natural (wn): %.4f rad/s\\n', wn_val);
fprintf('Factor de Amortiguamiento (zeta): %.4f\\n', zeta_val);
fprintf('Ganancia Estática DC (K): %.4f\\n', K_val);

if zeta_val < 1
    wd_val   = wn_val * sqrt(1 - zeta_val^2);
    beta_val = acos(zeta_val);
    tr_val   = (pi - beta_val) / wd_val;
    tp_val   = pi / wd_val;
    Mp_val   = 100 * exp(-zeta_val*pi / sqrt(1 - zeta_val^2));
    ts2_val  = 4 / (zeta_val * wn_val);
    ts5_val  = 3 / (zeta_val * wn_val);
    
    fprintf('Frecuencia Amortiguada (wd): %.4f rad/s\\n', wd_val);
    fprintf('Tiempo de Levantamiento (tr): %.4f s\\n', tr_val);
    fprintf('Tiempo de Pico (tp): %.4f s\\n', tp_val);
    fprintf('Sobrepico Máximo (Mp): %.2f %%%%\\n', Mp_val);
    fprintf('Tiempo de Asentamiento al 2%% (ts2): %.4f s\\n', ts2_val);
    fprintf('Tiempo de Asentamiento al 5%% (ts5): %.4f s\\n', ts5_val);
end

% Modelo LTI en Control System Toolbox
num_tf = [b0_val];
den_tf = [a2_val, a1_val, a0_val];
G_lti = tf(num_tf, den_tf);`
    : `% Fórmulas de 1er Orden
K_val   = b0_val / a0_val;
tau_val = a1_val / a0_val;
ts2_val = 4 * tau_val;

fprintf('Ganancia Estática (K): %.4f\\n', K_val);
fprintf('Constante de Tiempo (tau): %.4f s\\n', tau_val);
fprintf('Tiempo de Asentamiento al 2%% (ts2): %.4f s\\n', ts2_val);

num_tf = [b0_val];
den_tf = [a1_val, a0_val];
G_lti = tf(num_tf, den_tf);`
}

% Gráfica de respuesta temporal en MATLAB
figure('Name', 'Platinum Lab: Verificación Temporal', 'Color', 'w');
opt = stepDataOptions('StepAmplitude', A_val);
step(G_lti, opt);
grid on;
title('Respuesta Temporal al Escalón - Platinum Control Lab');

%% =========================================================================
%% 3. CREACIÓN AUTOMATIZADA DE DIAGRAMA EN SIMULINK (.slx)
%% =========================================================================
fprintf('\\n=======================================================\\n');
fprintf('  3. CONSTRUCCIÓN PROGRAMÁTICA DE SIMULINK (.slx)     \\n');
fprintf('=======================================================\\n');

model_name = 'simulink_control_platinum';

% Cerrar sistema previo si estuviese abierto en memoria
if bdIsLoaded(model_name)
    close_system(model_name, 0);
end

% Crear y abrir nuevo sistema
new_system(model_name);
open_system(model_name);

% 1. Bloque de Entrada Escalón (Step)
add_block('simulink/Sources/Step', [model_name, '/Step_Ref'], ...
    'Position', [50, 100, 90, 140], ...
    'Time', '0', ...
    'After', num2str(A_val));

% 2. Bloque Sumador de Error
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Error'], ...
    'Position', [150, 105, 180, 135], ...
    'Inputs', '+-');

% 3. Bloque Planta de Función de Transferencia G(s)
${
  is2nd
    ? `add_block('simulink/Continuous/Transfer Fcn', [model_name, '/Planta_G'], ...
    'Position', [250, 95, 360, 145], ...
    'Numerator', ['[', num2str(b0_val), ']'], ...
    'Denominator', ['[', num2str(a2_val), ' ', num2str(a1_val), ' ', num2str(a0_val), ']']);`
    : `add_block('simulink/Continuous/Transfer Fcn', [model_name, '/Planta_G'], ...
    'Position', [250, 95, 360, 145], ...
    'Numerator', ['[', num2str(b0_val), ']'], ...
    'Denominator', ['[', num2str(a1_val), ' ', num2str(a0_val), ']']);`
}

% 4. Bloque Osciloscopio (Scope)
add_block('simulink/Sinks/Scope', [model_name, '/Scope_Salida'], ...
    'Position', [430, 100, 470, 140]);

% 5. Conexión de Líneas Vectoriales
add_line(model_name, 'Step_Ref/1', 'Sum_Error/1', 'autorouting', 'on');
add_line(model_name, 'Sum_Error/1', 'Planta_G/1', 'autorouting', 'on');
add_line(model_name, 'Planta_G/1', 'Scope_Salida/1', 'autorouting', 'on');

% Realimentación unitaria hacia el borne negativo
add_line(model_name, 'Planta_G/1', 'Sum_Error/2', 'autorouting', 'on');

% Guardar archivo .slx
save_system(model_name);
fprintf('✓ Diagrama de bloques Simulink "%s.slx" generado exitosamente.\\n', model_name);
`;
  }, [systemOrder, a2, a1, a0, b0, A, a1_1st, a0_1st, b0_1st, A_1st]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `control_symbolic_simulink_${systemOrder}.m`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <FileCode className="w-4 h-4" />
              <span>Generación de Código de Ingeniería de Control</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 3: Generador de Script MATLAB Simbólico y Numérico
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Genera automáticamente un script ejecutable <code className="text-indigo-300 font-mono">.m</code> para MATLAB que combina: <strong>1.</strong> Álgebra simbólica con <code className="text-indigo-300 font-mono">syms</code>, <code className="text-indigo-300 font-mono">ilaplace()</code> y <code className="text-indigo-300 font-mono">pretty()</code>; <strong>2.</strong> Sustitución de coeficientes numéricos; y <strong>3.</strong> Creación automatizada del archivo <code className="text-indigo-300 font-mono">.slx</code> de Simulink.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Script (.m)'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .m</span>
            </button>
          </div>
        </div>

        {/* Order toggle */}
        <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Orden del Sistema:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setParams(p => ({ ...p, systemOrder: '2nd' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  systemOrder === '2nd'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2º Orden (a2, a1, a0, b0)
              </button>
              <button
                onClick={() => setParams(p => ({ ...p, systemOrder: '1st' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  systemOrder === '1st'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1er Orden (a1, a0, b0)
              </button>
            </div>
          </div>

          <button
            onClick={resetParams}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Editor & Parameter Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Valores Numéricos a Inyectar</span>
            </h3>

            {systemOrder === '2nd' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente a2 (ÿ):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a2}
                    onChange={(e) => setParams(p => ({ ...p, a2: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente a1 (ẏ):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a1}
                    onChange={(e) => setParams(p => ({ ...p, a1: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente a0 (y):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a0}
                    onChange={(e) => setParams(p => ({ ...p, a0: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente b0 (r):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={b0}
                    onChange={(e) => setParams(p => ({ ...p, b0: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Amplitud Escalón A:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={A}
                    onChange={(e) => setParams(p => ({ ...p, A: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente a1 (ẏ):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a1_1st}
                    onChange={(e) => setParams(p => ({ ...p, a1_1st: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente a0 (y):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={a0_1st}
                    onChange={(e) => setParams(p => ({ ...p, a0_1st: parseFloat(e.target.value) || 0.1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Coeficiente b0 (r):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={b0_1st}
                    onChange={(e) => setParams(p => ({ ...p, b0_1st: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Amplitud Escalón A:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={A_1st}
                    onChange={(e) => setParams(p => ({ ...p, A_1st: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200">Estructura del Script .m:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Declaración <code className="text-indigo-300">syms s t</code> para cálculo literal.</li>
                <li>Inversa de Laplace con <code className="text-indigo-300">ilaplace()</code>.</li>
                <li>Formato estético con <code className="text-indigo-300">pretty()</code>.</li>
                <li>Simulink con <code className="text-indigo-300">new_system()</code> y <code className="text-indigo-300">add_block()</code>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Script MATLAB .m (Listo para Ejecutar en MATLAB / Simulink)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {generatedScript.split('\n').length} líneas
              </span>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-100 font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                <code>{generatedScript}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
