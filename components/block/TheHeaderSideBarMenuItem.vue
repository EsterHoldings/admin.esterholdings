<template>
  <li
    class="item"
    :class="{ active: isActive }"
    @click="handleClickMenuItem($event)"
  >
    <div class="item__indicator" :class="{ active: isActive }"></div>
    <div class="item__icon">
      <!--      <NuxtLink :to="to">-->
      <component :is="icon"></component>
      <!--      </NuxtLink>-->
    </div>
    <div class="item__title" :class="{ hide: !props.sideBarIsOpen }">
      <!--      <NuxtLink :to="to">-->
      {{ title }}
      <!--      </NuxtLink>-->
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
    background-color: var(--color-stroke-ui-dark);
  }

  &.active {
    border-right: 1px solid var(--ui-stroke);
  }

  &__indicator {
    position: absolute;
    width: 8px;
    height: 100%;

    background-color: var(--color-stroke-ui-dark);

    &.active {
      background-color: var(--ui-primary-main);
    }
  }

  &__icon {
    padding-left: 20px;
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

    //a {
    //  z-index: 3;
    //  display: flex;
    //  align-items: center;
    //
    //  width: 100%;
    //  height: 100%;
    //
    //  color: #210e32;
    //  font-size: 14px;
    //  font-weight: 500;
    //
    //  &:hover {
    //    color: #210e32;
    //  }
    //}
  }
}
</style>
