<template>
  <ul class="breadcrumb">
    <li
      class="breadcrumb__item"
      v-for="(item, index) in props.list"
      :key="item?.name"
    >
      <span>{{ item?.name }}</span>
      <UiIconArrowRightShort v-if="index + 1 !== props.list.length" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import IBreadcrumb from "~/composables/intefaces/IBreadcrumb";

const props = defineProps({
  list: {
    type: Array<IBreadcrumb>,
    default: [],
  },
});
</script>

<style lang="scss" scoped>
.breadcrumb {
  list-style: none;
  display: flex;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;

    &_separator {
      margin: 0 10px;
    }
  }
}
</style>
