<template>
  <div class="faq-settings">
    <div class="faq-settings__toolbar">
      <div class="faq-settings__filters">
        <label>
          <span>{{ text("locale", "Language") }}</span>
          <PrimeSelect
            v-model="selectedLocale"
            :options="localeOptions"
            option-label="label"
            option-value="value"
            size="small" />
        </label>
      </div>

      <PrimeButton
        icon="pi pi-refresh"
        :label="text('refresh', 'Refresh')"
        size="small"
        outlined
        :loading="isLoading"
        @click="loadFaqs" />
    </div>

    <PrimeMessage
      v-if="message.text"
      :severity="message.type"
      :closable="false">
      {{ message.text }}
    </PrimeMessage>

    <form
      class="faq-settings__editor"
      @submit.prevent="saveFaq">
      <div class="faq-settings__editor-head">
        <div>
          <h3>{{ editingId ? text("editTitle", "Edit FAQ answer") : text("createTitle", "Create FAQ answer") }}</h3>
          <p>{{ text("editorHint", "These answers are used on the landing FAQ and the Help page for the selected language.") }}</p>
        </div>
        <PrimeButton
          v-if="editingId"
          type="button"
          icon="pi pi-times"
          :label="text('cancel', 'Cancel')"
          size="small"
          text
          @click="resetForm" />
      </div>

      <div class="faq-settings__form-grid">
        <label class="faq-settings__field">
          <span>{{ text("question", "Question") }}</span>
          <PrimeInputText
            v-model="form.question"
            :disabled="!canManageFaq"
            required />
        </label>

        <label class="faq-settings__field">
          <span>{{ text("itemLocale", "Item language") }}</span>
          <PrimeSelect
            v-model="form.locale"
            :options="localeOptions"
            option-label="label"
            option-value="value"
            :disabled="!canManageFaq" />
        </label>

        <label class="faq-settings__field">
          <span>{{ text("sortOrder", "Sort order") }}</span>
          <input
            v-model.number="form.sort_order"
            class="faq-settings__number"
            type="number"
            min="0"
            max="1000000"
            :disabled="!canManageFaq" />
        </label>

        <label class="faq-settings__switch">
          <span>{{ text("active", "Published") }}</span>
          <PrimeToggleSwitch
            v-model="form.is_active"
            :disabled="!canManageFaq" />
        </label>

        <label class="faq-settings__field faq-settings__field--full">
          <span>{{ text("answer", "Answer") }}</span>
          <PrimeTextarea
            v-model="form.answer"
            rows="5"
            auto-resize
            :disabled="!canManageFaq"
            required />
        </label>
      </div>

      <div class="faq-settings__editor-actions">
        <PrimeButton
          type="submit"
          icon="pi pi-save"
          :label="editingId ? text('saveChanges', 'Save changes') : text('create', 'Create FAQ')"
          :loading="isSaving"
          :disabled="!canManageFaq" />
      </div>
    </form>

    <div class="faq-settings__list-head">
      <div>
        <h3>{{ text("listTitle", "FAQ answers") }}</h3>
        <p>{{ text("listHint", "The landing page shows the first five active answers; the Help page shows the full active list.") }}</p>
      </div>
      <span>{{ faqItems.length }} {{ text("items", "items") }}</span>
    </div>

    <div
      v-if="isLoading && faqItems.length === 0"
      class="faq-settings__state">
      <i class="pi pi-spin pi-spinner"></i>
      <span>{{ text("loading", "Loading FAQ...") }}</span>
    </div>

    <div
      v-else-if="faqItems.length === 0"
      class="faq-settings__state">
      {{ text("empty", "No FAQ answers for this language yet.") }}
    </div>

    <div
      v-else
      class="faq-settings__list">
      <article
        v-for="item in faqItems"
        :key="item.id"
        class="faq-settings__item">
        <div class="faq-settings__item-main">
          <div class="faq-settings__item-meta">
            <span>{{ item.locale.toUpperCase() }}</span>
            <span>#{{ item.sort_order }}</span>
            <span :class="item.is_active ? 'is-active' : 'is-hidden'">
              {{ item.is_active ? text("published", "Published") : text("hidden", "Hidden") }}
            </span>
          </div>
          <h4>{{ item.question }}</h4>
          <p>{{ item.answer }}</p>
        </div>

        <div class="faq-settings__item-actions">
          <PrimeButton
            icon="pi pi-pencil"
            :label="text('edit', 'Edit')"
            size="small"
            outlined
            :disabled="!canManageFaq"
            @click="editFaq(item)" />
          <PrimeButton
            icon="pi pi-trash"
            :label="text('delete', 'Delete')"
            size="small"
            severity="danger"
            outlined
            :disabled="!canManageFaq || deletingId === item.id"
            :loading="deletingId === item.id"
            @click="deleteFaq(item)" />
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import useAppCore from "~/composables/useAppCore";

