<template>
  <div class="wrapper">
    <div
      class="circle"
      :class="{
        circle__primary: props.color === 'primary',
        circle__hover: props.color === 'hover',
        circle__success: props.color === 'success',
        circle__danger: props.color === 'danger',
        circle__stroke: props.color === 'stroke',
        circle__default: props.color === 'default',
        circle__background: props.color === 'background',
        circle__text: props.color === 'text',
      }"
    ></div>
    <UiTextH6 v-if="!props.stroke">{{ realColor }}</UiTextH6>
    <div class="stroke" v-for="color in props.stroke" :key="color" v-else>
      <UiTextH6>{{ color }}</UiTextH6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

const props = defineProps({
  color: String,
  stroke: Array,
});

const realColor = ref<string>("");

const colorMap: Record<string, string> = {
  primary: "--color-ui-primary",
  hover: "--color-ui-warning",
  success: "--color-sticker-ui-success",
  danger: "--color-sticker-ui-danger",
  stroke: "--color-stroke-ui",
  default: "--color-ui-grey",
  background: "--color-ui-background",
  text: "--color-ui-primary-defalt",
};

const updateColor = () => {
  if (process.client) {
    realColor.value = getComputedStyle(document.documentElement)
      .getPropertyValue(colorMap[props.color || "default"])
      .trim();
  }
};

watch(() => props.color, updateColor, { immediate: true });

onMounted(() => {
  updateColor();
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  h6 {
    color: var(--color-ui-primary-defalt);
  }
}
.circle {
  width: 100px;
  height: 100px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;

  &__primary {
    background: var(--color-ui-primary);
  }

  &__hover {
    background: var(--color-ui-warning);
  }

  &__success {
    background: var(--color-sticker-ui-success);
  }

  &__danger {
    background: var(--color-sticker-ui-danger);
  }

  &__stroke {
    background: var(--color-stroke-ui);
  }

  &__default {
    background: var(--color-ui-grey);
  }

  &__background {
    background: var(--color-ui-background);
    border: 1px solid rgb(65, 65, 65);
  }

  &__text {
    background: var(--color-ui-primary-defalt);
  }
}
</style>
