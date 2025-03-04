<template>
  <section class="hero">
    <div class="hero__content">
      <UiTextH1
        >Trade <span class="hero__title--highlight">Smarter</span>, <br />
        Trade <span class="hero__title--highlight">Faster</span> !</UiTextH1
      >

      <UiTextH5 class="hero__text">
        Access global markets, including Forex, Stocks, and CFDs, with <br />
        fast execution, low spreads, and real-time market analysis.
      </UiTextH5>

      <div>
        <UiButtonDefault state="primary">Trade Now</UiButtonDefault>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
</script>

<style lang="scss" scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  background-image: url("~/assets/static/img/mainScrin.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-left: 10vw;

  &__content {
    max-width: 500px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  &__title {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 1rem;

    &--highlight {
      color: #ff6b00; // Оранжевый акцент
    }
  }

  &__text {
    color: var(--color-ui-grey);
    font-weight: 400;
  }
}
</style>
