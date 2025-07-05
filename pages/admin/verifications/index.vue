<template>
  <div class="verifications-page">
    <div class="verifications-page__title">
      <UiTextH4>Запросы на верификацию</UiTextH4>
      <UiTextParagraph>{{ t("admin.clients.index.subtitle") }}</UiTextParagraph>
    </div>
    <div class="verifications-page__content">
      <VerificationsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";

import ClientsPanel from "~/pages/admin/clients/components/ClientsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import VerificationsPanel from "~/pages/admin/verifications/components/VerificationsPanel.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
</script>

<style lang="scss" scoped>
.verifications {
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
