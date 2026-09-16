import React, { useState } from 'react';
import { Student } from '../../types/database.types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { 
  GraduationCap, 
  ChevronDown, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Database,
  Check,
  Sun,
  Moon,
  BookOpen,
  LogOut,
  Bell
} from 'lucide-react';

interface HeaderProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenIdCard: () => void;
  onOpenScanner?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onOpenIdCard,
  onOpenScanner,
  onOpenNotifications,
  unreadCount = 3,
}) => {
  const { role, isDemoMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-2 sm:px-6 pt-2 sm:pt-3 pb-2">
      <div className="max-w-4xl mx-auto rounded-3xl glass-panel shadow-soft border border-white/80 dark:border-slate-800/90 px-3 sm:px-4 py-2 sm:py-2.5 transition-colors">
        {/* Fila superior: Marca, Insignia, Toggle Modo Oscuro y Acciones */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-display font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  AppCole
                </h1>
                {isDemoMode ? (
                  <span className="hidden min-[360px]:inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> Demo
                  </span>
                ) : (
                  <span className="hidden min-[360px]:inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/50 shadow-xs">
                    <Database className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> Supabase
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 truncate max-w-[130px] sm:max-w-none">
                Portal Escolar Guatemala • CNB
              </p>
            </div>
          </div>

          {/* Acciones principales de cabecera: Notificaciones + Modo Oscuro + Salir + Carnet/Garita */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botón de Notificaciones en Tiempo Real */}
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs shrink-0"
                title="Ver Notificaciones Escolares"
              >
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Botón Switch Modo Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs shrink-0"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Botón Salir / Cambiar Usuario */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs shrink-0"
              title="Cerrar Sesión / Cambiar de Usuario"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {role === 'STAFF' ? (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all active:scale-95 shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Escanear Garita</span>
                <span className="sm:hidden text-[11px]">Garita</span>
              </button>
            ) : role === 'TEACHER' ? (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-bold shrink-0">
                <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="hidden sm:inline">Profesor Titular</span>
                <span className="sm:hidden text-[11px]">Docente</span>
              </div>
            ) : (
              selectedStudent && (
                <button
                  onClick={onOpenIdCard}
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 group shrink-0"
                  title="Ver Carnet Escolar Oficial con Código QR"
                >
                  <QrCode className="w-4 h-4 text-brand-400 dark:text-white group-hover:scale-110 transition-transform shrink-0" />
                  <span className="hidden sm:inline">Carnet Digital</span>
                  <span className="sm:hidden text-[11px] font-bold">Carnet</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Fila del Docente (Materia y Secciones) */}
        {role === 'TEACHER' && (
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider pl-0.5 shrink-0">
              Docente:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                Prof. Carlos Méndez
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-[10px] font-bold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shrink-0">
                3ro Primaria "A" & 1ro Básico "B"
              </span>
            </div>
          </div>
        )}

        {/* Fila de Selección de Alumnos */}
        {role === 'PARENT' && students.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider pl-0.5 shrink-0">
              Hijo:
            </span>

            {/* Selector con animación suave */}
            <div className="relative min-w-0 max-w-[240px] sm:max-w-none">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-750 px-2.5 sm:px-3 py-1 rounded-xl sm:rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700 text-left hover:border-brand-400 transition-all active:scale-98 max-w-full"
              >
                <div className="relative shrink-0">
                  {selectedStudent?.photo_url ? (
                    <img
                      src={selectedStudent.photo_url}
                      alt={selectedStudent.first_name}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border-2 border-brand-500/40"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {selectedStudent?.first_name[0]}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                </div>

                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {selectedStudent?.first_name} {selectedStudent?.last_name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold leading-none truncate">
                    {selectedStudent?.grade_level} • Sec. {selectedStudent?.section}
                  </p>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180 text-brand-600' : ''}`} />
              </button>

              {/* Menú flotante de hijos */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800 p-2 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Hijos Registrados ({students.length})
                      </p>
                    </div>

                    {students.map((student) => {
                      const isSelected = selectedStudent?.id === student.id;
                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            onSelectStudent(student);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-50 to-indigo-50/60 dark:from-slate-800 dark:to-indigo-950/40 text-brand-950 dark:text-white border border-brand-200/70 dark:border-brand-500/30 shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <img
                            src={student.photo_url || ''}
                            alt={student.first_name}
                            className="w-9 h-9 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-slate-900 dark:text-white">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {student.grade_level} • {student.student_code}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
