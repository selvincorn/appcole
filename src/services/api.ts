import { getSupabaseClient } from './supabase/client';
import { 
  Student, 
  Subject,
  Grade, 
  AttendanceLog, 
  TuitionFee, 
  Profile, 
  PeriodType, 
  AttendanceEventType, 
  AttendanceStatus,
  PaymentMethod
} from '../types/database.types';
import { 
  MOCK_PROFILES, 
  MOCK_STUDENTS, 
  MOCK_SUBJECTS, 
  MOCK_GRADES, 
  INITIAL_ATTENDANCE_LOGS, 
  MOCK_TUITION_FEES 
} from './mockData';

// Claves de persistencia para modo Demo y caché local offline
const STORAGE_ATTENDANCE_KEY = 'appcole_demo_attendance_logs';
const STORAGE_TUITIONS_KEY = 'appcole_demo_tuition_fees';
const STORAGE_GRADES_KEY = 'appcole_demo_grades';

// Mapeos y normalizadores para sincronizar esquema de PostgreSQL con Frontend
export const toDbPeriod = (p?: PeriodType | string): string => {
  if (!p) return 'BIMESTRE_1';
  switch (p) {
    case 'B1': return 'BIMESTRE_1';
    case 'B2': return 'BIMESTRE_2';
    case 'B3': return 'BIMESTRE_3';
    case 'B4': return 'BIMESTRE_4';
    default: return p;
  }
};

export const toUiPeriod = (p?: string): PeriodType => {
  if (!p) return 'B1';
  switch (p) {
    case 'BIMESTRE_1': return 'B1';
    case 'BIMESTRE_2': return 'B2';
    case 'BIMESTRE_3': return 'B3';
    case 'BIMESTRE_4': return 'B4';
    default: return p as PeriodType;
  }
};

export const normalizeStudent = (raw: any): Student => {
  const firstName = raw.first_name || '';
  const lastName = raw.last_name || '';
  const fullName = raw.full_name || `${firstName} ${lastName}`.trim();
  const gradeLevel = raw.grade_level || raw.grade || '3ro Primaria';

  return {
    id: raw.id,
    student_code: raw.student_code,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    grade: gradeLevel,
    grade_level: gradeLevel,
    section: raw.section || 'A',
    photo_url: raw.photo_url || null,
    date_of_birth: raw.date_of_birth || null,
    emergency_phone: raw.emergency_phone || null,
    status: raw.status || (raw.is_active !== false ? 'ACTIVE' : 'INACTIVE'),
    is_active: raw.status === 'ACTIVE' || raw.is_active !== false,
    created_at: raw.created_at || new Date().toISOString(),
  };
};

export const normalizeGrade = (raw: any): Grade => {
  const tasks = Number(raw.tasks_score ?? raw.zone_score ?? 0);
  const partial = Number(raw.partial_score ?? raw.eval_score ?? 0);
  const exam = Number(raw.exam_score ?? raw.final_exam_score ?? 0);
  const total = Number(raw.total_score ?? (tasks + partial + exam));
  const uiPeriod = toUiPeriod(raw.period);

  return {
    id: raw.id,
    student_id: raw.student_id,
    subject_id: raw.subject_id,
    period: uiPeriod,
    tasks_score: tasks,
    partial_score: partial,
    exam_score: exam,
    total_score: total,
    zone_score: tasks,
    eval_score: partial,
    final_exam_score: exam,
    observations: raw.observations || null,
    updated_at: raw.updated_at || new Date().toISOString(),
    subject: raw.subject ? {
      ...raw.subject,
      grade_level: raw.subject.grade_level || '3ro Primaria',
    } : undefined,
    student: raw.student ? normalizeStudent(raw.student) : undefined,
  };
};

const getStoredAttendance = (): AttendanceLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored attendance', e);
  }
  return [...INITIAL_ATTENDANCE_LOGS];
};

const saveStoredAttendance = (logs: AttendanceLog[]) => {
  localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(logs));
};

