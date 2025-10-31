<template>
  <UiContainer>
    <div class="economic-calendar">
      <UiTextH3 class="economic-calendar__title">{{ t('landing.pages.trading.economic_calendar_title') }}</UiTextH3>
      <iframe
        src="https://www.tradays.com/en/economic-calendar/widget?mode=2&utm_source=esterholdings.com"
        frameborder="0"
        width="100%"
        height="1000"
        scrolling="no"
        allowtransparency="true"
        class="economic-calendar__iframe"></iframe>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';

  definePageMeta({
    layout: 'main',
    alias: '/economic-calendar',
  });

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .economic-calendar {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &__title {
      color: var(--ui-text-main);
      text-align: center;
    }

    &__iframe {
      border: none;
      border-radius: 10px;
      width: 100%;
      height: calc(100vh - 180px);
    }
  }
</style>
