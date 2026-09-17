import { useState, useEffect, useCallback } from 'react';
import { ActiveTab } from '../components/layout/BottomNav';

export type NotificationCategory = 'gate' | 'academic' | 'finance' | 'general';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  categoryLabel: 'GARITA' | 'NOTAS' | 'PAGOS' | 'AVISO';
  title: string;
  description: string;
  timeFormatted: string;
  timestamp: string;
  isRead: boolean;
  actionText: string;
  targetTab: ActiveTab;
  studentName?: string;
}

const STORAGE_NOTIFS_KEY = 'appcole_notifications_v3';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'gate',
    categoryLabel: 'GARITA',
    title: 'Ingreso Escolar Registrado',
    description: 'Mateo Méndez registró su ingreso a las 07:15 AM por la Garita Peatonal Norte.',
    timeFormatted: 'Hoy • 07:15 a. m.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false,
    actionText: 'Ver Asistencia',
    targetTab: 'attendance',
    studentName: 'Mateo Morales',
  },
  {
    id: 'notif-2',
    category: 'academic',
    categoryLabel: 'NOTAS',
    title: 'Nueva Calificación Publicada',
    description: 'Prof. Carlos Méndez publicó la nota del 1er Bimestre de Matemáticas: 88/100 pts (Aprobada).',
    timeFormatted: 'Hoy • 06:45 a. m.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isRead: false,
    actionText: 'Ver Boleta',
    targetTab: 'grades',
    studentName: 'Mateo Morales',
  },
  {
    id: 'notif-3',
    category: 'finance',
    categoryLabel: 'PAGOS',
    title: 'Comprobante Electrónico Emitido',
    description: 'Se generó el recibo #REC-2026-002 por Q850.00 correspondiente a la Colegiatura de Febrero.',
    timeFormatted: 'Ayer • 04:30 p. m.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionText: 'Ver Recibo',
    targetTab: 'finance',
    studentName: 'Mateo Morales',
  },
  {
    id: 'notif-4',
    category: 'general',
    categoryLabel: 'AVISO',
    title: 'Circular No. 05: Día de la Familia',
    description: 'Estimados padres de familia: este viernes se realizará la actividad del Día de la Familia.',
    timeFormatted: 'Hace 2 días',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionText: 'Ver aviso',
    targetTab: 'agenda',
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('hace 2 minutos');

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Error saving notifications to localStorage', e);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    setSyncError(false);
    try {
      // Simular sincronización con backend/garita
      await new Promise(resolve => setTimeout(resolve, 800));
      setLastSyncTime('hace un momento');
    } catch (e) {
      setSyncError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    syncError,
    lastSyncTime,
    markAllAsRead,
    markAsRead,
    refreshNotifications,
  };
};
