<template>
  <div class="landing-seo">
    <div class="landing-seo__toolbar">
      <div>
        <h3>{{ text("title", "SEO лендинга") }}</h3>
        <p>
          {{
            text(
              "subtitle",
              "Управляйте SSR meta-тегами, canonical, robots, social preview и JSON-LD для страниц лендинга."
            )
          }}
        </p>
      </div>

      <div class="landing-seo__toolbar-actions">
        <PrimeSelect
          v-model="selectedLocale"
          :options="localeOptions"
          option-label="label"
          option-value="value"
          class="landing-seo__locale" />
        <PrimeButton
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="isLoading"
          :label="text('refresh', 'Обновить')"
          @click="loadSettings" />
        <PrimeButton
          icon="pi pi-bolt"
          severity="secondary"
          outlined
          :disabled="!canManageSeo"
          :loading="isWarming"
          :label="text('warm', 'Прогреть кеш')"
          @click="warmCache" />
        <PrimeButton
          icon="pi pi-save"
          :disabled="!canManageSeo"
          :loading="isSaving"
          :label="text('save', 'Сохранить SEO')"
          @click="saveSettings" />
      </div>
    </div>

    <div
      v-if="message.text"
      class="landing-seo__message"
      :class="`landing-seo__message--${message.type}`">
      {{ message.text }}
    </div>

    <div class="landing-seo__summary">
      <article>
        <span>{{ text("summaryPages", "Страниц") }}</span>
        <strong>{{ visibleEntries.length }}</strong>
      </article>
      <article>
        <span>{{ text("summaryCache", "Кеш") }}</span>
        <strong>{{ cacheInfo.is_warmed ? text("cacheWarmed", "Прогрет") : text("cacheCold", "Не прогрет") }}</strong>
      </article>
      <article>
        <span>{{ text("summaryTtl", "TTL") }}</span>
        <strong>{{ cacheInfo.ttl_seconds ? `${Math.round(cacheInfo.ttl_seconds / 60)}m` : "-" }}</strong>
      </article>
    </div>

    <div
      v-if="isLoading && !entries.length"
      class="landing-seo__skeleton">
      <PrimeSkeleton
        v-for="item in 6"
        :key="item"
        height="58px"
        border-radius="16px" />
    </div>

    <div
      v-else
      class="landing-seo__workspace">
      <aside class="landing-seo__pages">
        <button
          v-for="entry in visibleEntries"
          :key="entryKey(entry)"
          type="button"
          class="landing-seo__page"
          :class="{ 'is-active': entryKey(entry) === activeEntryKey }"
          @click="activeEntryKey = entryKey(entry)">
          <span>{{ pageLabel(entry.path) }}</span>
          <small>{{ entry.path === "*" ? text("globalPath", "fallback") : entry.path }}</small>
        </button>
      </aside>

      <section
        v-if="currentEntry"
        class="landing-seo__editor">
        <div class="landing-seo__editor-head">
          <div>
            <span class="landing-seo__eyebrow"
              >{{ currentEntry.locale.toUpperCase() }} / {{ pageLabel(currentEntry.path) }}</span
            >
            <h4>{{ currentEntry.path === "*" ? text("globalFallback", "Глобальный fallback") : currentEntry.path }}</h4>
          </div>
          <label class="landing-seo__switch">
            <span>{{ text("active", "Индексировать") }}</span>
            <PrimeToggleSwitch v-model="currentEntry.is_active" />
          </label>
        </div>

        <div class="landing-seo__form-grid">
          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("metaTitle", "Meta title") }}</span>
            <PrimeInputText v-model="currentEntry.meta_title" />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("metaDescription", "Meta description") }}</span>
            <PrimeTextarea
              v-model="currentEntry.meta_description"
              rows="3"
              auto-resize />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("keywords", "Keywords") }}</span>
            <PrimeInputText
              v-model="currentEntry.keywords_input"
              :placeholder="text('keywordsPlaceholder', 'forex, MT4, crypto trading')" />
          </label>

          <label class="landing-seo__field">
            <span>{{ text("canonical", "Canonical URL") }}</span>
            <PrimeInputText
              v-model="currentEntry.canonical_url"
              :placeholder="canonicalPreview(currentEntry)" />
          </label>

          <label class="landing-seo__field">
            <span>{{ text("robots", "Robots") }}</span>
            <PrimeInputText
              v-model="currentEntry.robots"
              placeholder="index,follow" />
          </label>

          <label class="landing-seo__field">
            <span>{{ text("ogTitle", "Open Graph title") }}</span>
            <PrimeInputText v-model="currentEntry.og_title" />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("ogDescription", "Open Graph description") }}</span>
            <PrimeTextarea
              v-model="currentEntry.og_description"
              rows="3"
              auto-resize />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("ogImage", "Open Graph image URL") }}</span>
            <PrimeInputText v-model="currentEntry.og_image_url" />
          </label>

          <label class="landing-seo__field">
            <span>{{ text("twitterTitle", "Twitter title") }}</span>
            <PrimeInputText v-model="currentEntry.twitter_title" />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("twitterDescription", "Twitter description") }}</span>
            <PrimeTextarea
              v-model="currentEntry.twitter_description"
              rows="3"
              auto-resize />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("twitterImage", "Twitter image URL") }}</span>
            <PrimeInputText v-model="currentEntry.twitter_image_url" />
          </label>

          <label class="landing-seo__field landing-seo__field--full">
            <span>{{ text("schema", "JSON-LD schema") }}</span>
            <PrimeTextarea
              v-model="currentEntry.schema_text"
              rows="8"
              auto-resize
              :placeholder="schemaPlaceholder" />
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  type SeoEntry = {
    id: string | null;
    locale: string;
    path: string;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    keywords_input: string;
    canonical_url: string;
    robots: string;
    og_title: string;
    og_description: string;
    og_image_url: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image_url: string;
    schema_text: string;
  };

  type SeoTemplate = {
    path: string;
    label: string;
    group?: string;
  };

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const localeOptions = ref<Array<{ label: string; value: string }>>([{ label: "English", value: "en" }]);
  const templates = ref<SeoTemplate[]>([]);
  const entries = ref<SeoEntry[]>([]);
  const selectedLocale = ref("en");
  const activeEntryKey = ref("");
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isWarming = ref(false);
  const cacheInfo = reactive({
    is_warmed: false,
    ttl_seconds: 0,
  });
  const message = reactive({
    type: "info" as "info" | "success" | "error",
    text: "",
  });

  const canManageSeo = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("manage-settings")
  );

  const visibleEntries = computed(() => entries.value.filter(entry => entry.locale === selectedLocale.value));
  const currentEntry = computed(() => {
    return (
      visibleEntries.value.find(entry => entryKey(entry) === activeEntryKey.value) || visibleEntries.value[0] || null
    );
  });
  const schemaPlaceholder = computed(() =>
    text("schemaPlaceholder", '{ "@context": "https://schema.org", "@type": "WebPage" }')
  );

  const text = (key: string, fallback: string): string => {
    const translated = t(`admin.settings.landingSeo.${key}`);
    return translated === `admin.settings.landingSeo.${key}` ? fallback : translated;
  };

  const entryKey = (entry: Pick<SeoEntry, "locale" | "path">): string => `${entry.locale}:${entry.path}`;

  const pageLabel = (path: string): string => {
    return templates.value.find(template => template.path === path)?.label || path;
  };

  const showMessage = (type: "info" | "success" | "error", textValue: string): void => {
    message.type = type;
    message.text = textValue;
  };

  const normalizeEntry = (raw: any): SeoEntry => {
    return {
      id: raw?.id ?? null,
      locale: String(raw?.locale || "en"),
      path: String(raw?.path || "/"),
      is_active: Boolean(raw?.is_active ?? true),
      meta_title: String(raw?.meta_title || ""),
      meta_description: String(raw?.meta_description || ""),
      keywords_input: Array.isArray(raw?.meta_keywords)
        ? raw.meta_keywords.join(", ")
        : String(raw?.meta_keywords || ""),
      canonical_url: String(raw?.canonical_url || ""),
      robots: String(raw?.robots || "index,follow"),
      og_title: String(raw?.og_title || ""),
      og_description: String(raw?.og_description || ""),
      og_image_url: String(raw?.og_image_url || ""),
      twitter_title: String(raw?.twitter_title || ""),
      twitter_description: String(raw?.twitter_description || ""),
      twitter_image_url: String(raw?.twitter_image_url || ""),
      schema_text: raw?.schema_json ? JSON.stringify(raw.schema_json, null, 2) : "",
    };
  };

  const extractPayload = (response: any): any => response?.data?.data ?? response?.data ?? {};

  const loadSettings = async (): Promise<void> => {
    isLoading.value = true;
    showMessage("info", "");
    try {
      const payload = extractPayload(await appCore.adminModules.system.getLandingSeoSettings());
      localeOptions.value = Array.isArray(payload.locales)
        ? payload.locales.map((locale: any) => ({
            label: String(locale?.label || locale?.code || "Locale"),
            value: String(locale?.code || "en"),
          }))
        : localeOptions.value;
      templates.value = Array.isArray(payload.templates) ? payload.templates : [];
      entries.value = Array.isArray(payload.entries) ? payload.entries.map(normalizeEntry) : [];
      cacheInfo.is_warmed = Boolean(payload.cache?.is_warmed);
      cacheInfo.ttl_seconds = Number(payload.cache?.ttl_seconds || 0);

      if (!localeOptions.value.some(option => option.value === selectedLocale.value)) {
        selectedLocale.value = localeOptions.value[0]?.value || "en";
      }
      activeEntryKey.value = visibleEntries.value[0] ? entryKey(visibleEntries.value[0]) : "";
    } catch (error: any) {
      showMessage(
        "error",
        error?.response?.data?.message || text("loadError", "Не удалось загрузить SEO настройки лендинга.")
      );
    } finally {
      isLoading.value = false;
    }
  };

  const parseSchema = (entry: SeoEntry): Record<string, unknown> | unknown[] | null => {
    const raw = entry.schema_text.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Schema must be a JSON object or array.");
    }

    return parsed;
  };

  const buildPayload = () => {
    return {
      entries: entries.value.map(entry => ({
        locale: entry.locale,
        path: entry.path,
        is_active: entry.is_active,
        meta_title: entry.meta_title || null,
        meta_description: entry.meta_description || null,
        meta_keywords: entry.keywords_input
          .split(",")
          .map(keyword => keyword.trim())
          .filter(Boolean),
        canonical_url: entry.canonical_url || null,
        robots: entry.robots || "index,follow",
        og_title: entry.og_title || null,
        og_description: entry.og_description || null,
        og_image_url: entry.og_image_url || null,
        twitter_title: entry.twitter_title || null,
        twitter_description: entry.twitter_description || null,
        twitter_image_url: entry.twitter_image_url || null,
        schema_json: parseSchema(entry),
      })),
    };
  };

  const saveSettings = async (): Promise<void> => {
    if (!canManageSeo.value) return;

    isSaving.value = true;
    showMessage("info", "");
    try {
      const payload = buildPayload();
      const responsePayload = extractPayload(await appCore.adminModules.system.updateLandingSeoSettings(payload));
      entries.value = Array.isArray(responsePayload.entries)
        ? responsePayload.entries.map(normalizeEntry)
        : entries.value;
      cacheInfo.is_warmed = Boolean(responsePayload.cache?.is_warmed ?? true);
      cacheInfo.ttl_seconds = Number(responsePayload.cache?.ttl_seconds || cacheInfo.ttl_seconds);
      showMessage("success", text("saveSuccess", "SEO настройки сохранены, кеш прогрет."));
    } catch (error: any) {
      showMessage(
        "error",
        error instanceof SyntaxError
          ? text("schemaError", "Проверьте JSON-LD: schema должна быть валидным JSON.")
          : error?.response?.data?.message || text("saveError", "Не удалось сохранить SEO настройки.")
      );
    } finally {
      isSaving.value = false;
    }
  };

  const warmCache = async (): Promise<void> => {
    if (!canManageSeo.value) return;

    isWarming.value = true;
    showMessage("info", "");
    try {
      await appCore.adminModules.system.warmLandingSeoCache();
      cacheInfo.is_warmed = true;
      showMessage("success", text("warmSuccess", "SEO кеш лендинга прогрет."));
    } catch (error: any) {
      showMessage("error", error?.response?.data?.message || text("warmError", "Не удалось прогреть SEO кеш."));
    } finally {
      isWarming.value = false;
    }
  };

  const canonicalPreview = (entry: SeoEntry): string => {
    const path = entry.path === "*" ? "/" : entry.path;
    return `https://esterholdings.space/${entry.locale}${path === "/" ? "" : path}`;
  };

  watch(selectedLocale, () => {
    activeEntryKey.value = visibleEntries.value[0] ? entryKey(visibleEntries.value[0]) : "";
  });

  onMounted(loadSettings);
