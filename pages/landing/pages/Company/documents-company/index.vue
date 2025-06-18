<template>
  <UiContainer>
    <div class="documents">
      <UiTextH3 class="documents_title">Documents</UiTextH3>

      <div class="documents_img"></div>
      <UiTextH5 class="documents_subtitle">
        All interaction process with Ester Holdings Inc. is regulated by
        standard documents
      </UiTextH5>

      <UiTextH3 class="documents_subtitle">QUOTES REGULATIONS</UiTextH3>
      <UiTextH5 class="documents_subtitle"> Regulations fix: </UiTextH5>

      <ul class="documents_list">
        <li>terms, used in trading operations of the customer;</li>
        <li>principles of margin trading;</li>
        <li>
          rules of positions opening/closing, arrangement/removal, changing and
          fulfillment of pending orders;
        </li>
        <li>
          order of the customer authorization, as well as order of protocolling
          of Customer operations in the trading system MetaTrader 4;
        </li>
        <li>procedure for setting disputes, etc.</li>
      </ul>

      <div class="documents_actions">
        <UiButtonDefault>DOWNLOAD</UiButtonDefault>
      </div>

      <UiTextH3 class="documents_subtitle">Contract</UiTextH3>
      <UiTextH5 class="documents_subtitle">
        Contract contain rules of cooperation of the customer and Ester Holdings
        Inc. Parties liabilities as for fulfillment of their obligations are
        defined in it.
      </UiTextH5>

      <div class="documents_actions">
        <UiButtonDefault>DOWNLOAD</UiButtonDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

definePageMeta({
  layout: "main",
  alias: "/documents",
});
</script>

<style lang="scss" scoped>
.documents {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
  }

  &_subtitle {
    color: var(--ui-text-main);
  }

  &_img {
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
      url("/static/documentsBg.jpeg") center / cover no-repeat;
    min-height: 500px;
    border-radius: 15px;
  }

  &_list {
    padding-left: 10px;
    color: var(--ui-text-main);

    li {
      margin-bottom: 10px;
    }
  }
}
</style>
