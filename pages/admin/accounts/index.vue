<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.accounts.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.accounts.index.subtitle") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <AccountsPanel />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { definePageMeta } from "~/.nuxt/imports";

import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });
</script>

