<template>
  <div
    class="news-prime"
    :class="{ 'news-prime--busy': isListLoading || isChatLoading }">
    <div class="news-prime__header">
      <div class="news-prime__heading">
        <h1 class="news-prime__title">{{ t("admin.news.title", "News Workspace") }}</h1>
        <p class="news-prime__subtitle">
          {{
            t(
              "admin.news.subtitle",
              "Manage posts, publication timing, SEO and GPT-assisted drafts from one wide newsroom workspace."
            )
          }}
        </p>
      </div>

      <div class="news-prime__header-actions">
        <PrimeButton
          v-if="canCreate"
          size="small"
          icon="pi pi-plus"
          :label="t('admin.news.actions.createPost', 'Create post')"
          @click="openManualComposer" />
        <PrimeButton
          size="small"
          severity="secondary"
          outlined
          icon="pi pi-refresh"
          :loading="isListLoading"
          @click="loadArticles(true)" />
      </div>
    </div>

    <PrimeTabs
      v-model:value="activeWorkspace"
      class="news-prime__tabs">
      <PrimeTabList>
        <PrimeTab value="library">
          <i class="pi pi-list"></i>
          <span>{{ t("admin.news.tabs.library", "Posts") }}</span>
        </PrimeTab>
        <PrimeTab value="manual">
          <i class="pi pi-file-edit"></i>
          <span>{{ t("admin.news.tabs.manual", "New post") }}</span>
        </PrimeTab>
        <PrimeTab value="gpt">
          <i class="pi pi-sparkles"></i>
          <span>{{ t("admin.news.tabs.gpt", "GPT draft") }}</span>
        </PrimeTab>
      </PrimeTabList>

      <PrimeTabPanels>
        <PrimeTabPanel value="library">
          <section class="news-prime__section">
            <div class="news-prime__section-head">
              <div>
                <h2 class="news-prime__section-title">{{ t("admin.news.library.title", "All posts") }}</h2>
                <p class="news-prime__section-subtitle">
                  {{
                    t(
                      "admin.news.library.subtitle",
                      "Filter published, unpublished and scheduled posts, preview content and jump into editing."
                    )
                  }}
                </p>
              </div>
            </div>

            <div class="news-prime__filters">
              <button
                v-for="option in filterOptions"
                :key="option.value"
                type="button"
                class="news-prime-filter-card"
                :class="{ 'is-active': statusFilter === option.value }"
                @click="setStatusFilter(option.value)">
                <span class="news-prime-filter-card__label">{{ option.label }}</span>
                <span class="news-prime-filter-card__hint">{{ option.hint }}</span>
              </button>
            </div>

            <div class="news-prime__toolbar">
              <span class="news-prime__search">
                <i class="pi pi-search"></i>
                <PrimeInputText
                  v-model="search"
                  :placeholder="t('admin.news.fields.search', 'Search by title, slug or excerpt')" />
              </span>

              <PrimeSelect
                v-model="localeFilter"
                class="news-prime__toolbar-select"
                :options="localeFilterOptions"
                option-label="label"
                option-value="value" />

              <div class="news-prime__view-toggle">
                <PrimeButton
                  v-for="option in viewOptions"
                  :key="option.value"
                  size="small"
                  :icon="option.icon"
                  :label="option.label"
                  :outlined="viewMode !== option.value"
                  :severity="viewMode === option.value ? undefined : 'secondary'"
                  @click="viewMode = option.value" />
              </div>
            </div>

            <div
              v-if="isListLoading && !articles.length"
              class="news-prime__skeleton-list">
              <PrimeSkeleton
                v-for="item in 5"
                :key="item"
                height="92px"
                border-radius="22px" />
            </div>

            <div
              v-else-if="!articles.length"
              class="news-prime-empty">
              <i class="pi pi-inbox"></i>
              <span>{{ t("admin.news.library.empty", "No posts found for the selected filters.") }}</span>
            </div>

            <div
              v-else
              class="news-prime__posts"
              :class="`is-${viewMode}`">
              <PrimeCard
                v-for="article in articles"
                :key="article.id"
                class="news-prime-post-card"
                @click="openPreview(article, true)">
                <template #content>
                  <article class="news-prime-post-card__body">
                    <div class="news-prime-post-card__main">
                      <div class="news-prime-post-card__meta">
                        <PrimeTag
                          :value="statusLabel(article.effective_status)"
                          :severity="statusSeverity(article.effective_status)" />
                        <PrimeTag
                          :value="article.locale.toUpperCase()"
                          severity="secondary" />
                        <span>{{ formatDate(article.updated_at, true) }}</span>
                      </div>

                      <h3 class="news-prime-post-card__title">{{ article.title || article.slug }}</h3>
                      <p class="news-prime-post-card__excerpt">{{ article.excerpt || article.slug }}</p>
                    </div>

                    <div
                      class="news-prime-post-card__actions"
                      @click.stop>
                      <PrimeButton
                        size="small"
                        severity="secondary"
                        text
                        icon="pi pi-eye"
                        @click="openPreview(article, true)" />
                      <PrimeButton
                        v-if="canUpdate"
                        size="small"
                        icon="pi pi-pencil"
                        :label="viewMode === 'grid' ? '' : t('admin.news.actions.editArticle', 'Edit')"
                        @click="goToEdit(article.id)" />
                    </div>
                  </article>
                </template>
              </PrimeCard>
            </div>

            <PrimePaginator
              v-if="totalRows > perPage"
              class="news-prime__paginator"
              :first="(currentPage - 1) * perPage"
              :rows="perPage"
              :total-records="totalRows"
              :rows-per-page-options="[6, 12, 24, 48]"
              @page="handlePaginatorPage" />
          </section>
        </PrimeTabPanel>

        <PrimeTabPanel value="manual">
          <section class="news-prime__section">
            <div class="news-prime__section-head">
              <div>
                <h2 class="news-prime__section-title">
                  {{ t("admin.news.manual.title", "Create post manually") }}
                </h2>
                <p class="news-prime__section-subtitle">
                  {{
                    t(
                      "admin.news.manual.subtitle",
                      "Fill the article, media and SEO data directly. Save as draft, publish immediately or schedule publication."
                    )
                  }}
                </p>
              </div>

              <div class="news-prime__section-actions">
                <PrimeButton
                  severity="secondary"
                  outlined
                  icon="pi pi-eye"
                  :label="t('admin.news.actions.preview', 'Preview')"
                  @click="previewManualPost" />
                <PrimeButton
                  severity="secondary"
                  outlined
                  icon="pi pi-refresh"
                  :label="t('admin.news.actions.reset', 'Reset')"
                  @click="resetManualForm" />
              </div>
            </div>

            <PrimeTabs
              v-model:value="manualTab"
              class="news-prime__inner-tabs">
              <PrimeTabList>
                <PrimeTab value="content">{{ t("admin.news.editor.articleTab", "Article") }}</PrimeTab>
                <PrimeTab value="seo">{{ t("admin.news.editor.seoTab", "SEO") }}</PrimeTab>
              </PrimeTabList>

              <PrimeTabPanels>
                <PrimeTabPanel value="content">
                  <div class="news-prime-form-grid">
                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.fields.title", "Title") }}</span>
                      <PrimeInputText
                        v-model="manualForm.title"
                        :placeholder="t('admin.news.placeholders.title', 'Market outlook: what traders watch today')" />
                    </label>

                    <label class="news-prime-field">
                      <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                      <PrimeSelect
                        v-model="manualForm.locale"
                        :options="localeOptions"
                        option-label="label"
                        option-value="value" />
                    </label>

                    <label class="news-prime-field">
                      <span>{{ t("admin.news.fields.status", "Status") }}</span>
                      <PrimeSelect
                        v-model="manualForm.status"
                        :options="statusOptions"
                        option-label="label"
                        option-value="value" />
                    </label>

                    <label class="news-prime-field news-prime-field--with-action">
                      <span>{{ t("admin.news.fields.slug", "Slug") }}</span>
                      <PrimeInputText
                        v-model="manualForm.slug"
                        :placeholder="t('admin.news.placeholders.slug', 'market-outlook')" />
                      <PrimeButton
                        size="small"
                        severity="secondary"
                        text
                        icon="pi pi-bolt"
                        @click="manualForm.slug = slugify(manualForm.title)" />
                    </label>

                    <label class="news-prime-field">
                      <span>{{ t("admin.news.fields.publishedAt", "Publication date") }}</span>
                      <PrimeDatePicker
                        v-model="manualPublishedAt"
                        show-time
                        hour-format="24"
                        fluid />
                    </label>

                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.fields.excerpt", "Excerpt") }}</span>
                      <PrimeTextarea
                        v-model="manualForm.excerpt"
                        rows="3"
                        auto-resize
                        :placeholder="t('admin.news.placeholders.excerpt', 'Short summary for cards and previews')" />
                    </label>

                    <div class="news-prime-field news-prime-field--full">
                      <div class="news-prime-field__label-row">
                        <span>{{ t("admin.news.fields.content", "Content") }}</span>
                        <div class="news-prime-editor-toolbar">
                          <PrimeButton
                            size="small"
                            text
                            severity="secondary"
                            label="H2"
                            @click="insertMarkup(manualContentRef, manualForm.content, value => (manualForm.content = value), '## ', '', 'Heading')" />
                          <PrimeButton
                            size="small"
                            text
                            severity="secondary"
                            label="B"
                            @click="insertMarkup(manualContentRef, manualForm.content, value => (manualForm.content = value), '**', '**', 'important text')" />
                          <PrimeButton
                            size="small"
                            text
                            severity="secondary"
                            icon="pi pi-link"
                            @click="insertMarkup(manualContentRef, manualForm.content, value => (manualForm.content = value), '[', '](https://example.com)', 'link text')" />
                          <PrimeButton
                            size="small"
                            text
                            severity="secondary"
                            icon="pi pi-list"
                            @click="insertMarkup(manualContentRef, manualForm.content, value => (manualForm.content = value), '- ', '', 'list item')" />
                        </div>
                      </div>
                      <PrimeTextarea
                        ref="manualContentRef"
                        v-model="manualForm.content"
                        rows="14"
                        class="news-prime-content-editor"
                        :placeholder="t('admin.news.placeholders.content', 'Write the article body here')" />
                    </div>

                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.fields.coverImage", "Cover image URL") }}</span>
                      <PrimeInputText
                        v-model="manualForm.cover_image_url"
                        :placeholder="t('admin.news.placeholders.coverImage', 'https://example.com/image.jpg')" />
                    </label>

                    <label class="news-prime-field">
                      <span>{{ t("admin.news.fields.galleryImages", "Gallery images") }}</span>
                      <PrimeTextarea
                        v-model="manualForm.gallery_images"
                        rows="5"
                        :placeholder="t('admin.news.placeholders.galleryImages', 'One image URL per line')" />
                    </label>

                    <label class="news-prime-field">
                      <span>{{ t("admin.news.fields.videoLinks", "Video links") }}</span>
                      <PrimeTextarea
                        v-model="manualForm.video_links"
                        rows="5"
                        :placeholder="t('admin.news.placeholders.videoLinks', 'One video URL per line')" />
                    </label>
                  </div>
                </PrimeTabPanel>

                <PrimeTabPanel value="seo">
                  <div class="news-prime-form-grid">
                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.seo.metaTitle", "Meta title") }}</span>
                      <PrimeInputText v-model="manualForm.seo.meta_title" />
                    </label>

                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.seo.metaDescription", "Meta description") }}</span>
                      <PrimeTextarea
                        v-model="manualForm.seo.meta_description"
                        rows="3"
                        auto-resize />
                    </label>

                    <label class="news-prime-field news-prime-field--full">
                      <span>{{ t("admin.news.seo.metaKeywords", "Meta keywords") }}</span>
                      <PrimeInputText
                        v-model="manualForm.seo.meta_keywords"
                        :placeholder="t('admin.news.placeholders.metaKeywords', 'forex, market outlook, ECB')" />
                    </label>

                    <label
                      v-for="field in seoTextFields"
                      :key="field.key"
                      class="news-prime-field"
                      :class="{ 'news-prime-field--full': field.full }">
                      <span>{{ field.label }}</span>
                      <PrimeTextarea
                        v-if="field.textarea"
                        v-model="manualForm.seo[field.key]"
                        rows="3"
                        auto-resize />
                      <PrimeInputText
                        v-else
                        v-model="manualForm.seo[field.key]" />
                    </label>
                  </div>
                </PrimeTabPanel>
              </PrimeTabPanels>
            </PrimeTabs>

            <div class="news-prime__bottom-actions">
              <PrimeButton
                severity="secondary"
                outlined
                :label="t('admin.news.actions.saveDraft', 'Save draft')"
                :loading="isCreating"
                :disabled="!canCreate"
                @click="createManualArticle('draft')" />
              <PrimeButton
                severity="info"
                :label="t('admin.news.actions.schedule', 'Schedule')"
                :loading="isCreating"
                :disabled="!canCreate"
                @click="createManualArticle('scheduled')" />
              <PrimeButton
                icon="pi pi-send"
                :label="t('admin.news.actions.publishNow', 'Publish now')"
                :loading="isCreating"
                :disabled="!canCreate"
                @click="createManualArticle('published')" />
            </div>
          </section>
        </PrimeTabPanel>

        <PrimeTabPanel value="gpt">
          <section class="news-prime__section news-prime__section--chat">
            <div class="news-prime__section-head">
              <div>
                <h2 class="news-prime__section-title">
                  {{ draftArticle?.title || t("admin.news.chatWorkspace.title", "Create a GPT draft") }}
                </h2>
                <p class="news-prime__section-subtitle">
                  {{
                    draftArticle
                      ? t(
                          "admin.news.chatWorkspace.subtitleExisting",
                          "Ask GPT to reshape the current draft. The latest article state stays in context."
                        )
                      : t(
                          "admin.news.chatWorkspace.subtitleNew",
                          "Describe the topic, tone and assets. GPT will create an article draft with SEO metadata."
                        )
                  }}
                </p>
              </div>

              <div class="news-prime__section-actions">
                <PrimeButton
                  v-if="draftArticle"
                  severity="secondary"
                  outlined
                  icon="pi pi-eye"
                  :label="t('admin.news.actions.preview', 'Preview')"
                  @click="openPreview(draftArticle, true)" />
                <PrimeButton
                  v-if="draftArticle && canUpdate"
                  icon="pi pi-pencil"
                  :label="t('admin.news.actions.editArticle', 'Edit')"
                  @click="goToEdit(draftArticle.id)" />
                <PrimeButton
                  severity="secondary"
                  text
                  icon="pi pi-plus"
                  @click="resetDraftWorkspace" />
              </div>
            </div>

            <div class="news-prime-chat">
              <div class="news-prime-chat__stream">
                <div
                  v-if="!messages.length && !isChatLoading"
                  class="news-prime-empty">
                  <i class="pi pi-comments"></i>
                  <span>
                    {{
                      t(
                        "admin.news.chatWorkspace.empty",
                        "No draft yet. Start with a prompt describing the story, tone, media and SEO requirements."
                      )
                    }}
                  </span>
                </div>

                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="news-prime-message"
                  :class="`is-${message.role}`">
                  <div class="news-prime-message__head">
                    <strong>
                      {{
                        message.role === "assistant"
                          ? t("admin.news.roles.assistant", "GPT Editor")
                          : t("admin.news.roles.user", "You")
                      }}
                    </strong>
                    <span>{{ formatDate(message.created_at, true) }}</span>
                  </div>
                  <div class="news-prime-message__body">{{ displayMessageContent(message) }}</div>
                </div>

                <div
                  v-if="isChatLoading"
                  class="news-prime-message is-assistant is-pending">
                  <div class="news-prime-message__head">
                    <strong>{{ t("admin.news.roles.assistant", "GPT Editor") }}</strong>
                  </div>
                  <div class="news-prime-message__body">
                    <span>{{ currentPhase }}</span>
                    <span class="news-prime-dots"><i></i><i></i><i></i></span>
                  </div>
                </div>
              </div>

              <PrimeCard
                v-if="draftArticle"
                class="news-prime-draft-card"
                @click="openPreview(draftArticle, true)">
                <template #content>
                  <div class="news-prime-draft-card__body">
                    <div>
                      <strong>{{ draftArticle.title || draftArticle.slug }}</strong>
                      <p>{{ draftArticle.excerpt || t("admin.news.chatWorkspace.previewHint", "Open draft preview") }}</p>
                    </div>
                    <PrimeTag
                      :value="statusLabel(draftArticle.effective_status)"
                      :severity="statusSeverity(draftArticle.effective_status)" />
                  </div>
                </template>
              </PrimeCard>

              <div class="news-prime-composer">
                <div class="news-prime-composer__settings">
                  <label class="news-prime-field">
                    <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                    <PrimeSelect
                      v-model="draftLocale"
                      :options="localeOptions"
                      option-label="label"
                      option-value="value" />
                  </label>

                  <label class="news-prime-toggle">
                    <PrimeToggleSwitch v-model="generateImages" />
                    <span>{{ t("admin.news.fields.generateImages", "Images") }}</span>
                  </label>

                  <label class="news-prime-toggle">
                    <PrimeToggleSwitch v-model="includeVideoLinks" />
                    <span>{{ t("admin.news.fields.includeVideoLinks", "Videos") }}</span>
                  </label>
                </div>

                <PrimeTextarea
                  v-model="chatInput"
                  rows="5"
                  class="news-prime-composer__input"
                  :placeholder="
                    t(
                      'admin.news.chatPlaceholder',
                      'Example: Create a calm market update about the ECB meeting with one cover image and full SEO.'
                    )
                  "
                  @keydown.enter.exact.prevent="handleSendMessage" />

                <div class="news-prime-composer__bottom">
                  <p>
                    {{
                      draftArticle
                        ? t(
                            "admin.news.chatWorkspace.hintExisting",
                            "Ask GPT to rewrite the headline, shorten the intro, add visuals or improve SEO."
                          )
                        : t(
                            "admin.news.chatWorkspace.hintNew",
                            "The first prompt creates a new draft. Every next prompt edits the same article."
                          )
                    }}
                  </p>
                  <PrimeButton
                    icon="pi pi-send"
                    :label="
                      isChatLoading
                        ? t('admin.news.actions.generating', 'Generating...')
                        : t('admin.news.actions.send', 'Send to GPT')
                    "
                    :loading="isChatLoading"
                    :disabled="!chatInput.trim() || !canChat"
                    @click="handleSendMessage" />
                </div>
              </div>
            </div>
          </section>
        </PrimeTabPanel>
      </PrimeTabPanels>
    </PrimeTabs>

    <NewsPreviewModal
      v-model="isPreviewOpen"
      :article="previewArticle"
      :showEditButton="previewCanEdit && canUpdate"
      @edit="goToEdit" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import type {
    AdminNewsArticle,
    AdminNewsChatMessage,
    AdminNewsStudioResponse,
    NewsPersistedStatus,
    NewsSeoPayload,
    NewsStatus,
    SendNewsChatMessagePayload,
    UpsertNewsArticlePayload,
  } from "~/composables/core/modules/news/news.types";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import NewsPreviewModal from "~/pages/admin/news/components/NewsPreviewModal.vue";

  type WorkspaceTab = "library" | "manual" | "gpt";
  type FilterStatus = "all" | NewsStatus;
  type ViewMode = "list" | "grid" | "table";
  type ManualTab = "content" | "seo";
  type SeoStringKey =
    | "canonical_url"
    | "robots"
    | "og_title"
    | "og_description"
    | "og_image_url"
    | "twitter_title"
    | "twitter_description"
    | "twitter_image_url"
    | "schema_type";

  interface ManualSeoState extends Record<SeoStringKey, string> {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  }

  interface ManualPostForm {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    locale: string;
    cover_image_url: string;
    gallery_images: string;
    video_links: string;
    status: NewsPersistedStatus;
    seo: ManualSeoState;
  }

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t } = useI18n({ useScope: "global" });

  const activeWorkspace = ref<WorkspaceTab>("library");
  const manualTab = ref<ManualTab>("content");
  const search = ref("");
  const statusFilter = ref<FilterStatus>("all");
  const localeFilter = ref<string | null>(null);
  const viewMode = ref<ViewMode>("list");
  const currentPage = ref(1);
  const perPage = ref(12);

  const articles = ref<AdminNewsArticle[]>([]);
  const totalRows = ref(0);
  const isListLoading = ref(false);
  const isCreating = ref(false);

  const draftArticle = ref<AdminNewsArticle | null>(null);
  const messages = ref<AdminNewsChatMessage[]>([]);
  const chatInput = ref("");
  const draftLocale = ref("en");
  const generateImages = ref(true);
  const includeVideoLinks = ref(false);
  const isChatLoading = ref(false);

  const manualPublishedAt = ref<Date | string | null>(null);
  const manualContentRef = ref<any>(null);
  const isPreviewOpen = ref(false);
  const previewArticle = ref<AdminNewsArticle | null>(null);
  const previewCanEdit = ref(false);

  const typedMessages = reactive<Record<string, string>>({});
  const typingTimers = new Map<string, ReturnType<typeof setInterval>>();
  const currentPhaseIndex = ref(0);
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let phaseTimer: ReturnType<typeof setInterval> | null = null;

  const canCreate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-news")
  );
  const canUpdate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-news")
  );
  const canChat = computed(() => (draftArticle.value ? canUpdate.value : canCreate.value));

  const manualForm = reactive<ManualPostForm>(createEmptyManualForm());

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

  const localeFilterOptions = computed(() => [
    { label: t("admin.news.filters.allLanguages", "All languages"), value: null },
    ...localeOptions.value,
  ]);

  const filterOptions = computed(() => [
    {
      value: "all" as const,
      label: t("admin.news.filters.all", "All"),
      hint: t("admin.news.filterHints.all", "Every post state"),
    },
    {
      value: "draft" as const,
      label: t("admin.news.filters.draft", "Unpublished"),
      hint: t("admin.news.filterHints.draft", "Drafts not visible to clients"),
    },
    {
      value: "scheduled" as const,
      label: t("admin.news.filters.scheduled", "Scheduled"),
      hint: t("admin.news.filterHints.scheduled", "Queued for future publication"),
    },
    {
      value: "published" as const,
      label: t("admin.news.filters.published", "Published"),
      hint: t("admin.news.filterHints.published", "Live public posts"),
    },
    {
      value: "archived" as const,
      label: t("admin.news.filters.archived", "Archived"),
      hint: t("admin.news.filterHints.archived", "Hidden from public lists"),
    },
  ]);

  const statusOptions = computed(() => [
    { label: t("admin.news.statuses.draft", "Draft"), value: "draft" },
    { label: t("admin.news.statuses.scheduled", "Scheduled"), value: "scheduled" },
    { label: t("admin.news.statuses.published", "Published"), value: "published" },
  ]);

  const viewOptions = computed(() => [
    { value: "list" as const, label: t("admin.news.views.list", "List"), icon: "pi pi-list" },
    { value: "grid" as const, label: t("admin.news.views.grid", "Tiles"), icon: "pi pi-th-large" },
    { value: "table" as const, label: t("admin.news.views.table", "Table"), icon: "pi pi-table" },
  ]);

  const seoTextFields = computed<Array<{ key: SeoStringKey; label: string; textarea?: boolean; full?: boolean }>>(() => [
    { key: "canonical_url", label: t("admin.news.seo.canonicalUrl", "Canonical URL") },
    { key: "robots", label: t("admin.news.seo.robots", "Robots") },
    { key: "schema_type", label: t("admin.news.seo.schemaType", "Schema type") },
    { key: "og_title", label: t("admin.news.seo.ogTitle", "Open Graph title") },
    { key: "og_description", label: t("admin.news.seo.ogDescription", "Open Graph description"), textarea: true, full: true },
    { key: "og_image_url", label: t("admin.news.seo.ogImageUrl", "Open Graph image"), full: true },
    { key: "twitter_title", label: t("admin.news.seo.twitterTitle", "Twitter title") },
    {
      key: "twitter_description",
      label: t("admin.news.seo.twitterDescription", "Twitter description"),
      textarea: true,
      full: true,
    },
    { key: "twitter_image_url", label: t("admin.news.seo.twitterImageUrl", "Twitter image"), full: true },
  ]);

  const phaseTexts = computed(() => [
    t("admin.news.phases.analyzing", "Analyzing your request"),
    t("admin.news.phases.writing", "Writing the article draft"),
    t("admin.news.phases.seo", "Preparing SEO metadata"),
    t("admin.news.phases.finalizing", "Finalizing newsroom output"),
  ]);

  const currentPhase = computed(() => phaseTexts.value[currentPhaseIndex.value] || phaseTexts.value[0]);

  function createEmptyManualForm(): ManualPostForm {
    return {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      locale: "en",
      cover_image_url: "",
      gallery_images: "",
      video_links: "",
      status: "draft",
      seo: {
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        canonical_url: "",
        robots: "index,follow",
        og_title: "",
        og_description: "",
        og_image_url: "",
        twitter_title: "",
        twitter_description: "",
        twitter_image_url: "",
        schema_type: "NewsArticle",
      },
    };
  }

  function setStatusFilter(value: FilterStatus): void {
    statusFilter.value = value;
    currentPage.value = 1;
  }

  async function loadArticles(force = false): Promise<void> {
    if (isListLoading.value && !force) return;

    isListLoading.value = true;

    try {
      const response = await appCore.news.getList({
        page: currentPage.value,
        perPage: perPage.value,
        search: search.value || undefined,
        status: statusFilter.value === "all" ? null : statusFilter.value,
        locale: localeFilter.value || null,
      });
      const payload = response.data.data;
      articles.value = payload.data || [];
      totalRows.value = payload.meta?.total || 0;
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.loadFailed", "Failed to load news articles.")));
    } finally {
      isListLoading.value = false;
    }
  }

  function handlePaginatorPage(event: { page: number; rows: number }): void {
    currentPage.value = Number(event.page ?? 0) + 1;
    perPage.value = Number(event.rows ?? perPage.value);
    void loadArticles(true);
  }

  function openManualComposer(): void {
    resetManualForm();
    activeWorkspace.value = "manual";
  }

  function resetManualForm(): void {
    Object.assign(manualForm, createEmptyManualForm());
    manualPublishedAt.value = null;
    manualTab.value = "content";
  }

  function previewManualPost(): void {
    previewArticle.value = buildManualPreviewArticle();
    previewCanEdit.value = false;
    isPreviewOpen.value = true;
  }

  function buildManualPreviewArticle(): AdminNewsArticle {
    const now = new Date().toISOString();
    return {
      id: "preview",
      title: manualForm.title || t("admin.news.editor.untitled", "Untitled article"),
      slug: manualForm.slug || slugify(manualForm.title || "preview"),
      excerpt: manualForm.excerpt || null,
      content: manualForm.content,
      locale: manualForm.locale,
      cover_image_url: manualForm.cover_image_url || null,
      gallery_images: parseMultiline(manualForm.gallery_images),
      video_links: parseMultiline(manualForm.video_links),
      status: manualForm.status,
      effective_status: manualForm.status,
      published_at: dateToIso(manualPublishedAt.value),
      seo: buildSeoPayload(manualForm.seo),
      meta: {},
      created_at: now,
      updated_at: now,
    };
  }

  async function createManualArticle(status: NewsPersistedStatus): Promise<void> {
    if (!canCreate.value) return;

    if (!manualForm.title.trim() || !manualForm.content.trim()) {
      toast.error(t("admin.news.messages.editorRequired", "Title and content are required."));
      return;
    }

    if (status === "scheduled" && !manualPublishedAt.value) {
      toast.error(t("admin.news.messages.scheduleRequired", "Pick the publication date and time first."));
      return;
    }

    isCreating.value = true;

    try {
      const response = await appCore.news.create(buildManualPayload(status));
      const article = response.data.data as AdminNewsArticle;
      toast.success(response.data.message || t("admin.news.messages.created", "News article created."));
      await loadArticles(true);
      await goToEdit(article.id);
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.saveFailed", "Failed to save news article.")));
    } finally {
      isCreating.value = false;
    }
  }

  function buildManualPayload(status: NewsPersistedStatus): UpsertNewsArticlePayload {
    return {
      title: manualForm.title.trim(),
      slug: manualForm.slug.trim() || null,
      excerpt: manualForm.excerpt.trim() || null,
      content: manualForm.content.trim(),
      locale: manualForm.locale,
      cover_image_url: manualForm.cover_image_url.trim() || null,
      gallery_images: parseMultiline(manualForm.gallery_images),
      video_links: parseMultiline(manualForm.video_links),
      status,
      published_at: dateToIso(manualPublishedAt.value),
      seo: buildSeoPayload(manualForm.seo),
      meta: {},
    };
  }

  function buildSeoPayload(value: ManualSeoState): NewsSeoPayload {
    return {
      meta_title: value.meta_title || null,
      meta_description: value.meta_description || null,
      meta_keywords: parseCommaSeparated(value.meta_keywords),
      canonical_url: value.canonical_url || null,
      robots: value.robots || null,
      og_title: value.og_title || null,
      og_description: value.og_description || null,
      og_image_url: value.og_image_url || null,
      twitter_title: value.twitter_title || null,
      twitter_description: value.twitter_description || null,
      twitter_image_url: value.twitter_image_url || null,
      schema_type: value.schema_type || null,
    };
  }

  function openPreview(article: AdminNewsArticle, canEdit = false): void {
    previewArticle.value = article;
    previewCanEdit.value = canEdit && article.id !== "preview";
    isPreviewOpen.value = true;
  }

  async function goToEdit(id: string): Promise<void> {
    if (!id || id === "preview") return;
    await navigateTo(localePath(`/news/${id}`));
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
    if (!value) return t("admin.news.noDate", "No date");
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

  function dateToIso(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яёіїєґ]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }

  function getTextareaElement(refValue: any): HTMLTextAreaElement | null {
    return refValue?.$el?.querySelector?.("textarea") ?? refValue?.$el ?? refValue ?? null;
  }

  function insertMarkup(
    targetRef: any,
    currentValue: string,
    update: (value: string) => void,
    before: string,
    after = "",
    placeholder = "text"
  ): void {
    const el = getTextareaElement(targetRef.value);
    const start = el?.selectionStart ?? currentValue.length;
    const end = el?.selectionEnd ?? currentValue.length;
    const selected = currentValue.slice(start, end) || placeholder;
    const nextValue = `${currentValue.slice(0, start)}${before}${selected}${after}${currentValue.slice(end)}`;
    update(nextValue);

    void nextTick(() => {
      const nextEl = getTextareaElement(targetRef.value);
      if (!nextEl) return;
      const cursor = start + before.length + selected.length + after.length;
      nextEl.focus();
      nextEl.setSelectionRange(cursor, cursor);
    });
  }

  function applyMessages(nextMessages: AdminNewsChatMessage[], animateLastAssistant = false): void {
    typingTimers.forEach(timer => clearInterval(timer));
    typingTimers.clear();
    messages.value = nextMessages;
    Object.keys(typedMessages).forEach(key => delete typedMessages[key]);

    nextMessages.forEach((message, index) => {
      const shouldAnimate = animateLastAssistant && message.role === "assistant" && index === nextMessages.length - 1;
      if (shouldAnimate) {
        animateMessage(message.id, message.content);
      } else {
        typedMessages[message.id] = message.content;
      }
    });
  }

  function animateMessage(id: string, content: string): void {
    const existingTimer = typingTimers.get(id);
    if (existingTimer) clearInterval(existingTimer);

    typedMessages[id] = "";
    let cursor = 0;
    const step = Math.max(1, Math.ceil(content.length / 110));
    const timer = setInterval(() => {
      cursor = Math.min(content.length, cursor + step);
      typedMessages[id] = content.slice(0, cursor);
      if (cursor >= content.length) {
        clearInterval(timer);
        typingTimers.delete(id);
      }
    }, 18);
    typingTimers.set(id, timer);
  }

  function displayMessageContent(message: AdminNewsChatMessage): string {
    return message.role === "assistant" ? (typedMessages[message.id] ?? message.content) : message.content;
  }

  function startPhaseLoop(): void {
    stopPhaseLoop();
    currentPhaseIndex.value = 0;
    phaseTimer = setInterval(() => {
      currentPhaseIndex.value = (currentPhaseIndex.value + 1) % phaseTexts.value.length;
    }, 1400);
  }

  function stopPhaseLoop(): void {
    if (!phaseTimer) return;
    clearInterval(phaseTimer);
    phaseTimer = null;
  }

  function resetDraftWorkspace(): void {
    draftArticle.value = null;
    messages.value = [];
    chatInput.value = "";
    draftLocale.value = "en";
    generateImages.value = true;
    includeVideoLinks.value = false;
    stopPhaseLoop();
    Object.keys(typedMessages).forEach(key => delete typedMessages[key]);
    typingTimers.forEach(timer => clearInterval(timer));
    typingTimers.clear();
  }

  async function handleSendMessage(): Promise<void> {
    const message = chatInput.value.trim();
    if (!message || !canChat.value) return;

    isChatLoading.value = true;
    startPhaseLoop();

    try {
      const payload: SendNewsChatMessagePayload = {
        message,
        locale: draftArticle.value?.locale || draftLocale.value,
        generate_images: generateImages.value,
        include_video_links: includeVideoLinks.value,
        article_snapshot: draftArticle.value,
        seo_snapshot: draftArticle.value?.seo || null,
      };

      const response = draftArticle.value?.id
        ? await appCore.news.continueChat(draftArticle.value.id, payload)
        : await appCore.news.startChat(payload);

      const studio = response.data.data as AdminNewsStudioResponse;
      draftArticle.value = studio.article;
      draftLocale.value = studio.article.locale || draftLocale.value;
      applyMessages(studio.messages || [], true);
      chatInput.value = "";
      await loadArticles(true);
      toast.success(response.data.message || t("admin.news.messages.generated", "Draft generated successfully."));
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.generateFailed", "Failed to generate draft.")));
    } finally {
      stopPhaseLoop();
      isChatLoading.value = false;
    }
  }

  watch(search, () => {
    currentPage.value = 1;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      void loadArticles(true);
    }, 300);
  });

  watch([statusFilter, localeFilter], () => {
    currentPage.value = 1;
    void loadArticles(true);
  });

  onMounted(() => {
    void loadArticles(true);
  });

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer);
    stopPhaseLoop();
    typingTimers.forEach(timer => clearInterval(timer));
    typingTimers.clear();
  });
