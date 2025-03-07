<template>
  <div class="forex">
    <UiContainer class="wrapper">
      <div class="forex__content">
        <UiTextH3> Forex </UiTextH3>
        <UiTextH5 class="forex__text">
          Trade 70 major, minor & exotic currency pairs<br />
          with competitive trading conditions.
        </UiTextH5>
        <div>
          <UiButtonDefault state="primary">Trade Forex</UiButtonDefault>
        </div>
      </div>

      <UiImage src="/static/forex-money.png" class="forex__img" />
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
</script>

<style lang="scss" scoped>
.forex {
  width: 100vw;

  &__img {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 648px;
    height: 314px;
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
    background: rgb(0, 0, 40);
    border-radius: 15px;
    border: 1px solid #2a4af5;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      width: 350px;
      height: 350px;
      background: rgba(247, 87, 9, 0.9);
      filter: blur(150px);
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

  &__text {
    color: var(--color-ui-grey);
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
</style>
