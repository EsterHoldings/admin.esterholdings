<template>
  <main class="landing">
    <SectionMain />
  </main>
</template>

<script lang="ts" setup>
import SectionMain from "./sections/MainSection";
definePageMeta({
  middleware: ["not-auth"],
  layout: "main",
});
</script>

<style lang="scss" scoped>
.landing {
  height: 100vh;
}
</style>