type FaqItem = {
  id: number;
  locale: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const localeOptions = [
  { label: "English", value: "en" },
  { label: "Russian", value: "ru" },
  { label: "Deutsch", value: "de" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
  { label: "Português", value: "pt" },
  { label: "Türkçe", value: "tr" },
  { label: "Українська", value: "uk" },
  { label: "עברית", value: "he" },
  { label: "हिन्दी", value: "hi" },
  { label: "日本語", value: "ja" },
  { label: "한국어", value: "ko" },
  { label: "中文", value: "zh" },
];

const selectedLocale = ref("en");
const faqItems = ref<FaqItem[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const deletingId = ref<number | null>(null);
const editingId = ref<number | null>(null);
const message = reactive({
  type: "info" as "info" | "success" | "error",
  text: "",
});
const form = reactive({
  locale: "en",
  question: "",
  answer: "",
  sort_order: 10,
  is_active: true,
});

const canManageFaq = computed(
  () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("manage-settings")
);

const text = (key: string, fallback: string): string => {
  const translated = t(`admin.settings.faq.${key}`);
  return translated === `admin.settings.faq.${key}` ? fallback : translated;
};

const showMessage = (type: "info" | "success" | "error", textValue: string) => {
  message.type = type;
  message.text = textValue;
};

const clearMessage = () => {
  message.text = "";
};

const extractItems = (response: any): FaqItem[] => {
  const items = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(items) ? items : [];
};

const loadFaqs = async () => {
  isLoading.value = true;
  clearMessage();

  try {
    const response = await appCore.adminModules.system.getFaqs({
      locale: selectedLocale.value,
      perPage: 200,
    });
    faqItems.value = extractItems(response);
  } catch (error) {
    console.error("FAQ settings load failed", error);
    showMessage("error", text("loadFailed", "Failed to load FAQ answers."));
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  editingId.value = null;
  form.locale = selectedLocale.value;
  form.question = "";
  form.answer = "";
  form.sort_order = nextSortOrder();
  form.is_active = true;
};

const nextSortOrder = (): number => {
  const maxOrder = faqItems.value.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0);
  return maxOrder + 10;
};

const normalizePayload = () => ({
  locale: form.locale,
  question: form.question.trim(),
  answer: form.answer.trim(),
  sort_order: Number(form.sort_order) || 0,
  is_active: Boolean(form.is_active),
});

const saveFaq = async () => {
  if (!canManageFaq.value || isSaving.value) return;

  const payload = normalizePayload();
  if (!payload.question || !payload.answer) {
    showMessage("error", text("required", "Question and answer are required."));
    return;
  }

  isSaving.value = true;
  clearMessage();

  try {
    if (editingId.value) {
      await appCore.adminModules.system.updateFaq(editingId.value, payload);
      showMessage("success", text("updated", "FAQ answer updated."));
    } else {
      await appCore.adminModules.system.createFaq(payload);
      showMessage("success", text("created", "FAQ answer created."));
    }

    selectedLocale.value = payload.locale;
    await loadFaqs();
    resetForm();
  } catch (error) {
    console.error("FAQ settings save failed", error);
    showMessage("error", text("saveFailed", "Failed to save FAQ answer."));
  } finally {
    isSaving.value = false;
  }
};

const editFaq = (item: FaqItem) => {
  editingId.value = item.id;
  form.locale = item.locale;
  form.question = item.question;
  form.answer = item.answer;
  form.sort_order = item.sort_order;
  form.is_active = item.is_active;
  clearMessage();
};

const deleteFaq = async (item: FaqItem) => {
  if (!canManageFaq.value || deletingId.value !== null) return;
  if (typeof window !== "undefined" && !window.confirm(text("deleteConfirm", "Delete this FAQ answer?"))) {
    return;
  }

  deletingId.value = item.id;
  clearMessage();

  try {
    await appCore.adminModules.system.deleteFaq(item.id);
    faqItems.value = faqItems.value.filter(current => current.id !== item.id);
    if (editingId.value === item.id) {
      resetForm();
    }
    showMessage("success", text("deleted", "FAQ answer deleted."));
  } catch (error) {
    console.error("FAQ settings delete failed", error);
    showMessage("error", text("deleteFailed", "Failed to delete FAQ answer."));
  } finally {
    deletingId.value = null;
  }
};

watch(selectedLocale, async locale => {
  form.locale = locale;
  await loadFaqs();
  resetForm();
});

onMounted(async () => {
  await loadFaqs();
  resetForm();
});
</script>

<style scoped lang="scss">
.faq-settings {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;

  &__toolbar,
  &__list-head,
  &__editor-head,
  &__item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__filters label,
  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  &__editor {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-panel) 84%, transparent);
  }

  h3,
  h4,
  p {
    margin: 0;
  }

  h3 {
    color: var(--ui-text-main);
    font-size: 16px;
    font-weight: 840;
  }

  &__editor-head p,
  &__list-head p {
    margin-top: 4px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  &__form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px 140px 140px;
    gap: 12px;
  }

  &__field--full {
    grid-column: 1 / -1;
  }

  &__switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 44px;
    padding: 0 4px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  &__number {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    padding: 0 12px;
    color: var(--ui-text-main);
    background: var(--ui-background);
    outline: none;
  }

  &__editor-actions {
    display: flex;
    justify-content: flex-end;
  }

  &__list-head {
    align-items: flex-end;
  }

  &__list-head > span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  &__state {
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    border: 1px dashed color-mix(in srgb, var(--ui-primary-main) 20%, var(--color-stroke-ui-light));
    border-radius: 14px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    padding: 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 14px;
    background: color-mix(in srgb, var(--ui-background-card) 76%, transparent);
  }

  &__item-main {
    min-width: 0;
  }

  &__item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  &__item-meta span {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-primary-main) 8%, transparent);
    font-size: 11px;
    font-weight: 800;
  }

  &__item-meta .is-active {
    color: var(--ui-sticker-success);
  }

  &__item-meta .is-hidden {
    color: var(--ui-sticker-warning);
  }

  &__item h4 {
    color: var(--ui-text-main);
    font-size: 15px;
    font-weight: 820;
    line-height: 1.3;
  }

  &__item p {
    margin-top: 6px;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  &__item-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }
}

@media (max-width: 960px) {
  .faq-settings {
    &__toolbar,
    &__list-head,
    &__editor-head,
    &__item {
      flex-direction: column;
      align-items: stretch;
    }

    &__form-grid {
      grid-template-columns: 1fr;
    }

    &__item-actions {
      justify-content: flex-end;
    }
  }
}
</style>
