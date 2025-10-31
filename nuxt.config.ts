// @ts-ignore
import { defineNuxtConfig } from 'nuxt/config';
// @ts-ignore
import * as process from 'node:process';

// @ts-ignore
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  routeRules: {
    '/**': { ssr: false } as any,
    '/': { ssr: true } as any,
  },
  css: ['~/assets/styles/main.scss'],
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  plugins: ['~/plugins/eventBus.ts'],
  imports: {
    dirs: ['stores'],
  },
  // @ts-ignore
  i18n: {
    lazy: true,
    langDir: 'locales',

    strategy: 'prefix',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json',
      },
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Russian',
        file: 'ru.json',
      },
      {
        code: 'de',
        iso: 'de-DE',
        name: 'Deutsch',
        file: 'de.json',
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        file: 'es.json',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        file: 'fr.json',
      },
      {
        code: 'it',
        iso: 'it-IT',
        name: 'Italiano',
        file: 'it.json',
      },
      {
        code: 'pt',
        iso: 'pt-PT',
        name: 'Português',
        file: 'pt.json',
      },
      {
        code: 'tr',
        iso: 'tr-TR',
        name: 'Türkçe',
        file: 'tr.json',
      },
      {
        code: 'uk',
        iso: 'uk-UA',
        name: 'Українська',
        file: 'uk.json',
      },
      {
        code: 'he',
        iso: 'he-IL',
        name: 'עברית',
        file: 'he.json',
      },
      {
        code: 'hi',
        iso: 'hi-IN',
        name: 'हिन्दी',
        file: 'hi.json',
      },
      {
        code: 'ja',
        iso: 'ja-JP',
        name: '日本語',
        file: 'ja.json',
      },
      {
        code: 'ko',
        iso: 'ko-KR',
        name: '한국어',
        file: 'ko.json',
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        name: '中文',
        file: 'zh.json',
      },
    ],
    fallbackLocale: 'en',
    defaultLocale: 'en',
    experimental: {
      // @ts-ignore
      jsTsFormatResource: false,
    },
    escapeParameterHtml: false,
    runtimeOnly: false,
    compositionOnly: true,
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'My App',
      short_name: 'MyApp',
      start_url: '/',
      display: 'standalone',
      theme_color: '#0f172a',
      background_color: '#0b1220',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      navigateFallback: '/',
    },
    devOptions: { enabled: false },
  },

  vite: {
    server: {
      proxy: {
        '/api/': {
          target: 'http://127.0.0.1:8000/',
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        usePolling: true,
      },
    },
  },

  runtimeConfig: {
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    public: {
      hostBase: process.env.NUXT_PUBLIC_HOST_BASE || 'https://esterholdings.website',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://esterholdings.website/api',

      // читаємо спочатку NUXT_PUBLIC_*, якщо немає — VITE_*
      reverbKey: process.env.NUXT_PUBLIC_REVERB_KEY || process.env.VITE_REVERB_APP_KEY || '',
      reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || process.env.VITE_REVERB_HOST || 'localhost',
      reverbPort: process.env.NUXT_PUBLIC_REVERB_PORT || process.env.VITE_REVERB_PORT || '8080',
      reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || process.env.VITE_REVERB_SCHEME || 'http',

      baseApi: process.env.NUXT_PUBLIC_BASE_API || 'https://esterholdings.website/api/',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://stage.esterholdings.website/',
      cliFacebook: process.env.NUXT_PUBLIC_CLI_FACEBOOK || '1668019407177142',
      cliGoogle:
        process.env.NUXT_PUBLIC_CLI_GOOGLE ||
        '351197430667-flnael7gi4buja9a203e7rgebc6ug5dq.apps.googleusercontent.com',
      cliLinkIdIn: process.env.NUXT_PUBLIC_CLI_LINK_ID_IN || '784gmiujlnm9h2',
      reCaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LcxyW8rAAAAAB7veVQONzCAW9W1JBdWAXjHUg0P',
    },
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }],
      script: [
        {
          src: 'https://accounts.google.com/gsi/client',
          async: true,
          defer: true,
        },
        // {
        //     src: 'https://www.google.com/recaptcha/api.js?render=6LcxyW8rAAAAAB7veVQONzCAW9W1JBdWAXjHUg0P',
        //     async: true,
        //     defer: true,
        // },
      ],
    },
  },

  nitro: {
    devProxy: {
      '/api/': {
        target: 'http://127.0.0.1:8000/',
        changeOrigin: true,
        prependPath: true,
        secure: false,
      },
    },
  },
});
