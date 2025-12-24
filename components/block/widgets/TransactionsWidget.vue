<script setup lang="ts">
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import { useI18n } from "vue-i18n";
import useAppCore from "~/composables/useAppCore";
import { onMounted, onBeforeUnmount, reactive, ref, watch, computed } from "vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();

const payments = reactive<any[]>([]);
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const searchInput = ref("");
const searchApplied = ref("");
let searchTimer: number | undefined;

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const sortByFilterData = computed(() => [
  { id: "created_at", value: "created_at", text: t("cabinet.dashboard.transactions.sort.createdAt") },
  { id: "amount", value: "amount", text: t("cabinet.dashboard.transactions.sort.amount") },
  { id: "currency", value: "currency", text: t("cabinet.dashboard.transactions.sort.currency") },
  { id: "status", value: "status", text: t("cabinet.dashboard.transactions.sort.status") },
  { id: "type", value: "type", text: t("cabinet.dashboard.transactions.sort.type") },
  { id: "account_number", value: "account_number", text: t("cabinet.dashboard.transactions.sort.accountNumber") },
]);

const orderBy = ref<string>("created_at");
const orderDirection = ref<"asc" | "desc">(ORDER_DIRECTION_DESC);

const page = ref(1);
const perPage = ref(5);
const total = ref(0);
const lastPage = ref(1);

const fromItem = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1));
const toItem = computed(() => (total.value === 0 ? 0 : Math.min(page.value * perPage.value, total.value)));

function buildPageList(current: number, totalPages: number, delta = 1): (number | string)[] {
  const range: number[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(totalPages - 1, current + delta);
  range.push(1);
  for (let i = left; i <= right; i++) range.push(i);
  if (totalPages > 1) range.push(totalPages);
  const pages: (number | string)[] = [];
  let prev: number | undefined;
  for (const n of range) {
    if (prev !== undefined) {
      if (n - prev === 2) pages.push(prev + 1);
      else if (n - prev > 2) pages.push("…");
    }
    pages.push(n);
    prev = n;
  }
  return pages;
}
const pageList = computed(() => buildPageList(page.value, lastPage.value, 1));

const amountClass = (payment: any) => {
  const type = String(payment?.type ?? "").toLowerCase();
  if (["withdraw", "виплата", "payout"].includes(type)) return "text-red-400";
  if (["deposit", "поповнення", "topup"].includes(type)) return "text-green-400";
  return "text-slate-100";
};

const loadPaymentsData = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const response = await appCore.payments.get({
      search: searchApplied.value,
      perPage: perPage.value,
      page: page.value,
      orderBy: orderBy.value,
      orderDirection: orderDirection.value
    });
    const payload = response?.data?.data;
    const rows = payload?.data ?? [];
    const meta = payload?.meta ?? payload;
    payments.splice(0, payments.length, ...rows);
    total.value = meta?.total ?? payload?.total ?? rows.length;
    lastPage.value = meta?.last_page ?? payload?.last_page ?? 1;
    page.value = meta?.current_page ?? page.value;
    perPage.value = meta?.per_page ?? perPage.value;
  } catch (e: any) {
    errorMsg.value = e?.message ?? t("cabinet.dashboard.transactions.errorLoad");
  } finally {
    isLoading.value = false;
  }
};

watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchApplied.value = val.trim();
    page.value = 1;
    loadPaymentsData();
  }, 400);
});

watch([orderBy, orderDirection], () => {
  page.value = 1;
  loadPaymentsData();
});

watch(perPage, () => {
  page.value = 1;
  loadPaymentsData();
});

const goToPage = (p: number) => {
  if (p < 1 || p > lastPage.value || p === page.value) return;
  page.value = p;
  loadPaymentsData();
};
const prevPage = () => goToPage(page.value - 1);
const nextPage = () => goToPage(page.value + 1);

const handleChangeFilterSortBy = async (value: string) => {
  if (orderBy.value === value) {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
  } else {
    orderBy.value = value;
  }
  page.value = 1;
  await loadPaymentsData();
};

onMounted(() => {
  loadPaymentsData();
});
onBeforeUnmount(() => {});
</script>

<style scoped>
.transaction-row {
  background: var(--color-stroke-ui-dark);
  border-bottom: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  padding: 14px;
  transition: opacity 0.2s ease;
}

.transaction-row:hover {
  opacity: 0.9;
}
</style>

