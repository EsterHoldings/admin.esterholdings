<template>
  <div class="economic-calendar">
    <UiContainer>
      <UiTextH3 class="economic-calendar_title"> Economic calendar </UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/economic-calendar",
});
</script>

<style lang="scss" scoped>
.economic-calendar {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
