<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH1>Clients</UiTextH1>
      <UiTextParagraph>( List of clients )</UiTextParagraph>
    </div>
    <div class="clients-page__content">
      <ClientsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

import ClientsPanel from "~/pages/clients/components/ClientsPanel.vue";
</script>

<style lang="scss" scoped>
.clients-page {
  height: 100vh;
  width: 100%;
  padding: 20px;

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    height: calc(100vh - 120px);
  }
}
</style>
