<template>
  <section class="wide_range_section">
    <UiTextH3>{{ t('landing.sections.wide_range__title') }}</UiTextH3>

    <div class="wide_range_section__tabs">
      <!-- <UiTabs
        :tabs="tabsList.tabs.value"
        @active-tab="setActiveTab"
        class="tabs"
      /> -->

      <TabsDefault
        :tabsList="tabsList"
        @selectTab="handleActiveTab"
        :activeTabIndex="activeTabIndex" />
    </div>

    <div class="wide_range_section__content">
      <transition
        name="slide-short"
        mode="out-in">
        <component
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex" />
      </transition>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { computed, ref } from 'vue';
  const { t } = useI18n();

  import UiTextH3 from '~/components/ui/UiTextH3.vue';

  import TabsDefault from '~/components/block/tabs/TabsDefault.vue';

  import Forex from './components/Forex.vue';
  import ETFS from './components/ETFS.vue';
  import Energy from './components/Energy.vue';
  import CryptocurrencyCDs from './components/CryptocurrencyCDs.vue';
  import Indices from './components/Indices.vue';
  import Shares from './components/Shares.vue';
  import Metals from './components/Metals.vue';

  const activeTabIndex = ref(0);

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

<style lang="scss" scoped>
  .wide_range_section {
    h3 {
      color: var(--ui-text-main);
      text-align: center;
    }

    &__tabs {
      margin-top: 54px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__content {
      margin-top: 29px;
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

  @media (max-width: 991px) {
    .wide_range_section {
      h3 {
        font-size: 26px;
      }

      &__tabs {
        margin-top: 40px;
      }

      &__content {
        margin-top: 24px;
      }
    }
  }

  @media (max-width: 767px) {
    .wide_range_section {
      h3 {
        font-size: 24px;
      }

      &__tabs {
        margin-top: 32px;
        overflow: hidden;
        margin-left: -20px;
        margin-right: -20px;
        padding-left: 20px;
        padding-right: 20px;
      }

      &__content {
        margin-top: 20px;
      }
    }
  }

  @media (max-width: 480px) {
    .wide_range_section {
      h3 {
        font-size: 22px;
      }

      &__tabs {
        margin-top: 28px;
      }

      &__content {
        margin-top: 16px;
      }
    }
  }
</style>
