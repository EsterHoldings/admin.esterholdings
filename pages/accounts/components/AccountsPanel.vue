<!-- pages/accounts/components/AccountsPanel.vue -->
<template>
  <div>
    <PageStructureContent v-if="!isInitialLoading" :plain="viewMode !== 'table'">
      <template #top>
        <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
          <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
            <UiInput class="w-full" @input="handleInputSearch" :value="search" :placeholder="t('cabinet.accounts.search')">
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>

            <UiButtonDefault state="info--small" class="!w-[44px]" @click="handleClickUpdate">
              <UiIconUpdate :spinning="isLoading" />
            </UiButtonDefault>
          </div>

          <div class="flex w-full flex-1 items-center gap-2 md:w-auto md:flex-none md:justify-end">
            <UiSelect
                class="min-w-[180px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleChangeFilterSortBy"
            >
              <template #icon-left>
                <UiIconSortBy class="mr-2 !w-[16px] !h-[16px]" :orderDirectionEnabled="true" :orderDirection="orderDirection" />
              </template>
            </UiSelect>

            <ViewModeToggle
              class="w-full sm:w-auto"
              bordered
              :modelValue="viewMode"
              :options="viewOptions"
              @update:modelValue="viewMode = $event"
            />

            <UiButtonDefault state="info--small" class="sm:w-auto">
              <UiIconFilters class="mr-2" />
              <UiTextSmall>Filters</UiTextSmall>
            </UiButtonDefault>
          </div>
        </div>
      </template>

      <template #content>
        <TableMain ref="tableRef" v-if="viewMode === 'table'">
          <template #thead>
            <tr>
              <th class="px-5 py-2 text-left font-normal">
                <div class="flex items-center justify-start">
                  <UiTextSmall class="cursor-default mr-[10px]" @click="handleOrderByAndDirection('type')">
                    {{ t("cabinet.accounts.columns.type") }}
                  </UiTextSmall>
                </div>
              </th>

              <th class="px-5 py-2 text-left font-normal">
                <div class="flex items-center justify-start">
                  <UiTextSmall class="cursor-default mr-[10px]" @click="handleOrderByAndDirection('number')">
                    {{ t("cabinet.accounts.columns.number") }}
                  </UiTextSmall>
                  <UiIconSort :active="orderBy === 'number'" :direction="orderDirection" @click="handleOrderByAndDirection('number')" />
                </div>
              </th>

              <th class="px-5 py-2 text-left font-normal">
                <div class="flex items-center justify-start">
                  <UiTextSmall class="cursor-default mr-[10px]" @click="handleOrderByAndDirection('leverage')">
                    {{ t("cabinet.accounts.columns.leverage") }}
                  </UiTextSmall>
                </div>
              </th>

              <th class="px-5 py-2 text-right font-normal">
                <div class="flex items-center justify-end">
                  <UiTextSmall class="cursor-default mr-[10px]" @click="handleOrderByAndDirection('balance')">
                    {{ t("cabinet.accounts.columns.balance") }}
                  </UiTextSmall>
                  <UiIconSort :active="orderBy === 'balance'" :direction="orderDirection" @click="handleOrderByAndDirection('balance')" />
                </div>
              </th>

              <th class="px-5 py-2 text-right font-normal"></th>
            </tr>
          </template>

          <template #tbody>
            <div
                v-if="isLoading"
                class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10"
            >
              <UiIconSpinnerDefault />
            </div>

            <template v-if="accounts.length > 0">
              <tr
                  v-for="(account, index) in accounts"
                  :key="account.id"
                  class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
              >
                <td class="px-5 py-3 align-middle">
                  <div class="font-bold">
                    {{ account.account_type.name }}
                  </div>
                </td>

                <td class="px-5 py-3 align-middle">
                  {{ account.number }}
                </td>

                <td class="px-5 py-3 align-middle">
                  1:50
                </td>

                <td class="px-5 py-3 align-middle">
                  <div class="flex items-center justify-end gap-[10px] text-right text-[20px] font-bold">
                    <span class="cursor-pointer">$ {{ account.balance }}</span>
                    <UiIconUpdate
                        class="h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"
                        ref="iconUpdate"
                        :class="{ spinning: spinIcon }"
                        @click="handleIconClick(account.id)"
                        @animationend="onIconAnimationEnd"
                    />
                  </div>
                </td>

                <td class="px-5 py-3 align-middle">
                  <div class="flex justify-end items-center gap-[5px] w-auto">
                    <span
                        @click="toggleRowOptions(index)"
                        class="relative flex items-center justify-center h-[32px] w-[32px] rounded-md hover:border-[var(--color-stroke-ui-light)] border border-transparent transition-colors transition-opacity cursor-pointer"
                        :ref="(el) => (triggerRefs[index] = el as HTMLElement)"
                    >
                      <UiIconDotsVertical />

                      <div
                          v-if="currentRowActiveOptions === index"
                          :ref="(el) => (menuRefs[index] = el as HTMLElement)"
                          :class="[
                          'p-3 absolute right-3 min-w-[100px] border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] rounded-md z-10 flex flex-col gap-1 ',
                          dropUp[index] ? 'bottom-[calc(100%+8px)] top-auto' : 'top-10',
                        ]"
                      >
                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                        >
                          <UiIconPayment class="!w-[14px] !h-[14px] stroke-[var(--ui-sticker-success)]" />
                          <UiTextSmall class="whitespace-nowrap">Deposit</UiTextSmall>
                        </div>

                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                        >
                          <UiIconWithdraw class="!w-[14px] !h-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">Withdraw</UiTextSmall>
                        </div>

                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                            @click="handleClickTransfer(account.id)"
                        >
                          <UiIconTransfer class="!w-[14px] !h-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">Transfer</UiTextSmall>
                        </div>

                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                            @click="handleClickHistory(account.id)"
                        >
                          <UiIconHistory class="!w-[14px] !h-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">History</UiTextSmall>
                        </div>

                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                        >
                          <UiIconUpdate class="!w-[14px] !h-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">Change type</UiTextSmall>
                        </div>

                        <div
                            class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                            @click="handleClickDelete(account.id)"
                        >
                          <UiIconTrash class="!w-[14px] !h-[14px] stroke-[var(--ui-sticker-danger)]" />
                          <UiTextSmall class="whitespace-nowrap">Remove</UiTextSmall>
                        </div>
                      </div>
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </TableMain>

        <div v-else class="relative">
          <div
              class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10"
              v-if="isLoading && !isInitialLoading"
          >
            <UiIconSpinnerDefault />
          </div>

          <div
              class="grid gap-3"
              :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'"
          >
            <div
                v-for="account in accounts"
                :key="account.id"
                :class="['account-card card-with-menu', cardMenuOpenId === account.id ? 'card-open' : '']"
            >
              <div class="card-menu-actions">
                <button class="menu-btn" aria-label="Copy number">
                  <UiIconCopy :text="account.number" />
                </button>
                <button
                    type="button"
                    class="menu-btn"
                    @click.stop="toggleCardMenu(account.id)"
                    :ref="el => (cardMenuTriggerRefs[account.id] = el as HTMLElement | null)"
                    aria-label="Open menu"
                >
                  <UiIconDotsVertical class="h-4 w-4" />
                </button>
                <Teleport to="body">
                  <div
                      v-if="cardMenuOpenId === account.id"
                      class="card-menu"
                      :style="cardMenuStyle"
                  >
                    <button class="card-menu__item" type="button">
                      <UiIconPayment class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-success)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.deposit') || 'Deposit' }}</UiTextSmall>
                    </button>
                    <button class="card-menu__item" type="button">
                      <UiIconWithdraw class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.withdraw') || 'Withdraw' }}</UiTextSmall>
                    </button>
                    <button class="card-menu__item" type="button" @click="handleClickTransfer(account.id)">
                      <UiIconTransfer class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.transfer') || 'Transfer' }}</UiTextSmall>
                    </button>
                    <button class="card-menu__item" type="button" @click="handleClickHistory(account.id)">
                      <UiIconHistory class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.history') || 'History' }}</UiTextSmall>
                    </button>
                    <button class="card-menu__item" type="button">
                      <UiIconUpdate class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.changeType') || 'Change type' }}</UiTextSmall>
                    </button>
                    <button class="card-menu__item" type="button" @click="handleClickDelete(account.id)">
                      <UiIconTrash class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-danger)]" />
                      <UiTextSmall class="whitespace-nowrap">{{ t('cabinet.accounts.actions.remove') || 'Remove' }}</UiTextSmall>
                    </button>
                  </div>
                </Teleport>
              </div>

              <div class="account-card__body" :class="viewMode === 'full' ? 'account-card__body--row' : ''">
                <div class="min-w-[140px]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t('cabinet.accounts.columns.type') }}
                  </UiTextSmall>
                  <div class="font-semibold">{{ account.account_type.name }}</div>
                </div>
                <div class="min-w-[140px]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t('cabinet.accounts.columns.number') }}
                  </UiTextSmall>
                  <div class="font-semibold">{{ account.number }}</div>
                </div>
                <div class="min-w-[120px]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t('cabinet.accounts.columns.leverage') }}
                  </UiTextSmall>
                  <div class="font-semibold">1:50</div>
                </div>
                <div class="min-w-[140px]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t('cabinet.accounts.columns.balance') }}
                  </UiTextSmall>
                  <div class="font-semibold text-[var(--color-success)]">${{ account.balance }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PageStructureContent>

    <template v-if="!isInitialLoading && accounts.length === 0">
      <div class="flex items-center justify-center flex-col gap-5 h-[calc(100vh-370px)]">
        <span class="text-[var(--ui-text-main)]">{{ t("cabinet.accounts.nothingToShow") }}</span>
        <UiButtonDefault state="success--outline" @click="handleClickCreateNewAccount">
          {{ t("cabinet.accounts.openAccount") }}
          &nbsp;
          <UiIconSuccess />
        </UiButtonDefault>
      </div>
    </template>

    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>

    <PaginationMain
        class="px-5 py-2"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :per-page="perPage"
        :visible-pages="visiblePages"
        :per-page-options="[1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100]"
        @go-prev="goPrev"
        @go-next="goNext"
        @set-page="setPage"
        @set-per-page="handleSetPerPage"
    />

  </div>
</template>

<script lang="ts" setup>
import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";

import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import PaginationMain from "~/components/block/paginations/PaginationMain.vue";
import TableMain from "~/components/block/tables/TableMain.vue";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconFilters from "~/components/ui/UiIconFilters.vue";
import UiIconHistory from "~/components/ui/UiIconHistory.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { computed, inject, onMounted, reactive, ref, nextTick, onBeforeUnmount, watch, h } from "vue";
import { navigateTo } from "nuxt/app";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";

const isInitialLoading = ref(true);

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";
const VIEW_MODE_STORAGE_KEY = "accountsViewMode";

const toast = useToast();

const isLoading = ref(true);

const search = ref("");
const total = ref(0);
const perPage = ref(7);
const currentPage = ref(1);
const orderBy = ref("balance");
const orderDirection = ref(ORDER_DIRECTION_DESC);
const currentRowActiveOptions = ref<number | null>(null);

const sortByFilterData = reactive([
  { id: "number", value: "number", text: "Number" },
  { id: "balance", value: "balance", text: "Balance" },
]);

const accounts = reactive<any[]>([]);
const spinIcon = ref(false);
const cardMenuOpenId = ref<string | number | null>(null);
const cardMenuStyle = ref<Record<string, string>>({});
const cardMenuTriggerRefs = reactive<Record<string | number, HTMLElement | null>>({});
const viewMode = ref<"table" | "cards" | "full">("table");
const viewOptions = [
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
];

const totalPages = computed(() => Math.ceil(total.value / perPage.value));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxPagesToShow = 5;
  const half = Math.floor(maxPagesToShow / 2);

  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

  if (end - start < maxPagesToShow - 1) {
    start = Math.max(1, end - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

async function setPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    await loadData();
  }
}

async function goPrev() {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadData();
  }
}

