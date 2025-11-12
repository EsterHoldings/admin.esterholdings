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
      'btn--default--outline--small': props.state === 'default--outline--small',
      'btn--info--outline--small': props.state === 'info--outline--small',
      'btn--info--outline': props.state === 'info--outline',
      'btn--info--small': props.state === 'info--small',
      'btn--success--outline--small': props.state === 'success--outline--small',
      'btn--success--outline': props.state === 'success--outline',
      'btn--success--small': props.state === 'success--small',
      'btn--danger--outline': props.state === 'danger--outline',
      'btn--danger--outline--small': props.state === 'danger--outline--small',
      'btn--secondary': props.state === 'secondary',
    }"
    :type="props.type"
    @click="handleClick">
    <div
      v-if="slots['icon-left']"
      class="shrink-0">
      <slot name="icon-left" />
    </div>
    <UiIconSpinnerDefault v-if="isLoading" />
    <slot v-if="!isLoading" />
  </button>
</template>

<script lang="ts" setup>
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import { useSlots } from "vue";

  const slots = useSlots();
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
    box-sizing: border-box;
    height: 46px;
    //border-radius: 50px;
    border-radius: var(--ui-border--raduis);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px 26px;
    border: none;
    font-weight: 600;

    color: var(--ui-text-main);

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
        opacity: 0.5;
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

    &--default {
      background-color: var(--color-ui-primary);
      color: white;

      &--small {
        //background-color: var(--color-stroke-ui-dark);
        border: var(--ui-text-main);
        height: 32px;
        min-width: 32px;
        border-radius: 8px;
        padding: 0 10px;

        &:hover {
          opacity: 0.7;
          background-color: var(--color-stroke-ui-dark) !important;
        }
      }

      &--outline {
        border: 1px solid var(--color-ui-primary);
        background-color: transparent;
        color: var(--color-ui-primary);

        &--small {
          border: 1px solid var(--ui-primary-main);
          background-color: transparent;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          padding: 0 10px;

          &:hover {
            opacity: 0.7;
            background-color: var(--color-stroke-ui-dark) !important;
          }

          &:active {
            opacity: 0.5;
            background-color: var(--color-stroke-ui-dark) !important;
          }
        }

        &:hover {
          background: var(--color-ui-primary) !important;
        }
      }
    }

    &--info {
      background-color: var(--color-ui-primary);
      color: white;

      &--small {
        border: 1px solid var(--color-stroke-ui-light);
        background-color: var(--color-stroke-ui-dark);
        height: 40px;
        min-width: 40px;
        border-radius: 8px;
        padding: 0 10px;

        &:hover {
          opacity: 0.7;
          background-color: var(--color-stroke-ui-dark) !important;
        }
      }

      &--outline {
        border: 1px solid var(--color-ui-primary);
        background-color: transparent;
        color: var(--color-ui-primary);

        &--small {
          border: 1px solid var(--color-ui-primary);
          background-color: transparent;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          padding: 0 10px;

          &:hover {
            opacity: 0.7;
            border-color: var(--color-ui-primary) !important;
            background-color: transparent !important;
          }

          &:active {
            opacity: 0.5;
            background-color: var(--color-stroke-ui-dark) !important;
          }
        }

        &:hover {
          background: var(--color-ui-primary) !important;
        }
      }
    }

    &--success {
      background-color: var(--ui-sticker-success);
      color: white;

      &--small {
        border: none;
        background-color: var(--ui-sticker-success);
        height: 32px;
        min-width: 32px;
        border-radius: 8px;
        padding: 0 10px;

        &:hover {
          opacity: 0.9;
          background-color: var(--ui-sticker-success) !important;
        }

        &:active {
          opacity: 0.7;
        }
      }

      &--outline {
        border: 1px solid var(--ui-sticker-success);
        background-color: transparent;
        color: var(--ui-sticker-success);

        &--small {
          border: 1px solid var(--ui-sticker-success);
          background-color: transparent;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          padding: 0 10px;
          opacity: 0.8;

          &:hover {
            opacity: 1;
            background: transparent !important;
            color: var(--ui-sticker-success) !important;
          }
        }

        &:hover {
          background: var(--ui-sticker-success) !important;
        }
      }
    }

    &--danger {
      background-color: var(--ui-sticker-danger);
      color: white;

      &--small {
        border: none;
        background-color: var(--ui-sticker-danger);
        height: 32px;
        min-width: 32px;
        border-radius: 8px;
        padding: 0 10px;

        &:hover {
          opacity: 0.9;
          background-color: var(--ui-sticker-danger) !important;
        }

        &:active {
          opacity: 0.7;
        }
      }

      &--outline {
        border: 1px solid var(--ui-sticker-danger);
        background-color: transparent;
        color: var(--ui-sticker-danger);

        &--small {
          opacity: 0.7;
          border: 1px solid var(--ui-sticker-danger);
          background-color: transparent;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          padding: 0 10px;

          &:hover {
            opacity: 1;
            background-color: transparent !important;
          }
        }

        &:hover {
          opacity: 1;
          background-color: var(--ui-sticker-danger) !important;
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

    @media (max-width: 1160px) {
      height: 40px;
      padding: 10px 16px;
      font-size: 13px;

      &--info--small,
      &--success--small,
      &--danger--small,
      &--default--small {
        height: 28px;
        min-width: 28px;
        padding: 0 8px;
        font-size: 12px;
      }

      &--info--outline--small,
      &--success--outline--small,
      &--danger--outline--small,
      &--default--outline--small {
        height: 28px;
        min-width: 28px;
        padding: 0 8px;
        font-size: 12px;
      }
    }
  }
</style>
