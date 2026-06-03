export const ADMIN_BOOT_RECOVERY_KEY = "ester-admin-boot-recovered";

export const ADMIN_APP_READY_VALUE = "true";

export const isAdminAssetFailure = (message: string): boolean => {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("loading chunk") ||
    normalized.includes("chunkloaderror") ||
    normalized.includes("preload") ||
    normalized.includes("/_nuxt/")
  );
};

export const markAdminAppReady = (): void => {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.adminAppReady = ADMIN_APP_READY_VALUE;
  clearAdminBootRecoveryFlag();
};

export const clearAdminBootRecoveryFlag = (): void => {
  if (typeof sessionStorage === "undefined") return;

  sessionStorage.removeItem(ADMIN_BOOT_RECOVERY_KEY);
};

export const clearAdminServiceWorkerState = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const registrations = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistrations() : [];
  await Promise.all(registrations.map(registration => registration.unregister()));

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
  }
};

export const recoverAdminBoot = async (reason: string): Promise<boolean> => {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return false;
  if (sessionStorage.getItem(ADMIN_BOOT_RECOVERY_KEY) === "1") return false;

  sessionStorage.setItem(ADMIN_BOOT_RECOVERY_KEY, "1");
  console.warn("Recovering Ester Admin after boot failure:", reason);

  try {
    await clearAdminServiceWorkerState();
  } finally {
    window.location.reload();
  }

  return true;
};
