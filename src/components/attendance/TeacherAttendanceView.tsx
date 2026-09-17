import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Student, AttendanceLog } from '../../types/database.types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  MapPin
} from 'lucide-react';

export const TeacherAttendanceView: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Cargar materias asignadas
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      try {
        const subs = await api.getTeacherSubjects(user?.id);
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubject(subs[0]);
        }
      } catch (e) {
        console.error('Error loading teacher subjects', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, [user?.id]);

  // 2. Cargar alumnos y asistencias de la sección seleccionada
  useEffect(() => {
    if (!selectedSubject) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const sectionStudents = await api.getStudentsBySection(
          selectedSubject.grade_level,
          selectedSubject.section || 'A'
        );
        setStudents(sectionStudents);

        // Cargar logs de cada alumno
        const allLogs: AttendanceLog[] = [];
        for (const st of sectionStudents) {
          const logs = await api.getAttendanceLogs(st.id);
          if (logs.length > 0) {
            allLogs.push(logs[0]); // El movimiento más reciente de cada alumno
          }
        }
        setAttendanceLogs(allLogs);
      } catch (e) {
        console.error('Error loading section attendance', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSubject]);

  // Filtrar alumnos por búsqueda
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchFilter.toLowerCase();
      return (
        st.first_name.toLowerCase().includes(q) ||
        st.last_name.toLowerCase().includes(q) ||
        st.student_code.toLowerCase().includes(q)
      );
    });
  }, [students, searchFilter]);

  // Calcular métricas de la clase
  const metrics = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;

    students.forEach(st => {
      const log = attendanceLogs.find(l => l.student_id === st.id);
      if (log && log.event_type === 'IN') {
        if (log.status === 'LATE') late++;
        else present++;
      } else {
        absent++;
      }
    });

    return { total: students.length, present, late, absent };
  }, [students, attendanceLogs]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\s+/g, '\u00A0');
  };

  return (
    <div className="space-y-4">
      {/* Cabecera del Aula */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
                  Control de Asistencia del Aula
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold">
                  Docente
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoreo en tiempo real de alumnos presentes en tu clase hoy
              </p>
            </div>
          </div>

          {/* Selector de Sección Asignada */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Sección:
            </span>
            <select
              value={selectedSubject?.id || ''}
              onChange={e => {
                const found = subjects.find(s => s.id === e.target.value);
                if (found) setSelectedSubject(found);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.grade_level} - Sec. "{sub.section || 'A'}" ({sub.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tarjetas de Resumen de Presencia */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{metrics.total}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">En Aula</span>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono">{metrics.present}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Retardos</span>
            <span className="text-lg font-black text-amber-800 dark:text-amber-300 font-mono">{metrics.late}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Ausentes</span>
            <span className="text-lg font-black text-rose-800 dark:text-rose-300 font-mono">{metrics.absent}</span>
          </div>
        </div>
      </div>

      {/* Buscador de Alumnos */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar alumno por nombre o carnet..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-soft"
        />
      </div>

      {/* Listado de Alumnos de la Sección */}
      {isLoading ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          Cargando alumnos de la sección...
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStudents.map(student => {
            const log = attendanceLogs.find(l => l.student_id === student.id);
            const isInside = log?.event_type === 'IN';
            const isLate = log?.status === 'LATE';

          return (
            <div
              key={student.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={student.photo_url || ''}
                    alt={student.first_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      isInside ? (isLate ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {student.first_name} {student.last_name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {student.student_code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-500" />
                    <span>{log?.device_info || 'Sin registro en garita hoy'}</span>
                  </p>
                </div>
              </div>

              {/* Estado de Asistencia */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                    isInside
                      ? isLate
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isInside ? (
                    isLate ? <AlertTriangle className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : null}
                  <span>{isInside ? (isLate ? 'Tarde' : 'Presente') : 'Ausente'}</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {log?.event_time ? formatTime(log.event_time) : '--:--'}
                </p>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
