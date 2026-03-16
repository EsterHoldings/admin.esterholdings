<template>
  <div class="settings">
    <UiTextH4>{{ t("admin.settings.title") }}</UiTextH4>

    <div class="settings__tabs">
      <TabsDefault
        :tabsList="tabsList"
        @selectTab="handleActiveTab"
        :activeTabIndex="activeTabIndex"
      />
    </div>

    <transition name="slide-short" mode="out-in">
      <component :is="activeTabContent" :key="activeTabIndex" />
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta } from "~/.nuxt/imports";

import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import Appearance from "./components/Appearance.vue";
import General from "./components/General.vue";
import Secure from "./components/Secure.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n();

const STORAGE_KEY = "setingsActiveTab";
const activeTabIndex = ref(0);
const tabsList = computed(() => {
  return [
    { label: t("admin.settings.tabs.general"), component: General },
    { label: t("admin.settings.tabs.appearance"), component: Appearance },
    {
      label: t("admin.settings.tabs.secure"),
      component: Secure,
    },
  ];
});

const activeTabContent = computed(() => {
  return tabsList.value[activeTabIndex.value].component;
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null && !isNaN(+saved)) {
    activeTabIndex.value = +saved;
  }
});

watch(activeTabIndex, (newIndex) => {
  localStorage.setItem(STORAGE_KEY, newIndex.toString());
});
</script>

<style lang="scss" scoped>
.settings {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;

  &__tabs {
    display: flex;
    align-items: end;
    justify-content: end;
  }

  h4 {
    color: var(--ui-text-main);
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
