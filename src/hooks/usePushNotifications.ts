import { useState, useEffect, useCallback } from 'react';

export interface PushPreferences {
  security: boolean;    // Seguridad y asistencia en garita
  academic: boolean;    // Calificaciones y tareas
  finance: boolean;     // Comprobantes y recordatorios de pago
  general: boolean;     // Circulares y avisos escolares
  silentMode: boolean;  // Silenciar temporalmente
}

const DEFAULT_PREFERENCES: PushPreferences = {
  security: true,
  academic: true,
  finance: true,
  general: true,
  silentMode: false,
};

const STORAGE_PREFS_KEY = 'appcole_push_preferences';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [preferences, setPreferences] = useState<PushPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading push preferences', e);
    }
    return DEFAULT_PREFERENCES;
  });
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Registrar Service Worker y verificar soporte
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as PushPermissionState);

      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
        })
        .catch((err) => {
          console.warn('Error al registrar Service Worker:', err);
        });
    } else {
      setIsSupported(false);
      setPermission('unsupported');
    }
  }, []);

  // Guardar preferencias en localStorage
  const savePreferences = (newPrefs: PushPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(newPrefs));
  };

  // Solicitar permiso de forma explícita
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      setIsSubscribing(false);
      return result === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission', e);
      setIsSubscribing(false);
      return false;
    }
  }, [isSupported]);

  // Enviar notificación de prueba (ejemplo específico del requerimiento)
  const sendTestNotification = useCallback(async (customData?: {
    title?: string;
    body?: string;
    category?: 'gate' | 'academic' | 'finance' | 'general';
    tab?: 'attendance' | 'grades' | 'finance' | 'agenda';
  }) => {
    const title = customData?.title || 'Ingreso Escolar Registrado';
    const body = customData?.body || 'Mateo Méndez ingresó a las 07:15 AM por la Garita Peatonal Norte.';
    const tab = customData?.tab || 'attendance';

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=192&h=192&fit=crop&crop=faces',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        tag: 'appcole-gate-test',
        data: {
          tab,
          url: '/?tab=' + tab,
        },
      });
      return true;
    } else if ('Notification' in window) {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=192&h=192&fit=crop&crop=faces',
      });
      return true;
    }
    return false;
  }, [permission, registration, requestPermission]);

  return {
    permission,
    isSupported,
    isSubscribing,
    preferences,
    savePreferences,
    requestPermission,
    sendTestNotification,
  };
};
