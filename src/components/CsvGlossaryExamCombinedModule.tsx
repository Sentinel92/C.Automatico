import React, { useState } from 'react';
import { FileSpreadsheet, BookOpen, Award, ShieldAlert, Timer } from 'lucide-react';
import { ExperimentalCsvModule } from './ExperimentalCsvModule';
import { GlossaryQuizModule } from './GlossaryQuizModule';
import { GlossaryExamModule } from './GlossaryExamModule';
import { ExamModeModule } from './ExamModeModule';

export const CsvGlossaryExamCombinedModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modo_examen' | 'csv' | 'exam' | 'quiz'>('modo_examen');

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase font-mono">
              <Award className="w-4 h-4" />
              <span>Módulo 10: Datos Experimentales, Glosario y Evaluación Oficial</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Cargador CSV, Glosario y Verificador de Exámenes
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Rinde el <strong>Modo Examen de 60 minutos</strong> (con bloqueo de fórmulas y calificación automática), carga datos de osciloscopio o consulta el diccionario técnico y cuestionario dinámico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('modo_examen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'modo_examen'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'text-rose-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Modo Examen (60 min)</span>
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'csv'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cargador CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'exam'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glosario & Tutor</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz (10 Preguntas)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'modo_examen' && <ExamModeModule />}
      {activeTab === 'csv' && <ExperimentalCsvModule />}
      {activeTab === 'exam' && <GlossaryExamModule />}
      {activeTab === 'quiz' && <GlossaryQuizModule />}
    </div>
  );
};

