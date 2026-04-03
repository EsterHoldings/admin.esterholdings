<template>
  <UiContainer fluid>
    <div class="admin-news-page__header">
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.news.editor.pageTitle", "News Editor") }}</UiTextH4>
        <UiTextParagraph>
          {{
            t(
              "admin.news.editor.pageSubtitle",
              "Use the article and SEO tabs to prepare the draft for publication without collapsing everything into one narrow column."
            )
          }}
        </UiTextParagraph>
      </div>
    </div>

    <div class="admin-news-page__content">
      <NewsArticleEditor :article-id="articleId" />
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useRoute } from "vue-router";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import NewsArticleEditor from "~/pages/admin/news/components/NewsArticleEditor.vue";
  import { useI18n } from "vue-i18n";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
  const route = useRoute();
  const articleId = computed(() => String(route.params.id || ""));
</script>

<style scoped lang="scss">
  .admin-news-page__header {
    margin: 8px 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .admin-news-page__content {
    width: 100%;
  }
</style>