async function goNext() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadData();
  }
}

const handleIconClick = (id: string) => {
  const account: any = accounts.find((x: any) => x.id === id);
  if (account) account.isSpinning = true;
};

const onIconAnimationEnd = () => {
  spinIcon.value = false;
};

const handleInputSearch = async (value: any) => {
  search.value = value;
  currentPage.value = 1;
  await loadData();
};

const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const handleChangeFilterSortBy = async (value: string) => {
  if (orderBy.value === value) {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
  } else {
    orderBy.value = value;
  }

  await loadData();
};

const handleSetPerPage = async (value: number) => {
  perPage.value = value;
  currentPage.value = 1;
  await loadData();
};

const loadData = async () => {
  isLoading.value = true;

  const response = await appCore.accounts.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  });

  perPage.value = response.data.data.per_page;
  currentPage.value = response.data.data.current_page;
  total.value = response.data.data.total;

  const accountsData = response.data.data.data.map((x: any) => {
    x.isSpinning = false;
    return x;
  });

  accounts.splice(0, accounts.length, ...accountsData);

  isLoading.value = false;
  isInitialLoading.value = false;
};

const initViewMode = () => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  if (saved && ["table", "cards", "full"].includes(saved)) {
    viewMode.value = saved as typeof viewMode.value;
  }
};

