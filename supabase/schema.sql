-- ==============================================================================
-- APPCOLE GT - ESQUEMA DE BASE DE DATOS COMPLETO PARA SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Plataforma Escolar y Control de Asistencia para Guatemala
-- Incluye: Tablas, RLS, Triggers, Auto-vinculación y Datos Semilla de Prueba
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- 2.1 Perfiles de Usuario (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'PARENT' CHECK (role IN ('PARENT', 'STAFF', 'TEACHER', 'ADMIN')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.2 Alumnos
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_code TEXT UNIQUE NOT NULL, -- Código de carnet / QR (ej: ALU-2026-001)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,         -- Ej: 3ro Primaria, 1ro Básico
    section TEXT NOT NULL DEFAULT 'A', -- Ej: A, B
    photo_url TEXT,
    date_of_birth DATE,
    emergency_phone TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.3 Relación Padres - Alumnos (N:M)
CREATE TABLE IF NOT EXISTS public.parent_student (
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'PADRE' CHECK (relationship IN ('PADRE', 'MADRE', 'TUTOR_LEGAL', 'ENCARGADO')),
    is_primary_contact BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (parent_id, student_id)
);

-- 2.4 Ciclos Académicos
CREATE TABLE IF NOT EXISTS public.academic_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                 -- Ej: "Ciclo Escolar 2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.5 Materias / Asignaturas según CNB Guatemala
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID REFERENCES public.academic_cycles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                 -- Ej: Matemáticas, Comunicación y Lenguaje, Ciencias
    code TEXT,                          -- Ej: MAT-3P
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Docente asignado
    teacher_name TEXT,
    grade_level TEXT NOT NULL,         -- Ej: 3ro Primaria
    section TEXT NOT NULL DEFAULT 'A', -- Sección escolar: A, B, C...
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.6 Calificaciones y Zonas (Reglamento MINEDUC)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('BIMESTRE_1', 'BIMESTRE_2', 'BIMESTRE_3', 'BIMESTRE_4')),
    tasks_score NUMERIC(5,2) DEFAULT 0.00 CHECK (tasks_score >= 0),       -- Zona de Tareas (hasta 40 pts)
    partial_score NUMERIC(5,2) DEFAULT 0.00 CHECK (partial_score >= 0),   -- Parciales / Proyectos (hasta 30 pts)
    exam_score NUMERIC(5,2) DEFAULT 0.00 CHECK (exam_score >= 0),         -- Examen Bimestral (hasta 30 pts)
    total_score NUMERIC(5,2) GENERATED ALWAYS AS (tasks_score + partial_score + exam_score) STORED,
    observations TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (student_id, subject_id, period)
);

-- 2.7 Registro de Asistencias y Accesos (Garita / Carnet QR)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    event_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('IN', 'OUT')), -- IN = Entrada, OUT = Salida
    status TEXT NOT NULL DEFAULT 'ON_TIME' CHECK (status IN ('ON_TIME', 'LATE', 'EXCUSED')),
    scanned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Personal de garita
    device_info TEXT DEFAULT 'Garita Principal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2.8 Estado de Cuenta y Colegiaturas (En Quetzales - Q)
