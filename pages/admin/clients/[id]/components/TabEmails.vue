<template>
  <section class="client-emails">
    <div class="client-emails__summary">
      <div>
        <h3>{{ titleText }}</h3>
        <p>{{ subtitleText }}</p>
      </div>
      <div class="client-emails__summary-pill">
        {{ totalText }}: {{ total }}
      </div>
    </div>

    <div
      v-if="isLoading && emails.length === 0"
      class="client-emails__state">
      <UiIconSpinnerDefault />
    </div>

    <div
      v-else-if="errorMessage"
      class="client-emails__state client-emails__state--error">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="emails.length === 0"
      class="client-emails__state">
      {{ emptyText }}
    </div>

    <div
      v-else
      class="client-emails__list">
      <article
        v-for="emailItem in emails"
        :key="emailItem.id"
        class="client-emails__card">
        <div class="client-emails__card-top">
          <div class="client-emails__card-main">
            <div class="client-emails__card-subject">{{ emailItem.subject || fallbackSubjectText }}</div>
            <div class="client-emails__card-meta">
              <span>{{ recipientText }}: {{ emailItem.recipient_email || "-" }}</span>
              <span v-if="emailItem.recipient_name">· {{ emailItem.recipient_name }}</span>
            </div>
          </div>

          <div class="client-emails__card-date">
            {{ formatDateTime(emailItem.sent_at || emailItem.created_at) }}
          </div>
        </div>

        <div class="client-emails__grid">
          <div class="client-emails__cell">
            <div class="client-emails__label">{{ typeText }}</div>
            <div class="client-emails__value">
              {{ emailCategoryText(emailItem.category) }}
            </div>
          </div>

          <div class="client-emails__cell">
            <div class="client-emails__label">{{ messageIdText }}</div>
            <div class="client-emails__copy-row">
              <span class="truncate">{{ emailItem.message_id || "-" }}</span>
              <UiIconCopy
                v-if="emailItem.message_id"
                :text="emailItem.message_id"
                :title="copyValueText" />
            </div>
          </div>

          <div class="client-emails__cell">
            <div class="client-emails__label">{{ sourceText }}</div>
            <div class="client-emails__copy-row">
              <span class="truncate">{{ emailSourceLabel(emailItem) }}</span>
              <UiIconCopy
                v-if="emailSourceRaw(emailItem)"
                :text="emailSourceRaw(emailItem)"
                :title="copyValueText" />
            </div>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="hasMore"
      class="client-emails__load-more">
      <PrimeButton
        type="button"
        text
        :loading="isLoadingMore"
        :label="loadMoreText"
        @click="handleLoadMore" />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import useAppCore from "~/composables/useAppCore";

  const props = defineProps<{
    clientId: string;
    userData?: Record<string, any>;
  }>();

  type EmailHistoryItem = {
    id: string;
    recipient_email: string | null;
    recipient_name: string | null;
    subject: string | null;
    category: string | null;
    mail_class: string | null;
    notification_class: string | null;
    message_id: string | null;
    sent_at: string | null;
    created_at: string | null;
  };

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();

  const emails = ref<EmailHistoryItem[]>([]);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const errorMessage = ref("");
  const page = ref(1);
  const lastPage = ref(1);
  const total = ref(0);

  const resolveText = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const titleText = computed(() => resolveText("admin.clients.emails.title", "Email history"));
  const subtitleText = computed(() =>
    resolveText(
      "admin.clients.emails.subtitle",
      "All transactional emails sent to this client are shown here from newest to oldest."
    )
  );
  const totalText = computed(() => resolveText("admin.clients.emails.total", "Total"));
  const emptyText = computed(() => resolveText("admin.clients.emails.empty", "No emails have been sent yet."));
  const fallbackSubjectText = computed(() => resolveText("admin.clients.emails.noSubject", "No subject"));
  const recipientText = computed(() => resolveText("admin.clients.emails.recipient", "Recipient"));
  const typeText = computed(() => resolveText("admin.clients.emails.type", "Type"));
  const messageIdText = computed(() => resolveText("admin.clients.emails.messageId", "Message ID"));
  const sourceText = computed(() => resolveText("admin.clients.emails.source", "Source"));
  const copyValueText = computed(() => resolveText("admin.common.copy", "Copy"));
  const loadMoreText = computed(() => resolveText("admin.common.loadMore", "Load more"));

  const hasMore = computed(() => page.value < lastPage.value);

  const formatDateTime = (value?: string | null): string => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const emailCategoryText = (category?: string | null): string => {
    const normalized = String(category ?? "").trim().toLowerCase();

    if (normalized === "auth") {
      return resolveText("admin.clients.emails.categories.auth", "Authentication");
    }

    if (normalized === "accounts") {
      return resolveText("admin.clients.emails.categories.accounts", "Accounts");
    }

    if (normalized === "billing") {
      return resolveText("admin.clients.emails.categories.billing", "Billing");
    }

    if (normalized === "clients") {
      return resolveText("admin.clients.emails.categories.clients", "Client management");
    }

    if (normalized === "support") {
      return resolveText("admin.clients.emails.categories.support", "Support");
    }

    return normalized || resolveText("admin.clients.emails.categories.transactional", "Transactional");
  };

  const emailSourceRaw = (item: EmailHistoryItem): string => String(item.notification_class || item.mail_class || "").trim();

  const emailSourceLabel = (item: EmailHistoryItem): string => {
    const value = emailSourceRaw(item);
    if (value === "") {
      return "-";
    }

    const segments = value.split("\\");
    return segments[segments.length - 1] || value;
  };

  const loadPage = async (targetPage: number, append = false): Promise<void> => {
    if (!props.clientId) {
      return;
    }

    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
      errorMessage.value = "";
    }

    try {
      const response = await appCore.adminModules.clients.getEmails(props.clientId, {
        page: targetPage,
        perPage: 10,
      });

      const payload = response?.data?.data ?? {};
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      page.value = Number(payload?.current_page ?? targetPage);
      lastPage.value = Number(payload?.last_page ?? targetPage);
      total.value = Number(payload?.total ?? rows.length);

      emails.value = append ? [...emails.value, ...rows] : rows;
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message ||
        resolveText("admin.clients.emails.loadError", "Failed to load email history.");
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  };

  const handleLoadMore = async (): Promise<void> => {
    if (!hasMore.value || isLoadingMore.value) {
      return;
    }

    await loadPage(page.value + 1, true);
  };

  onMounted(async () => {
    await loadPage(1);
  });