<template>
  <PanelDefault>
    <div class="relative rounded-2xl">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between gap-3">
          <UiTextH5 class="!text-[var(--ui-text-main)]">{{ t("cabinet.dashboard.transactions.title") }}</UiTextH5>
          <NuxtLink to="/payments?openDeposit=1" class="shrink-0">
            <UiButtonDefault state="success">
              {{ t("cabinet.dashboard.actions.newDeposit") }}
            </UiButtonDefault>
          </NuxtLink>
        </div>

        <div class="relative">
          <div class="flex items-center justify-between gap-2">
            <div class="flex w-full items-center rounded-xl border border-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] px-3 py-2 md:w-96">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z"/>
              </svg>
              <input
                  v-model="searchInput"
                  type="text"
                  :placeholder="t('cabinet.dashboard.transactions.searchPlaceholder')"
                  class="w-full bg-transparent outline-none text-sm placeholder:text-slate-500"
              />
            </div>

            <UiSelect
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleChangeFilterSortBy"
            >
              <template #icon-left>
                <UiIconSortBy
                    class="mr-2 !w-[16px] !h-[16px]"
                    :orderDirectionEnabled="true"
                    :orderDirection="orderDirection"
                />
              </template>
            </UiSelect>

          </div>
        </div>
      </div>

      <div class="mt-2 relative">
        <div v-if="isLoading" class="p-6 flex items-center justify-center text-slate-300 absolute left-0 right-0 top-0 bottom-0"><UiIconSpinnerDefault /></div>
        <div v-if="errorMsg" class="p-6 text-center text-red-400">{{ errorMsg }}</div>
        <div v-else>
          <div v-if="payments && payments.length > 0" class="flex flex-col gap-[6px]">
            <div
              v-for="(payment, index) in payments"
              :key="payment.id || index"
              class="transaction-row"
            >
              <div class="hidden md:grid grid-cols-[1.2fr_1fr_0.8fr_1fr_1.1fr] items-center gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="min-w-0">
                  <div class="text-[11px] text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.transactions.accountNumber") }}
                  </div>
                    <div class="min-w-0 max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap font-medium" :title="payment.account_number">
                      {{ payment.account_number }}
                    </div>
                  </div>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize"
                    :class="{
                      'bg-green-500/10 text-green-400 ring-green-500/30': payment.status === 'success',
                      'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30': payment.status === 'pending',
                      'bg-red-500/10 text-red-400 ring-red-500/30': payment.status === 'failed'
                    }"
                  >
                    {{ payment.status }}
                  </span>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                  <div class="whitespace-nowrap font-semibold tabular-nums" :class="amountClass(payment)">
                    {{ payment.amount }}
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                  <div class="max-w-[80px] truncate whitespace-nowrap uppercase tracking-wide text-[var(--ui-text-main)]">
                    {{ payment.currency }}
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.type") }}</div>
                  <div class="max-w-[140px] truncate whitespace-nowrap capitalize" :title="payment.type">
                    {{ payment.type }}
                  </div>
                </div>
                <div class="min-w-0 text-right">
                  <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                  <div class="inline-block max-w-[220px] truncate whitespace-nowrap text-[var(--ui-text-main)] tabular-nums" :title="payment.created_at">
                    <UiTextSmall>{{ payment.created_at }}</UiTextSmall>
                  </div>
                </div>
              </div>

              <div class="md:hidden">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-[11px] text-[var(--ui-text-secondary)]">
                      {{ t("cabinet.dashboard.transactions.accountNumber") }}
                    </div>
                    <div class="max-w-[220px] truncate font-medium" :title="payment.account_number">{{ payment.account_number }}</div>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize"
                    :class="{
                      'bg-green-500/10 text-green-400 ring-green-500/30': payment.status === 'success',
                      'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30': payment.status === 'pending',
                      'bg-red-500/10 text-red-400 ring-red-500/30': payment.status === 'failed'
                    }"
                  >
                    {{ payment.status }}
                  </span>
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                    <div class="font-semibold tabular-nums" :class="amountClass(payment)">{{ payment.amount }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                    <div class="ml-auto max-w-[80px] truncate uppercase tracking-wide text-[var(--ui-text-main)]">{{ payment.currency }}</div>
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--color-stroke-ui-light)] pt-2">
                  <div>
                    <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.type") }}</div>
                    <div class="max-w-[140px] truncate capitalize" :title="payment.type">{{ payment.type }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[11px] text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                    <div class="ml-auto max-w-[220px] truncate tabular-nums text-[var(--ui-text-main)]" :title="payment.created_at">{{ payment.created_at }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="!isLoading"
            class="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-6 text-center text-[var(--ui-text-main)]"
          >
            <UiTextH5>{{ t("cabinet.dashboard.transactions.empty") }}</UiTextH5>
          </div>
        </div>

        <div v-if="total > 0" class="mt-5 flex flex-col md:flex-row items-center justify-between gap-3 px-1">
          <div class="order-2 md:order-1 flex items-center gap-2 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] px-3 py-2">
            <span class="text-xs text-[var(--ui-text-secondary)]">{{ t("cabinet.dashboard.transactions.show") }}</span>
            <select v-model="perPage" class="bg-transparent text-sm outline-none">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <div class="order-1 md:order-2 text-center text-xs text-[var(--ui-text-main)]">
            {{ t("cabinet.dashboard.transactions.shownRange", { from: fromItem, to: toItem, total }) }}
          </div>
          <div class="order-3 flex items-center gap-1">
            <button
                class="rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-2 text-[var(--ui-text-main)] transition hover:bg-[--color-stroke-ui-dark] disabled:opacity-40"
                :disabled="page <= 1"
                @click="goToPage(1)"
                :aria-label="t('cabinet.dashboard.transactions.firstPage')"
                :title="t('cabinet.dashboard.transactions.firstPage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L9.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>
                <path d="M9.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L5.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>
              </svg>
            </button>
            <button
                class="rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-2 text-[var(--ui-text-main)] transition hover:bg-[--color-stroke-ui-dark] disabled:opacity-40"
                :disabled="page <= 1"
                @click="prevPage"
                :aria-label="t('cabinet.dashboard.transactions.prevPage')"
                :title="t('cabinet.dashboard.transactions.prevPage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L8.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>
              </svg>
            </button>
            <template v-for="(p, i) in pageList" :key="i">
              <span v-if="p === '…'" class="px-2 py-2 text-slate-400 select-none">…</span>
              <button
                v-else
                class="h-9 min-w-[36px] rounded-lg border border-[var(--color-stroke-ui-light)] px-2 tabular-nums text-[var(--ui-text-main)] transition hover:bg-[--color-stroke-ui-dark]"
                :class="{'bg-[--color-stroke-ui-dark] text-white': p === page}"
                  @click="goToPage(p as number)"
                  :aria-current="p === page ? 'page' : undefined"
                  :title="`Сторінка ${p}`"
              >
                {{ p }}
              </button>
            </template>
            <button
                class="rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-2 text-[var(--ui-text-main)] transition hover:bg-[--color-stroke-ui-dark] disabled:opacity-40"
                :disabled="page >= lastPage"
                @click="nextPage"
                :aria-label="t('cabinet.dashboard.transactions.nextPage')"
                :title="t('cabinet.dashboard.transactions.nextPage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 4.293a1 1 0 0 1 1.414 0L13.707 9.293a1 1 0 0 1 0 1.414L8.707 15.707a1 1 0 0 1-1.414-1.414L10.586 10 7.293 6.707a1 1 0 0 1 0-1.414Z"/>
              </svg>
            </button>
            <button
                class="rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-2 text-[var(--ui-text-main)] transition hover:bg-[--color-stroke-ui-dark] disabled:opacity-40"
                :disabled="page >= lastPage"
                @click="goToPage(lastPage)"
                :aria-label="t('cabinet.dashboard.transactions.lastPage')"
                :title="t('cabinet.dashboard.transactions.lastPage')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L10.586 10 6.293 5.707a1 1 0 0 1 0-1.414Z"/>
                <path d="M10.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L14.586 10 10.293 5.707a1 1 0 0 1 0-1.414Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </PanelDefault>
</template>



<!--<script setup lang="ts">-->
<!--import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--import UiTextH5 from "~/components/ui/UiTextH5.vue";-->
<!--import {useI18n} from "vue-i18n";-->
<!--import useAppCore from "~/composables/useAppCore";-->
<!--import {onMounted, reactive, ref, watch, computed} from "vue";-->
<!--import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";-->
<!--import UiTextSmall from "~/components/ui/UiTextSmall.vue";-->

<!--const {t} = useI18n({useScope: "global"});-->
<!--const appCore = useAppCore();-->

<!--/** &#45;&#45;&#45;&#45; STATE &#45;&#45;&#45;&#45; */-->
<!--const payments = reactive<any[]>([]);-->
<!--const isLoading = ref(false);-->
<!--const errorMsg = ref<string | null>('ERROR MESSAGE');-->

<!--// Пошук (із дебаунсом)-->
<!--const searchInput = ref("");-->
<!--const searchApplied = ref("");-->
<!--let searchTimer: number | undefined;-->

<!--// Сортування-->
<!--type SortField =-->
<!--    | "created_at"-->
<!--    | "amount"-->
<!--    | "currency"-->
<!--    | "status"-->
<!--    | "type"-->
<!--    | "account_number";-->
<!--const sortField = ref<SortField>("created_at");-->
<!--const sortDirection = ref<"asc" | "desc">("desc");-->
<!--const sortFieldOptions: { label: string; value: SortField }[] = [-->
<!--  {label: "Створено", value: "created_at"},-->
<!--  {label: "Сума", value: "amount"},-->
<!--  {label: "Валюта", value: "currency"},-->
<!--  {label: "Статус", value: "status"},-->
<!--  {label: "Тип", value: "type"},-->
<!--  {label: "MT4 рахунок", value: "account_number"},-->
<!--];-->

<!--// Пагінація-->
<!--const page = ref(1);-->
<!--const perPage = ref(5);-->
<!--const total = ref(0);-->
<!--const lastPage = ref(1);-->

<!--/** &#45;&#45;&#45;&#45; HELPERS &#45;&#45;&#45;&#45; */-->
<!--const fromItem = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1));-->
<!--const toItem = computed(() => (total.value === 0 ? 0 : Math.min(page.value * perPage.value, total.value)));-->

