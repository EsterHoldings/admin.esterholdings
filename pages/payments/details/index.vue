<template>
  <UiContainer>
    <div class="payments-details pb-10">
      <!-- Title + Create -->
      <div class="mt-5 mb-5 flex items-center justify-between">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.payments.title") }}
        </UiTextH4>

        <UiButtonDefault state="info">
          <UiIconPlus class="mr-2" />
          <span>{{ t("cabinet.payments.create") }}</span>
        </UiButtonDefault>
      </div>

      <div>
        <!-- Top options -->
        <div class="mb-5 flex items-center justify-between">
          <div class="lex items-center justify-center gap-1 w-full max-w-60">
            <UiInput
                class="w-full"
                @input="handleInputSearch"
                :value="search"
                :placeholder="t('cabinet.accounts.search')"
            >
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
          </div>

          <div class="flex items-center gap-2">
            <UiButtonDefault state="info--small" class="mr-2" @click="handleClickUpdate">
              <UiIconUpdate v-if="!isLoading"/>
              <UiIconSpinnerDefault v-else/>
            </UiButtonDefault>

            <UiSelect
                class="mr-2"
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleChangeFilterSortBy"
            >
              <template #icon-left>
                <UiIconSortBy
                    class="!h-4 !w-4"
                    :orderDirectionEnabled="true"
                    :orderDirection="orderDirection"
                />
              </template>
            </UiSelect>

            <UiButtonDefault state="info--small">
              <UiIconFilters class="mr-2" />
              <UiTextSmall>Filters</UiTextSmall>
              <UiIconArrowDown :rotate180="false" class="ml-2" />
            </UiButtonDefault>
          </div>
        </div>

        <PanelDefault>
          <!-- Горизонтальний скрол тільки для таблиці -->
          <div class="relative overflow-x-auto overscroll-x-contain" ref="scrollArea">
            <table class="w-full min-w-[1000px] table-auto whitespace-nowrap text-[var(--ui-text-main)]">
              <colgroup>
                <col class="w-[16rem]" /> <!-- Name -->
                <col class="w-[12rem]" /> <!-- Payment system -->
                <col class="w-[6rem]"  /> <!-- Currency -->
                <col class="w-[8rem]"  /> <!-- Status -->
                <col class="w-[14rem]" /> <!-- CreatedAt -->
                <col class="w-[14rem]" /> <!-- UpdatedAt -->
                <col class="w-[3rem]"  /> <!-- ... -->
              </colgroup>

              <thead class="bg-[var(--color-stroke-ui-light)]">
              <tr class="h-[46px] first:rounded-t-[10px]">
                <th class="px-5 text-left first:rounded-tl-[10px]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('name')">
                    <UiTextSmall>Name</UiTextSmall>
                    <UiIconSort :active="orderBy === 'name'" :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 text-left">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('payment_system')">
                    <UiTextSmall>Payment system</UiTextSmall>
                  </button>
                </th>

                <th class="px-5 text-left">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('currency')">
                    <UiTextSmall>Currency</UiTextSmall>
                  </button>
                </th>

                <th class="px-5 text-left">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('status')">
                    <UiTextSmall>Status</UiTextSmall>
                    <UiIconSort :active="orderBy === 'status'" :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 text-left">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('created_at')">
                    <UiTextSmall>CreatedAt</UiTextSmall>
                    <UiIconSort :active="orderBy === 'created_at'" :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 text-left">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('updated_at')">
                    <UiTextSmall>UpdatedAt</UiTextSmall>
                    <UiIconSort :active="orderBy === 'updated_at'" :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 text-right last:rounded-tr-[10px]"></th>
              </tr>
              </thead>

              <tbody>
              <tr v-if="paymentDetails.length === 0" class="h-[40vh]">
                <td colspan="7" class="px-5 text-center align-middle">
                  {{ t("cabinet.payments.nothingToShow") }}
                </td>
              </tr>

              <tr
                  v-else
                  v-for="(paymentDetail, index) in paymentDetails"
                  :key="paymentDetail.id"
                  class="h-[60px] border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] hover:bg-[var(--color-stroke-ui-dark)]"
              >
                <td class="px-5 align-middle font-bold text-[var(--color-ui-accent)] truncate" :title="paymentDetail?.name">
                  {{ paymentDetail?.name }}
                </td>

                <td class="px-5 align-middle truncate" :title="paymentDetail.payment_system_name">
                  {{ paymentDetail.payment_system_name }}
                </td>

                <td class="px-5 align-middle">
                  {{ paymentDetail.currency ?? 'USD' }}
                </td>

                <td class="px-5 align-middle capitalize">
                  {{ paymentDetail.status }}
                </td>

                <td class="px-5 align-middle">
                  {{ new Date(paymentDetail.created_at).toLocaleString() }}
                </td>

                <td class="px-5 align-middle">
                  {{ new Date(paymentDetail.updated_at).toLocaleString() }}
                </td>

                <td class="px-5 align-middle">
                    <span
                        @click="toggleRowOptions(index)"
                        class="relative flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent transition-colors"
                        :ref="(el) => (triggerRefs[index] = el as HTMLElement | null)"
                    >
                      <UiIconDotsVertical />

                      <!-- Меню опцій -->
                      <div
                          v-if="currentRowActiveOptions === index"
                          :ref="(el) => (menuRefs[index] = el as HTMLElement | null)"
                          :class="[
                          'absolute right-3 z-10 flex min-w-[140px] max-w-[60vw] flex-col gap-1 rounded-md border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-3 shadow-lg',
                          dropUp[index] ? 'bottom-[calc(100%+8px)] top-auto origin-bottom-right' : 'top-[calc(100%+8px)] bottom-auto origin-top-right'
                        ]"
                          class="max-h-[70vh] overflow-auto"
                      >
                        <div class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70">
                          <UiIconEye class="!h-[14px] !w-[14px]"/>
                          <UiTextSmall class="whitespace-nowrap">View</UiTextSmall>
                        </div>

                        <div class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70">
                          <UiIconConfirm class="!h-[14px] !w-[14px]"/>
                          <UiTextSmall class="whitespace-nowrap">Confirm</UiTextSmall>
                        </div>

                        <div class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70">
                          <UiIconTrash class="!h-[14px] !w-[14px] stroke-[var(--ui-sticker-danger)]"/>
                          <UiTextSmall class="whitespace-nowrap">Delete</UiTextSmall>
                        </div>
                      </div>
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </PanelDefault>

        <!-- Pagination -->
        <div class="px-5 h-[50px] mt-2 flex items-center justify-between">
          <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">
            <UiTextSmall class="mr-2">Per page:</UiTextSmall>
            <UiSelect
                class="!w-min flex items-center justify-center !h-[32px]"
                :data="perPageList"
                :value="perPage"
                @change="handleChangePerPage"
                :withoutNoSelect="true"
            />
          </div>

          <UiTextSmall>{{ (currentPage * perPage) - perPage }}-{{ currentPage * perPage }} / {{ total }}</UiTextSmall>

          <div class="flex items-center justify-center gap-2">
            <UiTextSmall
                class="px-3 py-1.5 h-[32px] border border-[--color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
                v-if="currentPage !== 1 && total > perPage"
                @click="goPrev"
            >
              {{ t("cabinet.accounts.pagination.prev") }}
            </UiTextSmall>

            <UiTextSmall
                v-if="visiblePages[0] > 1"
                class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
                @click="setPage(1)"
            >
              1
            </UiTextSmall>

            <UiTextSmall v-if="visiblePages[0] > 2">...</UiTextSmall>

            <UiTextSmall
                v-for="page in visiblePages"
                :key="page"
                class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
                :class="{ 'bg-[var(--color-ui-primary)] text-white': currentPage === page }"
                @click="setPage(page)"
            >
              {{ page }}
            </UiTextSmall>

            <UiTextSmall v-if="visiblePages[visiblePages.length - 1] < totalPages">...</UiTextSmall>

            <UiTextSmall
                v-if="visiblePages[visiblePages.length - 1] < totalPages"
                class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
                @click="setPage(totalPages)"
            >{{ totalPages }}
            </UiTextSmall>

            <UiTextSmall
                class="px-3 py-1.5 border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
                v-if="currentPage !== totalPages && total > perPage"
                @click="goNext"
            >
              {{ t("cabinet.accounts.pagination.next") }}
            </UiTextSmall>
          </div>
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
import UiIconFilters from "~/components/ui/UiIconFilters.vue";
import UiIconPlus from "~/components/ui/UiIconPlus.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import useAppCore from "~/composables/useAppCore";
import {computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconConfirm from "~/components/ui/UiIconConfirm.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";

const { t } = useI18n({ useScope: "global" });

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const isLoading = ref(false);
const search = ref("");
const total = ref(0);
const perPage = ref(7);
const currentPage = ref(1);
const orderBy = ref("created_at");
const orderDirection = ref<typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC>(ORDER_DIRECTION_DESC);

const paymentDetails = reactive<any[]>([]);

// --- dropdown state ---
const currentRowActiveOptions = ref<number | null>(null);
const scrollArea = ref<HTMLElement | null>(null);
const triggerRefs = ref<(HTMLElement | null)[]>([]);
const menuRefs = ref<(HTMLElement | null)[]>([]);
const dropUp = reactive<Record<number, boolean>>({}); // true => відкривати вгору

const perPageList = reactive([
  {id: 1, value: 1, text: "1"},
  {id: 2, value: 2, text: "2"},
  {id: 3, value: 3, text: "3"},
  {id: 4, value: 4, text: "4"},
  {id: 5, value: 5, text: "5"},
  {id: 6, value: 6, text: "6"},
  {id: 7, value: 7, text: "7"},
  {id: 8, value: 8, text: "8"},
  {id: 9, value: 9, text: "9"},
  {id: 10, value: 10, text: "10"},
  {id: 12, value: 12, text: "12"},
  {id: 15, value: 15, text: "15"},
  {id: 20, value: 20, text: "20"},
  {id: 25, value: 25, text: "25"},
  {id: 50, value: 50, text: "50"},
  {id: 100, value: 100, text: "100"},
]);

const toggleRowOptions = async (index: number) => {
  currentRowActiveOptions.value =
      currentRowActiveOptions.value === index ? null : index;
  await nextTick();
  if (currentRowActiveOptions.value === index) updateMenuPosition(index);
};

const updateMenuPosition = (index: number) => {
  const trigger = triggerRefs.value[index];
  const menu = menuRefs.value[index];
  if (!trigger || !menu) return;

  const offset = 8;
  const menuHeight = menu.offsetHeight;

  const triggerRect = trigger.getBoundingClientRect();
  const container = scrollArea.value;
  const containerRect = container
      ? container.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };

  const availableDown = container
      ? containerRect.bottom - triggerRect.bottom
      : window.innerHeight - triggerRect.bottom;

  const availableUp = container
      ? triggerRect.top - containerRect.top
      : triggerRect.top;

  let openUp = false;
  if (availableDown >= menuHeight + offset) {
    openUp = false;
  } else if (availableUp >= menuHeight + offset) {
    openUp = true;
  } else {
    openUp = availableUp > availableDown;
  }

  dropUp[index] = openUp;
};

