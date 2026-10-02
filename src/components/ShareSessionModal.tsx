import React, { useState, useMemo } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  Sliders,
  Clock,
  Zap,
  Info,
} from 'lucide-react';
import { ModuleId } from '../types';
import { generateShareUrl, getCurrentSessionState } from '../utils/sessionShare';

interface ShareSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuleId;
}

export const ShareSessionModal: React.FC<ShareSessionModalProps> = ({
  isOpen,
  onClose,
  activeModule,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const shareUrl = useMemo(() => {
    if (!isOpen) return '';
    return generateShareUrl(activeModule);
  }, [isOpen, activeModule]);

  const sessionState = useMemo(() => {
    if (!isOpen) return null;
    return getCurrentSessionState(activeModule);
  }, [isOpen, activeModule]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed, using prompt fallback', err);
      window.prompt('Copia este enlace de sesión:', shareUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Compartir Sesión de Laboratorio
              </h3>
              <p className="text-xs text-slate-400">
                Genera un enlace único con todos los parámetros actuales de simulación y cálculo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Output Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Enlace Único de la Sesión:</span>
            <span className="text-[11px] font-mono text-cyan-400">Hash codificado URL-safe</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
            </button>
          </div>
        </div>

        {/* Setup Summary Snapshot */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resumen de Parámetros Codificados</span>
            </span>
            <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              Módulo: {activeModule}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            {sessionState?.firstOrder && (
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-cyan-400 font-sans font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>1er Orden & Retardo</span>
                </div>
                <div className="text-slate-300">K={sessionState.firstOrder.K} · τ={sessionState.firstOrder.tau}s</div>
                <div className="text-amber-400">θ={sessionState.firstOrder.theta}s</div>
              </div>
            )}

            {sessionState?.secondOrder && (
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-indigo-400 font-sans font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>2º Orden Examen</span>
                </div>
                <div className="text-slate-300">
                  {sessionState.secondOrder.inputMode === 'poly'
                    ? `b0=${sessionState.secondOrder.b0} / a1=${sessionState.secondOrder.a1}`
                    : `wn=${sessionState.secondOrder.wn_can} · ζ=${sessionState.secondOrder.zeta_can}`}
                </div>
              </div>
            )}

            {sessionState?.pid && (
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-emerald-400 font-sans font-semibold flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  <span>Control PID</span>
                </div>
                <div className="text-slate-300">Kp={sessionState.pid.Kp} · Ki={sessionState.pid.Ki}</div>
                <div className="text-emerald-400">Kd={sessionState.pid.Kd}</div>
              </div>
            )}

            {sessionState?.circuits && (
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-amber-400 font-sans font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Circuito {sessionState.circuits.circuitType}</span>
                </div>
                <div className="text-slate-300">
                  R={sessionState.circuits.rVal}Ω · C={sessionState.circuits.cVal}µF
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/30 text-xs text-cyan-300/90 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Cualquier estudiante o profesor que abra este enlace cargará exactamente tu misma configuración de laboratorio, gráficas y valores de cálculo en su navegador.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
