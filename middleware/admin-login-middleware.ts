import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { ADMIN_ACCESS_TOKEN } from "~/constants/auth";

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const adminAuthStore = useAdminAuthStore();
  const localToken = localStorage.getItem(ADMIN_ACCESS_TOKEN) || localStorage.getItem("access_token");

  if (!adminAuthStore.isAuthenticated && localToken) {
    adminAuthStore.setAccessToken(localToken);
  }

  if (!adminAuthStore.isAuthenticated) return;

  const localeMatch = to.path.match(/^\/([a-z]{2})(\/|$)/i);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  return navigateTo(`${localePrefix}/dashboard`);
});