const recalcActiveMenu = () => {
  if (currentRowActiveOptions.value !== null) {
    updateMenuPosition(currentRowActiveOptions.value);
  }
};

const onClickOutside = (e: MouseEvent) => {
  const i = currentRowActiveOptions.value;
  if (i === null) return;
  const t = triggerRefs.value[i];
  const m = menuRefs.value[i];
  const target = e.target as Node | null;
  if (!target) return;
  const inside = (!!t && t.contains(target)) || (!!m && m.contains(target));
  if (!inside) currentRowActiveOptions.value = null;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") currentRowActiveOptions.value = null;
};

const sortByFilterData = reactive([
  { id: "name",       value: "name",       text: "Name" },
  { id: "status",     value: "status",     text: "Status" },
  { id: "created_at", value: "created_at", text: "Created at" },
  { id: "updated_at", value: "updated_at", text: "Updated at" },
]);

const totalPages = computed(() => Math.ceil(total.value / perPage.value));

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxPagesToShow = 5;
  const half = Math.floor(maxPagesToShow / 2);

  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

  if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);
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

const handleInputSearch = async (value: string) => {
  search.value = value;
  currentPage.value = 1;
  await loadData();
};

const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const loadData = async () => {
  isLoading.value = true;
  const response = await appCore.paymentDetails.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  });

  perPage.value = response.data.data.per_page;
  currentPage.value = response.data.data.current_page;
  total.value = response.data.data.total;

  const paymentDetailsData = response.data.data.data.map((x: any) => {
    x.isSpinning = false;
    return x;
  });
  paymentDetails.splice(0, paymentDetails.length, ...paymentDetailsData);
  isLoading.value = false;
};