const getStoredTuitions = (): TuitionFee[] => {
  try {
    const raw = localStorage.getItem(STORAGE_TUITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored tuitions', e);
  }
  return [...MOCK_TUITION_FEES];
};

const getStoredGrades = (): Grade[] => {
  try {
    const raw = localStorage.getItem(STORAGE_GRADES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored grades', e);
  }
  return [...MOCK_GRADES];
};

const saveStoredGrades = (grades: Grade[]) => {
  localStorage.setItem(STORAGE_GRADES_KEY, JSON.stringify(grades));
};

// Validador de formato UUID v4 para evitar errores 400 en PostgreSQL/Supabase
export const isValidUUID = (val?: string): boolean => {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export const api = {
  // --- PERFILES & AUTENTICACIÓN ---
  async getCurrentProfile(userId?: string): Promise<Profile> {
    const client = getSupabaseClient();
    if (client && userId && isValidUUID(userId)) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error en getCurrentProfile:', e);
      }
    }
    // Fallback Mock (Padre por defecto)
    return MOCK_PROFILES[0];
  },

  // --- ESTUDIANTES / HIJOS ---
  async getStudentsForParent(parentId?: string): Promise<Student[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client
          .from('students')
          .select('*')
          .order('first_name', { ascending: true });

        // Si es un UUID real de padre autenticado, filtrar por relación
        if (parentId && isValidUUID(parentId)) {
          const { data: relations } = await client
            .from('parent_student')
            .select('student_id')
            .eq('parent_id', parentId);
          if (relations && relations.length > 0) {
            query = query.in('id', relations.map(r => r.student_id));
          }
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(normalizeStudent);
        }
      } catch (e) {
        console.warn('Error al consultar alumnos en Supabase:', e);
      }
    }
    return MOCK_STUDENTS.map(normalizeStudent);
  },

  async getStudentByCode(code: string): Promise<Student | null> {
    const cleanCode = code.trim().toUpperCase();
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('students')
          .select('*')
          .ilike('student_code', cleanCode)
          .single();
        if (!error && data) {
          return normalizeStudent(data);
        }
      } catch (e) {
        console.warn('Error al buscar alumno por código en Supabase:', e);
      }
    }
    const found = MOCK_STUDENTS.find(s => s.student_code.toUpperCase() === cleanCode);
    return found ? normalizeStudent(found) : null;
  },

  // Acceso rápido para padres mediante código de carnet escolar (ALU-2026-001)
  async loginWithStudentCode(code: string): Promise<{ success: boolean; student?: Student; profile?: Profile; error?: string }> {
    const student = await this.getStudentByCode(code);
    if (!student) {
      return { 
        success: false, 
        error: `No se encontró ningún alumno con el carnet "${code.toUpperCase()}". Verifica el código impreso en el carnet.` 
      };
    }

    const parentProfile: Profile = {
      id: 'p-' + (student.id.includes('-') ? student.id.slice(0, 8) : student.id),
      full_name: `Familia ${student.last_name.split(' ')[0]} (Tutor)`,
      email: `familia.${student.student_code.toLowerCase()}@colegio.edu.gt`,
      phone: student.emergency_phone || '+502 5555-0000',
      role: 'PARENT',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      student,
      profile: parentProfile,
    };
  },

  // --- ASISTENCIA ---
  async getAttendanceLogs(studentId: string): Promise<AttendanceLog[]> {
    const client = getSupabaseClient();
    if (client && isValidUUID(studentId)) {
      try {
        const { data, error } = await client
          .from('attendance_logs')
          .select('*, student:students(*)')
          .eq('student_id', studentId)
          .order('event_time', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            ...d,
            student: d.student ? normalizeStudent(d.student) : undefined,
          }));
        }
      } catch (e) {
        console.warn('Error al consultar asistencia en Supabase:', e);
      }
    }

    const logs = getStoredAttendance();
    return logs
      .filter(l => l.student_id === studentId)
      .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());
  },

  async recordAttendanceScan(params: {
    studentCode: string;
    eventType: AttendanceEventType;
    status?: AttendanceStatus;
    notes?: string;
    scannedBy?: string;
    deviceInfo?: string;
  }): Promise<{ success: boolean; log?: AttendanceLog; student?: Student; error?: string }> {
    const student = await this.getStudentByCode(params.studentCode);
    if (!student) {
      return { success: false, error: `No se encontró ningún alumno con el carnet/código: ${params.studentCode}` };
    }

    const client = getSupabaseClient();
    const eventTime = new Date().toISOString();
    const status = params.status || 'ON_TIME';
    const notes = params.notes || (params.eventType === 'IN' ? 'Ingreso registrado en garita' : 'Salida registrada en garita');
    const deviceInfo = params.deviceInfo || 'Garita Principal';

    if (client && isValidUUID(student.id)) {
      try {
        const { data, error } = await client
          .from('attendance_logs')
          .insert([{
            student_id: student.id,
            event_time: eventTime,
            event_type: params.eventType,
            status,
            notes,
            scanned_by: isValidUUID(params.scannedBy) ? params.scannedBy : null,
            device_info: deviceInfo,
          }])
          .select('*, student:students(*)')
          .single();

        if (!error && data) {
          const logWithStudent: AttendanceLog = {
            ...data,
            student: data.student ? normalizeStudent(data.student) : student,
          };
          const current = getStoredAttendance();
          saveStoredAttendance([logWithStudent, ...current.filter(l => l.id !== logWithStudent.id)]);
          return { success: true, log: logWithStudent, student };
        } else if (error) {
          console.error('Error de Supabase al registrar asistencia:', error);
        }
      } catch (e) {
        console.warn('Error al insertar asistencia en Supabase:', e);
      }
    }

    // Modo Local / Fallback
    const newLog: AttendanceLog = {
      id: 'att-' + Date.now(),
      student_id: student.id,
      event_time: eventTime,
      event_type: params.eventType,
      status,
      notes,
      scanned_by: params.scannedBy || 'p-staff-001',
      device_info: deviceInfo,
      created_at: eventTime,
      student,
    };

    const current = getStoredAttendance();
    saveStoredAttendance([newLog, ...current]);

    return { success: true, log: newLog, student };
  },

  // --- CALIFICACIONES ---
  async getGrades(studentId: string, period?: PeriodType): Promise<Grade[]> {
    const client = getSupabaseClient();
    if (client && isValidUUID(studentId)) {
      try {
        let query = client
          .from('grades')
          .select('*, subject:subjects(*)')
          .eq('student_id', studentId);
        
        if (period) {
          const dbP = toDbPeriod(period);
          const uiP = toUiPeriod(period);
          query = query.in('period', [period, dbP, uiP]);
        }
        
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(normalizeGrade);
        }
      } catch (e) {
        console.warn('Error al consultar calificaciones en Supabase:', e);
      }
    }

    // Mock data con persistencia local
    const stored = getStoredGrades();
    const uiP = period ? toUiPeriod(period) : undefined;
    let grades = stored.filter(g => g.student_id === studentId);
    if (uiP) {
      grades = grades.filter(g => toUiPeriod(g.period) === uiP);
    }
    return grades.map(normalizeGrade);
  },

  // --- ESTADO DE CUENTA Y COLEGIATURAS ---
  async getTuitionFees(studentId: string): Promise<TuitionFee[]> {
    const client = getSupabaseClient();
    if (client && isValidUUID(studentId)) {
      try {
        const { data, error } = await client
          .from('tuition_fees')
          .select('*')
          .eq('student_id', studentId)
          .order('due_date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((f: any) => ({
            ...f,
            amount: Number(f.amount),
            late_fee: Number(f.late_fee || 0),
          }));
        }
      } catch (e) {
        console.warn('Error al consultar colegiaturas en Supabase:', e);
      }
    }

    const tuitions = getStoredTuitions();
    return tuitions.filter(t => t.student_id === studentId);
  },

  async payTuitionFee(feeId: string, method: PaymentMethod = 'TARJETA'): Promise<boolean> {
    const client = getSupabaseClient();
    const paidAt = new Date().toISOString();
    const receiptNumber = 'REC-2026-' + Math.floor(1000 + Math.random() * 9000);

    if (client && isValidUUID(feeId)) {
      try {
        const { error } = await client
          .from('tuition_fees')
          .update({
            status: 'PAGADO',
            paid_at: paidAt,
            payment_method: method,
            receipt_number: receiptNumber,
          })
          .eq('id', feeId);
        if (!error) {
          console.log('Pago guardado en Supabase exitosamente');
        } else {
          console.error('Error al actualizar pago en Supabase:', error);
        }
      } catch (e) {
        console.warn('Error al procesar pago en Supabase:', e);
      }
    }

    const tuitions = getStoredTuitions();
    const updated = tuitions.map(t => {
      if (t.id === feeId) {
        return {
          ...t,
          status: 'PAGADO' as const,
          paid_at: paidAt,
          payment_method: method,
          receipt_number: receiptNumber,
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_TUITIONS_KEY, JSON.stringify(updated));
    return true;
  },

  // Reiniciar datos de demo
  resetDemoData() {
    localStorage.removeItem(STORAGE_ATTENDANCE_KEY);
    localStorage.removeItem(STORAGE_TUITIONS_KEY);
    localStorage.removeItem(STORAGE_GRADES_KEY);
  },

  // --- MÓDULO DOCENTE / PROFESOR ---
  // Obtener materias asignadas al profesor con su grado y sección
  async getTeacherSubjects(teacherId?: string): Promise<Subject[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from('subjects').select('*').order('grade_level', { ascending: true });
        if (teacherId && isValidUUID(teacherId)) {
          query = query.eq('teacher_id', teacherId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            ...s,
            grade_level: s.grade_level || '3ro Primaria',
            section: s.section || 'A',
          }));
        }
      } catch (e) {
        console.warn('Error al consultar materias en Supabase:', e);
      }
    }
    // Fallback Mock
    if (teacherId) {
      const filtered = MOCK_SUBJECTS.filter(s => s.teacher_id === teacherId);
      if (filtered.length > 0) return filtered;
    }
    return MOCK_SUBJECTS;
  },

  // Obtener alumnos matriculados en un grado y sección específicos
  async getStudentsBySection(gradeLevel: string, section: string): Promise<Student[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('students')
          .select('*')
          .eq('grade_level', gradeLevel)
          .eq('section', section)
          .order('last_name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(normalizeStudent);
        }
      } catch (e) {
        console.warn('Error al consultar alumnos por sección en Supabase:', e);
      }
    }
    return MOCK_STUDENTS.filter(s => s.grade_level === gradeLevel && s.section === section).map(normalizeStudent);
  },

  // Obtener calificaciones de toda una sección para una materia y bimestre
  async getGradesForSection(subjectId: string, period: PeriodType): Promise<Grade[]> {
    const client = getSupabaseClient();
    const dbPeriod = toDbPeriod(period);
    const uiPeriod = toUiPeriod(period);

    if (client && isValidUUID(subjectId)) {
      try {
        const { data, error } = await client
          .from('grades')
          .select('*, student:students(*), subject:subjects(*)')
          .eq('subject_id', subjectId)
          .in('period', [period, dbPeriod, uiPeriod]);
        if (!error && data) {
          return data.map(normalizeGrade);
        }
      } catch (e) {
        console.warn('Error al consultar calificaciones de sección en Supabase:', e);
      }
    }

    const stored = getStoredGrades();
    return stored
      .filter(g => g.subject_id === subjectId && toUiPeriod(g.period) === uiPeriod)
      .map(normalizeGrade);
  },

  // Guardar / actualizar una calificación individual (Docente)
  // Guarda tanto en Supabase PostgreSQL como en caché sincronizada
  async saveGrade(gradeData: {
    student_id: string;
    subject_id: string;
    period: PeriodType;
    tasks_score: number;
    partial_score: number;
    exam_score: number;
    observations?: string | null;
  }): Promise<Grade> {
    const total_score = Number((gradeData.tasks_score + gradeData.partial_score + gradeData.exam_score).toFixed(2));
    const now = new Date().toISOString();
    const client = getSupabaseClient();
    const dbPeriod = toDbPeriod(gradeData.period);
    const uiPeriod = toUiPeriod(gradeData.period);

    if (client && isValidUUID(gradeData.student_id) && isValidUUID(gradeData.subject_id)) {
      try {
        // NOTA CRÍTICA: total_score es una columna generada (STORED) en PostgreSQL, NO se debe enviar en el insert
        const { data, error } = await client
          .from('grades')
          .upsert({
            student_id: gradeData.student_id,
            subject_id: gradeData.subject_id,
            period: dbPeriod,
            tasks_score: gradeData.tasks_score,
            partial_score: gradeData.partial_score,
            exam_score: gradeData.exam_score,
            observations: gradeData.observations || null,
            updated_at: now,
          }, { onConflict: 'student_id,subject_id,period' })
          .select('*, subject:subjects(*)')
          .single();

        if (!error && data) {
          const normalized = normalizeGrade(data);
          
          // Actualizar caché local
          const stored = getStoredGrades();
          const index = stored.findIndex(
            g => g.student_id === gradeData.student_id && g.subject_id === gradeData.subject_id && toUiPeriod(g.period) === uiPeriod
          );
          if (index >= 0) stored[index] = normalized;
          else stored.push(normalized);
          saveStoredGrades(stored);

          return normalized;
        } else if (error) {
          console.error('Error de Supabase al guardar nota:', error);
        }
      } catch (e) {
        console.warn('Error al guardar calificación en Supabase:', e);
      }
    }

    // Fallback en almacenamiento local
    const stored = getStoredGrades();
    const index = stored.findIndex(
      g => g.student_id === gradeData.student_id && g.subject_id === gradeData.subject_id && toUiPeriod(g.period) === uiPeriod
    );

    const savedRecord: Grade = {
      id: index >= 0 ? stored[index].id : 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      student_id: gradeData.student_id,
      subject_id: gradeData.subject_id,
      period: uiPeriod,
      tasks_score: gradeData.tasks_score,
      partial_score: gradeData.partial_score,
      exam_score: gradeData.exam_score,
      total_score,
      zone_score: gradeData.tasks_score,
      eval_score: gradeData.partial_score,
      final_exam_score: gradeData.exam_score,
      observations: gradeData.observations || null,
      updated_at: now,
    };

    if (index >= 0) {
      stored[index] = savedRecord;
    } else {
      stored.push(savedRecord);
    }
    saveStoredGrades(stored);

    return savedRecord;
  },

  // Guardar un lote de calificaciones (Planilla completa de la sección)
  async saveGradesBatch(gradesList: Array<{
    student_id: string;
    subject_id: string;
    period: PeriodType;
    tasks_score: number;
    partial_score: number;
    exam_score: number;
    observations?: string | null;
  }>): Promise<boolean> {
    for (const item of gradesList) {
      await this.saveGrade(item);
    }
    return true;
  }
};
