<template>
  <UiContainer>
    <div class="company-news">
      <UiTextH3 class="company-news_title">Company News </UiTextH3>
      <div class="company-news_img"></div>

      <div class="company-news_wrapper">
        <NewsCard
          v-for="card in theNews"
          :key="card.src"
          :image="card.src"
          :title="card.title"
          :message="card.subTitle"
          :date="card.time"
          link="/news/trading-sessions-april-2023"
        />
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import NewsCard from "./components/NewsCard.vue";

definePageMeta({
  layout: "main",
  alias: "/company-news",
});

const theNews = ref([
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGiL_OXNaefDrdif97UBefC4OW4azk1cyOLQ&s",
    title: "NVIDIA shares soared 15% after the report",
    subTitle:
      "Chipmaker NVIDIA (NVDA) presented a quarterly report that exceeded all Wall Street expectations...",
    time: "15 min",
  },
  {
    src: "https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*",
    title: "Tesla announced a 1:10 stock split – quotes rose by 12%",
    subTitle:
      "The news sent shares up 12%, with Tesla now trading at $1,180 per share.",
    time: "30 min",
  },
  {
    src: "https://www.brookings.edu/wp-content/uploads/2021/06/shutterstock_1708749826_small.jpg?quality=75&w=1500",
    title: "Bitcoin crashes 12% after SEC announces ban on stablecoins",
    subTitle:
      "The US Securities and Exchange Commission (SEC) made a surprise announcement introducing new...",
    time: "1 hour ago",
  },
]);
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
      url("/static/newsBg.jpg") center / cover no-repeat;
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
