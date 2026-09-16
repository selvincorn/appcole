import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Student, PeriodType } from '../types/database.types';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, 
  Award, 
  Save, 
  CheckCircle2, 
  Layers, 
  RotateCcw,
  Search,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface RowGradeState {
  student: Student;
  tasks_score: number;
  partial_score: number;
  exam_score: number;
  observations: string;
  isDirty: boolean;
}

export const TeacherGradebookPage: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('BIMESTRE_1');
  const [students, setStudents] = useState<Student[]>([]);
  const [rowGrades, setRowGrades] = useState<RowGradeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Cargar materias asignadas al docente
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      try {
        const subs = await api.getTeacherSubjects(user?.id);
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubject(subs[0]);
        }
      } catch (err) {
        console.error('Error al cargar materias del docente:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, [user?.id]);

  // 2. Cargar alumnos de la sección y sus calificaciones del bimestre
  useEffect(() => {
    if (!selectedSubject) return;

    const loadSectionData = async () => {
      setIsLoading(true);
      try {
        const sectionStudents = await api.getStudentsBySection(
          selectedSubject.grade_level,
          selectedSubject.section || 'A'
        );
        setStudents(sectionStudents);

        const existingGrades = await api.getGradesForSection(
          selectedSubject.id,
          selectedPeriod
        );

        // Mapear el estado de cada fila de la planilla
        const initialRows: RowGradeState[] = sectionStudents.map(student => {
          const match = existingGrades.find(g => g.student_id === student.id);
          return {
            student,
            tasks_score: match ? Number(match.tasks_score) : 0,
            partial_score: match ? Number(match.partial_score) : 0,
            exam_score: match ? Number(match.exam_score) : 0,
            observations: match?.observations || '',
            isDirty: false,
          };
        });

        setRowGrades(initialRows);
      } catch (err) {
        console.error('Error al cargar planilla de sección:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSectionData();
  }, [selectedSubject, selectedPeriod]);

  // Manejador de cambio de puntuaciones con validación de rangos MINEDUC
  const handleScoreChange = (
    studentId: string, 
    field: 'tasks_score' | 'partial_score' | 'exam_score', 
    rawVal: string
  ) => {
    let num = Number(rawVal);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;

    // Límites de ponderación según reglamento MINEDUC
    const maxLimits = {
      tasks_score: 40,
      partial_score: 30,
      exam_score: 30,
    };

    if (num > maxLimits[field]) num = maxLimits[field];

    setRowGrades(prev =>
      prev.map(row => {
        if (row.student.id !== studentId) return row;
        return {
          ...row,
          [field]: num,
          isDirty: true,
        };
      })
    );
  };

  const handleObservationsChange = (studentId: string, text: string) => {
    setRowGrades(prev =>
      prev.map(row => {
        if (row.student.id !== studentId) return row;
        return {
          ...row,
          observations: text,
          isDirty: true,
        };
      })
    );
  };

  // Guardar todas las calificaciones de la sección
  const handleSaveAll = async () => {
    if (!selectedSubject) return;
    setIsSaving(true);
    try {
      const payload = rowGrades.map(r => ({
        student_id: r.student.id,
        subject_id: selectedSubject.id,
        period: selectedPeriod,
        tasks_score: r.tasks_score,
        partial_score: r.partial_score,
        exam_score: r.exam_score,
        observations: r.observations,
      }));

      await api.saveGradesBatch(payload);

      setRowGrades(prev => prev.map(r => ({ ...r, isDirty: false })));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error al guardar planilla:', e);
      alert('Ocurrió un error al guardar las calificaciones.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrado por búsqueda de alumno
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return rowGrades;
    const q = searchFilter.toLowerCase();
    return rowGrades.filter(r =>
      `${r.student.first_name} ${r.student.last_name}`.toLowerCase().includes(q) ||
      r.student.student_code.toLowerCase().includes(q)
    );
  }, [rowGrades, searchFilter]);

  // Estadísticas del Bimestre para la sección
  const stats = useMemo(() => {
    if (rowGrades.length === 0) return { avg: 0, passCount: 0, failCount: 0, passRate: 0 };
    let sum = 0;
    let passCount = 0;
    rowGrades.forEach(r => {
      const total = r.tasks_score + r.partial_score + r.exam_score;
      sum += total;
      if (total >= 60) passCount++;
    });
    const avg = Number((sum / rowGrades.length).toFixed(1));
    const passRate = Math.round((passCount / rowGrades.length) * 100);
    return {
      avg,
      passCount,
      failCount: rowGrades.length - passCount,
      passRate,
    };
  }, [rowGrades]);

  const anyDirty = rowGrades.some(r => r.isDirty);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Header del Módulo Docente */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card relative overflow-hidden border border-brand-500/20 shadow-soft">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-800 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
              <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Portal Docente • Control Académico CNB</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Planilla de Calificaciones por Sección
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Docente: <strong className="text-slate-800 dark:text-slate-200">{user?.full_name || 'Prof. Carlos Méndez'}</strong> • Ciclo Escolar 2026
            </p>
          </div>

          {/* Botón de Guardado Masivo Superior */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving || !anyDirty}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : anyDirty
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-brand-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Calificaciones Guardadas!</span>
              </>
            ) : isSaving ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios {anyDirty && '•'}</span>
              </>
            )}
          </button>
        </div>

        {/* Selector de Asignatura / Sección y Bimestre */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Selector de Materia y Sección */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              Asignatura & Sección Asignada:
            </label>
            <div className="relative">
              <select
                value={selectedSubject?.id || ''}
                onChange={e => {
                  const sub = subjects.find(s => s.id === e.target.value);
                  if (sub) setSelectedSubject(sub);
                }}
                className="w-full appearance-none rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all pr-10"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.grade_level} (Sección "{s.section || 'A'}")
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▾
              </div>
            </div>
          </div>

          {/* Selector de Bimestre */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Bimestre de Evaluación:
            </label>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800">
              {(['BIMESTRE_1', 'BIMESTRE_2', 'BIMESTRE_3', 'BIMESTRE_4'] as PeriodType[]).map((period, idx) => {
                const isSelected = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Bim {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Estadísticas de la Sección */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Matrícula Sección
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {students.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">alumnos</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Promedio Sección
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-black font-mono ${stats.avg >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {stats.avg}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Aprobados (≥60)
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.passCount}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold">
              ({stats.passRate}%)
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            En Riesgo (&lt;60)
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-black font-mono ${stats.failCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {stats.failCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">alumnos</span>
          </div>
        </div>
      </div>

      {/* 3. Tabla Planilla de Ingreso de Calificaciones */}
      <div className="rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft">
        {/* Cabecera de la tabla con barra de búsqueda */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                Planilla Oficial de Notas — {selectedSubject?.grade_level} Sección "{selectedSubject?.section || 'A'}"
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ponderación MINEDUC: Zona (40 pts) + Parciales (30 pts) + Examen (30 pts) = 100 pts.
              </p>
            </div>
          </div>

          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o carnet..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Contenedor responsivo con scroll horizontal suave para móviles */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/80 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
                <th className="py-3 px-3 sm:px-4 min-w-[180px]">Estudiante</th>
                <th className="py-3 px-2 sm:px-3 text-center min-w-[90px]">
                  Zona <span className="block text-[9px] text-brand-600 font-bold">(Máx 40)</span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center min-w-[90px]">
                  Parciales <span className="block text-[9px] text-brand-600 font-bold">(Máx 30)</span>
                </th>
                <th className="py-3 px-2 sm:px-3 text-center min-w-[90px]">
                  Examen <span className="block text-[9px] text-brand-600 font-bold">(Máx 30)</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[85px]">
                  Total <span className="block text-[9px] text-slate-500 font-bold">/ 100</span>
                </th>
                <th className="py-3 px-3 min-w-[170px]">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5 animate-spin text-brand-600" />
                      <span>Cargando planilla de la sección...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                    No se encontraron estudiantes para esta sección.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const total = row.tasks_score + row.partial_score + row.exam_score;
                  const isPassing = total >= 60;

                  return (
                    <tr 
                      key={row.student.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        row.isDirty ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Índice */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>

                      {/* Info del Estudiante */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.student.photo_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop&crop=faces'}
                            alt={row.student.first_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                              {row.student.last_name}, {row.student.first_name}
                            </p>
                            <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-semibold">
                              {row.student.student_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Input Zona / Tareas (40 pts) */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          step={1}
                          value={row.tasks_score === 0 ? '' : row.tasks_score}
                          placeholder="0"
                          onChange={e => handleScoreChange(row.student.id, 'tasks_score', e.target.value)}
                          className="w-16 sm:w-20 text-center py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Input Parciales (30 pts) */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          step={1}
                          value={row.partial_score === 0 ? '' : row.partial_score}
                          placeholder="0"
                          onChange={e => handleScoreChange(row.student.id, 'partial_score', e.target.value)}
                          className="w-16 sm:w-20 text-center py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Input Examen Bimestral (30 pts) */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          step={1}
                          value={row.exam_score === 0 ? '' : row.exam_score}
                          placeholder="0"
                          onChange={e => handleScoreChange(row.student.id, 'exam_score', e.target.value)}
                          className="w-16 sm:w-20 text-center py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Nota Total Calculada */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl font-mono font-black text-xs sm:text-sm shadow-xs ${
                            isPassing
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-700/60'
                          }`}
                        >
                          {total}
                        </span>
                      </td>

                      {/* Observaciones Cualitativas */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Ej: Excelente desempeño..."
                          value={row.observations}
                          onChange={e => handleObservationsChange(row.student.id, e.target.value)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla con botón de guardado */}
        <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            * Nota mínima de aprobación en Guatemala: <strong>60 puntos</strong> según Acuerdo Ministerial del MINEDUC.
          </p>

          <button
            onClick={handleSaveAll}
            disabled={isSaving || !anyDirty}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : anyDirty
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-brand-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Guardado con éxito!</span>
              </>
            ) : isSaving ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Guardando cambios en Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Calificaciones de la Sección</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
