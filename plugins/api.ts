import {defineNuxtPlugin, useRuntimeConfig} from "nuxt/app";
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const api = $fetch.create({
        // @ts-ignore
        baseURL: config.public.apiBase,
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    return { provide: { api } }
})