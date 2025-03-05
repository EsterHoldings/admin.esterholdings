<template>
  <section class="account-types__wrapper">
    <UiTextH3 class="account-types__title"
      >Explore Our Trading Account Options</UiTextH3
    >
    <div class="account-types">
      <div class="account-container">
        <div
          v-for="(account, index) in accounts"
          :key="index"
          class="account-card"
          :data-text="account.name"
          :class="{ active: activeIndex === index }"
          @click="setActive(index)"
        >
          <div class="account-content">
            <UiTextH3 v-if="activeIndex === index" class="account-title bold">
              {{ account.name }}
              <UiTextH5 class="account-subtitle">account</UiTextH5>
            </UiTextH3>

            <UiTextH5 v-if="activeIndex === index" class="account-description">
              {{ account.description }}
            </UiTextH5>

            <UiButtonDefault state="primary" v-if="activeIndex === index">
              Open Account
            </UiButtonDefault>

            <div v-else class="account-mini">
              <UiTextH3 class="account-mini_title bold"
                >{{ account.name }}
                <UiTextH5>account</UiTextH5>
              </UiTextH3>

              <UiIconArrowRight class="arrow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowRight from "~/components/ui/UiIconArrowRight.vue";

const accounts = ref([
  {
    name: "Standard",
    description:
      "A great account for all types of traders, with floating FX Spreads from 1.2 pips via MT4/MT5 and micro lot trading available.",
  },
  { name: "Pro", description: "Professional-level spreads with lower costs." },
  { name: "Islamic", description: "Swap-free trading for Islamic traders." },
  { name: "Demo", description: "Test trading strategies risk-free." },
]);

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
  margin-bottom: 250px;

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

.account-card {
  flex: 1;
  height: 385px;
  //background-color: #081850;
  border-radius: 15px;
  border: 1px solid #2a4af5;
  cursor: pointer;
  transition: flex 0.3s ease-in-out, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.account-card.active {
  flex: 2;
  background-color: #081850;
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
  color: white;
}

.account-title {
  font-weight: bold;
}

.account-subtitle {
  margin-top: 5px;
  color: var(--color-ui-grey);
}

.account-description {
  margin-top: 10px;
  color: var(--color-ui-grey);
}

.account-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;

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
</style>
