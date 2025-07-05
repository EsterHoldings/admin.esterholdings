<template>
  <div class="referrals__tab--general">
    <PanelDefault class="referrals__tab--general__wrapper">
      <div class="referrals__tab--general_qr">
        <UiTextH4 class="referrals__tab--general_qr_link-title">Referral Link
        </UiTextH4>
        <UiQRCode link="https://stage.esterholdings.website?ref=w23dhDf73l4fcs1"/>

        <a
            :href="`https://t.me/share/url?url=http://esterholdings.com`"
            target="_blank"
            class="referrals__tab--general_qr-telegram-icon"
        >
          <UiIconInfo name="telegram" title="Share via Telegram" />
        </a>

        <UiTextH5 class="referrals__tab--general_qr-link">
          <UiTextSmall class="referrals__tab--general_qr-link-text" >
            <span ref="referralText">https://stage.esterholdings.website?ref=w23dhDf73l4fcs1</span>
          </UiTextSmall>
          <span class="referrals__tab--general_qr-link-icon">
            <UiIconCopy title="Copy" @click="copyReferral"/>
          </span>
        </UiTextH5>
      </div>
    </PanelDefault>
    <PanelDefault class="referrals__tab--general__wrapper">
      <div class="referrals__tab--general_levels">
        <UiTextH4 class="referrals__tab--general_levels-title">Levels</UiTextH4>

        <div class="referrals__tab--general_levels_list">
          <div class="level-row">
            <span>Level 1</span>
            <span>17</span>
          </div>

          <div class="level-row">
            <span>Level 2</span>
            <span>9</span>
          </div>

          <div class="level-row">
            <span>Level 3</span>
            <span>3</span>
          </div>
        </div>

        <YourLevelProgress current="150" total="200"/>
      </div>
    </PanelDefault>
    <PanelDefault class="referrals__tab--general__wrapper">
      <div class="referrals__tab--general_history">
        <UiTextH4 class="referrals__tab--general_history-title">History
        </UiTextH4>

        <UiTextH5
            v-for="(item, index) in history"
            :key="index"
            class="referrals__tab--general_history-item"
        >
          {{ item }}
        </UiTextH5
        >
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useToast} from "vue-toastification";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

import UiIconCopy from "~/components/ui/UiIconCopy.vue";

import YourLevelProgress from "./YourLevelProgress.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconTriangleUp from "~/components/ui/UiIconTriangleUp.vue";
import UiIconArrowRightShort from "~/components/ui/UiIconArrowRightShort.vue";
import UiIconInfo from "~/components/ui/UiIconInfo.vue";

const toast = useToast();

const referralText = ref<HTMLElement | null>(null);
const history = [
  "You got a new referral user@email.com",
  "You got a new referral user@email",
  "You earned a bonus",
  "You withdrew $25",
];

const copyReferral = async () => {
  const text = referralText.value?.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copy");
  } catch (err) {
    console.error("Ошибка копирования:", err);
  }
};
</script>

<style lang="scss" scoped>
.referrals__tab--general {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 20px;
  gap: 20px;

  // &__wrapper {}

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;

    &__qr { width: 33%; }
  }

  @media (max-width: 991px) {
    grid-template-columns: 1fr;

    &__qr { width: 100%; }
  }

  &_qr {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    align-items: center;

    &_link-title {
      color: var(--ui-text-main);
    }

    &-link {
      position: relative;
      padding: 10px 30px 10px 10px;
      display: inline-flex;
      align-items: center;
      width: 100%;
      background: var(--ui-background-sidebar);
      border-radius: 10px;

      &-text {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        color: var(--ui-text-main);
      }

      &-icon {
        position: absolute;
        right: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-text-main);
      }
    }
  }

  &_levels {
    width: 100%;
    padding: 20px;

    display: flex;
    justify-content: space-between;
    flex-direction: column;

    gap: 20px;

    &-title {
      color: var(--ui-text-main);
    }

    &_list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 25px;
    }
  }

  &_history {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 10px;

    &-title {
      color: var(--ui-text-main);
    }

    &-item {
      display: flex;
      align-items: center;
      color: var(--ui-text-main);
      font-size: 14px;
      height: 40px;
      padding: 5px;
      border-bottom: 1px solid var(--color-dark);
    }
  }

  .level-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    color: var(--ui-text-main);
  }
}
</style>
