<template>
  <UiContainer>
    <div class="market">
      <UiTextH3 class="market-title">Tools</UiTextH3>

      <TabsDefault
        :tabsList="tabsList"
        @selectTab="handleActiveTab"
        :activeTabIndex="activeTabIndex"
      />

      <transition name="slide-short" mode="out-in">
        <component
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex"
        />
      </transition>

      <div class="market-text_wrapper">
        <UiTextParagraph class="market-text">
          All currency pairs spreads in trading terminal of Ester Holdings
          company are interbank. Spreads are formed with the help of the trading
          aggregator, which chooses the best prices, from liquidity providers at
          each current moment. We provide the very best liquidity at Forex
          market. Swap means a payment by market participants to roll a position
          over to the next day.
        </UiTextParagraph>

        <UiTextParagraph class="market-text">
          The process of transfer of open positions to the next day is carried
          out for all positions that remain open at the 23:59:59 to 00:00:00
          time as measured by the Company server. For the transfer of a position
          to the next day, the Customer account may be credited or debited swaps
          on such positions.
        </UiTextParagraph>

        <UiTextParagraph class="market-text">
          The sizes of the swaps and the method of their crediting/debiting are
          stipulated in the respective specifications.
        </UiTextParagraph>

        <UiTextParagraph class="market-text">
          During the bankroller period from 23:55 to 00:05 (time GMT) liquidity
          is reduced, it is possible to increase the spread and the processing
          time of the client’s orders.
        </UiTextParagraph>

        <UiTextParagraph class="market-text">
          Your access to and use of the website and/or platform constitutes your
          acceptance of these Trading Conditions and any other legal notices and
          statements contained on same. Ester may modify these Trading
          Conditions at any time and without prior notice. Your continued access
          to and use of the website and/or platform constitutes your acceptance
          of these Trading Conditions as modified.
        </UiTextParagraph>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";

import Forex from "./components/Forex.vue";
import ETFS from "./components/ETFS.vue";
import Energy from "./components/Energy.vue";
import CryptocurrencyCDs from "./components/CryptocurrencyCDs.vue";
import Indices from "./components/Indices.vue";
import Shares from "./components/Shares.vue";
import Metals from "./components/Metals.vue";

definePageMeta({
  layout: "main",
  alias: "/market-instruments",
});

const { t } = useI18n();
const route = useRoute();

const activeTabIndex = ref(0 || Number(route.query.index));

const tabsList = computed(() => {
  return [
    {
      label: t("landing.sections.wide_range__categories[0].label"),
      component: Forex,
    },
    {
      label: t("landing.sections.wide_range__categories[1].label"),
      component: Metals,
    },
    {
      label: t("landing.sections.wide_range__categories[2].label"),
      component: CryptocurrencyCDs,
    },
    {
      label: t("landing.sections.wide_range__categories[3].label"),
      component: Indices,
    },
    {
      label: t("landing.sections.wide_range__categories[4].label"),
      component: Shares,
    },
    {
      label: t("landing.sections.wide_range__categories[5].label"),
      component: Energy,
    },
    {
      label: t("landing.sections.wide_range__categories[6].label"),
      component: ETFS,
    },
  ];
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style lang="scss">
.market {
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;

  &-title {
    text-align: center;
    color: var(--ui-text-main);
    margin-bottom: 30px;
  }

  &-text {
    color: var(--ui-text-main);

    &_wrapper {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
  }
}

.slide-short-enter-active,
.slide-short-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.slide-short-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-short-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
