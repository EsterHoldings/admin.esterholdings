<template>
  <section class="client-action-log">
    <div class="client-action-log__toolbar">
      <div>
        <h3>{{ resolveText("admin.clients.activityLog.title", "Action log") }}</h3>
        <p>
          {{
            resolveText(
              "admin.clients.activityLog.subtitle",
              "Detailed client activity from cabinet, verification, auth and admin actions."
            )
          }}
        </p>
      </div>

      <div class="client-action-log__toolbar-actions">
        <span
          v-if="total > 0"
          class="client-action-log__total">
          {{ resolveText("admin.clients.activityLog.total", "Total") }}: {{ total }}
        </span>
        <PrimeButton
          icon="pi pi-refresh"
          rounded
          :loading="isLoading"
          :aria-label="resolveText('admin.common.refresh', 'Refresh')"
          @click="loadActivityLog" />
      </div>
    </div>

    <div
      v-if="isLoading && rows.length === 0"
      class="client-action-log__state">
      <UiIconSpinnerDefault />
    </div>

    <div
      v-else-if="errorMessage"
      class="client-action-log__state client-action-log__state--error">
      {{ errorMessage }}
    </div>

    <div
      v-else-if="rows.length === 0"
      class="client-action-log__state">
      {{ resolveText("admin.clients.activityLog.empty", "No actions logged yet.") }}
    </div>

    <div
      v-else
      class="client-action-log__list">
      <article
        v-for="row in rows"
        :key="row.id"
        class="client-action-log__row">
        <div class="client-action-log__icon">
          <i
            :class="eventIcon(row)"
            aria-hidden="true" />
        </div>

        <div class="client-action-log__content">
          <div class="client-action-log__top">
            <div>
              <h4>{{ eventTitle(row) }}</h4>
              <p>{{ eventMeta(row) }}</p>
            </div>
            <span>{{ formatLocalDateTime(row.created_at, locale, "-") }}</span>
          </div>

          <p
            v-if="eventSummary(row)"
            class="client-action-log__summary">
            {{ eventSummary(row) }}
          </p>

          <div
            v-if="contextItems(row).length > 0"
            class="client-action-log__context">
            <div
              v-for="item in contextItems(row)"
              :key="`${row.id}-${item.key}-${item.value}`"
              class="client-action-log__context-item">
              <span>{{ contextLabel(item.key) }}</span>
              <strong>{{ formatContextValue(item) }}</strong>
            </div>
          </div>

          <div class="client-action-log__badges">
            <span>{{ groupLabel(row.group) }}</span>
            <span>{{ row.key }}</span>
          </div>

          <PrimeButton
            class="client-action-log__details-button"
            type="button"
            text
            size="small"
            :icon="isDetailsOpen(row.id) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            :label="resolveText('admin.clients.activityLog.details', 'Detailed information')"
            @click="toggleDetails(row.id)" />

          <pre
            v-if="isDetailsOpen(row.id)"
            class="client-action-log__technical"
            >{{ formatTechnical(row.technical) }}</pre
          >
        </div>
      </article>

      <div
        v-if="hasMore"
        class="client-action-log__load-more">
        <PrimeButton
          type="button"
          text
          :loading="isLoadingMore"
          :label="resolveText('admin.common.loadMore', 'Load more')"
          @click="loadMore" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import useAppCore from "~/composables/useAppCore";
  import useLocalDateTime from "~/composables/useLocalDateTime";

  const props = defineProps<{
    clientId: string;
    userData?: Record<string, any>;
  }>();

  type ActivityLogRow = {
    id: string;
    group: string;
    key: string;
    message: string;
    title: string;
    title_key: string;
    title_params: Record<string, string>;
    created_at: string | null;
    actor?: {
      id?: string;
      type?: string;
      name?: string;
      email?: string;
      nickname?: string;
    };
    context: ActivityContextItem[];
    technical: Record<string, unknown>;
  };

  type ActivityContextItem = {
    key: string;
    value: string;
  };

  const PER_PAGE = 10;

  const appCore = useAppCore();
  const { t, te, locale } = useI18n({ useScope: "global" });
  const { formatLocalDateTime } = useLocalDateTime();

  const rows = ref<ActivityLogRow[]>([]);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const errorMessage = ref("");
  const openDetails = ref<Set<string>>(new Set());
  const page = ref(1);
  const lastPage = ref(1);
  const total = ref(0);

  const hasMore = computed(() => page.value < lastPage.value);

  const resolveText = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
    te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

  const loadActivityLog = async (): Promise<void> => {
    await loadPage(1);
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
      const response = await appCore.adminModules.clients.getActivityLog(props.clientId, {
        page: targetPage,
        perPage: PER_PAGE,
      });
      const payload = response?.data?.data;
      const payloadRows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      if (Array.isArray(payload)) {
        page.value = 1;
        lastPage.value = 1;
        total.value = payloadRows.length;
      } else {
        page.value = Number(payload?.current_page ?? targetPage);
        lastPage.value = Number(payload?.last_page ?? targetPage);
        total.value = Number(payload?.total ?? payloadRows.length);
      }

      rows.value = append ? [...rows.value, ...payloadRows.map(normalizeRow)] : payloadRows.map(normalizeRow);
    } catch (error: any) {
      if (!append) {
        rows.value = [];
        total.value = 0;
      }
      errorMessage.value =
        error?.response?.data?.message ||
        resolveText("admin.clients.activityLog.errors.load", "Failed to load action log.");
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  };

  const loadMore = async (): Promise<void> => {
    if (!hasMore.value || isLoadingMore.value) {
      return;
    }

    await loadPage(page.value + 1, true);
  };

  const normalizeRow = (raw: any): ActivityLogRow => ({
    id: String(raw?.id ?? ""),
    group: String(raw?.group ?? ""),
    key: String(raw?.key ?? ""),
    message: String(raw?.message ?? ""),
    title: String(raw?.title ?? ""),
    title_key: String(raw?.title_key ?? ""),
    title_params: raw?.title_params && typeof raw.title_params === "object" ? raw.title_params : {},
    created_at: raw?.created_at ? String(raw.created_at) : null,
    actor: raw?.actor && typeof raw.actor === "object" ? raw.actor : {},
    context: Array.isArray(raw?.context)
      ? raw.context
          .map(normalizeContextItem)
          .filter((item: ActivityContextItem | null): item is ActivityContextItem => item !== null)
      : [],
    technical: raw?.technical && typeof raw.technical === "object" ? raw.technical : {},
  });

  const normalizeContextItem = (raw: any): ActivityContextItem | null => {
    const key = String(raw?.key ?? "").trim();
    const value = String(raw?.value ?? "").trim();

    if (key === "" || value === "") {
      return null;
    }

    return { key, value };
  };

  const eventTitle = (row: ActivityLogRow): string => {
    if (row.title_key && te(row.title_key)) {
      return String(t(row.title_key, eventTitleParams(row)));
    }

    return row.title || row.message || row.key;
  };

  const eventTitleParams = (row: ActivityLogRow): Record<string, string> => {
    const params = { ...row.title_params };
    const mappings: Array<[string, string]> = [
      ["page", "pages"],
      ["label", "labels"],
      ["form", "forms"],
      ["field", "fields"],
      ["modal", "modals"],
      ["tab", "tabs"],
    ];

    mappings.forEach(([paramName, groupName]) => {
      const valueKey = String(params[`${paramName}_key`] ?? "").trim();
      const translationKey = `admin.clients.activityLog.${groupName}.${valueKey}`;

      if (valueKey && te(translationKey)) {
        params[paramName] = String(t(translationKey));
      }
    });

    return params;
  };

  const eventMeta = (row: ActivityLogRow): string => {
    const actorName = String(row.actor?.name || row.actor?.email || "").trim();
    const actorType = String(row.actor?.type || "").trim();
    const actorTypeLabel = actorType ? resolveText(`admin.clients.activityLog.actorTypes.${actorType}`, actorType) : "";

    if (actorName && actorTypeLabel) {
      return `${actorTypeLabel}: ${actorName}`;
    }

    return (
      actorName || actorTypeLabel || resolveText("admin.clients.activityLog.actorUnknown", "Actor is not specified")
    );
  };

  const groupLabel = (group: string): string =>
    resolveText(`admin.clients.activityLog.groups.${group}`, group || "log");

  const contextItems = (row: ActivityLogRow): ActivityContextItem[] => {
    if (row.context.length > 0) {
      return row.context;
    }

    const data = row.technical?.data && typeof row.technical.data === "object" ? row.technical.data : {};
    const params = eventTitleParams(row);
    const items: ActivityContextItem[] = [];
    const add = (key: string, value: unknown): void => {
      const normalized = String(value ?? "").trim();
      if (normalized === "" || normalized === "-") {
        return;
      }

      items.push({ key, value: normalized });
    };

    add("page", params.page);
    add("path", (data as Record<string, unknown>).normalized_path || (data as Record<string, unknown>).path);
    add("label", params.label);
    add("modal", params.modal);
    add("tab", params.tab);
    add("form", params.form);
    add("field", params.field);
    add("target", params.target);
    add("account", params.account);
    add("ip", (data as Record<string, unknown>).ip);
    add("timezone", (data as Record<string, unknown>).timezone);

    return items;
  };

  const contextValue = (row: ActivityLogRow, key: string): string =>
    contextItems(row).find(item => item.key === key)?.value ?? "";

  const eventSummary = (row: ActivityLogRow): string => {
    const page = contextValue(row, "page");
    const path = contextValue(row, "path");
    const label = contextValue(row, "label");
    const modal = contextValue(row, "modal");
    const field = contextValue(row, "field");
    const target = contextValue(row, "target");
    const place = page || path;

    if (row.key.includes("button") || row.key.includes("copy") || row.key.includes("link")) {
      return resolveText("admin.clients.activityLog.summaries.interaction", "{label} on {place}", {
        label: label || target || row.key,
        place: place || "-",
      });
    }

    if (row.key.includes("modal")) {
      return resolveText("admin.clients.activityLog.summaries.modal", "{modal} on {place}", {
        modal: modal || row.key,
        place: place || "-",
      });
    }

    if (row.key.includes("field") || row.key.includes("file")) {
      return resolveText("admin.clients.activityLog.summaries.field", "{field} on {place}", {
        field: field || row.key,
        place: place || "-",
      });
    }

    if (place) {
      return resolveText("admin.clients.activityLog.summaries.place", "Context: {place}", { place });
    }

    return "";
  };

  const contextLabel = (key: string): string =>
    resolveText(`admin.clients.activityLog.context.${key}`, key.replace(/_/g, " "));

  const formatContextValue = (item: ActivityContextItem): string => {
    if (item.key === "occurred_at" || item.key === "received_at") {
      return formatLocalDateTime(item.value, locale, item.value);
    }

    return item.value;
  };

  const eventIcon = (row: ActivityLogRow): string => {
    if (row.key.includes("login")) return "pi pi-sign-in";
    if (row.key.includes("account")) return "pi pi-wallet";
    if (row.key.includes("document")) return "pi pi-file";
    if (row.key.includes("payout")) return "pi pi-credit-card";
    if (row.key.includes("profile")) return "pi pi-user-edit";
    if (row.group === "auth") return "pi pi-lock";

    return "pi pi-history";
  };

  const isDetailsOpen = (id: string): boolean => openDetails.value.has(id);

  const toggleDetails = (id: string): void => {
    const next = new Set(openDetails.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    openDetails.value = next;
  };

  const formatTechnical = (payload: Record<string, unknown>): string => JSON.stringify(payload, null, 2);

  onMounted(() => {
    void loadActivityLog();
  });
</script>

<style scoped lang="scss">
  .client-action-log {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
  }

  .client-action-log__toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .client-action-log__toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
  }

  .client-action-log__total {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
    border-radius: 999px;
    padding: 0 10px;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-primary-main) 8%, transparent);
    font-size: 12px;
    font-weight: 760;
    white-space: nowrap;
  }

  .client-action-log__toolbar h3 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 840;
    line-height: 1.2;
  }

  .client-action-log__toolbar p {
    margin: 4px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }

  .client-action-log__state {
    display: grid;
    min-height: 180px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 18px;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-background-panel) 84%, transparent);
  }

  .client-action-log__state--error {
    color: var(--color-danger);
  }

  .client-action-log__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .client-action-log__row {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 12px;
    padding: 13px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 18px;
    background: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
  }

  .client-action-log__icon {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 14px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
  }

  .client-action-log__content {
    min-width: 0;
  }

  .client-action-log__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .client-action-log__top h4 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 14px;
    font-weight: 820;
    line-height: 1.25;
  }

  .client-action-log__top p,
  .client-action-log__top span {
    margin: 4px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.4;
  }

  .client-action-log__top > span {
    flex: 0 0 auto;
    margin: 0;
    white-space: nowrap;
  }

  .client-action-log__summary {
    margin: 8px 0 0;
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1.45;
  }

  .client-action-log__context {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  .client-action-log__context-item {
    min-width: 0;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 12%, var(--color-stroke-ui-light));
    border-radius: 12px;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
  }

  .client-action-log__context-item span {
    display: block;
    color: var(--ui-text-secondary);
    font-size: 10px;
    font-weight: 780;
    letter-spacing: 0.04em;
    line-height: 1.25;
    text-transform: uppercase;
  }

  .client-action-log__context-item strong {
    display: block;
    overflow-wrap: anywhere;
    margin-top: 4px;
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 760;
    line-height: 1.35;
  }

  .client-action-log__badges {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .client-action-log__badges span {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));
    border-radius: 999px;
    padding: 3px 8px;
    color: var(--ui-text-secondary);
    font-size: 11px;
    font-weight: 760;
  }

  .client-action-log__details-button {
    margin-top: 8px;
    padding-left: 0;
  }

  .client-action-log__technical {
    max-height: 360px;
    overflow: auto;
    margin: 8px 0 0;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 14px;
    padding: 12px;
    color: var(--ui-text-main);
    background: color-mix(in srgb, #000000 18%, var(--ui-background-card));
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .client-action-log__load-more {
    display: flex;
    justify-content: center;
    padding: 4px 0 2px;
  }

  @media (max-width: 640px) {
    .client-action-log__toolbar,
    .client-action-log__top {
      flex-direction: column;
    }

    .client-action-log__toolbar-actions {
      width: 100%;
      justify-content: space-between;
    }

    .client-action-log__top > span {
      white-space: normal;
    }
  }
</style>
