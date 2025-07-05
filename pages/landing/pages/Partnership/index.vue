<template>
  <UiContainer>
    <div class="partnership-page">
      <UiTextH3 class="partnership-page__title">Partnership</UiTextH3>

      <div class="partnership-page__img"></div>

      <UiTextH4 class="partnership-page__subtitle">Variants of partnership</UiTextH4>

      <div class="partnership-page__buttons">
        <UiButtonDefault state="primary">AGENT PROGRAM</UiButtonDefault>
        <UiButtonDefault state="warning">FRANCHISING</UiButtonDefault>
      </div>

      <UiTextParagraph class="partnership-page__intro">
        <strong>Become a partner of Ester and get income together with brand</strong>
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        <strong>Ester Holdings Inc.</strong> — stable company with highly efficient management. Company Ester Holdings
        is open to everything new, is a leader in formation and supporting high standards of work for the whole
        financial market.
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        We offer the opportunity to build own business under brand of the International company Ester Holdings in the
        sphere of internet-trading. Hurry up to be the first in your city, open the office of Ester Holdings, and get
        the most profitable conditions of cooperation, and the main important, high level of income.
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__section-title">We offer you</UiTextH4>
      <ul class="partnership-page__list">
        <li>to work under our brand;</li>
        <li>ready-made model, giving income;</li>
        <li>technical solutions for comfortable work;</li>
        <li>profitable conditions of cooperation;</li>
        <li>technical support by opening representative offices;</li>
        <li>24/7 support from our best specialists.</li>
      </ul>

      <UiTextH4 class="partnership-page__section-title">Agent program</UiTextH4>
      <UiTextParagraph class="partnership-page__intro">
        Get income from trading activity of involved customers! It is easy nowadays, thanks to dynamically growing
        number of Internet users. The most important priority of the Company Ester Holdings by that is high level of
        servicing quality and forming of long term relations. That is what will allow you not being a participant of the
        market Forex, to get constant income as commissions from trading activity of the involved members.
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__subtitle">How does it work?</UiTextH4>
      <ol class="partnership-page__list">
        <li>Bring new customers to us</li>
        <li>They are registered and will earn money</li>
        <li>You will get commissions from their profit</li>
      </ol>
      <strong>MORE CUSTOMERS – MORE PROFIT</strong>

      <UiTextH4 class="partnership-page__section-title">Franchising</UiTextH4>
      <UiTextParagraph class="partnership-page__intro">
        Partners of the company Ester Holdings receive comprehensive support and individual approach from the side of
        our experienced specialists. We can select solutions corresponding to your actual necessities and personal
        goals. Remember, that positive image and impeccable reputation of our Company also work for you.
      </UiTextParagraph>

      <UiTextParagraph class="partnership-page__intro">
        Franchising with Ester Holdings – is a opportunity to open an office of the company in your city and work under
        the brand of one of the biggest brokers in the world. You will get developed business technology and
        comprehensive support of our specialists.
      </UiTextParagraph>

      <UiTextH4 class="partnership-page__subtitle">Opening your business with Ester Holdings:</UiTextH4>
      <ul class="partnership-page__list">
        <li>Company receives spread by realizing trading operations. You will % of spread of your customers.</li>
        <li>Plus you will get all income from providing informational and advisory services, submitted in your office.
        </li>
      </ul>

      <UiTextH4 class="partnership-page__subtitle">How to do this?</UiTextH4>
      <ol class="partnership-page__list">
        <li>Send an application</li>
        <li>We select for you the best solution</li>
        <li>We help to introduce it</li>
        <li>Conduct training and give support</li>
      </ol>

      <div class="partnership-page__buttons">
        <UiButtonDefault state="warning">RECEIVE FRANCHISE</UiButtonDefault>
      </div>

    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

definePageMeta({
  layout: "main",
  alias: "/partnership",
});
</script>

<style lang="scss" scoped>
.partnership-page {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  &__title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }

  &__intro {
    color: var(--ui-text-main);
  }

  &__img {
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
    url("/static/partnershipBg.jpg") center / cover no-repeat;
    min-height: 500px;
    border-radius: 12px;
  }

  &__buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
  }


  &__subtitle,
  &__section-title {
    font-weight: 700;
    color: var(--ui-text-main);
  }

  &__list {
    padding-left: 20px;
    color: var(--ui-text-main);
    font-size: 14px;

    li {
      margin-bottom: 10px;
      color: inherit;
    }
  }
}
</style>