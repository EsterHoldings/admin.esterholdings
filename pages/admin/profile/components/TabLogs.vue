<template>
  <div class="admin-profile-tab-space admin-profile-logs">
    <div class="admin-profile-logs__topbar">
      <div class="admin-profile-logs__summary-grid">
        <section
          v-for="card in summaryCards"
          :key="card.id"
          class="admin-profile-logs__summary-card">
          <UiTextSmall class="admin-profile-logs__summary-label">{{ card.label }}</UiTextSmall>
          <UiTextH5 class="admin-profile-logs__summary-value">{{ card.value }}</UiTextH5>
          <UiTextSmall class="admin-profile-logs__summary-hint">{{ card.hint }}</UiTextSmall>
        </section>
      </div>

      <UiButtonDefault
        state="info--outline--small"
        :isLoading="isLoading"
        @click="loadActivity">
        {{ resolveText("admin.profile.actions.refresh", "Обновить") }}
      </UiButtonDefault>
    </div>

    <div class="admin-profile-logs__tabs">
      <button
        v-for="tab in sectionTabs"
        :key="tab.id"
        type="button"
        class="admin-profile-logs__tab"
        :class="{ 'is-active': activeSection === tab.id }"
        @click="activeSection = tab.id">
        <span>{{ tab.label }}</span>
        <strong>{{ tab.count }}</strong>
      </button>
    </div>

    <section class="admin-profile-logs__panel">
      <div class="admin-profile-logs__panel-header">
        <div>
          <UiTextH5 class="admin-profile-logs__panel-title">{{ currentSectionTitle }}</UiTextH5>
          <UiTextSmall class="admin-profile-logs__panel-subtitle">{{ currentSectionDescription }}</UiTextSmall>
        </div>
      </div>

      <div
        v-if="visibleRows.length === 0"
        class="admin-profile-logs__empty-state">
        {{ currentEmptyText }}
      </div>

      <div
        v-else
        class="admin-profile-logs__timeline">
        <article
          v-for="row in visibleRows"
          :key="row.key"
          class="admin-profile-logs__event"
          :class="`admin-profile-logs__event--${row.kind}`">
          <div class="admin-profile-logs__marker">
            <i :class="row.icon" />
          </div>

          <div class="admin-profile-logs__event-card">
            <div class="admin-profile-logs__event-head">
              <div class="admin-profile-logs__event-title-wrap">
                <span
                  class="admin-profile-logs__event-badge"
                  :class="row.badgeClass">
                  {{ row.badge }}
                </span>
                <h3 class="admin-profile-logs__event-title">{{ row.title }}</h3>
              </div>

              <div class="admin-profile-logs__event-time">
                <strong>{{ row.timeLabel }}</strong>
                <span>{{ row.relativeTimeLabel }}</span>
              </div>
            </div>

            <p class="admin-profile-logs__event-description">{{ row.description }}</p>

            <div
              v-if="row.primaryFacts.length > 0 || row.link"
              class="admin-profile-logs__facts">
              <span
                v-for="fact in row.primaryFacts"
                :key="fact.label + fact.value"
                class="admin-profile-logs__fact">
                <small>{{ fact.label }}</small>
                <strong>{{ fact.value }}</strong>
              </span>

              <NuxtLink
                v-if="row.link"
                class="admin-profile-logs__open-link"
                :to="row.link.to">
                {{ row.link.label }}
                <i class="pi pi-arrow-up-right" />
              </NuxtLink>
            </div>

            <details
              v-if="row.technicalDetails.length > 0"
              class="admin-profile-logs__details">
              <summary>
                <span>{{ resolveText("admin.profile.logs.details.show", "Технические детали") }}</span>
                <i class="pi pi-chevron-down" />
              </summary>

              <dl class="admin-profile-logs__details-grid">
                <template
                  v-for="detail in row.technicalDetails"
                  :key="detail.label">
                  <dt>{{ detail.label }}</dt>
                  <dd>{{ detail.value }}</dd>
                </template>
              </dl>
            </details>
          </div>
        </article>

        <div
          v-if="canLoadMore"
          class="admin-profile-logs__load-more">
          <button
            type="button"
            class="admin-profile-logs__load-more-button"
            @click="visibleCount += 15">
            {{ resolveText("admin.profile.actions.loadMore", "Загрузить еще") }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  type LogSection = "all" | "actions" | "chats";
  type RawLogRow = Record<string, any>;

  type DetailItem = {
    label: string;
    value: string;
  };

  type TimelineRow = {
    key: string;
    kind: "action" | "chat";
    icon: string;
    badge: string;
    badgeClass: string;
    title: string;
    description: string;
    createdAt: string | null;
    timeLabel: string;
    relativeTimeLabel: string;
    primaryFacts: DetailItem[];
    technicalDetails: DetailItem[];
    link: { label: string; to: string } | null;
  };

  const props = withDefaults(
    defineProps<{
      profileData?: Record<string, any> | null;
      isLoading?: boolean;
      profileScope?: "self" | "admin";
    }>(),
    {
      profileData: null,
      isLoading: false,
      profileScope: "self",
    }
  );

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();
  const localePath = useLocalePath();

  const activity = ref<any>(null);
  const isLoading = ref(false);
  const activeSection = ref<LogSection>("all");
  const visibleCount = ref(15);

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const actionRows = computed<RawLogRow[]>(() =>
    Array.isArray(activity.value?.actions) ? activity.value.actions : []
  );
  const chatRows = computed<RawLogRow[]>(() =>
    Array.isArray(activity.value?.chat_connections) ? activity.value.chat_connections : []
  );
  const normalizedActionRows = computed<TimelineRow[]>(() => actionRows.value.map(normalizeActionRow));
  const normalizedChatRows = computed<TimelineRow[]>(() => chatRows.value.map(normalizeChatRow));
  const allRows = computed<TimelineRow[]>(() =>
    [...normalizedActionRows.value, ...normalizedChatRows.value].sort((left, right) => {
      return toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    })
  );

  const currentRows = computed<TimelineRow[]>(() => {
    if (activeSection.value === "actions") return normalizedActionRows.value;
    if (activeSection.value === "chats") return normalizedChatRows.value;

    return allRows.value;
  });

  const visibleRows = computed(() => currentRows.value.slice(0, visibleCount.value));
  const canLoadMore = computed(() => visibleRows.value.length < currentRows.value.length);

  const latestEvent = computed(() => allRows.value[0] ?? null);

  const summaryCards = computed(() => [
    {
      id: "actions",
      label: resolveText("admin.profile.logs.summary.actions", "Действия администратора"),
      value: String(actionRows.value.length),
      hint: resolveText(
        "admin.profile.logs.summary.actionsHint",
        "Изменения профиля, безопасности и рабочие действия в админке."
      ),
    },
    {
      id: "chat-connections",
      label: resolveText("admin.profile.logs.summary.chatConnections", "Подключения к чатам"),
      value: String(chatRows.value.length),
      hint: resolveText(
        "admin.profile.logs.summary.chatConnectionsHint",
        "Когда администратор входил в чат поддержки или выходил из него."
      ),
    },
    {
      id: "latest",
      label: resolveText("admin.profile.logs.summary.latest", "Последнее событие"),
      value: latestEvent.value?.relativeTimeLabel || "—",
      hint: latestEvent.value?.title || resolveText("admin.profile.logs.empty.all", "Событий пока нет."),
    },
  ]);

  const sectionTabs = computed(() => [
    {
      id: "all" as LogSection,
      label: resolveText("admin.profile.logs.tabs.all", "Все события"),
      count: allRows.value.length,
    },
    {
      id: "actions" as LogSection,
      label: resolveText("admin.profile.logs.tabs.actions", "Действия"),
      count: actionRows.value.length,
    },
    {
      id: "chats" as LogSection,
      label: resolveText("admin.profile.logs.tabs.chats", "Подключения к чатам"),
      count: chatRows.value.length,
    },
  ]);

  const currentSectionTitle = computed(() => {
    if (activeSection.value === "actions") {
      return resolveText("admin.profile.activity.sections.actions", "Действия администратора");
    }

    if (activeSection.value === "chats") {
      return resolveText("admin.profile.activity.sections.chatConnections", "Подключения к чатам");
    }

    return resolveText("admin.profile.logs.sections.timeline", "Общая история");
  });

  const currentSectionDescription = computed(() => {
    if (activeSection.value === "actions") {
      return resolveText(
        "admin.profile.activity.descriptions.actions",
        "Показываем понятное действие, а метод, URL, IP и route можно раскрыть отдельно."
      );
    }

    if (activeSection.value === "chats") {
      return resolveText(
        "admin.profile.activity.descriptions.chatConnections",
        "События входа и выхода из чатов поддержки со ссылкой на сам чат."
      );
    }

    return resolveText(
      "admin.profile.logs.descriptions.timeline",
      "Единая хронология действий администратора и подключений к чатам."
    );
  });

  const currentEmptyText = computed(() => {
    if (activeSection.value === "actions") {
      return resolveText("admin.profile.activity.empty.actions", "Действий пока нет.");
    }

    if (activeSection.value === "chats") {
      return resolveText("admin.profile.activity.empty.chatConnections", "Подключений к чатам пока нет.");
    }

    return resolveText("admin.profile.logs.empty.all", "Событий пока нет.");
  });

  const loadActivity = async () => {
    const adminId = String(props.profileData?.id ?? "").trim();
    if (!adminId) {
      activity.value = null;
      return;
    }

    isLoading.value = true;

    try {
      const response =
        props.profileScope === "self"
          ? await appCore.adminModules.profile.getActivity({ limit: 100 })
          : await appCore.admins.getActivity(adminId, { limit: 100 });

      activity.value = response?.data?.data ?? null;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.activity.errors.load", "Не удалось загрузить активность.")
      );
    } finally {
      isLoading.value = false;
    }
  };

  function normalizeActionRow(row: RawLogRow): TimelineRow {
    const method = normalizeText(row.method);
    const path = normalizeText(row.path);
    const action = normalizeText(row.action);
    const title = humanizeActionTitle(row);
    const description = normalizeText(row.description) || humanizeActionDescription(row);

    return {
      key: normalizeText(row.id) || `action-${title}-${normalizeText(row.created_at)}`,
      kind: "action",
      icon: resolveActionIcon(method, action),
      badge: resolveActionBadge(row),
      badgeClass: "is-action",
      title,
      description,
      createdAt: normalizeText(row.created_at) || null,
      timeLabel: formatDateTime(row.created_at),
      relativeTimeLabel: formatRelativeDateTime(row.created_at),
      primaryFacts: buildActionFacts(row),
      technicalDetails: buildTechnicalDetails(row),
      link: resolveActionLink(row),
    };
  }

  function normalizeChatRow(row: RawLogRow): TimelineRow {
    const ticketId = resolveTicketId(row);
    const isConnected =
      normalizeText(row.action).includes("connected") && !normalizeText(row.action).includes("disconnected");
    const statusLabel = isConnected
      ? resolveText("admin.profile.logs.chat.connected", "Подключился к чату")
      : resolveText("admin.profile.logs.chat.disconnected", "Покинул чат");
    const ticketSubject = normalizeText(row.meta?.ticket_subject);
    const ticketLabel = ticketId
      ? `#${ticketId}`
      : resolveText("admin.profile.logs.labels.unknownTicket", "без номера");

    return {
      key: normalizeText(row.id) || `chat-${ticketId}-${normalizeText(row.created_at)}`,
      kind: "chat",
      icon: isConnected ? "pi pi-sign-in" : "pi pi-sign-out",
      badge: statusLabel,
      badgeClass: isConnected ? "is-chat-connected" : "is-chat-disconnected",
      title: `${statusLabel} ${ticketLabel}`,
      description:
        ticketSubject ||
        normalizeText(row.description) ||
        resolveText("admin.profile.logs.chat.description", "Событие присутствия администратора в чате поддержки."),
      createdAt: normalizeText(row.created_at) || null,
      timeLabel: formatDateTime(row.created_at),
      relativeTimeLabel: formatRelativeDateTime(row.created_at),
      primaryFacts: buildChatFacts(row, ticketId),
      technicalDetails: buildTechnicalDetails(row),
      link: ticketId
        ? {
            label: resolveText("admin.profile.logs.links.openChat", "Открыть чат"),
            to: localePath(`/support/${ticketId}`),
          }
        : null,
    };
  }

  function humanizeActionTitle(row: RawLogRow): string {
    const action = normalizeText(row.action);
    const title = normalizeText(row.title);
    const method = normalizeText(row.method).toUpperCase();
    const path = normalizeText(row.path);

    const mapped = actionTitleMap[action];
    if (mapped) return mapped;

    if (path.includes("/withdrawal-requests/") && path.endsWith("/status")) {
      return resolveText("admin.profile.logs.actions.withdrawalStatus", "Изменил статус заявки на вывод");
    }

    if (path.includes("/verification-requests/")) {
      return resolveText("admin.profile.logs.actions.verificationRequest", "Обновил запрос на верификацию");
    }

    if (path.includes("/impersonation-link")) {
      return resolveText("admin.profile.logs.actions.impersonationLink", "Создал ссылку входа под клиентом");
    }

    if (path.includes("/profile/password")) {
      return resolveText("admin.profile.logs.actions.password", "Изменил настройки пароля");
    }

    if (path.includes("/profile")) {
      return resolveText("admin.profile.logs.actions.profile", "Обновил профиль администратора");
    }

    return (
      title ||
      [method, path].filter(Boolean).join(" ") ||
      resolveText("admin.profile.logs.actions.generic", "Действие администратора")
    );
  }

  function humanizeActionDescription(row: RawLogRow): string {
    const method = normalizeText(row.method).toUpperCase();
    const path = normalizeText(row.path);

    if (!method && !path) {
      return resolveText("admin.profile.logs.actions.descriptionGeneric", "Действие выполнено в админ-панели.");
    }

    return resolveText(
      "admin.profile.logs.actions.descriptionWithEndpoint",
      "Выполнено действие в админ-панели. Технический endpoint скрыт ниже."
    );
  }

  function resolveActionBadge(row: RawLogRow): string {
    const type = normalizeText(row.type);
    const method = normalizeText(row.method).toUpperCase();

    if (type && type !== "admin_action") {
      return humanizeSnake(type);
    }

    return method || resolveText("admin.profile.logs.badges.action", "Действие");
  }

  function resolveActionIcon(method: string, action: string): string {
    const normalizedMethod = method.toUpperCase();

    if (action.includes("password") || action.includes("security")) return "pi pi-shield";
    if (normalizedMethod === "DELETE") return "pi pi-trash";
    if (normalizedMethod === "POST") return "pi pi-plus";
    if (normalizedMethod === "PATCH" || normalizedMethod === "PUT") return "pi pi-pencil";

    return "pi pi-bolt";
  }

  function buildActionFacts(row: RawLogRow): DetailItem[] {
    return [
      createDetail(resolveText("admin.profile.logs.labels.route", "Раздел"), humanizeRoute(row)),
      createDetail(resolveText("admin.profile.logs.labels.ip", "IP"), normalizeText(row.ip)),
    ].filter(Boolean) as DetailItem[];
  }

  function buildChatFacts(row: RawLogRow, ticketId: string): DetailItem[] {
    return [
      createDetail(resolveText("admin.profile.logs.labels.ticket", "Тикет"), ticketId ? `#${ticketId}` : ""),
      createDetail(resolveText("admin.profile.logs.labels.subject", "Тема"), normalizeText(row.meta?.ticket_subject)),
      createDetail(resolveText("admin.profile.logs.labels.ip", "IP"), normalizeText(row.ip)),
    ].filter(Boolean) as DetailItem[];
  }

  function buildTechnicalDetails(row: RawLogRow): DetailItem[] {
    const metaDetails = Object.entries(row.meta ?? {})
      .filter(([key]) => !["ticket_id", "ticket_subject"].includes(key))
      .map(([key, value]) => createDetail(`meta.${key}`, stringifyDetailValue(value)))
      .filter(Boolean) as DetailItem[];

    return [
      createDetail("ID", normalizeText(row.id)),
      createDetail("Type", normalizeText(row.type)),
      createDetail("Action", normalizeText(row.action)),
      createDetail("Method", normalizeText(row.method)),
      createDetail("Path", normalizeText(row.path)),
      createDetail("Route", normalizeText(row.route_name)),
      createDetail("IP", normalizeText(row.ip)),
      createDetail("User agent", normalizeText(row.user_agent)),
      ...metaDetails,
    ].filter(Boolean) as DetailItem[];
  }

  function resolveActionLink(row: RawLogRow): { label: string; to: string } | null {
    const path = normalizeText(row.path);
    const verificationMatch = path.match(/\/verification-requests\/([^/?#]+)/);

    if (verificationMatch?.[1]) {
      return {
        label: resolveText("admin.profile.logs.links.openVerification", "Открыть верификацию"),
        to: localePath(`/verifications/${verificationMatch[1]}`),
      };
    }

    const ticketId = resolveTicketId(row);
    if (ticketId) {
      return {
        label: resolveText("admin.profile.logs.links.openChat", "Открыть чат"),
        to: localePath(`/support/${ticketId}`),
      };
    }

    return null;
  }

  function humanizeRoute(row: RawLogRow): string {
    const routeName = normalizeText(row.route_name);
    const path = normalizeText(row.path);

    if (path.includes("/withdrawal-requests"))
      return resolveText("admin.profile.logs.routes.withdrawals", "Заявки на вывод");
    if (path.includes("/verification-requests"))
      return resolveText("admin.profile.logs.routes.verifications", "Запросы на верификацию");
    if (path.includes("/tickets")) return resolveText("admin.profile.logs.routes.support", "Поддержка");
    if (path.includes("/clients")) return resolveText("admin.profile.logs.routes.clients", "Клиенты");
    if (path.includes("/profile")) return resolveText("admin.profile.logs.routes.profile", "Профиль администратора");

    return routeName || path || "";
  }

  function resolveTicketId(row: RawLogRow): string {
    const fromMeta = normalizeText(row.meta?.ticket_id ?? row.meta?.ticketId);
    if (fromMeta) return fromMeta;

    const pathMatch = normalizeText(row.path).match(/\/tickets\/([^/?#]+)/);
    return pathMatch?.[1] ?? "";
  }

  function createDetail(label: string, value: string): DetailItem | null {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) return null;

    return {
      label,
      value: normalizedValue,
    };
  }

  function stringifyDetailValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function normalizeText(value: unknown): string {
    return String(value ?? "").trim();
  }

  function humanizeSnake(value: string): string {
    return value
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\w/, letter => letter.toUpperCase());
  }

  function toTimestamp(value?: string | null): number {
    if (!value) return 0;

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function formatDateTime(value?: string | null): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString();
  }

  function formatRelativeDateTime(value?: string | null): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const diffMs = date.getTime() - Date.now();
    const absDiffMs = Math.abs(diffMs);
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absDiffMs < minute) return resolveText("admin.profile.logs.time.justNow", "только что");
    if (absDiffMs < hour) return formatter.format(Math.round(diffMs / minute), "minute");
    if (absDiffMs < day) return formatter.format(Math.round(diffMs / hour), "hour");

    return formatter.format(Math.round(diffMs / day), "day");
  }

  const actionTitleMap: Record<string, string> = {
    "profile.updated": resolveText("admin.profile.logs.actions.profileUpdated", "Обновил профиль администратора"),
    "password.changed": resolveText("admin.profile.logs.actions.passwordChanged", "Сменил пароль"),
    "password.regenerated": resolveText("admin.profile.logs.actions.passwordRegenerated", "Сгенерировал новый пароль"),
    "two_factor.enabled": resolveText(
      "admin.profile.logs.actions.twoFactorEnabled",
      "Включил двухфакторную аутентификацию"
    ),
    "two_factor.disabled": resolveText(
      "admin.profile.logs.actions.twoFactorDisabled",
      "Отключил двухфакторную аутентификацию"
    ),
  };

  watch(
    () => props.profileData?.id,
    async () => {
      visibleCount.value = 15;
      activeSection.value = "all";
      await loadActivity();
    },
    { immediate: true }
  );

  watch(activeSection, () => {
    visibleCount.value = 15;
  });
</script>

<style scoped lang="scss">
  .admin-profile-logs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .admin-profile-logs__topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-logs__summary-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .admin-profile-logs__summary-card,
  .admin-profile-logs__panel {
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 10%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-panel) 82%, transparent);
  }

  .admin-profile-logs__summary-card {
    min-height: 92px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px;
    border-radius: 16px;
  }

  .admin-profile-logs__summary-label,
  .admin-profile-logs__summary-hint,
  .admin-profile-logs__panel-subtitle,
  .admin-profile-logs__event-time span,
  .admin-profile-logs__fact small,
  .admin-profile-logs__details dt {
    color: var(--ui-text-secondary);
  }

  .admin-profile-logs__summary-value,
  .admin-profile-logs__panel-title,
  .admin-profile-logs__event-title,
  .admin-profile-logs__fact strong,
  .admin-profile-logs__details dd {
    color: var(--ui-text-main);
  }

  .admin-profile-logs__summary-hint {
    line-height: 1.4;
  }

  .admin-profile-logs__tabs {
    display: inline-flex;
    align-self: flex-start;
    flex-wrap: wrap;
    gap: 6px;
    padding: 5px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 10%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
  }

  .admin-profile-logs__tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 7px 10px;
    border-radius: 10px;
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 760;
    transition:
      color 0.18s ease,
      background-color 0.18s ease;
  }

  .admin-profile-logs__tab strong {
    min-width: 24px;
    padding: 2px 7px;
    border-radius: 999px;
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    text-align: center;
    font-size: 12px;
  }

  .admin-profile-logs__tab:hover,
  .admin-profile-logs__tab.is-active {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
  }

  .admin-profile-logs__panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 18px;
  }

  .admin-profile-logs__panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-logs__empty-state {
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    border: 1px dashed color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-card) 70%, transparent);
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .admin-profile-logs__timeline {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .admin-profile-logs__event {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 10px;
  }

  .admin-profile-logs__marker {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
    font-size: 13px;
  }

  .admin-profile-logs__event--chat .admin-profile-logs__marker {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 12%, transparent);
    border-color: color-mix(in srgb, var(--color-success) 18%, transparent);
  }

  .admin-profile-logs__event-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 13px 14px;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 8%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-card) 64%, transparent);
  }

  .admin-profile-logs__event-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-logs__event-title-wrap {
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .admin-profile-logs__event-title {
    margin: 0;
    font-size: 15px;
    font-weight: 850;
    line-height: 1.28;
    overflow-wrap: anywhere;
  }

  .admin-profile-logs__event-badge {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 11px;
    font-weight: 820;
    line-height: 1.2;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  }

  .admin-profile-logs__event-badge.is-chat-connected {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-success) 18%, transparent);
  }

  .admin-profile-logs__event-badge.is-chat-disconnected {
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-text-secondary) 10%, transparent);
    border-color: color-mix(in srgb, var(--ui-text-secondary) 18%, transparent);
  }

  .admin-profile-logs__event-time {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    text-align: right;
    font-size: 12px;
    white-space: nowrap;
  }

  .admin-profile-logs__event-description {
    margin: 0;
    color: var(--ui-text-main);
    line-height: 1.5;
  }

  .admin-profile-logs__facts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .admin-profile-logs__fact {
    min-height: 38px;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 1px;
    padding: 6px 10px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--ui-background-panel) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 8%, var(--color-stroke-ui-light));
    font-size: 12px;
  }

  .admin-profile-logs__open-link {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 11px;
    border-radius: 12px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    font-size: 12px;
    font-weight: 820;
    text-decoration: none;
  }

  .admin-profile-logs__open-link:hover {
    background: color-mix(in srgb, var(--ui-primary-main) 15%, transparent);
  }

  .admin-profile-logs__details {
    border-radius: 12px;
    background: color-mix(in srgb, var(--ui-background-panel) 70%, transparent);
  }

  .admin-profile-logs__details summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 11px;
    color: var(--ui-text-secondary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 780;
    list-style: none;
  }

  .admin-profile-logs__details summary::-webkit-details-marker {
    display: none;
  }

  .admin-profile-logs__details[open] summary i {
    transform: rotate(180deg);
  }

  .admin-profile-logs__details summary i {
    transition: transform 0.18s ease;
  }

  .admin-profile-logs__details-grid {
    display: grid;
    grid-template-columns: minmax(120px, 0.2fr) minmax(0, 1fr);
    gap: 8px 12px;
    margin: 0;
    padding: 0 11px 11px;
    font-size: 12px;
  }

  .admin-profile-logs__details dt {
    font-weight: 760;
  }

  .admin-profile-logs__details dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .admin-profile-logs__load-more {
    display: flex;
    justify-content: center;
    padding-top: 4px;
  }

  .admin-profile-logs__load-more-button {
    min-height: 36px;
    padding: 8px 13px;
    border-radius: 12px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 9%, transparent);
    font-size: 0.875rem;
    font-weight: 800;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease;
  }

  .admin-profile-logs__load-more-button:hover {
    opacity: 0.88;
    background: color-mix(in srgb, var(--ui-primary-main) 13%, transparent);
  }

  @media (max-width: 1120px) {
    .admin-profile-logs__topbar {
      flex-direction: column;
    }

    .admin-profile-logs__summary-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .admin-profile-logs__panel,
    .admin-profile-logs__event-card {
      padding: 12px;
    }

    .admin-profile-logs__event {
      grid-template-columns: 1fr;
    }

    .admin-profile-logs__marker {
      display: none;
    }

    .admin-profile-logs__event-head {
      flex-direction: column;
    }

    .admin-profile-logs__event-time {
      align-items: flex-start;
      text-align: left;
      white-space: normal;
    }

    .admin-profile-logs__details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
