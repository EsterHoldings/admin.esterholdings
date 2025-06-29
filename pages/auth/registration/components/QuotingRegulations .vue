<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">Quoting Regulations</UiTextH3>

      <div class="about-company_text">
        <UiTextParagraph>
          The quoting regulations define key procedures and principles for trading operations conducted by customers of
          Ester Holdings Inc.
        </UiTextParagraph>

        <ul class="about-company_list">
          <li>Terms used in trading operations of the customer;</li>
          <li>Principles of margin trading;</li>
          <li>Rules of position opening/closing, arrangement/removal, changing and fulfillment of pending orders;</li>
          <li>Customer authorization process, and logging of operations within the MetaTrader 4 trading system;</li>
          <li>Procedure for dispute resolution, etc.</li>
        </ul>

        <UiTextParagraph>
          Here you can download the full quoting regulations document.
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
  alias: "/quoting-regulations",
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