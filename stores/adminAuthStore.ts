import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import useAppCore from "~/composables/useAppCore";
import {navigateTo} from "nuxt/app";
import {ROUTE_ADMIN_AUTH_LOGIN, ROUTE_AUTH_LOGIN} from "~/constants/routes";
import {ADMIN_ACCESS_TOKEN} from "~/constants/auth";

interface Role {
  id: string;
  name: string;
}

interface Permission {
  id: string;
  name: string;
}

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const accessToken = ref('');
  const roles = ref<Role[]>([]);
  const permissions = ref<Permission[]>([]);

  const user = ref<any>(null);
  const photoUrl = ref<string>("");

  if (process.client) {
    const storedAccessToken = localStorage.getItem('access_token');

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
    }
  }

  const isAuthenticated = computed(() => !!accessToken.value);

  watch(accessToken, (newValue) => {
    if (process.client) {
      localStorage.setItem('access_token', newValue);
    }
  });

  function setAccessToken(value: string) {
    accessToken.value = value;
  }

  function setRoles(r: Role[]) {
    roles.value = r;
  }

  function setPermissions(p: Permission[]) {
    permissions.value = p;
  }

  async function initAuth() {
    if (!process.client) return;
    if (!accessToken.value) return;

    const appCore = useAppCore();

    try {
      const response = await appCore.adminModules.auth.getAvailablePermissions();
      setRoles(response.data.data.roles || []);
      setPermissions(response.data.data.permissions || []);
    } catch (error) {
      console.error('Failed to initAuth:', error);
    }
  }

  async function authLogout(): Promise<void> {
    setAccessToken("");
    user.value = null;
    photoUrl.value = "";
    if (process.client) {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN);
    }
    navigateTo('/ru' + ROUTE_ADMIN_AUTH_LOGIN);
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
    initAuth,
    isAuthenticated,
    permissions,
    roles,
    setAccessToken,
    setPermissions,
    setRoles,
  };
});