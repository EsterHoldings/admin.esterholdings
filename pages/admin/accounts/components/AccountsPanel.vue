<template>
  <div class="accounts-panel">
    <div class="accounts-metrics-grid">
      <button
        v-for="card in metricFilterCards"
        :key="card.id"
        type="button"
        class="accounts-metric-button"
        :class="{ 'is-active': activeMetricFilter === card.id }"
        @click="applyMetricFilter(card.id)">
        <PrimeCard class="accounts-metric-card">
          <template #content>
            <div class="accounts-metric-card__body">
              <div class="accounts-metric-card__copy">
                <span>{{ card.label }}</span>
                <strong>{{ card.value }}</strong>
              </div>
              <div class="accounts-metric-card__icon">
                <i
                  :class="card.icon"
                  aria-hidden="true" />
              </div>
            </div>
          </template>
        </PrimeCard>
      </button>
    </div>

    <section class="accounts-balance">
      <div class="accounts-balance__header">
        {{ resolveText("admin.accounts.stats.balanceSummary", "Balances") }}
      </div>
      <div class="accounts-balance__grid">
        <div
          v-for="segment in balanceSegments"
          :key="segment.id"
          class="accounts-balance__item">
          <span>{{ segment.label }}</span>
          <strong>{{ segment.value }}</strong>
        </div>
      </div>
    </section>

    <section class="accounts-toolbar-section">
      <div class="accounts-toolbar">
        <label class="accounts-search">
          <i
            class="pi pi-search"
            aria-hidden="true" />
          <PrimeInputText
            :model-value="searchDraft"
            class="accounts-search__input"
            :placeholder="
              resolveText('admin.accounts.components.accounts-panel-search.placeholder', 'Search accounts...')
            "
            @update:model-value="handleSearchInput" />
          <i
            v-if="isLoadingSearch"
            class="pi pi-spin pi-spinner accounts-search__spinner"
            aria-hidden="true" />
        </label>

        <PrimeButton
          rounded
          outlined
          icon="pi pi-refresh"
          :loading="isLoading || isStatsLoading"
          :aria-label="resolveText('admin.accounts.actions.refresh', 'Refresh')"
          @click="handleClickRefresh" />

        <PrimeSelect
          :model-value="orderBy"
          class="accounts-sort-select"
          :options="sortByOptions"
          option-label="text"
          option-value="value"
          @update:model-value="value => handleOrderBy(String(value || DEFAULT_ORDER_BY))" />

        <PrimeButton
          rounded
          outlined
          :icon="orderDirection === ORDER_DIRECTION_ASC ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down'"
          :aria-label="
            orderDirection === ORDER_DIRECTION_ASC
              ? resolveText('admin.accounts.actions.sortAscending', 'Sort ascending')
              : resolveText('admin.accounts.actions.sortDescending', 'Sort descending')
          "
          @click="toggleOrderDirection" />

        <div class="accounts-view-switch">
          <PrimeButton
            v-for="option in viewOptions"
            :key="option.value"
            rounded
            :text="viewMode !== option.value"
            :outlined="viewMode !== option.value"
            size="small"
            :icon="option.icon"
            :aria-label="option.label"
            :title="option.label"
            @click="handleChangeViewMode(option.value)" />
        </div>

        <PrimeButton
          outlined
          icon="pi pi-filter"
          :label="resolveText('admin.accounts.filters.title', 'Filters')"
          @click="toggleFiltersPopover" />
      </div>

      <div
        v-if="activeFilterChips.length"
        class="accounts-filter-chips">
        <PrimeButton
          v-for="chip in activeFilterChips"
          :key="chip.key"
          size="small"
          severity="secondary"
          outlined
          icon="pi pi-times"
          icon-pos="right"
          :label="`${chip.label}: ${chip.value}`"
          @click="removeAppliedFilter(chip.key)" />

        <PrimeButton
          size="small"
          text
          :label="resolveText('admin.accounts.filters.clearAll', 'Clear all')"
          @click="clearAllAppliedFilters" />
      </div>
    </section>

    <PrimePopover
      :ref="setFiltersPopoverRef"
      class="accounts-filters-popover">
      <div class="accounts-filters">
        <div class="accounts-filters__header">
          <strong>{{ resolveText("admin.accounts.filters.title", "Filters") }}</strong>
          <PrimeButton
            rounded
            text
            size="small"
            icon="pi pi-times"
            :aria-label="resolveText('admin.accounts.filters.close', 'Close filters')"
            @click="hideFiltersPopover" />
        </div>

        <div class="accounts-filters__body">
          <section>
            <h3>{{ resolveText("admin.accounts.filters.sections.selects", "Select filters") }}</h3>
            <div class="accounts-filters__grid">
              <label
                v-for="field in filterSelectFieldOptions"
                :key="field.key"
                class="accounts-filter-field">
                <span>{{ field.label }}</span>
                <PrimeSelect
                  append-to="self"
                  show-clear
                  :filter="Boolean(field.searchable)"
                  :model-value="draftFilters[field.key] || null"
                  :options="field.options"
                  option-label="text"
                  option-value="value"
                  @update:model-value="value => setDraftFilterValue(field.key, value)"
                  @show="handleFilterOptionOpen(field.key)"
                  @filter="event => handleFilterOptionSearch(field.key, String(event?.value || ''))" />
              </label>
            </div>
          </section>

          <section>
            <h3>{{ resolveText("admin.accounts.filters.sections.text", "Text fields") }}</h3>
            <div class="accounts-filters__grid">
              <label
                v-for="field in filterTextFieldOptions"
                :key="field.key"
                class="accounts-filter-field">
                <span>{{ field.label }}</span>
                <PrimeSelect
                  append-to="self"
                  show-clear
                  filter
                  :model-value="draftFilters[field.key] || null"
                  :options="field.options"
                  option-label="text"
                  option-value="value"
                  @update:model-value="value => setDraftFilterValue(field.key, value)"
                  @show="handleFilterOptionOpen(field.key)"
                  @filter="event => handleFilterOptionSearch(field.key, String(event?.value || ''))" />
              </label>
            </div>
          </section>

          <section>
            <h3>{{ resolveText("admin.accounts.filters.sections.ranges", "Ranges") }}</h3>
            <div class="accounts-filters__grid">
              <label class="accounts-filter-field">
                <span>{{ resolveText("admin.accounts.filters.fields.balance_from", "Balance from") }}</span>
                <PrimeInputText
                  :model-value="draftFilters.balance_from"
                  type="number"
                  step="0.01"
                  @update:model-value="value => setDraftFilterValue('balance_from', value)" />
              </label>

              <label class="accounts-filter-field">
                <span>{{ resolveText("admin.accounts.filters.fields.balance_to", "Balance to") }}</span>
                <PrimeInputText
                  :model-value="draftFilters.balance_to"
                  type="number"
                  step="0.01"
                  @update:model-value="value => setDraftFilterValue('balance_to', value)" />
              </label>
            </div>
          </section>

          <section>
            <h3>{{ resolveText("admin.accounts.filters.sections.dates", "Date ranges") }}</h3>
            <div class="accounts-filters__grid">
              <label
                v-for="field in filterDateFieldOptions"
                :key="field.key"
                class="accounts-filter-field">
                <span>{{ field.label }}</span>
                <PrimeInputText
                  :model-value="draftFilters[field.key]"
                  type="date"
                  @update:model-value="value => setDraftFilterValue(field.key, value)" />
              </label>
            </div>
          </section>
        </div>

        <div class="accounts-filters__actions">
          <PrimeButton
            severity="secondary"
            outlined
            class="w-full"
            :label="resolveText('admin.accounts.filters.reset', 'Reset')"
            @click="resetDraftFilters" />
          <PrimeButton
            class="w-full"
            :label="resolveText('admin.accounts.filters.apply', 'Apply')"
            @click="applyDraftFilters" />
        </div>
      </div>
    </PrimePopover>

    <section class="accounts-list">
      <div
        v-if="isInitialLoading"
        class="accounts-skeleton-list">
        <PrimeSkeleton
          v-for="index in 8"
          :key="`accounts-skeleton-${index}`"
          height="64px"
          border-radius="14px" />
      </div>

      <template v-else>
        <PrimeDataTable
          v-if="viewMode === 'table'"
          :value="accountsData"
          data-key="id"
          class="accounts-table"
          :loading="isLoading && !isInitialLoading"
          scrollable
          responsive-layout="scroll"
          row-hover
          @row-click="event => handleOpenAccountPage(event.data)">
          <PrimeColumn
            field="owner_name"
            :header="resolveText('admin.accounts.columns.owner', 'Owner')"
            style="min-width: 260px">
            <template #body="{ data }">
              <div class="accounts-owner-cell">
                <UiImageCircle
                  :twoChars="getTwoCharsByFullName(data.owner_name)"
                  :src="data.owner_photo_path" />
                <div>
                  <strong>{{ data.owner_name || "-" }}</strong>
                  <span>{{ data.owner_email || "-" }}</span>
                </div>
              </div>
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="number"
            :header="resolveText('admin.accounts.columns.number', 'Account number')"
            style="min-width: 150px">
            <template #body="{ data }">
              <strong>{{ data.number || "-" }}</strong>
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="balance"
            :header="resolveText('admin.accounts.columns.balance', 'Balance')"
            style="min-width: 150px">
            <template #body="{ data }">
              <div class="accounts-balance-cell">
                <strong>{{ formatMoney(data.balance, data.currency) }}</strong>
                <PrimeButton
                  v-if="canUpdateAccounts"
                  rounded
                  text
                  size="small"
                  icon="pi pi-refresh"
                  :loading="refreshingAccountId === data.id"
                  :disabled="refreshingAccountId === data.id"
                  :aria-label="resolveText('admin.accounts.actions.refreshBalance', 'Refresh balance')"
                  @click.stop="handleRefreshBalance(data)" />
              </div>
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="type_name"
            :header="resolveText('admin.accounts.columns.type', 'Type')"
            style="min-width: 150px">
            <template #body="{ data }">
              {{ data.type_name || data.type_id || "-" }}
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="leverage_display"
            :header="resolveText('admin.accounts.columns.leverage', 'Leverage')"
            style="min-width: 120px">
            <template #body="{ data }">
              {{ data.leverage_display || data.leverage_id || "-" }}
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="created_at"
            :header="resolveText('admin.accounts.components.accounts-panel.columns.created_at', 'Created at')"
            style="min-width: 180px">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </PrimeColumn>

          <PrimeColumn
            header="ID"
            style="width: 70px">
            <template #body="{ data }">
              <button
                v-if="data.id"
                type="button"
                class="accounts-copy-cell"
                :aria-label="resolveText('admin.accounts.actions.copyId', 'Copy ID')"
                @click.stop>
                <UiIconCopy :text="data.id" />
              </button>
              <span v-else>-</span>
            </template>
          </PrimeColumn>

          <PrimeColumn
            v-if="showActionColumn"
            :header="resolveText('admin.accounts.columns.actions', 'Actions')"
            style="width: 86px">
            <template #body="{ data }">
              <PrimeButton
                rounded
                text
                size="small"
                icon="pi pi-ellipsis-v"
                :aria-label="resolveText('admin.accounts.actions.openActions', 'Open actions')"
                @click.stop="toggleActionMenu($event, data)" />
            </template>
          </PrimeColumn>

          <template #empty>
            <div class="accounts-empty">
              <i class="pi pi-wallet" />
              <strong>{{ resolveText("admin.accounts.empty.title", "No accounts found") }}</strong>
              <span>{{
                resolveText("admin.accounts.empty.subtitle", "Change filters or search query to see accounts.")
              }}</span>
            </div>
          </template>
        </PrimeDataTable>

        <div
          v-else
          class="accounts-cards-wrap">
          <div
            v-if="showCardsLoading"
            class="accounts-cards-overlay">
            <i
              class="pi pi-spin pi-spinner"
              aria-hidden="true" />
          </div>

          <AccountsContent
            v-if="accountsData.length"
            :data="accountsData"
            :viewMode="viewMode"
            :canEdit="canUpdateAccounts"
            :canRefresh="canUpdateAccounts"
            :canDelete="canDeleteAccounts"
            :refreshingAccountId="refreshingAccountId"
            @click="handleOpenAccountPage"
            @edit="handleOpenEditModal"
            @refresh="handleRefreshBalance"
            @delete="handleDeleteAccount" />

          <div
            v-else
            class="accounts-empty">
            <i class="pi pi-wallet" />
            <strong>{{ resolveText("admin.accounts.empty.title", "No accounts found") }}</strong>
            <span>{{
              resolveText("admin.accounts.empty.subtitle", "Change filters or search query to see accounts.")
            }}</span>
          </div>
        </div>
      </template>
    </section>

    <div
      v-if="totalRows > 0"
      class="accounts-pagination">
      <PrimePaginator
        :first="(page - 1) * perPage"
        :rows="perPage"
        :total-records="totalRows"
        :rows-per-page-options="[10, 20, 50, 100]"
        @page="handlePaginatorPage" />
      <div class="accounts-pagination__report">
        {{ pageReport }}
      </div>
    </div>

    <PrimeMenu
      :ref="setActionMenuRef"
      :model="actionMenuItems"
      popup />
  </div>
