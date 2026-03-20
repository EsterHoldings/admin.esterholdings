import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import useAppCore from "~/composables/useAppCore";
import { navigateTo } from "nuxt/app";
import { ADMIN_ACCESS_TOKEN } from "~/constants/auth";

interface Role {
  id: string;
  name: string;
}

interface Permission {
  id: string;
  name: string;
}

type AdminUser = {
  id: string;
  nickname?: string | null;
  email?: string | null;
  name?: string | null;
  user_id?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
};

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const LEGACY_ADMIN_ACCESS_TOKEN_KEY = "access_token";
  const ADMIN_ROLES_CACHE_KEY = "admin_roles_cache";
  const ADMIN_PERMISSIONS_CACHE_KEY = "admin_permissions_cache";
  const accessToken = ref("");
  const roles = ref<Role[]>([]);
  const permissions = ref<Permission[]>([]);
  const isAuthInitializing = ref(false);
  const isAuthInitialized = ref(false);
  const authInitError = ref("");

  const user = ref<any>(null);
  const photoUrl = ref<string>("");
  let initAuthPromise: Promise<void> | null = null;

  const readCachedCollection = <T>(key: string): T[] => {
    if (!process.client) return [];

    try {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) return [];

      const parsedValue = JSON.parse(rawValue);
      return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
    } catch {
      return [];
    }
  };

  if (process.client) {
    const storedAccessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN);
    const legacyStoredAccessToken = localStorage.getItem(LEGACY_ADMIN_ACCESS_TOKEN_KEY);

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
    } else if (legacyStoredAccessToken) {
      accessToken.value = legacyStoredAccessToken;
      localStorage.setItem(ADMIN_ACCESS_TOKEN, legacyStoredAccessToken);
    }

    roles.value = readCachedCollection<Role>(ADMIN_ROLES_CACHE_KEY);
    permissions.value = readCachedCollection<Permission>(ADMIN_PERMISSIONS_CACHE_KEY);
    isAuthInitialized.value = roles.value.length > 0 || permissions.value.length > 0;
  }

  const isAuthenticated = computed(() => !!accessToken.value);

  watch(accessToken, newValue => {
    if (process.client) {
      if (newValue) {
        localStorage.setItem(ADMIN_ACCESS_TOKEN, newValue);
      } else {
        localStorage.removeItem(ADMIN_ACCESS_TOKEN);
      }

      // Keep backward compatibility with old admin token key.
      localStorage.removeItem(LEGACY_ADMIN_ACCESS_TOKEN_KEY);
    }
  });

  watch(
    roles,
    newValue => {
      if (!process.client) return;

      if (newValue.length > 0) {
        localStorage.setItem(ADMIN_ROLES_CACHE_KEY, JSON.stringify(newValue));
      } else {
        localStorage.removeItem(ADMIN_ROLES_CACHE_KEY);
      }
    },
    { deep: true }
  );

  watch(
    permissions,
    newValue => {
      if (!process.client) return;

      if (newValue.length > 0) {
        localStorage.setItem(ADMIN_PERMISSIONS_CACHE_KEY, JSON.stringify(newValue));
      } else {
        localStorage.removeItem(ADMIN_PERMISSIONS_CACHE_KEY);
      }
    },
    { deep: true }
  );

  function setAccessToken(value: string) {
    accessToken.value = value;
  }

  function setRoles(r: Role[]) {
    roles.value = r;
  }

  function setPermissions(p: Permission[]) {
    permissions.value = p;
  }

  function setUser(value: AdminUser | null) {
    user.value = value;

    const resolvedPhoto = value?.photo_url || value?.avatar_url || value?.avatar || "";
    photoUrl.value = typeof resolvedPhoto === "string" ? resolvedPhoto : "";
  }

  async function initAuth(options: { force?: boolean } = {}) {
    if (!process.client) return;
    if (!accessToken.value) {
      roles.value = [];
      permissions.value = [];
      user.value = null;
      photoUrl.value = "";
      isAuthInitializing.value = false;
      isAuthInitialized.value = false;
      authInitError.value = "";
      return;
    }

    if (isAuthInitializing.value && initAuthPromise) {
      return initAuthPromise;
    }

    if (isAuthInitialized.value && !options.force && user.value) {
      return;
    }

    const appCore = useAppCore();

    isAuthInitializing.value = true;
    authInitError.value = "";

    initAuthPromise = (async () => {
      try {
        const [permissionsResponse, userResponse] = await Promise.all([
          appCore.adminModules.auth.getAvailablePermissions(),
          appCore.adminModules.auth.getAuthUser(),
        ]);

        setRoles(permissionsResponse?.data?.data?.roles || []);
        setPermissions(permissionsResponse?.data?.data?.permissions || []);

        const rawUser = userResponse?.data?.data ?? userResponse?.data ?? null;
        setUser(rawUser && typeof rawUser === "object" ? rawUser : null);
        isAuthInitialized.value = true;
      } catch (error) {
        authInitError.value = error instanceof Error ? error.message : "Failed to initialize admin auth";
        console.error("Failed to initAuth:", error);

        if (roles.value.length > 0 || permissions.value.length > 0) {
          isAuthInitialized.value = true;
        }
      } finally {
        isAuthInitializing.value = false;
        initAuthPromise = null;
      }
    })();

    return initAuthPromise;
  }

  async function authLogout(): Promise<void> {
    setAccessToken("");
    setRoles([]);
    setPermissions([]);
    isAuthInitializing.value = false;
    isAuthInitialized.value = false;
    authInitError.value = "";
    user.value = null;
    photoUrl.value = "";
    if (process.client) {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN);
      localStorage.removeItem(LEGACY_ADMIN_ACCESS_TOKEN_KEY);
      localStorage.removeItem(ADMIN_ROLES_CACHE_KEY);
      localStorage.removeItem(ADMIN_PERMISSIONS_CACHE_KEY);
    }
    navigateTo("/auth/login");
  }

  const hasPermission = computed(() => (permName: string): boolean => {
    return permissions.value.some(p => p.name === permName);
  });

  const hasPermissionById = computed(() => (permId: string): boolean => {
    return permissions.value.some(p => p.id === permId);
  });

  const hasRole = computed(() => (roleName: string): boolean => {
    return roles.value.some(r => r.name === roleName);
  });

  const hasRoleById = computed(() => (roleId: string): boolean => {
    return roles.value.some(r => r.id === roleId);
  });

  return {
    accessToken,
    authLogout,
    hasPermission,
    hasPermissionById,
    hasRole,
    hasRoleById,
    authInitError,
    initAuth,
    isAuthInitialized,
    isAuthInitializing,
    isAuthenticated,
    permissions,
    photoUrl,
    roles,
    setAccessToken,
    setPermissions,
    setRoles,
    setUser,
    user,
  };
});
