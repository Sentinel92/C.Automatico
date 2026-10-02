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
  GitBranch,
} from 'lucide-react';
import { MathView } from './MathView';

export const BlockSimulinkModule: React.FC = () => {
  const [K, setK] = useState<number>(2.5);
  const [tau, setTau] = useState<number>(1.8);
  const [Kp, setKp] = useState<number>(2.0);
  const [Ki, setKi] = useState<number>(1.0);
  const [Kd, setKd] = useState<number>(0.2);
  const [A, setA] = useState<number>(1.0);
  const [tPert, setTPert] = useState<number>(5.0);
  const [ampPert, setAmpPert] = useState<number>(1.0);

  const [activeTab, setActiveTab] = useState<'svg' | 'script'>('svg');
  const [copied, setCopied] = useState<boolean>(false);

  // Script generator for Simulink API
  const simulinkCode = useMemo(() => {
    return `%% =========================================================================
%% AUTOCONTROL PLATINUM LAB: CONSTRUCCIÓN PROGRAMÁTICA DE SIMULINK (.SLX)
%% =========================================================================

clear; clc; close all;
model_name = 'modelo_autocontrol_platinum';

if bdIsLoaded(model_name)
    close_system(model_name, 0);
end

new_system(model_name);
open_system(model_name);

% Parámetros de la Planta y Controlador
K = ${K.toFixed(3)};
tau = ${tau.toFixed(3)};
Kp = ${Kp.toFixed(3)};
Ki = ${Ki.toFixed(3)};
Kd = ${Kd.toFixed(3)};

% 1. Bloque Escalón Referencia
add_block('simulink/Sources/Step', [model_name, '/Step_Ref'], ...
    'Position', [50, 100, 90, 140], 'Time', '0', 'After', num2str(${A}));

% 2. Sumador de Error
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Error'], ...
    'Position', [140, 105, 165, 135], 'Inputs', '+-');

% 3. Bloque PID
add_block('simulink/Continuous/PID Controller', [model_name, '/PID_Controller'], ...
    'Position', [210, 95, 270, 145], 'P', num2str(Kp), 'I', num2str(Ki), 'D', num2str(Kd));

% 4. Planta G(s) = K / (tau*s + 1)
add_block('simulink/Continuous/Transfer Fcn', [model_name, '/Planta_1er_Orden'], ...
    'Position', [320, 95, 430, 145], 'Numerator', sprintf('[%.4f]', K), 'Denominator', sprintf('[%.4f 1]', tau));

% 5. Inyección de Perturbación
add_block('simulink/Sources/Step', [model_name, '/Perturbacion'], ...
    'Position', [360, 25, 400, 65], 'Time', num2str(${tPert}), 'After', num2str(${ampPert}));

% 6. Sumador de Salida
add_block('simulink/Math Operations/Sum', [model_name, '/Sum_Out'], ...
    'Position', [470, 105, 495, 135], 'Inputs', '++');

% 7. Osciloscopio
add_block('simulink/Sinks/Scope', [model_name, '/Scope_Out'], ...
    'Position', [540, 100, 580, 140]);

% Conexiones add_line
add_line(model_name, 'Step_Ref/1', 'Sum_Error/1');
add_line(model_name, 'Sum_Error/1', 'PID_Controller/1');
add_line(model_name, 'PID_Controller/1', 'Planta_1er_Orden/1');
add_line(model_name, 'Planta_1er_Orden/1', 'Sum_Out/2');
add_line(model_name, 'Perturbacion/1', 'Sum_Out/1');
add_line(model_name, 'Sum_Out/1', 'Scope_Out/1');
add_line(model_name, 'Sum_Out/1', 'Sum_Error/2', 'autorouting', 'on');

set_param(model_name, 'StopTime', '15.0');
fprintf('--> Simulando en Simulink...\\n');
sim(model_name);
fprintf('--> Modelo construido y simulado con éxito.\\n');
`;
  }, [K, tau, Kp, Ki, Kd, A, tPert, ampPert]);

  const handleCopy = () => {
    navigator.clipboard.writeText(simulinkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([simulinkCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crear_modelo_simulink.m';
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
              <GitBranch className="w-4 h-4" />
              <span>Modelado Vectorial & Automatización Simulink</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 8: Diagrama de Bloques SVG y Script MATLAB/Simulink
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Visualiza la topología del lazo cerrado en un esquema vectorial SVG dinámico y exporta el script ejecutable para construir y cablear automáticamente el diagrama en Simulink (.slx).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('svg')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'svg' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Diagrama SVG
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'script' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Script Simulink (.m)
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      {activeTab === 'svg' ? (
        <div className="space-y-4">
          {/* Sliders Deck */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Ganancia K: {K.toFixed(2)}</span>
              <input type="range" min="0.5" max="5.0" step="0.1" value={K} onChange={e => setK(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Constante τ: {tau.toFixed(2)}s</span>
              <input type="range" min="0.2" max="4.0" step="0.1" value={tau} onChange={e => setTau(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Ganancia Kp: {Kp.toFixed(2)}</span>
              <input type="range" min="0.5" max="10.0" step="0.5" value={Kp} onChange={e => setKp(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Integral Ki: {Ki.toFixed(2)}</span>
              <input type="range" min="0.0" max="5.0" step="0.5" value={Ki} onChange={e => setKi(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex justify-center overflow-x-auto">
            <svg width="780" height="220" viewBox="0 0 780 220" className="select-none font-sans text-xs">
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Reference */}
              <path d="M 30 75 L 100 75" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arr)" />
              <text x="35" y="62" fill="#38bdf8" fontWeight="bold">R(s) = {A}</text>

              {/* Sum Junction */}
              <circle cx="115" cy="75" r="14" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
              <text x="115" y="79" textAnchor="middle" fill="#818cf8" fontSize="14" fontWeight="bold">Σ</text>
              <text x="96" y="71" fill="#38bdf8" fontWeight="bold">+</text>
              <text x="119" y="102" fill="#f43f5e" fontWeight="bold">−</text>

              {/* Line to Controller */}
              <path d="M 129 75 L 180 75" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arr)" />
              <text x="155" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">E(s)</text>

              {/* Controller Box */}
              <rect x="180" y="45" width="110" height="60" rx="8" fill="#1e1e38" stroke="#818cf8" strokeWidth="2" />
              <text x="235" y="68" textAnchor="middle" fill="#c7d2fe" fontWeight="600">Controlador PID</text>
              <text x="235" y="88" textAnchor="middle" fill="#818cf8" fontFamily="monospace" fontSize="11">Kp={Kp} Ki={Ki}</text>

              {/* Line to Plant */}
              <path d="M 290 75 L 350 75" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arr)" />
              <text x="320" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">U(s)</text>

              {/* Plant Box */}
              <rect x="350" y="35" width="180" height="80" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="440" y="55" textAnchor="middle" fill="#38bdf8" fontWeight="bold">Planta G(s)</text>
              <text x="440" y="75" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontWeight="bold">K = {K.toFixed(2)}</text>
              <line x1="380" y1="82" x2="500" y2="82" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="440" y="100" textAnchor="middle" fill="#e2e8f0" fontFamily="monospace">{tau.toFixed(2)}s + 1</text>

              {/* Line to Output */}
              <path d="M 530 75 L 670 75" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arr)" />
              <circle cx="610" cy="75" r="4" fill="#38bdf8" />
              <text x="690" y="78" fill="#34d399" fontSize="13" fontWeight="bold">Y(s)</text>

              {/* Feedback Loop */}
              <path d="M 610 75 L 610 165 L 115 165 L 115 95" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arr)" fill="none" />
              <text x="360" y="180" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="600">Realimentación Unitaria H(s) = 1</text>
            </svg>
          </div>
        </div>
      ) : (
        /* Script View */
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Script MATLAB (.m) para Generación de Modelo Simulink</span>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Script'}</span>
              </button>
              <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .m</span>
              </button>
            </div>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {simulinkCode}
          </pre>
        </div>
      )}
    </div>
  );
};
