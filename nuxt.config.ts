// @ts-ignore
import { defineNuxtConfig } from "nuxt/config";
// @ts-ignore
import * as process from "node:process";
import Aura from "@primeuix/themes/aura";

// @ts-ignore
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  hooks: {
    "pages:extend"(pages) {
      const keepAndNormalizeAdminRoutes = (page: any): boolean => {
        if (page.children?.length) {
          page.children = page.children.filter(keepAndNormalizeAdminRoutes);
        }

        const file = String(page.file ?? "");
        if (/[\\/](components|composables)[\\/]/.test(file)) return false;
        if (file && !file.endsWith(".vue")) return false;

        const path = page.path ?? "";
        if (!path.startsWith("/admin")) return false;

        const normalizedPath = path.replace(/^\/admin(?=\/|$)/, "");
        page.path = normalizedPath || "/";

        return true;
      };

      pages.splice(0, pages.length, ...pages.filter(keepAndNormalizeAdminRoutes));
    },
  },

  // Додаємо явні налаштування дев-сервера
  devServer: {
    host: process.env.NUXT_DEV_HOST || "localhost",
    port: Number(process.env.NUXT_DEV_PORT || process.env.PORT || 3000),
  },

  ssr: true,
  routeRules: {
    "/**": { ssr: false } as any,
    "/": { ssr: true } as any,
  },
  css: ["primeicons/primeicons.css", "~/assets/styles/main.scss", "~/assets/styles/primevue.scss"],
  modules: ["@pinia/nuxt", "@nuxtjs/i18n", "@nuxtjs/tailwindcss", "@vite-pwa/nuxt", "@primevue/nuxt-module"],
  primevue: {
    autoImport: false,
    components: {
      prefix: "Prime",
      include: ["Button", "Card", "DatePicker", "InputText", "Paginator", "Select", "Skeleton", "Tag", "ToggleSwitch"],
    },
    options: {
      ripple: true,
      inputVariant: "filled",
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    },
  },
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
      {
        code: "de",
        iso: "de-DE",
        name: "Deutsch",
        file: "de.json",
      },
      {
        code: "es",
        iso: "es-ES",
        name: "Español",
        file: "es.json",
      },
      {
        code: "fr",
        iso: "fr-FR",
        name: "Français",
        file: "fr.json",
      },
      {
        code: "it",
        iso: "it-IT",
        name: "Italiano",
        file: "it.json",
      },
      {
        code: "pt",
        iso: "pt-PT",
        name: "Português",
        file: "pt.json",
      },
      {
        code: "tr",
        iso: "tr-TR",
        name: "Türkçe",
        file: "tr.json",
      },
      {
        code: "uk",
        iso: "uk-UA",
        name: "Українська",
        file: "uk.json",
      },
      {
        code: "he",
        iso: "he-IL",
        name: "עברית",
        file: "he.json",
      },
      {
        code: "hi",
        iso: "hi-IN",
        name: "हिन्दी",
        file: "hi.json",
      },
      {
        code: "ja",
        iso: "ja-JP",
        name: "日本語",
        file: "ja.json",
      },
      {
        code: "ko",
        iso: "ko-KR",
        name: "한국어",
        file: "ko.json",
      },
      {
        code: "zh",
        iso: "zh-CN",
        name: "中文",
        file: "zh.json",
      },
    ],
    fallbackLocale: "en",
    defaultLocale: "en",
    experimental: {
      // @ts-ignore
      jsTsFormatResource: false,
    },
    escapeParameterHtml: false,
    runtimeOnly: false,
    compositionOnly: true,
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "My App",
      short_name: "MyApp",
      start_url: "/",
      display: "standalone",
      theme_color: "#0f172a",
      background_color: "#0b1220",
      icons: [
        { src: "/favicon/favicon.png", sizes: "192x192", type: "image/png" },
        { src: "/favicon/favicon.png", sizes: "512x512", type: "image/png" },
        { src: "/favicon/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
      navigateFallback: "/",
    },
    devOptions: { enabled: false },
    // ✳️ Головне: примусово знищує старий SW у деві/локалі, щоб він не ламав HMR
    selfDestroying: true,
  },

  vite: {
    server: {
      proxy: {
        "/api/": {
          target: "http://127.0.0.1:8000/",
          changeOrigin: true,
          secure: false,
        },
      },

      // ✳️ Стабілізація HMR
      hmr: {
        host: process.env.NUXT_DEV_HMR_HOST || process.env.NUXT_DEV_HOST || "localhost",
        // якщо дев по HTTPS (через проксі) — встанови NUXT_DEV_HTTPS=1
        protocol: process.env.NUXT_DEV_HTTPS === "1" || process.env.HTTPS === "1" ? "wss" : "ws",
        // порт WS-сервера (як правило дорівнює devServer.port)
        port: Number(process.env.NUXT_DEV_HMR_PORT || process.env.NUXT_DEV_PORT || process.env.PORT || 3000),
        // порт, який бачить БРАУЗЕР (через проксі/домен)
        clientPort: Number(process.env.NUXT_DEV_CLIENT_PORT || process.env.NUXT_DEV_PORT || process.env.PORT || 3000),
        timeout: 30000,
        overlay: true,
      },

      // ✳️ Вотчер менш нервовий і ігнорує службові папки
      watch: {
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
          stabilityThreshold: 200,
          pollInterval: 100,
        },
        ignored: [
          "**/.nuxt/**",
          "**/.output/**",
          "**/node_modules/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**/pwa-*",
          "**/public/**/sw.js",
        ],
      },
    },
  },

  runtimeConfig: {
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    public: {
      hostBase: process.env.NUXT_PUBLIC_HOST_BASE || "https://server.esterholdings.com",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://server.esterholdings.com/api",

      reverbKey: process.env.NUXT_PUBLIC_REVERB_KEY || process.env.VITE_REVERB_APP_KEY || "",
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || process.env.VITE_REVERB_HOST || "",
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || process.env.VITE_REVERB_PORT || "",
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || process.env.VITE_REVERB_SCHEME || "",

      baseApi: process.env.NUXT_PUBLIC_BASE_API || "https://server.esterholdings.com/api/",
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "https://server.esterholdings.com/",
      cliFacebook: process.env.NUXT_PUBLIC_CLI_FACEBOOK || "1668019407177142",
      cliGoogle:
        process.env.NUXT_PUBLIC_CLI_GOOGLE ||
        "351197430667-flnael7gi4buja9a203e7rgebc6ug5dq.apps.googleusercontent.com",
      cliLinkIdIn: process.env.NUXT_PUBLIC_CLI_LINK_ID_IN || "784gmiujlnm9h2",
      reCaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LcxyW8rAAAAAB7veVQONзCAW9W1JBdWAXjHUg0P",
    },
  },

  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon/favicon.ico" }],
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        },
      ],
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
        // {
        //     src: 'https://www.google.com/recaptcha/api.js?render=6LcxyW8rAAAAAB7veVQONзCAW9W1JBdWAXjHUg0P',
        //     async: true,
        //     defer: true,
        // },
      ],
    },
  },

  nitro: {
    devProxy: {
      "/api/": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
        prependPath: true,
        secure: false,
      },
    },
  },
});
