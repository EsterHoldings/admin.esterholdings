<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH4>{{ t("admin.clients.index.title") }}</UiTextH4>
      <UiTextParagraph>{{ t("admin.clients.index.subtitle") }}</UiTextParagraph>
    </div>
    <div class="clients-page__content">
      <ClientsPanel/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";

import ClientsPanel from "~/pages/admin/clients/components/ClientsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
</script>

<style lang="scss" scoped>
.clients {
  &-page {
    height: calc(100vh - 40px);
    width: 100%;
    padding: 20px;

    &__title {
      margin-bottom: 20px;
      color: var(--ui-text-main);
    }

    &__content {
      padding-bottom: 20px;
    }
  }
}
</style>
