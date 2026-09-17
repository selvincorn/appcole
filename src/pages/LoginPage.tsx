import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/database.types';
import { 
  GraduationCap, 
  User, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  Lock, 
  Mail, 
  QrCode, 
  ArrowRight,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  Database,
  X
} from 'lucide-react';

type MainTab = 'login' | 'register' | 'demo';
type LoginMethod = 'credentials' | 'carnet';

export const LoginPage: React.FC = () => {
  const { 
    loginAsDemoParent, 
    loginAsDemoStaff, 
    loginAsDemoTeacher, 
    loginWithStudentCode,
    loginWithCredentials, 
    signUp,
    resetPassword,
    isConfigured,
    isLoading 
  } = useAuth();

  // Estados de navegación interna
  const [mainTab, setMainTab] = useState<MainTab>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('credentials');
  
  // Estados de formulario de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Estados de formulario de registro
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PARENT');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Estados de recuperación de contraseña
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  // Estados de retroalimentación
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (loginMethod === 'carnet') {
      if (!studentCode.trim()) {
        setErrorMessage('Por favor ingresa el código del carnet escolar (ej: ALU-2026-001)');
        return;
      }
      setSubmitting(true);
      try {
        const res = await loginWithStudentCode(studentCode.trim());
        if (!res.success) {
          setErrorMessage(res.error || 'Código de carnet no encontrado');
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!email.trim()) {
        setErrorMessage('Por favor ingresa tu correo institucional o usuario');
        return;
      }
      if (!password) {
        setErrorMessage('Por favor ingresa tu contraseña');
        return;
      }
      setSubmitting(true);
      try {
        const res = await loginWithCredentials(email.trim(), password);
        if (!res.success) {
          setErrorMessage(res.error || 'Credenciales no válidas');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 2. Manejo de Registro / Crear Cuenta
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signUp({
        email: regEmail.trim(),
        password: regPassword,
        fullName: regFullName.trim(),
        role: regRole,
        phone: regPhone.trim() || undefined,
        studentCode: regRole === 'PARENT' && regStudentCode.trim() ? regStudentCode.trim() : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Error al crear la cuenta');
      } else {
        setSuccessMessage('¡Cuenta creada exitosamente! Bienvenido a AppCole GT.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Manejo de Recuperación de Contraseña
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico registrado');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail.trim());
      if (res.success) {
        setForgotMessage(res.message || 'Se ha enviado un enlace de restablecimiento a tu correo.');
      } else {
        setErrorMessage(res.error || 'Error al procesar la solicitud');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickAccount = (userEmail: string, pass: string = 'password123') => {
    setEmail(userEmail);
    setPassword(pass);
    setLoginMethod('credentials');
    setErrorMessage(null);
  };

  const fillQuickCarnet = (code: string) => {
    setStudentCode(code);
    setLoginMethod('carnet');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Luces de ambiente en segundo plano */}
      <div className="bg-mesh pointer-events-none">
        <div className="bg-mesh-blob-1 opacity-70" />
        <div className="bg-mesh-blob-2 opacity-60" />
        <div className="bg-mesh-blob-3 opacity-50" />
      </div>

      <div className="w-full max-w-lg glass-card rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/80 dark:border-slate-800/80 relative z-10 space-y-5">
        
        {/* Cabecera Principal */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-glow-brand animate-pulse-subtle">
            <GraduationCap className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                AppCole GT
              </h1>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Database className="w-2.5 h-2.5" /> Supabase
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Demo
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Control Escolar, Garita QR y Portal Familiar • Guatemala
            </p>
          </div>
        </div>

        {/* Pestañas Principales: Iniciar Sesión | Crear Cuenta | Modo Demo */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMainTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mainTab === 'login'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setMainTab('register'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mainTab === 'register'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Crear Cuenta</span>
          </button>

          <button
            type="button"
            onClick={() => { setMainTab('demo'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              mainTab === 'demo'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">1-Clic Demo</span>
          </button>
        </div>

        {/* Mensajes de Alerta / Éxito */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SECCIÓN: INICIAR SESIÓN (Acceso por Correo/Contraseña o Carnet QR) */}
        {/* ========================================================================= */}
        {mainTab === 'login' && (
          <div className="space-y-4">
            {/* Sub-selector de método: Correo vs Carnet */}
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setLoginMethod('credentials'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  loginMethod === 'credentials'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Correo / Usuario
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('carnet'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  loginMethod === 'carnet'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Carnet Escolar</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginMethod === 'credentials' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Correo Electrónico o Usuario
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ej: padre@colegio.edu.gt"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => { setIsForgotModalOpen(true); setForgotEmail(email); }}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
                      />
                      <span>Recordar mi sesión en este dispositivo</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-800/60 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span className="text-xs font-bold text-brand-950 dark:text-brand-200">
                        Acceso Directo por Carnet Escolar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      Ingresa con el código de carnet impreso en la credencial escolar de tu hijo.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Código del Carnet Escolar
                    </label>
                    <div className="relative">
                      <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ej: ALU-2026-001"
                        value={studentCode}
                        onChange={e => setStudentCode(e.target.value)}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:font-sans placeholder:normal-case placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || submitting}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Iniciando sesión...' : 'Ingresar al Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Accesos rápidos de prueba dentro de login */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">
                Accesos rápidos de prueba:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickAccount('padre@colegio.edu.gt')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-800"
                >
                  Padre (Selvin)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('carlos.mendez@colegio.edu.gt')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-800"
                >
                  Docente (Carlos)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('garita@colegio.edu.gt')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-800"
                >
                  Garita (Juan)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickCarnet('ALU-2026-001')}
                  className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[11px] font-bold border border-brand-200 dark:border-brand-800"
                >
                  Carnet Mateo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SECCIÓN: CREAR CUENTA NUEVA (Registro con Roles) */}
        {/* ========================================================================= */}
        {mainTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Selecciona tu Rol en la Institución
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRegRole('PARENT')}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    regRole === 'PARENT'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Padre / Tutor
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('TEACHER')}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    regRole === 'TEACHER'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Docente
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('STAFF')}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    regRole === 'STAFF'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Garita
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Nombre y Apellidos
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej: Ing. Selvin Morales"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Contraseña (mínimo 6)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+502 5555-0000"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Campo opcional de carnet si es padre */}
            {regRole === 'PARENT' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Código Carnet de tu Hijo (Opcional)</span>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400">Auto-vinculación</span>
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej: ALU-2026-001"
                    value={regStudentCode}
                    onChange={e => setRegStudentCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:font-sans placeholder:normal-case"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || submitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Creando cuenta escolar...' : 'Registrarme y Entrar'}</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 3. SECCIÓN: 1-CLIC DEMO (Para presentación con el Cliente) */}
        {/* ========================================================================= */}
        {mainTab === 'demo' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-tight">
                <strong>Modo Presentación para Clientes:</strong> Haz clic en cualquier perfil para explorar la plataforma en vivo con datos precargados.
              </p>
            </div>

            {/* Tarjeta 1: Padre de Familia */}
            <button
              type="button"
              onClick={loginAsDemoParent}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-left transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Padre de Familia</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                      Tutor
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ing. Selvin Morales • Alumnos: Mateo & Sofía
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
            </button>

            {/* Tarjeta 2: Profesor / Docente */}
            <button
              type="button"
              onClick={loginAsDemoTeacher}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-left transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Profesor (Docente)</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Titular
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Prof. Carlos Méndez • 3ro Primaria A & 1ro Básico B
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
            </button>

            {/* Tarjeta 3: Personal de Garita */}
            <button
              type="button"
              onClick={loginAsDemoStaff}
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-left transition-all shadow-xs hover:shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Personal de Garita</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Seguridad
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Oficial Juan Pérez • Escaneo óptico de carnets
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
            </button>
          </div>
        )}

        {/* Pie de página con sello oficial */}
        <div className="pt-2 text-center border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
          Curriculum Nacional Base (CNB) • Ministerio de Educación de Guatemala (MINEDUC)
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recuperar Contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsForgotModalOpen(false); setForgotMessage(null); setErrorMessage(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ingresa el correo electrónico asociado a tu cuenta institucional o familiar para enviarte las instrucciones de restablecimiento:
            </p>

            {forgotMessage ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                <p className="font-semibold">{forgotMessage}</p>
                <button
                  type="button"
                  onClick={() => { setIsForgotModalOpen(false); setForgotMessage(null); }}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Entendido / Volver al Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="tucorreo@colegio.edu.gt"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
