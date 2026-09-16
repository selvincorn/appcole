import React from 'react';
import { Student, StudentCurrentState } from '../../types/database.types';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  LogOut,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';

interface StatusCardProps {
  student: Student;
  currentState: StudentCurrentState;
  onOpenIdCard?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  student, 
  currentState,
  onOpenIdCard 
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    // Usar espacio indivisible para evitar que 'p. m.' se divida en dos renglones
    return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }).replace(/\s+/g, '\u00A0');
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Hoy';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const isInside = currentState.isInside;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white/95 to-slate-50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-card transition-colors">
      {/* Luz ambiental difuminada */}
      <div 
        className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25 ${
          isInside ? 'bg-emerald-500' : 'bg-slate-400'
        }`} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Foto con radar animado de presencia */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            {isInside && (
              <span className="absolute -inset-1.5 rounded-3xl bg-emerald-500/25 animate-ping duration-1000 pointer-events-none" />
            )}

            <div className="relative">
              <img
                src={student.photo_url || ''}
                alt={student.first_name}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md ${
                  isInside ? 'border-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/40' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                  isInside ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50 shrink-0">
                {student.student_code}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-0.5 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> Garita Principal
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight mt-0.5 truncate">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {student.grade_level} • Sección "{student.section}"
            </p>
          </div>
        </div>

        {/* Badge de Estatus Dinámico Estilo iOS Widget */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-slate-800">
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl font-bold text-xs shadow-xs transition-all ${
              isInside
                ? currentState.lastEventType === 'IN' && currentState.statusLabel === 'Retraso de ingreso'
                  ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/50 shadow-amber-500/10'
                  : 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/50 shadow-emerald-500/15'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isInside ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="tracking-tight">{currentState.statusLabel}</span>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Registro: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatTime(currentState.lastEventTime)}</strong></span>
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas de Horario y Tiempo */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3.5 pt-3.5 border-t border-slate-100/90 dark:border-slate-800">
        <div className="bg-slate-50/90 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${isInside ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {isInside ? <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider truncate">
              {currentState.lastEventType === 'IN' ? 'Entrada' : 'Salida'}
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
              {formatTime(currentState.lastEventTime)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 capitalize truncate">
              {formatDate(currentState.lastEventTime)}
            </p>
          </div>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider truncate">
              Jornada Matutina
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
              07:00 - 13:30
            </p>
            <p className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 truncate">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Horario Normal</span>
            </p>
          </div>
        </div>
      </div>

      {/* Botón flotante para ver carnet rápido */}
      {onOpenIdCard && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 dark:text-slate-400 text-[11px]">
            Carnet físico con código QR verificado
          </span>
          <button
            type="button"
            onClick={onOpenIdCard}
            className="text-brand-600 dark:text-brand-400 font-bold hover:text-brand-800 dark:hover:text-brand-300 transition-colors flex items-center gap-1 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 group-hover:rotate-12 transition-transform" />
            <span>Ver Carnet Digital</span>
          </button>
        </div>
      )}
    </div>
  );
};
