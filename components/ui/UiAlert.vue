<template>
  <div
    class="alert"
    :class="{
      default: props.state === '' && !props.outline,
      info: props.state === 'info' && !props.outline,
      success: props.state === 'success' && !props.outline,
      warning: props.state === 'warning' && !props.outline,
      danger: props.state === 'danger' && !props.outline,

      'default--outline': props.state === '' && props.outline,
      'info--outline': props.state === 'info' && props.outline,
      'success--outline': props.state === 'success' && props.outline,
      'warning--outline': props.state === 'warning' && props.outline,
      'danger--outline': props.state === 'danger' && props.outline,

      'text-color-light': props.textLight,
    }"
  >
    <slot />
    <UiIconDelete class="alert__remove-option" @click="handleClickRemove" />
  </div>
</template>

<script lang="ts" setup>
import UiIconDelete from "~/components/ui/UiIconDelete.vue";

const props = defineProps({
  state: {
    type: String,
    default: "",
  },
  outline: {
    type: Boolean,
    default: false,
  },
  textLight: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const handleClickRemove = () => emit('click');
</script>

<style lang="scss" scoped>
.alert {
  padding: calc(var(--spacer) * 1.5);
  border-radius: 10px;
  position: relative;

  &__remove-option {
    position: absolute;
    padding: 5px;
    top: 15px;
    right: 10px;
    height: 24px;
    width: 24px;
    border-radius: 4px;

    &:hover {
      border: 1px solid var(--color-danger);
      fill: var(--color-danger);
      background-color: var(--color-stroke-ui-dark);
    }
  }

  &.text-color-light {
    color: var(--color-light);
  }

  &.default {
    background-color: var(--color-default);

    &--outline {
      border: 1px solid var(--color-default);
    }
  }

  &.info {
    background-color: var(--color-info);

    &--outline {
      border: 1px solid var(--color-info);
    }
  }

  &.success {
    background-color: var(--color-success);

    &--outline {
      border: 1px solid var(--color-success);
    }
  }

  &.warning {
    background-color: var(--color-warning);

    &--outline {
      border: 1px solid var(--color-warning);
    }
  }

  &.danger {
    background-color: var(--color-danger);

    &--outline {
      border: 1px solid var(--color-danger);
    }
  }
}
</style>
