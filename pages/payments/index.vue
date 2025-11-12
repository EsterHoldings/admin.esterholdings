<!--<template>-->
<!--  <UiContainer>-->
<!--    &lt;!&ndash; Title &ndash;&gt;-->
<!--    <div class="mb-5">-->
<!--      <UiTextH4 class="text-[var(&#45;&#45;ui-text-main)]">-->
<!--        {{ t('cabinet.billing.title') }}-->
<!--      </UiTextH4>-->
<!--    </div>-->

<!--    <PanelDefault class="p-5">-->
<!--      <div class="pb-10">-->
<!--        &lt;!&ndash; Search + Create &ndash;&gt;-->
<!--        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">-->
<!--          <div class="w-full md:w-[420px]">-->
<!--            <UiInput-->
<!--                @input="handleInputSearch"-->
<!--                :value="search"-->
<!--                :placeholder="t('cabinet.billing.search')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="w-full md:w-auto">-->
<!--            <NuxtLink to="/payments/create" class="block md:inline-block">-->
<!--              <UiButtonDefault state="success&#45;&#45;outline" class="w-full md:w-auto">-->
<!--                {{ t('cabinet.billing.create') }}-->
<!--              </UiButtonDefault>-->
<!--            </NuxtLink>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; Header (tablet hides, desktop shows) &ndash;&gt;-->
<!--        <div-->
<!--            class="hidden lg:grid-->
<!--                 lg:[grid-template-columns:40px_1.2fr_1fr_1fr_.6fr_.8fr_1fr_40px]-->
<!--                 xl:[grid-template-columns:50px_1fr_1fr_1fr_1fr_1fr_1fr_50px]-->
<!--                 gap-x-3 xl:gap-x-5 gap-y-2.5-->
<!--                 p-4 xl:p-5 w-full text-[var(&#45;&#45;ui-text-main)] text-sm xl:text-base"-->
<!--        >-->
<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('id')">-->
<!--              {{ t('cabinet.billing.columns.id') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'id'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('id')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('account_number')">-->
<!--              Номер счета-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'account_number'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('account_number')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('payment_system')">-->
<!--              {{ t('cabinet.billing.columns.paysystem') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'payment_system'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('payment_system')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('status')">-->
<!--              {{ t('cabinet.billing.columns.status') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'status'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('status')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('currency')">-->
<!--              {{ t('cabinet.billing.columns.currency') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'currency'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('currency')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('amount')">-->
<!--              {{ t('cabinet.billing.columns.amount') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'amount'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('amount')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-start">-->
<!--            <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('created_at')">-->
<!--              {{ t('cabinet.billing.columns.createdAt') }}-->
<!--            </span>-->
<!--            <UiIconSort-->
<!--                :active="orderBy === 'created_at'"-->
<!--                :direction="orderDirection"-->
<!--                @click="handleOrderByAndDirection('created_at')"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="flex items-center justify-end">-->
<!--            <span>...</span>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; Empty / Loading &ndash;&gt;-->
<!--        <template v-if="payments.length === 0">-->
<!--          <div class="h-[40vh] flex items-center justify-center">-->
<!--            <span v-if="!isLoading" class="text-[var(&#45;&#45;ui-text-main)]">-->
<!--              {{ t('cabinet.billing.nothingToShow') }}-->
<!--            </span>-->
<!--            <UiIconSpinnerDefault v-else />-->
<!--          </div>-->
<!--        </template>-->

<!--        &lt;!&ndash; List &ndash;&gt;-->
<!--        <template v-else>-->
<!--          <PanelDefault-->
<!--              v-for="payment in payments"-->
<!--              :key="payment.id"-->
<!--              class="p-5 w-full mb-2.5 hover:bg-[var(&#45;&#45;color-stroke-ui-dark)]"-->
<!--          >-->
<!--            &lt;!&ndash; Desktop row (1024+) &ndash;&gt;-->
<!--            <div-->
<!--                class="hidden lg:grid items-center text-[var(&#45;&#45;ui-text-main)]-->
<!--                     lg:[grid-template-columns:40px_1.2fr_1fr_1fr_.6fr_.8fr_1fr_40px]-->
<!--                     xl:[grid-template-columns:50px_1fr_1fr_1fr_1fr_1fr_1fr_50px]-->
<!--                     gap-x-3 xl:gap-x-5 gap-y-2.5"-->
<!--            >-->
<!--              &lt;!&ndash; ID copy &ndash;&gt;-->
<!--              <div class="text-[var(&#45;&#45;color-ui-accent)] font-bold">-->
<!--                <div @click="copyToClipboard(payment.id)" class="cursor-pointer">-->
<!--                  <UiIconCopy />-->
<!--                </div>-->
<!--              </div>-->

<!--              &lt;!&ndash; Account number &ndash;&gt;-->
<!--              <div class="truncate" :title="payment.account_number">{{ payment.account_number }}</div>-->

<!--              &lt;!&ndash; Pay system &ndash;&gt;-->
<!--              <div class="truncate" :title="payment.payment_system_name">{{ payment.payment_system_name }}</div>-->

<!--              &lt;!&ndash; Status &ndash;&gt;-->
<!--              <div class="capitalize truncate" :title="payment.status">{{ payment.status }}</div>-->

<!--              &lt;!&ndash; Currency &ndash;&gt;-->
<!--              <div class="truncate">{{ payment.currency }}</div>-->

<!--              &lt;!&ndash; Amount &ndash;&gt;-->
<!--              <div-->
<!--                  :class="[-->
<!--                  Math.random() < 0.5 ? 'text-[var(&#45;&#45;color-success)]' : 'text-[var(&#45;&#45;color-danger)]',-->
<!--                  'font-bold whitespace-nowrap'-->
<!--                ]"-->
<!--              >-->
<!--                {{ payment.amount }}-->
<!--              </div>-->

<!--              &lt;!&ndash; Created at &ndash;&gt;-->
<!--              <div class="text-sm whitespace-nowrap">-->
<!--                {{ new Date(payment.created_at).toLocaleString() }}-->
<!--              </div>-->

<!--              &lt;!&ndash; Refresh icon &ndash;&gt;-->
<!--              <div class="text-right">-->
<!--                <UiIconUpdate-->
<!--                    class="h-4 w-4 mr-2.5 cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"-->
<!--                    :class="{ 'animate-[spin_0.5s_linear]': spinIcon }"-->
<!--                    @click="handleIconClick(payment.id)"-->
<!--                    @animationend="onIconAnimationEnd"-->
<!--                />-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Tablet/Mobile card (<1024) &ndash;&gt;-->
<!--            <div class="lg:hidden flex flex-col gap-3 text-[var(&#45;&#45;ui-text-main)]">-->
<!--              &lt;!&ndash; Top: copy + number + amount &ndash;&gt;-->
<!--              <div class="flex items-start justify-between gap-2">-->
<!--                <div class="flex items-start gap-2 min-w-0">-->
<!--                  <button-->
<!--                      @click="copyToClipboard(payment.id)"-->
<!--                      class="text-[var(&#45;&#45;color-ui-accent)] font-bold shrink-0 cursor-pointer"-->
<!--                      aria-label="Copy id"-->
<!--                  >-->
<!--                    <UiIconCopy />-->
<!--                  </button>-->
<!--                  <div class="leading-tight min-w-0">-->
<!--                    <div class="font-semibold truncate" :title="payment.account_number">-->
<!--                      {{ payment.account_number }}-->
<!--                    </div>-->
<!--                    <div class="text-sm opacity-80 truncate" :title="payment.payment_system_name">-->
<!--                      {{ payment.payment_system_name }}-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->

<!--                <div-->
<!--                    class="text-right font-bold text-lg md:text-xl leading-none whitespace-nowrap"-->
<!--                    :class="Math.random() < 0.5 ? 'text-[var(&#45;&#45;color-success)]' : 'text-[var(&#45;&#45;color-danger)]'"-->
<!--                >-->
<!--                  {{ payment.amount }}-->
<!--                </div>-->
<!--              </div>-->

<!--              &lt;!&ndash; Badges / currency &ndash;&gt;-->
<!--              <div class="flex flex-wrap items-center gap-2">-->
<!--                <span-->
<!--                    class="ui-badge"-->
<!--                    :class="payment.status === 'chargeback'-->
<!--                    ? 'ui-badge&#45;&#45;danger'-->
<!--                    : (payment.status === 'pending' ? 'ui-badge&#45;&#45;pending' : 'ui-badge&#45;&#45;default')"-->
<!--                >-->
<!--                  {{ payment.status }}-->
<!--                </span>-->
<!--                <span class="ui-badge ui-badge&#45;&#45;outline">{{ payment.currency }}</span>-->
<!--              </div>-->

<!--              &lt;!&ndash; Created at + refresh &ndash;&gt;-->
<!--              <div class="flex items-center justify-between text-sm opacity-80">-->
<!--                <span class="whitespace-nowrap">{{ new Date(payment.created_at).toLocaleString() }}</span>-->
<!--                <UiIconUpdate-->
<!--                    class="h-4 w-4 ml-3 cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"-->
<!--                    :class="{ 'animate-[spin_0.5s_linear]': spinIcon }"-->
<!--                    @click="handleIconClick(payment.id)"-->
<!--                    @animationend="onIconAnimationEnd"-->
<!--                />-->
<!--              </div>-->
<!--            </div>-->
<!--          </PanelDefault>-->
<!--        </template>-->

<!--        &lt;!&ndash; Pagination &ndash;&gt;-->
<!--        <div class="mt-5 flex items-center justify-center gap-2">-->
<!--          <button-->
<!--              v-if="currentPage !== 1 && total > perPage"-->
<!--              class="px-3 py-1.5 border border-[var(&#45;&#45;color-ui-border)] bg-[var(&#45;&#45;ui-background)] cursor-pointer text-sm rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--              @click="goPrev"-->
<!--          >-->
<!--            {{ t('cabinet.billing.pagination.prev') }}-->
<!--          </button>-->

<!--          <button-->
<!--              v-if="visiblePages[0] > 1"-->
<!--              class="px-3 py-1.5 border border-[var(&#45;&#45;color-ui-border)] bg-[var(&#45;&#45;ui-background)] cursor-pointer text-sm rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--              @click="setPage(1)"-->
<!--          >-->
<!--            1-->
<!--          </button>-->
<!--          <span v-if="visiblePages[0] > 2">...</span>-->

<!--          <button-->
<!--              v-for="page in visiblePages"-->
<!--              :key="page"-->
<!--              @click="setPage(page)"-->
<!--              class="px-3 py-1.5 border border-[var(&#45;&#45;color-ui-border)] bg-[var(&#45;&#45;ui-background)] cursor-pointer text-sm rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--              :class="{ 'bg-[var(&#45;&#45;color-ui-accent)] text-white border-[var(&#45;&#45;color-ui-accent)]': currentPage === page }"-->
<!--          >-->
<!--            {{ page }}-->
<!--          </button>-->

<!--          <span v-if="visiblePages[visiblePages.length - 1] < totalPages">...</span>-->
<!--          <button-->
<!--              v-if="visiblePages[visiblePages.length - 1] < totalPages"-->
<!--              class="px-3 py-1.5 border border-[var(&#45;&#45;color-ui-border)] bg-[var(&#45;&#45;ui-background)] cursor-pointer text-sm rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--              @click="setPage(totalPages)"-->
<!--          >-->
<!--            {{ totalPages }}-->
<!--          </button>-->

<!--          <button-->
<!--              v-if="currentPage !== totalPages && total > perPage"-->
<!--              class="px-3 py-1.5 border border-[var(&#45;&#45;color-ui-border)] bg-[var(&#45;&#45;ui-background)] cursor-pointer text-sm rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--              @click="goNext"-->
<!--          >-->
<!--            {{ t('cabinet.billing.pagination.next') }}-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </PanelDefault>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { useI18n } from 'vue-i18n'-->
<!--import { computed, onMounted, reactive, ref } from 'vue'-->
<!--import { definePageMeta } from '~/.nuxt/imports'-->

<!--import PanelDefault from '~/components/block/panels/PanelDefault.vue'-->
<!--import UiButtonDefault from '~/components/ui/UiButtonDefault.vue'-->
<!--import UiContainer from '~/components/ui/UiContainer.vue'-->
<!--import UiIconUpdate from '~/components/ui/UiIconUpdate.vue'-->
<!--import UiInput from '~/components/ui/UiInput.vue'-->
<!--import UiIconSort from '~/components/ui/UiIconSort.vue'-->
<!--import useAppCore from '~/composables/useAppCore'-->
<!--import UiIconCopy from '~/components/ui/UiIconCopy.vue'-->
<!--import UiTextH4 from '~/components/ui/UiTextH4.vue'-->
<!--import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'-->

<!--definePageMeta({-->
<!--  layout: 'cabinet',-->
<!--  middleware: ['auth-client', 'client-check-auth'],-->
<!--})-->

<!--const { t } = useI18n({ useScope: 'global' })-->
<!--const appCore = useAppCore()-->

<!--const ORDER_DIRECTION_ASC = 'asc'-->
<!--const ORDER_DIRECTION_DESC = 'desc'-->

<!--const search = ref('')-->
<!--const total = ref(0)-->
<!--const perPage = ref(4)-->
<!--const currentPage = ref(1)-->
<!--const orderBy = ref<string>('')-->
<!--const orderDirection = ref<string>(ORDER_DIRECTION_DESC)-->
<!--const isLoading = ref(false)-->

<!--const payments = reactive<any[]>([])-->
<!--const spinIcon = ref(false)-->

<!--const totalPages = computed(() => Math.ceil(total.value / perPage.value))-->

<!--const visiblePages = computed(() => {-->
<!--  const pages: number[] = []-->
<!--  const maxPagesToShow = 5-->
<!--  const half = Math.floor(maxPagesToShow / 2)-->

<!--  let start = Math.max(1, currentPage.value - half)-->
<!--  let end = Math.min(totalPages.value, start + maxPagesToShow - 1)-->

<!--  if (end - start < maxPagesToShow - 1) {-->
<!--    start = Math.max(1, end - maxPagesToShow + 1)-->
<!--  }-->

<!--  for (let i = start; i <= end; i++) pages.push(i)-->
<!--  return pages-->
<!--})-->

<!--async function setPage(page: number) {-->
<!--  if (page >= 1 && page <= totalPages.value) {-->
<!--    currentPage.value = page-->
<!--    await loadData()-->
<!--  }-->
<!--}-->

<!--async function goPrev() {-->
<!--  if (currentPage.value > 1) {-->
<!--    currentPage.value&#45;&#45;-->
<!--    await loadData()-->
<!--  }-->
<!--}-->

<!--async function goNext() {-->
<!--  if (currentPage.value < totalPages.value) {-->
<!--    currentPage.value++-->
<!--    await loadData()-->
<!--  }-->
<!--}-->

<!--const handleIconClick = (id: string) => {-->
<!--  const payment = payments.find((x) => x.id === id)-->
<!--  if (payment) payment.isSpinning = true-->
<!--}-->

<!--const onIconAnimationEnd = () => {-->
<!--  spinIcon.value = false-->
<!--}-->

<!--const handleInputSearch = async (value: any) => {-->
<!--  search.value = value-->
<!--  currentPage.value = 1-->
<!--  await loadData()-->
<!--}-->

<!--const handleOrderByAndDirection = async (value: string) => {-->
<!--  orderDirection.value =-->
<!--      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC-->
<!--  orderBy.value = value-->
<!--  await loadData()-->
<!--}-->

<!--const loadData = async () => {-->
<!--  isLoading.value = true-->
<!--  const response = await appCore.payments.get({-->
<!--    search: search.value,-->
<!--    perPage: perPage.value,-->
<!--    page: currentPage.value,-->
<!--    orderBy: orderBy.value,-->
<!--    orderDirection: orderDirection.value,-->
<!--  })-->

<!--  perPage.value = response.data.data.per_page-->
<!--  currentPage.value = response.data.data.current_page-->
<!--  total.value = response.data.data.total-->

<!--  const paymentsData = response.data.data.data.map((x: any) => {-->
<!--    x.isSpinning = false-->
<!--    return x-->
<!--  })-->
<!--  payments.splice(0, payments.length, ...paymentsData)-->
<!--  isLoading.value = false-->
<!--}-->

<!--const shortId = (uuid: string) => uuid.split('-').pop()-->

<!--const copyToClipboard = (paymentId: string) => {-->
<!--  const id = shortId(paymentId)-->
<!--  if (id) navigator.clipboard.writeText(id)-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await loadData()-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--@keyframes spin {-->
<!--  0% { transform: rotate(0deg); }-->
<!--  100% { transform: rotate(360deg); }-->
<!--}-->
<!--@keyframes wiggle {-->
<!--  0% { transform: translateX(0); }-->
<!--  20% { transform: translateX(-2px); }-->
<!--  40% { transform: translateX(2px); }-->
<!--  60% { transform: translateX(-2px); }-->
<!--  80% { transform: translateX(2px); }-->
<!--  100% { transform: translateX(0); }-->
<!--}-->

<!--/* Бейджі під вашу палітру */-->
<!--.ui-badge {-->
<!--  display: inline-flex;-->
<!--  align-items: center;-->
<!--  gap: .375rem;-->
<!--  padding: .25rem .6rem;-->
<!--  border-radius: 9999px;-->
<!--  font-size: 0.875rem;-->
<!--  line-height: 1rem;-->
<!--  border: 1px solid var(&#45;&#45;color-ui-border);-->
<!--  color: var(&#45;&#45;ui-text-main);-->
<!--}-->
<!--.ui-badge&#45;&#45;outline {}-->
<!--.ui-badge&#45;&#45;pending {-->
<!--  border-color: var(&#45;&#45;color-ui-accent);-->
<!--  color: var(&#45;&#45;color-ui-accent);-->
<!--}-->
<!--.ui-badge&#45;&#45;danger {-->
<!--  border-color: var(&#45;&#45;color-danger);-->
<!--  color: var(&#45;&#45;color-danger);-->
<!--}-->
<!--.ui-badge&#45;&#45;default {-->
<!--  border-color: var(&#45;&#45;color-ui-border);-->
<!--  color: var(&#45;&#45;ui-text-main);-->
<!--}-->
<!--</style>-->


<template>
  <UiContainer>
    <!-- Title -->
    <div class="mb-5">
      <UiTextH4 class="text-[var(--ui-text-main)]">
        {{ t('cabinet.billing.title') }}
      </UiTextH4>
    </div>

    <PanelDefault class="p-5">
      <div class="pb-10">
        <!-- Search + Create -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <!-- Search with inline sort trigger (mobile/tablet) -->
          <div class="relative w-full md:w-[420px]">
            <UiInput
                class="pr-12"
                @input="handleInputSearch"
                :value="search"
                :placeholder="t('cabinet.billing.search')"
            />
            <button
                class="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl
                     border border-[var(--color-ui-border)]
                     bg-[var(--color-stroke-ui-dark)]
                     text-[var(--ui-text-main)]
                     hover:bg-[var(--color-stroke-ui-dark-hover)]
                     transition-colors
                     md:hidden"
                @click="showMobileSort = !showMobileSort"
                aria-label="Toggle sort filter"
            >
              <UiIconSort :active="true" :direction="orderDirection" />
            </button>
          </div>

          <!-- Create -->
          <div class="w-full md:w-auto">
            <!-- Використай відносний або абсолютний шлях за своєю маршрутизацією -->
            <NuxtLink to="/payments/create" class="block md:inline-block">
              <UiButtonDefault state="success--outline" class="w-full md:w-auto">
                {{ t('cabinet.billing.create') }}
              </UiButtonDefault>
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile / Tablet sort filter panel -->
        <transition name="fade">
          <div
              v-if="showMobileSort"
              class="md:hidden mb-4 rounded-2xl p-3
                   border border-[var(--color-ui-border)]
                   bg-[var(--ui-background)]/60"
          >
            <div class="flex items-center gap-3">
              <label class="text-sm text-[var(--ui-text-secondary)] whitespace-nowrap">
                {{ t('cabinet.billing.sortBy') }}
              </label>
              <div class="flex-1">
                <select
                    class="w-full rounded-xl px-3 py-2
                         bg-[var(--color-stroke-ui-dark)]
                         border border-[var(--color-ui-border)]
                         text-[var(--ui-text-main)] focus:outline-none"
                    :value="orderBy || 'created_at'"
                    @change="setOrderBy(($event.target as HTMLSelectElement).value)"
                >
                  <option value="id">{{ t('cabinet.billing.columns.id') }}</option>
                  <option value="account_number">Номер счета</option>
                  <option value="payment_system">{{ t('cabinet.billing.columns.paysystem') }}</option>
                  <option value="status">{{ t('cabinet.billing.columns.status') }}</option>
                  <option value="currency">{{ t('cabinet.billing.columns.currency') }}</option>
                  <option value="amount">{{ t('cabinet.billing.columns.amount') }}</option>
                  <option value="created_at">{{ t('cabinet.billing.columns.createdAt') }}</option>
                </select>
              </div>

              <button
                  class="h-10 w-10 rounded-xl shrink-0
                       border border-[var(--color-ui-border)]
                       bg-[var(--color-stroke-ui-dark)]
                       text-[var(--ui-text-main)]
                       hover:bg-[var(--color-stroke-ui-dark-hover)]
                       transition-colors"
                  @click="toggleDirection"
                  :aria-label="orderDirection === ORDER_DIRECTION_ASC ? 'asc' : 'desc'"
                  title="Direction"
              >
                <UiIconSort :active="true" :direction="orderDirection" />
              </button>
            </div>
          </div>
        </transition>

        <!-- DESKTOP TABLE (>=1024) -->
        <div class="hidden lg:block">
          <!-- Header -->
          <div class="overflow-x-auto">
            <div class="grid table-grid min-w-[1180px] gap-x-4 gap-y-2.5 p-4 text-[var(--ui-text-main)] text-sm">
              <!-- ID -->
              <div class="flex items-center">
                <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('id')">
                  {{ t('cabinet.billing.columns.id') }}
                </span>
                <UiIconSort :active="orderBy === 'id'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('id')" />
              </div>

              <!-- Account number (compact header text) -->
              <div class="flex items-center">
                <span class="mr-2.5 cursor-default truncate max-w-[90px]"
                      title="Номер счёта"
                      @click="handleOrderByAndDirection('account_number')">
                  № счёта
                </span>
                <UiIconSort :active="orderBy === 'account_number'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('account_number')" />
              </div>

              <!-- Pay system (compact header text) -->
              <div class="flex items-center">
                <span class="mr-2.5 cursor-default truncate max-w-[90px]"
                      title="Платёжная система"
                      @click="handleOrderByAndDirection('payment_system')">
                  ПС
                </span>
                <UiIconSort :active="orderBy === 'payment_system'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('payment_system')" />
              </div>

              <div class="flex items-center">
                <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('status')">
                  {{ t('cabinet.billing.columns.status') }}
                </span>
                <UiIconSort :active="orderBy === 'status'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('status')" />
              </div>

              <div class="flex items-center">
                <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('currency')">
                  {{ t('cabinet.billing.columns.currency') }}
                </span>
                <UiIconSort :active="orderBy === 'currency'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('currency')" />
              </div>

              <div class="flex items-center">
                <span class="mr-2.5 cursor-default" @click="handleOrderByAndDirection('amount')">
                  {{ t('cabinet.billing.columns.amount') }}
                </span>
                <UiIconSort :active="orderBy === 'amount'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('amount')" />
              </div>

              <div class="flex items-center">
                <span class="mr-2.5 cursor-default truncate max-w-[160px]"
                      @click="handleOrderByAndDirection('created_at')">
                  {{ t('cabinet.billing.columns.createdAt') }}
                </span>
                <UiIconSort :active="orderBy === 'created_at'" :direction="orderDirection"
                            @click="handleOrderByAndDirection('created_at')" />
              </div>

              <div class="flex items-center justify-end">
                <span>...</span>
              </div>
            </div>
          </div>

          <!-- Rows -->
          <div class="overflow-x-auto" v-if="payments.length">
            <PanelDefault
                v-for="payment in payments"
                :key="payment.id"
                class="p-5 w-full mb-2.5 hover:bg-[var(--color-stroke-ui-dark)]"
            >
              <div class="grid table-grid min-w-[1180px] items-center gap-x-4 gap-y-2.5 text-[var(--ui-text-main)]">
                <!-- ID -->
                <div class="text-[var(--color-ui-accent)] font-bold">
                  <button @click="copyToClipboard(payment.id)" class="cursor-pointer" aria-label="Copy id">
                    <UiIconCopy />
                  </button>
                </div>

                <!-- Account number (will collapse if empty) -->
                <div class="truncate max-w-[220px]" :title="payment.account_number">
                  <span v-if="payment.account_number">{{ payment.account_number }}</span>
                </div>

                <!-- Pay system (will collapse if empty) -->
                <div class="truncate max-w-[170px]" :title="payment.payment_system_name">
                  <span v-if="payment.payment_system_name">{{ payment.payment_system_name }}</span>
                </div>

                <!-- Status -->
                <div class="capitalize truncate">{{ payment.status }}</div>

                <!-- Currency -->
                <div class="truncate">{{ payment.currency }}</div>

                <!-- Amount -->
                <div
                    :class="[
                    Math.random() < 0.5 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                    'font-bold whitespace-nowrap'
                  ]"
                >
                  {{ payment.amount }}
                </div>

                <!-- Created at -->
                <div class="text-sm whitespace-nowrap">
                  {{ new Date(payment.created_at).toLocaleString() }}
                </div>

                <!-- Refresh -->
                <div class="text-right">
                  <UiIconUpdate
                      class="h-4 w-4 mr-2.5 cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"
                      :class="{ 'animate-[spin_0.5s_linear]': spinIcon }"
                      @click="handleIconClick(payment.id)"
                      @animationend="onIconAnimationEnd"
                  />
                </div>
              </div>
            </PanelDefault>
          </div>
        </div>

        <!-- MOBILE/TABLET CARDS (<1024) -->
        <template v-if="payments.length">
          <PanelDefault
              v-for="payment in payments"
              :key="payment.id"
              class="p-5 w-full mb-2.5 hover:bg-[var(--color-stroke-ui-dark)] lg:hidden"
          >
            <div class="flex flex-col gap-3 text-[var(--ui-text-main)]">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2 min-w-0">
                  <button
                      @click="copyToClipboard(payment.id)"
                      class="text-[var(--color-ui-accent)] font-bold shrink-0 cursor-pointer"
                      aria-label="Copy id"
                  >
                    <UiIconCopy />
                  </button>
                  <div class="leading-tight min-w-0">
                    <div class="font-semibold truncate" :title="payment.account_number">
                      {{ payment.account_number || '—' }}
                    </div>
                    <div class="text-sm opacity-80 truncate" :title="payment.payment_system_name">
                      {{ payment.payment_system_name || '—' }}
                    </div>
                  </div>
                </div>

                <div
                    class="text-right font-bold text-lg md:text-xl leading-none whitespace-nowrap"
                    :class="Math.random() < 0.5 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'"
                >
                  {{ payment.amount }}
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span
                    class="ui-badge"
                    :class="payment.status === 'chargeback'
                    ? 'ui-badge--danger'
                    : (payment.status === 'pending' ? 'ui-badge--pending' : 'ui-badge--default')"
                >
                  {{ payment.status }}
                </span>
                <span class="ui-badge ui-badge--outline">{{ payment.currency }}</span>
              </div>

              <div class="flex items-center justify-between text-sm opacity-80">
                <span class="whitespace-nowrap">{{ new Date(payment.created_at).toLocaleString() }}</span>
                <UiIconUpdate
                    class="h-4 w-4 ml-3 cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"
                    :class="{ 'animate-[spin_0.5s_linear]': spinIcon }"
                    @click="handleIconClick(payment.id)"
                    @animationend="onIconAnimationEnd"
                />
              </div>
            </div>
          </PanelDefault>
        </template>

        <!-- Empty / Loading -->
        <template v-if="payments.length === 0">
          <div class="h-[40vh] flex items-center justify-center">
            <span v-if="!isLoading" class="text-[var(--ui-text-main)]">
              {{ t('cabinet.billing.nothingToShow') }}
            </span>
            <UiIconSpinnerDefault v-else />
          </div>
        </template>

        <!-- Pagination -->
        <div class="mt-5 flex items-center justify-center gap-2">
          <button
              v-if="currentPage !== 1 && total > perPage"
              class="px-3 py-1.5 border border-[var(--color-ui-border)] bg-[var(--ui-background)] cursor-pointer text-sm rounded text-[var(--ui-text-main)]"
              @click="goPrev"
          >
            {{ t('cabinet.billing.pagination.prev') }}
          </button>

          <button
              v-if="visiblePages[0] > 1"
              class="px-3 py-1.5 border border-[var(--color-ui-border)] bg-[var(--ui-background)] cursor-pointer text-sm rounded text-[var(--ui-text-main)]"
              @click="setPage(1)"
          >
            1
          </button>
          <span v-if="visiblePages[0] > 2">...</span>

          <button
              v-for="page in visiblePages"
              :key="page"
              @click="setPage(page)"
              class="px-3 py-1.5 border border-[var(--color-ui-border)] bg-[var(--ui-background)] cursor-pointer text-sm rounded text-[var(--ui-text-main)]"
              :class="{ 'bg-[var(--color-ui-accent)] text-white border-[var(--color-ui-accent)]': currentPage === page }"
          >
            {{ page }}
          </button>

          <span v-if="visiblePages[visiblePages.length - 1] < totalPages">...</span>
          <button
              v-if="visiblePages[visiblePages.length - 1] < totalPages"
              class="px-3 py-1.5 border border-[var(--color-ui-border)] bg-[var(--ui-background)] cursor-pointer text-sm rounded text-[var(--ui-text-main)]"
              @click="setPage(totalPages)"
          >
            {{ totalPages }}
          </button>

          <button
              v-if="currentPage !== totalPages && total > perPage"
              class="px-3 py-1.5 border border-[var(--color-ui-border)] bg-[var(--ui-background)] cursor-pointer text-sm rounded text-[var(--ui-text-main)]"
              @click="goNext"
          >
            {{ t('cabinet.billing.pagination.next') }}
          </button>
        </div>
      </div>
    </PanelDefault>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed, onMounted, reactive, ref } from 'vue'
import { definePageMeta } from '~/.nuxt/imports'

import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import UiButtonDefault from '~/components/ui/UiButtonDefault.vue'
import UiContainer from '~/components/ui/UiContainer.vue'
import UiIconUpdate from '~/components/ui/UiIconUpdate.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiIconSort from '~/components/ui/UiIconSort.vue'
import useAppCore from '~/composables/useAppCore'
import UiIconCopy from '~/components/ui/UiIconCopy.vue'
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'

definePageMeta({
  layout: 'cabinet',
  middleware: ['auth-client', 'client-check-auth'],
})

const { t } = useI18n({ useScope: 'global' })
const appCore = useAppCore()

const ORDER_DIRECTION_ASC = 'asc'
const ORDER_DIRECTION_DESC = 'desc'

const search = ref('')
const total = ref(0)
const perPage = ref(4)
const currentPage = ref(1)
const orderBy = ref<string>('created_at')
const orderDirection = ref<string>(ORDER_DIRECTION_DESC)
const isLoading = ref(false)
const showMobileSort = ref(false)

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
async function goPrev() { if (currentPage.value > 1) { currentPage.value--; await loadData() } }
async function goNext() { if (currentPage.value < totalPages.value) { currentPage.value++; await loadData() } }

const handleIconClick = (id: string) => {
  const payment = payments.find((x) => x.id === id)
  if (payment) payment.isSpinning = true
}
const onIconAnimationEnd = () => { spinIcon.value = false }

const handleInputSearch = async (value: any) => {
  search.value = value
  currentPage.value = 1
  await loadData()
}

/* Desktop header sort toggle */
const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC
  orderBy.value = value
  await loadData()
}

/* Mobile/tablet filter actions */
const setOrderBy = async (value: string) => { orderBy.value = value; await loadData() }
const toggleDirection = async () => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC
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

onMounted(async () => { await loadData() })
</script>

<style scoped>
/* ===== Stable desktop grid =====
   1) Колонки № счёта та ПС — fit-content(...) => мінімальний займ простору,
      не тягнуть рядок, коли даних немає.
   2) Є горизонтальний скрол, якщо ширини не вистачає.
*/
.table-grid {
  display: grid;
  grid-template-columns:
    56px                   /* copy */
    fit-content(220px)     /* account_number */
    fit-content(170px)     /* payment_system */
    1fr                    /* status – тягнуча */
    90px                   /* currency */
    120px                  /* amount */
    240px                  /* created_at */
    56px;                  /* actions */
}

@media (min-width: 1440px) {
  .table-grid {
    grid-template-columns:
      60px
      fit-content(260px)
      fit-content(200px)
      1fr
      100px
      140px
      280px
      60px;
  }
}

/* Fade transition for the filter panel */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animations (як були) */
@keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
@keyframes wiggle {
  0% { transform: translateX(0) }
  20% { transform: translateX(-2px) }
  40% { transform: translateX(2px) }
  60% { transform: translateX(-2px) }
  80% { transform: translateX(2px) }
  100% { transform: translateX(0) }
}

/* Badges у вашій палітрі */
.ui-badge {
  display: inline-flex; align-items: center; gap:.375rem;
  padding:.25rem .6rem; border-radius:9999px;
  font-size:.875rem; line-height:1rem;
  border:1px solid var(--color-ui-border); color:var(--ui-text-main);
}
.ui-badge--outline {}
.ui-badge--pending { border-color: var(--color-ui-accent); color: var(--color-ui-accent); }
.ui-badge--danger  { border-color: var(--color-danger);     color: var(--color-danger); }
.ui-badge--default { border-color: var(--color-ui-border);  color: var(--ui-text-main); }
</style>
