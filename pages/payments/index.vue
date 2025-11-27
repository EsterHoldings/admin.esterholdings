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
      <PageStructureContent>
        <template #top>
          <div class="relative w-full md:w-[420px]">
            <UiInput
                class="w-full"
                @input="handleInputSearch"
                :value="search"
                :placeholder="t('cabinet.accounts.search')"
            >
              <template #icon-left>
                <UiIconSearch/>
              </template>
            </UiInput>
          </div>

          <UiButtonDefault state="info--small" @click="handleClickUpdate">
            <UiIconUpdate :spinning="isLoading"/>
          </UiButtonDefault>
        </template>

        <template #content>
          <TableMain>
            <template #thead>
              <tr>
                <th class="px-4 py-3 text-left font-normal">
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
                  v-if="isLoading"
              >
                <UiIconSpinnerDefault/>
              </div>
              <template v-if="payments.length">
                <tr
                    v-for="payment in payments"
                    :key="payment.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
                >
                  <td class="px-4 py-3 font-bold">
                    <button
                        @click="copyToClipboard(payment.id)"
                        class="cursor-pointer"
                        aria-label="Copy id"
                    >
                      <UiIconCopy/>
                    </button>
                  </td>

                  <td class="px-4 py-3 truncate max-w-[220px]" :title="payment.account_number">
                    <strong>{{ payment?.account_number }}</strong>
                  </td>

                  <td
                      class="px-4 py-3 truncate max-w-[170px]"
                      :title="payment.payment_system_name"
                  >
                    <span>TRC-20</span>
                  </td>

                  <td class="px-4 py-3 truncate text-xs text-[var(--ui-primary-main)]">
                    {{ payment.currency }}
                  </td>

                  <td
                      class="px-4 py-3 font-bold whitespace-nowrap"
                      :class="true ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
                  >
                    {{ payment.amount }}
                  </td>

                  <td
                      class="px-4 py-3 capitalize whitespace-nowrap"
                      :class="statusClass(payment.status)"
                  >
                    {{ payment.status }}
                  </td>

                  <td class="px-4 py-3 text-xs whitespace-nowrap">
                    {{ new Date(payment.created_at).toLocaleString() }}
                  </td>
                </tr>
              </template>
            </template>

            <template #empty>
              <template v-if="payments.length === 0">
                <div class="h-[40vh] flex items-center justify-center">
                  <span v-if="!isLoading" class="text-[var(--ui-text-main)]">
                    {{ t('cabinet.billing.nothingToShow') }}
                  </span>
                  <UiIconSpinnerDefault v-else/>
                </div>
              </template>
            </template>

            <template #pagination>
              <PaginationMain
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
          </TableMain>
        </template>
      </PageStructureContent>
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
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import UiIconUpdate from '~/components/ui/UiIconUpdate.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import useAppCore from '~/composables/useAppCore'
import useEventBus from "~/composables/useEventBus";

import {definePageMeta} from '~/.nuxt/imports'
import {useI18n} from 'vue-i18n'
import {computed, inject, onMounted, reactive, ref} from 'vue'

definePageMeta({
  layout: 'cabinet',
  middleware: ['auth-client', 'client-check-auth'],
})

const {t} = useI18n({useScope: 'global'})
const {openModal} = inject("modalControl") as { openModal: Function };

const appCore = useAppCore()

const ORDER_DIRECTION_ASC = 'asc'
const ORDER_DIRECTION_DESC = 'desc'

const search = ref('')
const total = ref(0)
const perPage = ref(6)
const currentPage = ref(1)
const orderBy = ref<string>('created_at')
const orderDirection = ref<string>(ORDER_DIRECTION_DESC)
const isLoading = ref(false)

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

onMounted(async () => {
  useEventBus.on("loadDataForPayments", loadData);
  await loadData()
})
</script>

<style scoped>
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
</style>
