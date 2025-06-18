<template>
  <div
    class="account-card active"
    :data-text="t(`landing.sections.accounts__options[0].title`)"
  >
    <div class="account-content">
      <UiTextH3 class="account-title bold">
        {{ t(`landing.sections.accounts__options[0].title`) }}

        <UiTextH5 class="account-subtitle">
          {{ t(`landing.sections.accounts__options[0].label`) }}
        </UiTextH5>
      </UiTextH3>

      <UiTextH5 class="account-description">
        {{ t(`landing.sections.accounts__options[0].description`) }}
      </UiTextH5>

      <Nuxt-Link class="link" to="/account-overview?index=0">
        <UiButtonDefault state="primary">
          {{ t("landing.sections.accounts__btn") }}
        </UiButtonDefault>
      </Nuxt-Link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, ref, watchEffect } from "vue";

import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const { t, tm } = useI18n();

const accountsMap = ref<Record<string, any>>({});

watchEffect(() => {
  const array = tm("landing.sections.accounts__options") || [];

  accountsMap.value = Array.isArray(array)
    ? array.reduce((acc, item, index) => {
        const id = t(`landing.sections.accounts__options[${index}].id`);
        acc[id] = index;
        return acc;
      }, {} as Record<string, number>)
    : {};
});

const currentIndex = computed(() => accountsMap.value[currentTab.value]);
</script>

<style lang="scss" scoped>
.account-types {
  padding: 40px 20px;
  display: flex;
  justify-content: center;

  &__title {
    color: var(--ui-text-main);
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

.account-card {
  flex: 1;
  height: 385px;
  border-radius: 15px;
  border: 1px solid var(--ui-stroke);
  cursor: pointer;
  transition: flex 0.3s ease-in-out, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

  .link {
    color: var(--ui-text-main);
    width: 100%;
    min-height: 100%;
    display: contents;
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

.account-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 47px;
  width: 80%;
  color: var(--ui-text-main);
}

.account-title {
  font-weight: bold;
}

.account-subtitle {
  margin-top: 5px;
  color: var(--ui-text-secondary);
}

.account-description {
  margin-top: 10px;
  color: var(--ui-text-secondary);
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
