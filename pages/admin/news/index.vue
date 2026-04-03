<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.news.title", "AI News Studio") }}</UiTextH4>
        <UiTextParagraph>
          {{ t("admin.news.subtitle", "Generate, edit and schedule news drafts directly from the admin panel.") }}
        </UiTextParagraph>
      </div>
    </template>

    <template #content>
      <div class="news-admin">
        <aside class="news-admin__sidebar">
          <div class="news-admin__sidebar-toolbar">
            <UiInput
              :value="search"
              :placeholder="t('admin.news.fields.search', 'Search news...')"
              @input="value => (search = value)">
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>

            <UiSelect
              class="news-admin__toolbar-select"
              :data="statusFilterOptions"
              :value="statusFilter"
              :withoutNoSelect="false"
              @change="value => (statusFilter = value)" />

            <div class="news-admin__toolbar-actions">
              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="loadArticles(true)">
                <UiIconUpdate :spinning="isListLoading" />
              </UiButtonDefault>

              <UiButtonDefault
                v-if="canCreate"
                state="info--small"
                class="!w-[44px]"
                @click="startNewDraft">
                <UiIconPlus />
              </UiButtonDefault>
            </div>
          </div>

          <div class="news-admin__sidebar-meta">
            <span>{{ t("admin.news.testMode", "Test mode: generation uses the server OpenAI key from env.") }}</span>
            <span>{{ articles.length }}/{{ totalRows }}</span>
          </div>

          <div
            v-if="isListLoading && !articles.length"
            class="news-admin__empty">
            <UiIconSpinnerDefault />
          </div>

          <div
            v-else-if="!articles.length"
            class="news-admin__empty">
            {{ t("admin.news.listEmpty", "No news articles found yet.") }}
          </div>

          <div
            v-else
            class="news-admin__list">
            <button
              v-for="article in articles"
              :key="article.id"
              type="button"
              class="news-admin__list-item"
              :class="{ 'is-active': article.id === selectedArticleId }"
              @click="selectArticle(article.id)">
              <div class="news-admin__list-item-top">
                <span
                  class="news-admin__status"
                  :data-status="article.effective_status">
                  {{ statusLabel(article.effective_status) }}
                </span>
                <span class="news-admin__list-item-locale">{{ article.locale.toUpperCase() }}</span>
              </div>

              <div class="news-admin__list-item-title">
                {{ article.title }}
              </div>

              <div class="news-admin__list-item-text">
                {{ article.excerpt || article.slug }}
              </div>

              <div class="news-admin__list-item-date">
                {{ formatDate(article.updated_at) }}
              </div>
            </button>
          </div>
        </aside>

        <section class="news-admin__workspace">
          <div class="news-admin__panel">
            <div class="news-admin__panel-head">
              <div>
                <div class="news-admin__panel-title">
                  {{ t("admin.news.aiTitle", "Generate with AI") }}
                </div>
                <div class="news-admin__panel-subtitle">
                  {{ t("admin.news.aiSubtitle", "Describe the topic, then refine the draft before saving.") }}
                </div>
              </div>
            </div>

            <div class="news-admin__grid">
              <label class="news-admin__field news-admin__field--full">
                <span>{{ t("admin.news.fields.topic", "Topic") }}</span>
                <UiInput
                  :value="generator.topic"
                  :placeholder="t('admin.news.placeholders.topic', 'ECB comments on inflation outlook')"
                  @input="value => (generator.topic = value)" />
              </label>

              <label class="news-admin__field">
                <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                <UiSelect
                  :data="localeOptions"
                  :value="generator.locale"
                  :withoutNoSelect="true"
                  @change="value => (generator.locale = value || 'en')" />
              </label>

              <label class="news-admin__field">
                <span>{{ t("admin.news.fields.tone", "Tone") }}</span>
                <UiSelect
                  :data="toneOptions"
                  :value="generator.tone"
                  :withoutNoSelect="true"
                  @change="value => (generator.tone = (value as any) || 'professional')" />
              </label>

              <label class="news-admin__field news-admin__field--full">
                <span>{{ t("admin.news.fields.angle", "Angle / headline direction") }}</span>
                <UiInput
                  :value="generator.angle"
                  :placeholder="t('admin.news.placeholders.angle', 'Focus on what the move means for retail traders.')"
                  @input="value => (generator.angle = value)" />
              </label>

              <label class="news-admin__field news-admin__field--full">
                <span>{{ t("admin.news.fields.additionalInstructions", "Additional instructions") }}</span>
                <textarea
                  class="news-admin__textarea"
                  :value="generator.additionalInstructions"
                  :placeholder="
                    t(
                      'admin.news.placeholders.additionalInstructions',
                      'Optional constraints, disclaimers, style notes...'
                    )
                  "
                  @input="event => (generator.additionalInstructions = getTextareaValue(event))" />
              </label>

              <div class="news-admin__switches">
                <label class="news-admin__switch-field">
                  <UiSwitchToggle v-model="generator.generateImages" />
                  <span>{{ t("admin.news.fields.generateImages", "Generate cover images") }}</span>
                </label>

                <label class="news-admin__switch-field">
                  <UiSwitchToggle v-model="generator.includeVideoLinks" />
                  <span>{{ t("admin.news.fields.includeVideoLinks", "Add video search links") }}</span>
                </label>
              </div>

              <label class="news-admin__field">
                <span>{{ t("admin.news.fields.imageCount", "Image count") }}</span>
                <UiSelect
                  :data="imageCountOptions"
                  :value="String(generator.imageCount)"
                  :withoutNoSelect="true"
                  :disabled="!generator.generateImages"
                  @change="value => (generator.imageCount = Number(value || 1))" />
              </label>
            </div>

            <div class="news-admin__panel-actions">
              <UiButtonDefault
                state="info"
                :disabled="!canGenerate || isGenerating"
                @click="handleGenerate">
                {{
                  isGenerating
                    ? t("admin.news.actions.generating", "Generating...")
                    : t("admin.news.actions.generate", "Generate Draft")
                }}
              </UiButtonDefault>
            </div>
          </div>

          <div class="news-admin__panel news-admin__panel--editor">
            <div class="news-admin__panel-head">
              <div>
                <div class="news-admin__panel-title">
                  {{ t("admin.news.editorTitle", "Article editor") }}
                </div>
                <div class="news-admin__panel-subtitle">
                  {{ t("admin.news.editorSubtitle", "Save as draft, publish immediately, or schedule publication.") }}
                </div>
              </div>

              <div class="news-admin__editor-actions">
                <UiButtonDefault
                  v-if="canDelete && form.id"
                  state="danger"
                  :disabled="isDeleting"
                  @click="handleDelete">
                  {{ t("admin.news.actions.delete", "Delete") }}
                </UiButtonDefault>

                <UiButtonDefault
                  v-if="canUpdateCurrent"
                  state="secondary"
                  :disabled="isSaving"
                  @click="saveArticle('draft')">
                  {{ t("admin.news.actions.saveDraft", "Save Draft") }}
                </UiButtonDefault>

                <UiButtonDefault
                  v-if="canUpdateCurrent"
                  state="success"
                  :disabled="isSaving"
                  @click="saveArticle('published')">
                  {{ t("admin.news.actions.publishNow", "Publish Now") }}
                </UiButtonDefault>

                <UiButtonDefault
                  v-if="canUpdateCurrent"
                  state="info"
                  :disabled="isSaving"
                  @click="saveArticle('scheduled')">
                  {{ t("admin.news.actions.schedule", "Schedule") }}
                </UiButtonDefault>
              </div>
            </div>

            <div
              v-if="isArticleLoading"
              class="news-admin__editor-loading">
              <UiIconSpinnerDefault />
            </div>

            <div
              v-else
              class="news-admin__editor">
              <div class="news-admin__grid">
                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.title", "Title") }}</span>
                  <UiInput
                    :value="form.title"
                    :placeholder="t('admin.news.placeholders.title', 'Generated title will appear here')"
                    @input="value => (form.title = value)" />
                </label>

                <label class="news-admin__field">
                  <span>{{ t("admin.news.fields.slug", "Slug") }}</span>
                  <UiInput
                    :value="form.slug"
                    :placeholder="t('admin.news.placeholders.slug', 'news-slug')"
                    @input="value => (form.slug = value)" />
                </label>

                <label class="news-admin__field">
                  <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                  <UiSelect
                    :data="localeOptions"
                    :value="form.locale"
                    :withoutNoSelect="true"
                    @change="value => (form.locale = value || 'en')" />
                </label>

                <label class="news-admin__field">
                  <span>{{ t("admin.news.fields.status", "Status") }}</span>
                  <UiSelect
                    :data="statusOptions"
                    :value="form.status"
                    :withoutNoSelect="true"
                    @change="value => (form.status = (value as any) || 'draft')" />
                </label>

                <label class="news-admin__field">
                  <span>{{ t("admin.news.fields.publishAt", "Publish at") }}</span>
                  <input
                    v-model="form.publishedAt"
                    class="news-admin__datetime"
                    type="datetime-local" />
                </label>

                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.excerpt", "Excerpt") }}</span>
                  <textarea
                    class="news-admin__textarea news-admin__textarea--small"
                    :value="form.excerpt"
                    :placeholder="t('admin.news.placeholders.excerpt', 'Short summary for cards and previews')"
                    @input="event => (form.excerpt = getTextareaValue(event))" />
                </label>

                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.content", "Content") }}</span>
                  <textarea
                    class="news-admin__textarea news-admin__textarea--content"
                    :value="form.content"
                    :placeholder="t('admin.news.placeholders.content', 'Full article markdown')"
                    @input="event => (form.content = getTextareaValue(event))" />
                </label>

                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.coverImageUrl", "Cover image URL") }}</span>
                  <UiInput
                    :value="form.coverImageUrl"
                    :placeholder="t('admin.news.placeholders.coverImageUrl', 'https://... or /storage/news/...')"
                    @input="value => (form.coverImageUrl = value)" />
                </label>

                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.galleryImages", "Gallery image URLs") }}</span>
                  <textarea
                    class="news-admin__textarea news-admin__textarea--small"
                    :value="form.galleryImagesText"
                    :placeholder="t('admin.news.placeholders.galleryImages', 'One image URL per line')"
                    @input="event => (form.galleryImagesText = getTextareaValue(event))" />
                </label>

                <label class="news-admin__field news-admin__field--full">
                  <span>{{ t("admin.news.fields.videoLinks", "Video links") }}</span>
                  <textarea
                    class="news-admin__textarea news-admin__textarea--small"
                    :value="form.videoLinksText"
                    :placeholder="t('admin.news.placeholders.videoLinks', 'One video link per line')"
                    @input="event => (form.videoLinksText = getTextareaValue(event))" />
                </label>
              </div>

              <div
                v-if="form.coverImageUrl || galleryImages.length || videoLinks.length"
                class="news-admin__preview">
                <div
                  v-if="form.coverImageUrl"
                  class="news-admin__preview-block">
                  <div class="news-admin__preview-title">
                    {{ t("admin.news.preview.cover", "Cover preview") }}
                  </div>
                  <img
                    :src="form.coverImageUrl"
                    alt="cover preview"
                    class="news-admin__cover-preview" />
                </div>

                <div
                  v-if="galleryImages.length"
                  class="news-admin__preview-block">
                  <div class="news-admin__preview-title">
                    {{ t("admin.news.preview.gallery", "Gallery") }}
                  </div>

                  <div class="news-admin__gallery">
                    <img
                      v-for="image in galleryImages"
                      :key="image"
                      :src="image"
                      alt="gallery preview"
                      class="news-admin__gallery-image" />
                  </div>
                </div>

                <div
                  v-if="videoLinks.length"
                  class="news-admin__preview-block">
                  <div class="news-admin__preview-title">
                    {{ t("admin.news.preview.videoLinks", "Video links") }}
                  </div>

                  <a
                    v-for="link in videoLinks"
                    :key="link"
                    :href="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="news-admin__link">
                    {{ link }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconPlus from "~/components/ui/UiIconPlus.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import type {
    AdminNewsArticle,
    GeneratedNewsDraft,
    NewsStatus,
    NewsTone,
    UpsertNewsArticlePayload,
  } from "~/composables/core/modules/news/news.types";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t, locale } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const articles = ref<AdminNewsArticle[]>([]);
  const totalRows = ref(0);
  const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const selectedArticleId = ref<string | null>(null);

  const isListLoading = ref(false);
  const isArticleLoading = ref(false);
  const isSaving = ref(false);
  const isGenerating = ref(false);
  const isDeleting = ref(false);

  const searchState = ref("");
  const statusFilterState = ref<string | null>(null);

  const search = computed({
    get: () => searchState.value,
    set: value => {
      searchState.value = value;
    },
  });

  const statusFilter = computed({
    get: () => statusFilterState.value,
    set: value => {
      statusFilterState.value = value;
    },
  });

  const generator = reactive({
    topic: "",
    locale: (locale.value as string) || "en",
    tone: "professional" as NewsTone,
    angle: "",
    additionalInstructions: "",
    generateImages: true,
    imageCount: 1,
    includeVideoLinks: false,
  });

  const form = reactive({
    id: null as string | null,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    locale: (locale.value as string) || "en",
    coverImageUrl: "",
    galleryImagesText: "",
    videoLinksText: "",
    status: "draft" as NewsStatus,
    publishedAt: "",
    meta: {} as Record<string, any>,
  });

  const canCreate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-news")
  );
  const canUpdate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-news")
  );
  const canDelete = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-news")
  );
  const canGenerate = computed(() => canCreate.value || canUpdate.value);
  const canUpdateCurrent = computed(() => (form.id ? canUpdate.value : canCreate.value));

  const statusOptions = computed(() => [
    { id: "draft", value: "draft", text: t("admin.news.statuses.draft", "Draft") },
    { id: "scheduled", value: "scheduled", text: t("admin.news.statuses.scheduled", "Scheduled") },
    { id: "published", value: "published", text: t("admin.news.statuses.published", "Published") },
  ]);

  const statusFilterOptions = computed(() => statusOptions.value);

  const localeOptions = computed(() => [
    { id: "en", value: "en", text: "English" },
    { id: "ru", value: "ru", text: "Русский" },
    { id: "uk", value: "uk", text: "Українська" },
  ]);

  const toneOptions = computed(() => [
    { id: "professional", value: "professional", text: t("admin.news.tones.professional", "Professional") },
    { id: "neutral", value: "neutral", text: t("admin.news.tones.neutral", "Neutral") },
    { id: "promotional", value: "promotional", text: t("admin.news.tones.promotional", "Promotional") },
    { id: "analytical", value: "analytical", text: t("admin.news.tones.analytical", "Analytical") },
  ]);

  const imageCountOptions = computed(() => [
    { id: "0", value: "0", text: "0" },
    { id: "1", value: "1", text: "1" },
    { id: "2", value: "2", text: "2" },
    { id: "3", value: "3", text: "3" },
  ]);

  const galleryImages = computed(() => splitLines(form.galleryImagesText));
  const videoLinks = computed(() => splitLines(form.videoLinksText));

  function getTextareaValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  function splitLines(value: string): string[] {
    return value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);
  }

  function formatLines(items: string[]): string {
    return items.join("\n");
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale.value === "ru" ? "ru-RU" : locale.value === "uk" ? "uk-UA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  }

  function toDateTimeLocal(value: string | null): string {
    if (!value) {
      return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value.slice(0, 16);
    }

    const offset = parsed.getTimezoneOffset();
    const local = new Date(parsed.getTime() - offset * 60_000);

    return local.toISOString().slice(0, 16);
  }

  function statusLabel(status: NewsStatus): string {
    return statusOptions.value.find(option => option.value === status)?.text || status;
  }

  function resetForm(): void {
    form.id = null;
    form.title = "";
    form.slug = "";
    form.excerpt = "";
    form.content = "";
    form.locale = (locale.value as string) || "en";
    form.coverImageUrl = "";
    form.galleryImagesText = "";
    form.videoLinksText = "";
    form.status = "draft";
    form.publishedAt = "";
    form.meta = {};
  }

  function fillForm(article: Partial<AdminNewsArticle> | GeneratedNewsDraft): void {
    if ("id" in article && article.id) {
      form.id = article.id;
    }

    form.title = article.title || "";
    form.slug = article.slug || "";
    form.excerpt = article.excerpt || "";
    form.content = article.content || "";
    form.locale = article.locale || "en";
    form.coverImageUrl = article.cover_image_url || "";
    form.galleryImagesText = formatLines(article.gallery_images || []);
    form.videoLinksText = formatLines(article.video_links || []);
    form.meta = article.meta || {};

    if ("status" in article && article.status) {
      form.status = article.status;
    }

    if ("published_at" in article) {
      form.publishedAt = toDateTimeLocal(article.published_at || null);
    }
  }

  async function loadArticles(force = false): Promise<void> {
    if (isListLoading.value && !force) {
      return;
    }

    isListLoading.value = true;

    try {
      const response = await appCore.news.getList({
        page: 1,
        perPage: 50,
        search: search.value || undefined,
        status: statusFilter.value || undefined,
      });

      articles.value = response.data.data.data;
      totalRows.value = response.data.data.meta.total;

      if (selectedArticleId.value) {
        const current = articles.value.find(article => article.id === selectedArticleId.value);
        if (current) {
          return;
        }
      }

      if (articles.value.length && !form.id) {
        await selectArticle(articles.value[0].id);
      }
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.loadFailed", "Failed to load news articles.")));
    } finally {
      isListLoading.value = false;
    }
  }

  async function selectArticle(id: string): Promise<void> {
    if (!id) {
      return;
    }

    selectedArticleId.value = id;
    isArticleLoading.value = true;

    try {
      const response = await appCore.news.getById(id);
      resetForm();
      fillForm(response.data.data);
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.loadFailed", "Failed to load news article.")));
    } finally {
      isArticleLoading.value = false;
    }
  }

  function startNewDraft(): void {
    selectedArticleId.value = null;
    resetForm();
  }

  async function handleGenerate(): Promise<void> {
    if (!generator.topic.trim()) {
      toast.error(t("admin.news.messages.topicRequired", "Enter a topic for generation first."));
      return;
    }

    isGenerating.value = true;

    try {
      const response = await appCore.news.generateDraft({
        topic: generator.topic.trim(),
        locale: generator.locale,
        tone: generator.tone,
        angle: generator.angle.trim() || undefined,
        additional_instructions: generator.additionalInstructions.trim() || undefined,
        generate_images: generator.generateImages,
        image_count: generator.generateImages ? generator.imageCount : 0,
        include_video_links: generator.includeVideoLinks,
      });

      const draft = response.data.data;
      selectedArticleId.value = null;
      resetForm();
      fillForm(draft);
      toast.success(response.data.message || t("admin.news.messages.generated", "Draft generated successfully."));

      for (const warning of draft.warnings || []) {
        toast.info(warning);
      }
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.generateFailed", "Failed to generate draft.")));
    } finally {
      isGenerating.value = false;
    }
  }

  function buildPayload(status: NewsStatus): UpsertNewsArticlePayload {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim(),
      locale: form.locale,
      cover_image_url: form.coverImageUrl.trim() || undefined,
      gallery_images: galleryImages.value,
      video_links: videoLinks.value,
      status,
      published_at: status === "draft" ? null : form.publishedAt || null,
      meta: form.meta,
    };
  }

  async function saveArticle(nextStatus: NewsStatus): Promise<void> {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error(t("admin.news.messages.editorRequired", "Title and content are required."));
      return;
    }

    if (nextStatus === "scheduled" && !form.publishedAt) {
      toast.error(t("admin.news.messages.scheduleRequired", "Pick the publication date and time first."));
      return;
    }

    isSaving.value = true;

    try {
      const payload = buildPayload(nextStatus);
      const response = form.id ? await appCore.news.update(form.id, payload) : await appCore.news.create(payload);

      const article = response.data.data as AdminNewsArticle;
      selectedArticleId.value = article.id;
      resetForm();
      fillForm(article);
      await loadArticles(true);

      toast.success(
        response.data.message ||
          (form.id
            ? t("admin.news.messages.updated", "News article updated.")
            : t("admin.news.messages.created", "News article created."))
      );
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.saveFailed", "Failed to save news article.")));
    } finally {
      isSaving.value = false;
    }
  }

  async function handleDelete(): Promise<void> {
    if (!form.id) {
      return;
    }

    isDeleting.value = true;

    try {
      const response = await appCore.news.delete(form.id);
      toast.success(response.data.message || t("admin.news.messages.deleted", "News article deleted."));
      resetForm();
      selectedArticleId.value = null;
      await loadArticles(true);
    } catch (error: any) {
      toast.error(
        resolveApiErrorMessage(error, t("admin.news.messages.deleteFailed", "Failed to delete news article."))
      );
    } finally {
      isDeleting.value = false;
    }
  }

  function resolveApiErrorMessage(error: any, fallback: string): string {
    return error?.response?.data?.message || fallback;
  }

  watch([searchState, statusFilterState], () => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value);
    }

    searchTimer.value = setTimeout(() => {
      void loadArticles(true);
    }, 350);
  });

  onMounted(async () => {
    await loadArticles(true);
  });

  onBeforeUnmount(() => {
    if (searchTimer.value) {
      clearTimeout(searchTimer.value);
    }
  });
