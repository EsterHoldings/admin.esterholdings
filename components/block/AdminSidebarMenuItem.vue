<template>
  <li
      class="side-bar-cabinet__menu__item"
      :class="{ active: isActive }"
      @click="handleClickMenuItem($event)"
  >

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
import {useRoute} from "vue-router";
import {computed} from "vue";

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
  justify-content: flex-start;
  gap: 10px;
  margin-top: 1px;
  height: 40px;
  padding: 0 16px;
  background-color: transparent;
  transition: 0.3s;
  margin-bottom: 5px;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.active {
    background-color: var(--color-stroke-ui-light);
  }

  &:hover {
    transition: 0.3s;
    background-color: var(--color-stroke-ui-light);
  }

  &__icon {
    color: var(--ui-text-main);

    svg {
      stroke: none;
      fill: currentColor;
    }
  }

  &__title {
    width: 100%;
    height: 100%;
    transition: 3s;
    opacity: 1;
    white-space: nowrap;
    text-align: center;
    cursor: pointer;

    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-start;

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