<!--const mobileFiltersOpen = ref(false);-->
<!--const toggleMobileFilters = () => (mobileFiltersOpen.value = !mobileFiltersOpen.value);-->

<!--// Побудова списку сторінок із «…»-->
<!--function buildPageList(current: number, totalPages: number, delta = 1): (number | string)[] {-->
<!--  const range: number[] = [];-->
<!--  const left = Math.max(2, current - delta);-->
<!--  const right = Math.min(totalPages - 1, current + delta);-->

<!--  range.push(1);-->
<!--  for (let i = left; i <= right; i++) range.push(i);-->
<!--  if (totalPages > 1) range.push(totalPages);-->

<!--  const pages: (number | string)[] = [];-->
<!--  let prev: number | undefined;-->
<!--  for (const n of range) {-->
<!--    if (prev !== undefined) {-->
<!--      if (n - prev === 2) pages.push(prev + 1);-->
<!--      else if (n - prev > 2) pages.push("…");-->
<!--    }-->
<!--    pages.push(n);-->
<!--    prev = n;-->
<!--  }-->
<!--  return pages;-->
<!--}-->

<!--const pageList = computed(() => buildPageList(page.value, lastPage.value, 1));-->

<!--const amountClass = (payment: any) => {-->
<!--  // Налаштуй під свої значення типів:-->
<!--  // 'deposit' | 'поповнення' => зелений; 'withdraw' | 'виплата' => червоний-->
<!--  const type = String(payment?.type ?? "").toLowerCase();-->
<!--  if (["withdraw", "виплата", "payout"].includes(type)) {-->
<!--    return "text-red-400";-->
<!--  }-->
<!--  if (["deposit", "поповнення", "topup"].includes(type)) {-->
<!--    return "text-green-400";-->
<!--  }-->
<!--  return "text-slate-100";-->
<!--};-->

