<template>
  <PanelDefault class="border-none bg-transparent shadow-none">
    <div class="flex flex-col gap-4 p-4">
      <UiTextH4 class="text-[var(--ui-text-main)]">
        {{ t("cabinet.referrals.settings.title") }}
      </UiTextH4>

      <UiTextSmall class="text-[var(--ui-text-secondary)]">
        {{ t("cabinet.referrals.settings.description") }}
      </UiTextSmall>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="setting-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[var(--ui-text-main)] font-semibold">
                {{ t("cabinet.referrals.settings.autoWithdraw") }}
              </div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.settings.autoWithdrawHint") }}
              </UiTextSmall>
            </div>
            <UiBadge outline state="warning" class="!px-3">
              {{ t("cabinet.referrals.settings.soon") }}
            </UiBadge>
          </div>
        </div>

        <div class="setting-card">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[var(--ui-text-main)] font-semibold">
                {{ t("cabinet.referrals.settings.notify") }}
              </div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.settings.notifyHint") }}
              </UiTextSmall>
            </div>
            <UiBadge outline state="info" class="!px-3">
              {{ t("cabinet.referrals.settings.enabledDemo") }}
            </UiBadge>
          </div>
        </div>

        <div class="setting-card md:col-span-2">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[var(--ui-text-main)] font-semibold">
                {{ t("cabinet.referrals.settings.payoutThreshold") }}
              </div>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.settings.payoutThresholdHint") }}
              </UiTextSmall>
            </div>
            <UiBadge outline state="warning" class="!px-3">
              {{ t("cabinet.referrals.settings.soon") }}
            </UiBadge>
          </div>
        </div>
      </div>
    </div>
  </PanelDefault>
</template>

<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
</script>

<style scoped>
.setting-card {
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
}
</style>