</script>

<style scoped lang="scss">
  .landing-seo {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    color: var(--ui-text-main);

    &__toolbar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;

      h3 {
        margin: 0;
        color: var(--ui-text-main);
        font-size: 20px;
        font-weight: 850;
        letter-spacing: -0.02em;
      }

      p {
        max-width: 720px;
        margin: 6px 0 0;
        color: var(--ui-text-secondary);
        font-size: 13px;
        line-height: 1.45;
      }
    }

    &__toolbar-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    &__locale {
      min-width: 168px;
    }

    &__message {
      border-radius: 14px;
      padding: 10px 12px;
      border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
      color: var(--ui-text-main);
      background: color-mix(in srgb, var(--ui-primary-main) 9%, transparent);
      font-size: 13px;

      &--success {
        border-color: color-mix(in srgb, var(--ui-success-main, #5ecf86) 36%, var(--color-stroke-ui-light));
        background: color-mix(in srgb, var(--ui-success-main, #5ecf86) 12%, transparent);
      }

      &--error {
        border-color: color-mix(in srgb, var(--ui-danger-main, #ef4444) 38%, var(--color-stroke-ui-light));
        background: color-mix(in srgb, var(--ui-danger-main, #ef4444) 10%, transparent);
      }
    }

    &__summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;

      article {
        min-height: 74px;
        border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
        border-radius: 18px;
        padding: 13px 14px;
        background: color-mix(in srgb, var(--ui-background-panel) 80%, transparent);
      }

      span {
        display: block;
        color: var(--ui-text-secondary);
        font-size: 12px;
        font-weight: 700;
      }

      strong {
        display: block;
        margin-top: 8px;
        color: var(--ui-text-main);
        font-size: 22px;
        line-height: 1;
      }
    }

    &__skeleton {
      display: grid;
      gap: 10px;
    }

    &__workspace {
      display: grid;
      grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
      gap: 14px;
      align-items: start;
    }

    &__pages {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 720px;
      overflow: auto;
      padding-right: 4px;
    }

    &__page {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
      border-radius: 15px;
      padding: 12px;
      color: var(--ui-text-secondary);
      background: color-mix(in srgb, var(--ui-background-panel) 72%, transparent);
      text-align: left;
      cursor: pointer;
      transition:
        border-color 0.18s ease,
        background-color 0.18s ease,
        transform 0.18s ease;

      span {
        color: var(--ui-text-main);
        font-size: 13px;
        font-weight: 800;
      }

      small {
        color: var(--ui-text-secondary);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover,
      &.is-active {
        border-color: color-mix(in srgb, var(--ui-primary-main) 46%, var(--color-stroke-ui-light));
        background: color-mix(in srgb, var(--ui-primary-main) 10%, var(--ui-background-panel));
        transform: translateX(2px);
      }
    }

    &__editor {
      min-width: 0;
      border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
      border-radius: 20px;
      padding: 16px;
      background: color-mix(in srgb, var(--ui-background-panel) 78%, transparent);
    }

    &__editor-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 16px;

      h4 {
        margin: 4px 0 0;
        color: var(--ui-text-main);
        font-size: 18px;
        font-weight: 850;
        line-height: 1.2;
      }
    }

    &__eyebrow {
      color: var(--ui-primary-main);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    &__switch {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--ui-text-secondary);
      font-size: 13px;
      font-weight: 700;
    }

    &__form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;

      span {
        color: var(--ui-text-secondary);
        font-size: 12px;
        font-weight: 800;
      }

      &--full {
        grid-column: 1 / -1;
      }
    }

    :deep(.p-inputtext),
    :deep(.p-textarea),
    :deep(.p-select) {
      width: 100%;
    }
  }

  @media (max-width: 1100px) {
    .landing-seo {
      &__toolbar {
        flex-direction: column;
      }

      &__toolbar-actions {
        width: 100%;
        justify-content: flex-start;
      }

      &__workspace {
        grid-template-columns: 1fr;
      }

      &__pages {
        max-height: none;
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 4px;
      }

      &__page {
        min-width: 210px;
      }
    }
  }

  @media (max-width: 720px) {
    .landing-seo {
      padding: 12px;

      &__summary,
      &__form-grid {
        grid-template-columns: 1fr;
      }

      &__toolbar-actions,
      &__toolbar-actions :deep(.p-button),
      &__locale {
        width: 100%;
      }

      &__editor-head {
        flex-direction: column;
      }
    }
  }
</style>
