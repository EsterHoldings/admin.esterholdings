import { defineNuxtPlugin } from "nuxt/app";

const RECOVERY_KEY = "ester-admin-pwa-recovered";

const clearServiceWorkerState = async () => {
  const registrations = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistrations() : [];
  await Promise.all(registrations.map(registration => registration.unregister()));

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
  }
};

const shouldRecoverFromError = (message: string) => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("loading chunk") ||
    normalized.includes("chunkloaderror") ||
    normalized.includes("/_nuxt/")
  );
};

export default defineNuxtPlugin(nuxtApp => {
  const recover = async (reason: string) => {
    if (sessionStorage.getItem(RECOVERY_KEY) === "1") return;

    sessionStorage.setItem(RECOVERY_KEY, "1");
    console.warn("Recovering Ester Admin after stale PWA asset failure:", reason);

    try {
      await clearServiceWorkerState();
    } finally {
      window.location.reload();
    }
  };

  const clearRecoveryFlag = () => {
    sessionStorage.removeItem(RECOVERY_KEY);
  };

  window.addEventListener("vite:preloadError", event => {
    event.preventDefault();
    void recover("vite preload error");
  });

  window.addEventListener(
    "error",
    event => {
      const target = event.target as HTMLElement | null;
      const isAssetError =
        target?.tagName === "SCRIPT" || target?.tagName === "LINK" || shouldRecoverFromError(event.message || "");

      if (isAssetError) {
        void recover(event.message || "asset load error");
      }
    },
    true
  );

  window.addEventListener("unhandledrejection", event => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "");

    if (shouldRecoverFromError(reason)) {
      event.preventDefault();
      void recover(reason);
    }
  });

  nuxtApp.hook("app:mounted", clearRecoveryFlag);
});
