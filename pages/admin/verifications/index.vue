<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.verifications.index.title") }}</UiTextH4>
        <UiTextParagraph>
          Review client verification requests, moderate each section separately and route directly to the client profile.
        </UiTextParagraph>
      </div>
    </template>

    <template #content>
      <PageStructureContent>
        <template #content>
          <VerificationsPanel ref="panelRef" @loading="isLoading = $event" />
        </template>
      </PageStructureContent>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import VerificationsPanel from "~/pages/admin/verifications/components/VerificationsPanel.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });

const panelRef = ref<InstanceType<typeof VerificationsPanel> | null>(null);

defineExpose({
  reload: async () => {
    await panelRef.value?.reload();
  },
});
</script>
