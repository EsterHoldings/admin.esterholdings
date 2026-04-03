<template>
  <div class="news-studio">
    <aside class="news-studio__sidebar">
      <div class="news-studio__sidebar-head">
        <div>
          <div class="news-studio__eyebrow">{{ t("admin.news.sidebarLabel", "Draft library") }}</div>
          <div class="news-studio__sidebar-title">{{ t("admin.news.sidebarTitle", "News drafts") }}</div>
        </div>

        <UiButtonDefault
          v-if="canCreate"
          state="info--small"
          class="!w-[42px]"
          @click="handleCreateNew">
          <template #icon-left>
            <UiIconPlus />
          </template>
        </UiButtonDefault>
      </div>

      <div class="news-studio__search">
        <UiIconSearch />
        <input
          v-model="search"
          type="text"
          class="news-studio__search-input"
          :placeholder="t('admin.news.fields.search', 'Search drafts...')" />
      </div>

      <div class="news-studio__filters">
        <button
          v-for="filterOption in filterOptions"
          :key="filterOption.value"
          type="button"
          class="news-studio__filter"
          :class="{ 'is-active': statusFilter === filterOption.value }"
          @click="statusFilter = filterOption.value">
          {{ filterOption.label }}
        </button>
      </div>

      <div class="news-studio__sidebar-meta">
        <span>{{ t("admin.news.testMode", "Test mode uses the OpenAI key configured on the server.") }}</span>
        <div class="news-studio__sidebar-meta-right">
          <span>{{ articles.length }}/{{ totalRows }}</span>
          <button
            type="button"
            class="news-studio__refresh"
            @click="loadArticles(true)">
            <UiIconUpdate :spinning="isListLoading" />
          </button>
        </div>
      </div>

      <div
        v-if="isListLoading && !articles.length"
        class="news-studio__sidebar-empty">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else-if="!articles.length"
        class="news-studio__sidebar-empty">
        {{ t("admin.news.listEmpty", "No news articles found yet.") }}
      </div>

      <div
        v-else
        class="news-studio__sidebar-list">
        <button
          v-for="article in articles"
          :key="article.id"
          type="button"
          class="news-studio__article"
          :class="{ 'is-active': selectedArticleId === article.id }"
          @click="selectArticle(article.id)">
          <div class="news-studio__article-top">
            <span
              class="news-studio__status-pill"
              :data-status="article.effective_status">
              {{ statusLabel(article.effective_status) }}
            </span>
            <span>{{ article.locale.toUpperCase() }}</span>
          </div>

          <div class="news-studio__article-title">{{ article.title || article.slug }}</div>
          <div class="news-studio__article-excerpt">{{ article.excerpt || article.slug }}</div>
          <div class="news-studio__article-date">{{ formatDate(article.updated_at) }}</div>
        </button>
      </div>
    </aside>

    <section class="news-studio__body">
      <div class="news-studio__hero">
        <div class="news-studio__hero-main">
          <div class="news-studio__eyebrow">
            {{
              selectedArticleId
                ? t("admin.news.workspaceDraft", "Draft workspace")
                : t("admin.news.workspaceNew", "New conversation")
            }}
          </div>
          <div class="news-studio__hero-title">
            {{ form.title || t("admin.news.emptyTitle", "Start with a prompt and GPT will build the first draft") }}
          </div>
          <div class="news-studio__hero-subtitle">
            {{
              selectedArticleId
                ? t("admin.news.workspaceSubtitle", "Keep editing the same draft through chat or manual fields.")
                : t(
                    "admin.news.workspaceSubtitleNew",
                    "Describe the story you need, and the assistant will prepare copy, visuals and SEO."
                  )
            }}
          </div>

          <div class="news-studio__hero-meta">
            <span
              v-if="selectedArticleId"
              class="news-studio__status-pill"
              :data-status="form.status">
              {{ statusLabel(form.status) }}
            </span>
            <span class="news-studio__hero-chip">{{ form.locale.toUpperCase() }}</span>
            <span
              v-if="selectedArticleId"
              class="news-studio__hero-chip">
              {{ formatDate(publishedAtInput ? new Date(publishedAtInput).toISOString() : null) }}
            </span>
          </div>
        </div>

        <div class="news-studio__hero-actions">
          <UiButtonDefault
            v-if="selectedArticleId && canDelete"
            state="danger--outline"
            :disabled="isDeleting"
            @click="handleDelete">
            {{ t("admin.news.actions.delete", "Delete") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canSave"
            state="secondary"
            :disabled="isSaving"
            @click="persistArticle('draft')">
            {{ t("admin.news.actions.saveDraft", "Save Draft") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canSave"
            state="success"
            :disabled="isSaving"
            @click="persistArticle('published')">
            {{ t("admin.news.actions.publishNow", "Publish Now") }}
          </UiButtonDefault>

          <UiButtonDefault
            v-if="canSave"
            state="info"
            :disabled="isSaving"
            @click="persistArticle('scheduled')">
            {{ t("admin.news.actions.schedule", "Schedule") }}
          </UiButtonDefault>
        </div>
      </div>

      <div class="news-studio__content">
        <div class="news-studio__chat-column">
          <div
            v-if="isArticleLoading"
            class="news-studio__article-loading">
            <UiIconSpinnerDefault />
          </div>

          <div class="news-studio__chat-shell">
            <div class="news-studio__chat-head">
              <div class="news-studio__chat-head-main">
                <div class="news-studio__chat-icon">
                  <UiIconChat />
                </div>

                <div>
                  <div class="news-studio__section-title">{{ t("admin.news.chatTitle", "Editorial chat") }}</div>
                  <div class="news-studio__section-subtitle">
                    {{ t("admin.news.chatSubtitle", "Ask for a new article or request changes to the current draft.") }}
                  </div>
                </div>
              </div>

              <div class="news-studio__toggle-group">
                <label class="news-studio__toggle">
                  <UiSwitchToggle v-model="generateImages" />
                  <span>{{ t("admin.news.fields.generateImages", "Images") }}</span>
                </label>

                <label class="news-studio__toggle">
                  <UiSwitchToggle v-model="includeVideoLinks" />
                  <span>{{ t("admin.news.fields.includeVideoLinks", "Videos") }}</span>
                </label>
              </div>
            </div>

            <div class="news-studio__messages">
              <div
                v-if="!messages.length && !isChatLoading"
                class="news-studio__chat-empty">
                <UiIconNews />
                <div>
                  {{ t("admin.news.chatEmpty", "No messages yet. Ask GPT to generate your first news draft.") }}
                </div>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="news-studio__message"
                :class="`is-${message.role}`">
                <div class="news-studio__message-role">
                  {{
                    message.role === "assistant"
                      ? t("admin.news.roles.assistant", "GPT Editor")
                      : t("admin.news.roles.user", "You")
                  }}
                </div>
                <div class="news-studio__message-body">{{ displayMessageContent(message) }}</div>
                <div class="news-studio__message-time">{{ formatDate(message.created_at, true) }}</div>
              </div>

              <div
                v-if="isChatLoading"
                class="news-studio__message is-assistant is-pending">
                <div class="news-studio__message-role">{{ t("admin.news.roles.assistant", "GPT Editor") }}</div>
                <div class="news-studio__message-body">
                  <div class="news-studio__phase">{{ currentPhase }}</div>
                  <div class="news-studio__dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="news-studio__composer-shell">
            <div class="news-studio__composer-top">
              <label class="news-studio__field news-studio__field--compact">
                <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                <select
                  v-model="form.locale"
                  class="news-studio__select">
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                  <option value="uk">UK</option>
                </select>
              </label>
            </div>

            <textarea
              v-model="chatInput"
              class="news-studio__composer-textarea"
              :placeholder="
                t(
                  'admin.news.chatPlaceholder',
                  'Example: Create a market update about the ECB meeting, add a neutral tone, one hero image and full SEO.'
                )
              "
              @keydown.enter.exact.prevent="handleSendMessage" />

            <div class="news-studio__composer-bottom">
              <div class="news-studio__composer-hint">
                {{
                  selectedArticleId
                    ? t(
                        "admin.news.chatHintExisting",
                        "This message will revise the current draft and keep the latest manual edits in context."
                      )
                    : t("admin.news.chatHintNew", "The first message will create a new draft and open it immediately.")
                }}
              </div>

              <UiButtonDefault
                state="info"
                :disabled="!canChat || isChatLoading"
                @click="handleSendMessage">
                {{
                  isChatLoading
                    ? t("admin.news.actions.generating", "Generating...")
                    : t("admin.news.actions.send", "Send to GPT")
                }}
              </UiButtonDefault>
            </div>
          </div>
        </div>

        <aside class="news-studio__details-column">
          <div class="news-studio__details-switch">
            <button
              type="button"
              class="news-studio__details-tab"
              :class="{ 'is-active': activeDetailsTab === 'draft' }"
              @click="activeDetailsTab = 'draft'">
              {{ t("admin.news.editorTitle", "Draft editor") }}
            </button>
            <button
              type="button"
              class="news-studio__details-tab"
              :class="{ 'is-active': activeDetailsTab === 'seo' }"
              @click="activeDetailsTab = 'seo'">
              {{ t("admin.news.seoTitle", "SEO settings") }}
            </button>
          </div>

          <div
            v-if="activeDetailsTab === 'draft'"
            class="news-studio__details-card">
            <div class="news-studio__details-section">
              <div class="news-studio__section-title">{{ t("admin.news.editorTitle", "Draft editor") }}</div>
              <div class="news-studio__section-subtitle">
                {{
                  t(
                    "admin.news.editorSubtitle",
                    "You can edit the article manually at any point, then continue the conversation."
                  )
                }}
              </div>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">{{ t("admin.news.fields.title", "Title") }}</div>
              <div class="news-studio__form-grid">
                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.fields.title", "Title") }}</span>
                  <input
                    v-model="form.title"
                    type="text"
                    class="news-studio__input"
                    :placeholder="t('admin.news.placeholders.title', 'Generated title will appear here')" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.fields.slug", "Slug") }}</span>
                  <input
                    v-model="form.slug"
                    type="text"
                    class="news-studio__input"
                    :disabled="Boolean(selectedArticleId)"
                    :placeholder="t('admin.news.placeholders.slug', 'news-slug')" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.fields.publishedAt", "Publication date") }}</span>
                  <input
                    v-model="publishedAtInput"
                    type="datetime-local"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.fields.excerpt", "Excerpt") }}</span>
                  <textarea
                    v-model="form.excerpt"
                    rows="4"
                    class="news-studio__textarea"
                    :placeholder="
                      t('admin.news.placeholders.excerpt', 'Short article summary for cards and previews')
                    " />
                </label>
              </div>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">{{ t("admin.news.fields.content", "Content") }}</div>
              <label class="news-studio__field">
                <span>{{ t("admin.news.fields.content", "Content") }}</span>
                <textarea
                  v-model="form.content"
                  rows="18"
                  class="news-studio__textarea news-studio__textarea--content"
                  :placeholder="
                    t('admin.news.placeholders.content', 'The article body will appear here in markdown format')
                  " />
              </label>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">
                {{ t("admin.news.fields.coverImage", "Cover image URL") }}
              </div>
              <div class="news-studio__form-grid">
                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.fields.coverImage", "Cover image URL") }}</span>
                  <input
                    v-model="form.cover_image_url"
                    type="text"
                    class="news-studio__input"
                    :placeholder="t('admin.news.placeholders.coverImage', 'https://...')" />
                </label>

                <div
                  v-if="form.cover_image_url"
                  class="news-studio__cover-preview news-studio__field--full">
                  <img
                    :src="form.cover_image_url"
                    alt="cover preview"
                    class="news-studio__cover-image" />
                </div>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.fields.galleryImages", "Gallery images") }}</span>
                  <textarea
                    v-model="galleryImagesInput"
                    rows="5"
                    class="news-studio__textarea"
                    :placeholder="t('admin.news.placeholders.galleryImages', 'One URL per line')" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.fields.videoLinks", "Video links") }}</span>
                  <textarea
                    v-model="videoLinksInput"
                    rows="5"
                    class="news-studio__textarea"
                    :placeholder="t('admin.news.placeholders.videoLinks', 'One URL per line')" />
                </label>
              </div>
            </div>
          </div>

          <div
            v-else
            class="news-studio__details-card">
            <div class="news-studio__details-section">
              <div class="news-studio__section-title">{{ t("admin.news.seoTitle", "SEO settings") }}</div>
              <div class="news-studio__section-subtitle">
                {{ t("admin.news.seoSubtitle", "Manage metadata, social cards and indexing fields in full.") }}
              </div>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">{{ t("admin.news.seo.metaTitle", "Meta title") }}</div>
              <div class="news-studio__form-grid">
                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.metaTitle", "Meta title") }}</span>
                  <input
                    v-model="seo.meta_title"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.metaDescription", "Meta description") }}</span>
                  <textarea
                    v-model="seo.meta_description"
                    rows="4"
                    class="news-studio__textarea" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.metaKeywords", "Meta keywords") }}</span>
                  <input
                    v-model="metaKeywordsInput"
                    type="text"
                    class="news-studio__input"
                    :placeholder="t('admin.news.placeholders.metaKeywords', 'forex, market outlook, ECB')" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.canonicalUrl", "Canonical URL") }}</span>
                  <input
                    v-model="seo.canonical_url"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.robots", "Robots") }}</span>
                  <input
                    v-model="seo.robots"
                    type="text"
                    class="news-studio__input"
                    :placeholder="t('admin.news.placeholders.robots', 'index,follow')" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.schemaType", "Schema type") }}</span>
                  <input
                    v-model="seo.schema_type"
                    type="text"
                    class="news-studio__input"
                    :placeholder="t('admin.news.placeholders.schemaType', 'NewsArticle')" />
                </label>
              </div>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">Open Graph</div>
              <div class="news-studio__form-grid">
                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.ogTitle", "Open Graph title") }}</span>
                  <input
                    v-model="seo.og_title"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.ogImageUrl", "Open Graph image") }}</span>
                  <input
                    v-model="seo.og_image_url"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.ogDescription", "Open Graph description") }}</span>
                  <textarea
                    v-model="seo.og_description"
                    rows="4"
                    class="news-studio__textarea" />
                </label>
              </div>
            </div>

            <div class="news-studio__details-section">
              <div class="news-studio__subsection-title">Twitter</div>
              <div class="news-studio__form-grid">
                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.twitterTitle", "Twitter title") }}</span>
                  <input
                    v-model="seo.twitter_title"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field">
                  <span>{{ t("admin.news.seo.twitterImageUrl", "Twitter image") }}</span>
                  <input
                    v-model="seo.twitter_image_url"
                    type="text"
                    class="news-studio__input" />
                </label>

                <label class="news-studio__field news-studio__field--full">
                  <span>{{ t("admin.news.seo.twitterDescription", "Twitter description") }}</span>
                  <textarea
                    v-model="seo.twitter_description"
                    rows="4"
                    class="news-studio__textarea" />
                </label>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import type {
    AdminNewsArticle,
    AdminNewsChatMessage,
    AdminNewsStudioResponse,
    NewsSeoPayload,
    NewsStatus,
    SendNewsChatMessagePayload,
    UpsertNewsArticlePayload,
  } from "~/composables/core/modules/news/news.types";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconNews from "~/components/ui/UiIconNews.vue";
  import UiIconPlus from "~/components/ui/UiIconPlus.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  const props = withDefaults(
    defineProps<{
      articleId?: string | null;
    }>(),
    {
      articleId: null,
    }
  );

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t } = useI18n({ useScope: "global" });

  const articles = ref<AdminNewsArticle[]>([]);
  const totalRows = ref(0);
  const messages = ref<AdminNewsChatMessage[]>([]);
  const search = ref("");
  const statusFilter = ref<"all" | NewsStatus>("all");
  const chatInput = ref("");
  const generateImages = ref(true);
  const includeVideoLinks = ref(false);
  const galleryImagesInput = ref("");
  const videoLinksInput = ref("");
  const metaKeywordsInput = ref("");
  const publishedAtInput = ref("");
  const activeDetailsTab = ref<"draft" | "seo">("draft");

  const isListLoading = ref(false);
  const isArticleLoading = ref(false);
  const isChatLoading = ref(false);
  const isSaving = ref(false);
  const isDeleting = ref(false);

  const form = reactive({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    locale: "en",
    cover_image_url: "",
    status: "draft" as NewsStatus,
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

  const filterOptions = computed(() => [
    { value: "all" as const, label: t("admin.news.filters.all", "All") },
    { value: "draft" as const, label: t("admin.news.filters.draft", "Drafts") },
    { value: "scheduled" as const, label: t("admin.news.filters.scheduled", "Scheduled") },
    { value: "published" as const, label: t("admin.news.filters.published", "Published") },
  ]);

  const phaseTexts = computed(() => [
    t("admin.news.phases.analyzing", "Analyzing your request"),
    t("admin.news.phases.writing", "Writing the article draft"),
    t("admin.news.phases.seo", "Preparing SEO metadata"),
    t("admin.news.phases.finalizing", "Finalizing the newsroom output"),
  ]);

  const currentPhaseIndex = ref(0);
  const currentPhase = computed(() => phaseTexts.value[currentPhaseIndex.value] || phaseTexts.value[0]);
  const selectedArticleId = computed(() =>
    props.articleId && props.articleId !== "" ? props.articleId : form.id || null
  );

  const canCreate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-news")
  );
  const canUpdate = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-news")
  );
  const canDelete = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-news")
  );
  const canSave = computed(() => (selectedArticleId.value ? canUpdate.value : canCreate.value));
  const canChat = computed(() => (selectedArticleId.value ? canUpdate.value : canCreate.value));

  const typedMessages = reactive<Record<string, string>>({});
  const typingTimers = new Map<string, ReturnType<typeof setInterval>>();
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let phaseTimer: ReturnType<typeof setInterval> | null = null;

  function resetDraft(): void {
    form.id = "";
    form.title = "";
    form.slug = "";
    form.excerpt = "";
    form.content = "";
    form.locale = "en";
    form.cover_image_url = "";
    form.status = "draft";
    galleryImagesInput.value = "";
    videoLinksInput.value = "";
    publishedAtInput.value = "";
    metaKeywordsInput.value = "";
    activeDetailsTab.value = "draft";
    applySeo(null);
    messages.value = [];
    Object.keys(typedMessages).forEach(key => delete typedMessages[key]);
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

  function applyArticle(article: AdminNewsArticle | null): void {
    if (!article) {
      resetDraft();
      return;
    }

    form.id = article.id;
    form.title = article.title || "";
    form.slug = article.slug || "";
    form.excerpt = article.excerpt || "";
    form.content = article.content || "";
    form.locale = article.locale || "en";
    form.cover_image_url = article.cover_image_url || "";
    form.status = article.status || "draft";
    galleryImagesInput.value = (article.gallery_images || []).join("\n");
    videoLinksInput.value = (article.video_links || []).join("\n");
    publishedAtInput.value = toDatetimeLocalValue(article.published_at);
    applySeo(article.seo);
  }

  function resolveApiErrorMessage(error: any, fallback: string): string {
    return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
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
        status: statusFilter.value === "all" ? null : statusFilter.value,
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

  async function loadArticle(articleId: string): Promise<void> {
    if (!articleId) {
      resetDraft();
      return;
    }

    isArticleLoading.value = true;

    try {
      const [articleResponse, messagesResponse] = await Promise.all([
        appCore.news.getById(articleId),
        appCore.news.getMessages(articleId),
      ]);

      applyArticle(articleResponse.data.data as AdminNewsArticle);
      applyMessages(messagesResponse.data.data || []);
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.loadOneFailed", "Failed to load draft.")));
    } finally {
      isArticleLoading.value = false;
    }
  }

  function applyMessages(nextMessages: AdminNewsChatMessage[], animateLastAssistant = false): void {
    typingTimers.forEach(timer => clearInterval(timer));
    typingTimers.clear();
    messages.value = nextMessages;
    Object.keys(typedMessages).forEach(key => delete typedMessages[key]);

    nextMessages.forEach((message, index) => {
      const isAnimatedAssistant =
        animateLastAssistant && message.role === "assistant" && index === nextMessages.length - 1;

      if (isAnimatedAssistant) {
        animateMessage(message.id, message.content);
      } else {
        typedMessages[message.id] = message.content;
      }
    });
  }

  function animateMessage(id: string, content: string): void {
    const existing = typingTimers.get(id);
    if (existing) {
      clearInterval(existing);
    }

    typedMessages[id] = "";
    let cursor = 0;
    const step = Math.max(1, Math.ceil(content.length / 120));

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
    if (message.role !== "assistant") {
      return message.content;
    }

    return typedMessages[message.id] ?? message.content;
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

  function buildArticleSnapshot(): Partial<AdminNewsArticle> {
    return {
      id: form.id || undefined,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      locale: form.locale,
      cover_image_url: form.cover_image_url || null,
      gallery_images: parseMultiline(galleryImagesInput.value),
      video_links: parseMultiline(videoLinksInput.value),
      status: form.status,
      published_at: publishedAtInput.value ? new Date(publishedAtInput.value).toISOString() : null,
      seo: buildSeoPayload(),
      effective_status: form.status,
      meta: {},
      created_at: "",
      updated_at: "",
    };
  }

  function buildUpsertPayload(status: NewsStatus): UpsertNewsArticlePayload {
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
      meta: {},
    };
  }

  async function persistArticle(status: NewsStatus): Promise<void> {
    if (!canSave.value) {
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
      const payload = buildUpsertPayload(status);
      const response = form.id ? await appCore.news.update(form.id, payload) : await appCore.news.create(payload);

      const article = response.data.data as AdminNewsArticle;
      applyArticle(article);
      await loadArticles(true);

      if (!props.articleId || props.articleId !== article.id) {
        await navigateTo(localePath(`/news/${article.id}`));
      }

      toast.success(response.data.message || t("admin.news.messages.saved", "News article saved."));
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.saveFailed", "Failed to save news article.")));
    } finally {
      isSaving.value = false;
    }
  }

  async function handleSendMessage(): Promise<void> {
    const message = chatInput.value.trim();
    if (!message) {
      toast.error(t("admin.news.messages.promptRequired", "Write a prompt for GPT first."));
      return;
    }

    if (!canChat.value) {
      return;
    }

    isChatLoading.value = true;
    startPhaseLoop();

    try {
      const payload: SendNewsChatMessagePayload = {
        message,
        locale: form.locale,
        generate_images: generateImages.value,
        include_video_links: includeVideoLinks.value,
        article_snapshot: selectedArticleId.value ? buildArticleSnapshot() : null,
        seo_snapshot: selectedArticleId.value ? buildSeoPayload() : null,
      };

      const response = selectedArticleId.value
        ? await appCore.news.continueChat(selectedArticleId.value, payload)
        : await appCore.news.startChat(payload);

      const studio = response.data.data as AdminNewsStudioResponse;
      applyArticle(studio.article);
      applyMessages(studio.messages, true);
      chatInput.value = "";
      activeDetailsTab.value = "draft";
      await loadArticles(true);

      if (!props.articleId || props.articleId !== studio.article.id) {
        await navigateTo(localePath(`/news/${studio.article.id}`));
      }

      toast.success(response.data.message || t("admin.news.messages.generated", "Draft generated successfully."));
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t("admin.news.messages.generateFailed", "Failed to generate draft.")));
    } finally {
      stopPhaseLoop();
      isChatLoading.value = false;
    }
  }

  async function handleDelete(): Promise<void> {
    if (!form.id || !canDelete.value) {
      return;
    }

    isDeleting.value = true;

    try {
      const response = await appCore.news.delete(form.id);
      resetDraft();
      await loadArticles(true);
      await navigateTo(localePath("/news"));
      toast.success(response.data.message || t("admin.news.messages.deleted", "News article deleted."));
    } catch (error) {
      toast.error(
        resolveApiErrorMessage(error, t("admin.news.messages.deleteFailed", "Failed to delete news article."))
      );
    } finally {
      isDeleting.value = false;
    }
  }

  async function selectArticle(id: string): Promise<void> {
    await navigateTo(localePath(`/news/${id}`));
  }

  async function handleCreateNew(): Promise<void> {
    resetDraft();
    if (props.articleId) {
      await navigateTo(localePath("/news"));
    }
  }

  function statusLabel(status: string): string {
    return (
      {
        draft: t("admin.news.filters.draft", "Drafts"),
        scheduled: t("admin.news.filters.scheduled", "Scheduled"),
        published: t("admin.news.filters.published", "Published"),
      }[status] || status
    );
  }

  function formatDate(value: string | null | undefined, withTime = false): string {
    if (!value) {
      return t("admin.news.noDate", "No date");
    }

    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
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

  function startPhaseLoop(): void {
    stopPhaseLoop();
    currentPhaseIndex.value = 0;
    phaseTimer = setInterval(() => {
      currentPhaseIndex.value = (currentPhaseIndex.value + 1) % phaseTexts.value.length;
    }, 1400);
  }

  function stopPhaseLoop(): void {
    if (phaseTimer) {
      clearInterval(phaseTimer);
      phaseTimer = null;
    }
  }

  watch(
    () => props.articleId,
    async articleId => {
      activeDetailsTab.value = "draft";

      if (articleId && articleId !== "") {
        await loadArticle(articleId);
      } else {
        resetDraft();
      }
    },
    { immediate: true }
  );

  watch([search, statusFilter], () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      loadArticles(true);
    }, 250);
  });

  onMounted(async () => {
    await loadArticles(true);
  });

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    stopPhaseLoop();
    typingTimers.forEach(timer => clearInterval(timer));
    typingTimers.clear();
  });
