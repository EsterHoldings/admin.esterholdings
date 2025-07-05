<template>
  <span
    class="badge"
    :class="{
      default: props.state === '' && !props.outline,
      info: props.state === 'info' && !props.outline,
      dark: props.state === 'dark' && !props.outline,
      danger: props.state === 'danger' && !props.outline,
      primary: props.state === 'primary' && !props.outline,
      warning: props.state === 'warning' && !props.outline,
      success: props.state === 'success' && !props.outline,
      secondary: props.state === 'secondary' && !props.outline,

      'default--outline': props.state === 'default' && props.outline,
      'info--outline': props.state === 'info' && props.outline,
      'dark--outline': props.state === 'dark' && props.outline,
      'danger--outline': props.state === 'danger' && props.outline,
      'primary--outline': props.state === 'primary' && props.outline,
      'warning--outline': props.state === 'warning' && props.outline,
      'success--outline': props.state === 'success' && props.outline,
      'secondary--outline': props.state === 'secondary' && props.outline,

      'text-color-light': props.textLight,
    }"
  >
    <slot />
  </span>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
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
  outline: {
    type: Boolean,
    default: false,
  },
  textLight: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 20px;
  width: fit-content;
  padding: 20px 15px;
  border-radius: 10px;

  &.text-color-light {
    color: var(--color-light);
  }

  &.default {
    background-color: var(--color-default);

    &--outline {
      border: 1px solid var(--color-default);
    }
  }

  &.primary {
    background-color: var(--color-primary);

    &--outline {
      border: 1px solid var(--color-primary);
    }
  }

  &.secondary {
    background-color: var(--color-secondary);

    &--outline {
      border: 1px solid var(--color-secondary);
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

  &.light {
    background-color: var(--color-light);

    &--outline {
      border: 1px solid var(--color-light);
    }
  }

  &.dark {
    background-color: var(--color-dark);

    &--outline {
      border: 1px solid var(--color-dark);
    }
  }
}
</style>
