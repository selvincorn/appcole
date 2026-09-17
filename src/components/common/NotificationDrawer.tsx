import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  ShieldCheck, 
  BookOpen, 
  CreditCard, 
  ChevronRight,
  Settings2,
  Megaphone,
  BellRing,
  BellOff,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Smartphone
} from 'lucide-react';
import { Student } from '../../types/database.types';
import { ActiveTab } from '../layout/BottomNav';
import { useNotifications, NotificationCategory, AppNotification } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
  onNavigate?: (tab: ActiveTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  selectedStudent: _selectedStudent,
  onNavigate,
}) => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    syncError, 
    lastSyncTime, 
    markAllAsRead, 
    markAsRead, 
    refreshNotifications 
  } = useNotifications();

  const {
    permission,
    isSupported,
    isSubscribing,
    preferences,
    savePreferences,
    requestPermission,
    sendTestNotification
  } = usePushNotifications();

  const [activeCategory, setActiveCategory] = useState<'ALL' | NotificationCategory>('ALL');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [dismissedSoftAsk, setDismissedSoftAsk] = useState(false);
  const [prefsSavedToast, setPrefsSavedToast] = useState(false);
  const [testSentToast, setTestSentToast] = useState(false);

  // Filtro de categorías
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeCategory === 'ALL') return true;
      return n.category === activeCategory;
    });
  }, [notifications, activeCategory]);

  if (!isOpen) return null;

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (onNavigate) {
      onNavigate(item.targetTab);
    }
    onClose();
  };

  const handleTestPush = async () => {
    const success = await sendTestNotification({
      title: 'Ingreso Escolar Registrado',
      body: 'Mateo Méndez ingresó a las 07:15 AM por la Garita Peatonal Norte.',
      category: 'gate',
      tab: 'attendance'
    });
    if (success) {
      setTestSentToast(true);
      setTimeout(() => setTestSentToast(false), 3000);
    }
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences(preferences);
    setPrefsSavedToast(true);
    setTimeout(() => {
      setPrefsSavedToast(false);
      setShowPreferencesModal(false);
    }, 1200);
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="notif-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Panel Lateral Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden">
        
        {/* 1. ENCABEZADO */}
        <header className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="notif-title" className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
                    Notificaciones
                  </h2>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      {unreadCount} nuevas
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      Al día
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Alertas escolares en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Configurar Notificaciones Push"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Acciones del encabezado */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {notifications.length} registros totales
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold hover:underline active:scale-95 transition-all text-xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como leídas</span>
              </button>
            )}
          </div>
        </header>

        {/* 2. BANNER DE PERMISO PUSH (SOFT ASK) */}
        {!dismissedSoftAsk && isSupported && permission !== 'granted' && (
          <div className="p-3.5 mx-4 mt-3 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/80 dark:from-brand-950/60 dark:to-indigo-950/40 border border-brand-200/80 dark:border-brand-800/60 space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-brand-600 text-white shrink-0 mt-0.5 shadow-sm">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  ¿Deseas recibir alertas en tu teléfono?
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  Activa las notificaciones para recibir alertas sobre la asistencia, calificaciones, pagos y avisos importantes de la institución.
                </p>
              </div>
            </div>

            {permission === 'denied' ? (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Las notificaciones están bloqueadas en este navegador. Puedes activarlas desde el candado 🔒 de la barra de direcciones.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await requestPermission();
                  }}
                  disabled={isSubscribing}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 text-center"
                >
                  {isSubscribing ? 'Activando...' : 'Activar notificaciones push'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(true)}
                  className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-50"
                >
                  Configurar
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedSoftAsk(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Ahora no"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Banner de Confirmación Push Activo + Test Button */}
        {permission === 'granted' && (
          <div className="px-4 pt-3 flex items-center justify-between text-xs">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Notificaciones push activas
            </span>
            <button
              type="button"
              onClick={handleTestPush}
              className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Probar alerta Push</span>
            </button>
          </div>
        )}

        {testSentToast && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Alerta push enviada. Revisa la barra de notificaciones.</span>
          </div>
        )}

        {/* 3. FILTROS HORIZONTALES DESPLAZABLES */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1 ${
              activeCategory === 'ALL'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] opacity-80">({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('gate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1 ${
              activeCategory === 'gate'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('academic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1 ${
              activeCategory === 'academic'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Académico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('finance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1 ${
              activeCategory === 'finance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Finanzas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1 ${
              activeCategory === 'general'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Avisos</span>
          </button>
        </div>

        {/* 4. LISTA DE NOTIFICACIONES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BellOff className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {activeCategory === 'ALL' ? 'No tienes notificaciones nuevas' : 'No hay notificaciones en esta categoría'}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Todas las novedades sobre asistencia, notas y pagos se sincronizarán aquí automáticamente.
              </p>
              {activeCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('ALL')}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs"
                >
                  Ver todas las notificaciones
                </button>
              )}
            </div>
          )}

          {!isLoading && filteredNotifications.map((item) => {
            const isUnread = !item.isRead;

            return (
              <article
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-4 rounded-3xl border transition-all duration-200 cursor-pointer shadow-soft hover:shadow-md ${
                  isUnread
                    ? 'bg-brand-50/40 dark:bg-slate-800/90 border-brand-300 dark:border-brand-500/40 ring-1 ring-brand-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  
                  {/* Ícono de Categoría */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                      item.category === 'gate'
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                        : item.category === 'academic'
                        ? 'bg-gradient-to-tr from-indigo-600 to-brand-500 text-white'
                        : item.category === 'finance'
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950'
                        : 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white'
                    }`}
                  >
                    {item.category === 'gate' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : item.category === 'academic' ? (
                      <BookOpen className="w-5 h-5" />
                    ) : item.category === 'finance' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>

                  {/* Detalle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          item.category === 'gate'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : item.category === 'academic'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            : item.category === 'finance'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}>
                          {item.categoryLabel}
                        </span>
                        
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {item.timeFormatted}
                        </span>
                      </div>

                      {/* Punto indicador no leída */}
                      {isUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60 animate-pulse shrink-0" />
                      )}
                    </div>

                    <h4 className={`text-xs sm:text-sm tracking-tight mt-1 truncate ${
                      isUnread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Botón de Acción y Navegación */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                      <span>{item.actionText}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* 5. PIE DE PÁGINA Y SINCRONIZACIÓN */}
        <footer className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${syncError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="truncate">
              {syncError 
                ? 'No pudimos sincronizar las notificaciones.' 
                : `Notificaciones sincronizadas con Garita y MINEDUC • Última sincronización: ${lastSyncTime}`}
            </span>
          </div>

          <button
            type="button"
            onClick={refreshNotifications}
            className={`flex items-center gap-1 font-bold hover:underline shrink-0 ml-2 ${
              syncError ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{syncError ? 'Reintentar' : 'Actualizar'}</span>
          </button>
        </footer>
      </div>

      {/* MODAL DE PREFERENCIAS DE NOTIFICACIONES */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Preferencias de Notificaciones
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Elige qué alertas deseas recibir en tu dispositivo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrefs} className="space-y-3 text-xs">
              
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Seguridad y Garita</p>
                    <p className="text-[10px] text-slate-400">Ingresos, salidas y pases QR</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.security}
                  onChange={e => savePreferences({ ...preferences, security: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Académico</p>
                    <p className="text-[10px] text-slate-400">Nuevas notas y tareas</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.academic}
                  onChange={e => savePreferences({ ...preferences, academic: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Finanzas & Pagos</p>
                    <p className="text-[10px] text-slate-400">Recibos y vencimientos</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.finance}
                  onChange={e => savePreferences({ ...preferences, finance: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-rose-600" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Avisos Escolares</p>
                    <p className="text-[10px] text-slate-400">Circulares oficiales y eventos</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.general}
                  onChange={e => savePreferences({ ...preferences, general: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </label>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <BellOff className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-bold text-rose-900 dark:text-rose-200">Silenciar temporalmente</p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">Pausar alertas push</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.silentMode}
                    onChange={e => savePreferences({ ...preferences, silentMode: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>
              </div>

              {prefsSavedToast && (
                <div className="p-2 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center animate-in fade-in">
                  Preferencias guardadas correctamente
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
