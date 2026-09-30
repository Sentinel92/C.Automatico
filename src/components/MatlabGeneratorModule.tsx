import React, { useState, useMemo } from 'react';
import { Terminal, Copy, Check, Download, FileCode, Sliders, RotateCcw, Save } from 'lucide-react';
import { MathView } from './MathView';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface MatlabParams {
  K: number;
  tau: number;
  A: number;
  tPert: number;
  ampPert: number;
}

const defaultMatlabParams: MatlabParams = {
  K: 2.5,
  tau: 1.8,
  A: 1.0,
  tPert: 4.0,
  ampPert: 1.0,
};

export const MatlabGeneratorModule: React.FC = () => {
  const [params, setParams, resetParams] = useLocalStorage<MatlabParams>(
    'autocontrol_matlab_params',
    defaultMatlabParams
  );

  const { K, tau, A, tPert, ampPert } = params;

  const setK = (v: number) => setParams(p => ({ ...p, K: v }));
  const setTau = (v: number) => setParams(p => ({ ...p, tau: v }));
  const setA = (v: number) => setParams(p => ({ ...p, A: v }));
  const setTPert = (v: number) => setParams(p => ({ ...p, tPert: v }));
  const setAmpPert = (v: number) => setParams(p => ({ ...p, ampPert: v }));

  const [copied, setCopied] = useState<boolean>(false);

  // Generate clean, highly professional MATLAB script (.m)
  const matlabCode = useMemo(() => {
    const ts2 = (4 * tau).toFixed(3);
    const yFinal = (A * K).toFixed(3);
    const pole = (-1 / tau).toFixed(4);

    return `%% =========================================================================
%% BUILDQUOTE AI & CONTROL LAB: SIMULACIÓN DE SISTEMA DE 1ER ORDEN
%% Autor: Generador Automático de Control de 1er Orden
%% Parámetros del Sistema: K = ${K.toFixed(3)}, tau = ${tau.toFixed(3)} s
%% Modelo Canónico: G(s) = K / (tau*s + 1)
%% =========================================================================

clear; clc; close all;

%% 1. DEFINICIÓN DE PARÁMETROS FÍSICOS Y CANÓNICOS
K      = ${K};          % Ganancia estática del sistema (DC Gain)
tau    = ${tau};        % Constante de tiempo [segundos]
A_step = ${A};          % Amplitud del escalón de entrada
t_pert = ${tPert};        % Instante de inyección de perturbación [s]
d_amp  = ${ampPert};        % Magnitud de la perturbación

% Cálculo de especificaciones temporales analíticas
ts_2pct = 4 * tau;      % Tiempo de establecimiento (criterio del 2%) -> ${ts2} s
ts_1pct = 5 * tau;      % Tiempo de establecimiento (criterio del 1%)
polo    = -1 / tau;     % Ubicación del polo en el plano s -> ${pole} rad/s
y_final = A_step * K;   % Valor final asintótico -> ${yFinal}

fprintf('=========================================================\\n');
fprintf('  REPORTE ANALÍTICO DEL SISTEMA DE 1ER ORDEN\\n');
fprintf('=========================================================\\n');
fprintf('Ganancia Estática (K):        %.3f\\n', K);
fprintf('Constante de Tiempo (tau):    %.3f s\\n', tau);
fprintf('Polo del Sistema (s_p):       %.4f rad/s\\n', polo);
fprintf('Tiempo de Establecimiento ts: %.3f s\\n', ts_2pct);
fprintf('Valor Final ante Escalón:     %.3f\\n', y_final);
fprintf('=========================================================\\n\\n');

%% 2. CONSTRUCCIÓN DE LA FUNCIÓN DE TRANSFERENCIA EN MATLAB
s = tf('s');
G = K / (tau * s + 1);

fprintf('Función de Transferencia G(s):\\n');
G

%% 3. DEFINICIÓN DEL VECTOR DE TIEMPO
t_max = max([tau * 6, t_pert + tau * 4, 10]);
t = linspace(0, t_max, 1000);

%% 4. SIMULACIÓN: RESPUESTA AL ESCALÓN (STEP)
u_step = A_step * ones(size(t));
[y_step, t_out] = lsim(G, u_step, t);

% Puntos críticos exactos
y_tau  = A_step * K * (1 - exp(-1));      % 63.21%
y_4tau = A_step * K * (1 - exp(-4));      % 98.17%

%% 5. SIMULACIÓN: RESPUESTA A LA ENTRADA RAMPA Y ERROR EN ESTADO ESTABLE
u_ramp = t;                               % Rampa unitaria r(t) = t
[y_ramp, ~] = lsim(G, u_ramp, t);
e_ramp = u_ramp - y_ramp;                 % Señal de error e(t)
e_ss_teorico = K * tau;                   % Error en estado estable teórico

%% 6. SIMULACIÓN: INYECCIÓN DE PERTURBACIÓN EXTERNA
% Excitación combinada: Escalón en t=0 + Perturbación en t=t_pert
u_dist = u_step;
u_dist(t >= t_pert) = u_step(t >= t_pert) + d_amp;
[y_dist, ~] = lsim(G, u_dist, t);

%% 7. GRAFICACIÓN MULTI-PANEL PROFESIONAL
figure('Name', 'Control Automático: Sistema de 1er Orden', 'Color', 'w', 'Position', [100, 100, 1100, 750]);

% --- Subplot 1: Respuesta al Escalón con Marcas ---
subplot(2, 2, 1);
plot(t, y_step, 'b-', 'LineWidth', 2); hold on; grid on;
yline(y_final, 'k--', 'Valor Final (A*K)', 'LineWidth', 1.2);
xline(tau, 'm--', sprintf('\\tau = %.2fs (63.2%%)', tau), 'LineWidth', 1);
xline(ts_2pct, 'r--', sprintf('4\\tau = %.2fs (98.2%%)', ts_2pct), 'LineWidth', 1);
plot(tau, y_tau, 'mo', 'MarkerFaceColor', 'm', 'MarkerSize', 6);
plot(ts_2pct, y_4tau, 'ro', 'MarkerFaceColor', 'r', 'MarkerSize', 6);
title('1. Respuesta al Escalón y(t)');
xlabel('Tiempo [s]'); ylabel('Salida y(t)');
legend('Respuesta y(t)', 'Valor Final', 'Location', 'southeast');
xlim([0, t_max]);

% --- Subplot 2: Respuesta a la Rampa y Error e_ss ---
subplot(2, 2, 2);
plot(t, u_ramp, 'k--', 'LineWidth', 1.5); hold on; grid on;
plot(t, y_ramp, 'g-', 'LineWidth', 2);
plot(t, e_ramp, 'r:', 'LineWidth', 1.5);
title('2. Respuesta a Entrada Rampa u(t) = t');
xlabel('Tiempo [s]'); ylabel('Magnitud');
legend('Referencia u(t)', 'Salida y(t)', sprintf('Error e(t) (e_{ss}=%.2f)', e_ss_teorico), 'Location', 'northwest');
xlim([0, t_max]);

% --- Subplot 3: Respuesta con Perturbación Externa ---
subplot(2, 2, 3);
plot(t, y_dist, 'Color', [0.85 0.33 0.1], 'LineWidth', 2); hold on; grid on;
plot(t, y_step, 'Color', [0.5 0.5 0.5], 'LineStyle', ':', 'LineWidth', 1.2);
xline(t_pert, 'r--', sprintf('Inyección Perturbación (t=%.1fs)', t_pert), 'LineWidth', 1.2);
title('3. Rechazo / Respuesta ante Perturbación Externa');
xlabel('Tiempo [s]'); ylabel('Salida Total y(t)');
legend('Salida con Perturbación', 'Salida Nominal sin Pert.', 'Location', 'southeast');
xlim([0, t_max]);

% --- Subplot 4: Mapa de Polos y Ceros (PZMAP) ---
subplot(2, 2, 4);
pzmap(G); grid on;
title('4. Mapa de Polos y Ceros en el Plano Complejo s');
xlim([polo * 1.5, 0.5]);

fprintf('Simulación y graficación completadas con éxito en MATLAB.\\n');
`;
  }, [K, tau, A, tPert, ampPert]);

  const handleCopy = () => {
    navigator.clipboard.writeText(matlabCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([matlabCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulacion_primer_orden_K${K}_tau${tau}.m`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const tMax = Math.max(tau * 10, tPert + tau * 4, 10);
    const steps = 300;
    const dt = tMax / steps;
    const yFinalStep = A * K;

    let csv = 'Tiempo_s,Escalon_Entrada,Salida_Escalon,Rampa_Entrada,Salida_Rampa,Error_Rampa,Perturbacion,Salida_Total_Perturbacion\n';

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const stepIn = A;
      const stepOut = parseFloat((yFinalStep * (1 - Math.exp(-t / tau))).toFixed(4));

      const rampIn = parseFloat((A * t).toFixed(4));
      const rampOut = parseFloat((A * K * (t - tau * (1 - Math.exp(-t / tau)))).toFixed(4));
      const rampErr = parseFloat((rampIn - rampOut).toFixed(4));

      const dVal = t >= tPert ? ampPert : 0;
      const dOut = t >= tPert ? ampPert * K * (1 - Math.exp(-(t - tPert) / tau)) : 0;
      const distTotalOut = parseFloat((stepOut + dOut).toFixed(4));

      csv += `${t},${stepIn},${stepOut},${rampIn},${rampOut},${rampErr},${dVal},${distTotalOut}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datos_simulacion_1er_orden_K${K}_tau${tau}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <FileCode className="w-4 h-4" />
              <span>Exportación a Entornos Numéricos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Generador de Script de MATLAB (.m) y Exportación CSV
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Genera scripts completos y listos para ejecutar en MATLAB / GNU Octave con la definición exacta de la función de transferencia, simulación con <code className="text-indigo-300 font-mono text-xs">lsim</code>, y exporta los 300 puntos numéricos simulados a formato CSV estándar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono mr-1">
              <Save className="w-3 h-3 text-indigo-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={resetParams}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
              title="Restablecer parámetros del script"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código MATLAB'}</span>
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
              title="Descarga los 300 puntos de la simulación en formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Datos Simulados a CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Interactive sliders to customize code + Code preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Param Adjuster */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Personalizar Parámetros del Script</span>
              <Sliders className="w-4 h-4 text-indigo-400" />
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Ganancia K:</span>
                  <span className="font-mono text-indigo-400 font-bold">{K.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={K}
                  onChange={(e) => setK(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Constante de Tiempo τ [s]:</span>
                  <span className="font-mono text-cyan-400 font-bold">{tau.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={4}
                  step={0.1}
                  value={tau}
                  onChange={(e) => setTau(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Amplitud Escalón A:</span>
                  <span className="font-mono text-emerald-400 font-bold">{A.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={A}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Instante Perturbación t_pert [s]:</span>
                  <span className="font-mono text-amber-400 font-bold">{tPert.toFixed(1)} s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={tPert}
                  onChange={(e) => setTPert(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
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
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Live Model View */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-500 mb-0.5">Función de Transferencia a Exportar:</div>
              <MathView math={`G(s) = \\frac{${K.toFixed(2)}}{${tau.toFixed(2)}s + 1}`} block />
            </div>
          </div>

          {/* Instructions Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instrucciones de Ejecución:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed">
              <li>Haz clic en <strong>Copiar Código .m</strong> o <strong>Descargar .m</strong>.</li>
              <li>Abre <strong>MATLAB</strong> o <strong>GNU Octave</strong> en tu computador.</li>
              <li>Pega el código en el editor de scripts o abre el archivo descargado.</li>
              <li>Presiona la tecla <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">F5</kbd> o escribe <code className="text-indigo-300 font-mono">run</code> para ejecutar y ver las figuras interactivas.</li>
            </ol>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>simulacion_primer_orden.m</span>
            </span>
            <span className="text-slate-500 font-mono">MATLAB Script R2020a+</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-text text-slate-300 border-l-4 border-l-indigo-500">
            <pre className="whitespace-pre">{matlabCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
