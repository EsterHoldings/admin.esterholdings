<template>
  <main class="landing">
    <WelcomeSection />
    <AdvantagesSection />
    <TradingPlatformSection />
    <FeaturesSection />
    <AccountTypesSection />
    <WideRangeSection />
    <FourStepsSection />
    <BannerSection />

    <LatestUpdatesSection />
  </main>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";

import WelcomeSection from "~/pages/landing/sections/WelcomeSection.vue";
import AdvantagesSection from "~/pages/landing/sections/AdvantagesSection.vue";
import FeaturesSection from "~/pages/landing/sections/FeaturesSection.vue";
import AccountTypesSection from "~/pages/landing/sections/AccountTypesSection.vue";
import WideRangeSection from "~/pages/landing/sections/WideRangeSection";
import FourStepsSection from "~/pages/landing/sections/FourStepsSection.vue";
import BannerSection from "~/pages/landing/sections/BannerSection.vue";
import TradingPlatformSection from "~/pages/landing/sections/TradingPlatformSection.vue";
import LatestUpdatesSection from "~/pages/landing/sections/LatestUpdatesSection.vue";

definePageMeta({
  middleware: ["not-auth"],
  layout: "main",
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
</style>
