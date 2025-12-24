<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ t('cabinet.billing.title') }}
      </UiTextH4>

      <UiButtonDefault
          state="success--outline"
          class="w-full md:w-auto"
          @click="handleClickCreateNewDeposit"
      >
        {{ t('cabinet.billing.create') }}
      </UiButtonDefault>
    </template>

    <template #content>
      <PageStructureContent v-if="!isInitialLoading" :plain="viewMode !== 'table'">
        <template #top>
          <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
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

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickUpdate"
              >
                <UiIconUpdate :spinning="isLoading" />
              </UiButtonDefault>
            </div>

            <div class="flex w-full flex-1 items-center gap-2 md:w-auto md:flex-none md:justify-end">
              <UiSelect
                class="min-w-[180px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleOrderByAndDirection"
              >
                <template #icon-left>
                  <UiIconSortBy class="!h-4 !w-4" :orderDirectionEnabled="true" :orderDirection="orderDirection" />
                </template>
              </UiSelect>

              <ViewModeToggle
                class="w-full sm:w-auto"
                bordered
                :modelValue="viewMode"
                :options="viewOptions"
                @update:modelValue="viewMode = $event"
              />
            </div>
          </div>
        </template>

        <template #content>
          <TableMain v-if="viewMode === 'table'">
            <template #thead>
              <tr>
                <th class="px-4 py-1 text-left font-normal w-[60px]">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer"
                        @click="handleOrderByAndDirection('id')"
                    >
                      {{ t('cabinet.billing.columns.id') }}
                    </span>
                    <UiIconSort
                        :active="orderBy === 'id'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('id')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer truncate max-w-[90px]"
                        title="Номер счёта"
                        @click="handleOrderByAndDirection('account_number')"
                    >
                      № счёта
                    </span>
                    <UiIconSort
                        :active="orderBy === 'account_number'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('account_number')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer truncate max-w-[90px]"
                        title="Платёжная система"
                        @click="handleOrderByAndDirection('payment_system')"
                    >
                      ПС
                    </span>
                    <UiIconSort
                        :active="orderBy === 'payment_system'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('payment_system')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer"
                        @click="handleOrderByAndDirection('currency')"
                    >
                      {{ t('cabinet.billing.columns.currency') }}
                    </span>
                    <UiIconSort
                        :active="orderBy === 'currency'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('currency')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer"
                        @click="handleOrderByAndDirection('amount')"
                    >
                      {{ t('cabinet.billing.columns.amount') }}
                    </span>
                    <UiIconSort
                        :active="orderBy === 'amount'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('amount')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer"
                        @click="handleOrderByAndDirection('status')"
                    >
                      {{ t('cabinet.billing.columns.status') }}
                    </span>
                    <UiIconSort
                        :active="orderBy === 'status'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('status')"
                    />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                        class="mr-2.5 cursor-pointer truncate max-w-[160px]"
                        @click="handleOrderByAndDirection('created_at')"
                    >
                      {{ t('cabinet.billing.columns.createdAt') }}
                    </span>
                    <UiIconSort
                        :active="orderBy === 'created_at'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('created_at')"
                    />
                  </div>
                </th>
              </tr>
            </template>

            <template #tbody>
              <div
                  class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10"
                  v-if="isLoading && !isInitialLoading"
              >
                <UiIconSpinnerDefault/>
              </div>

              <template v-if="payments.length">
                <tr
                    v-for="payment in payments"
                    :key="payment.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
                >
                  <td class="px-2 py-3 font-bold flex justify-center items-center">
                    <button class="cursor-pointer" aria-label="Copy id">
                      <UiIconCopy :text="payment.id"/>
                    </button>
                  </td>

                  <td class="px-4 py-3 truncate max-w-[220px]" :title="payment.account_number">
                    <strong>{{ payment?.account_number }}</strong>
                  </td>

                  <td
                      class="px-4 py-3 truncate max-w-[170px]"
                      :title="payment.payment_system_name"
                  >
                    <span>{{ payment.payment_system_name || "-" }}</span>
                  </td>

                  <td class="px-4 py-3 truncate text-xs text-[var(--ui-primary-main)]">
                    {{ payment.currency }}
                  </td>

                  <td
                      class="px-4 py-3 font-bold whitespace-nowrap"
                      :class="true ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
                  >
                    <span>$</span> <span>{{ payment.amount }}</span>
                  </td>

                  <td
                      class="px-4 py-3 capitalize whitespace-nowrap"
                      :class="statusClass(payment.status)"
                  >
                    <UiBadge state="small">{{ payment.status }}</UiBadge>
                  </td>

                  <td class="px-4 py-3 text-xs whitespace-nowrap">
                    {{ new Date(payment.created_at).toLocaleString() }}
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
              <UiIconSpinnerDefault/>
            </div>

            <div
                class="grid gap-2"
                :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'"
            >
              <div
                  v-for="payment in payments"
                  :key="payment.id"
                  class="payment-card card-with-copy"
                  :class="viewMode === 'full' ? 'payment-card--full' : ''"
              >
                <button
                    class="copy-btn"
                    aria-label="Copy id"
                >
                  <UiIconCopy :text="payment.id" />
                </button>

                <div class="payment-card__body" :class="viewMode === 'full' ? 'payment-card__body--row' : ''">
                  <div class="min-w-[140px]">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">
                      {{ t('cabinet.billing.columns.accountNumber') }}
                    </UiTextSmall>
                    <div class="truncate font-semibold">{{ payment.account_number }}</div>
                  </div>
                  <div class="min-w-[120px]">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">
                      {{ t('cabinet.billing.columns.paymentSystem') }}
                    </UiTextSmall>
                    <div class="truncate">{{ payment.payment_system_name || "-" }}</div>
                  </div>
                  <div class="min-w-[100px]">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">
                      {{ t('cabinet.billing.columns.currency') }}
                    </UiTextSmall>
                    <div class="font-semibold">{{ payment.currency }}</div>
                  </div>
                  <div class="min-w-[120px]">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">
                      {{ t('cabinet.billing.columns.amount') }}
                    </UiTextSmall>
                    <div class="font-semibold text-[var(--color-success)]">${{ payment.amount }}</div>
                  </div>
                  <div class="flex min-w-[140px] items-center gap-2">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">
                      {{ t('cabinet.billing.columns.status') }}
                    </UiTextSmall>
                    <UiBadge state="small" class="capitalize">{{ payment.status }}</UiBadge>
                  </div>
                  <div class="min-w-[140px]">
                    <UiTextSmall class="text-[var(--ui-text-secondary)]">{{
                        t('cabinet.billing.columns.createdAt')
                      }}
                    </UiTextSmall>
                    <div class="footer-item__value">{{ new Date(payment.created_at).toLocaleString() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PageStructureContent>

      <template v-if="isInitialLoading">
        <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
          <UiIconLogo class="mb-4 h-[44px] w-[44px]"/>
          <UiIconSpinnerDefault class="h-[44px] w-[44px]"/>
        </div>
      </template>

      <template v-if="!isInitialLoading && payments.length === 0">
        <div class="h-[40vh] flex items-center justify-center">
                <span v-if="!isLoading" class="text-[var(--ui-text-main)]">
                  {{ t('cabinet.billing.nothingToShow') }}
                </span>
          <UiIconSpinnerDefault v-else/>
        </div>
      </template>

      <PaginationMain
          v-if="!isInitialLoading && payments.length > 0"
          class="px-5 py-2"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="total"
          :per-page="perPage"
          :visible-pages="visiblePages"
          :per-page-options="[1,2,3,4,5,6,7,8,9,10,15,20,25,50,100]"
          @go-prev="goPrev"
          @go-next="goNext"
          @set-page="setPage"
          @set-per-page="handleSetPerPage"
      />

    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import CreateNewDeposit from '~/pages/payments/create/index.vue'
import PageStructureContent from '~/components/block/pages/PageStructureContent.vue'
import PageStructureDefault from '~/components/block/pages/PageStructureDefault.vue'
import PaginationMain from '~/components/block/paginations/PaginationMain.vue'
import TableMain from '~/components/block/tables/TableMain.vue'
import UiButtonDefault from '~/components/ui/UiButtonDefault.vue'
import UiIconCopy from '~/components/ui/UiIconCopy.vue'
import UiIconSearch from '~/components/ui/UiIconSearch.vue'
import UiIconSort from '~/components/ui/UiIconSort.vue'
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconConfirm from "~/components/ui/UiIconConfirm.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import UiIconUpdate from '~/components/ui/UiIconUpdate.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
import useAppCore from '~/composables/useAppCore'
import useEventBus from "~/composables/useEventBus";

import {definePageMeta} from '~/.nuxt/imports'
import {useI18n} from 'vue-i18n'
import {computed, h, inject, onMounted, reactive, ref, watch, nextTick} from 'vue'
import UiBadge from "~/components/ui/UiBadge.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import { useRoute, useRouter } from "vue-router";

definePageMeta({
  layout: 'cabinet',
  middleware: ['auth-client', 'client-check-auth'],
})

const {t} = useI18n({useScope: 'global'})
const {openModal} = inject("modalControl") as { openModal: Function };
const route = useRoute();
const router = useRouter();

const appCore = useAppCore()

const ORDER_DIRECTION_ASC = 'asc'
const ORDER_DIRECTION_DESC = 'desc'
const VIEW_MODE_STORAGE_KEY = 'paymentsViewMode'

const search = ref('')
const total = ref(0)
const perPage = ref(6)
const currentPage = ref(1)
const orderBy = ref<string>('created_at')
const orderDirection = ref<string>(ORDER_DIRECTION_DESC)
const isLoading = ref(false)
const isInitialLoading = ref(true)
const viewMode = ref<'table' | 'cards' | 'full'>('table')
const sortByFilterData = reactive([
  {id: 'created_at', value: 'created_at', text: 'Created at'},
  {id: 'amount', value: 'amount', text: 'Amount'},
  {id: 'status', value: 'status', text: 'Status'},
  {id: 'payment_system', value: 'payment_system', text: 'Payment system'},
])
const viewOptions = [
  {
    value: 'table' as const,
    label: t('cabinet.billing.view.list') || 'Список',
    icon: {
      render() {
        return h('svg',
            {
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            },
            [
              h('line', {x1: '8', y1: '6', x2: '21', y2: '6'}),
              h('line', {x1: '3', y1: '6', x2: '4', y2: '6'}),
              h('line', {x1: '8', y1: '12', x2: '21', y2: '12'}),
              h('line', {x1: '3', y1: '12', x2: '4', y2: '12'}),
              h('line', {x1: '8', y1: '18', x2: '21', y2: '18'}),
              h('line', {x1: '3', y1: '18', x2: '4', y2: '18'}),
            ]);
      },
    },
  },
  {
    value: 'cards' as const,
    label: t('cabinet.billing.view.cards') || 'Картки',
    icon: {
      render() {
        return h('svg',
            {
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            },
            [
              h('rect', {x: '3', y: '3', width: '7', height: '7', rx: '1'}),
              h('rect', {x: '14', y: '3', width: '7', height: '7', rx: '1'}),
              h('rect', {x: '3', y: '14', width: '7', height: '7', rx: '1'}),
              h('rect', {x: '14', y: '14', width: '7', height: '7', rx: '1'}),
            ]);
      },
    },
  },
  {
    value: 'full' as const,
    label: t('cabinet.billing.view.full') || 'На всю ширину',
    icon: {
      render() {
        return h('svg',
            {
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            },
            [
              h('rect', {x: '3', y: '6', width: '18', height: '4', rx: '1'}),
              h('rect', {x: '3', y: '14', width: '18', height: '4', rx: '1'}),
            ]);
      },
    },
  },
]

const payments = reactive<any[]>([])
const spinIcon = ref(false)

const totalPages = computed(() => Math.ceil(total.value / perPage.value))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxPagesToShow = 5
  const half = Math.floor(maxPagesToShow / 2)
  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + maxPagesToShow - 1)
  if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function setPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await loadData()
  }
}

