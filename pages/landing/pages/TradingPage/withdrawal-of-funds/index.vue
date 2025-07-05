<template>
  <div class="withdrawal-of-funds">
    <UiContainer>
      <UiTextH3 class="withdrawal-of-funds_title">Withdrawal of fundst</UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/withdrawal-of-funds",
});
</script>

<style lang="scss" scoped>
.withdrawal-of-funds {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
