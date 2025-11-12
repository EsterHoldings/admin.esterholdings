import {defineNuxtPlugin, useRuntimeConfig} from "nuxt/app";


export default defineNuxtPlugin(async () => {
    const hostBase = useRuntimeConfig().public.hostBase || 'http://localhost:8000'

    await $fetch(`${hostBase}/sanctum/csrf-cookie`, {
        credentials: 'include',
    })
})