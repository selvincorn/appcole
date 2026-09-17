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
  Bell,
  User,
  X
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
  const { user, role, isDemoMode, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-2 sm:px-6 pt-2 sm:pt-3 pb-1 sm:pb-2">
      <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl glass-panel shadow-soft border border-white/80 dark:border-slate-800/90 px-3 sm:px-4 py-2 sm:py-2.5 transition-colors">
        
        {/* Fila 1: Marca y Acciones Principales */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          
          {/* Logo y Nombre de la App */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="relative group shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  AppCole
                </h1>
                {isDemoMode ? (
                  <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50">
                    <Sparkles className="w-2 h-2 text-amber-600 dark:text-amber-400" /> Demo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/50">
                    <Database className="w-2 h-2 text-emerald-600 dark:text-emerald-400" /> Supabase
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 truncate">
                Portal Escolar Guatemala
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera (Iconos y Botones de Acción) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Notificaciones */}
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs"
                title="Notificaciones Escolares"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] sm:text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Selector de Tema (Modo Oscuro / Claro) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              )}
            </button>

            {/* Menú de Usuario / Perfil */}
            <button
              type="button"
              onClick={() => setUserMenuOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shadow-xs flex items-center gap-1"
              title="Mi Perfil y Cambio de Rol"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Botón de Acción Principal según Rol */}
            {role === 'STAFF' ? (
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Garita QR</span>
              </button>
            ) : role === 'TEACHER' ? (
              <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-[11px] sm:text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Docente</span>
              </div>
            ) : (
              selectedStudent && (
                <button
                  type="button"
                  onClick={onOpenIdCard}
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white text-[11px] sm:text-xs font-bold shadow-sm transition-all active:scale-95 group"
                  title="Ver Carnet Escolar"
                >
                  <QrCode className="w-3.5 h-3.5 text-brand-400 dark:text-white group-hover:scale-110 transition-transform" />
                  <span>Carnet</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Fila 2: Contexto Específico (Selector de Hijo o Datos del Docente) */}
        {role === 'TEACHER' && (
          <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Docente:
            </span>
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                Prof. Carlos Méndez
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-[10px] font-bold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 truncate shrink-0">
                3ro Primaria A & 1ro Básico B
              </span>
            </div>
          </div>
        )}

        {role === 'PARENT' && students.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Hijo(a):
            </span>

            {/* Selector de Hijo responsivo */}
            <div className="relative flex-1 max-w-xs sm:max-w-none flex justify-end">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700 text-left hover:border-brand-400 transition-all active:scale-98 max-w-full"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    {selectedStudent?.photo_url ? (
                      <img
                        src={selectedStudent.photo_url}
                        alt={selectedStudent.first_name}
                        className="w-5 h-5 rounded-full object-cover border border-brand-500/40"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
                        {selectedStudent?.first_name[0]}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {selectedStudent?.first_name} {selectedStudent?.last_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold leading-none truncate">
                      {selectedStudent?.grade_level} • Sec. {selectedStudent?.section}
                    </p>
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180 text-brand-600' : ''}`} />
              </button>

              {/* Menú Flotante de Hijos */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="fixed sm:absolute top-20 sm:top-auto sm:right-0 left-3 right-3 sm:left-auto mt-2 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Seleccionar Alumno ({students.length})
                      </p>
                      <button 
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
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
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl sm:rounded-2xl text-left transition-all ${
                            isSelected
                              ? 'bg-brand-50 dark:bg-slate-800 text-brand-950 dark:text-white border border-brand-200 dark:border-brand-500/30 shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <img
                            src={student.photo_url || ''}
                            alt={student.first_name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-slate-900 dark:text-white">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {student.grade_level} • Carnet: {student.student_code}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
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

      {/* Modal / Menú Rápido de Usuario & Cerrar Sesión */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Cabecera del Usuario */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
                  {user?.full_name ? user.full_name[0] : 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {user?.full_name || 'Usuario'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {user?.email || 'portal@colegio.edu.gt'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cambio Rápido de Rol */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Cambiar Perfil de Acceso
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { switchRole('PARENT'); setUserMenuOpen(false); }}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    role === 'PARENT' 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                  }`}
                >
                  Padre
                </button>
                <button
                  type="button"
                  onClick={() => { switchRole('TEACHER'); setUserMenuOpen(false); }}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    role === 'TEACHER' 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                  }`}
                >
                  Docente
                </button>
                <button
                  type="button"
                  onClick={() => { switchRole('STAFF'); setUserMenuOpen(false); }}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    role === 'STAFF' 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                  }`}
                >
                  Garita
                </button>
              </div>
            </div>

            {/* Botón Cerrar Sesión */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { logout(); setUserMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión / Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
