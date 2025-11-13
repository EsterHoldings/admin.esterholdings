<template>
  <div class="generate-income">
    <UiContainer>
      <UiTextH3 class="generate-income_title">{{ t('landing.pages.partnership.generate_income_title') }}</UiTextH3>

      <UiTextH4 class="text-center mt-5 mb-5">Раздел находиться на стадии тестирования и скоро будет доступен!</UiTextH4>
      <PanelDefault class="mt-5">
        <UiTextParagraph class="p-8">Мы отправим сообщение вам на почту - когда данный раздел станет доступным!</UiTextParagraph>
      </PanelDefault>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

  definePageMeta({
    layout: 'main',
    alias: '/generate-income',
  });

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .generate-income {
    padding: 40px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }
  }
</style>
