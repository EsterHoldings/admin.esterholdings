// @ts-ignore
import { resolve } from "path";

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

  i18n: {
    lazy: true,
    langDir: resolve("./locales"),

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
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});
