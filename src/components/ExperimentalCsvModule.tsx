import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Sparkles,
  Activity,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Save,
  Info,
  TrendingUp,
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
  ReferenceLine,
} from 'recharts';
import { MathView } from './MathView';
import { CsvExperimentData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ExperimentalCsvModule: React.FC = () => {
  const [dataPoints, setDataPoints] = useLocalStorage<CsvExperimentData[]>(
    'autocontrol_csv_data_points',
    []
  );

  const [stepAmp, setStepAmp] = useLocalStorage<number>(
    'autocontrol_csv_step_amp',
    1.0
  );

  const [identMessage, setIdentMessage] = useState<string | null>(null);

  // Automatic identification calculation
  const identification = useMemo(() => {
    if (dataPoints.length < 5) return null;

    // 1. Sort by time
    const sorted = [...dataPoints].sort((a, b) => a.t - b.t);

    // 2. Estimate steady state y_inf from last 20% of points
    const lastN = Math.max(3, Math.floor(sorted.length * 0.2));
    const lastPoints = sorted.slice(-lastN);
    const yInf = lastPoints.reduce((acc, p) => acc + p.y, 0) / lastN;
    const K = yInf / (stepAmp || 1);

    // 3. Find t_632 (63.2% of steady state)
    const target632 = 0.63212 * yInf;
    let tau = 1.0;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].y <= target632 && sorted[i + 1].y >= target632) {
        const t1 = sorted[i].t;
        const t2 = sorted[i + 1].t;
        const y1 = sorted[i].y;
        const y2 = sorted[i + 1].y;
        tau = t1 + ((target632 - y1) / (y2 - y1 || 1e-6)) * (t2 - t1);
        break;
      }
    }

    // 4. Calculate R^2 goodness of fit
    let ssTot = 0;
    let ssRes = 0;
    const yMean = sorted.reduce((acc, p) => acc + p.y, 0) / sorted.length;

    const chartPoints = sorted.map(p => {
      const yModel = parseFloat((K * (1 - Math.exp(-p.t / Math.max(tau, 0.001)))).toFixed(3));
      ssTot += Math.pow(p.y - yMean, 2);
      ssRes += Math.pow(p.y - yModel, 2);
      return {
        t: p.t,
        u: p.u,
        yExp: p.y,
        yModel,
      };
    });

    const r2 = Math.max(0, Math.min(1, 1 - (ssRes / (ssTot || 1))));

    return {
      K: parseFloat(K.toFixed(3)),
      tau: parseFloat(tau.toFixed(3)),
      r2: parseFloat((r2 * 100).toFixed(1)),
      yInf: parseFloat(yInf.toFixed(3)),
      chartPoints,
    };
  }, [dataPoints, stepAmp]);

  // Load realistic noisy experimental sample dataset
  const handleLoadSampleData = () => {
    const sampleK = 2.4;
    const sampleTau = 1.8;
    const A = stepAmp || 1.0;
    const points: CsvExperimentData[] = [];

    for (let i = 0; i <= 60; i++) {
      const t = parseFloat((i * 0.2).toFixed(2));
      const cleanY = A * sampleK * (1 - Math.exp(-t / sampleTau));
      const noise = (Math.random() - 0.5) * 0.18;
      const y = parseFloat(Math.max(0, cleanY + noise).toFixed(3));
      points.push({ t, u: A, y });
    }

    setDataPoints(points);
    setIdentMessage('✓ Ensayo experimental de muestra cargado exitosamente.');
  };

  // CSV file upload parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const points: CsvExperimentData[] = [];

      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('t') || line.startsWith('#') || line.startsWith('T')) continue;
        const parts = line.split(/[;,	 ]+/);
        if (parts.length >= 2) {
          const t = parseFloat(parts[0]);
          let u = stepAmp;
          let y = parseFloat(parts[1]);
          if (parts.length >= 3) {
            u = parseFloat(parts[1]) || stepAmp;
            y = parseFloat(parts[2]);
          }
          if (!isNaN(t) && !isNaN(y)) {
            points.push({ t, u, y });
          }
        }
      }

      if (points.length >= 5) {
        setDataPoints(points);
        setIdentMessage(`✓ Se importaron ${points.length} puntos experimentales.`);
      } else {
        setIdentMessage('El archivo debe tener al menos 5 líneas con columnas: tiempo, salida.');
      }
    };
    reader.readAsText(file);
  };

  // Export current dataset to CSV
  const handleExportCsv = () => {
    if (dataPoints.length === 0) return;

    let content = 'tiempo_s,entrada_u,salida_medida_y\n';
    for (const p of dataPoints) {
      content += `${p.t},${p.u},${p.y}\n`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'datos_experimentales_control.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Identificación Experimental de Sistemas</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Módulo 9: Cargador de Datos Experimentales (CSV)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Importa registros temporales medidos de ensayos industriales (Tiempo, Entrada, Salida). El algoritmo ajusta automáticamente la función de transferencia <MathView math="G(s) = \frac{K}{\tau s + 1}" /> estimando la ganancia estática <MathView math="K" /> y la constante de tiempo <MathView math="\tau" /> con cálculo del coeficiente de bondad <MathView math="R^2" />.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Save className="w-3 h-3 text-emerald-400" />
              <span>LocalStorage</span>
            </span>
            <button
              onClick={() => {
                setDataPoints([]);
                setIdentMessage(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Limpiar datos cargados"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Controls & Identification Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: File Upload & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Cargar Archivo CSV</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Amplitud del Escalón de Ensayo (A):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={stepAmp}
                  onChange={(e) => setStepAmp(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Seleccionar archivo .csv / .txt:
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLoadSampleData}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cargar Ensayo de Muestra con Ruido</span>
                </button>
              </div>

              {dataPoints.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Dataset en CSV</span>
                </button>
              )}
            </div>

            {identMessage && (
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-900 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{identMessage}</span>
              </div>
            )}
          </div>

          {/* Identified Parameters Card */}
          {identification && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Parámetros Identificados</span>
              </h4>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Ganancia Identificada K:</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{identification.K}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Constante Identificada τ:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{identification.tau} s</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Bondad de Ajuste (R²):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{identification.r2}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 mb-0.5">Modelo Identificado:</div>
                <MathView math={`G(s) = \\frac{${identification.K}}{${identification.tau}s + 1}`} block />
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Chart of Experimental Points vs Model */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Ajuste de Regresión: Datos Medidos vs Modelo Teórico</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {dataPoints.length > 0 ? `${dataPoints.length} muestras analizadas` : 'Sin datos'}
                </span>
              </div>
            </div>

            {identification ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={identification.chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="t" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine x={identification.tau} stroke="#06b6d4" strokeDasharray="4 4" label={{ value: `τ = ${identification.tau}s`, fill: '#06b6d4', fontSize: 10, position: 'top' }} />
                    <Line type="monotone" dataKey="yExp" name="Datos Experimentales Medidos" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="yModel" name="Modelo Identificado G(s)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 text-xs space-y-3">
                <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No se han cargado datos experimentales aún.</p>
                <p className="text-slate-400">
                  Haz clic en <strong>"Cargar Ensayo de Muestra con Ruido"</strong> para probar inmediatamente el ajuste por mínimos cuadrados.
                </p>
              </div>
            )}
          </div>

          {/* Academic explanation card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fundamento de la Identificación por Curva de Reacción (Método 63.2%):</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              En plantas químicas y térmicas donde las ecuaciones físicas internas no son conocidas a priori, se aplica un escalón a la entrada <MathView math="u(t) = A" /> y se registra la respuesta. La ganancia se calcula como <MathView math="K = y(\infty) / A" /> y la constante de tiempo <MathView math="\tau" /> corresponde al instante en que la salida alcanza exactamente el <strong>63.212%</strong> de su incremento total asintótico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
