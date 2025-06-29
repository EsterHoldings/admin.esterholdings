<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">Risks Statement</UiTextH3>

      <div class="about-company_text">
        <UiTextParagraph>
          <span>Risk statement of investment activity on financial markets and deals using Forex and CFD tools.</span>
          Past investment results are not a guarantee of future profits.
        </UiTextParagraph>

        <UiTextParagraph>
          Trading on financial markets with margin instruments offers broad opportunities for risk-tolerant investors
          but also carries a high risk of loss. Before trading, clients must responsibly define their investment
          strategy based on their available resources.
        </UiTextParagraph>

        <UiTextParagraph>
          This notice does not cover all risks related to investments in margin financial instruments. For additional
          questions, clients should contact advisors of Ester Holdings Inc.
        </UiTextParagraph>

        <UiTextH3 class="about-company_title">Noting of Risks</UiTextH3>

        <UiTextParagraph>
          This notification presents general yet substantial information about the risks involved in Forex and CFD
          markets to help clients avoid potential losses.
        </UiTextParagraph>

        <UiTextParagraph>
          Due to the complexity of financial markets, this list is not exhaustive and does not disclose all possible
          investment risks.
        </UiTextParagraph>

        <UiTextParagraph>
          Investments using leverage may lead to full or partial loss of not only expected profits but also invested
          capital.
        </UiTextParagraph>

        <UiTextParagraph>
          This statement aims to help clients understand risks—not to discourage participation, but to support informed
          and responsible decisions.
        </UiTextParagraph>

        <UiTextH3 class="about-company_title">Risk Classification</UiTextH3>

        <UiTextH3 class="about-company_subtitle">By Sources of Arising</UiTextH3>
        <ul class="about-company_list">
          <li><strong>System Risk:</strong> Political, legislative, macroeconomic or force majeure events.</li>
          <li><strong>Non-System Risk:</strong> Risks related to a specific market participant.</li>
        </ul>

        <UiTextH3 class="about-company_subtitle">By Risk Factors</UiTextH3>
        <ul class="about-company_list">
          <li><strong>Economic Risk:</strong> Price, currency, interest, inflation, liquidity, and legal risks.</li>
          <li><strong>Social/Political Risk:</strong> Instability, military conflict, or major strikes.</li>
          <li><strong>Criminal Risk:</strong> Fraud, hacking, or unauthorized access.</li>
          <li><strong>Operational Risk:</strong> Technical failures or staff errors.</li>
          <li><strong>Nature Risk:</strong> Natural disasters.</li>
          <li><strong>Technological Risk:</strong> Accidents caused by human activities.</li>
        </ul>

        <UiTextH3 class="about-company_subtitle">By Economic Effect</UiTextH3>
        <ul class="about-company_list">
          <li>Loss of profit.</li>
          <li>Loss of invested capital.</li>
        </ul>

        <UiTextH3 class="about-company_subtitle">By Client Connection</UiTextH3>
        <ul class="about-company_list">
          <li><strong>Direct Risk:</strong> Source directly tied to the client.</li>
          <li><strong>Implied Risk:</strong> Source not directly tied, but indirectly affecting the client.</li>
        </ul>

        <UiTextH3 class="about-company_title">Additional Forex/CFD Risks</UiTextH3>
        <ul class="about-company_list">
          <li>Small price changes can significantly impact account balance due to leverage.</li>
          <li>Rapid market movements can cause stop-orders to fail or trigger at worse prices.</li>
          <li>The Company may act on behalf of third parties or its own interest, which may create conflicts.</li>
          <li>The Company does not guarantee profit and does not offer warranties of returns.</li>
        </ul>

        <UiTextParagraph>
          Clients independently choose their investment strategy and must assess whether they can accept the risks.
          Market conditions may lead to financial loss. Past performance of others does not ensure future success.
        </UiTextParagraph>

        <UiTextParagraph>
          This document helps clients evaluate risk, define personal financial goals, and make informed decisions about
          investment strategy.
        </UiTextParagraph>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

definePageMeta({
  layout: "main",
  alias: "/risks-statement",
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
    }
  }

  &_list {
    list-style: disc;
    padding-left: 20px;
    color: var(--ui-text-main);
    line-height: 24px;
    font-size: 15px;
  }
}
</style>