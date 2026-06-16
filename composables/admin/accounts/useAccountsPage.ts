import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";

import AccountsPanelAddNew from "~/pages/admin/accounts/components/AccountsPanelAddNew.vue";
import { useAccountsPanelState } from "~/composables/admin/accounts/useAccountsPanel";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

export function useAccountsPage() {
  const { t } = useI18n({ useScope: "global" });
  const adminAuthStore = useAdminAuthStore();
  const { openModal } = inject("modalControl") as {
    openModal: (component: unknown, props?: Record<string, unknown>) => void;
  };
  const { accountsPanelProps } = useAccountsPanelState();

  const resolveText = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : String(value);
  };

  const canCreateAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-accounts")
  );

  const accountsHeaderProps = computed(() => ({
    title: resolveText("admin.accounts.index.title", "Accounts"),
    subtitle: resolveText("admin.accounts.index.subtitle", "List of accounts"),
    createLabel: resolveText("admin.accounts.actions.create", "New account"),
    canCreateAccounts: canCreateAccounts.value,
  }));

  const handleOpenCreateModal = (): void => {
    if (!canCreateAccounts.value) return;

    openModal(AccountsPanelAddNew, {
      title: resolveText("admin.accounts.form.titles.create", "Create account"),
    });
  };

  return {
    accountsHeaderProps,
    accountsPanelProps,
    handleOpenCreateModal,
  };
}
