<template>
  <div class="ui">
    <div class="ui__wrapper">
      <div class="ui__left">
        <div class="ui__left_typography">
          <UiTextH3>Typography:</UiTextH3>
          <UiTextH3>font</UiTextH3>
          <UiTextH2>Muli</UiTextH2>
        </div>

        <div class="ui__left_control">
          <UiTextH3>Buttons</UiTextH3>

          <div class="button-group">
            <div class="button-group_row">
              <UiTextH6>Default</UiTextH6>
              <UiButtonDefault state="primary">Register</UiButtonDefault>
              <UiButtonDefault state="link">Log In</UiButtonDefault>
            </div>

            <div class="button-group_row">
              <UiTextH6>Hover Effect</UiTextH6>
              <UiButtonDefault state="warning">Register</UiButtonDefault>
              <UiButtonDefault class="button-group_row-hover" state="link"
                >Log In</UiButtonDefault
              >
            </div>
          </div>
        </div>

        <div class="ui__left_primary-color">
          <UiTextH3>Primary color</UiTextH3>

          <div class="circle-wrapper">
            <UiCircleItem color="primary" />
            <UiCircleItem color="hover" />
            <UiCircleItem color="text" />
          </div>
        </div>

        <div class="ui__left_primary-color">
          <UiTextH3>Sticker color</UiTextH3>

          <div class="circle-wrapper">
            <UiCircleItem color="success" />
            <UiCircleItem color="danger" />
          </div>
        </div>

        <div class="other__color">
          <div class="ui__left_primary-color ui__left_primary-color_center">
            <UiTextH3>Stroke</UiTextH3>

            <div class="circle-wrapper">
              <UiCircleItem color="stroke" :stroke="['#1B63FF', '#011644']" />
            </div>
          </div>

          <div class="ui__left_primary-color ui__left_primary-color_center">
            <UiTextH3>Grey</UiTextH3>

            <div class="circle-wrapper">
              <UiCircleItem color="default" />
            </div>
          </div>

          <div class="ui__left_primary-color ui__left_primary-color_center">
            <UiTextH3>Background</UiTextH3>

            <div class="circle-wrapper">
              <UiCircleItem color="background" />
            </div>
          </div>
        </div>
      </div>

      <div class="ui__right">
        <div class="ui__right_fonts">
          <div class="ui__right_font-variants">
            <div class="ui__right_font-variants-card">
              <UiTextH2 class="bold">Aa</UiTextH2>
              <UiTextH5>Bold</UiTextH5>
            </div>

            <div class="ui__right_font-variants-card">
              <UiTextH2 class="semibold">Aa</UiTextH2>
              <UiTextH5>Semibold</UiTextH5>
            </div>

            <div class="ui__right_font-variants-card">
              <UiTextH2 class="regular">Aa</UiTextH2>
              <UiTextH5>Regular</UiTextH5>
            </div>
          </div>
          <div class="ui__right_typography-scale">
            <UiTextH1>H1 Bold 60 px</UiTextH1>
            <UiTextH3 class="bold">H2 Bold 32 px</UiTextH3>
            <UiTextH4 class="bold">H3 Bold 24 px</UiTextH4>
            <UiTextH5>Text Regular 16 px</UiTextH5>
            <UiTextH6>Buttons Semibold 14 px</UiTextH6>
          </div>
        </div>

        <div class="ui__right_icons">
          <UiTextH3>Icons</UiTextH3>
          <div class="ui__right_icons-wrapper">
            <UiIconSun />
            <UiIconGlobe />
            <UiIconMoon />
            <UiIconFacebook />
            <UiIconLinkedIn />
            <UiIconInstagram />
            <UiIconTriangleUp />
            <UiIconTriangleDown />
            <UiIconArrowRight />
            <UiIconChevronDown />
          </div>
        </div>
      </div>
    </div>

    <div class="ui__headers">
      <UiTextH3>Menu (default)</UiTextH3>
      <LandingHeader class="demo" />

      <UiTextH3>Menu (with scrolling)</UiTextH3>
      <LandingHeader class="demo blurred" />
    </div>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiCircleItem from "./components/UiCircleItem.vue";
import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
import UiIconFacebook from "~/components/ui/UiIconFacebook.vue";
import UiIconLinkedIn from "~/components/ui/UiIconLinkedIn.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconInstagram from "~/components/ui/UiIconInstagram.vue";
import UiIconArrowRight from "~/components/ui/UiIconArrowRight.vue";
import UiIconTriangleUp from "~/components/ui/UiIconTriangleUp.vue";
import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
import UiIconTriangleDown from "~/components/ui/UiIconTriangleDown.vue";

import LandingHeader from "~/components/block/LandingHeader";
import LandingFooter from "~/components/block/LandingFooter";
</script>

<style lang="scss" scoped>
.ui {
  background-color: var(--color-ui-background);
  padding: 124px 85px 57px 85px;
  height: auto;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--color-ui-primary-defalt);
  }

  &__wrapper {
    padding: 0 100px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: 76px;

    &_typography {
      display: flex;
      align-items: baseline;
      gap: 16px;
    }

    &_control {
      display: flex;
      flex-direction: column;
      gap: 30px;

      .button-group {
        padding: 30px;
        border: 1px dashed rgb(151, 71, 255);
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 395px;

        &_row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          &-hover {
            color: var(--color-ui-warning);
          }

          h6 {
            width: 80px;
          }
        }
      }
    }

    .other__color {
      display: flex;
      gap: 65px;
    }

    &_primary-color {
      display: flex;
      flex-direction: column;
      gap: 30px;

      .circle-wrapper {
        display: flex;
        align-items: center;
        gap: 30px;
      }

      &_center {
        align-items: center;
      }
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    gap: 76px;

    &_fonts {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    &_font-variants {
      display: flex;
      align-items: baseline;
      gap: 50px;

      &-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }

    &_typography-scale {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &_icons {
      display: flex;
      flex-direction: column;
      gap: 30px;

      &-wrapper {
        display: grid;
        grid-template-columns: repeat(3, 24px);
        grid-template-rows: repeat(4, 24px);
        gap: 18px;
      }
    }
  }

  &__headers {
    margin-top: 140px;
    display: flex;
    flex-direction: column;
    gap: 74px;

    h3 {
      text-align: center;
    }

    .demo {
      position: unset;
      background: var(--color-stroke-ui);
    }

    .blurred {
      background: rgba(0, 0, 40, 0.05);
      backdrop-filter: blur(10px);
    }
  }
}
</style>
