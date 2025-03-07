import { computed } from "vue";
import { currentTab, currentTabContent } from "./index";

export const activeComponent = computed(() => {
  return currentTabContent[currentTab.value] || null;
});

export const setActiveTab = (tabId: string) => {
  currentTab.value = tabId;
};
