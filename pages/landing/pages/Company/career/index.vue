<template>
  <UiContainer>
    <div class="career">
      <UiTextH3 class="career_title">Career</UiTextH3>

      <div class="career_img"></div>

      <UiTextH5 class="career_subtitle"
        >At the present moment the company is seeking the following
        specialists:</UiTextH5
      >

      <ul class="career_list">
        <li>SALES MANAGER</li>
        <li>HEADMASTER OF THE DEPARTMENT OF ANALYTICS</li>
      </ul>

      <UiTextH5
        >IF YOU ARE READY TO DYNAMIC GROWTH, YOU ARE AMBITIOUS AND TALENTLY,
        SEND YOUR SUMMARY.</UiTextH5
      >

      <div>
        <UiButtonDefault>SEND CV</UiButtonDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

definePageMeta({
  layout: "main",
  alias: "/career",
});
</script>

<style lang="scss" scoped>
.career {
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
    color: var(--ui-text-main);
  }

  &_img {
    background: linear-gradient(rgba(21, 21, 21, 0.6), rgba(21, 21, 21, 0.6)),
      url("/static/careerBg.jpg") center / cover no-repeat;
    min-height: 500px;
    border-radius: 15px;
  }

  &_list {
    color: var(--ui-text-main);
    padding-left: 10px;
    li {
      margin-bottom: 15px;
      font-weight: 700;
    }
  }

  h5 {
    color: var(--ui-text-main);
  }
}
</style>