<!--/** &#45;&#45;&#45;&#45; API CALL &#45;&#45;&#45;&#45; */-->
<!--const loadPaymentsData = async () => {-->
<!--  isLoading.value = true;-->
<!--  errorMsg.value = null;-->
<!--  try {-->
<!--    const response = await appCore.payments.get({-->
<!--      search: searchApplied.value,-->
<!--      perPage: perPage.value,-->
<!--      page: page.value,-->
<!--      orderBy: sortField.value,        // ← контролер очікує ці назви-->
<!--      orderDirection: sortDirection.value,-->
<!--    });-->

<!--    const payload = response?.data?.data;-->
<!--    const rows = payload?.data ?? [];-->
<!--    const meta = payload?.meta ?? payload;-->

<!--    payments.splice(0, payments.length, ...rows);-->

<!--    total.value = meta?.total ?? payload?.total ?? rows.length;-->
<!--    lastPage.value = meta?.last_page ?? payload?.last_page ?? 1;-->
<!--    page.value = meta?.current_page ?? page.value;-->
<!--    perPage.value = meta?.per_page ?? perPage.value;-->
<!--  } catch (e: any) {-->
<!--    errorMsg.value = e?.message ?? "Не вдалося завантажити платежі";-->
<!--  } finally {-->
<!--    isLoading.value = false;-->
<!--  }-->
<!--};-->

