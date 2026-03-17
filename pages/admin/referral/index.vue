<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ resolveText("admin.menu.referral", "Referral system") }}</UiTextH4>
        <UiTextParagraph>{{ resolveText("admin.common.comingSoon", "Section is under development.") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <div class="rounded-[20px] border border-[var(--ui-primary-main)] bg-[var(--ui-background-panel)] p-6 text-[var(--ui-text-secondary)]">
        {{ resolveText("admin.common.comingSoon", "Section is under development.") }}
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";

import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};
</script>
