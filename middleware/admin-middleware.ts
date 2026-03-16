import { useAdminAuthStore } from "../stores/adminAuthStore";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { ADMIN_ACCESS_TOKEN } from "~/constants/auth";
import {
  canAccessAdminPath,
  getAdminPagePermissionRule,
  resolveFirstAllowedAdminRoute,
} from "~/constants/adminPagePermissions";

export default defineNuxtRouteMiddleware(async to => {
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

  if (!adminAuthStore.isAuthInitialized) {
    await adminAuthStore.initAuth();
  }

  const matchedRule = getAdminPagePermissionRule(to.path || "/");
  if (!matchedRule) return;

  const canAccess = canAccessAdminPath(to.path || "/", {
    hasPermission: permission => adminAuthStore.hasPermission(permission),
    hasRole: role => adminAuthStore.hasRole(role),
  });
  if (canAccess) return;

  const fallbackRoute = resolveFirstAllowedAdminRoute(
    {
      hasPermission: permission => adminAuthStore.hasPermission(permission),
      hasRole: role => adminAuthStore.hasRole(role),
    },
    localePrefix
  );
  if (fallbackRoute) {
    return navigateTo(fallbackRoute);
  }

  if (adminAuthStore.isAuthInitializing) {
    return;
  }

  await adminAuthStore.authLogout();
  return navigateTo(`${localePrefix}/auth/login`);
});