async function goPrev() {
  if (currentPage.value > 1) {
    currentPage.value--
    await loadData()
  }
}

async function goNext() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await loadData()
  }
}

const statusClass = (status?: string) => {
  const s = (status ?? '').trim().toLowerCase()

  const map: Record<string, string> = {
    pending: 'text-yellow-500',
    processing: 'text-blue-500',
    failed: 'text-red-600',
    rejected: 'text-rose-600',
    approved: 'text-emerald-600',
    success: 'text-green-600',
    successful: 'text-green-600',
  }

  return map[s] ?? 'text-[var(--ui-text-main)]'
}

const handleIconClick = (id: string) => {
  const payment = payments.find((x) => x.id === id)
  if (payment) payment.isSpinning = true
}

const onIconAnimationEnd = () => {
  spinIcon.value = false
}

const handleInputSearch = async (value: any) => {
  search.value = value
  currentPage.value = 1
  await loadData()
}

const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC
  orderBy.value = value
  await loadData()
}

const loadData = async () => {
  isLoading.value = true
  const response = await appCore.payments.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  })

  perPage.value = response.data.data.per_page
  currentPage.value = response.data.data.current_page
  total.value = response.data.data.total

  const paymentsData = response.data.data.data.map((x: any) => {
    x.isSpinning = false
    return x
  })

  payments.splice(0, payments.length, ...paymentsData)
  isLoading.value = false
  isInitialLoading.value = false
}

