import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const currentTheme = ref<"light" | "dark">("light");
  const lightTheme = {
    "--ui-background": "#ffffff",
    "--ui-primary-main": "#ffffff",
    "--ui-text-main": "#151515",
    "--ui-primary-accent": "#f75709",
    "--ui-sticker-success": "#03c11f",
    "--ui-sticker-danger": "#d93025",
    "--ui-background-card": "#F9F9F9",
    "--color-stroke-ui-dark": "#011644",
    "--color-stroke-ui": "#b8b8c3",
    // '--color-ui-grey': '#3c3c3c'
    "--ui-text-secondary": "#3C3C3C",
    "--ui-background-secondary": "#0051FF",
  };

  const darkTheme = {
    "--ui-background": "#000028",
    "--ui-primary-main": "#0051ff",
    "--ui-text-main": "#ffffff",
    "--ui-primary-accent": "#f75709",
    "--ui-sticker-success": "#03c11f",
    "--ui-sticker-danger": "#d93025",
    "--ui-background-card": "#01014E",
    "--ui-background-secondary": "#031743",
    "--color-stroke-ui-dark": "#011644",
    "--color-stroke-ui":
      "linear-gradient(137.67deg, #1b63ff 2.397%, #011644 99.041%)",
    "--color-ui-grey": "#b8b8c3",
    "--ui-text-secondary": "#b8b8c3",
  };

  function applyTheme(theme: Record<string, string>) {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light";
    const theme = currentTheme.value === "light" ? lightTheme : darkTheme;
    applyTheme(theme);
    localStorage.setItem("theme", currentTheme.value);
  }

  function initTheme() {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    currentTheme.value = saved || "light";
    const theme = currentTheme.value === "light" ? lightTheme : darkTheme;
    applyTheme(theme);
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
