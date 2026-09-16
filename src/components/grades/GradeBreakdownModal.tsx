import React from 'react';
import { Grade } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { 
  FileSpreadsheet, 
  BookOpen, 
  Layers, 
  MessageSquare,
  Award
} from 'lucide-react';

interface GradeBreakdownModalProps {
  grade: Grade | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GradeBreakdownModal: React.FC<GradeBreakdownModalProps> = ({
  grade,
  isOpen,
  onClose,
}) => {
  if (!grade) return null;

  const total = Number(grade.total_score) || 0;
  const tasks = Number(grade.tasks_score) || 0;
  const partial = Number(grade.partial_score) || 0;
  const exam = Number(grade.exam_score) || 0;

  const isApproved = total >= 60;
  const isExcellent = total >= 90;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={grade.subject?.name || 'Detalle de Calificación'}
      subtitle={`${grade.period.replace('_', ' ')} • ${grade.subject?.teacher_name || 'Catedrático Titular'}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Banner de Nota Total */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 text-white flex items-center justify-between shadow-lg border border-indigo-500/30">
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Calificación Bimestral CNB
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-display font-black">{total}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100 pts</span>
            </div>
            <p className="text-xs text-brand-300 font-medium mt-1">
              {isExcellent ? '¡Rendimiento Sobresaliente!' : isApproved ? 'Materia Aprobada (Mínimo 60 pts MINEDUC)' : 'En Riesgo de Recuperación'}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Desglose de Componentes Evaluativos */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Desglose de Zona y Evaluación (Reglamento MINEDUC)
          </p>

          {/* 1. Zona de Tareas */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Zona de Tareas y Cuaderno</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Guías, lecturas y tareas individuales</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">{tasks}</span>
              <span className="text-xs text-slate-400 font-medium"> / 40 pts</span>
            </div>
          </div>

          {/* 2. Evaluaciones Parciales */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Laboratorios y Proyectos CNB</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Talleres prácticos y pruebas cortas</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">{partial}</span>
              <span className="text-xs text-slate-400 font-medium"> / 30 pts</span>
            </div>
          </div>

          {/* 3. Examen Bimestral */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Evaluación Bimestral Final</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Evaluación sumativa de unidad</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">{exam}</span>
              <span className="text-xs text-slate-400 font-medium"> / 30 pts</span>
            </div>
          </div>
        </div>

        {/* Observaciones del Maestro */}
        {grade.observations && (
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Observaciones del Catedrático:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "{grade.observations}"
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white font-bold text-xs transition-colors"
        >
          Cerrar Detalle
        </button>
      </div>
    </Modal>
  );
};
