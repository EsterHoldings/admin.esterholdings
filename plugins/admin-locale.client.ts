import { defineNuxtPlugin } from "nuxt/app";
import { normalizeAdminLocale, persistAdminLocale, readPersistedAdminLocale } from "~/utils/adminLocale";

export default defineNuxtPlugin(async nuxtApp => {
  const i18n = nuxtApp.$i18n as { locale?: string | { value: string }; setLocale?: (locale: string) => Promise<void> } | undefined;
  const currentLocale = normalizeAdminLocale(typeof i18n?.locale === "string" ? i18n.locale : i18n?.locale?.value);
  const desiredLocale = readPersistedAdminLocale() || currentLocale;
  if (!desiredLocale) return;

  persistAdminLocale(desiredLocale);

  if (currentLocale !== desiredLocale && typeof i18n?.setLocale === "function") {
    await i18n.setLocale(desiredLocale);
  }
});
