import {defineStore} from "pinia";
import {ref} from 'vue'

export const useThemeStore = defineStore("theme", () => {

    const currentTheme = ref<'light' | 'dark'>('light')
    const lightTheme = {
        '--color-ui-background': '#ffffff',
        '--color-ui-primary': '#ffffff',
        '--color-ui-primary-defalt': '#151515',
        '--color-ui-warning': '#f75709',
        '--color-sticker-ui-success': '#03c11f',
        '--color-sticker-ui-danger': '#d93025',
        '--color-stroke-ui-light': '#f9f9f9',
        '--color-stroke-ui-dark': '#011644',
        '--color-stroke-ui': '#b8b8c3',
        // '--color-ui-grey': '#3c3c3c'
    }

    const darkTheme = {
        '--color-ui-background': '#000028',
        '--color-ui-primary': '#0051ff',
        '--color-ui-primary-defalt': '#ffffff',
        '--color-ui-warning': '#f75709',
        '--color-sticker-ui-success': '#03c11f',
        '--color-sticker-ui-danger': '#d93025',
        '--color-stroke-ui-light': '#01014E',
        '--color-stroke-ui-dark': '#011644',
        '--color-stroke-ui': 'linear-gradient(137.67deg, #1b63ff 2.397%, #011644 99.041%)',
        '--color-ui-grey': '#b8b8c3'
    }


    function applyTheme(theme: Record<string, string>) {
        const root = document.documentElement
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(key, value)


        })
    }

    function toggleTheme() {
        currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
        const theme = currentTheme.value === 'light' ? lightTheme : darkTheme
        applyTheme(theme)
        localStorage.setItem('theme', currentTheme.value)
    }

    function initTheme() {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
        currentTheme.value = saved || 'light'
        const theme = currentTheme.value === 'light' ? lightTheme : darkTheme
        applyTheme(theme)
    }

    if (process.client) {
        initTheme();
    }


    return {
        currentTheme,
        toggleTheme,
        initTheme
    };
});
