import { defineNuxtPlugin, useCookie } from "nuxt/app";

const ADMIN_LOCALE_STORAGE_KEY = "admin_locale";
const SUPPORTED_ADMIN_LOCALES = new Set(["en", "ru", "de", "es", "fr", "it", "pt", "tr", "uk", "he", "hi", "ja", "ko", "zh"]);

const normalizeLocale = (value: unknown): string => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace("_", "-");
  const primary = normalized.split("-")[0] || normalized;

  return SUPPORTED_ADMIN_LOCALES.has(normalized) ? normalized : SUPPORTED_ADMIN_LOCALES.has(primary) ? primary : "";
};

export default defineNuxtPlugin(async nuxtApp => {
  const adminLocaleCookie = useCookie<string>(ADMIN_LOCALE_STORAGE_KEY, {
    maxAge: 31536000,
    sameSite: "lax",
    path: "/",
  });
  const localeCookie = useCookie<string>("locale", {
    maxAge: 31536000,
    sameSite: "lax",
    path: "/",
  });
  const redirectedCookie = useCookie<string>("i18n_redirected", {
    maxAge: 31536000,
    sameSite: "lax",
    path: "/",
  });

  const storedLocale = normalizeLocale(localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY));
  const cookieLocale = normalizeLocale(adminLocaleCookie.value || redirectedCookie.value || localeCookie.value);
  const desiredLocale = storedLocale || cookieLocale;
  if (!desiredLocale) return;

  localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, desiredLocale);
  adminLocaleCookie.value = desiredLocale;
  localeCookie.value = desiredLocale;
  redirectedCookie.value = desiredLocale;

  const i18n = nuxtApp.$i18n as { locale?: string | { value: string }; setLocale?: (locale: string) => Promise<void> } | undefined;
  const currentLocale = normalizeLocale(typeof i18n?.locale === "string" ? i18n.locale : i18n?.locale?.value);
  if (currentLocale !== desiredLocale && typeof i18n?.setLocale === "function") {
    await i18n.setLocale(desiredLocale);
  }
});
