import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { resolveFirstAllowedAdminRoute } from "~/constants/adminPagePermissions";

export default defineNuxtRouteMiddleware(async to => {
  const localeMatch = to.path.match(/^\/([a-z]{2})(\/|$)/i);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  const loginPath = `${localePrefix}/auth/login`;

  // On server we cannot reliably read localStorage token, so always redirect to login.
  // This avoids rendering the root page and then doing a client-only redirect (FOUC/layout jump).
  if (process.server) {
    return navigateTo(loginPath, { redirectCode: 302, replace: true });
  }

  const adminAuthStore = useAdminAuthStore();
  if (adminAuthStore.isAuthenticated) {
    if (!adminAuthStore.isAuthInitialized) {
      await adminAuthStore.initAuth();
    }

    const firstAllowedRoute = resolveFirstAllowedAdminRoute(
      {
        hasPermission: permission => adminAuthStore.hasPermission(permission),
        hasRole: role => adminAuthStore.hasRole(role),
      },
      localePrefix
    );

    if (firstAllowedRoute) {
      return navigateTo(firstAllowedRoute, { replace: true });
    }
  }
  return navigateTo(loginPath, { replace: true });
});
