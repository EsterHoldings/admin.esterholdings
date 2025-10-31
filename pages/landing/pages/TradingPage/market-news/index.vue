<template>
  <UiContainer>
    <div class="market-blog">
      <UiTextH3 class="market-blog__title">{{ t('landing.pages.trading.market_news_title') }}</UiTextH3>
      <div class="market-blog__img"></div>

      <div class="market-blog__wrapper">
        <MarketCard
          v-for="(card, index) in newsItems"
          :key="index"
          :image="card.src"
          :title="card.title"
          :message="card.subTitle"
          :date="card.time"
          :link="card.link"
          :button-text="card.buttonText" />
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

  import MarketCard from './components/MarketCard.vue';

  definePageMeta({
    layout: 'main',
    alias: '/market-news',
  });

  const { t, tm } = useI18n();

  const newsItems = computed(() => {
    const items = tm('landing.pages.trading.market_news_items') as any[];
    const buttonText = t('landing.pages.company.news.button');
    return Array.isArray(items)
      ? items.map((_, index) => ({
          src: '/static/market-newsBg.jpg',
          title: t(`landing.pages.trading.market_news_items[${index}].title`),
          subTitle: t(`landing.pages.trading.market_news_items[${index}].subtitle`),
          time: t(`landing.pages.trading.market_news_items[${index}].time`),
          link: '/blog/news',
          buttonText,
        }))
      : [];
  });
</script>

<style lang="scss" scoped>
  .market-blog {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 40px;

    &__title {
      color: var(--ui-text-main);
      text-align: center;
      margin-top: 50px;
    }

    &__img {
      background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
        url('/static/market-newsBg.jpg') center / cover no-repeat;
      min-height: 500px;
      border-radius: 15px;
    }

    &__wrapper {
      margin-top: 50px;
      display: flex;
      flex-direction: column;
      align-items: baseline;
      gap: 30px;
    }
  }
</style>
