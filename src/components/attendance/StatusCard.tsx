import React from 'react';
import { Student, StudentCurrentState } from '../../types/database.types';
import { 
  Building2, 
  Clock, 
  LogOut, 
  MapPin, 
  Calendar,
  QrCode,
  ShieldCheck,
  Info
} from 'lucide-react';

interface StatusCardProps {
  student: Student;
  currentState: StudentCurrentState;
  onOpenIdCard?: () => void;
  onOpenGatePass?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  student, 
  currentState,
  onOpenIdCard,
  onOpenGatePass 
}) => {
  // Formateador consistente de horas en español (ej: "07:18 a. m.")
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-GT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).replace(/\s+/g, '\u00A0');
  };

  // Formateador consistente de fechas (ej: "Jueves, 17 de Septiembre")
  const formatDateFull = (isoString?: string) => {
    const date = isoString ? new Date(isoString) : new Date();
    return date.toLocaleDateString('es-GT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const isInside = currentState.isInside;
  const isLate = currentState.lastEventType === 'IN' && currentState.statusLabel === 'Retraso de ingreso';
  const hasRecords = Boolean(currentState.lastEventTime);

  // Determinar texto explicativo para padres (sin tecnicismos)
  const getExplanationText = () => {
    if (!hasRecords) {
      return `Aún no se registran movimientos para ${student.first_name} en la garita el día de hoy.`;
    }
    if (isInside) {
      if (isLate) {
        return `${student.first_name} ingresó al colegio hoy a las ${formatTime(currentState.lastEventTime)} con reporte de retraso. Se encuentra actualmente en sus clases.`;
      }
      return `${student.first_name} ingresó puntualmente al colegio hoy a las ${formatTime(currentState.lastEventTime)} por la Garita Principal. Se encuentra dentro del establecimiento.`;
    }
    return `${student.first_name} se retiró del colegio hoy a las ${formatTime(currentState.lastEventTime)}. La jornada escolar ha finalizado o cuenta con salida autorizada.`;
  };

  return (
    <section 
      aria-label="Estado actual del estudiante"
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-300"
    >
      {/* Resplandor ambiental de estatus */}
      <div 
        className={`absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 ${
          !hasRecords 
            ? 'bg-slate-400' 
            : isInside 
            ? (isLate ? 'bg-amber-500' : 'bg-emerald-500') 
            : 'bg-indigo-500'
        }`} 
      />

      {/* 1. HERO BANNER: Estado Principal (Visible en 2 segundos) */}
      <div 
        className={`p-4 sm:p-5 border-b transition-colors ${
          !hasRecords
            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
            : isInside
            ? isLate
              ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-300/80 dark:border-amber-700/50 text-amber-950 dark:text-amber-200'
              : 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border-emerald-300/80 dark:border-emerald-700/50 text-emerald-950 dark:text-emerald-200'
            : 'bg-gradient-to-r from-slate-500/15 via-indigo-500/10 to-transparent border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Identidad del Alumno con Radar de Presencia */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {isInside && (
                <span className="absolute -inset-1 rounded-2xl bg-emerald-500/30 animate-ping duration-1000 pointer-events-none" />
              )}
              <img
                src={student.photo_url || ''}
                alt={`Foto de ${student.first_name} ${student.last_name}`}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 shadow-sm ${
                  !hasRecords
                    ? 'border-slate-300 dark:border-slate-700'
                    : isInside 
                    ? (isLate ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-emerald-500 ring-2 ring-emerald-400/30')
                    : 'border-slate-400 dark:border-slate-600'
                }`}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                  !hasRecords
                    ? 'bg-slate-400'
                    : isInside
                    ? (isLate ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse')
                    : 'bg-slate-400'
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-mono">
                  {student.student_code}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  {student.grade_level} • Sec. "{student.section}"
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
                {student.first_name} {student.last_name}
              </h2>
            </div>
          </div>

          {/* Gran Insignia de Estado */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition-transform ${
                !hasRecords
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : isInside
                  ? isLate
                    ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-amber-500/20 ring-2 ring-amber-500/30'
                    : 'bg-emerald-600 text-white border border-emerald-500 shadow-emerald-600/25 ring-2 ring-emerald-500/30'
                  : 'bg-slate-800 text-slate-100 border border-slate-700 shadow-xs'
              }`}
            >
              {isInside ? (
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px] animate-bounce-short" />
              ) : (
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
              )}
              <span className="tracking-tight uppercase">
                {isInside ? 'En Colegio' : 'Fuera del Colegio'}
              </span>
            </div>
          </div>
        </div>

        {/* Frase narrativa clara en español */}
        <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {getExplanationText()}
          </p>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS CLAVE (Hora, Jornada, Puerta de Control) */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          
          {/* Métrica 1: Último Registro de Entrada/Salida */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isInside 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {currentState.lastEventType === 'IN' ? 'Hora de Ingreso Real' : 'Hora de Salida'}
                </span>
                {isInside && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isLate 
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  }`}>
                    {isLate ? 'Con Retraso' : 'Puntual'}
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
                {formatTime(currentState.lastEventTime)}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span className="truncate">Garita Principal • Puerta A</span>
              </p>
            </div>
          </div>

          {/* Métrica 2: Horario Escolar Programado */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Jornada Escolar
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Matutina
                </span>
              </div>

              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
                07:00 a. m. – 01:30 p. m.
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate mt-0.5">
                {formatDateFull(currentState.lastEventTime)}
              </p>
            </div>
          </div>
        </div>

        {/* 3. ACCIONES RÁPIDAS VINCULADAS AL ESTADO */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Escaneo QR en garita verificado</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGatePass && (
              <button
                type="button"
                onClick={onOpenGatePass}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pase de Salida</span>
              </button>
            )}

            {onOpenIdCard && (
              <button
                type="button"
                onClick={onOpenIdCard}
                className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Carnet Digital</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
