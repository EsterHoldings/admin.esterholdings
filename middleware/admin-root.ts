import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const localeMatch = to.path.match(/^\/([a-z]{2})(\/|$)/i);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  const dashboardPath = `${localePrefix}/dashboard`;
  const loginPath = `${localePrefix}/auth/login`;

  const adminAuthStore = useAdminAuthStore();
  if (adminAuthStore.isAuthenticated) {
    return navigateTo(dashboardPath);
  }
  return navigateTo(loginPath);
});