watch(viewMode, mode => {
  if (typeof window === "undefined") return;
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
});

const tableRef = ref<any>(null);

const triggerRefs = ref<(HTMLElement | null)[]>([]);
const menuRefs = ref<(HTMLElement | null)[]>([]);
const dropUp = reactive<Record<number, boolean>>({});
const closeOptions = () => {
  currentRowActiveOptions.value = null;
};

const updateMenuPosition = (index: number) => {
  const trigger = triggerRefs.value[index];
  const menu = menuRefs.value[index];
  if (!trigger || !menu) return;

  const offset = 8;
  const menuHeight = menu.offsetHeight;
  const triggerRect = trigger.getBoundingClientRect();

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  const containerRect = (el ?? document.documentElement).getBoundingClientRect();

  const fitsDown = triggerRect.bottom + offset + menuHeight <= containerRect.bottom;
  dropUp[index] = !fitsDown;
};

const toggleRowOptions = async (index: number) => {
  currentRowActiveOptions.value = currentRowActiveOptions.value === index ? null : index;
  await nextTick();
  if (currentRowActiveOptions.value === index) updateMenuPosition(index);
};

const updateCardMenuPosition = (id: string | number) => {
  const trigger = cardMenuTriggerRefs[id];
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = 180;
  const gap = 8;
  cardMenuStyle.value = {
    top: `${rect.bottom + gap + window.scrollY}px`,
    left: `${rect.right - menuWidth + window.scrollX}px`,
    width: `${menuWidth}px`,
  };
};

