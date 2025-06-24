import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import useAppCore from "~/composables/useAppCore";

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

  // 1. Спроба зчитати токени з localStorage
  if (process.client) {
    const storedAccessToken = localStorage.getItem('access_token');

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
    }
  }

  // 2. Обчислюване значення (чи залогінений)
  const isAuthenticated = computed(() => !!accessToken.value);

  // 3. Якщо змінюються токени, записуємо їх у localStorage
  watch(accessToken, (newValue) => {
    if (process.client) {
      localStorage.setItem('access_token', newValue);
    }
  });

  // --- Методи для керування токенами та даними користувача ---
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
      const response = await appCore.adminAuth.getAvailablePermissions();
      setRoles(response.data.data.roles || []);
      setPermissions(response.data.data.permissions || []);
    } catch (error) {
      console.error('Failed to initAuth:', error);
    }
  }

  // ✅ Реактивні computed-функції для перевірки ролей та дозволів
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
    roles,
    permissions,
    isAuthenticated,
    setAccessToken,
    setRoles,
    setPermissions,
    initAuth,
    hasRole,
    hasRoleById,
    hasPermission,
    hasPermissionById,
  };
});