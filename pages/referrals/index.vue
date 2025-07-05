<template>
  <UiContainer>
    <div class="referrals">
      <div class="referrals__tabs">
        <UiTextH4 class="referrals__tabs_title">{{ t("cabinet.referrals.index.title") }}</UiTextH4>
        <TabsDefault
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
        />
      </div>
      <transition name="slide-short" mode="out-in">
        <component
          class="referrals__content"
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex"
        />
      </transition>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { reactive, ref, onMounted, watch, computed } from "vue";
import { definePageMeta } from "~/.nuxt/imports";

import UiContainer from "~/components/ui/UiContainer.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import TabGeneral from "./components/TabGeneral.vue";
import TabSettings from "./components/TabSettings.vue";
import TabTerms from "./components/TabTerms.vue";

import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });
const { t } = useI18n();

const activeTabIndex = ref(0);

const tabsList = computed(() => {
  return [
    { label: t("cabinet.referrals.index.tabs.general"), component: TabGeneral },
    {
      label: t("cabinet.referrals.index.tabs.settings"),
      component: TabSettings,
    },
    {
      label: t("cabinet.referrals.index.tabs.terms"),
      component: TabTerms,
    },
  ];
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style lang="scss" scoped>
.referrals {
  padding-bottom: 40px;

  &__tabs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;

    &_title {
      color: var(--ui-text-main);
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
