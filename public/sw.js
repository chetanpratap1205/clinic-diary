// Auto-versioned cache: update BUILD_TIME on each deploy
// In production, inject the build timestamp via CI/CD or use a build hash
const BUILD_TIME = "2026-08-15-1605";
const CACHE_NAME = `doctor-diary-v4-${BUILD_TIME}`;
const STATIC_CACHE = `doctor-diary-static-v4-${BUILD_TIME}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/offline",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up ALL old caches (any that don't match current version)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API/dynamic routes, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") return;

  // Network-first for API routes and Next.js internals
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/onboarding") ||
    url.pathname.startsWith("/track/")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful _next static assets
          if (response.ok && url.pathname.startsWith("/_next/static/")) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback for navigations — show branded offline page
          if (request.mode === "navigate") {
            const offlinePage = await caches.match("/offline");
            if (offlinePage) return offlinePage;
            return caches.match("/") || new Response("Offline — Please check your connection.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            });
          }
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first for public booking pages
  if (url.pathname.startsWith("/book/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Always try to update the cache in the background (stale-while-revalidate)
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cache-first for static assets (images, fonts, icons)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(STATIC_CACHE).then((cache) =>
            cache.put(request, cloned)
          );
        }
        return response;
      });
    })
  );
});

// ─── Rich Push Notification Handler ─────────────────────────────────────────
// Handles all 3 notification types:
//   turn_called   → "Your turn is NOW!" — urgent, red badge
//   turn_nearby   → "2 patients before you" — amber warning
//   reminder      → "Appointment in 30 minutes" — calm blue
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Doctor Diary", body: event.data.text() };
  }

  const type = data.type || "default";

  // ── Notification Variant Config ───────────────────────────────────────────
  const configs = {
    turn_called: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [400, 100, 400, 100, 600],
      tag: `turn-called-${data.appointmentId || "main"}`,
      renotify: true,
      requireInteraction: true,
      silent: false,
      actions: [
        { action: "open_tracking", title: "🏥 Open Queue", icon: "/icon-192.png" },
        { action: "dismiss", title: "Later" },
      ],
    },
    turn_nearby: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      tag: `turn-nearby-${data.appointmentId || "main"}`,
      renotify: true,
      requireInteraction: false,
      silent: false,
      actions: [
        { action: "open_tracking", title: "👀 Track Queue", icon: "/icon-192.png" },
        { action: "dismiss", title: "OK" },
      ],
    },
    reminder: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [150, 75, 150],
      tag: `reminder-${data.appointmentId || "main"}`,
      renotify: false,
      requireInteraction: false,
      silent: false,
      actions: [
        { action: "open_tracking", title: "📍 Track Live", icon: "/icon-192.png" },
        { action: "open_directions", title: "🗺️ Directions" },
      ],
    },
    checkin_confirmed: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      tag: `checkin-${data.appointmentId || "main"}`,
      renotify: false,
      requireInteraction: false,
      silent: false,
      actions: [
        { action: "open_tracking", title: "📊 View My Queue", icon: "/icon-192.png" },
      ],
    },
    default: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200],
      tag: `notification-${Date.now()}`,
      renotify: false,
      requireInteraction: false,
      silent: false,
      actions: [
        { action: "open_tracking", title: "Open App", icon: "/icon-192.png" },
      ],
    },
  };

  const config = configs[type] || configs.default;

  const notificationOptions = {
    body: data.body || "You have a new update from your clinic.",
    icon: config.icon,
    badge: config.badge,
    vibrate: config.vibrate,
    tag: config.tag,
    renotify: config.renotify,
    requireInteraction: config.requireInteraction,
    silent: config.silent,
    data: {
      url: data.url || "/",
      appointmentId: data.appointmentId || null,
      directionsUrl: data.directionsUrl || null,
      type,
    },
    actions: config.actions,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Doctor Diary", notificationOptions)
  );
});

// ─── Rich Notification Click Handler ─────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { action } = event;
  const notifData = event.notification.data || {};
  const trackUrl = notifData.url || "/";
  const directionsUrl = notifData.directionsUrl;

  let targetUrl = trackUrl;

  if (action === "open_directions" && directionsUrl) {
    targetUrl = directionsUrl;
  } else if (action === "dismiss") {
    return; // Just close, do nothing
  }
  // "open_tracking" or any other action → open tracking page

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If there's already an open tab at this URL, focus it
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});


