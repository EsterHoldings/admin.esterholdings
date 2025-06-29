<template>
  <UiContainer>
    <div class="market-blog">
      <UiTextH3 class="market-blog__title">Market News</UiTextH3>
      <div class="market-blog__img"></div>

      <div class="market-blog__wrapper">
        <MarketCard
            v-for="card in blogEntries"
            :key="card.title"
            :image="card.src"
            :title="card.title"
            :message="card.subTitle"
            :date="card.time"
            :link="card.link"
        />
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

import MarketCard from "./components/MarketCard.vue";

definePageMeta({
  layout: "main",
  alias: "/market-news",
});

const blogEntries = ref([
  {
    src: "/static/market-newsBg.jpg",
    title: "How to Effectively Manage Risks in Trading",
    subTitle: "Trading is undeniably an exciting and potentially profitable activity. However, success in this field requires not only the ability to analyze the market and …",
    time: "4.06.2024 | 01:40 PM",
    link: "/blog/manage-risks",
  },
  {
    src: "/static/market-newsBg.jpg",
    title: "Когда переходить с демо на реальный счет?",
    subTitle: "Sorry, this entry is only available in Russian.",
    time: "17.05.2024 | 11:00 AM",
    link: "/blog/switch-to-real",
  },
  {
    src: "/static/market-newsBg.jpg",
    title: "Легендарный инвестор Уоррен Баффетт",
    subTitle: "Sorry, this entry is only available in Russian.",
    time: "5.05.2024 | 11:00 AM",
    link: "/blog/warren-buffet",
  },
  {
    src: "/static/market-newsBg.jpg",
    title: "Стратегии трейдинга",
    subTitle: "Sorry, this entry is only available in Russian.",
    time: "17.04.2024 | 04:04 PM",
    link: "/blog/trading-strategies",
  },

]);
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
    url("/static/market-newsBg.jpg") center / cover no-repeat;
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