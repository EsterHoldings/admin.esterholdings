<template>
  <section class="trading-platform" :class="[
    'trading-platform',
    { 'light-theme': themeStore.currentTheme === 'light' },
  ]">
    <div class="trading-platform_overlay">
      <UiTextH3 class="trading-platform_title">
        {{ t("landing.sections.platform__title") }}
      </UiTextH3>

      <div class="blur-circle"></div>
      <div class="platform-title">
        <h1>TODO {{ t('landing.sections.platform__features.0.title') }}</h1>
        <UiTextTrading :title="t('landing.sections.platform__features.0.title')"
          :subTitle="t('landing.sections.platform__features.0.text')" color="primary" />
      </div>

      <div class="devices">
        <div class="device device-laptop">
          <img src="/static/Macbook.png" alt="Laptop Trading" />

          <UiTextTrading class="device device-laptop_position"
            :title="t('landing.sections.platform__features.1..title')"
            :subTitle="t('landing.sections.platform__features[1].text')" hasBorder />
        </div>

        <div class="device device-main">
          <img src="/static/iMac.png" alt="Trading Platform" />

          <UiTextTrading class="device device-main_position" :title="t('landing.sections.platform__features[2].title')"
            :subTitle="t('landing.sections.platform__features[2].text')" hasBorder />
        </div>

        <div class="device device-phone">
          <img src="/static/iPhone.png" alt="Mobile Trading" />
        </div>

        <div class="device device-ipad">
          <img src="/static/iPad.png" alt="Mobile Trading" />

          <UiTextTrading class="device device-ipad_position" :title="t('landing.sections.platform__features[3].title')"
            :subTitle="t('landing.sections.platform__features[3].text')" color="warning" />
        </div>
      </div>

      <div class="background-glow"></div>

      <div class="floating__wrapper">
        <UiTextTrading class="floating__item" v-for="(item, index) in platformFeatures" :key="index"
          :title="t(`landing.sections.platform__features[${index}].title`)"
          :subTitle="t(`landing.sections.platform__features[${index}].text`)" hasBorder />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useThemeStore } from "~/stores/themeStore";
import { useI18n } from "vue-i18n";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextTrading from "~/components/ui/UiTextTrading.vue";

const themeStore = useThemeStore();
const { t } = useI18n();

const platformFeatures = [0, 1, 2, 3];
</script>

<style lang="scss" scoped>
.trading-platform {
  position: relative;
  padding: 100px 20px;
  min-height: 900px;
  background-color: var(--ui-background);
  color: var(--ui-text-main);
  transition: var(--default-transition);
  overflow: hidden;
  background-image: url("/static/trading-platform-bg.webp");
  background-position: right;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 1;
  box-shadow: inset 0 -200px 200px -60px var(--ui-background),
    inset 0 200px 200px -60px var(--ui-background);

  &::after {
    content: "";
    overflow: hidden;
    position: absolute;
    background-color: var(--ui-background);
    transition: var(--default-transition);
    inset: 0;
    opacity: 0.5;
    z-index: 1;
  }

  &_title {
    color: var(--ui-text-main);
    margin-bottom: 90px;
    white-space: pre-line;
    text-align: center;
  }

  &_overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }

  &-title {
    display: flex;
    align-items: flex-start;
  }
}

.light-theme {
  transition: var(--default-transition);
  background-image: none;

  .trading-platform::after {
    opacity: 0;
  }

  .blur-circle {
    background: transparent;
  }
}

.devices {
  position: relative;
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-shrink: 0;

  .device-main {
    &_position {
      position: absolute;
      left: 68%;
      top: 20%;
      z-index: 1;
    }
  }

  .device-laptop {
    position: absolute;
    right: 50%;
    top: 50%;

    &_position {
      position: absolute;
      top: 30%;
      right: 50%;
      z-index: 1;
    }
  }

  .device-ipad {
    position: absolute;
    top: 50%;
    left: 64%;
    z-index: 1;

    &_position {
      position: absolute;
      top: 100%;
      right: 50%;
      z-index: 1;
    }
  }

  .device-phone {
    position: absolute;
    top: 65%;
    left: 83%;
    z-index: 10;
  }
}

.floating__wrapper {
  display: none;
}

.platform-title {
  display: flex;
  justify-content: center;
  margin-right: 700px;
}

.blur-circle {
  position: absolute;
  width: 446px;
  height: 446px;
  background: rgb(247, 87, 9);
  filter: blur(93px);
  overflow: hidden;
  border-radius: 100%;
  left: 95%;
  top: 10%;
  z-index: 100000;
  animation: pulse 5s infinite ease-in-out;
  transition: var(--default-transition);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

@media (max-width: 1199px) {
  .devices {
    max-width: 991px;
  }

  .device-main {
    &_position {
      left: 65% !important;
    }

    img {
      width: 75%;
    }
  }

  .device-laptop {
    &_position {
      right: 40% !important;
    }

    img {
      width: 75%;
    }
  }

  .device-ipad {
    left: 55% !important;

    img {
      width: 75%;
    }
  }

  .device-phone {
    left: 74% !important;

    img {
      width: 75%;
    }
  }
}

@media (max-width: 991px) {
  .trading-platform {
    min-height: 1100px;
  }

  .trading-wrapper {
    display: none;
  }

  .devices {
    max-width: 767px;
    display: flex;
    flex-direction: column;

    .device-main_position,
    .device-laptop_position,
    .device-ipad_position,
    .device-phone_position {
      display: none;
    }

    .device-main {
      img {
        width: 90%;
      }
    }

    .device-laptop {
      right: 35%;
      top: 55%;

      img {
        width: 100%;
      }
    }

    .device-ipad {
      top: 60%;
      left: 50% !important;

      img {
        width: 100%;
      }
    }

    .device-phone {
      img {
        width: 100%;
      }
    }
  }

  .blur-circle {
    display: none;
  }

  .floating__wrapper {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    width: 100%;

    .floating__item {
      display: flex;
    }
  }
}

@media (max-width: 767px) {
  .trading-platform {
    min-height: calc(900px + 4 * 50px);
  }

  .trading-platform_title {
    font-size: 26px;
    white-space: normal;
  }

  .device-phone {
    top: 68% !important;
    left: 80% !important;
  }

  .floating__wrapper {
    margin-top: 100px;
  }
}

@media (max-width: 500px) {
  .trading-platform {
    min-height: 900px;
  }
}
</style>
