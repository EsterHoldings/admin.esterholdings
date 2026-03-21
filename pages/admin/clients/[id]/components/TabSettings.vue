<template>
  <div class="client-settings">
    <PanelDefault class="client-settings__panel">
      <div class="client-settings__panel-header">
        <UiTextH5>{{ resolveText("admin.clients.settings.supportMode.title", "Support mode") }}</UiTextH5>
        <UiTextSmall class="client-settings__muted">
          {{ resolveText("admin.clients.settings.supportMode.description", "Choose how the client can contact support.") }}
        </UiTextSmall>
      </div>

      <div class="client-settings__switch-row">
        <UiTextSmall class="client-settings__mode-label">
          {{ resolveText("admin.clients.settings.supportMode.simple", "Simple form") }}
        </UiTextSmall>
        <UiSwitchToggle
          :modelValue="fullSupportEnabled"
          :disabled="!canUpdateSupportMode"
          @change="handleSupportModeToggle" />
        <UiTextSmall class="client-settings__mode-label">
          {{ resolveText("admin.clients.settings.supportMode.full", "Full chat support") }}
        </UiTextSmall>
        <UiIconSpinnerDefault
          v-if="supportModeUpdating"
          class="client-settings__spinner" />
      </div>
    </PanelDefault>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import useAppCore from "~/composables/useAppCore";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
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
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    &__panel {
      padding: 20px;
    }

    &__panel-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    &__muted {
      color: var(--ui-text-secondary);
      line-height: 1.5;
    }

    &__switch-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
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
      &__panel {
        padding: 16px;
      }

      &__switch-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  }
</style>
