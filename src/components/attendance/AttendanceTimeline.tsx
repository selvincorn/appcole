import React from 'react';
import { AttendanceLog } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { 
  LogIn, 
  LogOut, 
  MapPin, 
  Clock, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface AttendanceTimelineProps {
  logs: AttendanceLog[];
  isLoading: boolean;
}

export const AttendanceTimeline: React.FC<AttendanceTimelineProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse glass-card p-4 rounded-3xl flex gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Sin registros de asistencia</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
          Los ingresos y salidas registrados por el personal de garita aparecerán aquí en tiempo real.
        </p>
      </div>
    );
  }

  // Agrupar logs por día
  const groupedLogs: { [dateStr: string]: AttendanceLog[] } = {};
  logs.forEach(log => {
    const d = new Date(log.event_time);
    const key = d.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groupedLogs[key]) groupedLogs[key] = [];
    groupedLogs[key].push(log);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
        <div key={dateLabel} className="space-y-3">
          {/* Cabecera de fecha con estilo píldora minimalista */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider capitalize">
              {dateLabel}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent" />
          </div>

          {/* Lista de eventos del día */}
          <div className="relative pl-3 space-y-3 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-brand-200 dark:before:from-brand-800 before:via-indigo-100 dark:before:via-indigo-900 before:to-slate-200 dark:before:to-slate-800">
            {dayLogs.map((log) => {
              const isEntry = log.event_type === 'IN';
              const isLate = log.status === 'LATE';
              const timeFormatted = new Date(log.event_time).toLocaleTimeString('es-GT', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="relative glass-card p-4 rounded-3xl transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3.5 group"
                >
                  {/* Icono de evento con gradiente */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                      isEntry
                        ? isLate
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-amber-500/20'
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isEntry ? (
                      <LogIn className="w-5 h-5 stroke-[2.3px]" />
                    ) : (
                      <LogOut className="w-5 h-5 stroke-[2.3px]" />
                    )}
                  </div>

                  {/* Detalle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {isEntry ? 'Ingreso al Colegio' : 'Salida del Colegio'}
                        </h4>
                        {isLate && (
                          <Badge variant="amber" size="sm">
                            Retraso
                          </Badge>
                        )}
                        {log.status === 'ON_TIME' && isEntry && (
                          <Badge variant="emerald" size="sm">
                            Puntual
                          </Badge>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {timeFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Notas del inspector */}
                    {log.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {log.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-brand-500" />
                        {log.device_info || 'Garita Principal'}
                      </span>
                      {log.scanned_by && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Escaneado en Puerta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