<!--/** &#45;&#45;&#45;&#45; WATCHERS &#45;&#45;&#45;&#45; */-->
<!--watch(searchInput, (val) => {-->
<!--  clearTimeout(searchTimer);-->
<!--  searchTimer = window.setTimeout(() => {-->
<!--    searchApplied.value = val.trim();-->
<!--    page.value = 1;-->
<!--    loadPaymentsData();-->
<!--  }, 400);-->
<!--});-->

<!--watch([sortField, sortDirection], () => {-->
<!--  page.value = 1;-->
<!--  loadPaymentsData();-->
<!--});-->

<!--watch(perPage, () => {-->
<!--  page.value = 1;-->
<!--  loadPaymentsData();-->
<!--});-->

<!--/** &#45;&#45;&#45;&#45; ACTIONS &#45;&#45;&#45;&#45; */-->
<!--const goToPage = (p: number) => {-->
<!--  if (p < 1 || p > lastPage.value || p === page.value) return;-->
<!--  page.value = p;-->
<!--  loadPaymentsData();-->
<!--};-->

<!--const prevPage = () => goToPage(page.value - 1);-->
<!--const nextPage = () => goToPage(page.value + 1);-->

<!--onMounted(() => {-->
<!--  loadPaymentsData();-->
<!--});-->
<!--</script>-->

<!--<template>-->
<!--  <PanelDefault>-->
<!--    <div class="card p-4">-->
<!--      &lt;!&ndash; HEADER &ndash;&gt;-->
<!--      <div class="card__actions flex flex-col gap-3">-->
<!--        <div class="flex flex-col gap-3">-->

<!--          &lt;!&ndash; Рядок: заголовок + основні дії &ndash;&gt;-->
<!--          <div class="flex items-center justify-between gap-3">-->
<!--            <UiTextH5 class="!text-[var(&#45;&#45;ui-text-main)]">Deposit</UiTextH5>-->

<!--            <div class="flex items-center gap-2">-->
<!--              &lt;!&ndash; Тільки мобільний перемикач фільтрів &ndash;&gt;-->
<!--              <button-->
<!--                  class="md:hidden inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm"-->
<!--                  @click="toggleMobileFilters"-->
<!--                  :aria-expanded="mobileFiltersOpen"-->
<!--              >-->
<!--                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 opacity-80" viewBox="0 0 20 20" fill="currentColor">-->
<!--                  <path d="M3 5h14a1 1 0 0 1 .8 1.6l-4.2 5.6v3.3a1 1 0 0 1-1.45.9l-3-1.5a1 1 0 0 1-.55-.9v-1.8L2.2 6.6A1 1 0 0 1 3 5Z"/>-->
<!--                </svg>-->
<!--                Фільтри-->
<!--              </button>-->

<!--              <NuxtLink to="/payments/create" class="shrink-0">-->
<!--                <UiButtonDefault state="success">-->
<!--                  {{ t("cabinet.dashboard.actions.newDeposit") }}-->
<!--                </UiButtonDefault>-->
<!--              </NuxtLink>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Пошук: завжди під шапкою, повна ширина &ndash;&gt;-->
<!--          <div class="flex items-center rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 w-full md:w-80">-->
<!--            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"-->
<!--                    d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z"/>-->
<!--            </svg>-->
<!--            <input-->
<!--                v-model="searchInput"-->
<!--                type="text"-->
<!--                placeholder="Пошук платежів…"-->
<!--                class="w-full bg-transparent outline-none text-sm placeholder:text-slate-500"-->
<!--            />-->
<!--          </div>-->

<!--          &lt;!&ndash; Сортування:-->
<!--               - мобільно: колапс-панель під перемикачем-->
<!--               - desktop: інлайн блок праворуч від пошуку (через md:flex) &ndash;&gt;-->
<!--          <div class="md:flex md:items-center md:justify-between">-->
<!--            &lt;!&ndash; пустий заповнювач щоб на md+ пошук і сортування могли розійтися по краях &ndash;&gt;-->
<!--            <div class="hidden md:block"></div>-->

