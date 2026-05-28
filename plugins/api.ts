import { defineNuxtPlugin, useCookie, useNuxtApp, useRuntimeConfig } from "nuxt/app";
import { normalizeAdminLocale, persistAdminLocale, readPersistedAdminLocale } from "~/utils/adminLocale";

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const resolveLocale = () => {
        const localeCookie = useCookie<string>("locale");
        const adminLocaleCookie = useCookie<string>("admin_locale");
        const i18nRedirected = useCookie<string>("i18n_redirected");
        const nuxtApp = useNuxtApp();
        const i18n = (nuxtApp?.$i18n ?? null) as { locale?: string | { value: string } } | null;
        const i18nLocale =
            typeof i18n?.locale === "string" ? i18n.locale : i18n?.locale?.value;
        const resolved = normalizeAdminLocale(readPersistedAdminLocale() || adminLocaleCookie.value || localeCookie.value || i18nRedirected.value || i18nLocale);

        if (resolved) {
            persistAdminLocale(resolved);
            if (localeCookie.value !== resolved) {
                localeCookie.value = resolved;
            }
            if (adminLocaleCookie.value !== resolved) {
                adminLocaleCookie.value = resolved;
            }
            if (i18nRedirected.value !== resolved) {
                i18nRedirected.value = resolved;
            }
        }

        return resolved;
    };

    const api = $fetch.create({
        // @ts-ignore
        baseURL: config.public.apiBase,
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        onRequest({ options }) {
            const locale = resolveLocale();
            if (locale) {
                const headers = new Headers(options.headers as HeadersInit);
                headers.set("X-Locale", locale);
                headers.set("Accept-Language", locale);
                options.headers = headers;
            }
        },
    })
    return { provide: { api } }
})
