<script setup lang="ts">
import {ref} from "vue";

import UiTextH5 from "./UiTextH5.vue";

interface Tab {
  id: string;
  label: string;
}

const props = defineProps<{
  tabs: Tab[];
}>();

const emit = defineEmits(["activeTab"]);

const activeTab = ref(props.tabs[0].id);

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;

  emit("activeTab", tabId);
};
</script>

<template>
  <div class="tabs">
    <div class="tabs__wrapper">
      <div
          v-for="tab in props.tabs"
          :key="tab.id"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
      >
        <UiTextH5>
          {{ tab.label }}
        </UiTextH5>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  padding: 10px 40px;
}

.tabs__wrapper {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.tabs__item {
  position: relative;

  border: 1px solid rgb(27, 99, 255);
  border-radius: 50px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 26px;
  cursor: pointer;

  h5 {
    color: var(--color-ui-primary-defalt);
  }
}

.tabs__item--active {
  background: var(--color-ui-warning);
  border: none;

  h5 {
    color: white;
  }
}

@media (max-width: 991px) {
  .tabs {
    padding: 10px;
  }
  .tabs__item {
    padding: 16px !important;

    h5 {
      font-size: 13px;
    }
  }
}
</style>
