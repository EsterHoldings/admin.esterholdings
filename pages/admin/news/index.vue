<template>
  <section class="admin-news-route">
    <NewsStudio />
  </section>
</template>

<script setup lang="ts">
  import { definePageMeta } from "~/.nuxt/imports";
  import NewsStudio from "~/pages/admin/news/components/NewsStudio.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });
</script>

<style scoped lang="scss">
  .admin-news-route {
    width: 100%;
    min-height: 100%;
  }
</style>
