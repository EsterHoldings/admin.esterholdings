<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ pageTitle }}</UiTextH4>
      </div>
    </template>

    <template #content>
      <PageStructureContent plain>
        <template #content>
          <VerificationsPanel
            ref="panelRef"
            request-scope="payout" />
        </template>
      </PageStructureContent>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";

import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import VerificationsPanel from "~/pages/admin/verifications/components/VerificationsPanel.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t, locale } = useI18n({ useScope: "global" });
const panelRef = ref<InstanceType<typeof VerificationsPanel> | null>(null);
const pageTitle = computed(() => {
  const value = t("admin.verifications.payoutIndex.title");

  if (value !== "admin.verifications.payoutIndex.title") {
    return value;
  }

  if (locale.value === "ru") return "Верификация реквизитов";
  if (locale.value === "uk") return "Верифікація реквізитів";

  return "Payment detail verifications";
});

defineExpose({
  reload: async () => {
    await panelRef.value?.reload();
  },
});
</script>