CREATE TABLE IF NOT EXISTS public.tuition_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES public.academic_cycles(id) ON DELETE SET NULL,
    concept TEXT NOT NULL,               -- Ej: "Colegiatura Febrero 2026", "Inscripción"
    month_number INT CHECK (month_number BETWEEN 1 AND 12),
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    late_fee NUMERIC(10,2) DEFAULT 0.00 CHECK (late_fee >= 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PAGADO', 'PENDIENTE', 'VENCIDO')),
    paid_at TIMESTAMPTZ,
    payment_method TEXT,                -- 'TARJETA', 'TRANSFERENCIA', 'VENTANILLA'
    receipt_number TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. ÍNDICES PARA ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON public.parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON public.parent_student(student_id);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_attendance_student_time ON public.attendance_logs(student_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_tuition_student ON public.tuition_fees(student_id);

-- ==============================================================================
-- 4. TRIGGERS Y FUNCIONES
-- ==============================================================================

-- 4.1 Trigger para crear automáticamente el perfil al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Usuario'),
        new.email,
        new.phone,
        COALESCE(new.raw_user_meta_data->>'role', 'PARENT')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Auto-vincular a cualquier padre nuevo con los alumnos de prueba (Mateo y Sofía)
-- Esto permite que al registrar tu primer usuario real en Supabase, veas datos de inmediato
CREATE OR REPLACE FUNCTION public.link_demo_students_to_new_parent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'PARENT' THEN
        INSERT INTO public.parent_student (parent_id, student_id, relationship, is_primary_contact)
        SELECT NEW.id, s.id, 'PADRE', TRUE
        FROM public.students s
        WHERE s.student_code IN ('ALU-2026-001', 'ALU-2026-002')
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_link_demo_students ON public.profiles;
CREATE TRIGGER trg_link_demo_students
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.link_demo_students_to_new_parent();

-- 4.3 Función para actualizar estado VENCIDO automáticamente
CREATE OR REPLACE FUNCTION public.update_overdue_tuitions()
RETURNS VOID AS $$
BEGIN
    UPDATE public.tuition_fees
    SET status = 'VENCIDO'
    WHERE status = 'PENDIENTE'
      AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 5. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_fees ENABLE ROW LEVEL SECURITY;

-- Helper para verificar si el usuario autenticado es Staff o Admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.1 Políticas para PROFILES
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil o Staff puede ver todo" ON public.profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil o Staff puede ver todo"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON public.profiles;
CREATE POLICY "Permitir inserción de perfiles"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- 5.2 Políticas para PARENT_STUDENT
DROP POLICY IF EXISTS "Padres ven sus propias asignaciones o Staff ve todas" ON public.parent_student;
CREATE POLICY "Padres ven sus propias asignaciones o Staff ve todas"
    ON public.parent_student FOR SELECT
    USING (parent_id = auth.uid() OR public.is_staff_or_admin());

-- 5.3 Políticas para STUDENTS
DROP POLICY IF EXISTS "Padres ven a sus hijos vinculados y el Staff ve a todos" ON public.students;
CREATE POLICY "Padres ven a sus hijos vinculados y el Staff ve a todos"
    ON public.students FOR SELECT
    USING (
        id IN (
            SELECT student_id FROM public.parent_student
            WHERE parent_id = auth.uid()
        )
        OR public.is_staff_or_admin()
        OR auth.role() = 'authenticated'
        OR auth.role() = 'anon' -- Permite la lectura desde la app web escolar pública / demo
    );

-- 5.4 Políticas para ATTENDANCE_LOGS
DROP POLICY IF EXISTS "Padres ven asistencias de sus hijos y Staff ve todas" ON public.attendance_logs;
CREATE POLICY "Padres ven asistencias de sus hijos y Staff ve todas"
    ON public.attendance_logs FOR SELECT
    USING (
        student_id IN (
            SELECT student_id FROM public.parent_student
            WHERE parent_id = auth.uid()
        )
        OR public.is_staff_or_admin()
        OR auth.role() = 'authenticated'
        OR auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Staff y Garita pueden insertar registros de asistencia" ON public.attendance_logs;
CREATE POLICY "Staff y Garita pueden insertar registros de asistencia"
    ON public.attendance_logs FOR INSERT
    WITH CHECK (
        public.is_staff_or_admin() 
        OR auth.role() = 'authenticated' 
        OR auth.role() = 'anon'
    );

-- 5.5 Políticas para GRADES (Calificaciones)
DROP POLICY IF EXISTS "Padres ven calificaciones de sus hijos" ON public.grades;
CREATE POLICY "Padres ven calificaciones de sus hijos"
    ON public.grades FOR SELECT
    USING (
        student_id IN (
            SELECT student_id FROM public.parent_student
            WHERE parent_id = auth.uid()
        )
        OR public.is_staff_or_admin()
        OR auth.role() = 'authenticated'
        OR auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Profesores y Staff pueden ingresar calificaciones" ON public.grades;
CREATE POLICY "Profesores y Staff pueden ingresar calificaciones"
    ON public.grades FOR INSERT
    WITH CHECK (
        public.is_staff_or_admin() 
        OR auth.role() = 'authenticated' 
        OR auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Profesores y Staff pueden actualizar calificaciones" ON public.grades;
CREATE POLICY "Profesores y Staff pueden actualizar calificaciones"
    ON public.grades FOR UPDATE
    USING (
        public.is_staff_or_admin() 
        OR auth.role() = 'authenticated' 
        OR auth.role() = 'anon'
    );

-- 5.6 Políticas para TUITION_FEES (Estado de Cuenta)
DROP POLICY IF EXISTS "Padres ven estados de cuenta de sus hijos" ON public.tuition_fees;
CREATE POLICY "Padres ven estados de cuenta de sus hijos"
    ON public.tuition_fees FOR SELECT
    USING (
        student_id IN (
            SELECT student_id FROM public.parent_student
            WHERE parent_id = auth.uid()
        )
        OR public.is_staff_or_admin()
        OR auth.role() = 'authenticated'
        OR auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Padres pueden pagar cuotas" ON public.tuition_fees;
CREATE POLICY "Padres pueden pagar cuotas"
    ON public.tuition_fees FOR UPDATE
    USING (
        student_id IN (
            SELECT student_id FROM public.parent_student
            WHERE parent_id = auth.uid()
        )
        OR public.is_staff_or_admin()
    );

-- 5.7 Políticas para SUBJECTS y CYCLES (Lectura pública / autenticada)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver materias y ciclos" ON public.academic_cycles;
CREATE POLICY "Usuarios autenticados pueden ver materias y ciclos"
    ON public.academic_cycles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver asignaturas" ON public.subjects;
CREATE POLICY "Usuarios autenticados pueden ver asignaturas"
    ON public.subjects FOR SELECT
    USING (true);

-- ==============================================================================
-- 6. DATOS SEMILLA PARA PRUEBAS (DEMO SEED DATA)
-- ==============================================================================
DO $$
DECLARE
    v_cycle_id UUID;
    v_sub_math UUID;
    v_sub_lang UUID;
    v_sub_sci UUID;
    v_sub_art UUID;
    v_student1_id UUID;
    v_student2_id UUID;
BEGIN
    -- 6.1 Ciclo Escolar Activo
    INSERT INTO public.academic_cycles (id, name, start_date, end_date, is_active)
    VALUES (uuid_generate_v4(), 'Ciclo Escolar 2026', '2026-01-15', '2026-10-31', TRUE)
    RETURNING id INTO v_cycle_id;

    -- 6.2 Alumnos
    INSERT INTO public.students (id, student_code, first_name, last_name, grade_level, section, photo_url, emergency_phone)
    VALUES 
        (uuid_generate_v4(), 'ALU-2026-001', 'Mateo', 'Morales López', '3ro Primaria', 'A', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces', '+502 5555-1234')
    ON CONFLICT (student_code) DO NOTHING
    RETURNING id INTO v_student1_id;

    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM public.students WHERE student_code = 'ALU-2026-001';
    END IF;

    INSERT INTO public.students (id, student_code, first_name, last_name, grade_level, section, photo_url, emergency_phone)
    VALUES 
        (uuid_generate_v4(), 'ALU-2026-002', 'Sofía', 'Morales López', '1ro Básico', 'B', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces', '+502 5555-1234')
    ON CONFLICT (student_code) DO NOTHING
    RETURNING id INTO v_student2_id;

    IF v_student2_id IS NULL THEN
        SELECT id INTO v_student2_id FROM public.students WHERE student_code = 'ALU-2026-002';
    END IF;

    -- 6.3 Materias CNB por Grado y Sección
    INSERT INTO public.subjects (id, cycle_id, name, code, teacher_name, grade_level, section)
    VALUES 
        (uuid_generate_v4(), v_cycle_id, 'Matemáticas', 'MAT-3P', 'Prof. Carlos Méndez', '3ro Primaria', 'A')
    RETURNING id INTO v_sub_math;

    INSERT INTO public.subjects (id, cycle_id, name, code, teacher_name, grade_level, section)
    VALUES 
        (uuid_generate_v4(), v_cycle_id, 'Comunicación y Lenguaje L1', 'LEN-3P', 'Licda. María Paredes', '3ro Primaria', 'A')
    RETURNING id INTO v_sub_lang;

    INSERT INTO public.subjects (id, cycle_id, name, code, teacher_name, grade_level, section)
    VALUES 
        (uuid_generate_v4(), v_cycle_id, 'Ciencias Naturales y Tecnología', 'CIE-3P', 'Prof. Roberto Castillo', '3ro Primaria', 'A')
    RETURNING id INTO v_sub_sci;

    INSERT INTO public.subjects (id, cycle_id, name, code, teacher_name, grade_level, section)
    VALUES 
        (uuid_generate_v4(), v_cycle_id, 'Educación Artística', 'ART-3P', 'Licda. Elena Gómez', '3ro Primaria', 'A')
    RETURNING id INTO v_sub_art;

    -- 6.4 Calificaciones de Mateo (Bimestre 1 y 2)
    -- Matemáticas
    INSERT INTO public.grades (student_id, subject_id, period, tasks_score, partial_score, exam_score, observations)
    VALUES 
        (v_student1_id, v_sub_math, 'BIMESTRE_1', 38.00, 28.00, 26.00, 'Excelente participación en resolución de problemas.'),
        (v_student1_id, v_sub_math, 'BIMESTRE_2', 36.00, 25.00, 27.00, 'Buen rendimiento continuo.')
    ON CONFLICT (student_id, subject_id, period) DO NOTHING;
    
    -- Lenguaje
    INSERT INTO public.grades (student_id, subject_id, period, tasks_score, partial_score, exam_score, observations)
    VALUES 
        (v_student1_id, v_sub_lang, 'BIMESTRE_1', 39.00, 29.00, 28.00, 'Destacada fluidez lectora y ortografía.'),
        (v_student1_id, v_sub_lang, 'BIMESTRE_2', 37.00, 27.00, 28.00, 'Muy buen trabajo en redacción.')
    ON CONFLICT (student_id, subject_id, period) DO NOTHING;

    -- Ciencias
    INSERT INTO public.grades (student_id, subject_id, period, tasks_score, partial_score, exam_score, observations)
    VALUES 
        (v_student1_id, v_sub_sci, 'BIMESTRE_1', 35.00, 26.00, 24.00, 'Completó el proyecto del ecosistema con éxito.'),
        (v_student1_id, v_sub_sci, 'BIMESTRE_2', 38.00, 28.00, 25.00, 'Gran entusiasmo en feria de ciencias.')
    ON CONFLICT (student_id, subject_id, period) DO NOTHING;

    -- 6.5 Registros de Asistencia Recientes
    INSERT INTO public.attendance_logs (student_id, event_time, event_type, status, notes)
    VALUES 
        (v_student1_id, NOW() - INTERVAL '2 hours', 'IN', 'ON_TIME', 'Ingreso por garita peatonal principal'),
        (v_student1_id, NOW() - INTERVAL '1 day 6 hours', 'OUT', 'ON_TIME', 'Salida con transporte escolar #4'),
        (v_student1_id, NOW() - INTERVAL '1 day 14 hours', 'IN', 'LATE', 'Ingreso 7:42 AM - Retraso por tráfico en calzada'),
        (v_student1_id, NOW() - INTERVAL '2 days 6 hours', 'OUT', 'ON_TIME', 'Salida normal entregado a la madre'),
        (v_student1_id, NOW() - INTERVAL '2 days 14 hours', 'IN', 'ON_TIME', 'Ingreso puntual 7:15 AM');

    -- Asistencia de Sofía
    INSERT INTO public.attendance_logs (student_id, event_time, event_type, status, notes)
    VALUES 
        (v_student2_id, NOW() - INTERVAL '2 hours 10 minutes', 'IN', 'ON_TIME', 'Ingreso por garita principal'),
        (v_student2_id, NOW() - INTERVAL '1 day 6 hours', 'OUT', 'ON_TIME', 'Salida normal'),
        (v_student2_id, NOW() - INTERVAL '1 day 14 hours', 'IN', 'ON_TIME', 'Ingreso puntual 7:20 AM');

    -- 6.6 Cuotas y Colegiaturas en Quetzales (Mateo)
    INSERT INTO public.tuition_fees (student_id, cycle_id, concept, month_number, amount, late_fee, due_date, status, paid_at, payment_method, receipt_number)
    VALUES 
        (v_student1_id, v_cycle_id, 'Inscripción Ciclo 2026', 1, 1200.00, 0.00, '2026-01-15', 'PAGADO', '2026-01-10 10:30:00Z', 'TRANSFERENCIA', 'REC-2026-0192'),
        (v_student1_id, v_cycle_id, 'Colegiatura Enero 2026', 1, 850.00, 0.00, '2026-01-31', 'PAGADO', '2026-01-28 14:15:00Z', 'TARJETA', 'REC-2026-0481'),
        (v_student1_id, v_cycle_id, 'Colegiatura Febrero 2026', 2, 850.00, 0.00, '2026-02-28', 'PAGADO', '2026-02-25 09:00:00Z', 'TARJETA', 'REC-2026-0899'),
        (v_student1_id, v_cycle_id, 'Colegiatura Marzo 2026', 3, 850.00, 0.00, '2026-03-31', 'PENDIENTE', NULL, NULL, NULL),
        (v_student1_id, v_cycle_id, 'Materiales y Talleres Bimestre 2', 4, 250.00, 0.00, '2026-04-15', 'PENDIENTE', NULL, NULL, NULL);

    -- Cuotas de Sofía
    INSERT INTO public.tuition_fees (student_id, cycle_id, concept, month_number, amount, late_fee, due_date, status, paid_at, payment_method, receipt_number)
    VALUES 
        (v_student2_id, v_cycle_id, 'Inscripción Ciclo 2026', 1, 1400.00, 0.00, '2026-01-15', 'PAGADO', '2026-01-12 11:00:00Z', 'TRANSFERENCIA', 'REC-2026-0215'),
        (v_student2_id, v_cycle_id, 'Colegiatura Marzo 2026', 3, 950.00, 50.00, '2026-03-05', 'VENCIDO', NULL, NULL, NULL);

END $$;
