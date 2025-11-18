<template>
  <section class="slide-copy">
    <UiContainer class="slide-copy__container">
      <div class="slide-copy__text">
        <UiTextH1 class="slide-copy__title">
          {{ $t("landing.slider.top-trader-slide.title.before") }}<br />
          <span class="highlight">
            {{ $t("landing.slider.top-trader-slide.title.highlight") }}
          </span>
        </UiTextH1>

        <UiTextH6 class="slide-copy__subtitle">
          {{ $t("landing.slider.top-trader-slide.text") }}
        </UiTextH6>

        <UiButtonDefault
          state="primary"
          class="slide-copy__btn">
          {{ $t("landing.slider.top-trader-slide.btn") }}
        </UiButtonDefault>
      </div>

      <div class="slide-copy__image-wrapper">
        <img
          class="slide-copy__image"
          src="/static/top-trader-slide.webp"
          alt="Top Traders" />
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiTextH1 from "~/components/ui/UiTextH1.vue";
  import UiTextH6 from "~/components/ui/UiTextH6.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
</script>

<style scoped lang="scss">
  .slide-copy {
    width: 100%;
    height: 100%;
    background-color: var(--ui-background);
    display: flex;
    align-items: center;
    justify-content: center;

    &__container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;

      @media (max-width: 1024px) {
        margin-top: 80px;
        flex-direction: column;
        text-align: center;
      }
    }

    &__text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      white-space: nowrap;
      color: var(--ui-text-main);

      @media (max-width: 1024px) {
        align-items: center;
      }
    }

    &__title {
      font-weight: 400;
      color: var(--ui-text-main);

      .highlight {
        color: var(--ui-primary-accent);
      }

      @media (max-width: 768px) {
        font-size: 2.2rem;
      }
    }

    &__subtitle {
      color: var(--ui-text-main);
      font-weight: 400;

      @media (max-width: 768px) {
        max-width: 100%;
      }
    }

    &__btn {
      width: fit-content;

      @media (max-width: 1024px) {
        margin: 0 auto;
      }
    }

    &__image-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;

      @media (max-width: 1024px) {
        margin-top: 30px;
      }
    }

    &__image {
      max-width: 100%;
      height: auto;
      display: block;
    }
  }
</style>
