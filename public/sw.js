// Auto-versioned cache: update BUILD_TIME on each deploy
// In production, inject the build timestamp via CI/CD or use a build hash
const BUILD_TIME = "2026-06-25"; // Update this on each deploy
const CACHE_NAME = `doctor-diary-v2-${BUILD_TIME}`;
const STATIC_CACHE = `doctor-diary-static-v2-${BUILD_TIME}`;

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

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Doctor Diary", {
      body: data.body || "You have a new notification",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
