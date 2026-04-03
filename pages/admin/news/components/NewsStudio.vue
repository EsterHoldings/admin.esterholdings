<template>
  <div class="news-workspace">
    <aside class="news-workspace__tabs">
      <TabsAsList
        :tabsList="workspaceTabs"
        :activeTabIndex="activeTabIndex"
        @selectTab="handleSelectTab" />
    </aside>

    <section class="news-workspace__panel">
      <div
        v-if="activeWorkspace === 'library'"
        class="news-workspace__section">
        <div class="news-workspace__section-head">
          <div>
            <div class="news-workspace__eyebrow">
              {{ t("admin.news.library.label", "News Library") }}
            </div>
            <h2 class="news-workspace__title">{{ t("admin.news.library.title", "All News") }}</h2>
            <p class="news-workspace__subtitle">
              {{
                t(
                  "admin.news.library.subtitle",
                  "Switch between draft, published and archived articles, preview them, and open the full editor when needed."
                )
              }}
            </p>
          </div>
        </div>

        <div class="news-workspace__filters-row">
          <div class="news-workspace__filters">
            <button
              v-for="filterOption in filterOptions"
              :key="filterOption.value"
              type="button"
              class="news-workspace__filter"
              :class="{ 'is-active': statusFilter === filterOption.value }"
              @click="setStatusFilter(filterOption.value)">
              {{ filterOption.label }}
            </button>
          </div>

          <UiButtonDefault
            v-if="canCreate"
            state="success"
            @click="openDraftWorkspace">
            <template #icon-left>
              <UiIconPlus />
            </template>
            {{ t("admin.news.actions.createDraft", "Create Draft") }}
          </UiButtonDefault>
        </div>

        <div class="news-workspace__toolbar">
          <label class="news-workspace__search">
            <UiIconSearch />
            <input
              v-model="search"
              type="text"
              class="news-workspace__search-input"
              :placeholder="t('admin.news.fields.search', 'Search by title, slug or excerpt')" />
          </label>

          <div class="news-workspace__toolbar-actions">
            <ViewModeToggle
              bordered
              :modelValue="viewMode"
              :options="viewOptions"
              @update:modelValue="handleViewModeChange" />

            <UiButtonDefault
              state="info--small"
              @click="loadArticles(true)">
              <UiIconUpdate :spinning="isListLoading" />
            </UiButtonDefault>
          </div>
        </div>

        <div class="news-workspace__content-shell">
          <div
            v-if="isListLoading && !articles.length"
            class="news-workspace__empty">
            <UiIconSpinnerDefault />
          </div>

          <div
            v-else-if="!articles.length"
            class="news-workspace__empty">
            <UiIconNews />
            <span>{{ t("admin.news.library.empty", "No articles found for the current filter.") }}</span>
          </div>

          <div
            v-else-if="viewMode === 'table'"
            class="news-workspace__table-shell">
            <table class="news-workspace__table">
              <thead>
                <tr>
                  <th>{{ t("admin.news.columns.article", "Article") }}</th>
                  <th>{{ t("admin.news.columns.status", "Status") }}</th>
                  <th>{{ t("admin.news.columns.locale", "Locale") }}</th>
                  <th>{{ t("admin.news.columns.updated", "Updated") }}</th>
                  <th>{{ t("admin.news.columns.actions", "Actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="article in articles"
                  :key="article.id">
                  <td>
                    <button
                      type="button"
                      class="news-workspace__table-article"
                      @click="openPreview(article)">
                      <strong>{{ article.title || article.slug }}</strong>
                      <span>{{ article.excerpt || article.slug }}</span>
                    </button>
                  </td>
                  <td>
                    <span
                      class="news-workspace__status-pill"
                      :data-status="article.effective_status">
                      {{ statusLabel(article.effective_status) }}
                    </span>
                  </td>
                  <td>{{ article.locale.toUpperCase() }}</td>
                  <td>{{ formatDate(article.updated_at) }}</td>
                  <td>
                    <div class="news-workspace__row-actions">
                      <UiButtonDefault
                        state="info--small"
                        @click="openPreview(article)">
                        <UiIconEye />
                      </UiButtonDefault>

                      <UiButtonDefault
                        v-if="canUpdate"
                        state="success--outline--small"
                        @click="goToEdit(article.id)">
                        <UiIconEdit />
                      </UiButtonDefault>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="news-workspace__cards"
            :class="`is-${viewMode}`">
            <article
              v-for="article in articles"
              :key="article.id"
              class="news-workspace__card"
              @click="openPreview(article)">
              <div class="news-workspace__card-top">
                <span
                  class="news-workspace__status-pill"
                  :data-status="article.effective_status">
                  {{ statusLabel(article.effective_status) }}
                </span>
                <span class="news-workspace__locale">{{ article.locale.toUpperCase() }}</span>
              </div>

              <h3 class="news-workspace__card-title">{{ article.title || article.slug }}</h3>
              <p class="news-workspace__card-excerpt">{{ article.excerpt || article.slug }}</p>

              <div class="news-workspace__card-bottom">
                <span>{{ formatDate(article.updated_at) }}</span>

                <div
                  class="news-workspace__row-actions"
                  @click.stop>
                  <UiButtonDefault
                    state="info--small"
                    @click="openPreview(article)">
                    <UiIconEye />
                  </UiButtonDefault>

                  <UiButtonDefault
                    v-if="canUpdate"
                    state="success--outline--small"
                    @click="goToEdit(article.id)">
                    <UiIconEdit />
                  </UiButtonDefault>
                </div>
              </div>
            </article>
          </div>
        </div>

        <PaginationMain
          :currentPage="currentPage"
          :totalPages="totalPages"
          :total="totalRows"
          :perPage="perPage"
          :visiblePages="visiblePages"
          @go-prev="goPrev"
          @go-next="goNext"
          @set-page="setPage"
          @set-per-page="setPerPage" />
      </div>

      <div
        v-else
        class="news-workspace__section">
        <div class="news-workspace__section-head">
          <div>
            <div class="news-workspace__eyebrow">
              {{ t("admin.news.chatWorkspace.label", "GPT Draft") }}
            </div>
            <h2 class="news-workspace__title">
              {{ draftArticle?.title || t("admin.news.chatWorkspace.title", "Create a New Draft") }}
            </h2>
            <p class="news-workspace__subtitle">
              {{
                draftArticle
                  ? t(
                      "admin.news.chatWorkspace.subtitleExisting",
                      "Keep talking to GPT to reshape the draft. The latest article state stays in context for every next prompt."
                    )
                  : t(
                      "admin.news.chatWorkspace.subtitleNew",
                      "Describe the story in plain language and GPT will build a draft article with content, visuals and SEO metadata."
                    )
              }}
            </p>
          </div>

          <div class="news-workspace__toolbar-actions">
            <UiButtonDefault
              v-if="draftArticle"
              state="info--outline"
              @click="openPreview(draftArticle)">
              <template #icon-left>
                <UiIconEye />
              </template>
              {{ t("admin.news.actions.preview", "Preview") }}
            </UiButtonDefault>

            <UiButtonDefault
              v-if="draftArticle && canUpdate"
              state="success"
              @click="goToEdit(draftArticle.id)">
              <template #icon-left>
                <UiIconEdit />
              </template>
              {{ t("admin.news.actions.editArticle", "Edit Article") }}
            </UiButtonDefault>

            <UiButtonDefault
              state="info--small"
              @click="resetDraftWorkspace">
              <UiIconPlus />
            </UiButtonDefault>
          </div>
        </div>

        <div class="news-workspace__chat-panel">
          <div class="news-workspace__chat-stream">
            <div
              v-if="!messages.length && !isChatLoading"
              class="news-workspace__empty">
              <UiIconChat />
              <span>
                {{
                  t(
                    "admin.news.chatWorkspace.empty",
                    "There is no draft yet. Start with a prompt describing the topic, tone, media and angle."
                  )
                }}
              </span>
            </div>

            <div
              v-for="message in messages"
              :key="message.id"
              class="news-workspace__message"
              :class="`is-${message.role}`">
              <div class="news-workspace__message-role">
                {{
                  message.role === "assistant"
                    ? t("admin.news.roles.assistant", "GPT Editor")
                    : t("admin.news.roles.user", "You")
                }}
              </div>
              <div class="news-workspace__message-body">{{ displayMessageContent(message) }}</div>
              <div class="news-workspace__message-time">{{ formatDate(message.created_at, true) }}</div>
            </div>

            <div
              v-if="isChatLoading"
              class="news-workspace__message is-assistant is-pending">
              <div class="news-workspace__message-role">
                {{ t("admin.news.roles.assistant", "GPT Editor") }}
              </div>
              <div class="news-workspace__message-body">
                <div class="news-workspace__phase">{{ currentPhase }}</div>
                <div class="news-workspace__dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="draftArticle"
            type="button"
            class="news-workspace__draft-card"
            @click="openPreview(draftArticle)">
            <div class="news-workspace__draft-card-copy">
              <div class="news-workspace__draft-card-title">{{ draftArticle.title || draftArticle.slug }}</div>
              <div class="news-workspace__draft-card-text">
                {{
                  draftArticle.excerpt ||
                  t("admin.news.chatWorkspace.previewHint", "Open the full preview of the current draft.")
                }}
              </div>
            </div>

            <div class="news-workspace__draft-card-meta">
              <span
                class="news-workspace__status-pill"
                :data-status="draftArticle.effective_status">
                {{ statusLabel(draftArticle.effective_status) }}
              </span>
              <span class="news-workspace__locale">{{ draftArticle.locale.toUpperCase() }}</span>
            </div>
          </button>

          <div class="news-workspace__composer">
            <div class="news-workspace__composer-settings">
              <label class="news-workspace__field news-workspace__field--compact">
                <span>{{ t("admin.news.fields.locale", "Language") }}</span>
                <select
                  v-model="draftLocale"
                  class="news-workspace__select">
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                  <option value="uk">UK</option>
                </select>
              </label>

              <label class="news-workspace__toggle">
                <UiSwitchToggle v-model="generateImages" />
                <span>{{ t("admin.news.fields.generateImages", "Images") }}</span>
              </label>

              <label class="news-workspace__toggle">
                <UiSwitchToggle v-model="includeVideoLinks" />
                <span>{{ t("admin.news.fields.includeVideoLinks", "Videos") }}</span>
              </label>
            </div>

            <textarea
              v-model="chatInput"
              class="news-workspace__textarea"
              :placeholder="
                t(
                  'admin.news.chatPlaceholder',
                  'Example: Create a calm market update about the ECB meeting, include one strong cover image, two supporting visuals and complete SEO.'
                )
              "
              @keydown.enter.exact.prevent="handleSendMessage" />

            <div class="news-workspace__composer-bottom">
              <div class="news-workspace__composer-hint">
                {{
                  draftArticle
                    ? t(
                        "admin.news.chatWorkspace.hintExisting",
                        "Ask GPT to rewrite the headline, shorten the intro, add imagery, change the angle, or improve SEO."
                      )
                    : t(
                        "admin.news.chatWorkspace.hintNew",
                        "The first prompt creates a new draft. After that, the same chat keeps refining the same article."
                      )
                }}
              </div>

              <UiButtonDefault
                state="success"
                :disabled="!chatInput.trim() || isChatLoading || !canChat"
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
      </div>
    </section>

    <NewsPreviewModal
      v-model="isPreviewOpen"
      :article="previewArticle"
      :showEditButton="canUpdate"
      @edit="goToEdit" />
  </div>
</template>

<script setup lang="ts">
  import { computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import PaginationMain from "~/components/block/paginations/PaginationMain.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconEdit from "~/components/ui/UiIconEdit.vue";
  import UiIconEye from "~/components/ui/UiIconEye.vue";
  import UiIconNews from "~/components/ui/UiIconNews.vue";
  import UiIconPlus from "~/components/ui/UiIconPlus.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import useAppCore from "~/composables/useAppCore";
  import type {
    AdminNewsArticle,
    AdminNewsChatMessage,
    AdminNewsStudioResponse,
    SendNewsChatMessagePayload,
  } from "~/composables/core/modules/news/news.types";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import NewsPreviewModal from "~/pages/admin/news/components/NewsPreviewModal.vue";

  type WorkspaceTab = "library" | "draft";
  type FilterStatus = "draft" | "all" | "published" | "archived";
  type ViewMode = "list" | "grid" | "table";

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t } = useI18n({ useScope: "global" });

  const activeWorkspace = ref<WorkspaceTab>("library");
  const search = ref("");
  const statusFilter = ref<FilterStatus>("all");
  const viewMode = ref<ViewMode>("list");
  const currentPage = ref(1);
  const perPage = ref(12);

  const articles = ref<AdminNewsArticle[]>([]);
  const totalRows = ref(0);
  const isListLoading = ref(false);

  const draftArticle = ref<AdminNewsArticle | null>(null);
  const messages = ref<AdminNewsChatMessage[]>([]);
  const chatInput = ref("");
  const draftLocale = ref("en");
  const generateImages = ref(true);
  const includeVideoLinks = ref(false);
  const isChatLoading = ref(false);

  const isPreviewOpen = ref(false);
  const previewArticle = ref<AdminNewsArticle | null>(null);

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

  const workspaceTabs = computed(() => [
    {
      label: t("admin.news.tabs.library", "All News"),
      icon: UiIconNews,
    },
    ...(activeWorkspace.value === "draft" || draftArticle.value
      ? [
          {
            label: draftArticle.value?.title || t("admin.news.tabs.draft", "New Draft"),
            icon: UiIconChat,
          },
        ]
      : []),
  ]);

  const activeTabIndex = computed(() => (activeWorkspace.value === "library" ? 0 : 1));

  const filterOptions = computed(() => [
    { value: "draft" as const, label: t("admin.news.filters.draft", "Draft") },
    { value: "all" as const, label: t("admin.news.filters.all", "All") },
    { value: "published" as const, label: t("admin.news.filters.published", "Published") },
    { value: "archived" as const, label: t("admin.news.filters.archived", "Archived") },
  ]);

  const viewOptions = computed(() => [
    {
      value: "list",
      label: t("admin.news.views.list", "List"),
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [h("path", { d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" })]
          );
        },
      },
    },
    {
      value: "grid",
      label: t("admin.news.views.grid", "Tiles"),
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }),
              h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }),
              h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }),
              h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" }),
            ]
          );
        },
      },
    },
    {
      value: "table",
      label: t("admin.news.views.table", "Table"),
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }),
              h("path", { d: "M3 10h18M9 4v16M15 4v16" }),
            ]
          );
        },
      },
    },
  ]);

  const phaseTexts = computed(() => [
    t("admin.news.phases.analyzing", "Analyzing your request"),
    t("admin.news.phases.writing", "Writing the article draft"),
    t("admin.news.phases.seo", "Preparing SEO metadata"),
    t("admin.news.phases.finalizing", "Finalizing the newsroom output"),
  ]);

  const currentPhase = computed(() => phaseTexts.value[currentPhaseIndex.value] || phaseTexts.value[0]);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / perPage.value)));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  });

  function handleSelectTab(index: number): void {
    activeWorkspace.value = index === 0 ? "library" : "draft";
  }

  function setStatusFilter(value: FilterStatus): void {
    statusFilter.value = value;
    currentPage.value = 1;
  }

  function handleViewModeChange(value: string): void {
    if (value === "list" || value === "grid" || value === "table") {
      viewMode.value = value;
    }
  }

  async function loadArticles(force = false): Promise<void> {
    if (isListLoading.value && !force) {
      return;
    }

    isListLoading.value = true;

    try {
      const response = await appCore.news.getList({
        page: currentPage.value,
        perPage: perPage.value,
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

  async function setPage(page: number): Promise<void> {
    if (page < 1 || page > totalPages.value) {
      return;
    }

    currentPage.value = page;
    await loadArticles(true);
  }

  async function goPrev(): Promise<void> {
    await setPage(currentPage.value - 1);
  }

  async function goNext(): Promise<void> {
    await setPage(currentPage.value + 1);
  }

  async function setPerPage(value: number): Promise<void> {
    perPage.value = value;
    currentPage.value = 1;
    await loadArticles(true);
  }

  function openDraftWorkspace(): void {
    activeWorkspace.value = "draft";
    resetDraftWorkspace();
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

  function openPreview(article: AdminNewsArticle): void {
    previewArticle.value = article;
    isPreviewOpen.value = true;
  }

  async function goToEdit(id: string): Promise<void> {
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
    if (existingTimer) {
      clearInterval(existingTimer);
    }

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
    if (message.role !== "assistant") {
      return message.content;
    }

    return typedMessages[message.id] ?? message.content;
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

  async function handleSendMessage(): Promise<void> {
    const message = chatInput.value.trim();
    if (!message || !canChat.value) {
      return;
    }

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

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      loadArticles(true);
    }, 250);
  });

  watch(statusFilter, () => {
    loadArticles(true);
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
  .news-workspace {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 24px;
    min-height: calc(100vh - 190px);

    @media (max-width: 1180px) {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .news-workspace__tabs,
  .news-workspace__panel {
    min-width: 0;
  }

  .news-workspace__tabs {
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

  .news-workspace__section,
  .news-workspace__content-shell,
  .news-workspace__chat-panel,
  .news-workspace__composer {
    border-radius: 24px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: linear-gradient(180deg, rgba(11, 20, 61, 0.95), rgba(8, 15, 44, 0.95));
    color: var(--ui-text-main);
    box-shadow: 0 24px 70px rgba(7, 12, 38, 0.24);
  }

  .news-workspace__panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .news-workspace__section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .news-workspace__section-head,
  .news-workspace__filters-row,
  .news-workspace__toolbar,
  .news-workspace__toolbar-actions,
  .news-workspace__card-top,
  .news-workspace__card-bottom,
  .news-workspace__row-actions,
  .news-workspace__composer-settings,
  .news-workspace__composer-bottom,
  .news-workspace__draft-card,
  .news-workspace__draft-card-meta,
  .news-workspace__message-time {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .news-workspace__section-head,
  .news-workspace__filters-row,
  .news-workspace__toolbar,
  .news-workspace__card-bottom,
  .news-workspace__composer-bottom,
  .news-workspace__draft-card {
    justify-content: space-between;
  }

  .news-workspace__section-head,
  .news-workspace__filters-row,
  .news-workspace__toolbar,
  .news-workspace__composer-settings,
  .news-workspace__composer-bottom,
  .news-workspace__draft-card {
    flex-wrap: wrap;
  }

  .news-workspace__eyebrow {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(185, 198, 255, 0.74);
  }

  .news-workspace__title {
    margin: 8px 0 0;
    color: #fff;
    font-size: clamp(1.5rem, 2.3vw, 2.3rem);
    line-height: 1.08;
  }

  .news-workspace__subtitle,
  .news-workspace__card-excerpt,
  .news-workspace__card-bottom,
  .news-workspace__composer-hint,
  .news-workspace__message-time,
  .news-workspace__draft-card-text {
    color: rgba(199, 208, 255, 0.72);
    line-height: 1.58;
  }

  .news-workspace__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .news-workspace__filter {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid rgba(126, 145, 255, 0.16);
    background: rgba(255, 255, 255, 0.03);
    color: var(--ui-text-main);
    transition: 0.2s ease;

    &:hover,
    &.is-active {
      border-color: transparent;
      background: var(--ui-primary-main);
      color: #fff;
    }
  }

  .news-workspace__search {
    min-width: min(100%, 420px);
    flex: 1 1 320px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 16px;
    border-radius: 16px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.035);
    color: var(--ui-text-main);
  }

  .news-workspace__search-input,
  .news-workspace__select,
  .news-workspace__textarea {
    width: 100%;
    color: var(--ui-text-main);
    background: transparent;
    outline: none;
  }

  .news-workspace__search-input::placeholder,
  .news-workspace__textarea::placeholder {
    color: rgba(199, 208, 255, 0.48);
  }

  .news-workspace__content-shell {
    padding: 18px;
    min-height: 420px;
  }

  .news-workspace__empty {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: rgba(199, 208, 255, 0.72);
    text-align: center;
  }

  .news-workspace__cards {
    display: grid;
    gap: 16px;

    &.is-list {
      grid-template-columns: 1fr;
    }

    &.is-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }

  .news-workspace__card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 220px;
    padding: 20px;
    border-radius: 22px;
    border: 1px solid rgba(126, 145, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(126, 145, 255, 0.22);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .news-workspace__card-title,
  .news-workspace__draft-card-title {
    color: #fff;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .news-workspace__card-excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .news-workspace__status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #fff;
    background: rgba(113, 158, 223, 0.25);
    border: 1px solid transparent;

    &[data-status="draft"] {
      background: rgba(113, 158, 223, 0.22);
      border-color: rgba(113, 158, 223, 0.38);
    }

    &[data-status="scheduled"] {
      background: rgba(255, 173, 92, 0.18);
      border-color: rgba(255, 173, 92, 0.38);
    }

    &[data-status="published"] {
      background: rgba(62, 187, 128, 0.2);
      border-color: rgba(62, 187, 128, 0.38);
    }

    &[data-status="archived"] {
      background: rgba(138, 149, 188, 0.16);
      border-color: rgba(138, 149, 188, 0.3);
    }
  }

  .news-workspace__locale {
    color: rgba(199, 208, 255, 0.72);
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .news-workspace__table-shell {
    overflow: auto;
    border-radius: 18px;
    border: 1px solid rgba(126, 145, 255, 0.12);
  }

  .news-workspace__table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;

    thead {
      background: rgba(113, 158, 223, 0.18);
    }

    th,
    td {
      padding: 16px 18px;
      text-align: left;
      border-bottom: 1px solid rgba(126, 145, 255, 0.12);
      vertical-align: top;
    }

    th {
      color: rgba(199, 208, 255, 0.74);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    tbody tr:hover {
      background: rgba(255, 255, 255, 0.025);
    }
  }

  .news-workspace__table-article {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;

    strong {
      color: #fff;
      line-height: 1.4;
    }

    span {
      color: rgba(199, 208, 255, 0.72);
      line-height: 1.45;
    }
  }

  .news-workspace__chat-panel {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 680px;
  }

  .news-workspace__chat-stream {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-right: 4px;
  }

  .news-workspace__message {
    max-width: min(78ch, 88%);
    padding: 16px 18px;
    border-radius: 22px;
    border: 1px solid rgba(126, 145, 255, 0.12);
    background: rgba(255, 255, 255, 0.035);
    align-self: flex-start;

    &.is-user {
      align-self: flex-end;
      background: rgba(113, 158, 223, 0.16);
      border-color: rgba(113, 158, 223, 0.28);
    }
  }

  .news-workspace__message-role {
    margin-bottom: 8px;
    color: rgba(185, 198, 255, 0.74);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .news-workspace__message-body {
    white-space: pre-wrap;
    color: rgba(238, 242, 255, 0.94);
    line-height: 1.72;
  }

  .news-workspace__message-time {
    justify-content: flex-start;
    margin-top: 10px;
    font-size: 0.8rem;
  }

  .news-workspace__phase {
    margin-bottom: 10px;
  }

  .news-workspace__dots {
    display: flex;
    gap: 8px;

    span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--ui-primary-main);
      animation: news-dot 1.15s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.12s;
      }

      &:nth-child(3) {
        animation-delay: 0.24s;
      }
    }
  }

  .news-workspace__draft-card {
    width: 100%;
    padding: 18px 20px;
    border-radius: 22px;
    border: 1px solid rgba(62, 187, 128, 0.28);
    background: rgba(62, 187, 128, 0.08);
    text-align: left;

    &:hover {
      background: rgba(62, 187, 128, 0.12);
    }
  }

  .news-workspace__draft-card-copy {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .news-workspace__composer {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .news-workspace__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 140px;

    span {
      color: rgba(199, 208, 255, 0.72);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  }

  .news-workspace__field--compact {
    max-width: 120px;
  }

  .news-workspace__select {
    min-height: 42px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.035);
  }

  .news-workspace__toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(126, 145, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
    color: var(--ui-text-main);
  }

  .news-workspace__textarea {
    min-height: 170px;
    resize: vertical;
    padding: 16px 18px;
    border-radius: 18px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.035);
    line-height: 1.65;
  }

  @keyframes news-dot {
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
