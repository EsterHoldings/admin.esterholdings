import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref<"light" | "dark">("dark");
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
    "--ui-background-sidebar-link": "#011644;",

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

  function applyTheme(theme: Record<string, string>, withTransition = true) {
    const root = document.documentElement;
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

  function toggleTheme() {
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
    const theme = currentTheme.value === "light" ? lightTheme : darkTheme;
    applyTheme(theme, true);
    localStorage.setItem("theme", currentTheme.value);
  }

  function initTheme() {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    currentTheme.value = saved || currentTheme.value;
    const theme = currentTheme.value === "light" ? lightTheme : darkTheme;
    applyTheme(theme, false);
  }

  if (process.client) {
    initTheme();
  }

  return {
    currentTheme,
    toggleTheme,
    initTheme,
  };
});
