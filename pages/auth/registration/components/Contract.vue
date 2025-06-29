<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">Contract</UiTextH3>

      <div class="about-company_text">
        <UiTextParagraph>
          <span>Rules of cooperation</span> — the contract outlines the framework for interaction between the customer
          and Ester Holdings Inc. It defines the obligations and liabilities of both parties.
        </UiTextParagraph>

        <UiTextParagraph>
          The contract ensures clear terms for the fulfillment of obligations from both sides in the cooperation
          process.
        </UiTextParagraph>

        <UiTextParagraph>
          <strong>Here you can download</strong> the full contract document.
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
  alias: "/quoting-contract",
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
        color: #138ee7;
      }
    }
  }
}
</style>