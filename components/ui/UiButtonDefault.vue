<template>
  <button
    class="btn"
    :class="{
      'btn--info': props.state === 'info',
      'btn--link': props.state === 'link',
      'btn--dark': props.state === 'dark',
      'btn--danger': props.state === 'danger',
      'btn--primary': props.state === 'primary',
      'btn--warning': props.state === 'warning',
      'btn--success': props.state === 'success',
      'btn--secondary': props.state === 'secondary',
    }"
    :type="props.type"
    @click="handleClick"
  >
    <UiIconSpinnerDefault v-if="isLoading" />
    <slot v-if="!isLoading" />
  </button>
</template>

<script lang="ts" setup>
// @ts-ignore
import UiIconSpinnerLoader from "~/components/ui/UiIconSpinnerLoader.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

const props = defineProps({
  type: {
    // @ts-ignore
    type: String as PropType<"button" | "submit" | "reset" | undefined>,
    default: "button",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  state: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["click"]);
const handleClick = (): void => emit("click");
</script>

<style lang="scss" scoped>
.btn {
  background-color: transparent;
  border: 1px solid gainsboro;
  border-radius: 5px;
  padding: 0 20px;
  min-width: min-content;
  height: 50px;

  &--info {
    background-color: #719edf;
    color: white;
  }

  &--link {
    background-color: transparent;
    border: none;
  }

  &--danger {
    background-color: #c71e1e;
    color: white;
  }

  &--dark {
    background-color: var(--color-dark);
    color: white;
  }

  &--primary {
    background-color: #0d6efd;
    color: white;
  }

  &--warning {
    background-color: orange;
    color: white;
  }

  &--success {
    background-color: green;
    color: white;
  }

  &--secondary {
    background-color: darkslategray;
    color: white;
  }
}
</style>
