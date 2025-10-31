<template>
  <UiContainer>
    <div class="traders-blog">
      <UiTextH3 class="traders-blog__title">{{ t('landing.pages.trading.traders_blog_title') }}</UiTextH3>
      <div class="traders-blog__wrapper">
        <BlogCard
          v-for="(card, index) in blogItems"
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

  import BlogCard from './components/BlogCard.vue';

  definePageMeta({
    layout: 'main',
    alias: "/trader's-blog",
  });

  const { t, tm } = useI18n();

  const blogItems = computed(() => {
    const items = tm('landing.pages.trading.traders_blog_items') as any[];
    const buttonText = t('landing.pages.company.news.button');
    return Array.isArray(items)
      ? items.map((_, index) => ({
          src: '/static/newsBg.jpg',
          title: t(`landing.pages.trading.traders_blog_items[${index}].title`),
          subTitle: t(`landing.pages.trading.traders_blog_items[${index}].subtitle`),
          time: t(`landing.pages.trading.traders_blog_items[${index}].time`),
          link: '/blog/post',
          buttonText,
        }))
      : [];
  });
</script>

<style lang="scss" scoped>
  .traders-blog {
    display: flex;
    flex-direction: column;

    &__title {
      color: var(--ui-text-main);
      text-align: center;
    }

    &__wrapper {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: baseline;
      gap: 30px;
    }
  }
</style>
