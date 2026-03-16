<template>
  <UiContainer>
    <div class="admin-news-page">
      <UiTextH4 class="admin-news-page__title">
        {{ t("admin.menu.news") }}
      </UiTextH4>
      <UiTextParagraph class="admin-news-page__subtitle">
        {{ t("admin.news.placeholder", "This section is being prepared and will be available soon.") }}
      </UiTextParagraph>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });
</script>

<style scoped lang="scss">
.admin-news-page {
  padding: 20px;
  color: var(--ui-text-main);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__subtitle {
    color: var(--ui-text-secondary);
  }
}
</style>
