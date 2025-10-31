<template>
  <UiContainer>
    <div class="market">
      <UiTextH3 class="market-title">{{ t('landing.pages.trading.market_instruments_title') }}</UiTextH3>

      <TabsDefault
        :tabsList="tabsList"
        @selectTab="handleActiveTab"
        :activeTabIndex="activeTabIndex" />

      <transition
        name="slide-short"
        mode="out-in">
        <component
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex" />
      </transition>

      <div class="market-text_wrapper">
        <UiTextParagraph
          v-for="(text, index) in marketInstrumentsText"
          :key="index"
          class="market-text">
          {{ text }}
        </UiTextParagraph>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { definePageMeta } from '~/.nuxt/imports';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiTextParagraph from '~/components/ui/UiTextParagraph.vue';
  import TabsDefault from '~/components/block/tabs/TabsDefault.vue';

  import Forex from './components/Forex.vue';
  import ETFS from './components/ETFS.vue';
  import Energy from './components/Energy.vue';
  import CryptocurrencyCDs from './components/CryptocurrencyCDs.vue';
  import Indices from './components/Indices.vue';
  import Shares from './components/Shares.vue';
  import Metals from './components/Metals.vue';

  definePageMeta({
    layout: 'main',
    alias: '/market-instruments',
  });

  const { t, tm } = useI18n();
  const route = useRoute();

  const activeTabIndex = ref(0 || Number(route.query.index));

  const marketInstrumentsText = computed(() => {
    const texts = tm('landing.pages.trading.market_instruments_text') as any[];
    return Array.isArray(texts)
      ? texts.map((_, index) => t(`landing.pages.trading.market_instruments_text[${index}]`))
      : [];
  });

  const tabsList = computed(() => {
    return [
      {
        label: t('landing.sections.wide_range__categories[0].label'),
        component: Forex,
      },
      {
        label: t('landing.sections.wide_range__categories[1].label'),
        component: Metals,
      },
      {
        label: t('landing.sections.wide_range__categories[2].label'),
        component: CryptocurrencyCDs,
      },
      {
        label: t('landing.sections.wide_range__categories[3].label'),
        component: Indices,
      },
      {
        label: t('landing.sections.wide_range__categories[4].label'),
        component: Shares,
      },
      {
        label: t('landing.sections.wide_range__categories[5].label'),
        component: Energy,
      },
      {
        label: t('landing.sections.wide_range__categories[6].label'),
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
