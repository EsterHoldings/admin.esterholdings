<template>
  <div class="trading-tandem">
    <UiContainer>
      <UiTextH3 class="trading-tandem_title">{{ t('landing.pages.trading.tandem_trading_title') }}</UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';

  definePageMeta({
    layout: 'main',
    alias: '/tandem-trading',
  });

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .trading-tandem {
    padding: 40px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }
  }
</style>
