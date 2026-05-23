/**
 * UniConnect service worker.
 *
 * Two jobs:
 *   1. Offline-tolerant caching for the app shell + hashed JS/CSS assets.
 *      Network-first for API calls so data stays fresh; cache-first for
 *      static assets so cold loads are fast.
 *   2. Web Push delivery. The backend posts a JSON payload; we render it
 *      via showNotification and route clicks to payload.data.url.
 *
 * Bump CACHE_VERSION on any breaking change to caching strategy so
 * old caches get evicted on activate.
 */

const CACHE_VERSION = "uniconnect-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

const SHELL_URLS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  // Activate the new SW immediately on first install / update.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

const isAssetRequest = (url) => /\/assets\/.+\.(?:js|css)$/.test(url.pathname);

const isApiRequest = (url) => url.pathname.startsWith("/api/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cache-first for hashed assets. Filenames are content-addressed by Vite,
  // so anything we have cached is by definition the right bytes.
  if (isAssetRequest(url)) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })
    );
    return;
  }

  // Network-first for API: try the network, fall back to the cached shell
  // only for navigation/document requests when offline.
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request).catch(() => new Response("", { status: 504 }))
    );
    return;
  }

  // Navigation requests: network-first, fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const shell = await caches.open(SHELL_CACHE);
        return (
          (await shell.match("/index.html")) ||
          (await shell.match("/")) ||
          new Response("Offline", { status: 503 })
        );
      })
    );
    return;
  }

  // Everything else: just pass through to network.
});

/* ===================== WEB PUSH ===================== */

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "UniConnect", body: event.data.text() };
  }

  const title = payload.title || "UniConnect";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: payload.url || (payload.data && payload.data.url) || "/",
      ...(payload.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // If a window for our origin is already open, focus it and route in-app.
      for (const client of clientsList) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            await client.focus();
            // Best-effort: tell the page where to go without a hard reload.
            client.postMessage({
              type: "notification-navigate",
              url: targetUrl,
            });
            return;
          }
        } catch {
          /* malformed client.url — fall through to openWindow */
        }
      }

      // No open window — pop a new one straight to the target URL.
      await self.clients.openWindow(targetUrl);
    })()
  );
});
