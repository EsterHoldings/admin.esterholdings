<template>
  <div
    class="trading-wrapper"
    :class="{
      'light-theme': hasBorder && themeStore.currentTheme === 'light',
      'with-border': hasBorder && themeStore.currentTheme !== 'light',
    }">
    <h2
      :class="{
        warning: props.color === 'warning' && themeStore.currentTheme === 'light',
        primary: props.color === 'primary' && themeStore.currentTheme === 'light',
      }">
      {{ props.title }}
    </h2>
    <p>
      {{ props.subTitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { useThemeStore } from '~/stores/themeStore';

  const themeStore = useThemeStore();
  const props = defineProps({
    title: String,
    subTitle: String,
    hasBorder: Boolean,
    color: String,
  });
</script>

<style lang="scss" scoped>
  .trading-wrapper {
    min-width: 300px;
    padding: 14px;
    border-radius: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    // gap: 5px;

    &.with-border {
      background: rgb(1, 22, 68);
      border-top: 2px solid rgb(27, 99, 255);
    }

    &.light-theme {
      background: rgba(0, 0, 40, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(25px);
      border: none;
    }

    h2 {
      color: var(--ui-text-main);
      font-size: 20px;
      font-weight: 700;
    }

    p {
      color: var(--ui-text-secondary);
      font-size: 14px;
      font-weight: 400;
    }
  }

  .warning {
    color: var(--ui-primary-accent) !important;
  }

  .primary {
    color: #0051ff !important;
  }

  @media (max-width: 1199px) {
    .trading-wrapper {
      width: 200px;
      padding: 7px 12px;

      h2 {
        font-size: 16px;
      }

      p {
        font-size: 13px;
      }
    }
  }

  @media (max-width: 991px) {
    .trading-wrapper {
      width: 100%;
      padding: 14px;
    }
  }
</style>
