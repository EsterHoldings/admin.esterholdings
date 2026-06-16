import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";

export type ReferralFilters = {
  search: string;
  role: string;
  status: string;
  level: string;
  agent_id: string;
  include_descendants: boolean;
  order_by: string;
  order_direction: string;
};

export type ReferralSettingsForm = {
  max_levels: number;
  bonus_strategy: string;
  level_rates: Record<string, number>;
};

export type ReferralOption = {
  label: string;
  value: string;
  [key: string]: any;
};

export type ReferralRow = {
  id: string;
  user_id: string;
  agent_id?: string | null;
  status: string;
  level: number;
  is_agent: boolean;
  is_referral: boolean;
  referrals_count: number;
  descendants_count: number;
  successful_lots: number;
  successful_trades: number;
  calculated_bonus: number;
  rate_per_lot: number;
  referral_link: string;
  created_at?: string | null;
  user: {
    id: string;
    email?: string | null;
    first_name?: string | null;
    mid_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    photo_url?: string | null;
  };
  agent?: {
    id: string;
    user_id?: string | null;
    email?: string | null;
    first_name?: string | null;
    mid_name?: string | null;
    last_name?: string | null;
  } | null;
};

export interface ReferralPanelProps {
  labels: Record<string, string>;
  activeTab: string;
  rows: ReferralRow[];
  summary: Record<string, any> | null;
  filters: ReferralFilters;
  settingsForm: ReferralSettingsForm;
  roleOptions: ReferralOption[];
  statusOptions: ReferralOption[];
  levelOptions: ReferralOption[];
  agentOptions: ReferralOption[];
  strategyOptions: ReferralOption[];
  settingsLevels: number[];
  selectedStrategyDescription: string;
  isLoading: boolean;
  isSaving: boolean;
  page: number;
  perPage: number;
  totalRows: number;
  setActiveTab: (tab: string) => void;
  updateFilter: (key: keyof ReferralFilters, value: string | boolean) => void;
  updateSettingsField: (key: keyof ReferralSettingsForm, value: string | number) => void;
  updateLevelRate: (level: number, value: string | number) => void;
  resetFilters: () => void;
  reload: () => void;
  saveSettings: () => void;
  handlePageChange: (nextPage: number) => void;
  handlePerPageChange: (nextPerPage: number) => void;
  copyLink: (value: string) => void;
  clientLink: (clientId: string) => string;
  formatName: (user?: Record<string, any> | null) => string;
  initials: (user?: Record<string, any> | null) => string;
  formatDateTime: (value?: string | null) => string;
  formatMoney: (value?: number | string | null) => string;
  formatNumber: (value?: number | string | null) => string;
}

const DEFAULT_PER_PAGE = 20;