const toggleCardMenu = async (id: string | number) => {
  const willOpen = cardMenuOpenId.value !== id;
  cardMenuOpenId.value = willOpen ? id : null;
  cardMenuStyle.value = {};
  if (willOpen) {
    await nextTick();
    updateCardMenuPosition(id);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (currentRowActiveOptions.value === null) return;

  const target = event.target as Node | null;
  if (!target) return;

  const index = currentRowActiveOptions.value;
  const menu = menuRefs.value[index];
  const trigger = triggerRefs.value[index];

  if (menu?.contains(target) || trigger?.contains(target)) return;
  closeOptions();
};

const handleOutsideCardMenu = (event: MouseEvent) => {
  if (!cardMenuOpenId.value) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (!target.closest(".card-menu-actions")) {
    cardMenuOpenId.value = null;
    cardMenuStyle.value = {};
  }
};

const recalc = () => {
  if (currentRowActiveOptions.value != null) updateMenuPosition(currentRowActiveOptions.value);
};

onMounted(async () => {
  initViewMode();
  useEventBus.on("loadDataForAccounts", loadData);
  await loadData();

  window.addEventListener("resize", recalc);
  window.addEventListener("scroll", recalc, true);

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.addEventListener("scroll", recalc, { passive: true });

  document.addEventListener("mousedown", handleClickOutside);
  window.addEventListener("click", handleOutsideCardMenu, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalc);
  window.removeEventListener("scroll", recalc, true);

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.removeEventListener("scroll", recalc);

  document.removeEventListener("mousedown", handleClickOutside);
  window.removeEventListener("click", handleOutsideCardMenu, true);
});

const { openModal } = inject("modalControl") as { openModal: Function };

const handleClickUpdate = async () => {
  await loadData();
};

const handleClickTransfer = async (accountId: string, tab: number | string = 0) => {
  closeOptions();

  return navigateTo({
    path: `/accounts/${encodeURIComponent(accountId)}`,
    query: { tab: String(tab) },
  });
};

const handleClickHistory = (accountId: string, tab: number | string = 1) => {
  closeOptions();

  return navigateTo({
    path: `/accounts/${encodeURIComponent(accountId)}`,
    query: { tab: String(tab) },
  });
};

const handleClickDelete = async (accountId: string) => {
  if (confirm("Are you sure?")) {
    await appCore.accounts.delete(accountId);
    await loadData();
    toast.success("Account deleted!");
  }
  closeOptions();
};

const handleClickCreateNewAccount = () =>
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
</script>

<style lang="postcss" scoped>
.account-card {
  position: relative;
  background: var(--ui-background-panel);
  border-bottom: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  padding: 10px 14px;
  overflow: visible;
  transition: opacity 0.2s ease;
  color: var(--ui-text-main);
}

.account-card:hover:not(.card-open) {
  opacity: 0.6;
}

.account-card.card-open,
.account-card.card-open:hover {
  background: var(--ui-background-panel);
  opacity: 1;
}

.account-card__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
}

.account-card__body > div {
  flex: 1 1 140px;
}

.account-card__body--row {
  flex-wrap: nowrap;
  gap: 10px 16px;
}

@media (max-width: 1024px) {
  .account-card__body--row {
    flex-wrap: wrap;
  }
}

.card-with-menu {
  padding-right: 58px;
}

.card-menu-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.menu-btn {
  height: 28px;
  width: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--ui-text-secondary);
  transition: color 0.2s ease, transform 0.15s ease;
  position: relative;
}

.menu-btn:hover {
  color: var(--ui-text-main);
  transform: translateY(-1px);
}

.card-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  width: 180px;
  border-radius: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  opacity: 1;
  pointer-events: auto;
  padding: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.card-menu-actions {
  pointer-events: auto;
}

