<template>
  <li
    class="side-bar-cabinet__menu__item"
    :class="{ active: isActive }"
    @click="handleClickMenuItem($event)"
  >
    <div
      class="side-bar-cabinet__menu__item__indicator"
      :class="{ active: isActive }"
    ></div>

    <div class="side-bar-cabinet__menu__item__icon">
      <component :is="icon"></component>
    </div>

    <div
      class="side-bar-cabinet__menu__item__title"
      :class="{ hide: !props.sideBarIsOpen }"
    >
      {{ title }}
    </div>
  </li>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    default: "",
  },
  sideBarIsOpen: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

const isActive = computed(() => route.path === props.to);

const handleClickMenuItem = (event: Event) => emit("click", props.to);
</script>

<style lang="scss" scoped>
.side-bar-cabinet__menu__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  margin-top: 1px;
  height: 80px;

  background-color: transparent;

  transition: 0.3s;

  &.active {
    border-right: 3px solid var(--color-stroke-ui);
  }

  &:hover {
    transition: 0.3s;
  }

  &.active {
    border-right: 1px solid var(--ui-stroke);
  }

  &__indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 100%;

    background-color: var(--ui-stroke);

    &.active {
      background-color: var(--color-ui-primary);
    }
  }

  &__icon {
    padding-top: 10px;
    color: var(--ui-text-main);
  }

  &__title {
    padding: 0 10px 10px;
    width: 100%;
    height: 100%;
    transition: 3s;
    opacity: 1;
    white-space: pre-wrap;
    text-align: center;
    cursor: pointer;

    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--ui-text-main);
    font-size: 14px;
    font-weight: 500;

    &.hide {
      transition: 0.1s;
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
  }
}
</style>
