<template>
  <UiContainer fluid>
    <div class="admin-news-page__header">
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.news.title", "AI News Studio") }}</UiTextH4>
        <UiTextParagraph>
          {{ t("admin.news.subtitle", "Generate, edit, chat and schedule news drafts from one workspace.") }}
        </UiTextParagraph>
      </div>
    </div>

    <div class="admin-news-page__content">
      <NewsStudio />
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { definePageMeta } from "~/.nuxt/imports";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import NewsStudio from "~/pages/admin/news/components/NewsStudio.vue";
  import { useI18n } from "vue-i18n";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
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
