<template>
  <section class="slide-10">
    <div class="slide-10__content">
      <div class="slide-10__title">
        <img src="/static/ten-slide.webp" alt="10" />

        <!-- <UiTextH3 class="slide-10__years">Years</UiTextH3> -->

        <UiTextH3 class="slide-10__years">
          {{ $t("slide-10-title.highlight") }}
        </UiTextH3>
      </div>
      <!-- <UiTextH2 class="slide-10__subtitle">in Trading</UiTextH2> -->
      <UiTextH2 class="slide-10__subtitle">
        {{ $t("slide-10-title.after") }}
      </UiTextH2>
      <!-- <UiTextH6 class="slide-10__description">
        Experience tested by time. Reliability confirmed by results.
      </UiTextH6> -->

      <UiTextH6 class="slide-10__description">
        {{ $t("slide-10-text") }}
      </UiTextH6>
      <!-- <UiButtonDefault state="primary" class="slide-10__btn">
        Join in Us
      </UiButtonDefault> -->

      <UiButtonDefault state="primary" class="slide-10__btn">
        {{ $t("slide-10-btn") }}
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
    position: relative;
  }

  &__years {
    font-size: 30px;
    font-weight: 600;
    position: absolute;
    top: 82px;
    right: 33px;
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
