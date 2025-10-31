<template>
  <div class="for-investor">
    <UiContainer>
      <UiTextH3 class="for-investor_title">{{ t('landing.pages.trading.for_investor_title') }}</UiTextH3>
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
    alias: '/for-investor',
  });

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .for-investor {
    padding: 40px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }
  }
</style>
