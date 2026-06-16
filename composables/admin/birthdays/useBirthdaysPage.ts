import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";

export type BirthdayNotification = {
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

export type BirthdayItem = {
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

export type BirthdaysMeta = {
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

export type BirthdaysFilters = {
  period: string;
  scope: string;
};

export type BirthdayOption = {
  label: string;
  value: string;
};

export interface BirthdaysPanelLabels {
  title: string;
  subtitle: string;
  refresh: string;
  period: string;
  group: string;
  show: string;
  year: string;
  range: string;
  found: string;
  shown: string;
  page: string;
  loading: string;
  empty: string;
  history: string;
  noEmails: string;
  loadMore: string;
}

export interface BirthdaysPanelProps {
  labels: BirthdaysPanelLabels;
  currentYear: number;
  filters: BirthdaysFilters;
  periodOptions: BirthdayOption[];
  scopeOptions: BirthdayOption[];
  perPage: number;
  perPageOptions: number[];
  meta: BirthdaysMeta | null;
  totalItems: number;
  shownItems: string;
  currentPage: number;
  lastPage: number;
  pageNumbers: number[];
  hasMore: boolean;
  isBusy: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadError: string;
  items: BirthdayItem[];
  updateFilter: (key: keyof BirthdaysFilters, value: string) => void;
  updatePerPage: (value: number) => void;
  reloadBirthdays: () => void;
  goToPage: (targetPage: number) => void;
  loadMore: () => void;
  clientLink: (clientId: string) => string;
  formatDate: (value?: string | null) => string;
  formatDayMonth: (value?: string | null) => string;
  formatDateTime: (value?: string | null) => string;
  initials: (name: string) => string;
  ageLabel: (age: number) => string;
  daysLabel: (days: number) => string;
  recipientLabel: (type: string) => string;
  typeLabel: (type: string) => string;
  statusLabel: (status: string) => string;
}

export function useBirthdaysPage() {
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
  const perPageOptions = [5, 10, 20, 50];
  const filters = reactive<BirthdaysFilters>({
    period: "1y",
    scope: "future",
  });

  const copy = (ru: string, en: string, uk?: string): string => {
    if (locale.value === "ru") return ru;
    if (locale.value === "uk") return uk || ru;

    return en;
  };

  const labels = computed(() => ({
    title: copy("Дни рождения", "Birthdays", "Дні народження"),
    subtitle: copy(
      "Клиенты с ближайшими днями рождения и история отправленных писем клиенту и саппорту.",
      "Upcoming client birthdays and the history of support/client emails.",
      "Клієнти з найближчими днями народження та історія листів клієнту і підтримці."
    ),
    refresh: copy("Обновить", "Refresh", "Оновити"),
    period: copy("Период", "Period", "Період"),
    group: copy("Группа", "Group", "Група"),
    show: copy("Показывать", "Show", "Показувати"),
    year: copy("Год", "Year", "Рік"),
    range: copy("Период", "Range", "Період"),
    found: copy("Найдено", "Found", "Знайдено"),
    shown: copy("Показано", "Shown", "Показано"),
    page: copy("Страница", "Page", "Сторінка"),
    loading: copy("Загружаю дни рождения...", "Loading birthdays...", "Завантажую дні народження..."),
    empty: copy(
      "На выбранный период дней рождения нет.",
      "No birthdays for the selected period.",
      "На вибраний період днів народження немає."
    ),
    history: copy("История писем", "Email history", "Історія листів"),
    noEmails: copy("Писем пока нет", "No emails yet", "Листів поки немає"),
    loadMore: copy("Загрузить еще", "Load more", "Завантажити ще"),
  }));

  const periodOptions = computed<BirthdayOption[]>(() => [
    { label: copy("1м", "1m", "1м"), value: "1m" },
    { label: copy("3м", "3m", "3м"), value: "3m" },
    { label: copy("6м", "6m", "6м"), value: "6m" },
    { label: copy("1г", "1y", "1р"), value: "1y" },
  ]);

  const scopeOptions = computed<BirthdayOption[]>(() => [
    {
      label: copy("Будущие дни рождения", "Upcoming birthdays", "Майбутні дні народження"),
      value: "future",
    },
    {
      label: copy("Прошедшие дни рождения", "Past birthdays", "Минулі дні народження"),
      value: "past",
    },
  ]);

  const totalItems = computed(() => Number(meta.value?.total ?? items.value.length) || 0);
  const shownItems = computed(() => {
    if (items.value.length > Number(meta.value?.per_page ?? perPage.value)) {
      return `1-${items.value.length}`;
    }

    if (meta.value?.items_from && meta.value?.items_to) {
      return `${meta.value.items_from}-${meta.value.items_to}`;
    }

    return String(items.value.length);
  });
  const currentPage = computed(() => Number(meta.value?.page ?? page.value) || 1);
  const lastPage = computed(() => Math.max(1, Number(meta.value?.last_page ?? 1) || 1));
  const hasMore = computed(() => Boolean(meta.value?.has_more) && currentPage.value < lastPage.value);
  const isBusy = computed(() => isLoading.value || isLoadingMore.value);
  const pageNumbers = computed(() => {
    const visiblePages = 5;
    const last = lastPage.value;
    const current = currentPage.value;
    const half = Math.floor(visiblePages / 2);
    const start = Math.max(1, Math.min(current - half, Math.max(1, last - visiblePages + 1)));
    const end = Math.min(last, start + visiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  const clientLink = (clientId: string) => localePath(`/clients/${clientId}`);
  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value?: string | null): string => {
    const date = parseDate(value);
    if (!date) return "-";

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDayMonth = (value?: string | null): string => {
    const date = parseDate(value);
    if (!date) return "-";

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "long",
    }).format(date);
  };

  const formatDateTime = (value?: string | null): string => {
    const date = parseDate(value);
    if (!date) return "-";

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

  const updateFilter = (key: keyof BirthdaysFilters, value: string): void => {
    filters[key] = value;
  };

  const updatePerPage = (value: number): void => {
    perPage.value = Number(value) || perPageOptions[0];
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
    void loadBirthdays();
  };

  const goToPage = (targetPage: number) => {
    const nextPage = Math.min(Math.max(1, Number(targetPage) || 1), lastPage.value);
    if (nextPage === currentPage.value && items.value.length > 0) return;

    page.value = nextPage;
    void loadBirthdays();
  };

  const loadMore = () => {
    if (!hasMore.value || isBusy.value) return;

    page.value = currentPage.value + 1;
    void loadBirthdays({ append: true });
  };

  watch(
    () => [filters.period, filters.scope, perPage.value],
    () => reloadBirthdays()
  );

  onMounted(() => {
    reloadBirthdays();
  });

  const birthdaysPanelProps = computed<BirthdaysPanelProps>(() => ({
    labels: labels.value,
    currentYear,
    filters,
    periodOptions: periodOptions.value,
    scopeOptions: scopeOptions.value,
    perPage: perPage.value,
    perPageOptions,
    meta: meta.value,
    totalItems: totalItems.value,
    shownItems: shownItems.value,
    currentPage: currentPage.value,
    lastPage: lastPage.value,
    pageNumbers: pageNumbers.value,
    hasMore: hasMore.value,
    isBusy: isBusy.value,
    isLoading: isLoading.value,
    isLoadingMore: isLoadingMore.value,
    loadError: loadError.value,
    items: items.value,
    updateFilter,
    updatePerPage,
    reloadBirthdays,
    goToPage,
    loadMore,
    clientLink,
    formatDate,
    formatDayMonth,
    formatDateTime,
    initials,
    ageLabel,
    daysLabel,
    recipientLabel,
    typeLabel,
    statusLabel,
  }));

  return {
    birthdaysPanelProps,
  };
}
