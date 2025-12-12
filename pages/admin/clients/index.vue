<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.clients.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.clients.index.subtitle") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <ClientsPanel />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";

import ClientsPanel from "~/pages/admin/clients/components/ClientsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
</script>