</script>

<style scoped lang="scss">
  .news-prime {
    --news-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
    --news-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
    --news-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    --news-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

    position: relative;
    width: 100%;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(12px, 1.35vw, 22px);
    color: var(--ui-text-main);
    animation: news-enter 0.28s ease both;
  }

  .news-prime--busy::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    border-radius: 24px;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ui-primary-main) 7%, transparent), transparent);
    animation: news-sheen 1.35s ease infinite;
  }

  .news-prime__header,
  .news-prime__section-head,
  .news-prime__toolbar,
  .news-prime__bottom-actions,
  .news-prime-composer__bottom {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .news-prime__heading {
    min-width: 0;
  }

  .news-prime__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .news-prime__subtitle,
  .news-prime__section-subtitle,
  .news-prime-post-card__excerpt,
  .news-prime-filter-card__hint,
  .news-prime-message__head span,
  .news-prime-composer__bottom p,
  .news-prime-draft-card p {
    color: var(--ui-text-secondary);
  }

  .news-prime__subtitle,
  .news-prime__section-subtitle,
  .news-prime-composer__bottom p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.45;
  }

  .news-prime__header-actions,
  .news-prime__section-actions,
  .news-prime__view-toggle,
  .news-prime-post-card__actions,
  .news-prime-editor-toolbar,
  .news-prime-composer__settings {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .news-prime__tabs {
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
      border: 1px solid var(--news-glass-border);
      border-radius: 999px;
      color: var(--ui-text-secondary);
      background: var(--news-glass-bg);
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

  .news-prime__section,
  .news-prime-post-card,
  .news-prime-filter-card,
  .news-prime-composer,
  .news-prime-chat__stream,
  .news-prime-draft-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid var(--news-glass-border);
    border-radius: 22px;
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 10%, transparent), transparent 38%),
      linear-gradient(145deg, var(--news-glass-bg), var(--news-glass-bg-strong));
    box-shadow: var(--news-glass-shadow);
    backdrop-filter: blur(22px) saturate(135%);
    -webkit-backdrop-filter: blur(22px) saturate(135%);
  }

  .news-prime__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  .news-prime__section--chat {
    min-height: calc(100vh - 210px);
  }

  .news-prime__section-title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(19px, 1.5vw, 26px);
    font-weight: 840;
    line-height: 1.12;
    letter-spacing: -0.025em;
  }

  .news-prime__filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .news-prime-filter-card {
    min-height: 86px;
    padding: 12px;
    cursor: pointer;
    text-align: left;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .news-prime-filter-card:hover,
  .news-prime-filter-card.is-active {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 42%, var(--color-stroke-ui-light));
  }

  .news-prime-filter-card.is-active {
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 18%, transparent), transparent 42%),
      linear-gradient(145deg, var(--news-glass-bg), var(--news-glass-bg-strong));
  }

  .news-prime-filter-card__label {
    display: block;
    color: var(--ui-text-main);
    font-size: 17px;
    font-weight: 830;
  }

  .news-prime-filter-card__hint {
    display: block;
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.35;
  }

  .news-prime__toolbar {
    align-items: center;
  }

  .news-prime__search {
    min-width: min(100%, 360px);
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-card) 90%, transparent);

    :deep(.p-inputtext) {
      width: 100%;
      border: 0;
      background: transparent;
      box-shadow: none;
    }
  }

  .news-prime__toolbar-select {
    min-width: 180px;
  }

  .news-prime__posts {
    display: grid;
    gap: 10px;
  }

  .news-prime__posts.is-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .news-prime__posts.is-table .news-prime-post-card__body {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .news-prime-post-card {
    cursor: pointer;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .news-prime-post-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 36%, var(--color-stroke-ui-light));
  }

  .news-prime-post-card :deep(.p-card-body) {
    padding: 0;
  }

  .news-prime-post-card__body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 13px;
  }

  .news-prime__posts.is-grid .news-prime-post-card__body {
    grid-template-columns: 1fr;
    align-items: stretch;
    min-height: 190px;
  }

  .news-prime-post-card__main {
    min-width: 0;
  }

  .news-prime-post-card__meta {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    margin-bottom: 8px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .news-prime-post-card__title {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 830;
    line-height: 1.2;
  }

  .news-prime-post-card__excerpt {
    margin: 6px 0 0;
    display: -webkit-box;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.45;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .news-prime-empty {
    min-height: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .news-prime-empty i {
    color: var(--ui-primary-main);
    font-size: 28px;
  }

  .news-prime__skeleton-list {
    display: grid;
    gap: 10px;
  }

  .news-prime__paginator {
    align-self: center;
  }

  .news-prime__inner-tabs {
    :deep(.p-tabpanels),
    :deep(.p-tablist) {
      background: transparent;
    }

    :deep(.p-tabpanels) {
      padding: 12px 0 0;
    }
  }

  .news-prime-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .news-prime-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 780;
  }

  .news-prime-field--full {
    grid-column: 1 / -1;
  }

  .news-prime-field--with-action {
    position: relative;

    :deep(.p-button) {
      position: absolute;
      right: 6px;
      bottom: 3px;
    }

    :deep(.p-inputtext) {
      padding-right: 48px;
    }
  }

  .news-prime-field__label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .news-prime-content-editor {
    width: 100%;

    :deep(textarea) {
      min-height: 330px;
      font-size: 14px;
      line-height: 1.65;
    }
  }

  .news-prime__bottom-actions {
    justify-content: flex-end;
    padding-top: 4px;
  }

  .news-prime-chat {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
    gap: 12px;
    align-items: start;
  }

  .news-prime-chat__stream {
    min-height: 520px;
    max-height: calc(100vh - 330px);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .news-prime-message {
    width: min(760px, 92%);
    padding: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 18px;
    background: color-mix(in srgb, var(--ui-background-card) 88%, transparent);
  }

  .news-prime-message.is-user {
    align-self: flex-end;
    background: color-mix(in srgb, var(--ui-primary-main) 16%, var(--ui-background-card));
  }

  .news-prime-message__head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    font-size: 12px;
  }

  .news-prime-message__body {
    white-space: pre-wrap;
    color: var(--ui-text-main);
    font-size: 14px;
    line-height: 1.55;
  }

  .news-prime-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }

  .news-prime-dots i {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--ui-primary-main);
    animation: news-dot 0.9s ease infinite;
  }

  .news-prime-dots i:nth-child(2) {
    animation-delay: 0.12s;
  }

  .news-prime-dots i:nth-child(3) {
    animation-delay: 0.24s;
  }

  .news-prime-draft-card,
  .news-prime-composer {
    padding: 12px;
  }

  .news-prime-draft-card {
    cursor: pointer;
  }

  .news-prime-draft-card__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .news-prime-draft-card strong {
    color: var(--ui-text-main);
    font-size: 16px;
  }

  .news-prime-draft-card p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.4;
  }

  .news-prime-composer {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .news-prime-composer__settings {
    justify-content: flex-start;
  }

  .news-prime-composer__settings .news-prime-field {
    min-width: 180px;
  }

  .news-prime-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 760;
  }

  .news-prime-composer__input {
    width: 100%;
  }

  .news-prime-composer__bottom {
    align-items: center;
  }

  .news-prime-composer__bottom p {
    max-width: 620px;
  }

  @keyframes news-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes news-sheen {
    from {
      transform: translateX(-70%);
    }
    to {
      transform: translateX(70%);
    }
  }

  @keyframes news-dot {
    0%,
    80%,
    100% {
      opacity: 0.25;
      transform: translateY(0);
    }
    40% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  @media (max-width: 1180px) {
    .news-prime-chat {
      grid-template-columns: 1fr;
    }

    .news-prime-chat__stream {
      max-height: none;
    }
  }

  @media (max-width: 760px) {
    .news-prime {
      padding: 10px;
    }

    .news-prime-form-grid,
    .news-prime-post-card__body,
    .news-prime__posts.is-table .news-prime-post-card__body {
      grid-template-columns: 1fr;
    }

    .news-prime__header-actions,
    .news-prime__section-actions,
    .news-prime__bottom-actions,
    .news-prime__view-toggle {
      width: 100%;
      justify-content: stretch;
    }

    .news-prime__header-actions :deep(.p-button),
    .news-prime__section-actions :deep(.p-button),
    .news-prime__bottom-actions :deep(.p-button),
    .news-prime__view-toggle :deep(.p-button) {
      flex: 1;
    }
  }
</style>
