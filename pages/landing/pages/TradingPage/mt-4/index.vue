<template>
  <UiContainer>
    <div class="mt4">
      <UiTextH3 class="mt4_title">{{ t('landing.pages.trading.mt4_title') }}</UiTextH3>

      <PanelDefault class="p-4 mt-5">
        <UiTextH4 class="mt4_subtitle">{{ t('landing.pages.trading.mt4_subtitle') }}</UiTextH4>
        <div class="mt-5">
          <UiButtonDefault state="warning">{{ t('landing.pages.trading.mt4_button') }}</UiButtonDefault>
        </div>
      </PanelDefault>

      <PanelDefault class="p-4 mt-5">
        <UiTextH4 class="mt4_title-platform">{{ t('landing.pages.trading.mt4_about_title') }}</UiTextH4>

        <UiTextParagraph class="mt4_text mb-5">
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

        <UiHorizontalLine />

        <div class="mt4_footer mt-5">
          <UiTextH4 class="mt4_text">{{ t('landing.pages.trading.mt4_requirements_title') }}</UiTextH4>
          <UiTextParagraph class="mt4_text">{{ t('landing.pages.trading.mt4_requirements_text') }}</UiTextParagraph>
          <a href="#">{{ t('landing.pages.trading.mt4_requirements_link') }}</a>
        </div>
      </PanelDefault>
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
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiHorizontalLine from "~/components/ui/UiHorizontalLine.vue";

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
