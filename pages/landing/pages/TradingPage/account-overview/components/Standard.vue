<template>
  <div :data-text="t(`landing.sections.accounts__options[0].title`)" class="w-full">
    <div class="">

      <div class="w-full h-[300px] relative flex items-center justify-center">
        <div class="flex items-center justify-center flex-col">
          <UiTextH3 class="bold z-10 flex items-center justify-center flex-col">
            {{ t(`landing.sections.accounts__options[0].title`) }}

            <UiTextH5>
              {{ t(`landing.sections.accounts__options[0].label`) }}
            </UiTextH5>
          </UiTextH3>

          <UiButtonDefault state="primary" class="mt-5 z-10">
            {{ t("landing.sections.accounts__btn") }}
          </UiButtonDefault>
        </div>

        <UiImage src="/static/standardBgCard.jpeg" class="!absolute !top-0 !bottom-0 !left-0 !right-0 !rounded-lg" />
      </div>

      <div>
        <div class="max-w-[600px] w-full m-auto mt-5">
          <UiTextH5 class="!text-[var(--ui-text-main)] text-center">
            {{ t(`landing.sections.accounts__options[0].description`) }}
          </UiTextH5>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {computed, ref, watchEffect} from "vue";

import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowRight from "~/components/ui/UiIconArrowRight.vue";
import UiImage from "~/components/ui/UiImage.vue";

const {t, tm} = useI18n();
</script>

<style lang="scss" scoped>
.account-types {
  padding: 40px 20px;
  display: flex;
  justify-content: center;

  &__title {
    color: white;
    text-align: center;
    margin-bottom: 70px;
  }
}

.account-container {
  display: flex;
  gap: 20px;
  max-width: 1100px;
  width: 100%;
}

.account-card.active {
  flex: 2;
  background-color: var(--ui-background-card);
  transform: scale(1.05);
  position: relative;
  overflow: hidden;

  &:before {
    content: attr(data-text);
    position: absolute;
    left: 100%;
    white-space: nowrap;
    font-size: 130px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.07);
    text-transform: uppercase;
    filter: blur(4px);
    z-index: 0;
    pointer-events: none;
    animation: scroll-text 12s linear infinite;
    transition: left 0.6s ease, bottom 0.6s ease, transform 0.6s ease,
    filter 0.6s ease, font-size 0.6s ease, color 0.6s ease;
  }

  &:hover:before {
    animation: pulse 1.5s ease-in-out infinite;
    left: 50%;
    transform: translateX(-50%) scale(1);
    filter: blur(1px);
    font-size: 130px;
    color: rgba(255, 255, 255, 0.15);
  }

  @keyframes scroll-text {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
    }
    50% {
      transform: translateX(-50%) scale(1.1);
    }
  }

  .account-description {
    min-width: 353px;
  }
}
//
//.account-content {
//  display: flex;
//  flex-direction: column;
//  align-items: center;
//  gap: 47px;
//  width: 80%;
//  color: white;
//}
//
//.account-title {
//  font-weight: bold;
//}
//
//.account-subtitle {
//  margin-top: 5px;
//  color: #b8b8c3;
//}
//
//.account-description {
//  margin-top: 10px;
//  color: #b8b8c3;
//}
//
//.account-mini {
//  display: flex;
//  flex-direction: column;
//  align-items: center;
//  font-size: 16px;
//  font-weight: bold;
//  color: white;
//
//  &_title {
//    writing-mode: vertical-rl;
//    text-orientation: mixed;
//    transform: rotate(180deg);
//    height: 144px;
//  }
//}

.arrow {
  margin-top: 50px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 991px) {
  .account-container {
    flex-direction: column;
  }

  .account-types__title {
    font-size: 26px;
  }

  .account-content {
    padding: 40px;
  }

  .account-mini {
    &_title {
      writing-mode: horizontal-tb;
      text-orientation: initial;
      transform: none;
      height: auto;
    }
  }

  .arrow {
    transform: rotate(90deg);
  }

  .account-card.active {
    transform: scale(1);

    &::before {
      font-size: 100px !important;
    }

    &:hover:before {
      left: 0;
      transform: scale(1);
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  }
}

@media (max-width: 767px) {
  .account-description {
    min-width: 300px !important;
  }

  .account-content {
    padding: 10px;
  }
}
</style>
