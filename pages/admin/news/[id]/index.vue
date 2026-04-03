<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.news.title", "AI News Studio") }}</UiTextH4>
        <UiTextParagraph>
          {{ t("admin.news.subtitle", "Generate, edit, chat and schedule news drafts from one workspace.") }}
        </UiTextParagraph>
      </div>
    </template>

    <template #content>
      <NewsStudio :article-id="articleId" />
    </template>
  </PageStructureDefault>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useRoute } from "vue-router";
  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import NewsStudio from "~/pages/admin/news/components/NewsStudio.vue";
  import { useI18n } from "vue-i18n";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
  const route = useRoute();
  const articleId = computed(() => String(route.params.id || ""));
</script>
