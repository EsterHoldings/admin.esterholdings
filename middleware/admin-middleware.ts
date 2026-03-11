import { useAdminAuthStore } from "../stores/adminAuthStore";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { ADMIN_ACCESS_TOKEN } from "~/constants/auth";

type PermissionRule = {
  pattern: RegExp;
  permissions: string[];
  fallbackPath: string;
};

const PAGE_PERMISSION_RULES: PermissionRule[] = [
  { pattern: /^\/dashboard(?:\/|$)/, permissions: ["view-dashboard"], fallbackPath: "/dashboard" },
  { pattern: /^\/verifications(?:\/|$)/, permissions: ["view-verifications"], fallbackPath: "/verifications" },
  { pattern: /^\/clients(?:\/|$)/, permissions: ["view-clients"], fallbackPath: "/clients" },
  { pattern: /^\/accounts(?:\/|$)/, permissions: ["view-accounts"], fallbackPath: "/accounts" },
  { pattern: /^\/payments(?:\/|$)/, permissions: ["view-payments"], fallbackPath: "/payments" },
  { pattern: /^\/referral(?:\/|$)/, permissions: ["view-referrals"], fallbackPath: "/referral" },
  { pattern: /^\/settings(?:\/|$)/, permissions: ["view-settings"], fallbackPath: "/settings" },
  { pattern: /^\/support(?:\/|$)/, permissions: ["view-support"], fallbackPath: "/support" },
  { pattern: /^\/news(?:\/|$)/, permissions: ["view-news"], fallbackPath: "/news" },
  {
    pattern: /^\/access(?:\/|$)/,
    permissions: ["view-admins", "view-roles", "view-permissions"],
    fallbackPath: "/access",
  },
  {
    pattern: /^\/rolesAndPermissions(?:\/|$)/,
    permissions: ["view-admins", "view-roles", "view-permissions"],
    fallbackPath: "/access",
  },
];

const removeLocalePrefix = (path: string): string => {
  const localePrefixMatch = path.match(/^\/[a-z]{2}(?=\/|$)/i);
  if (!localePrefixMatch) return path;

  const stripped = path.slice(localePrefixMatch[0].length);
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

const resolveFirstAllowedRoute = (adminAuthStore: ReturnType<typeof useAdminAuthStore>, localePrefix: string): string | null => {
  const firstAllowed = PAGE_PERMISSION_RULES.find(rule =>
    rule.permissions.some(permission => adminAuthStore.hasPermission(permission))
  );

  if (!firstAllowed) return null;
  return `${localePrefix}${firstAllowed.fallbackPath}`;
};

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

  if (adminAuthStore.permissions.length === 0) {
    await adminAuthStore.initAuth();
  }

  const normalizedPath = removeLocalePrefix(to.path || "/");
  const matchedRule = PAGE_PERMISSION_RULES.find(rule => rule.pattern.test(normalizedPath));
  if (!matchedRule) return;

  const canAccess = matchedRule.permissions.some(permission => adminAuthStore.hasPermission(permission));
  if (canAccess) return;

  const fallbackRoute = resolveFirstAllowedRoute(adminAuthStore, localePrefix);
  if (fallbackRoute) {
    return navigateTo(fallbackRoute);
  }

  await adminAuthStore.authLogout();
  return navigateTo(`${localePrefix}/auth/login`);
});