const shortId = (uuid: string) => uuid.split("-").pop();
const copyToClipboard = (paymentId: string) => {
  const id = shortId(paymentId);
  if (id) navigator.clipboard.writeText(id);
};

const { openModal } = inject("modalControl") as { openModal: Function };
// const handleClickCreateNewAccount = () => openModal(AdminsPanelAddNew, { title: "Add new Admin" });

const handleChangePerPage = async (newPerPage: number) => {
  perPage.value = newPerPage;
  await loadData();
};

const handleChangeFilterSortBy = async (value: string) => {
  if (orderBy.value === value) {
    orderDirection.value =
        orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
  } else {
    orderBy.value = value;
  }
  await loadData();
};

const handleClickUpdate = async () => {
  await loadData();
};

onMounted(async () => {
  await loadData();

  // слухачі
  window.addEventListener("resize", recalcActiveMenu, { passive: true });
  window.addEventListener("scroll", recalcActiveMenu, { passive: true, capture: true });
  // якщо скролимо сам контейнер таблиці
  scrollArea.value?.addEventListener("scroll", recalcActiveMenu, { passive: true });

  window.addEventListener("mousedown", onClickOutside, true);
  window.addEventListener("keydown", onKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalcActiveMenu);
  window.removeEventListener("scroll", recalcActiveMenu, true);
  scrollArea.value?.removeEventListener("scroll", recalcActiveMenu);

  window.removeEventListener("mousedown", onClickOutside, true);
  window.removeEventListener("keydown", onKeydown, true);
});
</script>
