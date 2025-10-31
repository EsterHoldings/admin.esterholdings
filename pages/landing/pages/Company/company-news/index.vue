<template>
  <UiContainer>
    <div class="company-news">
      <UiTextH3 class="company-news_title">{{ t('landing.pages.company.news.title') }}</UiTextH3>
      <div class="company-news_img"></div>

      <div class="company-news_wrapper">
        <NewsCard
          v-for="(card, index) in newsItems"
          :key="index"
          :image="card.src"
          :title="card.title"
          :message="card.subTitle"
          :date="card.time"
          :button-text="card.buttonText"
          link="/news/trading-sessions-april-2023" />
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import NewsCard from './components/NewsCard.vue';

  definePageMeta({
    layout: 'main',
    alias: '/company-news',
  });

  const { t, tm } = useI18n();

  const newsItems = computed(() => {
    const items = tm('landing.pages.company.news.items') as any[];
    const buttonText = t('landing.pages.company.news.button');
    return Array.isArray(items)
      ? items.map((_, index) => ({
          src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGiL_OXNaefDrdif97UBefC4OW4azk1cyOLQ&s',
          title: t(`landing.pages.company.news.items[${index}].title`),
          subTitle: t(`landing.pages.company.news.items[${index}].subtitle`),
          time: t(`landing.pages.company.news.items[${index}].time`),
          buttonText,
        }))
      : [];
  });
</script>

<style lang="scss" scoped>
  .company-news {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 40px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }

    &_img {
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/newsBg.jpg') center / cover no-repeat;
      min-height: 500px;
      border-radius: 15px;
    }

    &_wrapper {
      margin-top: 50px;
      display: flex;
      flex-direction: column;
      align-items: baseline;
      gap: 30px;
    }
  }
</style>
