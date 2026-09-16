import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  ShieldCheck, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Student } from '../../types/database.types';

export interface SchoolNotification {
  id: string;
  category: 'gate' | 'academic' | 'finance' | 'general';
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  isRead: boolean;
  studentId?: string;
  actionText?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
}

const INITIAL_NOTIFICATIONS: SchoolNotification[] = [
  {
    id: 'notif-1',
    category: 'gate',
    title: 'Ingreso Escolar Registrado',
    description: 'Mateo Méndez registró su ingreso a las 07:15 AM por la Garita Peatonal Norte.',
    time: 'Hace 12 min',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    isRead: false,
    studentId: 's-001',
    actionText: 'Ver Asistencia'
  },
  {
    id: 'notif-2',
    category: 'academic',
    title: 'Nueva Calificación Publicada',
    description: 'Prof. Carlos Méndez publicó la nota del 1er Bimestre de Matemáticas: 88/100 pts (Aprobada).',
    time: 'Hace 45 min',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: false,
    studentId: 's-001',
    actionText: 'Ver Boleta'
  },
  {
    id: 'notif-3',
    category: 'finance',
    title: 'Comprobante Electrónico Emitido',
    description: 'Se generó el recibo #REC-2026-002 por Q850.00 correspondiente a la Colegiatura de Febrero.',
    time: 'Ayer, 16:30',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
    studentId: 's-001',
    actionText: 'Ver Recibo'
  },
  {
    id: 'notif-4',
    category: 'general',
    title: 'Circular No. 05: Día de la Familia',
    description: 'Estimados padres de familia: Este viernes 20 celebraremos el Día de la Familia. Horario especial de salida: 12:00 PM.',
    time: 'Hace 2 días',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isRead: true,
    actionText: 'Leer Circular'
  }
];

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  selectedStudent: _selectedStudent
}) => {
  const [notifications, setNotifications] = useState<SchoolNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'gate' | 'academic' | 'finance'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const getCategoryIcon = (category: SchoolNotification['category']) => {
    switch (category) {
      case 'gate':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'academic':
        return <BookOpen className="w-4 h-4 text-brand-500" />;
      case 'finance':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-amber-500" />;
    }
  };

  const getCategoryBadgeClass = (category: SchoolNotification['category']) => {
    switch (category) {
      case 'gate':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'academic':
        return 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
      case 'finance':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 transition-colors">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alertas escolares en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1 font-bold rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Leídas</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('gate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === 'gate'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Seguridad
              </button>
              <button
                onClick={() => setFilter('academic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === 'academic'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Académico
              </button>
              <button
                onClick={() => setFilter('finance')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === 'finance'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Finanzas
              </button>
            </div>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">No hay notificaciones en este filtro</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    !notif.isRead
                      ? 'bg-brand-50/40 dark:bg-brand-950/25 border-brand-200/80 dark:border-brand-800/80 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(notif.category)}`}>
                          {notif.category === 'gate' ? 'Garita' : notif.category === 'academic' ? 'Notas' : notif.category === 'finance' ? 'Pagos' : 'Aviso'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {notif.time}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.description}
                      </p>

                      {notif.actionText && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline">
                          <span>{notif.actionText}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Notificaciones sincronizadas con Garita y MINEDUC</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
