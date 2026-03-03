import { useAdminAuthStore } from "../stores/adminAuthStore";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { ADMIN_ACCESS_TOKEN } from "~/constants/auth";

export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return;

  const adminAuthStore = useAdminAuthStore();
  const localToken = localStorage.getItem(ADMIN_ACCESS_TOKEN) || localStorage.getItem("access_token");
  const localeMatch = to.path.match(/^\/([a-z]{2})(\/|$)/i);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

  if (!adminAuthStore.isAuthenticated && localToken) {
    adminAuthStore.setAccessToken(localToken);
  }

  if (!adminAuthStore.isAuthenticated) {
    return navigateTo(`${localePrefix}/auth/login`);
  }
});
