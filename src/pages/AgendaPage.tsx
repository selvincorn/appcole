import React, { useState } from 'react';
import { Student } from '../types/database.types';
import { useAuth } from '../hooks/useAuth';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Plus, 
  BellRing, 
  Check, 
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  dueDay: string;
  points: number;
  isCompleted: boolean;
  gradeLevel: string;
  section: string;
}

interface CircularItem {
  id: string;
  number: string;
  title: string;
  date: string;
  content: string;
  category: 'Academica' | 'General' | 'Financiera';
  isAcknowledged: boolean;
}

const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    subject: 'Matemáticas',
    title: 'Resolución de problemas de multiplicación (págs. 45-48)',
    description: 'Completar los ejercicios del libro de texto y dejar constancia de los procedimientos en el cuaderno.',
    dueDate: 'Mañana, 07:30 AM',
    dueDay: 'Jueves',
    points: 10,
    isCompleted: false,
    gradeLevel: '3ro Primaria',
    section: 'A'
  },
  {
    id: 'hw-2',
    subject: 'Ciencias Naturales',
    title: 'Maqueta o dibujo del ciclo del agua',
    description: 'Elaborar un esquema creativo rotulando las 4 etapas: evaporación, condensación, precipitación y recolección.',
    dueDate: 'Viernes 20 de marzo',
    dueDay: 'Viernes',
    points: 15,
    isCompleted: false,
    gradeLevel: '3ro Primaria',
    section: 'A'
  },
  {
    id: 'hw-3',
    subject: 'Comunicación y Lenguaje',
    title: 'Lectura y comprensión: "El Reino del Quetzal"',
    description: 'Leer las páginas 32 a 36 y responder las 5 preguntas del cuestionario en hojas con líneas.',
    dueDate: 'Lunes 23 de marzo',
    dueDay: 'Lunes',
    points: 5,
    isCompleted: true,
    gradeLevel: '3ro Primaria',
    section: 'A'
  },
  {
    id: 'hw-4',
    subject: 'Educación Artística',
    title: 'Técnica de puntillismo con témperas',
    description: 'Traer el block de dibujo y estuche de hisopos para la práctica guiada en el aula.',
    dueDate: 'Martes 24 de marzo',
    dueDay: 'Martes',
    points: 10,
    isCompleted: false,
    gradeLevel: '3ro Primaria',
    section: 'A'
  }
];

const INITIAL_CIRCULARS: CircularItem[] = [
  {
    id: 'circ-1',
    number: 'Circular No. 04-2026',
    title: 'Celebración del Día de la Familia y Kermesse Solidaria',
    date: '15 de marzo, 2026',
    category: 'General',
    content: 'Estimada comunidad educativa: Les invitamos cordialmente a nuestra tradicional Kermesse Familiar este domingo 22 de marzo a partir de las 09:00 AM en las instalaciones del colegio. Habrá venta de antojitos típicos, juegos inflables y presentaciones artísticas de los alumnos.',
    isAcknowledged: true
  },
  {
    id: 'circ-2',
    number: 'Circular No. 05-2026',
    title: 'Calendario de Evaluaciones del Primer Bimestre (MINEDUC)',
    date: '12 de marzo, 2026',
    category: 'Academica',
    content: 'Se hace del conocimiento de los señores padres de familia que las pruebas bimestrales correspondientes al Primer Bimestre darán inicio el próximo lunes 30 de marzo. Recordamos que para ingresar al salón de evaluación los alumnos deben portar su carnet escolar y constancia de solvencia al día.',
    isAcknowledged: false
  }
];

interface AgendaPageProps {
  student: Student | null;
}