const shortId = (uuid: string) => uuid.split('-').pop()

const copyToClipboard = (paymentId: string) => {
  const id = shortId(paymentId)
  if (id) navigator.clipboard.writeText(id)
}

const handleClickCreateNewDeposit = async () => {
  openModal(CreateNewDeposit, {
    title: t("cabinet.accounts.accounts-form.title"),
  });
}

const handleClickUpdate = async () => {
  await loadData()
}

const handleSetPerPage = async (value: number) => {
  perPage.value = value
  currentPage.value = 1
  await loadData()
}

const initViewMode = () => {
  if (typeof window === 'undefined') return
  const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  if (saved && ['table', 'cards', 'full'].includes(saved)) {
    viewMode.value = saved as typeof viewMode.value
  }
}

watch(viewMode, mode => {
  if (typeof window === 'undefined') return
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode)
})

onMounted(async () => {
  initViewMode()
  useEventBus.on("loadDataForPayments", loadData);
  await loadData()
  await nextTick();
  const openDeposit = route.query?.openDeposit;
  if (openDeposit === "1" || openDeposit === "true" || openDeposit === "yes") {
    handleClickCreateNewDeposit();
  }
})
</script>

<style scoped>
@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-1px);
  }
  40% {
    transform: translateX(1px);
  }
  60% {
    transform: translateX(-1px);
  }
  80% {
    transform: translateX(1px);
  }
  100% {
    transform: translateX(0);
  }
}

.payment-card {
  position: relative;
  background: var(--ui-background-panel);
  border-bottom: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  padding: 10px 14px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.payment-card--full {
  padding: 8px 40px 8px 14px;
}

.payment-card:hover {
  opacity: 0.6;
}

.payment-card__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 0;
  color: var(--ui-text-main);
}

.payment-card__body > div {
  flex: 1 1 140px;
}

.payment-card__footer {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px 12px;
  margin-top: 4px;
}

.footer-item {
  min-width: 120px;
  flex: 1 1 0;
}

.footer-item__value {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .payment-card__body {
    gap: 8px 12px;
  }
}

.payment-card__body--row {
  flex-wrap: nowrap;
  gap: 6px 12px;
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .payment-card__body--row {
    flex-wrap: wrap;
  }
}

.card-with-copy {
  padding-right: 36px;
}

.card-with-copy .copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  border-radius: 8px;
  color: var(--ui-text-secondary);
  background: transparent;
  border: none;
  transition: color 0.2s ease, transform 0.15s ease;
}

.card-with-copy .copy-btn:hover {
  color: var(--ui-text-main);
  transform: translateY(-1px);
}
</style>
