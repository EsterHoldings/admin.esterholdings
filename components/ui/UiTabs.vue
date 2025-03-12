<template>
  <div class="tabs">
    <div class="tabs__list">
      <div
          v-for="(tab, index) in props.tabs"
          :key="tab.id"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeTabIndex == index }"
          @click="handleSetActiveTab(index)"
      >
        <UiTextH5>
          {{ tab.label }}
        </UiTextH5>
      </div>
    </div>
    <div class="tabs__content">
      <component :is="activeTabComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiTextH5 from "./UiTextH5.vue";
import {computed, ref} from "vue";

interface ITab {
  id?: string,
  label?: string,
  component?: any
}

const props = defineProps<{ tabs: Array<ITab>; }>();
const activeTabIndex = ref(0);

const handleSetActiveTab = (index) => activeTabIndex.value = index;

const activeTabComponent = computed(() => {
  return props.tabs[activeTabIndex.value].component;
})
</script>

<style scoped lang="scss">
.tabs {
  padding: 10px 40px;
}

.tabs__list {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
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
}
</style>