</template>

<script lang="ts" setup>
  import AccountsContent from "~/pages/admin/accounts/components/AccountsContent.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import type { AccountsPanelProps } from "~/composables/admin/accounts/components/AccountsPanel";
  import { useAccountsPanelSetup } from "~/composables/admin/accounts/components/AccountsPanel/setup";

  const props = defineProps<AccountsPanelProps>();
  const { showCardsLoading } = useAccountsPanelSetup(props);
</script>

<style scoped lang="scss">
  .accounts-panel {
    display: grid;
    gap: 14px;
    color: var(--ui-text-main);
  }

  .accounts-panel :deep(*) {
    box-shadow: none !important;
  }

  .accounts-metrics-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 12px;
  }

  @media (min-width: 700px) {
    .accounts-metrics-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .accounts-metrics-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .accounts-metric-button {
    min-width: 0;
    border: none;
    background: transparent;
    text-align: left;
    color: inherit;
    cursor: pointer;
  }

  .accounts-metric-card {
    height: 100%;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 12px;
    background: var(--ui-background-panel);
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      transform 0.18s ease;

    :deep(.p-card-body),
    :deep(.p-card-content) {
      padding: 0;
    }
  }

  .accounts-metric-card::before {
    display: none;
  }

  .accounts-metric-card__body {
    min-height: 74px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
  }

  .accounts-metric-card__copy {
    min-width: 0;
    display: grid;
    gap: 5px;
  }

  .accounts-metric-card__copy span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
  }

  .accounts-metric-card__copy strong {
    color: var(--ui-text-main);
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
  }

  .accounts-metric-card__icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 14%, var(--ui-background-panel));
    font-size: 15px;
  }

  .accounts-metric-button:hover .accounts-metric-card,
  .accounts-metric-button.is-active .accounts-metric-card {
    border-color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
  }

  .accounts-metric-button:hover .accounts-metric-card {
    transform: translateY(-1px);
  }

  .accounts-metric-button.is-active .accounts-metric-card__icon {
    color: #fff;
    background: var(--ui-primary-main);
  }

  .accounts-balance {
    display: grid;
    gap: 10px;
    padding: 10px 12px;
    border: 0 !important;
    border-radius: 10px;
    background: transparent !important;
    box-shadow: none !important;
  }

  .accounts-balance__header {
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 800;
  }

  .accounts-balance__grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 12px;
  }

  @media (min-width: 700px) {
    .accounts-balance__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .accounts-balance__item {
    display: grid;
    gap: 3px;

    span {
      color: var(--ui-text-secondary);
      font-size: 12px;
    }

    strong {
      color: var(--ui-text-main);
      font-size: 18px;
      font-weight: 800;
      line-height: 1.1;
    }
  }

  .accounts-toolbar-section {
    position: relative;
    z-index: 2;
    display: grid;
    gap: 10px;
    padding: 12px;
    border: 0 !important;
    border-radius: 12px;
    background: transparent !important;
    box-shadow: none !important;
  }

  .accounts-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr);
    gap: 12px;
    align-items: center;
  }

  @media (min-width: 900px) {
    .accounts-toolbar {
      grid-template-columns: minmax(260px, 1fr) auto minmax(170px, 220px) auto auto auto;
    }
  }

  .accounts-search {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;

    > .pi-search {
      position: absolute;
      left: 13px;
      z-index: 1;
      color: var(--ui-text-secondary);
      pointer-events: none;
    }
  }

  .accounts-search__input {
    width: 100%;
    min-height: 36px;
    padding-left: 38px;
    padding-right: 38px;
  }

  .accounts-search__spinner {
    position: absolute;
    right: 13px;
    color: var(--ui-text-secondary);
  }

  .accounts-sort-select {
    min-width: 170px;
  }

  .accounts-view-switch {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .accounts-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .accounts-toolbar :deep(.p-inputtext),
  .accounts-toolbar :deep(.p-select) {
    min-height: 36px;
    border: 1px solid var(--ui-control-border);
    border-radius: 8px;
    background: var(--ui-control-bg);
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 700;
  }

  .accounts-toolbar :deep(.p-inputtext:enabled:hover),
  .accounts-toolbar :deep(.p-select:not(.p-disabled):hover) {
    border-color: var(--ui-control-hover-border);
  }

  .accounts-toolbar :deep(.p-inputtext:enabled:focus),
  .accounts-toolbar :deep(.p-select.p-focus) {
    border-color: var(--ui-control-focus-border);
    box-shadow: 0 0 0 3px var(--ui-control-focus-ring);
  }

  .accounts-toolbar :deep(.p-button) {
    min-height: 36px;
    border-radius: 8px;
    font-weight: 700;
  }

  .accounts-toolbar :deep(.p-button-outlined),
  .accounts-filter-chips :deep(.p-button) {
    border-color: transparent;
    background: transparent;
    color: var(--ui-text-main);
  }

  .accounts-toolbar :deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
    border-color: var(--ui-primary-main);
    background: var(--ui-primary-main);
    color: #fff;
  }

  .accounts-filters {
    width: min(92vw, 620px);
    max-height: min(78vh, 760px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 12px;
    color: var(--ui-text-main);
  }

  .accounts-filters__header,
  .accounts-filters__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .accounts-filters__body {
    min-height: 0;
    overflow: auto;
    display: grid;
    gap: 16px;
    padding-right: 2px;
  }

  .accounts-filters section {
    display: grid;
    gap: 10px;
  }

  .accounts-filters h3 {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  .accounts-filters__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 640px) {
    .accounts-filters__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .accounts-filter-field {
    display: grid;
    gap: 6px;
    min-width: 0;

    > span {
      color: var(--ui-text-secondary);
      font-size: 12px;
    }
  }

  .accounts-list {
    overflow: visible;
  }

  .accounts-skeleton-list {
    display: grid;
    gap: 10px;
    padding: 0;
  }

  .accounts-table {
    :deep(.p-datatable-table) {
      min-width: 1120px;
      overflow: hidden;
      border-collapse: separate;
      border-spacing: 0 10px;
    }

    :deep(.p-datatable-table-container) {
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    :deep(.p-datatable-thead > tr > th) {
      padding: 0 12px 4px;
      background: transparent;
      color: var(--ui-text-secondary);
      border: 0;
      font-size: 12px;
      font-weight: 800;
    }

    :deep(.p-datatable-tbody > tr) {
      background: transparent;
      color: var(--ui-text-main);
      cursor: pointer;
    }

    :deep(.p-datatable-tbody > tr > td) {
      border-top: 1px solid var(--color-stroke-ui-light);
      border-bottom: 1px solid var(--color-stroke-ui-light);
      background: var(--ui-background-panel);
      border-color: var(--color-stroke-ui-light);
      padding: 14px 12px;
      transition:
        border-color 0.18s ease,
        background-color 0.18s ease;
    }

    :deep(.p-datatable-tbody > tr > td:first-child) {
      border-left: 1px solid var(--color-stroke-ui-light);
      border-radius: 12px 0 0 12px;
    }

    :deep(.p-datatable-tbody > tr > td:last-child) {
      border-right: 1px solid var(--color-stroke-ui-light);
      border-radius: 0 12px 12px 0;
    }

    :deep(.p-datatable-tbody > tr:hover > td) {
      background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
      border-color: color-mix(in srgb, var(--ui-primary-main) 40%, var(--color-stroke-ui-light));
    }
  }

  .accounts-owner-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    > :first-child {
      width: 42px;
      height: 42px;
      flex: 0 0 auto;
    }

    div {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    strong,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: var(--ui-text-secondary);
      font-size: 12px;
    }
  }

  .accounts-balance-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .accounts-copy-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
  }

  .accounts-cards-wrap {
    position: relative;
    padding: 0;
  }

  .accounts-cards-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: color-mix(in srgb, var(--ui-background-panel) 64%, transparent);
    color: var(--ui-primary-main);
    backdrop-filter: blur(3px);
  }

  .accounts-empty {
    min-height: 240px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    text-align: center;
    padding: 24px;

    i {
      font-size: 32px;
      color: var(--ui-primary-main);
    }

    strong {
      color: var(--ui-text-main);
    }
  }

  .accounts-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 0 !important;
    border-radius: 10px;
    background: transparent !important;
    box-shadow: none !important;
  }

  .accounts-pagination :deep(.p-paginator) {
    gap: 8px;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .accounts-pagination :deep(.p-paginator-page),
  .accounts-pagination :deep(.p-paginator-next),
  .accounts-pagination :deep(.p-paginator-prev),
  .accounts-pagination :deep(.p-paginator-first),
  .accounts-pagination :deep(.p-paginator-last) {
    min-width: 34px;
    height: 34px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--ui-text-main);
    font-weight: 800;
  }

  .accounts-pagination :deep(.p-paginator-page.p-paginator-page-selected) {
    border-color: var(--ui-primary-main);
    background: var(--ui-primary-main);
    color: #fff;
  }

  .accounts-pagination__report {
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .accounts-filters {
      width: calc(100vw - 28px);
    }

    .accounts-pagination {
      justify-content: center;
    }
  }
</style>