export function useReferralPage() {
  const appCore = useAppCore();
  const toast = useToast();
  const localePath = useLocalePath();
  const { locale } = useI18n({ useScope: "global" });

  const activeTab = ref("network");
  const rows = ref<ReferralRow[]>([]);
  const summary = ref<Record<string, any> | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const page = ref(1);
  const perPage = ref(DEFAULT_PER_PAGE);
  const totalRows = ref(0);
  const roleOptions = ref<ReferralOption[]>([]);
  const statusOptions = ref<ReferralOption[]>([]);
  const levelOptions = ref<ReferralOption[]>([]);
  const agentOptions = ref<ReferralOption[]>([]);
  const strategyOptions = ref<ReferralOption[]>([]);
  let searchTimer: number | undefined;

  const filters = reactive<ReferralFilters>({
    search: "",
    role: "all",
    status: "all",
    level: "all",
    agent_id: "",
    include_descendants: true,
    order_by: "created_at",
    order_direction: "desc",
  });

  const settingsForm = reactive<ReferralSettingsForm>({
    max_levels: 3,
    bonus_strategy: "successful_lots",
    level_rates: {
      "1": 1,
      "2": 0.5,
      "3": 0.25,
    },
  });

  const copy = (ru: string, en: string, uk?: string): string => {
    if (locale.value === "ru") return ru;
    if (locale.value === "uk") return uk || ru;

    return en;
  };

  const labels = computed(() => ({
    title: copy("Реферальная система", "Referral system", "Реферальна система"),
    subtitle: copy(
      "Агенты, рефералы, уровни вложенности и стратегия расчета бонусов.",
      "Agents, referrals, depth levels, and bonus calculation strategy.",
      "Агенти, реферали, рівні вкладеності та стратегія розрахунку бонусів."
    ),
    network: copy("Сеть", "Network", "Мережа"),
    settings: copy("Настройки", "Settings", "Налаштування"),
    refresh: copy("Обновить", "Refresh", "Оновити"),
    reset: copy("Сбросить", "Reset", "Скинути"),
    save: copy("Сохранить настройки", "Save settings", "Зберегти налаштування"),
    search: copy("Поиск по клиенту или агенту", "Search client or agent", "Пошук клієнта або агента"),
    role: copy("Тип", "Type", "Тип"),
    status: copy("Статус", "Status", "Статус"),
    level: copy("Уровень", "Level", "Рівень"),
    agent: copy("Агент", "Agent", "Агент"),
    allAgents: copy("Все агенты", "All agents", "Усі агенти"),
    includeDescendants: copy("Показывать всю ветку агента", "Show full agent branch", "Показувати всю гілку агента"),
    client: copy("Клиент", "Client", "Клієнт"),
    agentColumn: copy("Агент", "Agent", "Агент"),
    metrics: copy("Метрики", "Metrics", "Метрики"),
    bonus: copy("Бонус", "Bonus", "Бонус"),
    link: copy("Ссылка", "Link", "Посилання"),
    empty: copy("Рефералов по выбранным фильтрам нет.", "No referrals match these filters.", "Немає рефералів за фільтрами."),
    loading: copy("Загружаю реферальную систему...", "Loading referral system...", "Завантажую реферальну систему..."),
    records: copy("Записей", "Records", "Записів"),
    agents: copy("Агентов", "Agents", "Агентів"),
    referrals: copy("Рефералов", "Referrals", "Рефералів"),
    totalBonus: copy("Рассчитанный бонус", "Calculated bonus", "Розрахований бонус"),
    lots: copy("Успешные лоты", "Successful lots", "Успішні лоти"),
    trades: copy("Сделки", "Trades", "Угоди"),
    maxLevels: copy("Сколько уровней учитывать", "Referral depth", "Скільки рівнів враховувати"),
    strategy: copy("Стратегия расчета", "Calculation strategy", "Стратегія розрахунку"),
    rates: copy("Ставки по уровням", "Level rates", "Ставки за рівнями"),
    perLot: copy("USD за успешный лот", "USD per successful lot", "USD за успішний лот"),
    copied: copy("Ссылка скопирована", "Link copied", "Посилання скопійовано"),
    saved: copy("Настройки сохранены", "Settings saved", "Налаштування збережено"),
    saveError: copy("Не удалось сохранить настройки", "Failed to save settings", "Не вдалося зберегти налаштування"),
    loadError: copy("Не удалось загрузить реферальную систему", "Failed to load referral system", "Не вдалося завантажити систему"),
  }));

  const normalizedRoleOptions = computed(() => [
    { label: copy("Все записи", "All records", "Усі записи"), value: "all" },
    ...roleOptions.value.filter(option => option.value !== "all"),
  ]);
  const normalizedStatusOptions = computed(() => [
    { label: copy("Все статусы", "All statuses", "Усі статуси"), value: "all" },
    ...statusOptions.value.filter(option => option.value !== "all"),
  ]);
  const normalizedLevelOptions = computed(() => [
    { label: copy("Все уровни", "All levels", "Усі рівні"), value: "all" },
    ...levelOptions.value,
  ]);
  const normalizedAgentOptions = computed(() => [
    { label: labels.value.allAgents, value: "" },
    ...agentOptions.value,
  ]);
  const normalizedStrategyOptions = computed(() =>
    strategyOptions.value.map(option => ({
      label: option.name || option.label || option.key || option.value,
      value: option.key || option.value,
      description: option.description,
    }))
  );
  const settingsLevels = computed(() =>
    Array.from({ length: Math.max(1, Number(settingsForm.max_levels) || 1) }, (_, index) => index + 1)
  );
  const selectedStrategyDescription = computed(() => {
    const selected = normalizedStrategyOptions.value.find(option => option.value === settingsForm.bonus_strategy);

    return selected?.description || "";
  });

  const applySettings = (settings: Record<string, any>) => {
    settingsForm.max_levels = Math.max(1, Number(settings?.max_levels ?? 3) || 3);
    settingsForm.bonus_strategy = String(settings?.bonus_strategy ?? "successful_lots");

    const rates = settings?.strategy_settings?.successful_lots?.level_rates ?? {};
    settingsForm.level_rates = {};
    for (let level = 1; level <= settingsForm.max_levels; level++) {
      settingsForm.level_rates[String(level)] = Number(rates[level] ?? rates[String(level)] ?? 0);
    }
  };

  const loadMeta = async () => {
    const response = await appCore.adminModules.referrals.getMeta();
    const payload = response?.data?.data ?? {};

    roleOptions.value = Array.isArray(payload.roles) ? payload.roles : [];
    statusOptions.value = Array.isArray(payload.statuses) ? payload.statuses : [];
    levelOptions.value = Array.isArray(payload.levels) ? payload.levels : [];
    agentOptions.value = Array.isArray(payload.agents) ? payload.agents : [];
    strategyOptions.value = Array.isArray(payload.strategies) ? payload.strategies : [];
    applySettings(payload.settings ?? {});
  };

  const loadSummary = async () => {
    const response = await appCore.adminModules.referrals.getSummary();
    summary.value = response?.data?.data ?? null;
  };

  const listParams = () => ({
    page: page.value,
    per_page: perPage.value,
    search: filters.search || undefined,
    role: filters.role,
    status: filters.status,
    level: filters.level,
    agent_id: filters.agent_id || undefined,
    include_descendants: filters.include_descendants ? 1 : 0,
    order_by: filters.order_by,
    order_direction: filters.order_direction,
  });

  const loadList = async () => {
    const response = await appCore.adminModules.referrals.getList(listParams());
    const payload = response?.data?.data ?? {};
    rows.value = Array.isArray(payload.data) ? payload.data : [];
    totalRows.value = Number(payload.total ?? rows.value.length);
    page.value = Number(payload.current_page ?? page.value) || 1;
    perPage.value = Number(payload.per_page ?? perPage.value) || DEFAULT_PER_PAGE;
  };

  const reload = async () => {
    isLoading.value = true;
    try {
      await Promise.all([loadMeta(), loadSummary(), loadList()]);
    } catch {
      toast.error(labels.value.loadError);
    } finally {
      isLoading.value = false;
    }
  };

  const reloadListAndSummary = async () => {
    isLoading.value = true;
    try {
      await Promise.all([loadSummary(), loadList()]);
    } catch {
      toast.error(labels.value.loadError);
    } finally {
      isLoading.value = false;
    }
  };

  const setActiveTab = (tab: string) => {
    activeTab.value = tab;
  };

  const updateFilter = (key: keyof ReferralFilters, value: string | boolean) => {
    (filters[key] as any) = value;
    page.value = 1;

    if (key === "search") {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => void reloadListAndSummary(), 350);
      return;
    }

    void reloadListAndSummary();
  };

  const resetFilters = () => {
    filters.search = "";
    filters.role = "all";
    filters.status = "all";
    filters.level = "all";
    filters.agent_id = "";
    filters.include_descendants = true;
    filters.order_by = "created_at";
    filters.order_direction = "desc";
    page.value = 1;
    void reloadListAndSummary();
  };

  const updateSettingsField = (key: keyof ReferralSettingsForm, value: string | number) => {
    if (key === "max_levels") {
      const nextMax = Math.max(1, Math.min(10, Number(value) || 1));
      settingsForm.max_levels = nextMax;

      for (let level = 1; level <= nextMax; level++) {
        const previous = settingsForm.level_rates[String(level - 1)] ?? 0;
        settingsForm.level_rates[String(level)] ??= level === 1 ? 1 : Number((previous * 0.5).toFixed(4));
      }

      return;
    }

    (settingsForm[key] as any) = value;
  };

  const updateLevelRate = (level: number, value: string | number) => {
    settingsForm.level_rates[String(level)] = Math.max(0, Number(value) || 0);
  };

  const saveSettings = async () => {
    isSaving.value = true;
    try {
      await appCore.adminModules.referrals.updateSettings({
        max_levels: settingsForm.max_levels,
        bonus_strategy: settingsForm.bonus_strategy,
        strategy_settings: {
          successful_lots: {
            level_rates: settingsForm.level_rates,
          },
        },
      });
      toast.success(labels.value.saved);
      await reload();
    } catch {
      toast.error(labels.value.saveError);
    } finally {
      isSaving.value = false;
    }
  };

  const handlePageChange = (nextPage: number) => {
    page.value = nextPage;
    void reloadListAndSummary();
  };

  const handlePerPageChange = (nextPerPage: number) => {
    perPage.value = nextPerPage;
    page.value = 1;
    void reloadListAndSummary();
  };

  const copyLink = async (value: string) => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    toast.success(labels.value.copied);
  };

  const clientLink = (clientId: string) => localePath(`/clients/${clientId}`);

  const formatName = (user?: Record<string, any> | null): string => {
    if (!user) return "-";
    const name = [user.first_name, user.mid_name, user.last_name].filter(Boolean).join(" ").trim();

    return name || user.email || "-";
  };

  const initials = (user?: Record<string, any> | null): string => {
    const value = formatName(user);
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join("");
  };

  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
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

  const formatNumber = (value?: number | string | null): string =>
    new Intl.NumberFormat(locale.value || undefined, {
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

  const formatMoney = (value?: number | string | null): string =>
    new Intl.NumberFormat(locale.value || undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

  watch(
    () => locale.value,
    () => {
      void loadMeta();
    }
  );

  onMounted(() => {
    void reload();
  });

  const referralPanelProps = computed<ReferralPanelProps>(() => ({
    labels: labels.value,
    activeTab: activeTab.value,
    rows: rows.value,
    summary: summary.value,
    filters,
    settingsForm,
    roleOptions: normalizedRoleOptions.value,
    statusOptions: normalizedStatusOptions.value,
    levelOptions: normalizedLevelOptions.value,
    agentOptions: normalizedAgentOptions.value,
    strategyOptions: normalizedStrategyOptions.value,
    settingsLevels: settingsLevels.value,
    selectedStrategyDescription: selectedStrategyDescription.value,
    isLoading: isLoading.value,
    isSaving: isSaving.value,
    page: page.value,
    perPage: perPage.value,
    totalRows: totalRows.value,
    setActiveTab,
    updateFilter,
    updateSettingsField,
    updateLevelRate,
    resetFilters,
    reload,
    saveSettings,
    handlePageChange,
    handlePerPageChange,
    copyLink,
    clientLink,
    formatName,
    initials,
    formatDateTime,
    formatMoney,
    formatNumber,
  }));

  return {
    referralPanelProps,
  };
}
