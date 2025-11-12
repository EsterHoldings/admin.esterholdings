<template>
  <div class="metals h-[366px] w-full">
    <UiContainer class="border !p-0 h-full">
      <div
          class="wrapper rounded-[10px] h-full"
          :class="{ 'light-theme': themeStore.currentTheme === 'light' }">
        <div class="metals__content p-10 h-full">
          <UiTextH3 class="metals__title">
            {{ t("landing.sections.wide_range_tabs.Metals.title") }}
          </UiTextH3>
          <UiTextH5 class="metals__text">
            {{ t("landing.sections.wide_range_tabs.Metals.description") }}
          </UiTextH5>
          <div>
            <Nuxt-Link to="market-instruments?index=0">
              <UiButtonDefault state="primary">
                {{ t("landing.sections.wide_range_tabs.Metals.btn") }}
              </UiButtonDefault>
            </Nuxt-Link>
          </div>
        </div>

        <div class="metals__img-wrapper relative">
          <div
              v-show="!imgLoaded"
              class="dots-loader"
              aria-live="polite"
              aria-label="Завантаження зображення">
            <span></span><span></span><span></span>
          </div>

          <UiImage
              :fitContain="true"
              :fitPosition="'right'"
              :src="imgSrc"
              class="metals__img"
              :class="{ 'is-loaded': imgLoaded }" />
        </div>
      </div>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "~/stores/themeStore";

import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const { t } = useI18n();
const themeStore = useThemeStore();

const imgSrc = "/static/metals_image.webp";
const imgLoaded = ref(false);

onMounted(() => {
  const preloader = new Image();
  preloader.onload = () => {
    imgLoaded.value = true;
  };
  preloader.onerror = () => {
    imgLoaded.value = true;
  };
  preloader.src = imgSrc;
});
</script>

<style lang="scss" scoped>
.metals {
  padding: 10px;
  width: 100%;

  &__img {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    object-fit: contain;
    width: 585px;
    z-index: 0;
    transform: translate(0, 15px);
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.35s ease;

    &.is-loaded {
      opacity: 1;
    }

    &-wrapper {
      position: relative;
      min-height: 280px;
    }
  }

  &__content {
    max-width: 500px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .border {
    width: auto;
    border: 2px solid transparent;
    border-radius: 14px;
    background:
        linear-gradient(#0b0f1a, #0b0f1a) padding-box,
        linear-gradient(135deg, #1b63ff 0%, #011644 100%) border-box;
  }

  .wrapper {
    position: relative;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    background-color: var(--ui-background);
    z-index: 0;
    border-radius: 13px;

    &::after {
      content: "";
      position: absolute;
      width: 350px;
      height: 350px;
      background: rgba(247, 87, 9, 0.9);
      filter: blur(100px);
      top: 270px;
      right: -200px;
      z-index: -1;
      animation: pulse 3s infinite alternate ease-in-out;
      box-shadow:
          inset 0 -50px 50px -20px var(--ui-background),
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
      z-index: -1;
      animation: pulse 3s infinite alternate ease-in-out;
      box-shadow:
          inset 0 -50px 50px -20px var(--ui-background),
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

.dots-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 1;
}
.dots-loader span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ui-text-secondary);
  animation: dotPulse 1.2s infinite ease-in-out;
}
.dots-loader span:nth-child(2) { animation-delay: .15s; }
.dots-loader span:nth-child(3) { animation-delay: .30s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: .4; }
  40%          { transform: scale(1);   opacity: 1;  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@media (max-width: 1199px) {
  .wrapper {
  }
  .metals__img {
  }
}

@media (max-width: 991px) {
  .metals {
    padding: 0 !important;
    height: auto !important;
  }

  .border {
    border-left: none !important;
    border-right: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }

  .metals__title {
    font-size: 26px;
  }

  .metals__text {
    font-size: 14px;
    br {
      display: none;
    }
  }

  .wrapper {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    gap: 0 !important;
    border-radius: 0 !important;

    &::after {
      display: none;
    }

    &::before {
      display: none;
    }
  }

  .metals__content {
    order: 2;
    z-index: 1;
    background: var(--ui-background);
    max-width: 100%;
  }

  .metals__img-wrapper {
    order: 1;
    width: 100%;
    height: 280px;
    min-height: 280px;
    overflow: hidden;
  }

  .metals__img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    position: relative;
    transform: translate(0, 0);
  }
}

@media (max-width: 575px) {
  .wide_range_section__content {
  }
}
</style>
