import { defineNuxtConfig } from "nuxt/config";

// @ts-ignore
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: true,
  css: ["~/assets/styles/main.scss"],
  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],
  plugins: ["~/plugins/eventBus.ts"],
  imports: {
    dirs: ["stores"],
  },
  // @ts-ignore
  i18n: {
    lazy: true,
    langDir: "locales",

    strategy: "prefix",
    locales: [
      {
        code: "en",
        iso: "en-US",
        name: "English",
        file: "en.json",
      },

      {
        code: "ru",
        iso: "ru-RU",
        name: "Russian",
        file: "ru.json",
      },
    ],

    defaultLocale: "en",
    experimental: {
      jsTsFormatResource: false,
    },
    escapeParameterHtml: false,
    runtimeOnly: false,
    compositionOnly: true,
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
  routeRules: {
    "/**": { ssr: false } as any,
    "/": { ssr: true } as any,
  },

  app: {
    head: {
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
      ],
    },
  },
});
