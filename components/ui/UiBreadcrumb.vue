<template>
  <ul class="breadcrumb">
    <li v-for="(item, index) in list" :key="item.name + index" class="breadcrumb__item">
      <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb__link">
        {{ item.name }}
      </NuxtLink>
      <span v-else class="breadcrumb__link">
        {{ item.name }}
      </span>
      <UiIconArrowRightShort v-if="index + 1 !== list.length" class="breadcrumb__sep" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import UiIconArrowRightShort from "~/components/ui/UiIconArrowRightShort.vue";

type BreadcrumbItem = {
  name: string;
  to?: string;
};

defineProps<{
  list: BreadcrumbItem[];
}>();
</script>

<style lang="scss" scoped>
.breadcrumb {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin: 0;
  color: var(--ui-text-secondary);
  font-size: 13px;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  &__link {
    color: inherit;
    text-decoration: none;
  }

  &__link:hover {
    color: var(--ui-text-main);
  }

  &__sep {
    color: var(--ui-text-secondary);
  }
}
</style>
