<template>
  <section class="welcome">
    <SliderDefault
      class="welcome__slider"
      :images="images"
      :components="components"
      :autoPlayInterval="10000"
    />
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import GeneralSlide from "./slides/GeneralSlide.vue";
import TenYearsSlide from "./slides/TenYearsSlide.vue";
import TopTradersSlide from "./slides/TopTradersSlide.vue";

import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import RunningLineDefault from "~/components/block/lines/RunningLineDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import TheSlider from "~/components/block/slider/TheSlider.vue";
import SliderDefault from "~/components/block/sliders/SliderDefaultTest.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";

const items = ref([
  { name: "EURUSD", price: 1.04282, change: 0.00014 },
  { name: "GBPUSD", price: 1.25267, change: -0.00016 },
  { name: "US30", price: 44674.97, change: 1.28 },
  { name: "ETHUSD", price: 2655.08, change: -6.84 },
  { name: "WTI", price: 71.11, change: 0.21 },
]);

const images = [
  { id: "slide1", alt: "Welcome", src: "/static/welcome-first-slide.webp" },
  { id: "slide2", alt: "10", src: "/static/ten_years_slide_background.webp" },
  { id: "slide3", alt: "", src: "" },
];

const components = [GeneralSlide, TenYearsSlide, TopTradersSlide];
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
