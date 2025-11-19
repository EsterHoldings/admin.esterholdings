<template>
  <div>
    <!-- Top options -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center justify-center gap-1 w-full max-w-60">
        <UiInput
          class="w-full"
          @input="handleInputSearch"
          :value="search"
          :placeholder="t('cabinet.accounts.search')">
          <template #icon-left>
            <UiIconSearch />
          </template>
        </UiInput>
      </div>
      <div class="flex items-center justify-center gap-1">
        <UiButtonDefault
          state="info--small"
          class="mr-2"
          @click="handleClickUpdate">
          <UiIconUpdate v-if="!isLoading" />
          <UiIconSpinnerDefault v-if="isLoading" />
        </UiButtonDefault>

        <UiSelect
          class="mr-2"
          :value="orderBy"
          :data="sortByFilterData"
          :withoutNoSelect="true"
          @change="handleChangeFilterSortBy">
          <template #icon-left>
            <UiIconSortBy
              class="mr-2 !w-[16px] !h-[16px]"
              :orderDirectionEnabled="true"
              :orderDirection="orderDirection" />
          </template>
        </UiSelect>

        <UiButtonDefault state="info--small">
          <UiIconFilters class="mr-2" />
          <UiTextSmall>Filters</UiTextSmall>
        </UiButtonDefault>
      </div>
    </div>

    <PanelDefault class="relative overflow-visible">
      <!-- Header -->
      <div
        class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] items-center text-[var(--ui-text-main)] gap-x-5 gap-y-2 h-[46px] px-5 bg-[var(--color-stroke-ui-light)] rounded-t-[10px] w-full">
        <div class="flex items-center justify-start">
          <UiTextSmall
            class="cursor-default mr-[10px]"
            @click="handleOrderByAndDirection('type')">
            {{ t("cabinet.accounts.columns.type") }}
          </UiTextSmall>
        </div>

        <div class="flex items-center justify-start">
          <UiTextSmall
            class="cursor-default mr-[10px]"
            @click="handleOrderByAndDirection('number')">
            {{ t("cabinet.accounts.columns.number") }}
          </UiTextSmall>
          <UiIconSort
            :active="orderBy === 'number'"
            :direction="orderDirection"
            @click="handleOrderByAndDirection('number')" />
        </div>

        <div class="flex items-center justify-start">
          <UiTextSmall
            class="cursor-default mr-[10px]"
            @click="handleOrderByAndDirection('leverage')">
            {{ t("cabinet.accounts.columns.leverage") }}
          </UiTextSmall>
        </div>

        <div class="flex items-center justify-end">
          <UiTextSmall
            class="cursor-default mr-[10px]"
            @click="handleOrderByAndDirection('balance')">
            {{ t("cabinet.accounts.columns.balance") }}
          </UiTextSmall>
          <UiIconSort
            :active="orderBy === 'balance'"
            :direction="orderDirection"
            @click="handleOrderByAndDirection('balance')" />
        </div>

        <div class="w-[240px]"></div>
      </div>

      <!-- Empty state -->
      <template v-if="!isLoading && accounts.length === 0">
        <div class="flex items-center justify-center flex-col gap-5 h-[calc(100vh-370px)]">
          <span>{{ t("cabinet.accounts.nothingToShow") }}</span>
          <UiButtonDefault
            state="success--outline"
            @click="handleClickCreateNewAccount">
            {{ t("cabinet.accounts.openAccount") }}
            &nbsp;
            <UiIconSuccess />
          </UiButtonDefault>
        </div>
      </template>

      <!-- Loader -->
      <template v-if="isLoading">
        <div class="flex items-center justify-center h-[calc(100vh-370px)]">
          <UiIconSpinnerDefault />
        </div>
      </template>

      <!-- Accounts list -->
      <div
        v-if="!isLoading && accounts.length > 0"
        ref="scrollArea"
        class="rounded-b-[10px]">
        <PanelDefault
          class="flex items-center h-[60px] px-5 w-full !border-none rounded-none border-b border-[var(--color-stroke-ui-light)] last:border-b-0 hover:bg-[var(--color-stroke-ui-dark)]"
          v-for="(account, index) in accounts"
          :key="account.id">
          <div
            class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] gap-x-5 gap-y-2 items-center text-[var(--ui-text-main)] w-full">
            <div class="text-[var(--color-ui-accent)] font-bold">{{ account.account_type.name }}</div>
            <div>{{ account.number }}</div>
            <div>1:50</div>
            <div class="flex items-center justify-end gap-[10px] text-right text-[20px] font-bold">
              <span class="cursor-pointer">$ {{ account.balance }}</span>
              <UiIconUpdate
                class="h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"
                ref="iconUpdate"
                :class="{ spinning: spinIcon }"
                @click="handleIconClick(account.id)"
                @animationend="onIconAnimationEnd" />
            </div>

            <div class="flex justify-end items-center gap-[5px] w-auto">
              <span
                @click="toggleRowOptions(index)"
                class="relative flex items-center justify-center h-[32px] w-[32px] rounded-md hover:border-[var(--color-stroke-ui-light)] border border-transparent transition-colors transition-opacity"
                :ref="el => (triggerRefs[index] = el as HTMLElement)">
                <UiIconDotsVertical />

                <!-- Меню опцій -->

                <div
                  v-if="currentRowActiveOptions === index"
                  :ref="el => (menuRefs[index] = el as HTMLElement)"
                  :class="[
                    'p-3 absolute right-3 min-w-[100px] border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] rounded-md z-10 flex flex-col gap-1 ',
                    dropUp[index] ? 'bottom-[calc(100%+8px)] top-auto' : 'top-10',
                  ]">
                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70">
                    <UiIconPayment class="!w-[14px] !h-[14px] stroke-[var(--ui-sticker-success)]" />
                    <UiTextSmall class="whitespace-nowrap">Deposit</UiTextSmall>
                  </div>

                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                    :class="{ 'bg-[var(--color-stroke-ui-light)]': false }">
                    <UiIconWithdraw class="!w-[14px] !h-[14px]" />
                    <UiTextSmall class="whitespace-nowrap">Withdraw</UiTextSmall>
                  </div>

                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                    :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                    @click="handleClickTransfer(account.id)">
                    <UiIconTransfer class="!w-[14px] !h-[14px]" />
                    <UiTextSmall class="whitespace-nowrap">Transfer</UiTextSmall>
                  </div>

                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                    :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                    @click="handleClickHistory(account.id)">
                    <UiIconHistory class="!w-[14px] !h-[14px]" />
                    <UiTextSmall class="whitespace-nowrap">History</UiTextSmall>
                  </div>

                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                    :class="{ 'bg-[var(--color-stroke-ui-light)]': false }">
                    <UiIconUpdate class="!w-[14px] !h-[14px]" />
                    <UiTextSmall class="whitespace-nowrap">Change type</UiTextSmall>
                  </div>

                  <div
                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                    :class="{ 'bg-[var(--color-stroke-ui-light)]': false }"
                    @click="handleClickDelete(account.id)">
                    <UiIconTrash class="!w-[14px] !h-[14px] stroke-[var(--ui-sticker-danger)]" />
                    <UiTextSmall class="whitespace-nowrap">Remove</UiTextSmall>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </PanelDefault>
      </div>
    </PanelDefault>

    <div class="px-5 h-[50px] mt-2 flex items-center justify-between">
      <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">
        <UiTextSmall class="mr-2">Per page:</UiTextSmall>
        <UiSelect
          class="!w-min flex items-center justify-center !h-[32px]"
          :data="perPageList"
          :value="perPage"
          @change="handleChangePerPage"
          :withoutNoSelect="true" />
      </div>

      <UiTextSmall>{{ currentPage * perPage - perPage }}-{{ currentPage * perPage }} / {{ total }}</UiTextSmall>

      <div class="flex items-center justify-center gap-2">
        <UiTextSmall
          class="px-3 py-1.5 h-[32px] border border-[--color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
          v-if="currentPage !== 1 && total > perPage"
          @click="goPrev">
          {{ t("cabinet.accounts.pagination.prev") }}
        </UiTextSmall>

        <UiTextSmall
          v-if="visiblePages[0] > 1"
          class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
          @click="setPage(1)">
          1
        </UiTextSmall>

        <UiTextSmall v-if="visiblePages[0] > 2">...</UiTextSmall>

        <UiTextSmall
          v-for="page in visiblePages"
          :key="page"
          class="px-3 py-1.5 h-[32px] border border-[var(--color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(--ui-text-main)]"
          :class="{ 'bg-[var(--color-ui-primary)] text-white': currentPage === page }"
          @click="setPage(page)">
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
          @click="goNext">
          {{ t("cabinet.accounts.pagination.next") }}
        </UiTextSmall>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconFilters from "~/components/ui/UiIconFilters.vue";
  import UiIconHistory from "~/components/ui/UiIconHistory.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";
  import UiIconSort from "~/components/ui/UiIconSort.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { computed, inject, onMounted, reactive, ref, nextTick, onBeforeUnmount } from "vue";
  import { navigateTo } from "nuxt/app";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";

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
    {
      id: "number",
      value: "number",
      text: "Number",
    },
    {
      id: "balance",
      value: "balance",
      text: "Balance",
    },
  ]);

  const accounts = reactive<any[]>([]);
  const spinIcon = ref(false);

  const totalPages = computed(() => Math.ceil(total.value / perPage.value));

  const perPageList = reactive([
    { id: 1, value: 1, text: "1" },
    { id: 2, value: 2, text: "2" },
    { id: 3, value: 3, text: "3" },
    { id: 4, value: 4, text: "4" },
    { id: 5, value: 5, text: "5" },
    { id: 6, value: 6, text: "6" },
    { id: 7, value: 7, text: "7" },
    { id: 8, value: 8, text: "8" },
    { id: 9, value: 9, text: "9" },
    { id: 10, value: 10, text: "10" },
    { id: 12, value: 12, text: "12" },
    { id: 15, value: 15, text: "15" },
    { id: 20, value: 20, text: "20" },
    { id: 25, value: 25, text: "25" },
    { id: 50, value: 50, text: "50" },
    { id: 100, value: 100, text: "100" },
  ]);

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

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

  const handleChangePerPage = async (newPerPage: number) => {
    perPage.value = newPerPage;
    await loadData();
  };

  const handleChangeFilterSortBy = async (value: string) => {
    if (orderBy.value === value)
      orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
    else orderBy.value = value;

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
  };

  // --- Dropdown flip logic ---
  const scrollArea = ref<HTMLElement | null>(null);
  const triggerRefs = ref<(HTMLElement | null)[]>([]);
  const menuRefs = ref<(HTMLElement | null)[]>([]);
  const dropUp = reactive<Record<number, boolean>>({});

  const closeOptions = () => {
    currentRowActiveOptions.value = null;
  };

  const toggleRowOptions = async (index: number) => {
    currentRowActiveOptions.value = currentRowActiveOptions.value === index ? null : index;
    await nextTick();
    if (currentRowActiveOptions.value === index) {
      updateMenuPosition(index);
    }
  };

  const updateMenuPosition = (index: number) => {
    const trigger = triggerRefs.value[index];
    const menu = menuRefs.value[index];
    if (!trigger || !menu) return;

    const offset = 8; // px
    const menuHeight = menu.offsetHeight;
    const triggerRect = trigger.getBoundingClientRect();
    const containerRect = (scrollArea.value ?? document.documentElement).getBoundingClientRect();

    const fitsDown = triggerRect.bottom + offset + menuHeight <= containerRect.bottom;

    dropUp[index] = !fitsDown;
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

  onMounted(async () => {
    useEventBus.on("loadDataForAccounts", loadData);
    await loadData();

    const recalc = () => {
      if (currentRowActiveOptions.value != null) {
        updateMenuPosition(currentRowActiveOptions.value);
      }
    };
    window.addEventListener("resize", recalc);
    scrollArea.value?.addEventListener("scroll", recalc, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);

    onBeforeUnmount(() => {
      window.removeEventListener("resize", recalc);
      scrollArea.value?.removeEventListener("scroll", recalc);
      document.removeEventListener("mousedown", handleClickOutside);
    });
  });

  // --- ---

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

  /* Локальний клас без Tailwind layer */
  .spinning {
    animation: spin 0.5s linear;
  }
</style>
