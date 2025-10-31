<template>
  <UiContainer>
    <div class="career">
      <UiTextH3 class="career_title">{{ t('landing.pages.company.career.title') }}</UiTextH3>

      <div class="career_img"></div>

      <UiTextH5 class="career_subtitle">{{ t('landing.pages.company.career.subtitle') }}</UiTextH5>

      <ul class="career_list">
        <li
          v-for="(position, index) in positions"
          :key="index">
          {{ position }}
        </li>
      </ul>

      <UiTextH5>{{ t('landing.pages.company.career.cta') }}</UiTextH5>

      <div>
        <UiButtonDefault>{{ t('landing.pages.company.career.button') }}</UiButtonDefault>
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
  import UiTextH5 from '~/components/ui/UiTextH5.vue';
  import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';

  definePageMeta({
    layout: 'main',
    alias: '/career',
  });

  const { t, tm } = useI18n();

  const positions = computed(() => {
    const list = tm('landing.pages.company.career.positions') as any[];
    return Array.isArray(list) ? list.map((_, index) => t(`landing.pages.company.career.positions[${index}]`)) : [];
  });
</script>

<style lang="scss" scoped>
  .career {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }

    &_subtitle {
      color: var(--ui-text-main);
    }

    &_img {
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/careerBg.jpg') center / cover no-repeat;
      min-height: 500px;
      border-radius: 15px;
    }

    &_list {
      color: var(--ui-text-main);
      padding-left: 10px;
      li {
        margin-bottom: 15px;
        font-weight: 700;
      }
    }

    h5 {
      color: var(--ui-text-main);
    }
  }
</style>