</script>

<style scoped lang="scss">
  .news-studio {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 24px;
    align-items: start;

    @media (max-width: 1280px) {
      grid-template-columns: 1fr;
    }
  }

  .news-studio__sidebar,
  .news-studio__hero,
  .news-studio__chat-shell,
  .news-studio__composer-shell,
  .news-studio__details-switch,
  .news-studio__details-card {
    border: 1px solid rgba(107, 133, 234, 0.18);
    background: linear-gradient(180deg, rgba(18, 28, 78, 0.94), rgba(10, 17, 56, 0.96));
    border-radius: 24px;
    color: var(--ui-text-main);
    box-shadow: 0 24px 70px rgba(7, 12, 38, 0.24);
  }

  .news-studio__sidebar {
    padding: 20px;
    position: sticky;
    top: 12px;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;

    @media (max-width: 1280px) {
      position: static;
      max-height: none;
    }
  }

  .news-studio__body {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  .news-studio__hero {
    padding: 26px 28px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;

    @media (max-width: 960px) {
      flex-direction: column;
    }
  }

  .news-studio__content {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(360px, 0.92fr);
    gap: 24px;
    align-items: start;

    @media (max-width: 1480px) {
      grid-template-columns: 1fr;
    }
  }

  .news-studio__chat-column,
  .news-studio__details-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }

  .news-studio__chat-column {
    position: relative;
  }

  .news-studio__sidebar-head,
  .news-studio__chat-head,
  .news-studio__composer-top,
  .news-studio__composer-bottom,
  .news-studio__hero-actions,
  .news-studio__sidebar-meta,
  .news-studio__sidebar-meta-right,
  .news-studio__chat-head-main,
  .news-studio__toggle-group,
  .news-studio__hero-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .news-studio__sidebar-head,
  .news-studio__sidebar-meta,
  .news-studio__hero-actions,
  .news-studio__composer-bottom {
    justify-content: space-between;
  }

  .news-studio__eyebrow {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: rgba(171, 185, 255, 0.72);
  }

  .news-studio__sidebar-title,
  .news-studio__section-title,
  .news-studio__hero-title {
    font-weight: 700;
    color: #fff;
  }

  .news-studio__sidebar-title,
  .news-studio__section-title {
    font-size: 1.08rem;
  }

  .news-studio__hero-title {
    margin-top: 8px;
    font-size: clamp(1.45rem, 2.3vw, 2.1rem);
    line-height: 1.15;
    max-width: 900px;
  }

  .news-studio__hero-subtitle,
  .news-studio__section-subtitle,
  .news-studio__article-excerpt,
  .news-studio__sidebar-meta,
  .news-studio__composer-hint,
  .news-studio__message-time {
    color: rgba(199, 208, 255, 0.72);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .news-studio__hero-meta {
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .news-studio__hero-chip,
  .news-studio__status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(12, 19, 56, 0.84);
    border: 1px solid rgba(107, 133, 234, 0.18);
    color: rgba(225, 231, 255, 0.88);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .news-studio__status-pill[data-status="draft"] {
    background: rgba(145, 160, 205, 0.14);
    border-color: rgba(145, 160, 205, 0.28);
  }

  .news-studio__status-pill[data-status="scheduled"] {
    background: rgba(255, 191, 88, 0.15);
    border-color: rgba(255, 191, 88, 0.32);
    color: #ffd784;
  }

  .news-studio__status-pill[data-status="published"] {
    background: rgba(78, 207, 132, 0.15);
    border-color: rgba(78, 207, 132, 0.32);
    color: #9df2ba;
  }

  .news-studio__search {
    margin-top: 18px;
    height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    border-radius: 16px;
    background: rgba(7, 12, 38, 0.76);
    border: 1px solid rgba(107, 133, 234, 0.16);
  }

  .news-studio__search-input,
  .news-studio__input,
  .news-studio__select,
  .news-studio__textarea,
  .news-studio__composer-textarea {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(107, 133, 234, 0.16);
    background: rgba(7, 12, 38, 0.76);
    color: var(--ui-text-main);
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      border-color: rgba(113, 158, 223, 0.72);
      box-shadow: 0 0 0 3px rgba(113, 158, 223, 0.14);
    }
  }

  .news-studio__search-input {
    border: 0;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  .news-studio__filters {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .news-studio__filter,
  .news-studio__details-tab {
    border: 1px solid rgba(107, 133, 234, 0.18);
    background: rgba(7, 12, 38, 0.76);
    color: rgba(218, 225, 255, 0.82);
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 0.82rem;
    font-weight: 600;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    &.is-active {
      background: rgba(113, 158, 223, 0.18);
      border-color: rgba(113, 158, 223, 0.42);
      color: #fff;
    }
  }

  .news-studio__sidebar-meta {
    margin-top: 18px;
    align-items: flex-start;
  }

  .news-studio__sidebar-meta-right {
    flex-shrink: 0;
  }

  .news-studio__refresh {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(107, 133, 234, 0.16);
    background: rgba(7, 12, 38, 0.76);
  }

  .news-studio__sidebar-list {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: auto;
    padding-right: 4px;
  }

  .news-studio__sidebar-empty {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: rgba(199, 208, 255, 0.72);
  }

  .news-studio__article {
    width: 100%;
    text-align: left;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(107, 133, 234, 0.12);
    background: rgba(7, 12, 38, 0.76);
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(113, 158, 223, 0.34);
    }

    &.is-active {
      border-color: rgba(113, 158, 223, 0.48);
      background: linear-gradient(180deg, rgba(29, 46, 117, 0.94), rgba(15, 26, 74, 0.96));
    }
  }

  .news-studio__article-top,
  .news-studio__article-date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 0.78rem;
    color: rgba(192, 204, 255, 0.72);
  }

  .news-studio__article-title {
    margin-top: 12px;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
  }

  .news-studio__article-excerpt {
    margin-top: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-studio__article-date {
    margin-top: 12px;
    justify-content: flex-start;
  }

  .news-studio__chat-shell,
  .news-studio__composer-shell,
  .news-studio__details-card {
    padding: 24px;
  }

  .news-studio__chat-shell {
    min-height: 640px;
    display: flex;
    flex-direction: column;
  }

  .news-studio__chat-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(113, 158, 223, 0.16);
    border: 1px solid rgba(113, 158, 223, 0.24);
  }

  .news-studio__toggle-group {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .news-studio__toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(22, 33, 86, 0.78);
    color: rgba(218, 225, 255, 0.84);
  }

  .news-studio__messages {
    margin-top: 20px;
    flex: 1;
    min-height: 420px;
    max-height: 760px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 4px;
  }

  .news-studio__chat-empty {
    min-height: 260px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: rgba(199, 208, 255, 0.72);
  }

  .news-studio__message {
    max-width: min(100%, 900px);
    padding: 18px 20px;
    border-radius: 20px;
    border: 1px solid rgba(107, 133, 234, 0.12);
    background: rgba(14, 22, 62, 0.9);

    &.is-user {
      align-self: flex-end;
      background: linear-gradient(180deg, rgba(50, 77, 169, 0.94), rgba(39, 62, 145, 0.96));
    }

    &.is-assistant {
      align-self: flex-start;
    }

    &.is-pending {
      min-width: 300px;
    }
  }

  .news-studio__message-role {
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(181, 194, 255, 0.74);
  }

  .news-studio__message-body {
    margin-top: 12px;
    color: #fff;
    white-space: pre-wrap;
    line-height: 1.68;
    font-size: 0.97rem;
  }

  .news-studio__message-time {
    margin-top: 12px;
  }

  .news-studio__phase {
    font-weight: 600;
  }

  .news-studio__dots {
    margin-top: 14px;
    display: inline-flex;
    gap: 8px;

    span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      animation: news-studio-pulse 1.2s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }

  .news-studio__composer-top {
    justify-content: space-between;
    align-items: flex-end;
  }

  .news-studio__composer-textarea {
    margin-top: 16px;
    min-height: 160px;
    padding: 18px 20px;
    resize: vertical;
  }

  .news-studio__composer-bottom {
    margin-top: 16px;
    align-items: flex-end;
    gap: 18px;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .news-studio__composer-hint {
    max-width: 760px;
  }

  .news-studio__details-switch {
    padding: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .news-studio__details-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .news-studio__details-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(107, 133, 234, 0.12);

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  .news-studio__subsection-title {
    font-size: 0.88rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(181, 194, 255, 0.74);
  }

  .news-studio__form-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  }

  .news-studio__field {
    display: grid;
    gap: 8px;
    font-size: 0.82rem;
    color: rgba(199, 208, 255, 0.82);
  }

  .news-studio__field--compact {
    width: 120px;
  }

  .news-studio__field--full {
    grid-column: 1 / -1;
  }

  .news-studio__input,
  .news-studio__select {
    min-height: 48px;
    padding: 0 16px;
  }

  .news-studio__textarea {
    min-height: 120px;
    padding: 16px;
    resize: vertical;
  }

  .news-studio__textarea--content {
    min-height: 420px;
  }

  .news-studio__cover-preview {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(107, 133, 234, 0.14);
    background: rgba(7, 12, 38, 0.76);
  }

  .news-studio__cover-image {
    width: 100%;
    max-height: 260px;
    object-fit: cover;
    display: block;
  }

  .news-studio__article-loading {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    background: rgba(7, 12, 38, 0.54);
    backdrop-filter: blur(7px);
  }

  @keyframes news-studio-pulse {
    0%,
    80%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }
    40% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }
</style>
