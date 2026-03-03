<template>
  <div class="flex w-full flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="clients-stats-grid">
      <div
        v-for="card in metricCards"
        :key="card.id"
        class="clients-stat-card"
        :class="card.kind">
        <template v-if="card.kind === 'is-deposits-summary'">
          <div class="clients-stat-card__label">{{ card.label }}</div>
          <div class="clients-stat-card__deposits-grid">
            <div
              v-for="segment in card.segments"
              :key="segment.id"
              class="clients-stat-card__deposits-item">
              <div class="clients-stat-card__deposits-label">{{ segment.label }}</div>
              <div
                class="clients-stat-card__deposits-value"
                :class="`size-${segment.size}`">
                {{ segment.value }}
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="clients-stat-card__label">{{ card.label }}</div>
          <div class="clients-stat-card__value">{{ card.value }}</div>
        </template>
      </div>
    </div>

    <PageStructureContent :plain="viewMode !== 'table'">
      <template #top>
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full flex-col gap-2 xl:flex-row xl:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
              <UiInput
                class="w-full"
                :placeholder="t('admin.clients.components.clients-panel-search.placeholder', 'Search clients...')"
                @input="handleInputSearch"
                :value="searchFilter">
                <template #icon-left>
                  <UiIconSearch />
                </template>
              </UiInput>

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickRefresh">
                <UiIconUpdate :spinning="isLoading || isStatsLoading" />
              </UiButtonDefault>
            </div>

            <div class="flex w-full flex-1 items-center gap-2 xl:w-auto xl:flex-none xl:justify-end">
              <UiSelect
                class="min-w-[160px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByOptions"
                :withoutNoSelect="true"
                @change="handleOrderBy" />

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="toggleOrderDirection">
                <UiIconSortBy
                  class="!h-4 !w-4"
                  :orderDirectionEnabled="true"
                  :orderDirection="orderDirection" />
              </UiButtonDefault>

              <ViewModeToggle
                class="w-full sm:w-auto"
                bordered
                :modelValue="viewMode"
                :options="viewOptions"
                @update:modelValue="handleChangeViewMode" />

              <div
                ref="filtersPopoverRef"
                class="relative">
                <UiButtonDefault
                  state="info--small"
                  class="!w-[44px]"
                  @click.stop="toggleFiltersPopover">
                  <UiIconFilters class="!h-4 !w-4" />
                </UiButtonDefault>

                <div
                  v-if="isFiltersPopoverOpen"
                  class="clients-filters-popover"
                  @click.stop>
                  <div class="clients-filters-popover__title">
                    {{ t("admin.clients.filters.title", "Filters") }}
                  </div>

                  <div class="clients-filters-popover__body">
                    <div class="clients-filters-popover__section-title">
                      {{ t("admin.clients.filters.sections.statuses", "Statuses") }}
                    </div>

                    <div class="clients-filters-popover__grid clients-filters-popover__grid--status">
                      <label class="clients-filters-popover__field">
                        <span>{{ t("admin.clients.filters.fields.online_status", "Online status") }}</span>
                        <UiSelect
                          :withoutNoSelect="false"
                          :value="draftFilters.online_status || null"
                          :data="onlineStatusOptions"
                          @change="value => setDraftFilterValue('online_status', value)" />
                      </label>

                      <label class="clients-filters-popover__field">
                        <span>{{ t("admin.clients.filters.fields.email_verified", "Email verification") }}</span>
                        <UiSelect
                          :withoutNoSelect="false"
                          :value="draftFilters.email_verified || null"
                          :data="emailVerifiedOptions"
                          @change="value => setDraftFilterValue('email_verified', value)" />
                      </label>

                      <label class="clients-filters-popover__field">
                        <span>{{ t("admin.clients.filters.fields.has_photo", "Photo") }}</span>
                        <UiSelect
                          :withoutNoSelect="false"
                          :value="draftFilters.has_photo || null"
                          :data="hasPhotoOptions"
                          @change="value => setDraftFilterValue('has_photo', value)" />
                      </label>

                      <label class="clients-filters-popover__field">
                        <span>{{ t("admin.clients.filters.fields.two_factor_enabled", "2FA") }}</span>
                        <UiSelect
                          :withoutNoSelect="false"
                          :value="draftFilters.two_factor_enabled || null"
                          :data="twoFactorOptions"
                          @change="value => setDraftFilterValue('two_factor_enabled', value)" />
                      </label>
                    </div>

                    <div class="clients-filters-popover__section-title">
                      {{ t("admin.clients.filters.sections.text", "Text fields") }}
                    </div>

                    <div class="clients-filters-popover__grid">
                      <label
                        v-for="field in filterTextFieldOptions"
                        :key="field.key"
                        class="clients-filters-popover__field">
                        <span>{{ field.label }}</span>
                        <input
                          class="clients-filters-popover__input"
                          type="text"
                          :value="draftFilters[field.key]"
                          :placeholder="field.label"
                          @input="event => handleDraftTextInput(field.key, event)" />
                      </label>
                    </div>

                    <div class="clients-filters-popover__section-title">
                      {{ t("admin.clients.filters.sections.dates", "Date ranges") }}
                    </div>

                    <div class="clients-filters-popover__grid">
                      <label
                        v-for="field in filterDateFieldOptions"
                        :key="field.key"
                        class="clients-filters-popover__field">
                        <span>{{ field.label }}</span>
                        <input
                          class="clients-filters-popover__input"
                          type="date"
                          :value="draftFilters[field.key]"
                          @input="event => handleDraftTextInput(field.key, event)" />
                      </label>
                    </div>
                  </div>

                  <div class="clients-filters-popover__actions">
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="resetDraftFilters">
                      {{ t("admin.clients.filters.reset", "Reset") }}
                    </UiButtonDefault>
                    <UiButtonDefault
                      state="info--small"
                      class="!w-full"
                      @click="applyDraftFilters">
                      {{ t("admin.clients.filters.apply", "Apply") }}
                    </UiButtonDefault>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeFilterChips.length"
            class="clients-filter-chips">
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              type="button"
              class="clients-filter-chip"
              @click="removeAppliedFilter(chip.key)">
              <span>{{ chip.label }}: {{ chip.value }}</span>
              <span class="clients-filter-chip__remove">×</span>
            </button>

            <button
              type="button"
              class="clients-filter-chip clients-filter-chip--clear"
              @click="clearAllAppliedFilters">
              {{ t("admin.clients.filters.clearAll", "Clear all") }}
            </button>
          </div>
        </div>
      </template>

      <template #content>
        <div>
          <div
            v-if="viewMode !== 'table'"
            class="relative">
            <div
              class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading">
              <UiIconSpinnerDefault />
            </div>
            <ClientsContent
              :data="clientsData"
              :viewMode="viewMode"
              @click="handleOpenClientPage" />
          </div>

          <div
            v-else
            class="relative">
            <div
              class="backdrop-blur-sm bg-[var(--ui-background)]/40 w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="isLoading && !isInitialLoading">
              <UiIconSpinnerDefault />
            </div>

            <template v-if="clientsData.length">
              <TableMain>
                <template #thead>
                  <tr>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.name") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.email") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.phone") }}
                    </th>
                    <th class="px-4 py-3 text-left font-normal">
                      {{ t("admin.accounts.components.accounts-panel.columns.created_at") }}
                    </th>
                    <th class="px-4 py-3 text-center font-normal w-[60px]">ID</th>
                  </tr>
                </template>

                <template #tbody>
                  <tr
                    v-for="client in clientsData"
                    :key="client.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)] cursor-pointer"
                    @click="handleOpenClientPage(client.id)">
                    <td class="px-4 py-3 max-w-[280px]">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="relative shrink-0">
                          <UiImageCircle
                            :twoChars="getTwoCharsByFullName(client.first_name, client.last_name)"
                            :src="client.photo_url" />
                          <span
                            class="clients-online-dot"
                            :class="client.is_online ? 'is-online' : 'is-offline'" />
                        </div>

                        <div class="min-w-0">
                          <div
                            class="font-semibold truncate"
                            :title="fullName(client)">
                            {{ fullName(client) }}
                          </div>
                          <div class="text-xs text-[var(--ui-text-secondary)]">
                            {{
                              client.is_online
                                ? t("admin.clients.online.onlineNow", "Online")
                                : t("admin.clients.online.offlineNow", "Offline")
                            }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      class="px-4 py-3 truncate max-w-[220px]"
                      :title="client.email">
                      {{ client.email || "-" }}
                    </td>
                    <td
                      class="px-4 py-3 truncate max-w-[160px]"
                      :title="client.phone">
                      {{ client.phone || "-" }}
                    </td>
                    <td class="px-4 py-3 text-xs whitespace-nowrap">
                      {{ formatDate(client.created_at) }}
                    </td>
                    <td
                      class="px-2 py-3"
                      @click.stop>
                      <div class="flex items-center justify-center">
                        <UiIconCopy
                          v-if="client.id"
                          :text="client.id" />
                        <span v-else>-</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </TableMain>
            </template>

            <div
              v-else-if="!isLoading && !isInitialLoading"
              class="h-[32vh] flex items-center justify-center text-[var(--ui-text-main)]">
              {{ t("cabinet.billing.nothingToShow") }}
            </div>
          </div>
        </div>
      </template>
    </PageStructureContent>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { debounce } from "~/utils/helper/debounce";
  import { navigateTo } from "nuxt/app";
  import { useLocalePath } from "~/.nuxt/imports";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  import TableMain from "~/components/block/tables/TableMain.vue";
  import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import ClientsContent from "~/pages/admin/clients/components/ClientsContent.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import UiIconFilters from "~/components/ui/UiIconFilters.vue";

  type ViewMode = "cards" | "table" | "full";

  interface AdminClient {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    created_at?: string;
    photo_url?: string;
    is_online?: boolean;
  }

  interface ClientsStats {
    online_clients_now: number;
    new_clients: {
      today: number;
      week: number;
      month: number;
    };
    deposits_sum: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
  }

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "adminClientsViewMode";
  const ONLINE_REFRESH_INTERVAL_MS = 15_000;
  const ONLINE_REALTIME_SYNC_DEBOUNCE_MS = 200;

  const ALL_SEARCH_FIELDS = [
    "id",
    "email",
    "first_name",
    "mid_name",
    "last_name",
    "phone",
    "birthdate",
    "country",
    "state",
    "city",
    "address",
    "postal_code",
    "provider_name",
    "provider_id",
    "email_verified_at",
    "updated_at",
    "created_at",
  ];

  type FilterKey =
    | "id"
    | "email"
    | "first_name"
    | "mid_name"
    | "last_name"
    | "phone"
    | "country"
    | "state"
    | "city"
    | "address"
    | "postal_code"
    | "provider_name"
    | "provider_id"
    | "online_status"
    | "email_verified"
    | "has_photo"
    | "two_factor_enabled"
    | "birthdate_from"
    | "birthdate_to"
    | "created_at_from"
    | "created_at_to"
    | "email_verified_at_from"
    | "email_verified_at_to"
    | "updated_at_from"
    | "updated_at_to";

  type ClientFilters = Record<FilterKey, string>;

  const createEmptyFilters = (): ClientFilters => ({
    id: "",
    email: "",
    first_name: "",
    mid_name: "",
    last_name: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    postal_code: "",
    provider_name: "",
    provider_id: "",
    online_status: "",
    email_verified: "",
    has_photo: "",
    two_factor_enabled: "",
    birthdate_from: "",
    birthdate_to: "",
    created_at_from: "",
    created_at_to: "",
    email_verified_at_from: "",
    email_verified_at_to: "",
    updated_at_from: "",
    updated_at_to: "",
  });

  const cloneFilters = (source: ClientFilters): ClientFilters => ({ ...source });

  const sanitizeFilterValue = (value: unknown): string => {
    if (typeof value === "string") {
      return value.trim();
    }

    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  };

  const { t, locale } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const { $echo } = useNuxtApp() as unknown as { $echo?: any };

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const isLoadingSearch = ref(false);
  const isStatsLoading = ref(false);

  const perPage = ref(6);
  const page = ref(1);
  const totalRows = ref(0);
  const searchFilter = ref("");

  const orderBy = ref<string>("created_at");
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const viewMode = ref<ViewMode>("table");

  const clientsData = ref<AdminClient[]>([]);
  const statsData = ref<ClientsStats>({
    online_clients_now: 0,
    new_clients: {
      today: 0,
      week: 0,
      month: 0,
    },
    deposits_sum: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
    },
  });

  const appliedFilters = ref<ClientFilters>(createEmptyFilters());
  const draftFilters = ref<ClientFilters>(createEmptyFilters());
  const isFiltersPopoverOpen = ref(false);
  const filtersPopoverRef = ref<HTMLElement | null>(null);

  let pollingTimer: ReturnType<typeof setInterval> | null = null;
  let supportGlobalChannel: any = null;
  let realtimeSyncTimer: ReturnType<typeof setTimeout> | null = null;
  let realtimeSyncInFlight = false;
  let realtimeSyncQueued = false;

  const filterTextFieldOptions = computed(() => [
    { key: "id" as FilterKey, label: "ID" },
    { key: "email" as FilterKey, label: t("admin.accounts.components.accounts-panel.columns.email") },
    {
      key: "first_name" as FilterKey,
      label: t("admin.clients.components.clients-panel.columns.first_name", "First name"),
    },
    { key: "mid_name" as FilterKey, label: t("admin.clients.filters.fields.mid_name", "Middle name") },
    {
      key: "last_name" as FilterKey,
      label: t("admin.clients.components.clients-panel.columns.last_name", "Last name"),
    },
    { key: "phone" as FilterKey, label: t("admin.accounts.components.accounts-panel.columns.phone") },
    { key: "country" as FilterKey, label: t("admin.clients.columns.country", "Country") },
    { key: "state" as FilterKey, label: t("admin.clients.columns.state", "State / Region") },
    { key: "city" as FilterKey, label: t("admin.clients.columns.city", "City") },
    { key: "address" as FilterKey, label: t("admin.clients.columns.address", "Address") },
    { key: "postal_code" as FilterKey, label: t("admin.clients.columns.postalCode", "Postal code") },
    { key: "provider_name" as FilterKey, label: t("admin.clients.filters.fields.provider_name", "Provider name") },
    { key: "provider_id" as FilterKey, label: t("admin.clients.filters.fields.provider_id", "Provider ID") },
  ]);

  const filterDateFieldOptions = computed(() => [
    { key: "birthdate_from" as FilterKey, label: t("admin.clients.filters.fields.birthdate_from", "Birthdate from") },
    { key: "birthdate_to" as FilterKey, label: t("admin.clients.filters.fields.birthdate_to", "Birthdate to") },
    { key: "created_at_from" as FilterKey, label: t("admin.clients.filters.fields.created_at_from", "Created from") },
    { key: "created_at_to" as FilterKey, label: t("admin.clients.filters.fields.created_at_to", "Created to") },
    {
      key: "email_verified_at_from" as FilterKey,
      label: t("admin.clients.filters.fields.email_verified_at_from", "Email verified from"),
    },
    {
      key: "email_verified_at_to" as FilterKey,
      label: t("admin.clients.filters.fields.email_verified_at_to", "Email verified to"),
    },
    { key: "updated_at_from" as FilterKey, label: t("admin.clients.filters.fields.updated_at_from", "Updated from") },
    { key: "updated_at_to" as FilterKey, label: t("admin.clients.filters.fields.updated_at_to", "Updated to") },
  ]);

  const onlineStatusOptions = computed(() => [
    { id: "online", value: "online", text: t("admin.clients.filters.values.online", "Online") },
    { id: "offline", value: "offline", text: t("admin.clients.filters.values.offline", "Offline") },
  ]);

  const emailVerifiedOptions = computed(() => [
    { id: "verified", value: "verified", text: t("admin.clients.filters.values.verified", "Verified") },
    { id: "unverified", value: "unverified", text: t("admin.clients.filters.values.unverified", "Unverified") },
  ]);

  const hasPhotoOptions = computed(() => [
    { id: "yes", value: "yes", text: t("admin.clients.filters.values.yes", "Yes") },
    { id: "no", value: "no", text: t("admin.clients.filters.values.no", "No") },
  ]);

  const twoFactorOptions = computed(() => [
    { id: "enabled", value: "enabled", text: t("admin.clients.filters.values.enabled", "Enabled") },
    { id: "disabled", value: "disabled", text: t("admin.clients.filters.values.disabled", "Disabled") },
  ]);

  const filterLabelMap = computed<Record<FilterKey, string>>(() => ({
    id: "ID",
    email: t("admin.accounts.components.accounts-panel.columns.email"),
    first_name: t("admin.clients.components.clients-panel.columns.first_name", "First name"),
    mid_name: t("admin.clients.filters.fields.mid_name", "Middle name"),
    last_name: t("admin.clients.components.clients-panel.columns.last_name", "Last name"),
    phone: t("admin.accounts.components.accounts-panel.columns.phone"),
    country: t("admin.clients.columns.country", "Country"),
    state: t("admin.clients.columns.state", "State / Region"),
    city: t("admin.clients.columns.city", "City"),
    address: t("admin.clients.columns.address", "Address"),
    postal_code: t("admin.clients.columns.postalCode", "Postal code"),
    provider_name: t("admin.clients.filters.fields.provider_name", "Provider name"),
    provider_id: t("admin.clients.filters.fields.provider_id", "Provider ID"),
    online_status: t("admin.clients.filters.fields.online_status", "Online status"),
    email_verified: t("admin.clients.filters.fields.email_verified", "Email verification"),
    has_photo: t("admin.clients.filters.fields.has_photo", "Photo"),
    two_factor_enabled: t("admin.clients.filters.fields.two_factor_enabled", "2FA"),
    birthdate_from: t("admin.clients.filters.fields.birthdate_from", "Birthdate from"),
    birthdate_to: t("admin.clients.filters.fields.birthdate_to", "Birthdate to"),
    created_at_from: t("admin.clients.filters.fields.created_at_from", "Created from"),
    created_at_to: t("admin.clients.filters.fields.created_at_to", "Created to"),
    email_verified_at_from: t("admin.clients.filters.fields.email_verified_at_from", "Email verified from"),
    email_verified_at_to: t("admin.clients.filters.fields.email_verified_at_to", "Email verified to"),
    updated_at_from: t("admin.clients.filters.fields.updated_at_from", "Updated from"),
    updated_at_to: t("admin.clients.filters.fields.updated_at_to", "Updated to"),
  }));

  const filterValueLabelMap = computed<Record<string, string>>(() => ({
    online: t("admin.clients.filters.values.online", "Online"),
    offline: t("admin.clients.filters.values.offline", "Offline"),
    verified: t("admin.clients.filters.values.verified", "Verified"),
    unverified: t("admin.clients.filters.values.unverified", "Unverified"),
    yes: t("admin.clients.filters.values.yes", "Yes"),
    no: t("admin.clients.filters.values.no", "No"),
    enabled: t("admin.clients.filters.values.enabled", "Enabled"),
    disabled: t("admin.clients.filters.values.disabled", "Disabled"),
  }));

  const activeFilterChips = computed(() => {
    return (Object.entries(appliedFilters.value) as Array<[FilterKey, string]>)
      .filter(([, value]) => sanitizeFilterValue(value) !== "")
      .map(([key, value]) => ({
        key,
        label: filterLabelMap.value[key] ?? key,
        value: filterValueLabelMap.value[value] ?? value,
      }));
  });

  const sortByOptions = computed(() => [
    { id: "created_at", value: "created_at", text: t("admin.accounts.components.accounts-panel.columns.created_at") },
    { id: "first_name", value: "first_name", text: t("admin.accounts.components.accounts-panel.columns.name") },
    { id: "email", value: "email", text: t("admin.accounts.components.accounts-panel.columns.email") },
  ]);

  const viewOptions = computed(() => [
    {
      value: "table" as const,
      label: t("cabinet.billing.view.list") || "List",
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
              h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
              h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
              h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
              h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
              h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
              h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
            ]
          );
        },
      },
    },
    {
      value: "cards" as const,
      label: t("cabinet.billing.view.cards") || "Cards",
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
              h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
            ]
          );
        },
      },
    },
    {
      value: "full" as const,
      label: t("cabinet.billing.view.full") || "Full width",
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
              h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
            ]
          );
        },
      },
    },
  ]);

  const metricCards = computed(() => [
    {
      id: "online_now",
      kind: statsData.value.online_clients_now > 0 ? "is-online-active" : "is-neutral",
      label: resolveText("admin.clients.stats.onlineNow", "Online now"),
      value: formatCount(statsData.value.online_clients_now),
    },
    {
      id: "new_today",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newToday", "New clients today"),
      value: formatCount(statsData.value.new_clients.today),
    },
    {
      id: "new_week",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newWeek", "New clients this week"),
      value: formatCount(statsData.value.new_clients.week),
    },
    {
      id: "new_month",
      kind: "is-neutral",
      label: resolveText("admin.clients.stats.newMonth", "New clients this month"),
      value: formatCount(statsData.value.new_clients.month),
    },
    {
      id: "deposits_summary",
      kind: "is-deposits-summary",
      label: resolveText("admin.clients.stats.depositsSummary", "Deposits summary"),
      segments: [
        {
          id: "today",
          label: resolveText("admin.clients.stats.depositsToday", "Today"),
          value: formatMoney(statsData.value.deposits_sum.today),
          size: "xl",
        },
        {
          id: "week",
          label: resolveText("admin.clients.stats.depositsWeek", "Week"),
          value: formatMoney(statsData.value.deposits_sum.week),
          size: "lg",
        },
        {
          id: "month",
          label: resolveText("admin.clients.stats.depositsMonth", "Month"),
          value: formatMoney(statsData.value.deposits_sum.month),
          size: "md",
        },
        {
          id: "year",
          label: resolveText("admin.clients.stats.depositsYear", "Year"),
          value: formatMoney(statsData.value.deposits_sum.year),
          size: "sm",
        },
      ],
    },
  ]);

  const initViewMode = () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as ViewMode;
    }
  };

  const getFiltersPayload = (filters: ClientFilters): Partial<ClientFilters> => {
    const payload: Partial<ClientFilters> = {};

    for (const [key, value] of Object.entries(filters) as Array<[FilterKey, string]>) {
      const normalizedValue = sanitizeFilterValue(value);
      if (normalizedValue === "") {
        continue;
      }

      payload[key] = normalizedValue;
    }

    return payload;
  };

  const loadData = async ({ resetPage = false, silent = false }: { resetPage?: boolean; silent?: boolean } = {}) => {
    if (resetPage) {
      page.value = 1;
    }

    if (!silent) {
      isLoading.value = true;
    }

    try {
      const filtersPayload = getFiltersPayload(appliedFilters.value);
      const flatFilters = Object.fromEntries(
        Object.entries(filtersPayload).map(([key, value]) => [`filters[${key}]`, value])
      );

      const params = {
        page: page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        searchFields: ALL_SEARCH_FIELDS.join(","),
        orderBy: orderBy.value,
        orderDirection: orderDirection.value,
        filters: filtersPayload,
        ...flatFilters,
      };

      const response = await appCore.adminModules.clients.get(params);
      const payload = response?.data?.data ?? {};

      totalRows.value = Number(payload?.total ?? 0);
      clientsData.value = Array.isArray(payload?.data) ? payload.data : [];
    } catch {
      if (!silent) {
        totalRows.value = 0;
        clientsData.value = [];
      }
    } finally {
      if (!silent) {
        isLoading.value = false;
      }
    }
  };

  const loadStats = async (silent = false) => {
    if (!silent) {
      isStatsLoading.value = true;
    }

    try {
      const response = await appCore.adminModules.clients.getStats();
      const payload = response?.data?.data ?? {};

      statsData.value = {
        online_clients_now: Number(payload?.online_clients_now ?? 0),
        new_clients: {
          today: Number(payload?.new_clients?.today ?? 0),
          week: Number(payload?.new_clients?.week ?? 0),
          month: Number(payload?.new_clients?.month ?? 0),
        },
        deposits_sum: {
          today: Number(payload?.deposits_sum?.today ?? 0),
          week: Number(payload?.deposits_sum?.week ?? 0),
          month: Number(payload?.deposits_sum?.month ?? 0),
          year: Number(payload?.deposits_sum?.year ?? 0),
        },
      };
    } catch {
      // keep previous stats silently
    } finally {
      if (!silent) {
        isStatsLoading.value = false;
      }
    }
  };

  const loadAll = async () => {
    await Promise.all([loadData(), loadStats()]);
  };

  const handleOpenClientPage = (id?: string) => {
    if (!id) return;

    navigateTo(localePath(`/clients/${id}`));
  };

  const handleChangePerPage = async (value: number) => {
    perPage.value = value;
    await loadData({ resetPage: true });
  };

  const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
  };

  const handleInputSearch = debounce(async (value: string) => {
    try {
      isLoadingSearch.value = true;
      searchFilter.value = value;
      await loadData({ resetPage: true });
    } finally {
      isLoadingSearch.value = false;
    }
  }, 300);

  const handleOrderBy = async (value: string) => {
    orderBy.value = value;
    await loadData();
  };

  const toggleOrderDirection = async () => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    await loadData();
  };

  const handleChangeViewMode = (value: string) => {
    if (value === "table" || value === "cards" || value === "full") {
      viewMode.value = value;
    }
  };

  const handleClickRefresh = async () => {
    await loadAll();
  };

  const setDraftFilterValue = (key: FilterKey, value: unknown) => {
    draftFilters.value = {
      ...draftFilters.value,
      [key]: sanitizeFilterValue(value),
    };
  };

  const handleDraftTextInput = (key: FilterKey, event: Event) => {
    const target = event.target as HTMLInputElement | null;
    setDraftFilterValue(key, target?.value ?? "");
  };

  const toggleFiltersPopover = () => {
    if (!isFiltersPopoverOpen.value) {
      draftFilters.value = cloneFilters(appliedFilters.value);
    }

    isFiltersPopoverOpen.value = !isFiltersPopoverOpen.value;
  };

  const resetDraftFilters = () => {
    draftFilters.value = createEmptyFilters();
  };

  const applyDraftFilters = async () => {
    appliedFilters.value = cloneFilters(draftFilters.value);
    isFiltersPopoverOpen.value = false;
    await loadData({ resetPage: true });
  };

  const removeAppliedFilter = async (key: FilterKey) => {
    appliedFilters.value = {
      ...appliedFilters.value,
      [key]: "",
    };

    draftFilters.value = {
      ...draftFilters.value,
      [key]: "",
    };

    await loadData({ resetPage: true });
  };

  const clearAllAppliedFilters = async () => {
    appliedFilters.value = createEmptyFilters();
    draftFilters.value = createEmptyFilters();
    await loadData({ resetPage: true });
  };

  const handleClickOutsideFilters = (event: MouseEvent) => {
    if (!isFiltersPopoverOpen.value) return;

    const target = event.target as Node | null;
    if (!target) return;

    if (filtersPopoverRef.value && !filtersPopoverRef.value.contains(target)) {
      isFiltersPopoverOpen.value = false;
    }
  };

  const startPolling = () => {
    if (pollingTimer) return;

    pollingTimer = setInterval(() => {
      loadData({ silent: true }).catch(() => {});
      loadStats(true).catch(() => {});
    }, ONLINE_REFRESH_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (!pollingTimer) return;

    clearInterval(pollingTimer);
    pollingTimer = null;
  };

  const syncOnlineState = async () => {
    if (realtimeSyncInFlight) {
      realtimeSyncQueued = true;
      return;
    }

    realtimeSyncInFlight = true;

    try {
      do {
        realtimeSyncQueued = false;
        await Promise.all([loadData({ silent: true }), loadStats(true)]);
      } while (realtimeSyncQueued);
    } finally {
      realtimeSyncInFlight = false;
    }
  };

  const scheduleOnlineSync = () => {
    if (realtimeSyncTimer) return;

    realtimeSyncTimer = setTimeout(() => {
      realtimeSyncTimer = null;
      syncOnlineState().catch(() => {});
    }, ONLINE_REALTIME_SYNC_DEBOUNCE_MS);
  };

  const clearScheduledOnlineSync = () => {
    if (!realtimeSyncTimer) return;
    clearTimeout(realtimeSyncTimer);
    realtimeSyncTimer = null;
  };

  const handleRealtimeClientPresence = (payload: any) => {
    const data = payload?.data ?? payload ?? {};
    const userId = String(data.user_id ?? data.userId ?? "").trim();
    const isOnline = Boolean(data.is_online ?? data.isOnline);
    const onlineClientsNow = Number(data.online_clients_now ?? data.onlineClientsNow);
    const onlineFilter = sanitizeFilterValue(appliedFilters.value.online_status);

    if (onlineFilter !== "") {
      scheduleOnlineSync();
      return;
    }

    if (userId !== "") {
      clientsData.value = clientsData.value.map(client =>
        String(client.id) === userId
          ? {
              ...client,
              is_online: isOnline,
            }
          : client
      );
    }

    if (Number.isFinite(onlineClientsNow)) {
      statsData.value = {
        ...statsData.value,
        online_clients_now: Math.max(0, onlineClientsNow),
      };
    }
  };

  const connectRealtime = () => {
    if (!$echo) return;
    if (supportGlobalChannel) return;

    supportGlobalChannel = $echo
      .private("support.global")
      .listen(".client.presence.updated", handleRealtimeClientPresence);
  };

  const disconnectRealtime = () => {
    if (!supportGlobalChannel || !$echo) return;

    supportGlobalChannel.stopListening(".client.presence.updated");
    $echo.leave("support.global");
    supportGlobalChannel = null;
  };

  const handleWindowFocus = () => {
    scheduleOnlineSync();
  };

  const handleVisibilityChange = () => {
    if (typeof document === "undefined") return;
    if (document.visibilityState === "visible") {
      scheduleOnlineSync();
    }
  };

  const handleExternalReload = async () => {
    await loadAll();
  };

  const fullName = (client: AdminClient) => `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim() || "-";

  const getTwoCharsByFullName = (firstName?: string, lastName?: string): string => {
    const firstInitial = String(firstName ?? "").charAt(0);
    const lastInitial = String(lastName ?? "").charAt(0);
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    return d.toLocaleString(locale.value || undefined);
  };

  const formatCount = (value: number) => {
    return Number(value || 0).toLocaleString(locale.value || undefined);
  };

  const formatMoney = (value: number) => {
    const numericValue = Number(value || 0);

    return `$ ${numericValue.toLocaleString(locale.value || undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  onMounted(async () => {
    initViewMode();
    await loadAll();
    isInitialLoading.value = false;

    useEventBus.on("loadDataForAdmins", handleExternalReload);
    connectRealtime();
    startPolling();
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    document.addEventListener("click", handleClickOutsideFilters);
  });

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForAdmins", handleExternalReload);
    disconnectRealtime();
    stopPolling();
    clearScheduledOnlineSync();
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("click", handleClickOutsideFilters);
  });
</script>

<style scoped lang="scss">
  .clients-stats-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 768px) {
    .clients-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1400px) {
    .clients-stats-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .clients-stat-card {
    border-radius: 10px;
    border: none;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
    padding: 12px;
  }

  .clients-stat-card.is-online-active {
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-sticker-success) 18%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .clients-stat-card.is-deposits-summary {
    grid-column: 1 / -1;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-accent) 16%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .clients-stat-card__label {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .clients-stat-card__value {
    margin-top: 2px;
    font-size: 24px;
    line-height: 28px;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .clients-stat-card__deposits-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 8px;
  }

  @media (min-width: 640px) {
    .clients-stat-card__deposits-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .clients-stat-card__deposits-item {
    border-radius: 8px;
    background: color-mix(in srgb, var(--ui-background-panel) 80%, transparent);
    padding: 8px 10px;
  }

  .clients-stat-card__deposits-label {
    font-size: 11px;
    color: var(--ui-text-secondary);
  }

  .clients-stat-card__deposits-value {
    color: var(--ui-text-main);
    line-height: 1.1;
    margin-top: 2px;
    white-space: nowrap;
  }

  .clients-stat-card__deposits-value.size-xl {
    font-size: clamp(20px, 2.4vw, 28px);
    font-weight: 800;
  }

  .clients-stat-card__deposits-value.size-lg {
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 700;
  }

  .clients-stat-card__deposits-value.size-md {
    font-size: clamp(16px, 1.8vw, 20px);
    font-weight: 700;
  }

  .clients-stat-card__deposits-value.size-sm {
    font-size: clamp(14px, 1.5vw, 18px);
    font-weight: 600;
  }

  .clients-filters-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 40;
    width: min(92vw, 560px);
    max-height: min(70vh, 760px);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: var(--ui-background-panel);
    box-shadow: 0 12px 30px color-mix(in srgb, var(--ui-background) 70%, transparent);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .clients-filters-popover__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ui-text-secondary);
  }

  .clients-filters-popover__body {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 2px;
  }

  .clients-filters-popover__section-title {
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--ui-text-secondary);
  }

  .clients-filters-popover__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  @media (min-width: 640px) {
    .clients-filters-popover__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .clients-filters-popover__grid--status {
    grid-template-columns: 1fr;
  }

  @media (min-width: 980px) {
    .clients-filters-popover__grid--status {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .clients-filters-popover__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .clients-filters-popover__field > span {
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .clients-filters-popover__input {
    width: 100%;
    height: 40px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1;
    padding: 0 12px;
    outline: none;
  }

  .clients-filters-popover__input:focus {
    border-color: var(--ui-primary-accent);
  }

  .clients-filters-popover__input::placeholder {
    color: var(--ui-text-secondary);
  }

  .clients-filters-popover__actions {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .clients-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .clients-filter-chip {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    min-height: 28px;
    padding: 0 10px;
    background: var(--ui-background-panel);
    color: var(--ui-text-main);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .clients-filter-chip:hover {
    background: var(--color-stroke-ui-dark);
  }

  .clients-filter-chip--clear {
    color: var(--ui-text-secondary);
  }

  .clients-filter-chip__remove {
    font-size: 16px;
    line-height: 1;
    color: var(--ui-text-secondary);
  }

  .clients-online-dot {
    width: 9px;
    height: 9px;
    border-radius: 9999px;
    border: 2px solid var(--ui-background-panel);
    position: absolute;
    right: -1px;
    bottom: -1px;
    background: var(--ui-text-secondary);
  }

  .clients-online-dot.is-online {
    background: var(--ui-sticker-success);
  }

  .clients-online-dot.is-offline {
    background: var(--ui-text-secondary);
  }
</style>
