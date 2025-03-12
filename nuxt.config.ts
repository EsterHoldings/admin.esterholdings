// @ts-ignore
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: true,
  css: [
    "~/assets/styles/main.scss",
  ],
  modules: [
    "@pinia/nuxt",
  ],
  plugins: [
    '~/plugins/eventBus.ts'
  ],
  imports: {
    dirs: ["stores"],
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
  routeRules: {
    '/admin/**': { ssr: false }
  }
});