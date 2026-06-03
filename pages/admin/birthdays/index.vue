<template>
  <section class="birthdays-page">
    <div
      v-if="isLoading && items.length === 0"
      class="birthdays-page__state">
      <span class="pi pi-spin pi-spinner" />
      <span>{{ copy("Загружаю дни рождения...", "Loading birthdays...", "Завантажую дні народження...") }}</span>
    </div>

    <div
      v-else-if="loadError && items.length === 0"
      class="birthdays-page__state birthdays-page__state--danger">
      {{ loadError }}
    </div>

    <div
      v-else-if="items.length === 0"
      class="birthdays-page__state">
      {{
        copy(
          "На выбранный период дней рождения нет.",
          "No birthdays for the selected period.",
          "На вибраний період днів народження немає."
        )
      }}
    </div>

    <div
      v-else
      class="birthdays-page__results">
      <div
        v-if="loadError"
        class="birthdays-page__inline-error">
        {{ loadError }}
      </div>

      <div class="birthdays-page__list">
        <article
          v-for="item in items"
          :key="item.user_id"
          class="birthday-card">
          <div class="birthday-card__main">
            <NuxtLink
              class="birthday-card__avatar-link"
              :to="clientLink(item.user_id)">
              <img
                v-if="item.photo_url"
                :src="item.photo_url"
                :alt="item.full_name"
                class="birthday-card__avatar" />
              <span
                v-else
                class="birthday-card__avatar birthday-card__avatar--placeholder">
                {{ item.initials || initials(item.full_name) }}
              </span>
            </NuxtLink>

            <div class="birthday-card__identity">
              <NuxtLink
                class="birthday-card__name"
                :to="clientLink(item.user_id)">
                {{ item.full_name || "—" }}
              </NuxtLink>
              <NuxtLink
                class="birthday-card__email"
                :to="clientLink(item.user_id)">
                {{ item.email || "—" }}
              </NuxtLink>
            </div>
          </div>

          <div class="birthday-card__date">
            <div class="birthday-card__date-day">{{ formatDayMonth(item.birthday_on) }}</div>
            <div class="birthday-card__date-meta">
              <span>{{ ageLabel(item.age) }}</span>
              <span>{{ daysLabel(item.days_until) }}</span>
            </div>
          </div>

          <div class="birthday-card__history">
            <div class="birthday-card__history-title">
              {{ copy("История писем", "Email history", "Історія листів") }}
            </div>

            <div
              v-if="item.notifications.length === 0"
              class="birthday-card__history-empty">
              {{ copy("Писем пока нет", "No emails yet", "Листів поки немає") }}
            </div>

            <div
              v-else
              class="birthday-card__history-list">
              <div
                v-for="notification in item.notifications"
                :key="notification.id"
                class="birthday-card__history-row">
                <span
                  class="birthday-card__status"
                  :class="`is-${notification.status}`">
                  {{ statusLabel(notification.status) }}
                </span>
                <span class="birthday-card__history-text">
                  {{ recipientLabel(notification.recipient_type) }} · {{ typeLabel(notification.notification_type) }}
                </span>
                <span class="birthday-card__history-subject">{{ notification.subject || "—" }}</span>
                <span class="birthday-card__history-recipient">{{ notification.recipient_email }}</span>
                <span class="birthday-card__history-time">
                  {{ formatDateTime(notification.sent_at || notification.queued_at || notification.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="birthdays-page__load-more"
        :disabled="isBusy"
        @click="loadMore">
        <span
          v-if="isLoadingMore"
          class="pi pi-spin pi-spinner" />
        <span>{{ copy("Загрузить еще", "Load more", "Завантажити ще") }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";
  import useAppCore from "~/composables/useAppCore";

  type BirthdayNotification = {
    id: string;
    notification_type: string;
    recipient_type: string;
    recipient_email: string;
    subject?: string | null;
    status: string;
    queued_at?: string | null;
    sent_at?: string | null;
    created_at?: string | null;
  };

  type BirthdayItem = {
    user_id: string;
    full_name: string;
    email: string;
    photo_url?: string | null;
    initials?: string | null;
    birthday_on: string;
    age: number;
    days_until: number;
    notifications: BirthdayNotification[];
  };

  type BirthdaysMeta = {
    scope: string;
    period: string;
    year: number;
    from: string;
    to: string;
    total: number;
    page?: number;
    per_page?: number;
    last_page?: number;
    has_more?: boolean;
    items_from?: number;
    items_to?: number;
    generated_at: string;
  };

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const appCore = useAppCore();
  const localePath = useLocalePath();
  const { locale } = useI18n({ useScope: "global" });
  const currentYear = new Date().getFullYear();
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const loadError = ref("");
  const items = ref<BirthdayItem[]>([]);
  const meta = ref<BirthdaysMeta | null>(null);
  const page = ref(1);
  const perPage = ref(5);
  const filters = {
    period: "1y",
    scope: "future",
  };

  const copy = (ru: string, en: string, uk?: string): string => {
    if (locale.value === "ru") return ru;
    if (locale.value === "uk") return uk || ru;

    return en;
  };

  const currentPage = computed(() => Number(meta.value?.page ?? page.value) || 1);
  const lastPage = computed(() => Math.max(1, Number(meta.value?.last_page ?? 1) || 1));
  const hasMore = computed(() => Boolean(meta.value?.has_more) && currentPage.value < lastPage.value);
  const isBusy = computed(() => isLoading.value || isLoadingMore.value);

  const clientLink = (clientId: string) => localePath(`/clients/${clientId}`);
  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDayMonth = (value?: string | null): string => {
    const date = parseDate(value);
    if (!date) return "—";

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "long",
    }).format(date);
  };

  const formatDateTime = (value?: string | null): string => {
    const date = parseDate(value);
    if (!date) return "—";

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const initials = (name: string): string => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join("");
  };

  const ageLabel = (age: number): string => {
    if (!Number.isFinite(Number(age)) || Number(age) <= 0)
      return copy("Возраст не указан", "Age unknown", "Вік не вказано");

    return copy(`${age} лет`, `${age} y.o.`, `${age} років`);
  };

  const daysLabel = (days: number): string => {
    const value = Number(days);
    if (value === 0) return copy("Сегодня", "Today", "Сьогодні");
    if (value === 1) return copy("Завтра", "Tomorrow", "Завтра");
    if (value > 1) return copy(`Через ${value} дн.`, `In ${value} days`, `Через ${value} дн.`);

    return copy(`${Math.abs(value)} дн. назад`, `${Math.abs(value)} days ago`, `${Math.abs(value)} дн. тому`);
  };

  const recipientLabel = (type: string): string => {
    if (type === "client") return copy("Клиенту", "Client", "Клієнту");
    if (type === "support") return copy("Саппорту", "Support", "Підтримці");

    return type;
  };

  const typeLabel = (type: string): string => {
    if (type === "today") return copy("день рождения сегодня", "birthday today", "день народження сьогодні");
    if (type === "tomorrow") return copy("день рождения завтра", "birthday tomorrow", "день народження завтра");

    return type;
  };

  const statusLabel = (status: string): string => {
    if (status === "sent") return copy("Отправлено", "Sent", "Надіслано");
    if (status === "queued") return copy("В очереди", "Queued", "У черзі");
    if (status === "failed") return copy("Ошибка", "Failed", "Помилка");
    if (status === "skipped") return copy("Пропущено", "Skipped", "Пропущено");

    return status;
  };

  const loadBirthdays = async ({ append = false } = {}) => {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
      items.value = [];
    }
    loadError.value = "";

    try {
      const response = await appCore.adminModules.clients.getBirthdays({
        period: filters.period,
        scope: filters.scope,
        year: currentYear,
        page: page.value,
        per_page: perPage.value,
      });
      const payload = response?.data?.data ?? {};
      const nextItems = Array.isArray(payload.items) ? payload.items : [];

      items.value = append ? [...items.value, ...nextItems] : nextItems;
      meta.value = payload.meta ?? null;
      page.value = Number(meta.value?.page ?? page.value) || 1;
    } catch (error) {
      loadError.value =
        error instanceof Error
          ? error.message
          : copy(
              "Не удалось загрузить дни рождения.",
              "Failed to load birthdays.",
              "Не вдалося завантажити дні народження."
            );

      if (append) {
        page.value = Number(meta.value?.page ?? 1) || 1;
      }
    } finally {
      if (append) {
        isLoadingMore.value = false;
      } else {
        isLoading.value = false;
      }
    }
  };

  const reloadBirthdays = () => {
    page.value = 1;
    loadBirthdays();
  };

  const loadMore = () => {
    if (!hasMore.value || isBusy.value) return;

    page.value = currentPage.value + 1;
    loadBirthdays({ append: true });
  };

  onMounted(() => {
    reloadBirthdays();
  });
</script>

<style scoped lang="scss">
  .birthdays-page {
    min-height: 100%;
    padding: 10px;
    color: var(--ui-text-main);
  }

  .birthday-card {
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
  }

  .birthdays-page__state {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--ui-text-secondary);
  }

  .birthdays-page__state--danger {
    color: var(--ui-sticker-danger);
  }

  .birthdays-page__inline-error {
    margin-bottom: 14px;
    color: var(--ui-sticker-danger);
    text-align: center;
    font-size: 13px;
    font-weight: 700;
  }

  .birthdays-page__list {
    display: grid;
    gap: 12px;
  }

  .birthdays-page__load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: fit-content;
    min-height: 38px;
    margin: 14px auto 0;
    padding: 0 18px;
    border: 1px solid var(--ui-primary-main);
    border-radius: 8px;
    background: transparent;
    color: var(--ui-primary-main);
    font-weight: 800;

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  .birthday-card {
    display: grid;
    grid-template-columns: minmax(260px, 1.1fr) minmax(170px, 0.45fr) minmax(320px, 1.35fr);
    align-items: center;
    gap: 16px;
    padding: 14px;
    border-radius: 12px;
  }

  .birthday-card__main {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
  }

  .birthday-card__avatar-link,
  .birthday-card__avatar {
    flex: 0 0 54px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
  }

  .birthday-card__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: cover;
    border: 2px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-primary-main) 14%, var(--ui-background-panel));
    color: var(--ui-text-main);
    font-weight: 800;
  }

  .birthday-card__identity {
    min-width: 0;
  }

  .birthday-card__name,
  .birthday-card__email {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
  }

  .birthday-card__name {
    color: var(--ui-text-main);
    font-size: 16px;
    font-weight: 800;
  }

  .birthday-card__email {
    margin-top: 4px;
    color: var(--ui-text-secondary);
    font-size: 13px;
  }

  .birthday-card__date {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .birthday-card__date-day {
    font-size: 18px;
    font-weight: 800;
    color: var(--ui-text-main);
  }

  .birthday-card__date-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .birthday-card__date-meta span,
  .birthday-card__status {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: var(--color-stroke-ui-light);
  }

  .birthday-card__history {
    min-width: 0;
  }

  .birthday-card__history-title {
    margin-bottom: 8px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .birthday-card__history-empty {
    color: var(--ui-text-secondary);
    font-size: 13px;
  }

  .birthday-card__history-list {
    display: grid;
    gap: 6px;
  }

  .birthday-card__history-row {
    display: grid;
    grid-template-columns: auto minmax(120px, 0.9fr) minmax(140px, 1fr) minmax(140px, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .birthday-card__history-text,
  .birthday-card__history-subject,
  .birthday-card__history-recipient,
  .birthday-card__history-time {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .birthday-card__status {
    color: #fff;
    font-weight: 800;

    &.is-sent {
      background: var(--color-success);
    }

    &.is-queued {
      background: var(--ui-primary-main);
    }

    &.is-failed {
      background: var(--ui-sticker-danger);
    }

    &.is-skipped {
      background: var(--color-warning);
    }
  }

  @media (max-width: 1180px) {
    .birthday-card {
      grid-template-columns: 1fr;
      align-items: flex-start;
    }

    .birthday-card__history-row {
      grid-template-columns: auto minmax(120px, 1fr);
    }
  }

  @media (max-width: 640px) {
    .birthday-card__history-row {
      grid-template-columns: 1fr;
      align-items: flex-start;
    }
  }
</style>