<!--            &lt;!&ndash; Desktop controls &ndash;&gt;-->
<!--            <div class="hidden md:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2">-->
<!--              <span class="text-xs text-slate-400">Сортувати:</span>-->
<!--              <select v-model="sortField" class="bg-transparent text-sm outline-none">-->
<!--                <option v-for="o in sortFieldOptions" :key="o.value" :value="o.value">{{ o.label }}</option>-->
<!--              </select>-->
<!--              <select v-model="sortDirection" class="bg-transparent text-sm outline-none">-->
<!--                <option value="asc">Зрост.</option>-->
<!--                <option value="desc">Спад.</option>-->
<!--              </select>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Mobile filters collapse &ndash;&gt;-->
<!--          <transition name="fade" mode="out-in">-->
<!--            <div-->
<!--                v-if="mobileFiltersOpen"-->
<!--                class="md:hidden rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-3 flex flex-col sm:flex-row gap-3"-->
<!--            >-->
<!--              <div class="flex items-center gap-2">-->
<!--                <span class="text-xs text-slate-400">Поле:</span>-->
<!--                <select v-model="sortField" class="bg-transparent text-sm outline-none border border-slate-700 rounded-md px-2 py-1">-->
<!--                  <option v-for="o in sortFieldOptions" :key="o.value" :value="o.value">{{ o.label }}</option>-->
<!--                </select>-->
<!--              </div>-->
<!--              <div class="flex items-center gap-2">-->
<!--                <span class="text-xs text-slate-400">Напрям:</span>-->
<!--                <select v-model="sortDirection" class="bg-transparent text-sm outline-none border border-slate-700 rounded-md px-2 py-1">-->
<!--                  <option value="asc">Зрост.</option>-->
<!--                  <option value="desc">Спад.</option>-->
<!--                </select>-->
<!--              </div>-->
<!--            </div>-->
<!--          </transition>-->
<!--        </div>-->

<!--      </div>-->

<!--      &lt;!&ndash; BODY: список повнорозмірних карток &ndash;&gt;-->
<!--      <div class="mt-2">-->
<!--        &lt;!&ndash; Loading / Error &ndash;&gt;-->
<!--&lt;!&ndash;        <div v-if="isLoading" class="p-6 text-center text-slate-300">Завантаження…</div>&ndash;&gt;-->
<!--&lt;!&ndash;        <div v-else-if="errorMsg" class="p-6 text-center text-red-400">{{ errorMsg }}</div>&ndash;&gt;-->

<!--        <div v-if="errorMsg" class="p-6 text-center text-red-400">{{ errorMsg }}</div>-->

<!--        <div v-else>-->
<!--          <div v-if="payments && payments.length > 0" class="flex flex-col gap-3">-->
<!--            &lt;!&ndash; Картка = весь ряд &ndash;&gt;-->
<!--            <div-->
<!--                v-for="(payment, index) in payments"-->
<!--                :key="payment.id || index"-->
<!--                class="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 hover:bg-slate-900 transition p-4"-->
<!--            >-->
<!--              &lt;!&ndash; DESKTOP: однакова сітка колонок у всіх картках &ndash;&gt;-->
<!--              <div class="hidden md:grid grid-cols-12 gap-0 items-stretch">-->
<!--                &lt;!&ndash; 1) Рахунок + статус (4/12) &ndash;&gt;-->
<!--                <div class="col-span-4 pr-3 flex items-center gap-3 min-w-0">-->
<!--                  <div class="min-w-0">-->
<!--                    <div class="text-[11px] text-slate-400">MT4 рахунок</div>-->
<!--                    <div class="truncate font-medium" :title="payment.account_number">-->
<!--                      {{ payment.account_number }}-->
<!--                    </div>-->
<!--                  </div>-->
<!--                  <span-->
<!--                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize shrink-0"-->
<!--                      :class="{-->
<!--                      'bg-green-500/10 text-green-400 ring-green-500/30': payment.status === 'success',-->
<!--                      'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30': payment.status === 'pending',-->
<!--                      'bg-red-500/10 text-red-400 ring-red-500/30': payment.status === 'failed'-->
<!--                    }"-->
<!--                  >-->
<!--                    {{ payment.status }}-->
<!--                  </span>-->
<!--                </div>-->

<!--                &lt;!&ndash; 2) Сума (2/12) &ndash;&gt;-->
<!--                <div class="col-span-2 px-3 border-l border-slate-800">-->
<!--                  <div class="text-[11px] text-slate-400">Сума</div>-->
<!--                  <div class="font-semibold tabular-nums whitespace-nowrap" :class="amountClass(payment)">-->
<!--                    {{ payment.amount }}-->
<!--                  </div>-->
<!--                </div>-->

