<template>
  <UiContainer>
    <div class="mt4">
      <UiTextH3 class="mt4_title">{{ t('landing.pages.trading.mt4_title') }}</UiTextH3>
      <div class="mt4_img">
        <UiTextH4 class="mt4_subtitle">{{ t('landing.pages.trading.mt4_subtitle') }}</UiTextH4>
        <div>
          <UiButtonDefault state="warning">{{ t('landing.pages.trading.mt4_button') }}</UiButtonDefault>
        </div>
      </div>

      <UiTextH4 class="mt4_title-platform">{{ t('landing.pages.trading.mt4_about_title') }}</UiTextH4>

      <UiTextParagraph class="mt4_text">
        {{ t('landing.pages.trading.mt4_about_text') }}
        <strong>{{ t('landing.pages.trading.mt4_about_highlight') }}</strong>
      </UiTextParagraph>

      <ul class="mt4_list">
        <li
          v-for="(feature, index) in mt4Features"
          :key="index">
          <UiIconSuccess />
          <span>{{ feature }}</span>
        </li>
      </ul>

      <div class="mt4_footer">
        <UiTextParagraph class="mt4_text">{{ t('landing.pages.trading.mt4_requirements_title') }}</UiTextParagraph>
        <UiTextParagraph class="mt4_text">{{ t('landing.pages.trading.mt4_requirements_text') }}</UiTextParagraph>
        <a href="#">{{ t('landing.pages.trading.mt4_requirements_link') }}</a>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { computed } from 'vue';
  import { definePageMeta } from '~/.nuxt/imports';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiTextH4 from '~/components/ui/UiTextH4.vue';
  import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';
  import UiTextParagraph from '~/components/ui/UiTextParagraph.vue';
  import UiIconSuccess from '~/components/ui/UiIconSuccess.vue';

  definePageMeta({
    layout: 'main',
    alias: '/mt-4',
  });

  const { t, tm } = useI18n();

  const mt4Features = computed(() => {
    const features = tm('landing.pages.trading.mt4_features') as any[];
    return Array.isArray(features) ? features.map((_, index) => t(`landing.pages.trading.mt4_features[${index}]`)) : [];
  });
</script>

<style lang="scss">
  .mt4 {
    min-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    &_img {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 50px;
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/mt4Bg.jpeg') center / cover no-repeat;
      border-radius: 15px;
      min-height: 200px;
      justify-content: end;
    }

    &_title {
      text-align: center;
      color: var(--ui-text-main);

      &-platform {
        color: var(--ui-text-main);
      }
    }

    &_subtitle {
      color: var(--ui-text-main);
    }

    &_text {
      color: var(--ui-text-main);
    }

    &_list {
      color: var(--ui-text-main);
      list-style: none;

      li {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
      }
    }

    &_footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: var(--ui-text-main);
      margin-bottom: 50px;

      a {
        color: var(--ui-text-link);
        text-decoration: underline;
        cursor: pointer;

        &:hover {
          color: var(--ui-text-link-hover);
        }
      }
    }
  }
</style>
