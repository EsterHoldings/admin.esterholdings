<template>
  <div class="etfs">
    <UiContainer
      class="wrapper"
      :class="{ 'light-theme': themeStore.currentTheme === 'light' }"
    >
      <div class="etfs__content">
        <UiTextH3 class="ETFS__title">
          {{ t("landing.sections.wide_range_tabs.ETFS.title") }}</UiTextH3
        >
        <UiTextH5 class="forex__text">
          {{ t("landing.sections.wide_range_tabs.ETFS.description") }}
        </UiTextH5>
        <div>
          <UiButtonDefault state="primary">
            {{
              t("landing.sections.wide_range_tabs.etfs.btn")
            }}</UiButtonDefault
          >
        </div>
      </div>

      <UiImage src="/static/etf_image.webp" class="etfs__img" />
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

import { useI18n } from "vue-i18n";
import { useThemeStore } from "~/stores/themeStore";
const { t } = useI18n();

const themeStore = useThemeStore();
</script>

<style lang="scss" scoped>
.etfs {
  padding: 10px;
  width: 100vw;

  &__img {
    position: absolute;
    right: 0;
    bottom: -30px;
    object-fit: contain;
    width: 478px;
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
    box-shadow: inset 0 -50px 50px -20px var(--ui-background),
      inset 0 50px 50px -20px var(--ui-background);

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
      box-shadow: inset 0 -50px 50px -20px var(--ui-background),
        inset 0 50px 50px -20px var(--ui-background);
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
      box-shadow: inset 0 -50px 50px -20px var(--ui-background),
        inset 0 50px 50px -20px var(--ui-background);
    }
  }

  &__title {
    color: var(--ui-text-main);
  }

  &__text {
    color: var(--ui-text-secondary);
    white-space: pre-line;
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
  .etfs__img {
    right: -50px;
  }
}

@media (max-width: 991px) {
  .etfs {
    padding: 0 !important;
  }

  .etfs__title {
    font-size: 26px;
  }

  .etfs__text {
    br {
      display: none;
    }
  }
  .wrapper {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    gap: 25px !important;

    &::after {
      top: 0 !important;
      width: 200px !important;
      height: 200px !important;
    }

    &::before {
      top: 0 !important;
      width: 200px !important;
      height: 200px !important;
    }
  }

  .etfs__content {
    order: 2;
  }

  .etfs__img {
    position: static;
    order: 1;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
