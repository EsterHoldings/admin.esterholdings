<template>
  <li
    class="item"
    :class="{ active: isActive }"
    @click="handleClickMenuItem($event)"
  >
    <div class="item__icon">
      <component :is="icon"></component>
      <span
        v-if="notificationsCount > 0"
        class="item__badge">
        {{ notificationsCount }}
      </span>
    </div>
    <div class="item__title" :class="{ hide: !props.sideBarIsOpen }">
      {{ title }}
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

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
  notificationsCount: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();

const isActive = computed(() => route.path === props.to);

const handleClickMenuItem = (event: Event) => emit("click", props.to);
</script>

<style scoped lang="scss">
.item {
  position: relative;
  display: flex;
  align-items: center;

  margin-top: 1px;
  height: 50px;

  background-color: transparent;

  transition: 0.3s;

  &:hover {
    transition: 0.3s;
    background-color: var(--color-stroke-ui-light);
    opacity: .7;
  }

  &.active {
    background-color: var(--color-stroke-ui-light);
  }

  &__icon {
    position: relative;
    padding-left: 20px;
  }

  &__badge {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--ui-sticker-danger);
    color: #fff;
    font-size: 10px;
    line-height: 16px;
    text-align: center;
    font-weight: 600;
  }

  &__title {
    padding-left: 20px;
    width: 100%;
    height: 100%;
    transition: 3s;
    opacity: 1;
    white-space: nowrap;

    z-index: 3;
    display: flex;
    align-items: center;

    color: #d8d8d8;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      color: #a9a9a9;
    }

    &.hide {
      transition: 0.1s;
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
  }
}
</style>
