import { defineNuxtConfig } from "nuxt/config";
import * as process from "node:process";

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
    plugins: [
        "~/plugins/eventBus.ts",
        '~/plugins/app-config.client.ts',
    ],
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
                file: "en.ts",
            },

            {
                code: "ru",
                iso: "ru-RU",
                name: "Russian",
                file: "ru.ts",
            },
        ],
        fallbackLocale: process.env.FALLBACK_LOCALE,
        defaultLocale: process.env.APP_LOCALE,
        // experimental: {
        //     jsTsFormatResource: false,
        // },
        escapeParameterHtml: false,
        runtimeOnly: false,
        compositionOnly: true,
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
            watch: {
                usePolling: true,
            },
        },
    },

    runtimeConfig: {
        recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
        public: {
            baseApi: process.env.NUXT_PUBLIC_BASE_API || "http://localhost:8000/api/",
            baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000/",
            cliFacebook: process.env.NUXT_PUBLIC_CLI_FACEBOOK,
            cliGoogle: process.env.NUXT_PUBLIC_CLI_GOOGLE,
            cliLinkIdIn: process.env.NUXT_PUBLIC_CLI_LINK_ID_IN,
            reCaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
        }
    },

    routeRules: {
        "/**": { ssr: false } as any,
        "/": { ssr: true } as any,
    },

    app: {
        head: {
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }
            ],
            script: [
                {
                    src: "https://accounts.google.com/gsi/client",
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
                secure: false
            }
        }
    },
});
