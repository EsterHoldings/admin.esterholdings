<template>
  <main class="landing">
    <WelcomeSection />
    <AdvantagesSection />
    <FeaturesSection />
    <AccountTypesSection />
    <FourStepsSection />
    <BannerSection />
    <!-- <TradingPlatformSection /> -->
  </main>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";

import WelcomeSection from "~/pages/landing/sections/WelcomeSection.vue";
import AdvantagesSection from "~/pages/landing/sections/AdvantagesSection.vue";
import FeaturesSection from "~/pages/landing/sections/FeaturesSection.vue";
import AccountTypesSection from "~/pages/landing/sections/AccountTypesSection.vue";
import FourStepsSection from "~/pages/landing/sections/FourStepsSection.vue";
import BannerSection from "~/pages/landing/sections/BannerSection.vue";

import TradingPlatformSection from "~/pages/landing/sections/TradingPlatformSection.vue";

definePageMeta({
  middleware: ["not-auth"],
  layout: "main",
});
</script>

<style lang="scss" scoped>
.landing {
  min-height: 100vh;
  height: 100%;
}
</style>
