import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  RotateCcw,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Flame,
  Thermometer,
} from 'lucide-react';
import { MathView } from './MathView';

export const FundamentalsModule: React.FC = () => {
  // Open loop vs closed loop interactive comparison
  const [toasterTime, setToasterTime] = useState<number>(3); // minutes
  const [roomTargetTemp, setRoomTargetTemp] = useState<number>(22); // °C
  const [disturbanceCold, setDisturbanceCold] = useState<boolean>(false);
  const [roomCurrentTemp, setRoomCurrentTemp] = useState<number>(18);

  const errorTemp = roomTargetTemp - (disturbanceCold ? roomCurrentTemp - 4 : roomCurrentTemp);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
          <Compass className="w-4 h-4" />
          <span>Ingeniería de Sistemas Dinámicos</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
          Módulo 1: Fundamentos e Intuición Física del Control Automático
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          El control automático consiste en gobernar el comportamiento dinámico de una planta física para que su salida siga una referencia deseada, mitigando perturbaciones ambientales e incertidumbres de modelo.
        </p>
      </div>

      {/* Anatomy of Dynamic Systems */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>Entrada u(t)</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Variable Manipulada / Control</h4>
          <p className="text-xs text-slate-400">
            Señal energética inyectada al sistema (voltaje al motor, caudal de combustible en la caldera, torque del actuador).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Salida y(t)</span>
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Variable Controlada / Proceso</h4>
          <p className="text-xs text-slate-400">
            Magnitud física que deseamos llevar al setpoint (velocidad del rotor, temperatura del reactor, nivel del tanque).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
            <span>Estados x(t)</span>
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Variables Internas de Energía</h4>
          <p className="text-xs text-slate-400">
            Conjunto mínimo de variables que describen el almacenamiento energético interno (tensión en capacitor, corriente en inductor, posición y velocidad).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Perturbación d(t)</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Ruido y Cargas Externas</h4>
          <p className="text-xs text-slate-400">
            Fuerzas no deseadas e incontrolables (ráfagas de viento en un dron, variaciones de carga en la red eléctrica, puertas abiertas en un horno).
          </p>
        </div>
      </div>

      {/* Open Loop vs Closed Loop Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open loop card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>1. Sistema en Lazo Abierto (Open Loop)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Sin Sensor / Sin Corrección
            </span>
          </div>

          <p className="text-xs text-slate-300">
            La acción de control se ejecuta según un temporizador o calibración previa, <strong>sin medir la salida real</strong>. Si cambia el ambiente o la carga, el sistema comete errores graves.
          </p>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-white">Ejemplo Práctico: Tostadora Eléctrica Doméstica</span>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tiempo prefijado en perilla:</span>
              <span className="font-mono text-amber-400 font-bold">{toasterTime} minutos</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={toasterTime}
              onChange={(e) => setToasterTime(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800 leading-relaxed">
              • Si el pan está congelado, tras {toasterTime} min saldrá frío.<br />
              • Si el pan ya estaba caliente, saldrá quemado.<br />
              <strong>Motivo:</strong> No existe sensor óptico o térmico que retroalimente el estado de tostado.
            </div>
          </div>
        </div>

        {/* Closed loop card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-400" />
              <span>2. Sistema en Lazo Cerrado (Closed Loop)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Con Realimentación (Feedback)
            </span>
          </div>

          <p className="text-xs text-slate-300">
            La salida <MathView math="y(t)" /> se mide con un sensor y se compara con la referencia <MathView math="r(t)" />, calculando el <strong>error instantáneo</strong> <MathView math="e(t) = r(t) - y(t)" /> para corregir en tiempo real.
          </p>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-white">Ejemplo: Climatización de Sala con Termostato</span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Setpoint deseado r(t):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="16"
                    max="28"
                    value={roomTargetTemp}
                    onChange={(e) => setRoomTargetTemp(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-cyan-400 font-bold">{roomTargetTemp}°C</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Perturbación exterior d(t):</label>
                <button
                  onClick={() => setDisturbanceCold(!disturbanceCold)}
                  className={`w-full py-1.5 px-2 rounded text-xs font-semibold border transition-colors ${
                    disturbanceCold
                      ? 'bg-rose-950 border-rose-700 text-rose-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {disturbanceCold ? 'Ventana Abierta (-4°C)' : 'Ventana Cerrada (Normal)'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Error e(t) = r(t) - y(t):</span>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  {errorTemp > 0 ? `+${errorTemp}°C (Calefactor ON)` : errorTemp === 0 ? '0°C (En Setpoint)' : `${errorTemp}°C (Enfriando)`}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Retroalimentación Negativa activa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
