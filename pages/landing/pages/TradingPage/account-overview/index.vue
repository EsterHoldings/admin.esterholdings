<template>
  <UiContainer>
    <div class="account">
      <UiTextH3 class="account_title">{{ t('landing.pages.trading.account_overview_title') }}</UiTextH3>

      <div class="account_content">
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

  import Standard from './components/Standard.vue';
  import Pro from './components/Pro.vue';
  import Tandem from './components/Tandem.vue';
  import Islamic from './components/Islamic.vue';

  definePageMeta({
    layout: 'main',
    alias: '/account-overview',
  });

  const { t } = useI18n();
  const route = useRoute();

  const activeTabIndex = ref(Number(route.query.index) || 0);

  const tabsList = computed(() => {
    return [
      {
        label: t('landing.sections.accounts__options[0].title'),
        component: Standard,
      },

      {
        label: t('landing.sections.accounts__options[1].title'),
        component: Pro,
      },

      {
        label: t('landing.sections.accounts__options[2].title'),
        component: Islamic,
      },

      {
        label: t('landing.sections.accounts__options[3].title'),
        component: Tandem,
      },
    ];
  });

  const handleActiveTab = (tabIndex: number) => {
    activeTabIndex.value = tabIndex;
  };
</script>

<style lang="scss">
  .account {
    padding-top: 50px;
    display: flex;
    flex-direction: column;
    gap: 30px;

    &_title {
      text-align: center;
      color: var(--ui-text-main);
    }

    &_content {
      margin-top: 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 30px;
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
