<template>
  <div class="flex w-full flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="clients-stats-grid">
      <button
        v-for="card in metricCards"
        :key="card.id"
        type="button"
        class="clients-stat-card"
        :class="[card.kind, { 'is-active': card.isActive }]"
        @click="handleMetricCardClick(card.id)">
        <div class="clients-stat-card__label">{{ card.label }}</div>
        <div class="clients-stat-card__value">{{ card.value }}</div>
      </button>
    </div>

    <PageStructureContent :plain="contentIsPlain">
      <template #top>
        <div class="flex w-full flex-col gap-2">
          <div class="flex w-full flex-col gap-2 xl:flex-row xl:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
              <UiInput
                class="w-full"
                clearable
                :placeholder="t('admin.clients.components.clients-panel-search.placeholder', 'Search clients...')"
                @input="handleInputSearch"
                :value="searchDraft">
                <template #icon-left>
                  <UiIconSearch />
                </template>
              </UiInput>

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickRefresh">
                <UiIconUpdate :spinning="isRefreshSpinning" />
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
                :ref="setFiltersTriggerElement"
                class="relative">
                <UiButtonDefault
                  state="info--small"
                  class="min-w-[120px] shrink-0"
                  @click="toggleFiltersPopover">
                  <span class="inline-flex items-center gap-2">
                    <UiIconFilters class="!h-4 !w-4" />
                    <span>{{ t("admin.clients.filters.title", "Filters") }}</span>
                  </span>
                </UiButtonDefault>
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
              v-if="showContentLoading">
              <UiIconSpinnerDefault />
            </div>
            <ClientsContent
              :data="clientsData"
              :viewMode="viewMode"
              @click="handleOpenClientPage"
              @full-delete="handleFullDeleteClient" />
          </div>

          <div
            v-else
            class="relative">
            <div
              class="backdrop-blur-sm bg-[var(--ui-background)]/40 w-full absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              v-if="showContentLoading">
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
                    <th class="px-3 py-3 text-center font-normal w-[54px]"></th>
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
                          <div class="clients-client-badges">
                            <span
                              class="clients-client-badge"
                              :class="`is-source-${normalizeBadgeValue(client.acquisition_source)}`">
                              {{ acquisitionSourceLabel(client) }}
                            </span>
                            <span
                              class="clients-client-badge"
                              :class="`is-registration-${normalizeBadgeValue(client.registration_method)}`">
                              {{ registrationMethodLabel(client) }}
                            </span>
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
                    <td
                      class="px-3 py-3"
                      @click.stop>
                      <div class="clients-row-actions">
                        <button
                          type="button"
                          class="clients-row-actions__button"
                          :disabled="deletingClientId === client.id"
                          :aria-label="resolveText('admin.clients.actions.openMenu', 'Open menu')"
                          @click.stop="toggleClientActionMenu(client.id)">
                          <UiIconSpinnerDefault
                            v-if="deletingClientId === client.id"
                            class="!h-4 !w-4" />
                          <UiIconDotsVertical
                            v-else
                            class="!h-4 !w-4" />
                        </button>
                        <div
                          v-if="activeClientMenuId === client.id"
                          class="clients-row-actions__menu">
                          <button
                            type="button"
                            class="clients-row-actions__item is-danger"
                            @click.stop="handleFullDeleteClient(client)">
                            {{ resolveText("admin.clients.actions.fullDelete", "Full deletion") }}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </TableMain>
            </template>

            <div
              v-else-if="showTableEmpty"
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

    <Teleport to="body">
      <div
        v-if="isFiltersPopoverOpen"
        :ref="setFiltersPopoverPanelElement"
        class="clients-filters-popover"
        :style="filtersPopoverStyle"
        @click.stop>
        <div class="clients-filters-popover__title">
          {{ t("admin.clients.filters.title", "Filters") }}
        </div>

        <div class="clients-filters-popover__body">
          <div class="clients-filters-popover__section-title">
            {{ t("admin.clients.filters.sections.statuses", "Statuses") }}
          </div>

          <div class="clients-filters-popover__grid clients-filters-popover__grid--status">
            <label
              v-for="field in filterSelectFieldOptions"
              :key="field.key"
              class="clients-filters-popover__field">
              <span>{{ field.label }}</span>
              <div class="clients-filters-popover__control">
                <UiSelect
                  :withoutNoSelect="false"
                  :searchable="Boolean(field.searchable)"
                  :searchValue="filterSearchQueries[field.key]"
                  :value="draftFilters[field.key] || null"
                  :data="field.options"
                  @change="value => setDraftFilterValue(field.key, value)"
                  @open="handleFilterOptionOpen(field.key)"
                  @search="value => handleFilterOptionSearch(field.key, value)" />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="clients-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)">
                  ×
                </button>
              </div>
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
              <div class="clients-filters-popover__control">
                <UiSelect
                  :withoutNoSelect="false"
                  searchable
                  :searchValue="filterSearchQueries[field.key]"
                  :value="draftFilters[field.key] || null"
                  :data="field.options"
                  @change="value => setDraftFilterValue(field.key, value)"
                  @open="handleFilterOptionOpen(field.key)"
                  @search="value => handleFilterOptionSearch(field.key, value)" />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="clients-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)">
                  ×
                </button>
              </div>
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
              <div class="clients-filters-popover__control">
                <input
                  class="clients-filters-popover__input"
                  type="date"
                  :value="draftFilters[field.key]"
                  @input="event => handleDraftTextInput(field.key, event)" />
                <button
                  v-if="hasDraftFilterValue(field.key)"
                  type="button"
                  class="clients-filters-popover__clear"
                  @click.prevent.stop="clearDraftFilterValue(field.key)">
                  ×
                </button>
              </div>
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
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
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
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import type { ClientsPanelProps } from "~/composables/admin/clients/components/ClientsPanel";
  import { useClientsPanelSetup } from "~/composables/admin/clients/components/ClientsPanel/setup";

  const props = defineProps<ClientsPanelProps>();
  const { t } = useI18n({ useScope: "global" });
  const { contentIsPlain, isRefreshSpinning, showContentLoading, showTableEmpty } = useClientsPanelSetup(props);
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
    border: 1px solid transparent;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
    padding: 12px;
    text-align: left;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease;
  }

  .clients-stat-card:hover {
    border-color: color-mix(in srgb, var(--ui-primary-main) 28%, transparent);
  }

  .clients-stat-card.is-active {
    border-color: color-mix(in srgb, var(--ui-primary-main) 42%, transparent);
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 18%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .clients-stat-card.is-online-active {
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-sticker-success) 18%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .clients-stat-card.is-online-active.is-active {
    border-color: color-mix(in srgb, var(--ui-sticker-success) 44%, transparent);
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-sticker-success) 24%, transparent) 0%, transparent 70.44%),
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

  .clients-filters-popover {
    position: fixed;
    z-index: 1200;
    width: min(92vw, 560px);
    max-height: min(70vh, 760px);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-background-panel) 92%, var(--ui-background) 8%);
    box-shadow: 0 18px 44px color-mix(in srgb, var(--ui-background) 84%, transparent);
    backdrop-filter: blur(6px);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
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

  .clients-filters-popover__control {
    position: relative;
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
    padding: 0 36px 0 12px;
    outline: none;
  }

  .clients-filters-popover__input:focus {
    border-color: var(--ui-primary-accent);
  }

  .clients-filters-popover__input::placeholder {
    color: var(--ui-text-secondary);
  }

  .clients-filters-popover__clear {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    font-size: 14px;
    line-height: 1;
    z-index: 2;
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

  .clients-client-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 5px;
  }

  .clients-client-badge {
    display: inline-flex;
    align-items: center;
    min-height: 18px;
    max-width: 100%;
    border-radius: 999px;
    padding: 2px 7px;
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    color: var(--ui-text-main);
    font-size: 10px;
    font-weight: 760;
    line-height: 1.2;
    white-space: nowrap;
  }

  .clients-client-badge.is-source-referral {
    background: color-mix(in srgb, var(--ui-success-main, #26c281) 13%, transparent);
    color: var(--ui-success-main, #26c281);
  }

  .clients-client-badge.is-registration-social {
    background: color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    color: var(--ui-primary-main);
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

  .clients-row-actions {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .clients-row-actions__button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    transition:
      border-color 0.18s ease,
      color 0.18s ease,
      background 0.18s ease;
  }

  .clients-row-actions__button:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--ui-primary-main) 38%, transparent);
    color: var(--ui-text-main);
    background: var(--color-stroke-ui-dark);
  }

  .clients-row-actions__button:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .clients-row-actions__menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 30;
    min-width: 178px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: var(--ui-background-panel);
    box-shadow: 0 16px 36px color-mix(in srgb, var(--ui-background) 82%, transparent);
    padding: 5px;
  }

  .clients-row-actions__item {
    width: 100%;
    min-height: 34px;
    border-radius: 6px;
    padding: 0 10px;
    text-align: left;
    font-size: 13px;
    font-weight: 650;
    color: var(--ui-text-main);
  }

  .clients-row-actions__item:hover {
    background: var(--color-stroke-ui-dark);
  }

  .clients-row-actions__item.is-danger {
    color: var(--ui-danger-main, #ff5f73);
  }
</style>
