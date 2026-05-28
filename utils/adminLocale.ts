export const ADMIN_LOCALE_STORAGE_KEY = "admin_locale";

const SUPPORTED_ADMIN_LOCALES = new Set(["en", "ru", "de", "es", "fr", "it", "pt", "tr", "uk", "he", "hi", "ja", "ko", "zh"]);
const ADMIN_LOCALE_COOKIE_KEYS = [ADMIN_LOCALE_STORAGE_KEY, "locale", "i18n_redirected"];
const COOKIE_MAX_AGE_SECONDS = 31536000;

export const normalizeAdminLocale = (value: unknown): string => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace("_", "-");
  const primary = normalized.split("-")[0] || normalized;

  if (SUPPORTED_ADMIN_LOCALES.has(normalized)) return normalized;

  return SUPPORTED_ADMIN_LOCALES.has(primary) ? primary : "";
};

const isBrowser = () => typeof window !== "undefined";

const readCookie = (name: string): string => {
  if (typeof document === "undefined") return "";

  const encodedName = `${encodeURIComponent(name)}=`;
  const value = document.cookie
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(encodedName));

  return value ? decodeURIComponent(value.slice(encodedName.length)) : "";
};

const writeCookie = (name: string, value: string): void => {
  if (typeof document === "undefined") return;

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};

export const readPersistedAdminLocale = (): string => {
  if (!isBrowser()) return "";

  try {
    const storedLocale = normalizeAdminLocale(window.localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY));
    if (storedLocale) return storedLocale;
  } catch {
    // Browser storage can be blocked; cookies still give us a stable fallback.
  }

  for (const cookieName of ADMIN_LOCALE_COOKIE_KEYS) {
    const cookieLocale = normalizeAdminLocale(readCookie(cookieName));
    if (cookieLocale) return cookieLocale;
  }

  return "";
};

export const persistAdminLocale = (value: unknown): string => {
  const locale = normalizeAdminLocale(value);
  if (!locale || !isBrowser()) return locale;

  try {
    window.localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, locale);
  } catch {
    // Persisting to cookies below is enough when localStorage is unavailable.
  }

  for (const cookieName of ADMIN_LOCALE_COOKIE_KEYS) {
    writeCookie(cookieName, locale);
  }

  return locale;
};
