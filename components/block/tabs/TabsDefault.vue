<template>
  <div class="tabs">
    <div
      class="tab"
      v-for="(tabItem, index) in tabsList"
      :key="tabItem.label"
      :class="{ active: activeTabIndex === index }"
      @click="handleClickTab(index)">
      {{ tabItem.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  interface TabItem {
    label: string;
    component?: any;
  }

  interface Props {
    tabsList: TabItem[];
    activeTabIndex?: number;
  }

  const emit = defineEmits(['selectTab']);
  withDefaults(defineProps<Props>(), {
    activeTabIndex: 0,
  });

  const handleClickTab = (index: number) => emit('selectTab', index);
</script>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    gap: 2rem;

    .tab {
      cursor: pointer;
      padding: 8px 12px;
      color: var(--ui-text-main);
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: border-color 0.3s ease;

      &:hover {
        border-bottom: 2px solid var(--color-ui-primary);
      }

      &.active {
        border-bottom: 2px solid var(--color-ui-primary);
      }
    }
  }

  @media (max-width: 767px) {
    .tabs {
      gap: 1.2rem;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding-bottom: 8px;

      &::-webkit-scrollbar {
        display: none;
      }

      .tab {
        font-size: 14px;
        padding: 6px 10px;
      }
    }
  }

  @media (max-width: 480px) {
    .tabs {
      gap: 1rem;

      .tab {
        font-size: 13px;
        padding: 6px 8px;
      }
    }
  }
</style>
