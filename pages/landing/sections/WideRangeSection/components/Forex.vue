<template>
  <div class="forex">
    <UiContainer
      class="wrapper"
      :class="{ 'light-theme': themeStore.currentTheme === 'light' }"
    >
      <div class="forex__content">
        <UiTextH3 class="forex__title">Forex</UiTextH3>
        <UiTextH5 class="forex__text">
          Trade 70 major, minor & exotic currency pairs<br />
          with competitive trading conditions.
        </UiTextH5>
        <div>
          <UiButtonDefault state="primary">Trade Forex</UiButtonDefault>
        </div>
      </div>

      <UiImage src="/static/forex-money.webp" class="forex__img" />
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

import { useThemeStore } from "~/stores/themeStore";

const themeStore = useThemeStore();
</script>

<style lang="scss" scoped>
.forex {
  padding: 10px;
  width: 100vw;

  &__img {
    position: absolute;
    right: 0;
    bottom: -30px;
    object-fit: contain;
    width: 585px;
    z-index: 10;
  }

  &__content {
    max-width: 500px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-left: 20px;
  }

  .wrapper {
    position: relative;
    padding: 98px 376px 99px 58px;
    display: flex;
    gap: 142px;
    background: var(--ui-background);
    border-radius: 15px;
    border: 1px solid var(--ui-stroke);
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      width: 350px;
      height: 350px;
      background: rgba(247, 87, 9, 0.9);
      filter: blur(100px);
      top: 270px;
      right: -200px;
      z-index: 1;
      animation: pulse 3s infinite alternate ease-in-out;
    }

    &::before {
      content: "";
      position: absolute;
      width: 350px;
      height: 350px;
      background: rgba(0, 55, 174, 0.9);
      filter: blur(100px);
      top: 140px;
      right: 260px;
      z-index: 1;
      animation: pulse 3s infinite alternate ease-in-out;
    }
  }

  &__title {
    color: var(--ui-text-main);
  }

  &__text {
    color: var(--ui-text-secondary);
  }
}

:deep(.light-theme.wrapper) {
  background: var(--ui-background-card);

  &::before,
  &::after {
    background: white;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0.4;
  }
}

@media (max-width: 1199px) {
  .wrapper {
    padding: 40px !important;
  }
  .forex__img {
    width: 68%;
    top: 0;
  }
}

@media (max-width: 991px) {
  .forex__text {
    br {
      display: none;
    }
  }
  .forex__content {
    max-width: 300px;
  }

  .forex__img {
    top: 10%;
    width: 63%;
  }
}

@media (max-width: 767px) {
  .wrapper {
    padding: 20px !important;
  }

  .forex__img {
    top: 25%;
    width: 50%;
  }
}

@media (max-width: 575px) {
  .forex__img {
    display: none;
  }
}
</style>
