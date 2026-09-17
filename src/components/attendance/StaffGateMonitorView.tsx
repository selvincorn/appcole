import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  ScanLine, 
  Search, 
  MapPin, 
  AlertTriangle
} from 'lucide-react';
import { INITIAL_ATTENDANCE_LOGS, MOCK_STUDENTS } from '../../services/mockData';

interface StaffGateMonitorViewProps {
  onOpenScanner?: () => void;
}

export const StaffGateMonitorView: React.FC<StaffGateMonitorViewProps> = ({ onOpenScanner }) => {
  const [logs] = useState(() => {
    try {
      const stored = localStorage.getItem('appcole_demo_attendance_logs');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_ATTENDANCE_LOGS;
  });

  const [gateFilter, setGateFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Formato homogéneo de horas
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\s+/g, '\u00A0');
  };

  // Filtrado de registros de garita
  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const student = log.student || MOCK_STUDENTS.find(s => s.id === log.student_id);
      const studentName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
      const code = student?.student_code?.toLowerCase() || '';
      const q = searchQuery.toLowerCase();

      const matchesSearch = studentName.includes(q) || code.includes(q);
      const matchesGate = gateFilter === 'ALL' || (log.device_info || '').toLowerCase().includes(gateFilter.toLowerCase());

      return matchesSearch && matchesGate;
    });
  }, [logs, searchQuery, gateFilter]);

  return (
    <div className="space-y-4">
      
      {/* Cabecera del Monitor de Seguridad */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
                  Monitor de Accesos en Garita
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Seguridad
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control general de entradas, salidas y flujo de alumnos en el campus
              </p>
            </div>
          </div>

          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              <span>Abrir Escáner QR</span>
            </button>
          )}
        </div>

        {/* Resumen del Campus */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">En Campus</span>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono">3 Alumnos</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Fuera</span>
            <span className="text-lg font-black text-slate-700 dark:text-slate-200 font-mono">1 Alumno</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase block">Entradas Hoy</span>
            <span className="text-lg font-black text-indigo-800 dark:text-indigo-300 font-mono">4</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Salidas Hoy</span>
            <span className="text-lg font-black text-amber-800 dark:text-amber-300 font-mono">2</span>
          </div>
        </div>
      </div>

      {/* Filtros de Puerta y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por carnet o nombre del alumno..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-soft"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setGateFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              gateFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todas las Puertas
          </button>
          <button
            type="button"
            onClick={() => setGateFilter('Principal')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              gateFilter === 'Principal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Garita Principal
          </button>
          <button
            type="button"
            onClick={() => setGateFilter('Buses')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              gateFilter === 'Buses'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Buses Escolares
          </button>
        </div>
      </div>

      {/* Flujo de Escaneos de Garita */}
      <div className="space-y-2.5">
        {filteredLogs.map((log: any) => {
          const student = log.student || MOCK_STUDENTS.find(s => s.id === log.student_id);
          const isEntry = log.event_type === 'IN';
          const isLate = log.status === 'LATE';

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={student?.photo_url || ''}
                    alt={student?.first_name || 'Alumno'}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      isEntry ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {student ? `${student.first_name} ${student.last_name}` : 'Alumno'}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {student?.student_code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>{log.device_info || 'Garita Principal'} • {log.notes || 'Registro normal'}</span>
                  </p>
                </div>
              </div>

              {/* Registro y Hora */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                    isEntry
                      ? isLate
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200'
                  }`}
                >
                  {isEntry ? (
                    isLate ? <AlertTriangle className="w-3 h-3" /> : <LogIn className="w-3 h-3" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )}
                  <span>{isEntry ? (isLate ? 'Entrada Tarde' : 'Entrada') : 'Salida'}</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {formatTime(log.event_time)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
