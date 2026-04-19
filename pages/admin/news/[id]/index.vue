<template>
  <section class="admin-news-route">
    <NewsArticleEditor :article-id="articleId" />
  </section>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useRoute } from "vue-router";
  import NewsArticleEditor from "~/pages/admin/news/components/NewsArticleEditor.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const route = useRoute();
  const articleId = computed(() => String(route.params.id || ""));
</script>

<style scoped lang="scss">
  .admin-news-route {
    width: 100%;
    min-height: 100%;
  }
</style>
