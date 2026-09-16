// Tipos de Base de Datos para AppCole (Supabase & Frontend)

export type UserRole = 'PARENT' | 'STAFF' | 'TEACHER' | 'ADMIN';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
}

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Student {
  id: string;
  student_code: string; // Código de carnet / QR (ej: ALU-2026-001)
  first_name: string;
  last_name: string;
  full_name?: string;  // Alias computado
  grade?: string;      // Alias de grade_level
  grade_level: string; // ej: "3ro Primaria"
  section: string;     // ej: "A"
  photo_url?: string | null;
  date_of_birth?: string | null;
  emergency_phone?: string | null;
  status: StudentStatus;
  is_active?: boolean; // Alias de status === 'ACTIVE'
  created_at: string;
}

export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relationship: 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ENCARGADO';
  is_primary_contact: boolean;
  created_at: string;
}

export interface AcademicCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  cycle_id: string;
  name: string;
  code?: string;
  teacher_id?: string;
  teacher_name?: string;
  grade_level: string;
  section?: string; // ej: "A", "B"
}

export type PeriodType = 'BIMESTRE_1' | 'BIMESTRE_2' | 'BIMESTRE_3' | 'BIMESTRE_4' | 'B1' | 'B2' | 'B3' | 'B4';

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  period: PeriodType;
  tasks_score: number;    // Zona de Tareas (ej: hasta 40 pts)
  partial_score: number;  // Evaluaciones Parciales (ej: hasta 30 pts)
  exam_score: number;     // Examen Bimestral (ej: hasta 30 pts)
  total_score: number;    // Total calculado (100 pts)
  // Aliases de compatibilidad para interfaz de usuario
  zone_score?: number;
  eval_score?: number;
  final_exam_score?: number;
  observations?: string | null;
  updated_at: string;
  // Campos unidos (joins)
  subject?: Subject;
  student?: Student;
}

export type AttendanceEventType = 'IN' | 'OUT';
export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EXCUSED';

export interface AttendanceLog {
  id: string;
  student_id: string;
  event_time: string;
  event_type: AttendanceEventType;
  status: AttendanceStatus;
  scanned_by?: string | null;
  device_info?: string;
  notes?: string | null;
  created_at: string;
  // Campos unidos (joins)
  student?: Student;
  scanned_by_profile?: Profile;
}

export type TuitionStatus = 'PAGADO' | 'PENDIENTE' | 'VENCIDO';
export type PaymentMethod = 'TARJETA' | 'TRANSFERENCIA' | 'VENTANILLA';

export interface TuitionFee {
  id: string;
  student_id: string;
  cycle_id?: string | null;
  concept: string;
  month_number?: number;
  amount: number;
  late_fee: number;
  due_date: string;
  status: TuitionStatus;
  paid_at?: string | null;
  payment_method?: PaymentMethod | null;
  receipt_number?: string | null;
  created_at: string;
  student?: Student;
}

// Resumen del Estado actual del alumno en el colegio
export interface StudentCurrentState {
  isInside: boolean;
  lastEventTime?: string;
  lastEventType?: AttendanceEventType;
  statusLabel: 'En colegio' | 'Fuera del colegio' | 'Retraso de ingreso' | 'Sin registros hoy';
  badgeColor: 'emerald' | 'slate' | 'amber' | 'rose';
}