</script>

<style scoped lang="scss">
  .client-emails {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .client-emails__summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .client-emails__summary h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.1;
  }

  .client-emails__summary p {
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  .client-emails__summary-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 700;
  }

  .client-emails__state {
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    text-align: center;
    padding: 20px;
  }

  .client-emails__state--error {
    color: var(--ui-sticker-danger);
  }

  .client-emails__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .client-emails__card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid var(--color-stroke-ui-light);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-background-card) 82%, transparent) 0%, transparent 100%),
      var(--ui-background-panel);
  }

  .client-emails__card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .client-emails__card-main {
    min-width: 0;
  }

  .client-emails__card-subject {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.35;
  }

  .client-emails__card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .client-emails__card-date {
    white-space: nowrap;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.4;
  }

  .client-emails__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }

  .client-emails__cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
    min-width: 0;
  }

  .client-emails__label {
    color: var(--ui-text-secondary);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .client-emails__value {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  .client-emails__copy-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  .client-emails__load-more {
    display: flex;
    justify-content: center;
  }

  @media (max-width: 767px) {
    .client-emails__summary,
    .client-emails__card-top {
      flex-direction: column;
    }

    .client-emails__summary-pill,
    .client-emails__card-date {
      align-self: flex-start;
    }

    .client-emails__card,
    .client-emails__cell {
      padding: 14px;
    }
  }
</style>
