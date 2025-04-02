<template>
  <main class="landing">
    <!--    <WelcomeSection />-->


    <div ref="welcomeRef">
      <WelcomeSection/>
    </div>
    <AdvantagesSection/>
    <TradingPlatformSection/>
    <FeaturesSection/>
    <AccountTypesSection/>
    <WideRangeSection/>
    <FourStepsSection/>
    <BannerSection/>
    <LatestUpdatesSection/>

    <CookieModal/>
  </main>
</template>

<script lang="ts" setup>
import {definePageMeta} from "~/.nuxt/imports";
import {ref, onMounted, onUnmounted} from 'vue';
import {useUiStore} from '~/stores/uiStore';

import WelcomeSection from "~/pages/landing/sections/WelcomeSection.vue";
import AdvantagesSection from "~/pages/landing/sections/AdvantagesSection.vue";
import FeaturesSection from "~/pages/landing/sections/FeaturesSection.vue";
import AccountTypesSection from "~/pages/landing/sections/AccountTypesSection.vue";
import WideRangeSection from "~/pages/landing/sections/WideRangeSection";
import FourStepsSection from "~/pages/landing/sections/FourStepsSection.vue";
import BannerSection from "~/pages/landing/sections/BannerSection.vue";
import TradingPlatformSection from "~/pages/landing/sections/TradingPlatformSection.vue";
import LatestUpdatesSection from "~/pages/landing/sections/LatestUpdatesSection.vue";
import CookieModal from "~/components/block/modals/CookieModal.vue";


definePageMeta({
  middleware: ["not-auth"],
  layout: "main",
});

const uiStore = useUiStore();
const welcomeRef = ref<HTMLElement | null>(null);

const handleScroll = () => {
  if (!welcomeRef.value) return;

  const rect = welcomeRef.value.getBoundingClientRect();
  const scrolledPast = rect.bottom <= 210;

  uiStore.headerScrolled = scrolledPast;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.landing {
  min-height: 100vh;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 150px;
}

@media (max-width: 991px) {
  .landing {
    gap: 50px;
  }
}
</style>
