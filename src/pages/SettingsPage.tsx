import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { getSupabaseConfig } from '../services/supabase/client';
import { 
  Database, 
  User, 
  ShieldCheck, 
  BookOpen,
  Check, 
  Save, 
  Key, 
  Link, 
  Sparkles,
  Info,
  LogOut,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    role, 
    switchRole, 
    isConfigured, 
    updateSupabaseCredentials, 
    clearCredentials,
    logout 
  } = useAuth();

  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas reiniciar las asistencias y pagos a su estado original de demostración?')) {
      api.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Cabecera */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Ajustes del Sistema & Configuración
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personaliza tu perfil, entorno Supabase y modo de operación en Guatemala
        </p>
      </div>

      {/* 1. Cambio de Rol Rápido */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Perfil Activo y Rol de Acceso</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => switchRole('PARENT')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              role === 'PARENT'
                ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 ring-2 ring-brand-500/20 text-brand-950 dark:text-brand-100'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              {role === 'PARENT' && <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </div>
            <p className="text-xs font-bold">Padre de Familia</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Portal familiar, notas y asistencias
            </p>
          </button>

          <button
            type="button"
            onClick={() => switchRole('TEACHER')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              role === 'TEACHER'
                ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 ring-2 ring-brand-500/20 text-brand-950 dark:text-brand-100'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              {role === 'TEACHER' && <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </div>
            <p className="text-xs font-bold">Profesor (Docente)</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Planilla de notas por sección
            </p>
          </button>

          <button
            type="button"
            onClick={() => switchRole('STAFF')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              role === 'STAFF'
                ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 ring-2 ring-brand-500/20 text-brand-950 dark:text-brand-100'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              {role === 'STAFF' && <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </div>
            <p className="text-xs font-bold">Personal de Garita</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Escaneo óptico de carnets QR
            </p>
          </button>
        </div>
      </div>

      {/* 2. Configuración de Supabase */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Conexión Supabase (PostgreSQL)</span>
          </h3>

          {isConfigured ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Conectado
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Modo Demo
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Puedes usar la plataforma de inmediato en <strong>Modo Demo</strong> o conectar tu base de datos Supabase ingresando los datos de tu proyecto:
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
              <Link className="w-3 h-3 text-slate-400" />
              <span>Project URL (VITE_SUPABASE_URL)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
              <Key className="w-3 h-3 text-slate-400" />
              <span>Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? '¡Configuración Guardada!' : 'Guardar y Conectar'}</span>
            </button>

            {isConfigured && (
              <button
                type="button"
                onClick={clearCredentials}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                title="Volver a Modo Demo"
              >
                Desconectar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 3. Arquitectura y Esquema SQL */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3 shadow-md border border-slate-800">
        <h3 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          <span>Script SQL de Inicialización para Supabase</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          El script SQL DDL con tablas, triggers, RLS y datos semilla se encuentra disponible en:
        </p>
        <div className="bg-slate-950 p-2.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800">
          c:\Users\selvin\OneDrive - Pani-Fresh, S.A\Documentos\AppCole\supabase\schema.sql
        </div>
        <p className="text-[11px] text-slate-400">
          Copia y pega este script en el <em>SQL Editor</em> de tu consola de Supabase para inicializar la base de datos con políticas de seguridad completas adaptadas al ciclo escolar de Guatemala.
        </p>
      </div>

      {/* 4. Reinicio de Datos Demo */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetSuccess ? 'animate-spin' : ''}`} />
          <span>{resetSuccess ? 'Reiniciando...' : 'Reiniciar Datos de Demostración'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
