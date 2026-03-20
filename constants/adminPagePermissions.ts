export type AdminPagePermissionRule = {
  pattern: RegExp;
  permissions: string[];
  fallbackPath: string;
};

export const ADMIN_PAGE_PERMISSION_RULES: AdminPagePermissionRule[] = [
  { pattern: /^\/dashboard(?:\/|$)/, permissions: ["view-dashboard"], fallbackPath: "/dashboard" },
  { pattern: /^\/profile(?:\/|$)/, permissions: ["view-profile"], fallbackPath: "/profile" },
  { pattern: /^\/verifications(?:\/|$)/, permissions: ["view-verifications"], fallbackPath: "/verifications" },
  { pattern: /^\/clients(?:\/|$)/, permissions: ["view-clients"], fallbackPath: "/clients" },
  { pattern: /^\/accounts(?:\/|$)/, permissions: ["view-accounts"], fallbackPath: "/accounts" },
  { pattern: /^\/withdrawal-requests(?:\/|$)/, permissions: ["view-payments"], fallbackPath: "/withdrawal-requests" },
  { pattern: /^\/payments(?:\/|$)/, permissions: ["view-payments"], fallbackPath: "/payments" },
  { pattern: /^\/referral(?:\/|$)/, permissions: ["view-referrals"], fallbackPath: "/referral" },
  { pattern: /^\/settings(?:\/|$)/, permissions: ["view-settings"], fallbackPath: "/settings" },
  { pattern: /^\/support(?:\/|$)/, permissions: ["view-support"], fallbackPath: "/support" },
  { pattern: /^\/news(?:\/|$)/, permissions: ["view-news"], fallbackPath: "/news" },
  { pattern: /^\/access(?:\/|$)/, permissions: ["view-access"], fallbackPath: "/access" },
  { pattern: /^\/rolesAndPermissions(?:\/|$)/, permissions: ["view-access"], fallbackPath: "/access" },
];

type PermissionAccessResolver = {
  hasPermission: (permission: string) => boolean;
  hasRole?: (role: string) => boolean;
};

export const removeLocalePrefix = (path: string): string => {
  const localePrefixMatch = path.match(/^\/[a-z]{2}(?=\/|$)/i);
  if (!localePrefixMatch) return path;

  const stripped = path.slice(localePrefixMatch[0].length);
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

export const getAdminPagePermissionRule = (path: string): AdminPagePermissionRule | undefined => {
  const normalizedPath = removeLocalePrefix(path || "/");
  return ADMIN_PAGE_PERMISSION_RULES.find(rule => rule.pattern.test(normalizedPath));
};

export const canAccessAdminPath = (path: string, resolver: PermissionAccessResolver): boolean => {
  if (resolver.hasRole?.("super-admin")) {
    return true;
  }

  const rule = getAdminPagePermissionRule(path);
  if (!rule) {
    return true;
  }

  return rule.permissions.some(permission => resolver.hasPermission(permission));
};

export const resolveFirstAllowedAdminRoute = (
  resolver: PermissionAccessResolver,
  localePrefix = ""
): string | null => {
  if (resolver.hasRole?.("super-admin")) {
    return `${localePrefix}/dashboard`;
  }

  const firstAllowed = ADMIN_PAGE_PERMISSION_RULES.find(rule =>
    rule.permissions.some(permission => resolver.hasPermission(permission))
  );

  if (!firstAllowed) {
    return null;
  }

  return `${localePrefix}${firstAllowed.fallbackPath}`;
};