<!--                &lt;!&ndash; 3) Валюта (1/12) &ndash;&gt;-->
<!--                <div class="col-span-1 px-3 border-l border-slate-800">-->
<!--                  <div class="text-[11px] text-slate-400">Валюта</div>-->
<!--                  <div class="uppercase tracking-wide text-slate-300 whitespace-nowrap">-->
<!--                    {{ payment.currency }}-->
<!--                  </div>-->
<!--                </div>-->

<!--                &lt;!&ndash; 4) Тип (2/12) &ndash;&gt;-->
<!--                <div class="col-span-2 px-3 border-l border-slate-800">-->
<!--                  <div class="text-[11px] text-slate-400">Тип</div>-->
<!--                  <div class="capitalize whitespace-nowrap">{{ payment.type }}</div>-->
<!--                </div>-->

<!--                &lt;!&ndash; 5) Створено (3/12) &ndash;&gt;-->
<!--                <div class="col-span-3 px-3 border-l border-slate-800 text-right">-->
<!--                  <div class="text-[11px] text-slate-400">Створено</div>-->
<!--                  <div class="text-slate-300 tabular-nums whitespace-nowrap">-->
<!--                    <UiTextSmall>{{ payment.created_at }}</UiTextSmall>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->


<!--              &lt;!&ndash; MOBILE/TABLET: вертикальна компоновка (як було) &ndash;&gt;-->
<!--              <div class="md:hidden">-->
<!--                &lt;!&ndash; Верхній ряд: Рахунок + Статус &ndash;&gt;-->
<!--                <div class="flex items-start justify-between gap-2">-->
<!--                  <div class="min-w-0">-->
<!--                    <div class="text-[11px] text-slate-400">MT4 рахунок</div>-->
<!--                    <div class="truncate font-medium" :title="payment.account_number">{{ payment.account_number }}</div>-->
<!--                  </div>-->
<!--                  <span-->
<!--                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize"-->
<!--                      :class="{-->
<!--                          'bg-green-500/10 text-green-400 ring-green-500/30': payment.status === 'success',-->
<!--                          'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30': payment.status === 'pending',-->
<!--                          'bg-red-500/10 text-red-400 ring-red-500/30': payment.status === 'failed'-->
<!--                        }"-->
<!--                      >-->
<!--                        {{ payment.status }}-->
<!--                      </span>-->
<!--                </div>-->

<!--                &lt;!&ndash; Сума + Валюта &ndash;&gt;-->
<!--                <div class="mt-3 flex items-center justify-between gap-2">-->
<!--                  <div>-->
<!--                    <div class="text-[11px] text-slate-400">Сума</div>-->
<!--                    <div class="font-semibold tabular-nums" :class="amountClass(payment)">{{ payment.amount }}</div>-->
<!--                  </div>-->
<!--                  <div class="text-right">-->
<!--                    <div class="text-[11px] text-slate-400">Валюта</div>-->
<!--                    <div class="uppercase tracking-wide text-slate-300">{{ payment.currency }}</div>-->
<!--                  </div>-->
<!--                </div>-->

<!--                &lt;!&ndash; Тип + Дата &ndash;&gt;-->
<!--                <div class="mt-3 grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">-->
<!--                  <div>-->
<!--                    <div class="text-[11px] text-slate-400">Тип</div>-->
<!--                    <div class="capitalize">{{ payment.type }}</div>-->
<!--                  </div>-->
<!--                  <div class="text-right">-->
<!--                    <div class="text-[11px] text-slate-400">Створено</div>-->
<!--                    <div class="text-slate-300 tabular-nums">{{ payment.created_at }}</div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; empty state &ndash;&gt;-->
<!--          <div v-else class="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/40 p-6 text-center text-slate-300 flex items-center justify-center flex-col gap-2">-->
<!--            <UiTextH5>Записів поки немає.</UiTextH5>-->
<!--            <UiIconSpinnerDefault />-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; FOOTER: пагінація &ndash;&gt;-->
<!--        <div v-if="total > 0" class="mt-5 flex flex-col md:flex-row items-center justify-between gap-3 px-1">-->
<!--          &lt;!&ndash; Ліва частина: скільки показувати &ndash;&gt;-->
<!--          <div class="order-2 md:order-1 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2">-->
<!--            <span class="text-xs text-slate-400">Показати</span>-->
<!--            <select v-model="perPage" class="bg-transparent text-sm outline-none">-->
<!--              <option :value="5">5</option>-->
<!--              <option :value="10">10</option>-->
<!--              <option :value="20">20</option>-->
<!--              <option :value="50">50</option>-->
<!--            </select>-->
<!--          </div>-->

