// Service Worker para AppCole GT
// Control de Notificaciones Web Push y sincronización en segundo plano

const CACHE_NAME = 'appcole-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Cache addAll warning:', err);
      });
    })
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Receptor de eventos Web Push
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'AppCole GT • Notificación Escolar',
        body: event.data.text() || 'Tienes una nueva actualización escolar.',
      };
    }
  } else {
    data = {
      title: 'Ingreso Escolar Registrado',
      body: 'Mateo Méndez ingresó a las 07:15 AM por la Garita Peatonal Norte.',
      category: 'gate',
      tab: 'attendance'
    };
  }

  const title = data.title || 'AppCole GT';
  const options = {
    body: data.body || data.description || 'Nueva alerta escolar recibida.',
    icon: data.icon || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=192&h=192&fit=crop&crop=faces',
    badge: data.badge || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    tag: data.tag || data.category || 'appcole-notification',
    renotify: true,
    vibrate: [100, 50, 100],
    data: {
      tab: data.tab || (data.category === 'academic' ? 'grades' : data.category === 'finance' ? 'finance' : data.category === 'general' ? 'agenda' : 'attendance'),
      url: data.url || '/?tab=' + (data.tab || 'attendance'),
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: data.actionText || 'Ver en App'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejador de clics en la notificación Push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetTab = event.notification.data?.tab || 'attendance';
  const targetUrl = event.notification.data?.url || '/?tab=' + targetTab;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta de AppCole, enfocarla y enviarle el cambio de tab
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TAB',
            tab: targetTab
          });
          return client.focus();
        }
      }
      // Si no está abierta, abrir una nueva ventana
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
