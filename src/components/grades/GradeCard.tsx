import React from 'react';
import { Grade } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { ChevronRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface GradeCardProps {
  grade: Grade;
  onViewBreakdown: (grade: Grade) => void;
}

export const GradeCard: React.FC<GradeCardProps> = ({ grade, onViewBreakdown }) => {
  const total = Number(grade.total_score) || 0;

  let barGradient = 'from-brand-600 to-indigo-500';
  let badgeVariant: 'emerald' | 'blue' | 'amber' | 'rose' = 'blue';
  let statusText = 'Aprobada';
  let isHonor = false;

  if (total >= 90) {
    barGradient = 'from-emerald-500 to-teal-400';
    badgeVariant = 'emerald';
    statusText = 'Excelente';
    isHonor = true;
  } else if (total >= 75) {
    barGradient = 'from-brand-600 to-indigo-500';
    badgeVariant = 'blue';
    statusText = 'Muy Bueno';
  } else if (total >= 60) {
    barGradient = 'from-amber-500 to-amber-400';
    badgeVariant = 'amber';
    statusText = 'Aprobada';
  } else {
    barGradient = 'from-rose-500 to-rose-400';
    badgeVariant = 'rose';
    statusText = 'En Riesgo';
  }

  const zoneScore = (Number(grade.tasks_score) || 0) + (Number(grade.partial_score) || 0);

  return (
    <div className="glass-card p-4 sm:p-5 rounded-3xl transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-50 to-indigo-100/70 dark:from-brand-950 dark:to-indigo-950/70 border border-brand-200/50 dark:border-brand-800/50 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-display font-black text-slate-900 dark:text-white leading-tight">
                {grade.subject?.name || 'Materia'}
              </h4>
              {isHonor && (
                <span title="Rendimiento de Honor">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {grade.subject?.teacher_name || 'Catedrático Titular'}
            </p>
          </div>
        </div>

        {/* Puntuación grande destacada */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-display font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {total}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">/ 100</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-0.5 mt-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> ≥60 pts
          </span>
        </div>
      </div>

      {/* Barra de progreso de nota con gradiente dinámico */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3.5 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 shadow-xs`}
          style={{ width: `${Math.min(100, Math.max(0, total))}%` }}
        />
      </div>

      {/* Fila inferior con zona y botón de desglose */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/90 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} size="sm">
            {statusText}
          </Badge>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Zona: <strong className="text-slate-800 dark:text-slate-100 font-bold">{zoneScore} pts</strong>
          </span>
        </div>

        <button
          onClick={() => onViewBreakdown(grade)}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors group-hover:translate-x-0.5"
        >
          <span>Ver Desglose</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
