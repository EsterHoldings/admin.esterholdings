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

      <PrimeButton
        icon="pi pi-refresh"
        rounded
        :loading="isLoading"
        :aria-label="resolveText('admin.common.refresh', 'Refresh')"
        @click="loadActivityLog" />
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
    </div>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
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
    technical: Record<string, unknown>;
  };

  const appCore = useAppCore();
  const { t, te, locale } = useI18n({ useScope: "global" });
  const { formatLocalDateTime } = useLocalDateTime();

  const rows = ref<ActivityLogRow[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const openDetails = ref<Set<string>>(new Set());

  const resolveText = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
    te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

  const loadActivityLog = async (): Promise<void> => {
    if (!props.clientId) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.adminModules.clients.getActivityLog(props.clientId, { limit: 150 });
      const payload = response?.data?.data;
      rows.value = Array.isArray(payload) ? payload.map(normalizeRow) : [];
    } catch (error: any) {
      rows.value = [];
      errorMessage.value =
        error?.response?.data?.message ||
        resolveText("admin.clients.activityLog.errors.load", "Failed to load action log.");
    } finally {
      isLoading.value = false;
    }
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
    technical: raw?.technical && typeof raw.technical === "object" ? raw.technical : {},
  });

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

    if (actorName && actorType) {
      return `${actorType}: ${actorName}`;
    }

    return actorName || actorType || resolveText("admin.clients.activityLog.actorUnknown", "Actor is not specified");
  };

  const groupLabel = (group: string): string =>
    resolveText(`admin.clients.activityLog.groups.${group}`, group || "log");

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

  @media (max-width: 640px) {
    .client-action-log__toolbar,
    .client-action-log__top {
      flex-direction: column;
    }

    .client-action-log__top > span {
      white-space: normal;
    }
  }
</style>