<!--          &lt;!&ndash; Середина: діапазон &ndash;&gt;-->
<!--          <div class="order-1 md:order-2 text-xs text-center text-[var(&#45;&#45;ui-text-main)]">-->
<!--            Показано {{ fromItem }}–{{ toItem }} з {{ total }}-->
<!--          </div>-->

<!--          &lt;!&ndash; Права частина: керування сторінками &ndash;&gt;-->
<!--          <div class="order-3 flex items-center gap-1">-->
<!--            &lt;!&ndash; До першої &ndash;&gt;-->
<!--            <button-->
<!--                class="px-2 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/60 disabled:opacity-40 text-[var(&#45;&#45;ui-text-main)]"-->
<!--                :disabled="page <= 1"-->
<!--                @click="goToPage(1)"-->
<!--                aria-label="Перша сторінка"-->
<!--                title="Перша"-->
<!--            >-->
<!--              &lt;!&ndash; «⟪» &ndash;&gt;-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">-->
<!--                <path d="M13.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L9.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>-->
<!--                <path d="M9.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L5.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>-->
<!--              </svg>-->

<!--            </button>-->

<!--            &lt;!&ndash; Попередня &ndash;&gt;-->
<!--            <button-->
<!--                class="px-2 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/60 disabled:opacity-40 text-[var(&#45;&#45;ui-text-main)]"-->
<!--                :disabled="page <= 1"-->
<!--                @click="prevPage"-->
<!--                aria-label="Попередня сторінка"-->
<!--                title="Попередня"-->
<!--            >-->
<!--              &lt;!&ndash; «←» &ndash;&gt;-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">-->
<!--                <path d="M12.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L8.414 10l4.293 4.293a1 1 0 0 1 0 1.414Z"/>-->
<!--              </svg>-->
<!--            </button>-->

<!--            &lt;!&ndash; Номери сторінок з «…» &ndash;&gt;-->
<!--            <template v-for="(p, i) in pageList" :key="i">-->
<!--              <span v-if="p === '…'" class="px-2 py-2 text-slate-400 select-none">…</span>-->

<!--              <button-->
<!--                  v-else-->
<!--                  class="min-w-[36px] h-9 px-2 rounded-lg border border-slate-700 hover:bg-slate-800/60 tabular-nums text-[var(&#45;&#45;ui-text-main)]"-->
<!--                  :class="{'bg-slate-800 text-white': p === page}"-->
<!--                  @click="goToPage(p as number)"-->
<!--                  :aria-current="p === page ? 'page' : undefined"-->
<!--                  :title="`Сторінка ${p}`"-->
<!--              >-->
<!--                {{ p }}-->
<!--              </button>-->
<!--            </template>-->

<!--            &lt;!&ndash; Наступна &ndash;&gt;-->
<!--            <button-->
<!--                class="px-2 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/60 disabled:opacity-40 text-[var(&#45;&#45;ui-text-main)]"-->
<!--                :disabled="page >= lastPage"-->
<!--                @click="nextPage"-->
<!--                aria-label="Наступна сторінка"-->
<!--                title="Наступна"-->
<!--            >-->
<!--              &lt;!&ndash; «→» &ndash;&gt;-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">-->
<!--                <path d="M7.293 4.293a1 1 0 0 1 1.414 0L13.707 9.293a1 1 0 0 1 0 1.414L8.707 15.707a1 1 0 0 1-1.414-1.414L10.586 10 7.293 6.707a1 1 0 0 1 0-1.414Z"/>-->
<!--              </svg>-->
<!--            </button>-->

<!--            &lt;!&ndash; До останньої &ndash;&gt;-->
<!--            <button-->
<!--                class="px-2 py-2 rounded-lg border border-slate-700 hover:bg-slate-800/60 disabled:opacity-40 text-[var(&#45;&#45;ui-text-main)]"-->
<!--                :disabled="page >= lastPage"-->
<!--                @click="goToPage(lastPage)"-->
<!--                aria-label="Остання сторінка"-->
<!--                title="Остання"-->
<!--            >-->
<!--              &lt;!&ndash; «⟫» &ndash;&gt;-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">-->
<!--                <path d="M6.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L10.586 10 6.293 5.707a1 1 0 0 1 0-1.414Z"/>-->
<!--                <path d="M10.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L14.586 10 10.293 5.707a1 1 0 0 1 0-1.414Z"/>-->
<!--              </svg>-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->

<!--      </div>-->

<!--    </div>-->
<!--  </PanelDefault>-->
<!--</template>-->
