<template>
  <div class="client-tab-space client-settings">
    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">{{ resolveText("admin.clients.settings.supportMode.title", "Support mode") }}</h3>
              <p class="client-card-subtitle">
                {{ resolveText("admin.clients.settings.supportMode.description", "Choose how the client can contact support.") }}
              </p>
            </div>
            <span
              class="client-inline-status"
              :class="fullSupportEnabled ? 'client-inline-status--success' : 'client-inline-status--warning'">
              {{
                fullSupportEnabled
                  ? resolveText("admin.clients.settings.supportMode.full", "Full chat support")
                  : resolveText("admin.clients.settings.supportMode.simple", "Simple form")
              }}
            </span>
          </div>

          <div class="client-settings__switch-row">
            <span class="client-settings__mode-label">
              {{ resolveText("admin.clients.settings.supportMode.simple", "Simple form") }}
            </span>
            <PrimeToggleSwitch
              :model-value="fullSupportEnabled"
              :disabled="!canUpdateSupportMode || supportModeUpdating"
              @update:model-value="handleSupportModeToggle" />
            <span class="client-settings__mode-label">
              {{ resolveText("admin.clients.settings.supportMode.full", "Full chat support") }}
            </span>
            <i
              v-if="supportModeUpdating"
              class="pi pi-spin pi-spinner client-settings__spinner"
              aria-hidden="true" />
          </div>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  interface UserData {
    support_mode?: string | null;
  }

  const props = defineProps<{
    clientId: string;
    userData: UserData;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const supportModeUpdating = ref(false);
  const canUpdateSupportMode = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-client-support-mode")
  );

  const fullSupportEnabled = computed(() => String(props.userData?.support_mode ?? "simple") === "full");

  const handleSupportModeToggle = async (enabled: boolean) => {
    if (supportModeUpdating.value || !canUpdateSupportMode.value) return;

    const nextMode = enabled ? "full" : "simple";
    const currentMode = String(props.userData?.support_mode ?? "simple");
    if (nextMode === currentMode) return;

    supportModeUpdating.value = true;
    const previousMode = currentMode;
    props.userData.support_mode = nextMode;

    try {
      await appCore.adminModules.clients.patchSupportMode(props.clientId, {
        support_mode: nextMode,
      });
      toast.success(resolveText("admin.clients.supportMode.updated", "Support mode updated."));
    } catch (error) {
      props.userData.support_mode = previousMode;
      toast.error(resolveText("admin.clients.supportMode.updateFailed", "Failed to update support mode."));
      console.error("Failed to update support mode", error);
    } finally {
      supportModeUpdating.value = false;
    }
  };
</script>

<style lang="scss" scoped>
  .client-settings {
    &__switch-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      border-radius: 16px;
      padding: 14px;
      background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
    }

    &__mode-label {
      color: var(--ui-text-main);
      font-size: 0.9375rem;
    }

    &__spinner {
      width: 16px;
      height: 16px;
      color: var(--ui-text-main);
    }
  }

  @media (max-width: 640px) {
    .client-settings {
      &__switch-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  }
</style>
