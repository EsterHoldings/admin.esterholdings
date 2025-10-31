<template>
  <div class="card">
    <img
      class="card__image"
      :src="src"
      :alt="title" />

    <div class="card__content">
      <h2 class="card__title">{{ title }}</h2>
      <UiTextH6 class="card__subtitle">{{ subTitle }}</UiTextH6>

      <div class="card__time">
        <UiIconClock class="card__icon" />
        <UiTextH6>{{ time }}</UiTextH6>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import UiIconClock from '~/components/ui/UiIconClock.vue';
  import UiTextH6 from '~/components/ui/UiTextH6.vue';

  defineProps({
    src: {
      type: String,
      required: true,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
  });
</script>

<style lang="scss" scoped>
  .card {
    background: var(--ui-background);
    border-radius: 15px;
    width: 360px;
    height: 430px;
    display: flex;
    flex-direction: column;
  }

  .card__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 15px;
    flex-shrink: 0;
  }

  .card__content {
    padding: 26px 0 17px 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex: 1;
  }

  .card__title {
    color: var(--ui-text-main);
    font-family: Muli, sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    min-height: 48px;
  }

  .card__subtitle {
    color: var(--ui-text-secondary);
    font-weight: 400;
    flex: 1;
  }

  .card__time {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--ui-text-secondary);
    font-weight: 400;
    margin-top: auto;
  }

  .card__icon {
    width: 16px;
    height: 16px;
  }
</style>
