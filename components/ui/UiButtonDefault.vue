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
      'btn--success--outline': props.state === 'success--outline',
      'btn--danger--outline': props.state === 'danger--outline',
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
  // background-color: transparent;
  // border: 1px solid gainsboro;
  // border-radius: 5px;
  // padding: 0 20px;
  // min-width: min-content;
  // height: 50px;

  height: 46px;
  border-radius: 50px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 26px;
  border: none;
  font-weight: 600;

  &--info {
    background-color: #719edf;
    color: white;
  }

  &--link {
    background-color: transparent;
    border: none;
    color: var(--ui-text-main);

    &:hover {
      color: var(--ui-primary-accent) !important;
      background-color: transparent !important;
    }
  }

  &--danger {
    background-color: #c71e1e;
    color: white;

    &--outline {
      border: 1px solid var(--ui-sticker-danger);
      background-color: transparent;
      color: var(--ui-sticker-danger);

      &:hover {
        background: var(--ui-sticker-danger) !important;
      }
    }
  }

  &--dark {
    background-color: var(--color-dark);
    color: white;
  }

  &--primary {
    background: rgb(0, 81, 255);
    color: white;
  }

  &--warning {
    background-color: var(--ui-primary-accent);
    color: white;
  }

  &--success {
    background-color: var(--ui-sticker-success);
    color: white;

    &--outline {
      border: 1px solid var(--ui-sticker-success);
      background-color: transparent;
      color: var(--ui-sticker-success);

      &:hover {
        background: var(--ui-sticker-success) !important;
      }
    }
  }

  &--secondary {
    background-color: darkslategray;
    color: white;
  }

  &:hover {
    background: var(--ui-primary-accent);
    color: white;
  }
}
</style>
