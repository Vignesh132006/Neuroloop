const CACHE_NAME = 'neuroloop-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip API calls — always fetch from network
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('onrender.com') ||
      url.hostname.includes('groq.com')) {
    return
  }

  // For navigation requests — serve index.html (SPA support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    )
    return
  }

  // For static assets — cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, clone)
          )
        }
        return response
      })
    })
  )
})

// Push notification support (for revision reminders)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'NeuroLoop Reminder'
  const body  = data.body  || 'You have revisions due today!'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/revision' },
      actions: [
        { action: 'open', title: 'Start Revision' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/revision'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      clients.openWindow(url)
    })
  )
})
