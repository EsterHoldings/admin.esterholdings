// plugins/echo.client.ts
import Echo from 'laravel-echo'
import type EchoType from 'laravel-echo'
import Pusher from 'pusher-js'
import {defineNuxtPlugin, useRuntimeConfig} from "nuxt/app";
import {USER_ACCESS_TOKEN} from "~/constants/auth";

declare global { interface Window { Pusher: any; Echo: EchoType<any> } }

export default defineNuxtPlugin(() => {
    const cfg = useRuntimeConfig().public as {
        hostBase?: string
        apiBase?: string
        reverbKey?: string
        reverbHost?: string
        reverbPort?: string | number
        reverbScheme?: string
    }

    console.table('--- --- ---');
    console.table({
        hostBase: cfg.hostBase,
        apiBase: cfg.apiBase,
        reverbKey: cfg.reverbKey,
        reverbHost: cfg.reverbHost,
        reverbPort: cfg.reverbPort,
        reverbScheme: cfg.reverbScheme,
    })
    console.table('--- --- ---');

    const apiBase = cfg.hostBase || 'http://localhost:3000'

    console.log('API BASE URL:', apiBase);

    window.Pusher = Pusher

    const token = localStorage.getItem(USER_ACCESS_TOKEN) || ''

    console.log('TOKEN:', apiBase);

    const xsrf = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
    const echo = new Echo({
        broadcaster: 'reverb',
        key: cfg.reverbKey,
        wsHost: cfg.reverbHost,
        wsPort: Number(cfg.reverbPort),
        wssPort: Number(cfg.reverbPort),
        forceTLS: false,
        enabledTransports: ['ws'],
        authEndpoint: `${apiBase}/broadcasting/auth`,
        withCredentials: true,
        auth: {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(xsrf)
            }
        },
    })

    // @ts-ignore
    window.Echo = echo
    return { provide: { echo } }
})
