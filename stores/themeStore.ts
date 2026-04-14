import { defineStore } from "pinia";
import { ref } from "vue";

type ThemeName = "light" | "dark";

const DEFAULT_THEME: ThemeName = "light";
const THEME_STORAGE_KEY = "theme";

const isThemeName = (value: string | null): value is ThemeName => value === "light" || value === "dark";

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref<ThemeName>(DEFAULT_THEME);
  const lightTheme = {
    "--ui-background": "#ffffff",
    "--ui-background-secondary": "#2a5bbd",
    "--ui-background-admin": "rgba(255, 255, 255, 0.95)",
    "--ui-background-card": "#f2f2f2",
    "--ui-background-panel": "#f1f1f17a",
    "--ui-background-sidebar": "#f9f9f9",
    "--ui-background-sidebar-link": "#9CA9B3",

    "--ui-primary-main": "#0391ff",
    "--ui-primary-accent": "#f75709",

    "--ui-text-invert": "#faf9f9",
    "--ui-text-main": "#151515",
    "--ui-text-secondary": "#3C3C3C",

    "--ui-sticker-success": "#03c11f",
    "--ui-sticker-danger": "#d93025",

    "--color-stroke-ui-dark": "#e4e4e7",
    "--color-stroke-ui-light": "#dcdce1",
    "--color-stroke-ui": "#b8b8c3",
  };

  const darkTheme = {
    "--ui-background": "#000028",
    "--ui-background-admin": "rgba(0, 0, 40, 0.95)",
    "--ui-background-card": "#021238",
    "--ui-background-panel": "rgba(1, 22, 68, 0.6)",
    "--ui-background-secondary": "#031743",
    "--ui-background-sidebar": "rgba(0, 0, 40, 0.95)",
    "--ui-background-sidebar-link": "#011644",

    "--ui-primary-main": "#0051ff",
    "--ui-primary-accent": "#f75709",

    "--ui-text-invert": "#eeeeef",
    "--ui-text-main": "#ffffff",
    "--ui-text-secondary": "#b8b8c3",

    "--ui-sticker-success": "#03c11f",
    "--ui-sticker-danger": "#d93025",

    "--color-stroke-ui-dark": "#011644",
    "--color-stroke-ui-light": "#002880",
    "--color-stroke-ui":
      "linear-gradient(137.67deg, #1b63ff 2.397%, #011644 99.041%)",
    "--color-ui-grey": "#b8b8c3",
  };

  let transitionTimer: ReturnType<typeof setTimeout> | null = null;

  function applyTheme(themeName: ThemeName, withTransition = true) {
    currentTheme.value = themeName;
    const theme = themeName === "light" ? lightTheme : darkTheme;
    const root = document.documentElement;
    root.dataset.theme = themeName;
    root.style.colorScheme = themeName;

    if (withTransition) {
      root.classList.add("theme-transition");
      if (transitionTimer) clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => {
        root.classList.remove("theme-transition");
        transitionTimer = null;
      }, 400);
    }
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  function setTheme(themeName: ThemeName) {
    applyTheme(themeName, true);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }

  function toggleTheme() {
    setTheme(currentTheme.value === "light" ? "dark" : "light");
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(isThemeName(saved) ? saved : DEFAULT_THEME, false);
  }

  if (process.client) {
    initTheme();
  }

  return {
    currentTheme,
    toggleTheme,
    initTheme,
    setTheme,
  };
});
