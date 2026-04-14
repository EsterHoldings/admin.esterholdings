import { defineNuxtPlugin } from "nuxt/app";

type ThemeName = "light" | "dark";

const DEFAULT_THEME: ThemeName = "light";
const THEME_STORAGE_KEY = "theme";

const isThemeName = (value: string | null): value is ThemeName => value === "light" || value === "dark";

export default defineNuxtPlugin(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = isThemeName(savedTheme) ? savedTheme : DEFAULT_THEME;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
});
