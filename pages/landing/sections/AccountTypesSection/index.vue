<template>
  <section class="account-types__wrapper">
    <UiContainer>
      <UiTextH3 class="account-types__title"
        >{{ t("accounts__title") }}
      </UiTextH3>

      <div class="account-types__tabs">
        <UiTabs
          :tabs="tabsList.tabs.value"
          @active-tab="setActiveTab"
          class="tabs"
        />
      </div>

      <div class="account-types">
        <AccountCard />
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";

import { useTabs } from "./composables/index";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowRight from "~/components/ui/UiIconArrowRight.vue";
import UiTabs from "~/components/ui/UiTabs.vue";

import AccountCard from "./components/AccountCard.vue";

import UiContainer from "~/components/ui/UiContainer.vue";

import { activeComponent, setActiveTab } from "./composables/setup";
const tabsList = useTabs();

const { t, tm } = useI18n();

const accounts = tm("accounts__options");

const activeIndex = ref(0);

const setActive = (index: number) => {
  activeIndex.value = index;
};
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
    bottom: -10px;
    left: 20px;
    font-size: 180px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.07);
    text-transform: uppercase;
    filter: blur(4px);
    z-index: 0;
    white-space: nowrap;
    pointer-events: none;
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

.account-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: var(--ui-text-main);

  &_title {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    height: 144px;
  }
}

.arrow {
  margin-top: 50px;
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