</script>

<style scoped lang="scss">
  .news-admin {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    padding-bottom: 24px;
  }

  .news-admin__sidebar,
  .news-admin__panel {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(11, 26, 78, 0.72) 0%, rgba(7, 18, 58, 0.92) 100%);
    overflow: hidden;
  }

  .news-admin__sidebar {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .news-admin__sidebar-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .news-admin__toolbar-select {
    width: 100%;
  }

  .news-admin__toolbar-actions {
    display: flex;
    gap: 8px;
  }

  .news-admin__sidebar-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 0 14px 14px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .news-admin__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 14px 14px;
    overflow: auto;
  }

  .news-admin__list-item {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    padding: 12px;
    text-align: left;
    transition:
      border-color 0.2s ease,
      transform 0.2s ease,
      background 0.2s ease;
    color: var(--ui-text-main);

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(109, 147, 255, 0.45);
    }

    &.is-active {
      border-color: rgba(90, 135, 255, 0.9);
      background: rgba(49, 92, 217, 0.16);
    }
  }

  .news-admin__list-item-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  .news-admin__status {
    display: inline-flex;
    align-items: center;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &[data-status="draft"] {
      background: rgba(255, 193, 7, 0.18);
      color: #ffd76a;
    }

    &[data-status="scheduled"] {
      background: rgba(86, 156, 255, 0.18);
      color: #8ec2ff;
    }

    &[data-status="published"] {
      background: rgba(52, 199, 89, 0.18);
      color: #7fe39b;
    }
  }

  .news-admin__list-item-locale {
    color: var(--ui-text-secondary);
    font-size: 11px;
    font-weight: 600;
  }

  .news-admin__list-item-title {
    font-weight: 700;
    margin-bottom: 8px;
  }

  .news-admin__list-item-text,
  .news-admin__list-item-date {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .news-admin__list-item-date {
    margin-top: 8px;
  }

  .news-admin__workspace {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .news-admin__panel-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .news-admin__panel-title {
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 700;
  }

  .news-admin__panel-subtitle {
    margin-top: 6px;
    color: var(--ui-text-secondary);
    font-size: 13px;
  }

  .news-admin__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 20px;
  }

  .news-admin__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--ui-text-main);
    font-size: 13px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  .news-admin__switches {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .news-admin__switch-field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
    font-size: 13px;
  }

  .news-admin__textarea,
  .news-admin__datetime {
    width: 100%;
    background: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    color: var(--ui-text-main);
    padding: 12px 14px;
    outline: none;
  }

  .news-admin__textarea {
    min-height: 120px;
    resize: vertical;

    &--small {
      min-height: 92px;
    }

    &--content {
      min-height: 320px;
    }
  }

  .news-admin__datetime {
    min-height: 40px;
  }

  .news-admin__panel-actions,
  .news-admin__editor-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .news-admin__panel-actions {
    padding: 0 20px 20px;
  }

  .news-admin__editor-loading,
  .news-admin__empty {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
  }

  .news-admin__preview {
    display: grid;
    gap: 16px;
    padding: 0 20px 20px;
  }

  .news-admin__preview-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .news-admin__preview-title {
    color: var(--ui-text-main);
    font-size: 14px;
    font-weight: 700;
  }

  .news-admin__cover-preview {
    width: 100%;
    max-height: 340px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .news-admin__gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }

  .news-admin__gallery-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .news-admin__link {
    color: #8ec2ff;
    text-decoration: underline;
    word-break: break-all;
  }

  @media (max-width: 1100px) {
    .news-admin {
      grid-template-columns: 1fr;
    }

    .news-admin__sidebar {
      min-height: auto;
    }
  }

  @media (max-width: 760px) {
    .news-admin__grid {
      grid-template-columns: 1fr;
    }

    .news-admin__panel-head {
      flex-direction: column;
    }
  }
</style>
