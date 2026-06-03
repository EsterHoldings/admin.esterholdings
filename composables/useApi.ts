import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useAuthStore } from "~/stores/authStore";
import {
  ROUTE_ADMIN_AUTH_LOGIN,
  ROUTE_ADMIN_AUTH_REFRESH,
  ROUTE_AUTH_LOGIN,
  ROUTE_AUTH_REFRESH,
} from "~/constants/routes";
import { useCookie, useNuxtApp, useRuntimeConfig } from "nuxt/app";
import useAppCore from "~/composables/useAppCore";
import { useErrorStack } from "~/stores/errors";
import { normalizeAdminLocale, persistAdminLocale, readPersistedAdminLocale } from "~/utils/adminLocale";

const API_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

const normalizeApiDateTimes = (payload: unknown, seen = new WeakSet<object>()): unknown => {
  if (typeof payload === "string") {
    return API_DATE_TIME_PATTERN.test(payload) ? `${payload.replace(" ", "T")}Z` : payload;
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (seen.has(payload)) {
    return payload;
  }

  seen.add(payload);

  if (Array.isArray(payload)) {
    for (let index = 0; index < payload.length; index += 1) {
      payload[index] = normalizeApiDateTimes(payload[index], seen);
    }

    return payload;
  }

  for (const key of Object.keys(payload as Record<string, unknown>)) {
    (payload as Record<string, unknown>)[key] = normalizeApiDateTimes((payload as Record<string, unknown>)[key], seen);
  }

  return payload;
};

export class useApi {
  private readonly api: AxiosInstance;

  constructor(forClient = false) {
    const config = useRuntimeConfig();
    // @ts-ignore
    const { baseApi, apiTimeoutMs } = config.public as { baseApi: string; apiTimeoutMs?: string | number };
    const timeout = Number(apiTimeoutMs || 15000);

    this.api = axios.create({
      baseURL: baseApi,
      // headers: {"Content-Type": "application/json"},
      withCredentials: true,
      timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 15000,
    });

    const errorsStack = useErrorStack();
    errorsStack.flush();

    const resolveLocale = () => {
      const localeCookie = useCookie<string>("locale");
      const adminLocaleCookie = useCookie<string>("admin_locale");
      const i18nRedirected = useCookie<string>("i18n_redirected");
      const nuxtApp = useNuxtApp();
      const i18n = (nuxtApp?.$i18n ?? null) as { locale?: string | { value: string } } | null;
      const i18nLocale = typeof i18n?.locale === "string" ? i18n.locale : i18n?.locale?.value;
      const resolved = normalizeAdminLocale(
        readPersistedAdminLocale() ||
          adminLocaleCookie.value ||
          localeCookie.value ||
          i18nRedirected.value ||
          i18nLocale
      );

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

    this.api.interceptors.request.use(config => {
      const authStore = forClient ? useAuthStore() : useAdminAuthStore();
      if (authStore.accessToken) config.headers.Authorization = `Bearer ${authStore.accessToken}`;

      const locale = resolveLocale();
      if (locale) {
        config.headers["X-Locale"] = locale;
        config.headers["Accept-Language"] = locale;
      }

      return config;
    });

    this.api.interceptors.response.use(
      res => {
        normalizeApiDateTimes(res.data);

        return res;
      },
      async err => {
        const appCore = useAppCore();
        const authStore = forClient ? useAuthStore() : useAdminAuthStore();
        const orig = err.config;

        if (
          err.response?.status === 401 &&
          !orig._retry &&
          !orig.url?.endsWith(ROUTE_AUTH_REFRESH) &&
          !orig.url?.endsWith(ROUTE_AUTH_LOGIN) &&
          !orig.url?.endsWith(ROUTE_ADMIN_AUTH_REFRESH) &&
          !orig.url?.endsWith(ROUTE_ADMIN_AUTH_LOGIN)
        ) {
          orig._retry = true;

          try {
            const { data } = forClient ? await appCore.auth.doRefresh() : await appCore.adminModules.auth.doRefresh();
            authStore.setAccessToken(data.access_token);
            orig.headers.Authorization = `Bearer ${data.access_token}`;
            return this.api(orig);
          } catch {
            await authStore.authLogout();
          }
        }

        // single message
        if (err.response?.status === 401 && err.response.data && err.response.data.message) {
          errorsStack.$patch({
            errors: {},
            message: err.response.data?.message,
          });
        }

        // validation errors
        if (err.response?.status === 422 && err.response.data) {
          errorsStack.$patch({
            errors: err.response.data?.errors || {},
            message: err.response.data?.message || null,
          });
        }

        return Promise.reject(err);
      }
    );
  }

  request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.api.request(config);
  }

  get(url: string, params: object = {}): Promise<AxiosResponse> {
    return this.api.get(url, { params });
  }

  post(url: string, data?: object, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    return this.api.post(url, data, config);
  }

  put(url: string, data?: object): Promise<AxiosResponse> {
    return this.api.put(url, data);
  }

  patch(url: string, data?: object): Promise<AxiosResponse> {
    return this.api.patch(url, data);
  }

  delete(url: string, params: object = {}): Promise<AxiosResponse> {
    return this.api.delete(url, { params });
  }
}

export default useApi;
