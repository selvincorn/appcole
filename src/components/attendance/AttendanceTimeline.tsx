import React, { useState, useMemo } from 'react';
import { AttendanceLog } from '../../types/database.types';
import { 
  LogIn, 
  LogOut, 
  MapPin, 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Bus,
  ShieldCheck,
  ChevronDown,
  Filter,
  User
} from 'lucide-react';

interface AttendanceTimelineProps {
  logs: AttendanceLog[];
  isLoading: boolean;
}

type EventFilter = 'ALL' | 'IN' | 'OUT' | 'BUS' | 'LATE';

export const AttendanceTimeline: React.FC<AttendanceTimelineProps> = ({ logs, isLoading }) => {
  const [activeFilter, setActiveFilter] = useState<EventFilter>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Formateador consistente de horas en español (ej: "07:18 a. m.")
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-GT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).replace(/\s+/g, '\u00A0');
  };

  // Filtrado de eventos
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeFilter === 'IN') return log.event_type === 'IN';
      if (activeFilter === 'OUT') return log.event_type === 'OUT';
      if (activeFilter === 'LATE') return log.status === 'LATE';
      if (activeFilter === 'BUS') {
        const notes = (log.notes || '').toLowerCase();
        const dev = (log.device_info || '').toLowerCase();
        return notes.includes('bus') || dev.includes('bus') || notes.includes('transporte');
      }
      return true;
    });
  }, [logs, activeFilter]);

  // Agrupar logs por día
  const groupedLogs = useMemo(() => {
    const groups: { [dateKey: string]: { label: string; logs: AttendanceLog[] } } = {};
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredLogs.forEach((log) => {
      const d = new Date(log.event_time);
      const dateStr = d.toDateString();
      
      let displayLabel = d.toLocaleDateString('es-GT', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });

      if (dateStr === today) {
        displayLabel = `Hoy • ${displayLabel}`;
      } else if (dateStr === yesterday) {
        displayLabel = `Ayer • ${displayLabel}`;
      }

      if (!groups[dateStr]) {
        groups[dateStr] = { label: displayLabel, logs: [] };
      }
      groups[dateStr].logs.push(log);
    });

    return groups;
  }, [filteredLogs]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 1. Barra de Filtros Rápidos */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 pl-1 shrink-0">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>

        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'ALL'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-400'
          }`}
        >
          Todos ({logs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('IN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'IN'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Entradas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('OUT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'OUT'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salidas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('BUS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'BUS'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-800 hover:border-sky-400'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>Bus Escolar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('LATE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            activeFilter === 'LATE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Retrasos</span>
        </button>
      </div>

      {/* 2. Estado Vacío cuando no hay registros */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {activeFilter === 'ALL' ? 'Sin registros de asistencia' : 'No hay eventos en este filtro'}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {activeFilter === 'ALL' 
              ? 'Los ingresos y salidas registrados con carnet QR en garita se sincronizarán aquí automáticamente.'
              : 'Prueba seleccionando la pestaña "Todos" para ver el historial completo.'}
          </p>
          {activeFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs border border-brand-200 dark:border-brand-800"
            >
              Ver todos los eventos
            </button>
          )}
        </div>
      )}

      {/* 3. Línea de Tiempo Vertical Agrupada por Días */}
      {Object.entries(groupedLogs).map(([dateKey, group]) => (
        <div key={dateKey} className="space-y-3">
          
          {/* Cabecera de Fecha con estilo elegante */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider capitalize">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
          </div>

          {/* Lista de Eventos con Conector Vertical */}
          <div className="relative pl-3 space-y-3 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-brand-300 dark:before:from-brand-700 before:via-indigo-200 dark:before:via-indigo-900 before:to-slate-200 dark:before:to-slate-800">
            {group.logs.map((log) => {
              const isEntry = log.event_type === 'IN';
              const isLate = log.status === 'LATE';
              const notesLower = (log.notes || '').toLowerCase();
              const isBus = notesLower.includes('bus') || notesLower.includes('transporte');
              const isPass = notesLower.includes('pase') || notesLower.includes('autorizada') || notesLower.includes('retiro');
              const isExpanded = expandedLogId === log.id;

              // Título amigable del evento
              let eventTitle = isEntry ? 'Ingreso al Colegio' : 'Salida del Colegio';
              if (isBus) eventTitle = 'Salida en Bus Escolar';
              if (isPass) eventTitle = 'Salida / Pase Autorizado';

              return (
                <div
                  key={log.id}
                  onClick={() => toggleExpand(log.id)}
                  className={`relative bg-white dark:bg-slate-900 p-4 rounded-3xl border transition-all duration-200 cursor-pointer shadow-soft hover:shadow-md ${
                    isExpanded 
                      ? 'border-brand-500/70 dark:border-brand-500/60 ring-2 ring-brand-500/10' 
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    
                    {/* Icono de Evento Semántico */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform ${
                        isEntry
                          ? isLate
                            ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/20'
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20'
                          : isBus
                          ? 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-sky-500/20'
                          : isPass
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20'
                          : 'bg-gradient-to-tr from-indigo-600 to-slate-700 text-white shadow-indigo-500/20'
                      }`}
                    >
                      {isEntry ? (
                        <LogIn className="w-5 h-5 stroke-[2.3px]" />
                      ) : isBus ? (
                        <Bus className="w-5 h-5 stroke-[2.3px]" />
                      ) : isPass ? (
                        <ShieldCheck className="w-5 h-5 stroke-[2.3px]" />
                      ) : (
                        <LogOut className="w-5 h-5 stroke-[2.3px]" />
                      )}
                    </div>

                    {/* Contenido Principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <h4 className="text-sm font-display font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                            {eventTitle}
                          </h4>
                          
                          {/* Badges Semánticos */}
                          {isLate && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              Retraso
                            </span>
                          )}
                          {log.status === 'ON_TIME' && isEntry && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              Puntual
                            </span>
                          )}
                          {isBus && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                              Transporte
                            </span>
                          )}
                        </div>

                        {/* Hora grande con formato homogéneo */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight">
                            {formatTime(log.event_time)}
                          </span>
                        </div>
                      </div>

                      {/* Breve descripción o notas */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                        {log.notes || (isEntry ? 'Ingreso normal por garita principal' : 'Salida registrada')}
                      </p>

                      {/* Ubicación y Guardia */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium truncate">
                          <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                          <span className="truncate">{log.device_info || 'Garita Principal'}</span>
                        </span>

                        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold shrink-0">
                          <span>{isExpanded ? 'Ocultar' : 'Ver detalle'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle Expandible al Tocar */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 uppercase font-bold block text-[9px]">Registrado por:</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-emerald-500" />
                            <span>Oficial Juan Pérez (Garita)</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase font-bold block text-[9px]">Método de Verificación:</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-brand-500" />
                            <span>Lector Óptico de Carnet QR</span>
                          </p>
                        </div>
                      </div>

                      {log.notes && (
                        <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-400 uppercase font-bold block text-[9px]">Observaciones del inspector:</span>
                          <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                            "{log.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
