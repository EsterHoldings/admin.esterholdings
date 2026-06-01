import {defineNuxtPlugin, useRuntimeConfig} from "nuxt/app";


export default defineNuxtPlugin(() => {
    const hostBase = useRuntimeConfig().public.hostBase || 'http://localhost:8000'

    void $fetch(`${hostBase}/sanctum/csrf-cookie`, {
        credentials: 'include',
    }).catch(error => {
        console.warn("Failed to preload Sanctum CSRF cookie:", error);
    })
})
