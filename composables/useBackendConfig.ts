import { useFetch, useRuntimeConfig, useState } from 'nuxt/app';

export interface I18nOptions {
  translations: Record<string, any>,
  locales: Record<string, string>,
  locale: string,
}

export interface I18nPlugin {
  translate: (key: string, vars?: Record<string, unknown>) => string,
  currentLocale: string,
  options: Record<string, string>,
  locales: string[],
}

interface Route {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'ANY' | 'PATCH'[],
  uri: string,
  parameters?: string[],
  bindings?: Record<string, any>,
};

interface RouterOptions {
  url: string,
  routes: Record<string, Route>
}

interface ApiConfig {
  translations: Record<string, any>,
  locales: Record<string, string>,
  ziggy: RouterOptions;
}

export const useBackendConfig = () => {
  const config = useState<ApiConfig>('api-config');

  const fetchConfig = async () => {
    const { data } = await useFetch('/configurations', {
      baseURL: useRuntimeConfig().public.baseApi,
      server: true,
    });

    if (data.value) {
      const responseData = data.value as any;

      config.value = {
        translations: responseData.translations || {},
        locales: responseData.locales || {},
        ziggy: responseData.ziggy || { url: '', routes: {} }
      };
    }
  }

  const fetchTranslations = async (locale: 'ru' | 'en') => {
    // const { data } = await useFetch('/configurations/translations', {
    //   baseURL: useRuntimeConfig().public.baseApi,
    //   server: true,
    // });

    // return data.value;

    return {
      welcome: 'Добро пожаловать',
      user: {
        greeting: 'Привет, {name}!'
      },
      // ...data.value // добавляем переводы из API
    }
  }

  return {
    config,
    fetchConfig,
    fetchTranslations
  }
}