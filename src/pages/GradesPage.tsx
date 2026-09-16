import React, { useState } from 'react';
import { Student, Grade } from '../types/database.types';
import { useGrades } from '../hooks/useGrades';
import { BimesterSelector } from '../components/grades/BimesterSelector';
import { GradeCard } from '../components/grades/GradeCard';
import { GradeBreakdownModal } from '../components/grades/GradeBreakdownModal';
import { OfficialReportCardModal } from '../components/grades/OfficialReportCardModal';
import { BookOpen, CheckCircle2, TrendingUp, Sparkles, FileText } from 'lucide-react';

interface GradesPageProps {
  student: Student | null;
}

export const GradesPage: React.FC<GradesPageProps> = ({ student }) => {
  const { grades, selectedPeriod, setSelectedPeriod, isLoading, stats } = useGrades(student?.id);
  const [activeGradeForModal, setActiveGradeForModal] = useState<Grade | null>(null);
  const [isOfficialReportOpen, setIsOfficialReportOpen] = useState(false);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se ha seleccionado ningún estudiante.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner de Promedio General Estilo Edtech Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 p-6 text-white shadow-card border border-indigo-500/20">
        {/* Orbes de luz de fondo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-bold border border-white/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rendimiento Académico 2026</span>
            </div>

            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Promedio General Bimestral
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-display font-black text-white font-mono">
                {stats.average}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100 pts</span>
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats.average >= 85 ? 'Cuadro de Honor • Rendimiento Sobresaliente' : 'Aprobado • Buen rendimiento académico'}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-200">
                {stats.passedCount} Materias Aprobadas (≥60)
              </span>
            </div>

            <button
              onClick={() => setIsOfficialReportOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95 shadow-sm group w-full sm:w-auto"
              title="Ver e Imprimir Boleta Oficial MINEDUC"
            >
              <FileText className="w-4 h-4 text-brand-300 group-hover:scale-110 transition-transform" />
              <span>Boleta Oficial MINEDUC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Bimestres */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
          Bimestres de Evaluación (MINEDUC)
        </label>
        <BimesterSelector
          selectedPeriod={selectedPeriod}
          onChangePeriod={setSelectedPeriod}
        />
      </div>

      {/* Lista de Calificaciones */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Áreas Curriculares CNB</span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {grades.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Zona + Examen = 100 pts</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse glass-card p-5 rounded-3xl h-28" />
            ))}
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-3xl p-6">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Sin notas para este período</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Las calificaciones de este bimestre aún están en proceso de carga por los catedráticos.
            </p>
          </div>
        ) : (
          grades.map((grade) => (
            <GradeCard
              key={grade.id}
              grade={grade}
              onViewBreakdown={(g) => setActiveGradeForModal(g)}
            />
          ))
        )}
      </div>

      {/* Modal de Desglose de Zona */}
      <GradeBreakdownModal
        grade={activeGradeForModal}
        isOpen={Boolean(activeGradeForModal)}
        onClose={() => setActiveGradeForModal(null)}
      />

      {/* Modal de Boleta Oficial MINEDUC Imprimible */}
      <OfficialReportCardModal
        isOpen={isOfficialReportOpen}
        onClose={() => setIsOfficialReportOpen(false)}
        student={student}
        grades={grades}
        period={selectedPeriod}
      />
    </div>
  );
};
