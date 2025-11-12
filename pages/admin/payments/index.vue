<template>
  <div class="payments-page">
    <div class="payments-page__title">
      <UiTextH4>Payments</UiTextH4>
      <UiTextParagraph>list</UiTextParagraph>
    </div>
    <div class="payments-page__content">
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
.payments {
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