.card-menu__item {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.card-menu__item:hover {
  background: var(--color-stroke-ui-light);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}

.spinning {
  animation: spin 0.5s linear;
}
</style>



<!--<template>-->
<!--  <div>-->
<!--    &lt;!&ndash; Top options &ndash;&gt;-->
<!--    <div class="flex items-center justify-between mb-5">-->
<!--      <div class="flex items-center justify-center gap-1 w-full max-w-60">-->
<!--        <UiInput-->
<!--          class="w-full"-->
<!--          @input="handleInputSearch"-->
<!--          :value="search"-->
<!--          :placeholder="t('cabinet.accounts.search')">-->
<!--          <template #icon-left>-->
<!--            <UiIconSearch />-->
<!--          </template>-->
<!--        </UiInput>-->
<!--      </div>-->
<!--      <div class="flex items-center justify-center gap-1">-->
<!--        <UiButtonDefault-->
<!--          state="info&#45;&#45;small"-->
<!--          class="mr-2"-->
<!--          @click="handleClickUpdate">-->
<!--          <UiIconUpdate v-if="!isLoading" />-->
<!--          <UiIconSpinnerDefault v-if="isLoading" />-->
<!--        </UiButtonDefault>-->

<!--        <UiSelect-->
<!--          class="mr-2"-->
<!--          :value="orderBy"-->
<!--          :data="sortByFilterData"-->
<!--          :withoutNoSelect="true"-->
<!--          @change="handleChangeFilterSortBy">-->
<!--          <template #icon-left>-->
<!--            <UiIconSortBy-->
<!--              class="mr-2 !w-[16px] !h-[16px]"-->
<!--              :orderDirectionEnabled="true"-->
<!--              :orderDirection="orderDirection" />-->
<!--          </template>-->
<!--        </UiSelect>-->

<!--        <UiButtonDefault state="info&#45;&#45;small">-->
<!--          <UiIconFilters class="mr-2" />-->
<!--          <UiTextSmall>Filters</UiTextSmall>-->
<!--        </UiButtonDefault>-->
<!--      </div>-->
<!--    </div>-->

<!--    <PanelDefault class="relative overflow-visible">-->
<!--      &lt;!&ndash; Header &ndash;&gt;-->
<!--      <div-->
<!--        class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] items-center text-[var(&#45;&#45;ui-text-main)] gap-x-5 gap-y-2 h-[46px] px-5 bg-[var(&#45;&#45;color-stroke-ui-light)] rounded-t-[10px] w-full">-->
<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('type')">-->
<!--            {{ t("cabinet.accounts.columns.type") }}-->
<!--          </UiTextSmall>-->
<!--        </div>-->

<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('number')">-->
<!--            {{ t("cabinet.accounts.columns.number") }}-->
<!--          </UiTextSmall>-->
<!--          <UiIconSort-->
<!--            :active="orderBy === 'number'"-->
<!--            :direction="orderDirection"-->
<!--            @click="handleOrderByAndDirection('number')" />-->
<!--        </div>-->

<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('leverage')">-->
<!--            {{ t("cabinet.accounts.columns.leverage") }}-->
<!--          </UiTextSmall>-->
<!--        </div>-->

<!--        <div class="flex items-center justify-end">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('balance')">-->
<!--            {{ t("cabinet.accounts.columns.balance") }}-->
<!--          </UiTextSmall>-->
<!--          <UiIconSort-->
<!--            :active="orderBy === 'balance'"-->
<!--            :direction="orderDirection"-->
<!--            @click="handleOrderByAndDirection('balance')" />-->
<!--        </div>-->

<!--        <div class="w-[240px]"></div>-->
<!--      </div>-->

<!--      &lt;!&ndash; Empty state &ndash;&gt;-->
<!--      <template v-if="!isLoading && accounts.length === 0">-->
<!--        <div class="flex items-center justify-center flex-col gap-5 h-[calc(100vh-370px)]">-->
<!--          <span>{{ t("cabinet.accounts.nothingToShow") }}</span>-->
<!--          <UiButtonDefault-->
<!--            state="success&#45;&#45;outline"-->
<!--            @click="handleClickCreateNewAccount">-->
<!--            {{ t("cabinet.accounts.openAccount") }}-->
<!--            &nbsp;-->
<!--            <UiIconSuccess />-->
<!--          </UiButtonDefault>-->
<!--        </div>-->
<!--      </template>-->

<!--      &lt;!&ndash; Loader &ndash;&gt;-->
<!--      <template v-if="isLoading">-->
<!--        <div class="flex items-center justify-center h-[calc(100vh-370px)]">-->
<!--          <UiIconSpinnerDefault />-->
<!--        </div>-->
<!--      </template>-->

<!--      &lt;!&ndash; Accounts list &ndash;&gt;-->
<!--      <div-->
<!--        v-if="!isLoading && accounts.length > 0"-->
<!--        ref="scrollArea"-->
<!--        class="rounded-b-[10px]">-->
<!--        <PanelDefault-->
<!--          class="flex items-center h-[60px] px-5 w-full !border-none rounded-none border-b border-[var(&#45;&#45;color-stroke-ui-light)] last:border-b-0 hover:bg-[var(&#45;&#45;color-stroke-ui-dark)]"-->
<!--          v-for="(account, index) in accounts"-->
<!--          :key="account.id">-->
<!--          <div-->
<!--            class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] gap-x-5 gap-y-2 items-center text-[var(&#45;&#45;ui-text-main)] w-full">-->
<!--            <div class="text-[var(&#45;&#45;color-ui-accent)] font-bold">{{ account.account_type.name }}</div>-->
<!--            <div>{{ account.number }}</div>-->
<!--            <div>1:50</div>-->
<!--            <div class="flex items-center justify-end gap-[10px] text-right text-[20px] font-bold">-->
<!--              <span class="cursor-pointer">$ {{ account.balance }}</span>-->
<!--              <UiIconUpdate-->
<!--                class="h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"-->
<!--                ref="iconUpdate"-->
<!--                :class="{ spinning: spinIcon }"-->
<!--                @click="handleIconClick(account.id)"-->
<!--                @animationend="onIconAnimationEnd" />-->
<!--            </div>-->

<!--            <div class="flex justify-end items-center gap-[5px] w-auto">-->
<!--              <span-->
<!--                @click="toggleRowOptions(index)"-->
<!--                class="relative flex items-center justify-center h-[32px] w-[32px] rounded-md hover:border-[var(&#45;&#45;color-stroke-ui-light)] border border-transparent transition-colors transition-opacity"-->
<!--                :ref="el => (triggerRefs[index] = el as HTMLElement)">-->
<!--                <UiIconDotsVertical />-->

<!--                &lt;!&ndash; Меню опцій &ndash;&gt;-->

<!--                <div-->
<!--                  v-if="currentRowActiveOptions === index"-->
<!--                  :ref="el => (menuRefs[index] = el as HTMLElement)"-->
<!--                  :class="[-->
<!--                    'p-3 absolute right-3 min-w-[100px] border border-[var(&#45;&#45;color-stroke-ui-light)] bg-[var(&#45;&#45;color-stroke-ui-dark)] rounded-md z-10 flex flex-col gap-1 ',-->
<!--                    dropUp[index] ? 'bottom-[calc(100%+8px)] top-auto' : 'top-10',-->
<!--                  ]">-->
<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70">-->
<!--                    <UiIconPayment class="!w-[14px] !h-[14px] stroke-[var(&#45;&#45;ui-sticker-success)]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Deposit</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }">-->
<!--                    <UiIconWithdraw class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Withdraw</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickTransfer(account.id)">-->
<!--                    <UiIconTransfer class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Transfer</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickHistory(account.id)">-->
<!--                    <UiIconHistory class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">History</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }">-->
<!--                    <UiIconUpdate class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Change type</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickDelete(account.id)">-->
<!--                    <UiIconTrash class="!w-[14px] !h-[14px] stroke-[var(&#45;&#45;ui-sticker-danger)]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Remove</UiTextSmall>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </PanelDefault>-->
<!--      </div>-->
<!--    </PanelDefault>-->

<!--    <div class="px-5 h-[50px] mt-2 flex items-center justify-between">-->
<!--      <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">-->
<!--        <UiTextSmall class="mr-2">Per page:</UiTextSmall>-->
<!--        <UiSelect-->
<!--          class="!w-min flex items-center justify-center !h-[32px]"-->
<!--          :data="perPageList"-->
<!--          :value="perPage"-->
<!--          @change="handleChangePerPage"-->
<!--          :withoutNoSelect="true" />-->
<!--      </div>-->

<!--      <UiTextSmall>{{ currentPage * perPage - perPage }}-{{ currentPage * perPage }} / {{ total }}</UiTextSmall>-->

<!--      <div class="flex items-center justify-center gap-2">-->
<!--        <UiTextSmall-->
<!--          class="px-3 py-1.5 h-[32px] border border-[&#45;&#45;color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          v-if="currentPage !== 1 && total > perPage"-->
<!--          @click="goPrev">-->
<!--          {{ t("cabinet.accounts.pagination.prev") }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-if="visiblePages[0] > 1"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          @click="setPage(1)">-->
<!--          1-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall v-if="visiblePages[0] > 2">...</UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-for="page in visiblePages"-->
<!--          :key="page"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          :class="{ 'bg-[var(&#45;&#45;ui-primary-main)] text-white': currentPage === page }"-->
<!--          @click="setPage(page)">-->
<!--          {{ page }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall v-if="visiblePages[visiblePages.length - 1] < totalPages">...</UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-if="visiblePages[visiblePages.length - 1] < totalPages"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          @click="setPage(totalPages)"-->
<!--          >{{ totalPages }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          class="px-3 py-1.5 border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          v-if="currentPage !== totalPages && total > perPage"-->
<!--          @click="goNext">-->
<!--          {{ t("cabinet.accounts.pagination.next") }}-->
<!--        </UiTextSmall>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--  import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";-->
<!--  import PanelDefault from "~/components/block/panels/PanelDefault.vue";-->
<!--  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--  import UiIconFilters from "~/components/ui/UiIconFilters.vue";-->
<!--  import UiIconHistory from "~/components/ui/UiIconHistory.vue";-->
<!--  import UiIconPayment from "~/components/ui/UiIconPayment.vue";-->
<!--  import UiIconSort from "~/components/ui/UiIconSort.vue";-->
<!--  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";-->
<!--  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";-->
<!--  import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";-->
<!--  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";-->
<!--  import UiInput from "~/components/ui/UiInput.vue";-->
<!--  import UiSelect from "~/components/ui/UiSelect.vue";-->
<!--  import useAppCore from "~/composables/useAppCore";-->
<!--  import useEventBus from "~/composables/useEventBus";-->
<!--  import { computed, inject, onMounted, reactive, ref, nextTick, onBeforeUnmount } from "vue";-->
<!--  import { navigateTo } from "nuxt/app";-->
<!--  import { useI18n } from "vue-i18n";-->
<!--  import { useToast } from "vue-toastification";-->
<!--  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";-->
<!--  import UiTextSmall from "~/components/ui/UiTextSmall.vue";-->
<!--  import UiIconSearch from "~/components/ui/UiIconSearch.vue";-->
<!--  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";-->
<!--  import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";-->
<!--  import UiIconTrash from "~/components/ui/UiIconTrash.vue";-->

<!--  const { t } = useI18n({ useScope: "global" });-->
<!--  const appCore = useAppCore();-->

<!--  const ORDER_DIRECTION_ASC = "asc";-->
<!--  const ORDER_DIRECTION_DESC = "desc";-->

<!--  const toast = useToast();-->

<!--  const isLoading = ref(true);-->

<!--  const search = ref("");-->
<!--  const total = ref(0);-->
<!--  const perPage = ref(7);-->
<!--  const currentPage = ref(1);-->
<!--  const orderBy = ref("balance");-->
<!--  const orderDirection = ref(ORDER_DIRECTION_DESC);-->
<!--  const currentRowActiveOptions = ref<number | null>(null);-->

<!--  const sortByFilterData = reactive([-->
<!--    {-->
<!--      id: "number",-->
<!--      value: "number",-->
<!--      text: "Number",-->
<!--    },-->
<!--    {-->
<!--      id: "balance",-->
<!--      value: "balance",-->
<!--      text: "Balance",-->
<!--    },-->
<!--  ]);-->

<!--  const accounts = reactive<any[]>([]);-->
<!--  const spinIcon = ref(false);-->

<!--  const totalPages = computed(() => Math.ceil(total.value / perPage.value));-->

<!--  const perPageList = reactive([-->
<!--    { id: 1, value: 1, text: "1" },-->
<!--    { id: 2, value: 2, text: "2" },-->
<!--    { id: 3, value: 3, text: "3" },-->
<!--    { id: 4, value: 4, text: "4" },-->
<!--    { id: 5, value: 5, text: "5" },-->
<!--    { id: 6, value: 6, text: "6" },-->
<!--    { id: 7, value: 7, text: "7" },-->
<!--    { id: 8, value: 8, text: "8" },-->
<!--    { id: 9, value: 9, text: "9" },-->
<!--    { id: 10, value: 10, text: "10" },-->
<!--    { id: 12, value: 12, text: "12" },-->
<!--    { id: 15, value: 15, text: "15" },-->
<!--    { id: 20, value: 20, text: "20" },-->
<!--    { id: 25, value: 25, text: "25" },-->
<!--    { id: 50, value: 50, text: "50" },-->
<!--    { id: 100, value: 100, text: "100" },-->
<!--  ]);-->

<!--  const visiblePages = computed(() => {-->
<!--    const pages: number[] = [];-->
<!--    const maxPagesToShow = 5;-->
<!--    const half = Math.floor(maxPagesToShow / 2);-->

<!--    let start = Math.max(1, currentPage.value - half);-->
<!--    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);-->

<!--    if (end - start < maxPagesToShow - 1) {-->
<!--      start = Math.max(1, end - maxPagesToShow + 1);-->
<!--    }-->

<!--    for (let i = start; i <= end; i++) {-->
<!--      pages.push(i);-->
<!--    }-->

<!--    return pages;-->
<!--  });-->

<!--  async function setPage(page: number) {-->
<!--    if (page >= 1 && page <= totalPages.value) {-->
<!--      currentPage.value = page;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  async function goPrev() {-->
<!--    if (currentPage.value > 1) {-->
<!--      currentPage.value&#45;&#45;;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  async function goNext() {-->
<!--    if (currentPage.value < totalPages.value) {-->
<!--      currentPage.value++;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  const handleIconClick = (id: string) => {-->
<!--    const account: any = accounts.find((x: any) => x.id === id);-->
<!--    if (account) account.isSpinning = true;-->
<!--  };-->

<!--  const onIconAnimationEnd = () => {-->
<!--    spinIcon.value = false;-->
<!--  };-->

<!--  const handleInputSearch = async (value: any) => {-->
<!--    search.value = value;-->
<!--    currentPage.value = 1;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleOrderByAndDirection = async (value: string) => {-->
<!--    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;-->
<!--    orderBy.value = value;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleChangePerPage = async (newPerPage: number) => {-->
<!--    perPage.value = newPerPage;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleChangeFilterSortBy = async (value: string) => {-->
<!--    if (orderBy.value === value)-->
<!--      orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;-->
<!--    else orderBy.value = value;-->

<!--    await loadData();-->
<!--  };-->

<!--  const loadData = async () => {-->
<!--    isLoading.value = true;-->
<!--    const response = await appCore.accounts.get({-->
<!--      search: search.value,-->
<!--      perPage: perPage.value,-->
<!--      page: currentPage.value,-->
<!--      orderBy: orderBy.value,-->
<!--      orderDirection: orderDirection.value,-->
<!--    });-->

<!--    perPage.value = response.data.data.per_page;-->
<!--    currentPage.value = response.data.data.current_page;-->
<!--    total.value = response.data.data.total;-->
<!--    const accountsData = response.data.data.data.map((x: any) => {-->
<!--      x.isSpinning = false;-->
<!--      return x;-->
<!--    });-->
<!--    accounts.splice(0, accounts.length, ...accountsData);-->

<!--    isLoading.value = false;-->
<!--  };-->

<!--  // -&#45;&#45; Dropdown flip logic -&#45;&#45;-->
<!--  const scrollArea = ref<HTMLElement | null>(null);-->
<!--  const triggerRefs = ref<(HTMLElement | null)[]>([]);-->
<!--  const menuRefs = ref<(HTMLElement | null)[]>([]);-->
<!--  const dropUp = reactive<Record<number, boolean>>({});-->

<!--  const closeOptions = () => {-->
<!--    currentRowActiveOptions.value = null;-->
<!--  };-->

<!--  const toggleRowOptions = async (index: number) => {-->
<!--    currentRowActiveOptions.value = currentRowActiveOptions.value === index ? null : index;-->
<!--    await nextTick();-->
<!--    if (currentRowActiveOptions.value === index) {-->
<!--      updateMenuPosition(index);-->
<!--    }-->
<!--  };-->

<!--  const updateMenuPosition = (index: number) => {-->
<!--    const trigger = triggerRefs.value[index];-->
<!--    const menu = menuRefs.value[index];-->
<!--    if (!trigger || !menu) return;-->

<!--    const offset = 8; // px-->
<!--    const menuHeight = menu.offsetHeight;-->
<!--    const triggerRect = trigger.getBoundingClientRect();-->
<!--    const containerRect = (scrollArea.value ?? document.documentElement).getBoundingClientRect();-->

<!--    const fitsDown = triggerRect.bottom + offset + menuHeight <= containerRect.bottom;-->

<!--    dropUp[index] = !fitsDown;-->
<!--  };-->

<!--  const handleClickOutside = (event: MouseEvent) => {-->
<!--    if (currentRowActiveOptions.value === null) return;-->

<!--    const target = event.target as Node | null;-->
<!--    if (!target) return;-->

<!--    const index = currentRowActiveOptions.value;-->
<!--    const menu = menuRefs.value[index];-->
<!--    const trigger = triggerRefs.value[index];-->

<!--    if (menu?.contains(target) || trigger?.contains(target)) return;-->

<!--    closeOptions();-->
<!--  };-->

<!--  onMounted(async () => {-->
<!--    useEventBus.on("loadDataForAccounts", loadData);-->
<!--    await loadData();-->

<!--    const recalc = () => {-->
<!--      if (currentRowActiveOptions.value != null) {-->
<!--        updateMenuPosition(currentRowActiveOptions.value);-->
<!--      }-->
<!--    };-->
<!--    window.addEventListener("resize", recalc);-->
<!--    scrollArea.value?.addEventListener("scroll", recalc, { passive: true });-->
<!--    document.addEventListener("mousedown", handleClickOutside);-->

<!--    onBeforeUnmount(() => {-->
<!--      window.removeEventListener("resize", recalc);-->
<!--      scrollArea.value?.removeEventListener("scroll", recalc);-->
<!--      document.removeEventListener("mousedown", handleClickOutside);-->
<!--    });-->
<!--  });-->

<!--  // -&#45;&#45; -&#45;&#45;-->

<!--  const { openModal } = inject("modalControl") as { openModal: Function };-->

<!--  const handleClickUpdate = async () => {-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleClickTransfer = async (accountId: string, tab: number | string = 0) => {-->
<!--    closeOptions();-->

<!--    return navigateTo({-->
<!--      path: `/accounts/${encodeURIComponent(accountId)}`,-->
<!--      query: { tab: String(tab) },-->
<!--    });-->
<!--  };-->

<!--  const handleClickHistory = (accountId: string, tab: number | string = 1) => {-->
<!--    closeOptions();-->

<!--    return navigateTo({-->
<!--      path: `/accounts/${encodeURIComponent(accountId)}`,-->
<!--      query: { tab: String(tab) },-->
<!--    });-->
<!--  };-->

<!--  const handleClickDelete = async (accountId: string) => {-->
<!--    if (confirm("Are you sure?")) {-->
<!--      await appCore.accounts.delete(accountId);-->
<!--      await loadData();-->
<!--      toast.success("Account deleted!");-->
<!--    }-->
<!--    closeOptions();-->
<!--  };-->

<!--  const handleClickCreateNewAccount = () =>-->
<!--    openModal(AccountsCreateNew, {-->
<!--      title: t("cabinet.accounts.accounts-form.title"),-->
<!--    });-->
<!--</script>-->

<!--<style lang="postcss" scoped>-->
<!--  @keyframes spin {-->
<!--    0% {-->
<!--      transform: rotate(0deg);-->
<!--    }-->
<!--    100% {-->
<!--      transform: rotate(360deg);-->
<!--    }-->
<!--  }-->

<!--  @keyframes wiggle {-->
<!--    0% {-->
<!--      transform: translateX(0);-->
<!--    }-->
<!--    20% {-->
<!--      transform: translateX(-2px);-->
<!--    }-->
<!--    40% {-->
<!--      transform: translateX(2px);-->
<!--    }-->
<!--    60% {-->
<!--      transform: translateX(-2px);-->
<!--    }-->
<!--    80% {-->
<!--      transform: translateX(2px);-->
<!--    }-->
<!--    100% {-->
<!--      transform: translateX(0);-->
<!--    }-->
<!--  }-->

<!--  /* Локальний клас без Tailwind layer */-->
<!--  .spinning {-->
<!--    animation: spin 0.5s linear;-->
<!--  }-->
<!--</style>-->
