<template>
  <div class="tabs">
    <div
      class="tab"
      v-for="(tabItem, index) in tabsList"
      :key="tabItem.label"
      :class="{ active: activeTabIndex === index }"
      @click="handleClickTab(index)">
      <component :is="tabItem.icon" />
      <span>{{ tabItem.label }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits(["selectTab"]);
  defineProps({
    tabsList: {
      type: Array,
      default: [],
    },
    activeTabIndex: {
      type: Number,
      default: 0,
    },
  });

  const handleClickTab = (index: number) => emit("selectTab", index);
</script>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .tab {
      gap: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      cursor: pointer;
      padding: 10px 20px;
      color: var(--ui-text-main);
      border-radius: 10px;

      &:hover {
        background-color: var(--ui-background-panel);
      }

      &.active {
        background-color: var(--color-ui-primary);
      }

      @media (max-width: 1023px) {
        justify-content: center;
        padding: 10px;

        span {
          display: none;
        }
      }
    }
  }
</style>
