import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
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
  Smartphone
} from 'lucide-react';

type LoginTab = 'carnet' | 'credentials' | 'demo';

export const LoginPage: React.FC = () => {
  const { 
    loginAsDemoParent, 
    loginAsDemoStaff, 
    loginAsDemoTeacher, 
    loginWithStudentCode,
    loginWithCredentials, 
    isLoading 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<LoginTab>('carnet');
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Acceso por Carnet
  const handleCarnetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!studentCode.trim()) {
      setErrorMessage('Ingresa el código del carnet escolar (ej: ALU-2026-001)');
      return;
    }
    const res = await loginWithStudentCode(studentCode.trim());
    if (!res.success) {
      setErrorMessage(res.error || 'Código de carnet no encontrado');
    }
  };

  // Acceso por Correo y Contraseña
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo institucional');
      return;
    }
    const res = await loginWithCredentials(email.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales no válidas');
    }
  };

  const fillQuickCarnet = (code: string) => {
    setStudentCode(code);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-3 sm:p-6 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Luces de ambiente en segundo plano */}
      <div className="bg-mesh-blob-1 opacity-70" />
      <div className="bg-mesh-blob-2 opacity-60" />
      <div className="bg-mesh-blob-3 opacity-50" />

      <div className="w-full max-w-lg glass-card rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800/80 relative z-10 space-y-6">
        {/* Cabecera Principal */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-glow-brand animate-pulse-subtle">
            <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              AppCole GT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Control Escolar, Garita QR y Portal Familiar • Guatemala
            </p>
          </div>
        </div>

        {/* Pestañas de Métodos de Acceso */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('carnet'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'carnet'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Carnet Hijo</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Correo / Docente</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMessage(null); }}
            className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">1-Clic Demo</span>
          </button>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Formulario: Ingreso por Carnet Escolar */}
        {activeTab === 'carnet' && (
          <form onSubmit={handleCarnetSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-800/60 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                  Acceso Fácil para Padres de Familia
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Ingresa con el código de carnet escolar que tiene impreso tu hijo/a para ver sus notas, asistencias y pagos al instante.
              </p>
            </div>

            <div className="space-y-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:font-sans placeholder:normal-case placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Accesos rápidos de carnet para demostración */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Prueba con estos alumnos de ejemplo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickCarnet('ALU-2026-001')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 text-left transition-all text-xs"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200">Mateo Morales</p>
                  <p className="font-mono text-[10px] text-brand-600 dark:text-brand-400">ALU-2026-001</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickCarnet('ALU-2026-002')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 text-left transition-all text-xs"
                >
                  <p className="font-bold text-slate-800 dark:text-slate-200">Sofía Morales</p>
                  <p className="font-mono text-[10px] text-brand-600 dark:text-brand-400">ALU-2026-002</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ingresar al Portal Familiar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. Formulario: Correo y Contraseña */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Correo Institucional o Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ej: carlos.mendez@colegio.edu.gt"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>💡 <strong>Cuentas demo para probar de inmediato:</strong></p>
              <p>• Docente: <code>carlos.mendez@colegio.edu.gt</code></p>
              <p>• Garita: <code>garita@colegio.edu.gt</code></p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Iniciar Sesión Segura</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. Acceso Rápido 1-Clic Demo */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
              Selecciona un perfil preconfigurado para explorar la plataforma:
            </p>

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
                    Oficial Juan Pérez • Escáner óptico de carnets
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
    </div>
  );
};
