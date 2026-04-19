<template>
  <div
    class="news-editor"
    :class="{ 'news-editor--busy': isSaving || isArchiving }">
    <div class="news-editor__header">
      <div class="news-editor__heading">
        <PrimeButton
          size="small"
          severity="secondary"
          text
          icon="pi pi-arrow-left"
          :label="t('admin.news.editor.back', 'Back to News')"
          @click="goBack" />

        <h1 class="news-editor__title">{{ form.title || t("admin.news.editor.untitled", "Untitled article") }}</h1>
        <p class="news-editor__subtitle">
          {{
            t(
              "admin.news.editor.pageSubtitle",
              "Use the article and SEO tabs to prepare the draft for publication."
            )
          }}
        </p>

        <div class="news-editor__meta">
          <PrimeTag
            :value="statusLabel(article?.effective_status || form.status)"
            :severity="statusSeverity(article?.effective_status || form.status)" />
          <PrimeTag
            :value="form.locale.toUpperCase()"
            severity="secondary" />
          <span>{{ formatDate(article?.updated_at || null, true) }}</span>
        </div>
      </div>

      <div class="news-editor__actions">
        <PrimeButton
          severity="secondary"
          outlined
          icon="pi pi-eye"
          :label="t('admin.news.actions.preview', 'Preview')"
          @click="isPreviewOpen = true" />
        <PrimeButton
          v-if="canDelete"
          severity="danger"
          outlined
          icon="pi pi-archive"
          :label="t('admin.news.actions.archive', 'Archive')"
          :loading="isArchiving"
          @click="handleArchive" />
        <PrimeButton
          v-if="canUpdate"
          severity="secondary"
          outlined
          :label="t('admin.news.actions.saveDraft', 'Save Draft')"
          :loading="isSaving"
          @click="persistArticle('draft')" />
        <PrimeButton
          v-if="canUpdate"
          severity="info"
          :label="t('admin.news.actions.schedule', 'Schedule')"
          :loading="isSaving"
          @click="persistArticle('scheduled')" />
        <PrimeButton
          v-if="canUpdate"
          icon="pi pi-send"
          :label="t('admin.news.actions.publishNow', 'Publish Now')"
          :loading="isSaving"
          @click="persistArticle('published')" />
      </div>
    </div>

    <div
      v-if="isLoading"
      class="news-editor__skeleton">
      <PrimeSkeleton
        v-for="item in 6"
        :key="item"
        height="72px"
        border-radius="18px" />
    </div>

    <div
      v-else-if="!article"
      class="news-editor-empty">
      <i class="pi pi-exclamation-circle"></i>
      <span>{{ t("admin.news.messages.loadOneFailed", "Failed to load article.") }}</span>
    </div>

    <PrimeTabs
      v-else
      v-model:value="activeTab"
      class="news-editor__tabs">
      <PrimeTabList>
        <PrimeTab value="content">
          <i class="pi pi-file-edit"></i>
          <span>{{ t("admin.news.editor.articleTab", "Article") }}</span>
        </PrimeTab>
        <PrimeTab value="seo">
          <i class="pi pi-search"></i>
          <span>{{ t("admin.news.editor.seoTab", "SEO") }}</span>
        </PrimeTab>
      </PrimeTabList>

      <PrimeTabPanels>
        <PrimeTabPanel value="content">
          <PrimeCard class="news-editor-card">
            <template #content>
              <div class="news-editor-card__head">
                <h2>{{ t("admin.news.editor.articleTab", "Article") }}</h2>
                <p>
                  {{
                    t(
                      "admin.news.editor.articleSubtitle",
                      "Control title, slug, content, media and publication timing from one wide workspace."
                    )
                  }}
                </p>
              </div>

              <div class="news-editor-form-grid">
                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.fields.title", "Title") }}</span>
                  <PrimeInputText
                    v-model="form.title"
                    :placeholder="t('admin.news.placeholders.title', 'Market outlook: what traders watch today')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                  <PrimeSelect
                    v-model="form.locale"
                    :options="localeOptions"
                    option-label="label"
                    option-value="value" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.fields.slug", "Slug") }}</span>
                  <PrimeInputText
                    v-model="form.slug"
                    :placeholder="t('admin.news.placeholders.slug', 'market-outlook')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.fields.publishedAt", "Publication date") }}</span>
                  <PrimeDatePicker
                    v-model="publishedAtDate"
                    show-time
                    hour-format="24"
                    fluid />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.fields.excerpt", "Excerpt") }}</span>
                  <PrimeTextarea
                    v-model="form.excerpt"
                    rows="3"
                    auto-resize
                    :placeholder="t('admin.news.placeholders.excerpt', 'Short article summary for cards and previews')" />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.fields.content", "Content") }}</span>
                  <PrimeTextarea
                    v-model="form.content"
                    rows="18"
                    class="news-editor__content-input"
                    :placeholder="
                      t('admin.news.placeholders.content', 'The article body will appear here in markdown format')
                    " />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.fields.coverImage", "Cover image URL") }}</span>
                  <PrimeInputText
                    v-model="form.cover_image_url"
                    :placeholder="t('admin.news.placeholders.coverImage', 'https://example.com/image.jpg')" />
                </label>

                <div
                  v-if="form.cover_image_url"
                  class="news-editor__cover">
                  <img
                    :src="form.cover_image_url"
                    alt="cover preview"
                    class="news-editor__cover-image" />
                </div>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.fields.galleryImages", "Gallery images") }}</span>
                  <PrimeTextarea
                    v-model="galleryImagesInput"
                    rows="5"
                    :placeholder="t('admin.news.placeholders.galleryImages', 'One URL per line')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.fields.videoLinks", "Video links") }}</span>
                  <PrimeTextarea
                    v-model="videoLinksInput"
                    rows="5"
                    :placeholder="t('admin.news.placeholders.videoLinks', 'One URL per line')" />
                </label>
              </div>
            </template>
          </PrimeCard>
        </PrimeTabPanel>

        <PrimeTabPanel value="seo">
          <PrimeCard class="news-editor-card">
            <template #content>
              <div class="news-editor-card__head">
                <h2>{{ t("admin.news.seoTitle", "SEO settings") }}</h2>
                <p>
                  {{
                    t(
                      "admin.news.editor.seoSubtitle",
                      "Tune metadata, canonical URLs and social cards without mixing them into the article form."
                    )
                  }}
                </p>
              </div>

              <div class="news-editor-form-grid">
                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.metaTitle", "Meta title") }}</span>
                  <PrimeInputText v-model="seo.meta_title" />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.metaDescription", "Meta description") }}</span>
                  <PrimeTextarea
                    v-model="seo.meta_description"
                    rows="3"
                    auto-resize />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.metaKeywords", "Meta keywords") }}</span>
                  <PrimeInputText
                    v-model="metaKeywordsInput"
                    :placeholder="t('admin.news.placeholders.metaKeywords', 'forex, market outlook, ECB')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.seo.canonicalUrl", "Canonical URL") }}</span>
                  <PrimeInputText v-model="seo.canonical_url" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.seo.robots", "Robots") }}</span>
                  <PrimeInputText
                    v-model="seo.robots"
                    :placeholder="t('admin.news.placeholders.robots', 'index,follow')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.seo.schemaType", "Schema type") }}</span>
                  <PrimeInputText
                    v-model="seo.schema_type"
                    :placeholder="t('admin.news.placeholders.schemaType', 'NewsArticle')" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.seo.ogTitle", "Open Graph title") }}</span>
                  <PrimeInputText v-model="seo.og_title" />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.ogDescription", "Open Graph description") }}</span>
                  <PrimeTextarea
                    v-model="seo.og_description"
                    rows="3"
                    auto-resize />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.ogImageUrl", "Open Graph image") }}</span>
                  <PrimeInputText v-model="seo.og_image_url" />
                </label>

                <label class="news-editor-field">
                  <span>{{ t("admin.news.seo.twitterTitle", "Twitter title") }}</span>
                  <PrimeInputText v-model="seo.twitter_title" />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.twitterDescription", "Twitter description") }}</span>
                  <PrimeTextarea
                    v-model="seo.twitter_description"
                    rows="3"
                    auto-resize />
                </label>

                <label class="news-editor-field news-editor-field--full">
                  <span>{{ t("admin.news.seo.twitterImageUrl", "Twitter image") }}</span>
                  <PrimeInputText v-model="seo.twitter_image_url" />
                </label>
              </div>
            </template>
          </PrimeCard>
        </PrimeTabPanel>
      </PrimeTabPanels>
    </PrimeTabs>

    <NewsPreviewModal
      v-model="isPreviewOpen"
      :article="previewPayload"
      :showEditButton="false"
      @edit="() => undefined" />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import type {
    AdminNewsArticle,
    NewsSeoPayload,
    UpsertNewsArticlePayload,
  } from "~/composables/core/modules/news/news.types";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import NewsPreviewModal from "~/pages/admin/news/components/NewsPreviewModal.vue";

  type EditorTab = "content" | "seo";
  type PersistStatus = "draft" | "scheduled" | "published";

  const props = defineProps<{
    articleId: string;
  }>();

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t } = useI18n({ useScope: "global" });

  const activeTab = ref<EditorTab>("content");
  const article = ref<AdminNewsArticle | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isArchiving = ref(false);
  const isPreviewOpen = ref(false);
  const galleryImagesInput = ref("");
  const videoLinksInput = ref("");
  const metaKeywordsInput = ref("");
  const publishedAtInput = ref("");

  const form = reactive({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    locale: "en",
    cover_image_url: "",
    status: "draft" as PersistStatus,
  });

  const seo = reactive<Required<NewsSeoPayload>>({
    meta_title: "",
    meta_description: "",
    meta_keywords: [],
    canonical_url: "",
    robots: "",
    og_title: "",
    og_description: "",
    og_image_url: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image_url: "",
    schema_type: "",
  });

  const canUpdate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-news")
  );
  const canDelete = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-news")
  );

  const localeOptions = computed(() => [
    { label: "English", value: "en" },
    { label: "Русский", value: "ru" },
    { label: "Українська", value: "uk" },
    { label: "Deutsch", value: "de" },
    { label: "Español", value: "es" },
    { label: "Français", value: "fr" },
    { label: "Italiano", value: "it" },
    { label: "Português", value: "pt" },
    { label: "Türkçe", value: "tr" },
    { label: "עברית", value: "he" },
    { label: "हिन्दी", value: "hi" },
    { label: "日本語", value: "ja" },
    { label: "한국어", value: "ko" },
    { label: "中文", value: "zh" },
  ]);

  const publishedAtDate = computed<Date | null>({
    get() {
      if (!publishedAtInput.value) return null;
      const date = new Date(publishedAtInput.value);
      return Number.isNaN(date.getTime()) ? null : date;
    },
    set(value) {
      publishedAtInput.value = value ? toDatetimeLocalValue(value.toISOString()) : "";
    },
  });

  const previewPayload = computed<AdminNewsArticle | null>(() => {
    if (!article.value) {
      return null;
    }

    return {
      ...article.value,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      locale: form.locale,
      cover_image_url: form.cover_image_url || null,
      gallery_images: parseMultiline(galleryImagesInput.value),
      video_links: parseMultiline(videoLinksInput.value),
      status: form.status,
      seo: buildSeoPayload(),
      effective_status: article.value.effective_status || form.status,
      published_at: publishedAtInput.value ? new Date(publishedAtInput.value).toISOString() : null,
    };
  });

  function applySeo(value: NewsSeoPayload | null | undefined): void {
    seo.meta_title = value?.meta_title || "";
    seo.meta_description = value?.meta_description || "";
    seo.meta_keywords = Array.isArray(value?.meta_keywords) ? value?.meta_keywords.filter(Boolean) : [];
    seo.canonical_url = value?.canonical_url || "";
    seo.robots = value?.robots || "";
    seo.og_title = value?.og_title || "";
    seo.og_description = value?.og_description || "";
    seo.og_image_url = value?.og_image_url || "";
    seo.twitter_title = value?.twitter_title || "";
    seo.twitter_description = value?.twitter_description || "";
    seo.twitter_image_url = value?.twitter_image_url || "";
    seo.schema_type = value?.schema_type || "";
    metaKeywordsInput.value = seo.meta_keywords.join(", ");
  }

  function applyArticle(value: AdminNewsArticle): void {
    article.value = value;
    form.title = value.title || "";
    form.slug = value.slug || "";
    form.excerpt = value.excerpt || "";
    form.content = value.content || "";
    form.locale = value.locale || "en";
    form.cover_image_url = value.cover_image_url || "";
    form.status = value.status;
    galleryImagesInput.value = (value.gallery_images || []).join("\n");
    videoLinksInput.value = (value.video_links || []).join("\n");
    publishedAtInput.value = toDatetimeLocalValue(value.published_at);
    applySeo(value.seo);
  }

  async function loadArticle(): Promise<void> {
    isLoading.value = true;

    try {
      const response = await appCore.news.getById(props.articleId);
      applyArticle(response.data.data as AdminNewsArticle);
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.loadOneFailed", "Failed to load article.")));
      article.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  function buildSeoPayload(): NewsSeoPayload {
    return {
      meta_title: seo.meta_title || null,
      meta_description: seo.meta_description || null,
      meta_keywords: parseCommaSeparated(metaKeywordsInput.value),
      canonical_url: seo.canonical_url || null,
      robots: seo.robots || null,
      og_title: seo.og_title || null,
      og_description: seo.og_description || null,
      og_image_url: seo.og_image_url || null,
      twitter_title: seo.twitter_title || null,
      twitter_description: seo.twitter_description || null,
      twitter_image_url: seo.twitter_image_url || null,
      schema_type: seo.schema_type || null,
    };
  }

  function buildPayload(status: PersistStatus): UpsertNewsArticlePayload {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      locale: form.locale,
      cover_image_url: form.cover_image_url.trim() || null,
      gallery_images: parseMultiline(galleryImagesInput.value),
      video_links: parseMultiline(videoLinksInput.value),
      status,
      published_at: publishedAtInput.value ? new Date(publishedAtInput.value).toISOString() : null,
      seo: buildSeoPayload(),
      meta: article.value?.meta || {},
    };
  }

  async function persistArticle(status: PersistStatus): Promise<void> {
    if (!article.value || !canUpdate.value) {
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      toast.error(t("admin.news.messages.editorRequired", "Title and content are required."));
      return;
    }

    if (status === "scheduled" && !publishedAtInput.value) {
      toast.error(t("admin.news.messages.scheduleRequired", "Pick the publication date and time first."));
      return;
    }

    isSaving.value = true;

    try {
      const response = await appCore.news.update(article.value.id, buildPayload(status));
      applyArticle(response.data.data as AdminNewsArticle);
      toast.success(response.data.message || t("admin.news.messages.saved", "News article saved."));
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.saveFailed", "Failed to save news article.")));
    } finally {
      isSaving.value = false;
    }
  }

  async function handleArchive(): Promise<void> {
    if (!article.value || !canDelete.value) {
      return;
    }

    isArchiving.value = true;

    try {
      const response = await appCore.news.delete(article.value.id);
      toast.success(response.data.message || t("admin.news.messages.deleted", "News article archived."));
      await navigateTo(localePath("/news"));
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.deleteFailed", "Failed to archive article.")));
    } finally {
      isArchiving.value = false;
    }
  }

  function goBack(): void {
    navigateTo(localePath("/news"));
  }

  function statusLabel(status: string): string {
    return (
      {
        draft: t("admin.news.statuses.draft", "Draft"),
        scheduled: t("admin.news.statuses.scheduled", "Scheduled"),
        published: t("admin.news.statuses.published", "Published"),
        archived: t("admin.news.statuses.archived", "Archived"),
      }[status] || status
    );
  }

  function statusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" {
    if (status === "published") return "success";
    if (status === "scheduled") return "warn";
    if (status === "archived") return "danger";
    if (status === "draft") return "info";
    return "secondary";
  }

  function formatDate(value: string | null | undefined, withTime = false): string {
    if (!value) {
      return t("admin.news.noDate", "No date");
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(new Date(value));
  }

  function resolveApiErrorMessage(error: any, fallback: string): string {
    return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
  }

  function parseMultiline(value: string): string[] {
    return value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function parseCommaSeparated(value: string): string[] {
    return value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function toDatetimeLocalValue(value: string | null | undefined): string {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  watch(
    () => props.articleId,
    () => {
      loadArticle();
    },
    { immediate: true }
  );
</script>

<style scoped lang="scss">
  .news-editor {
    --news-editor-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
    --news-editor-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
    --news-editor-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    --news-editor-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

    position: relative;
    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 1.35vw, 22px);
    color: var(--ui-text-main);
    animation: news-editor-enter 0.28s ease both;
  }

  .news-editor--busy::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    border-radius: 24px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ui-primary-main) 7%, transparent), transparent);
    animation: news-editor-sheen 1.35s ease infinite;
  }

  .news-editor__header,
  .news-editor__actions,
  .news-editor__meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .news-editor__header {
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .news-editor__heading {
    min-width: 0;
  }

  .news-editor__title {
    margin: 8px 0 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .news-editor__subtitle,
  .news-editor__meta,
  .news-editor-card__head p {
    color: var(--ui-text-secondary);
  }

  .news-editor__subtitle,
  .news-editor-card__head p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.45;
  }

  .news-editor__meta {
    margin-top: 12px;
    flex-wrap: wrap;
    font-size: 12px;
  }

  .news-editor__actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .news-editor__skeleton {
    display: grid;
    gap: 10px;
  }

  .news-editor-empty,
  .news-editor-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid var(--news-editor-glass-border);
    border-radius: 22px;
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 10%, transparent), transparent 38%),
      linear-gradient(145deg, var(--news-editor-glass-bg), var(--news-editor-glass-bg-strong));
    box-shadow: var(--news-editor-glass-shadow);
    backdrop-filter: blur(22px) saturate(135%);
    -webkit-backdrop-filter: blur(22px) saturate(135%);
  }

  .news-editor-card :deep(.p-card-body) {
    padding: 0;
  }

  .news-editor-card :deep(.p-card-content) {
    padding: 14px;
  }

  .news-editor-empty {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .news-editor-empty i {
    color: var(--ui-primary-main);
    font-size: 28px;
  }

  .news-editor__tabs {
    :deep(.p-tablist),
    :deep(.p-tabpanels) {
      background: transparent;
    }

    :deep(.p-tablist-tab-list) {
      gap: 8px;
      border: 0;
      background: transparent;
    }

    :deep(.p-tab) {
      gap: 8px;
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid var(--news-editor-glass-border);
      border-radius: 999px;
      color: var(--ui-text-secondary);
      background: var(--news-editor-glass-bg);
      font-weight: 750;
    }

    :deep(.p-tab-active) {
      color: #ffffff;
      border-color: color-mix(in srgb, var(--ui-primary-main) 48%, var(--color-stroke-ui-light));
      background: var(--ui-primary-main);
    }

    :deep(.p-tabpanels) {
      padding: 12px 0 0;
    }
  }

  .news-editor-card__head {
    margin-bottom: 14px;
  }

  .news-editor-card__head h2 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(19px, 1.5vw, 26px);
    font-weight: 840;
    line-height: 1.12;
    letter-spacing: -0.025em;
  }

  .news-editor-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .news-editor-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 780;
  }

  .news-editor-field--full,
  .news-editor__cover {
    grid-column: 1 / -1;
  }

  .news-editor__content-input {
    width: 100%;

    :deep(textarea) {
      min-height: 390px;
      font-size: 14px;
      line-height: 1.65;
    }
  }

  .news-editor__cover {
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid var(--news-editor-glass-border);
    background: color-mix(in srgb, var(--ui-background-card) 88%, transparent);
  }

  .news-editor__cover-image {
    display: block;
    width: 100%;
    max-height: 360px;
    object-fit: cover;
  }

  @keyframes news-editor-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes news-editor-sheen {
    from {
      transform: translateX(-70%);
    }
    to {
      transform: translateX(70%);
    }
  }

  @media (max-width: 920px) {
    .news-editor-form-grid {
      grid-template-columns: 1fr;
    }

    .news-editor__header,
    .news-editor__actions {
      width: 100%;
    }

    .news-editor__actions :deep(.p-button) {
      flex: 1;
    }
  }

  @media (max-width: 640px) {
    .news-editor {
      padding: 10px;
    }
  }
</style>
