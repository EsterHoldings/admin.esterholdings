<template>
  <div class="news-editor">
    <aside class="news-editor__tabs">
      <TabsAsList
        :tabsList="editorTabs"
        :activeTabIndex="activeTabIndex"
        @selectTab="handleSelectTab" />
    </aside>

    <section class="news-editor__panel">
      <div class="news-editor__header">
        <div class="news-editor__header-copy">
          <button
            type="button"
            class="news-editor__back"
            @click="goBack">
            {{ t("admin.news.editor.back", "Back to News") }}
          </button>

          <div class="news-editor__eyebrow">{{ t("admin.news.editor.label", "Article Editor") }}</div>
          <h2 class="news-editor__title">{{ form.title || t("admin.news.editor.untitled", "Untitled article") }}</h2>
          <div class="news-editor__meta">
            <span
              class="news-editor__status-pill"
              :data-status="article?.effective_status || form.status">
              {{ statusLabel(article?.effective_status || form.status) }}
            </span>
            <span class="news-editor__status-pill">{{ form.locale.toUpperCase() }}</span>
            <span class="news-editor__status-pill">{{ formatDate(article?.updated_at || null, true) }}</span>
          </div>
        </div>

        <div class="news-editor__actions">
          <UiButtonDefault
            state="info--outline"
            @click="isPreviewOpen = true">
            <template #icon-left>
              <UiIconEye />
            </template>
            {{ t("admin.news.actions.preview", "Preview") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canDelete"
            state="danger--outline"
            :disabled="isArchiving"
            @click="handleArchive">
            {{ t("admin.news.actions.archive", "Archive") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canUpdate"
            state="secondary"
            :disabled="isSaving"
            @click="persistArticle('draft')">
            {{ t("admin.news.actions.saveDraft", "Save Draft") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canUpdate"
            state="success"
            :disabled="isSaving"
            @click="persistArticle('published')">
            {{ t("admin.news.actions.publishNow", "Publish Now") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canUpdate"
            state="info"
            :disabled="isSaving"
            @click="persistArticle('scheduled')">
            {{ t("admin.news.actions.schedule", "Schedule") }}
          </UiButtonDefault>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="news-editor__state">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else-if="!article"
        class="news-editor__state">
        <UiIconNews />
        <span>{{ t("admin.news.messages.loadOneFailed", "Failed to load article.") }}</span>
      </div>

      <div
        v-else
        class="news-editor__content">
        <div
          v-if="activeTab === 'content'"
          class="news-editor__card">
          <div class="news-editor__section">
            <div class="news-editor__section-title">{{ t("admin.news.editor.articleTab", "Article") }}</div>
            <div class="news-editor__section-subtitle">
              {{
                t(
                  "admin.news.editor.articleSubtitle",
                  "Control title, slug, content, media and publication timing from one wide workspace."
                )
              }}
            </div>
          </div>

          <div class="news-editor__grid">
            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.fields.title", "Title") }}</span>
              <input
                v-model="form.title"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.title', 'Generated title will appear here')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.fields.locale", "Language") }}</span>
              <select
                v-model="form.locale"
                class="news-editor__select">
                <option value="en">EN</option>
                <option value="ru">RU</option>
                <option value="uk">UK</option>
              </select>
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.fields.slug", "Slug") }}</span>
              <input
                v-model="form.slug"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.slug', 'news-slug')" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.fields.excerpt", "Excerpt") }}</span>
              <textarea
                v-model="form.excerpt"
                rows="4"
                class="news-editor__textarea"
                :placeholder="t('admin.news.placeholders.excerpt', 'Short article summary for cards and previews')" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.fields.content", "Content") }}</span>
              <textarea
                v-model="form.content"
                rows="18"
                class="news-editor__textarea news-editor__textarea--content"
                :placeholder="
                  t('admin.news.placeholders.content', 'The article body will appear here in markdown format')
                " />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.fields.coverImage", "Cover image URL") }}</span>
              <input
                v-model="form.cover_image_url"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.coverImage', 'https://...')" />
            </label>

            <div
              v-if="form.cover_image_url"
              class="news-editor__cover">
              <img
                :src="form.cover_image_url"
                alt="cover preview"
                class="news-editor__cover-image" />
            </div>

            <label class="news-editor__field">
              <span>{{ t("admin.news.fields.galleryImages", "Gallery images") }}</span>
              <textarea
                v-model="galleryImagesInput"
                rows="6"
                class="news-editor__textarea"
                :placeholder="t('admin.news.placeholders.galleryImages', 'One URL per line')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.fields.videoLinks", "Video links") }}</span>
              <textarea
                v-model="videoLinksInput"
                rows="6"
                class="news-editor__textarea"
                :placeholder="t('admin.news.placeholders.videoLinks', 'One URL per line')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.fields.publishedAt", "Publication date") }}</span>
              <input
                v-model="publishedAtInput"
                type="datetime-local"
                class="news-editor__input" />
            </label>
          </div>
        </div>

        <div
          v-else
          class="news-editor__card">
          <div class="news-editor__section">
            <div class="news-editor__section-title">{{ t("admin.news.seoTitle", "SEO settings") }}</div>
            <div class="news-editor__section-subtitle">
              {{
                t(
                  "admin.news.editor.seoSubtitle",
                  "Tune metadata, canonical URLs and social cards without mixing them into the article form."
                )
              }}
            </div>
          </div>

          <div class="news-editor__grid">
            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.metaTitle", "Meta title") }}</span>
              <input
                v-model="seo.meta_title"
                type="text"
                class="news-editor__input" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.metaDescription", "Meta description") }}</span>
              <textarea
                v-model="seo.meta_description"
                rows="4"
                class="news-editor__textarea" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.metaKeywords", "Meta keywords") }}</span>
              <input
                v-model="metaKeywordsInput"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.metaKeywords', 'forex, market outlook, ECB')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.seo.canonicalUrl", "Canonical URL") }}</span>
              <input
                v-model="seo.canonical_url"
                type="text"
                class="news-editor__input" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.seo.robots", "Robots") }}</span>
              <input
                v-model="seo.robots"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.robots', 'index,follow')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.seo.schemaType", "Schema type") }}</span>
              <input
                v-model="seo.schema_type"
                type="text"
                class="news-editor__input"
                :placeholder="t('admin.news.placeholders.schemaType', 'NewsArticle')" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.seo.ogTitle", "Open Graph title") }}</span>
              <input
                v-model="seo.og_title"
                type="text"
                class="news-editor__input" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.ogDescription", "Open Graph description") }}</span>
              <textarea
                v-model="seo.og_description"
                rows="4"
                class="news-editor__textarea" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.ogImageUrl", "Open Graph image") }}</span>
              <input
                v-model="seo.og_image_url"
                type="text"
                class="news-editor__input" />
            </label>

            <label class="news-editor__field">
              <span>{{ t("admin.news.seo.twitterTitle", "Twitter title") }}</span>
              <input
                v-model="seo.twitter_title"
                type="text"
                class="news-editor__input" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.twitterDescription", "Twitter description") }}</span>
              <textarea
                v-model="seo.twitter_description"
                rows="4"
                class="news-editor__textarea" />
            </label>

            <label class="news-editor__field news-editor__field--full">
              <span>{{ t("admin.news.seo.twitterImageUrl", "Twitter image") }}</span>
              <input
                v-model="seo.twitter_image_url"
                type="text"
                class="news-editor__input" />
            </label>
          </div>
        </div>
      </div>
    </section>

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
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconEye from "~/components/ui/UiIconEye.vue";
  import UiIconNews from "~/components/ui/UiIconNews.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
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

  const editorTabs = computed(() => [
    { label: t("admin.news.editor.articleTab", "Article") },
    { label: t("admin.news.editor.seoTab", "SEO") },
  ]);

  const activeTabIndex = computed(() => (activeTab.value === "content" ? 0 : 1));

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

  function handleSelectTab(index: number): void {
    activeTab.value = index === 0 ? "content" : "seo";
  }

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
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 24px;
    min-height: calc(100vh - 190px);

    @media (max-width: 1180px) {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .news-editor__tabs,
  .news-editor__panel {
    min-width: 0;
  }

  .news-editor__tabs {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: linear-gradient(180deg, rgba(11, 20, 61, 0.95), rgba(8, 15, 44, 0.95));
    height: fit-content;
    position: sticky;
    top: 12px;

    @media (max-width: 1180px) {
      position: static;
    }
  }

  .news-editor__panel,
  .news-editor__card {
    border-radius: 24px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: linear-gradient(180deg, rgba(11, 20, 61, 0.95), rgba(8, 15, 44, 0.95));
    color: var(--ui-text-main);
    box-shadow: 0 24px 70px rgba(7, 12, 38, 0.24);
  }

  .news-editor__panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
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
    gap: 18px;
    flex-wrap: wrap;
  }

  .news-editor__header-copy {
    min-width: 0;
  }

  .news-editor__back {
    margin-bottom: 12px;
    color: rgba(185, 198, 255, 0.78);
    text-decoration: underline;
  }

  .news-editor__eyebrow {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(185, 198, 255, 0.74);
  }

  .news-editor__title {
    margin: 8px 0 0;
    color: #fff;
    font-size: clamp(1.4rem, 2vw, 2.2rem);
    line-height: 1.1;
  }

  .news-editor__meta {
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .news-editor__status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 0.82rem;
    color: rgba(238, 242, 255, 0.92);
    border: 1px solid rgba(126, 145, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
  }

  .news-editor__card {
    padding: 22px;
  }

  .news-editor__section {
    margin-bottom: 18px;
  }

  .news-editor__section-title {
    color: #fff;
    font-size: 1.08rem;
    font-weight: 700;
  }

  .news-editor__section-subtitle {
    margin-top: 8px;
    color: rgba(199, 208, 255, 0.72);
    line-height: 1.6;
  }

  .news-editor__state {
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(199, 208, 255, 0.72);
    text-align: center;
  }

  .news-editor__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;

    @media (max-width: 920px) {
      grid-template-columns: 1fr;
    }
  }

  .news-editor__field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    span {
      color: rgba(199, 208, 255, 0.72);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  }

  .news-editor__field--full,
  .news-editor__cover {
    grid-column: 1 / -1;
  }

  .news-editor__input,
  .news-editor__select,
  .news-editor__textarea {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.035);
    color: var(--ui-text-main);
    outline: none;
  }

  .news-editor__input,
  .news-editor__select {
    min-height: 48px;
    padding: 0 16px;
  }

  .news-editor__textarea {
    padding: 16px;
    line-height: 1.65;
    resize: vertical;
  }

  .news-editor__textarea--content {
    min-height: 360px;
  }

  .news-editor__cover {
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.03);
  }

  .news-editor__cover-image {
    display: block;
    width: 100%;
    max-height: 360px;
    object-fit: cover;
  }
</style>
