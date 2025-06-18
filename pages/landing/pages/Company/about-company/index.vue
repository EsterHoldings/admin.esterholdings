<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">About the company </UiTextH3>

      <div class="about-company_img"></div>

      <div class="about-company_text">
        <UiTextParagraph>
          <span>The International financial holding Ester Holdings Inc.</span>

          — is a stable company highly efficient management.
        </UiTextParagraph>

        <UiTextParagraph>
          Company Ester, opened for everything new, is a leader in forming and
          supporting high standards of work for all financial market.
          <strong> Our peculiarity</strong> — profitable trading conditions,
          high quality of servicing and legal security.
        </UiTextParagraph>

        <UiTextParagraph>
          In the first place company puts successful activity of its customers.
          It is the main criteria of our success.<strong>
            Mission of the company Ester</strong
          >
          — to provide its customers with knowledge and advisory services which
          guarantee them welfare. We are the universal financial company, which
          supports high quality of our work on a stable base.
        </UiTextParagraph>
      </div>

      <UiTextH3 class="about-company_title">Business-model</UiTextH3>
      <h2 class="about-company_subtitle">
        Business-model of the company is built on transparent and trusting
        relationships with a client.
      </h2>

      <ul class="about-company_list">
        <li>
          The company receives quotes on ECN-platforms from the leading
          banks-suppliers of liquidity and from the best prices forms quotes
          currents for customers.
        </li>
        <li>
          In the trading terminal a customer can see and trade at the best
          prices bid and ask by each financial tool.
        </li>
        <li>
          As a result of customer’s order the prices of that supplier of
          liquidity are executed, who offers at the present moment the best
          price of purchase or sale.
        </li>
        <li>
          Our Prime Broker makes clearing (mutual recognition of liabilities)
          between the Company and banks-suppliers of liquidity.
        </li>
      </ul>

      <UiTextH3 class="about-company_title">Activity area </UiTextH3>

      <ul class="about-company_list">
        <li>
          Providing access to the customers to conduct trading operations with
          foreign currencies and other financial tools through Internet.
        </li>
        <li>
          Consultations on issues of management of investors assets and
          investment activity.
        </li>
        <li>Informational and analytical services.</li>
        <li>Qualified trading training.</li>
      </ul>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

definePageMeta({
  layout: "main",
  alias: "/about-company",
});
</script>

<style lang="scss" scoped>
.about-company {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }

  &_subtitle {
    font-weight: 700;
    font-size: 14px;
    color: #138ee7;
  }

  &_img {
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
      url("/static/aboutCompany.jpeg") center / cover no-repeat;
    min-height: 500px;
    border-radius: 15px;
  }

  &_text {
    display: flex;
    flex-direction: column;
    gap: 20px;

    p {
      color: var(--ui-text-main);
      line-height: 25px;

      span {
        font-weight: 700;
        color: #138ee7;
      }

      strong {
        font-weight: 700;
      }
    }
  }

  &_list {
    color: var(--ui-text-main);
    padding-left: 10px;
    font-size: 14px;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: repeat(2, 200px);
    gap: 30px;
  }
}
</style>
