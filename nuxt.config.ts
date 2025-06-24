import {defineNuxtConfig} from "nuxt/config";

// @ts-ignore
export default defineNuxtConfig({
    typescript: {
        shim: false,
    },
    compatibilityDate: "2024-04-03",
    devtools: {enabled: true},
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
        fallbackLocale: 'en',
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
            proxy: {
                "/api/": {
                    target: "http://localhost:8000/",
                    changeOrigin: true,
                    secure: false,
                },
            },
            watch: {
                usePolling: true,
            },
        },
    },
    routeRules: {
        "/**": {ssr: false} as any,
        "/": {ssr: true} as any,
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

    nitro: {
        devProxy: {
            '/api/': {
                target: 'http://localhost:8000/',
                changeOrigin: true,
                secure: false
            }
        }
    },

    runtimeConfig: {
        public: {
            // apiUrl: process.env.NUXT_PUBLIC_API_URL,
            apiUrl: "https://esterholdings.website/api/",
        }
    }
});
