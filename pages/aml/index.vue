<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">AML Policy</UiTextH3>

      <div class="about-company_img"></div>

      <div class="about-company_text">
        <UiTextParagraph>
          <span>Money Laundering</span> — all procedures to conceal the origins of criminal proceeds to make them appear
          legitimate. Ester Holdings Ltd. aims to detect, manage and mitigate such risks.
        </UiTextParagraph>

        <UiTextParagraph>
          The Company continuously monitors exposure to money laundering and terrorism financing risks. Knowing the
          customer and understanding their instructions enables better risk assessment.
        </UiTextParagraph>
      </div>

      <UiTextH3 class="about-company_title">Customer Due Diligence</UiTextH3>
      <ul class="about-company_list">
        <li>Identify and verify individual and corporate customers using valid documentation.</li>
        <li>Collect personal or company details during registration at my.esterholdings.com.</li>
        <li>Require proof of identity and address via valid documents (passport, utility bill, etc.).</li>
        <li>Verify credit/debit card for transactions while masking sensitive data.</li>
        <li>Request source of funds/wealth in high-risk cases.</li>
        <li>Conduct ongoing monitoring for risk or unusual behavior.</li>
      </ul>

      <UiTextH3 class="about-company_title">Payments Policy</UiTextH3>
      <UiTextParagraph>
        Payments are regulated under the "Regulations for Non-Trading Operations," available on the Company Website
        under “Regulatory Documents and Agreements.”
      </UiTextParagraph>

      <UiTextH3 class="about-company_title">Personnel</UiTextH3>
      <h2 class="about-company_subtitle">AML Compliance Officer</h2>
      <ul class="about-company_list">
        <li>Ensures AML compliance and maintains internal AML programs.</li>
        <li>Establishes audit functions and reports breaches to the Board.</li>
        <li>Trains staff and investigates suspicious activities.</li>
        <li>Keeps proper AML records and monitors international AML developments.</li>
      </ul>

      <h2 class="about-company_subtitle">Employees</h2>
      <ul class="about-company_list">
        <li>Must know and comply with AML policy.</li>
        <li>Vetted at hiring with criminal checks and monitored during employment.</li>
        <li>Must report AML violations confidentially.</li>

   
      </ul>

      <UiTextH3 class="about-company_title">Employee Training</UiTextH3>
      <ul class="about-company_list">
        <li>Training provided internally or via external consultants.</li>
        <li>Each new employee follows a training plan with tests over 2–3 months.</li>
        <li>Content covers AML responsibilities, detection methods, and FATF typologies.</li>
        <li>Focus on identifying and reporting suspicious transactions without tipping off subjects.</li>
      </ul>
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
  alias: "/aml-policy",
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
    url("/static/aml.jpg") center / cover no-repeat;
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
    list-style: disc;
    padding-left: 20px;
    color: var(--ui-text-main);
    line-height: 24px;
    font-size: 15px;
  }
}
</style>