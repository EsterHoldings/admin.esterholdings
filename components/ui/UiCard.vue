<template>
  <div class="card">
    <img class="card__image" :src="src" :alt="title" />

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
import UiIconClock from "~/components/ui/UiIconClock.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

defineProps({
  src: {
    type: String,
    required: true,
    default: "",
  },

  title: {
    type: String,
    default: "",
  },
  subTitle: {
    type: String,
    default: "",
  },
  time: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.card {
  background: rgb(0, 0, 40);
  border-radius: 15px;
  overflow: hidden;
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card__content {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card__title {
  color: rgb(255, 255, 255);
  font-family: Muli, sans-serif;
  font-size: 20px;
  font-weight: 700;
}

.card__subtitle {
  color: var(--color-ui-grey);
  font-weight: 400;
}

.card__time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-ui-grey);
  font-weight: 400;
}

.card__icon {
  width: 16px;
  height: 16px;
}
</style>
