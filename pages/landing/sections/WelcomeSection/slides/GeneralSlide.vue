<template>
  <section class="slide-welcome">
    <UiContainer>
      <div class="slide-welcome__content">
        <UiTextH1>
          {{ $t("landing.slider.general-slide.title.before") }}
          <span class="slide-welcome__title--highlight">
            {{ $t("landing.slider.general-slide.title.highlight") }} </span
          >,<br />
          {{ $t("landing.slider.general-slide.title.after") }}
          <img class="rocket" src="/static/rocket.png" alt="Rocket" />
        </UiTextH1>

        <UiTextH5 class="slide-welcome__text">
          {{ $t("landing.slider.general-slide.text") }}
        </UiTextH5>

        <div>
          <UiButtonDefault state="primary">
            {{ $t("landing.slider.general-slide.btn") }}
          </UiButtonDefault>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
</script>

<style scoped lang="scss">
.slide-welcome {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
  align-items: center;

  &__content {
    max-width: 500px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-left: 20px;
  }

  &__title--highlight {
    color: #ff6b00;
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
</style>