export const AgendaPage: React.FC<AgendaPageProps> = ({ student }) => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'homework' | 'circulars'>('homework');
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(INITIAL_HOMEWORK);
  const [circulars, setCirculars] = useState<CircularItem[]>(INITIAL_CIRCULARS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Modal para que el profesor cree nueva tarea
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matemáticas');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPoints, setNewPoints] = useState(10);

  const toggleHomeworkCompletion = (id: string) => {
    setHomeworkList(prev => prev.map(hw => {
      if (hw.id === id) {
        const nextState = !hw.isCompleted;
        if (nextState) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch (e) {
            // confetti fallback
          }
        }
        return { ...hw, isCompleted: nextState };
      }
      return hw;
    }));
  };

  const toggleCircularAck = (id: string) => {
    setCirculars(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isAcknowledged: !c.isAcknowledged };
      }
      return c;
    }));
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: HomeworkItem = {
      id: 'hw-' + Date.now(),
      subject: newSubject,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Completar según indicaciones dadas en clase.',
      dueDate: newDueDate || 'Próxima semana',
      dueDay: 'Próxima semana',
      points: Number(newPoints) || 10,
      isCompleted: false,
      gradeLevel: student?.grade_level || '3ro Primaria',
      section: student?.section || 'A'
    };

    setHomeworkList([newItem, ...homeworkList]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
  };

  const filteredHomework = homeworkList.filter(hw => {
    if (statusFilter === 'pending') return !hw.isCompleted;
    if (statusFilter === 'completed') return hw.isCompleted;
    return true;
  });

  const pendingCount = homeworkList.filter(h => !h.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Banner Principal de la Agenda */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 p-6 text-white shadow-card border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/10 mb-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Agenda Escolar Digital 2026</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-black text-white">
              Tareas y Comunicados
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Seguimiento de tareas diarias de zona, proyectos y circulares de Dirección para <strong>{student?.first_name || 'el alumno'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === 'TEACHER' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/30 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Tarea</span>
              </button>
            )}

            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
              <span className="text-lg font-black text-amber-300 font-mono block leading-none">
                {pendingCount}
              </span>
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                Pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de la Agenda */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('homework')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'homework'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tareas y Zona ({homeworkList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('circulars')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'circulars'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Circulares Oficiales ({circulars.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Tareas */}
      {activeTab === 'homework' && (
        <div className="space-y-3 pt-1">
          {/* Filtros de estado */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 dark:bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Por Entregar ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Completadas
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Marca la casilla al completar cada tarea
            </span>
          </div>

          {/* Lista de Tareas */}
          <div className="space-y-2.5">
            {filteredHomework.map((hw) => (
              <div
                key={hw.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hw.isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-brand-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleHomeworkCompletion(hw.id)}
                    className="mt-0.5 p-1 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    title={hw.isCompleted ? 'Marcar como pendiente' : 'Marcar como entregada'}
                  >
                    {hw.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 hover:text-brand-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 text-[10px] font-extrabold uppercase tracking-wider">
                        {hw.subject}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Entrega: {hw.dueDate}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 ml-auto">
                        +{hw.points} pts zona
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${hw.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {hw.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Circulares Oficiales */}
      {activeTab === 'circulars' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Comunicados Oficiales de Dirección General
            </h3>
            <span className="text-xs text-slate-400">Ciclo Escolar 2026</span>
          </div>

          <div className="space-y-3">
            {circulars.map((circ) => (
              <div
                key={circ.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      {circ.number} • {circ.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {circ.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">{circ.date}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                    circ.isAcknowledged 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {circ.isAcknowledged ? 'Enterado ✓' : 'Pendiente Lectura'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {circ.content}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Emitido por Dirección y Coordinación Primaria</span>
                  </div>

                  <button
                    onClick={() => toggleCircularAck(circ.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      circ.isAcknowledged
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{circ.isAcknowledged ? 'Confirmado de Enterado' : 'Confirmar de Enterado'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear Tarea (Docente) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Asignar Nueva Tarea
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Materia</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Comunicación y Lenguaje">Comunicación y Lenguaje</option>
                  <option value="Ciencias Naturales">Ciencias Naturales</option>
                  <option value="Ciencias Sociales">Ciencias Sociales</option>
                  <option value="Educación Artística">Educación Artística</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Ejercicios de multiplicación pág 50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Instrucciones</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles sobre entrega en cuaderno, libro o material..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fecha de Entrega</label>
                  <input
                    type="text"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="Ej. Viernes 20 de marzo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Puntos de Zona</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  Publicar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
