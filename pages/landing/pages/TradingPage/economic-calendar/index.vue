<template>
  <UiContainer>
    <div class="economic-calendar">
      <UiTextH3 class="economic-calendar__title">Economic Calendar</UiTextH3>

      <div class="economic-calendar__img"></div>

      <iframe
          src="https://www.tradays.com/en/economic-calendar/widget?mode=2&utm_source=esterholdings.com"
          frameborder="0"
          width="100%"
          height="1000"
          scrolling="no"
          allowtransparency="true"
          class="economic-calendar__iframe"
      ></iframe>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
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
  display: flex;
  flex-direction: column;
  gap: 40px;

  &__title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }

  &__img {
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
    url("/static/economicCalendarBg.jpg") center / cover no-repeat;
    min-height: 500px;
    border-radius: 15px;
  }

  &__iframe {
    border: none;
    border-radius: 10px;
    width: 100%;
    min-height: 1000px;
  }
}
</style>