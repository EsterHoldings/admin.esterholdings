<template>
  <section class="slide-10">
    <div class="slide-10__content">
      <div class="slide-10__title">
        <div class="slide-10__image-wrapper">
          <img src="/static/ten-slide.webp" alt="10" class="slide-10__image" />
          <UiTextH3 class="slide-10__years">
            {{ $t("landing.slider.ten_years_slide.title.highlight") }}
          </UiTextH3>
        </div>
      </div>

      <UiTextH2 class="slide-10__subtitle">
        {{ $t("landing.slider.ten_years_slide.title.after") }}
      </UiTextH2>

      <UiTextH6 class="slide-10__description">
        {{ $t("landing.slider.ten_years_slide.text") }}
      </UiTextH6>

      <UiButtonDefault state="primary" class="slide-10__btn">
        {{ $t("landing.slider.ten_years_slide.btn") }}
      </UiButtonDefault>
    </div>
  </section>
</template>

<script lang="ts" setup>
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
</script>

<style scoped lang="scss">
.slide-10 {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 20px;
  position: relative;

  &__content {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__title {
    display: flex;
    justify-content: center;
  }

  &__image-wrapper {
    position: relative;
    display: inline-block;
    width: auto;
  }

  &__image {
    display: block;
    max-width: 100%;
    height: auto;
  }

  &__years {
    position: absolute;
    top: 37%;
    right: 4%;
    transform: translate(50%, 50%);
    font-size: 30px;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
    color: #ffffff;
  }

  &__subtitle {
    font-weight: 600;
  }

  &__description {
    color: #ccc;
  }

  &__btn {
    margin-top: 15px;
    align-self: center;
  }
}
</style>
