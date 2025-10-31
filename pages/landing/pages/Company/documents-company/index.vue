<template>
  <UiContainer>
    <div class="documents">
      <UiTextH3 class="documents_title">{{ t('landing.pages.company.documents.title') }}</UiTextH3>

      <div class="documents_img"></div>

      <UiTextH5 class="documents_subtitle">
        {{ t('landing.pages.company.documents.intro') }}
      </UiTextH5>

      <UiTextH3 class="documents_subtitle">{{ t('landing.pages.company.documents.regulations_title') }}</UiTextH3>
      <UiTextH5 class="documents_subtitle">{{ t('landing.pages.company.documents.regulations_subtitle') }}</UiTextH5>

      <ul class="documents_list">
        <li
          v-for="(item, index) in regulationsList"
          :key="index">
          <UiIconSuccess />
          <span>{{ item }}</span>
        </li>
      </ul>

      <div class="documents_actions">
        <UiButtonDefault>{{ t('landing.pages.company.documents.button') }}</UiButtonDefault>
      </div>

      <UiTextH3 class="documents_subtitle">{{ t('landing.pages.company.documents.contract_title') }}</UiTextH3>
      <UiTextH5 class="documents_subtitle">
        {{ t('landing.pages.company.documents.contract_description') }}
      </UiTextH5>

      <div class="documents_actions">
        <UiButtonDefault @click="handleClickContract">{{
          t('landing.pages.company.documents.button')
        }}</UiButtonDefault>
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
  import UiIconSuccess from '~/components/ui/UiIconSuccess.vue';

  definePageMeta({
    layout: 'main',
    alias: '/documents',
  });

  const { t, tm } = useI18n();

  const regulationsList = computed(() => {
    const list = tm('landing.pages.company.documents.regulations_list') as any[];
    return Array.isArray(list)
      ? list.map((_, index) => t(`landing.pages.company.documents.regulations_list[${index}]`))
      : [];
  });

  const handleClickContract = () => {
    const url = 'https://esterholdings.com/wp-content/uploads/ESTER-HOLDINGS-INC_PUBLIC_OFFER_2024_EN.pdf';
    window.open(url, '_blank', 'noopener,noreferrer');
  };
</script>

<style lang="scss" scoped>
  .documents {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
    }

    &_subtitle {
      color: var(--ui-text-main);
    }

    &_img {
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/documentsBg.jpeg') center / cover no-repeat;
      min-height: 200px;
      border-radius: 15px;
    }

    &_list {
      padding-left: 10px;
      color: var(--ui-text-main);
      list-style: none;

      li {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
      }
    }
  }
</style>
