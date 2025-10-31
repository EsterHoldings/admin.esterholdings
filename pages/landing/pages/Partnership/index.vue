<template>
  <UiContainer>
    <div class="partnership-page">
      <UiTextH3 class="partnership-page__title">{{ t('landing.pages.partnership.title') }}</UiTextH3>

      <div class="partnership-page__img"></div>

      <UiTextH4 class="partnership-page__subtitle">{{ t('landing.pages.partnership.subtitle') }}</UiTextH4>

      <div class="partnership-page__buttons">
        <UiButtonDefault state="primary">{{ t('landing.pages.partnership.button_agent') }}</UiButtonDefault>
        <UiButtonDefault state="warning">{{ t('landing.pages.partnership.button_franchising') }}</UiButtonDefault>
      </div>

      <UiTextParagraph class="partnership-page__intro">
        <strong>{{ t('landing.pages.partnership.intro_1.highlight') }}</strong>
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        <strong>{{ t('landing.pages.partnership.intro_2.highlight') }}</strong>
        {{ t('landing.pages.partnership.intro_2.text') }}
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        {{ t('landing.pages.partnership.intro_3') }}
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__section-title">{{ t('landing.pages.partnership.offer_title') }}</UiTextH4>
      <ul class="partnership-page__list">
        <li
          v-for="(item, index) in offerList"
          :key="index">
          {{ item }}
        </li>
      </ul>

      <UiTextH4 class="partnership-page__section-title">{{ t('landing.pages.partnership.agent_title') }}</UiTextH4>
      <UiTextParagraph class="partnership-page__intro">
        {{ t('landing.pages.partnership.agent_description') }}
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__subtitle">{{ t('landing.pages.partnership.agent_how_title') }}</UiTextH4>
      <ol class="partnership-page__list">
        <li
          v-for="(item, index) in agentHowList"
          :key="index">
          {{ item }}
        </li>
      </ol>
      <strong>{{ t('landing.pages.partnership.agent_how_cta') }}</strong>

      <UiTextH4 class="partnership-page__section-title">{{
        t('landing.pages.partnership.franchising_title')
      }}</UiTextH4>
      <UiTextParagraph class="partnership-page__intro">
        {{ t('landing.pages.partnership.franchising_description_1') }}
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        {{ t('landing.pages.partnership.franchising_description_2') }}
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__subtitle">{{
        t('landing.pages.partnership.franchising_business_title')
      }}</UiTextH4>
      <ul class="partnership-page__list">
        <li
          v-for="(item, index) in franchisingBusinessList"
          :key="index">
          {{ item }}
        </li>
      </ul>

      <UiTextH4 class="partnership-page__subtitle">{{ t('landing.pages.partnership.franchising_how_title') }}</UiTextH4>
      <ol class="partnership-page__list">
        <li
          v-for="(item, index) in franchisingHowList"
          :key="index">
          {{ item }}
        </li>
      </ol>

      <div class="partnership-page__buttons">
        <UiButtonDefault state="warning">{{ t('landing.pages.partnership.button_receive') }}</UiButtonDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import { computed } from 'vue';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiTextH4 from '~/components/ui/UiTextH4.vue';
  import UiTextParagraph from '~/components/ui/UiTextParagraph.vue';
  import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';

  definePageMeta({
    layout: 'main',
    alias: '/partnership',
  });

  const { t, tm } = useI18n();

  const offerList = computed(() => {
    const list = tm('landing.pages.partnership.offer_list') as any[];
    return Array.isArray(list) ? list.map((_, index) => t(`landing.pages.partnership.offer_list[${index}]`)) : [];
  });

  const agentHowList = computed(() => {
    const list = tm('landing.pages.partnership.agent_how_list') as any[];
    return Array.isArray(list) ? list.map((_, index) => t(`landing.pages.partnership.agent_how_list[${index}]`)) : [];
  });

  const franchisingBusinessList = computed(() => {
    const list = tm('landing.pages.partnership.franchising_business_list') as any[];
    return Array.isArray(list)
      ? list.map((_, index) => t(`landing.pages.partnership.franchising_business_list[${index}]`))
      : [];
  });

  const franchisingHowList = computed(() => {
    const list = tm('landing.pages.partnership.franchising_how_list') as any[];
    return Array.isArray(list)
      ? list.map((_, index) => t(`landing.pages.partnership.franchising_how_list[${index}]`))
      : [];
  });
</script>

<style lang="scss" scoped>
  .partnership-page {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    &__title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }

    &__intro {
      color: var(--ui-text-main);
    }

    &__img {
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/partnershipBg.jpg') center / cover no-repeat;
      min-height: 500px;
      border-radius: 12px;
    }

    &__buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
    }

    &__subtitle,
    &__section-title {
      font-weight: 700;
      color: var(--ui-text-main);
    }

    &__list {
      padding-left: 20px;
      color: var(--ui-text-main);
      font-size: 14px;

      li {
        margin-bottom: 10px;
        color: inherit;
      }
    }
  }
</style>
