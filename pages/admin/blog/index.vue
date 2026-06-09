<template>
  <section class="admin-blog-route">
    <NewsStudio
      article-type="trader_blog"
      base-route="/blog" />
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
  .admin-blog-route {
    width: 100%;
    min-height: 100%;
    padding: 1rem;
  }
</style>
