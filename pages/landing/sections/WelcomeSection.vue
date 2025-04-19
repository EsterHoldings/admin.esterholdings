<template>
  <section class="welcome">
    <SliderDefault class="welcome__slider" :autoPlayInterval="10000" />
    <UiContainer>
      <div class="welcome__content">
        <!-- <UiTextH1>
          Trade <span class="welcome__title--highlight">Smarter</span>, <br />
          Trade Faster !
          <span v-html="$t('welcome-title')" />

          <img class="rocket" src="/static/rocket.png" alt="Rocket" />
        </UiTextH1> -->

        <UiTextH1>
          {{ $t("welcome-title.before") }}
          <span class="welcome__title--highlight">{{
            $t("welcome-title.highlight")
          }}</span
          >,<br />
          {{ $t("welcome-title.after") }}
          <img class="rocket" src="/static/rocket.png" alt="Rocket" />
        </UiTextH1>

        <UiTextH5 class="welcome__text">
          {{ $t("welcome__text") }}
        </UiTextH5>
        <div>
          <UiButtonDefault state="primary">{{
            $t("welcome-btn")
          }}</UiButtonDefault>
        </div>
      </div>
      <div class="welcome__running-line-default">
        <RunningLineDefault :items="items" />
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import RunningLineDefault from "~/components/block/lines/RunningLineDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import TheSlider from "~/components/block/slider/TheSlider.vue";
import SliderDefault from "~/components/block/sliders/SliderDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";

const items = ref([
  { name: "EURUSD", price: 1.04282, change: 0.00014 },
  { name: "GBPUSD", price: 1.25267, change: -0.00016 },
  { name: "US30", price: 44674.97, change: 1.28 },
  { name: "ETHUSD", price: 2655.08, change: -6.84 },
  { name: "WTI", price: 71.11, change: 0.21 },
]);
</script>

<style lang="scss" scoped>
.welcome {
  // background-image: url("~/assets/static/img/mainScrin.webp");
  min-height: 100vh;
  height: 100%;
  width: 100vw;

  &__slider {
    height: calc(100vh - 80px);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  &__content {
    position: absolute;
    max-width: 500px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 25px;
    transform: translate(0, -50%);
    top: 50%;
    margin-left: 20px;
  }

  &__running-line-default {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &__title {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 1rem;

    &--highlight {
      color: #ff6b00;
    }
  }

  &__text {
    color: var(--ui-gray);
    font-weight: 400;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

.rocket {
  height: 48px;
  width: 48px;
}

@media (max-width: 768px) {
  .welcome__text {
    font-size: 14px;
    br {
      display: none;
    }
  }
}
</style>
