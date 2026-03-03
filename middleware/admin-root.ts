import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default defineNuxtRouteMiddleware((to) => {
  const localeMatch = to.path.match(/^\/([a-z]{2})(\/|$)/i);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  const dashboardPath = `${localePrefix}/dashboard`;
  const loginPath = `${localePrefix}/auth/login`;

  // On server we cannot reliably read localStorage token, so always redirect to login.
  // This avoids rendering the root page and then doing a client-only redirect (FOUC/layout jump).
  if (process.server) {
    return navigateTo(loginPath, { redirectCode: 302, replace: true });
  }

  const adminAuthStore = useAdminAuthStore();
  if (adminAuthStore.isAuthenticated) {
    return navigateTo(dashboardPath, { replace: true });
  }
  return navigateTo(loginPath, { replace: true });
});
