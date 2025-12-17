<template>
  <UiContainer>
    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center text-[var(--ui-text-main)]">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>
    <div v-else class="space-y-5 text-[var(--ui-text-main)]">
      <div class="my-5 flex items-center justify-between w-full text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("support.page.title") }}</UiTextH4>

        <UiButtonDefault state="info" @click="handleClickCreateNewTicket">
          <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]"/>
          <span>{{ t("support.page.newTicket") }}</span>
        </UiButtonDefault>
      </div>

      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center justify-between gap-1 w-full max-w-60">
          <UiInput
              class="w-full max-w-[240px]"
              @input="handleInputSearch"
              :value="search"
              :placeholder="t('support.page.searchPlaceholder')"
          >
            <template #icon-left>
              <UiIconSearch/>
            </template>
          </UiInput>
        </div>
        <div class="flex items-center justify-center gap-2">

          <UiButtonDefault state="info--small" class="mr-2" @click="handleClickUpdate">
            <UiIconUpdate v-if="!isLoading"/>
            <UiIconSpinnerDefault v-if="isLoading"/>
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
                  class="mr-2 !w-[16px] !h-[16px]"
                  :orderDirectionEnabled="true"
                  :orderDirection="orderDirection"
              />
            </template>
          </UiSelect>

          <ViewModeToggle
            class="w-full sm:w-auto"
            bordered
            :modelValue="viewMode"
            :options="viewOptions"
            @update:modelValue="viewMode = $event"
          />

<!--          <UiButtonDefault state="info&#45;&#45;small">-->
<!--            <UiIconFilters class="mr-2"/>-->
<!--            <UiTextSmall>Filters</UiTextSmall>-->
<!--          </UiButtonDefault>-->
        </div>
      </div>

      <!-- Таблиця тікетів -->
      <PanelDefault
          v-if="viewMode === 'table'"
          ref="panelRef"
          class="relative rounded-2xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)]"
      >
        <div
            class="absolute !top-[46px] left-0 right-0 bottom-0 backdrop-blur-sm rounded-lg flex items-center justify-center"
            v-show="isLoading">
          <UiIconSpinnerDefault/>
        </div>

        <div class="overflow-scroll no-scrollbar rounded-lg">

          <table class="w-full text-sm">
            <thead class="bg-[var(--color-stroke-ui-light)] h-[46px]">
            <tr class="text-left">
              <th class="px-4 font-semibold w-[40px]">
                <UiTextSmall>ID</UiTextSmall>
              </th>
              <th class="px-4 font-semibold w-full">
                <UiTextSmall>{{ t("support.page.subject") }}</UiTextSmall>
              </th>
              <th class="px-4 font-semibold">
                <div class="flex items-center justify-start gap-2">
              <UiTextSmall @click="handleOrderByAndDirection('last_message_at')" class="whitespace-nowrap">
                    {{ t("support.page.lastUpdate") }}
              </UiTextSmall>
                  <UiIconSort
                      :active="orderBy === 'last_message_at'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('last_message_at')"
                  />
                </div>
              </th>
              <th class="px-4 font-semibold">
                <div class="flex items-center justify-start gap-2">
                  <UiTextSmall @click="handleOrderByAndDirection('status')">
                    {{ t("support.page.status") }}
                  </UiTextSmall>
                  <UiIconSort
                      :active="orderBy === 'status'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('status')"
                  />
                </div>
              </th>
              <th class="px-2 font-semibold">...</th>
            </tr>
            </thead>
<!--            <tbody v-if="!isLoading && tickets.length > 0" class="divide-y divide-[var(&#45;&#45;color-stroke-ui-dark)]">-->
            <tbody v-if="tickets.length > 0" class="divide-y divide-[var(--color-stroke-ui-dark)]">
            <tr v-for="t in filtered" :key="t.id"
                class="bg-[var(--ui-background-panel)] hover:bg-[var(--color-stroke-ui-dark)] h-[60px]"
                @click="handleClickRow(t.id)"
            >

              <td class="px-4 whitespace-nowrap">
                <UiIconCopy @click.stop :text="t.id" />
              </td>

              <td class="px-4">
                <div class="truncate">
                  {{ t.subject }}
                </div>
              </td>

              <td class="px-4 whitespace-nowrap">
                {{ t.last_message_at }}
              </td>

              <td class="px-4">
                <UiBadge :outline="true" state="info" class="whitespace-nowrap !p-[10px]">{{ t.status }}</UiBadge>
              </td>

              <td class="px-2 text-right">
                <div class="flex items-center justify-end gap-2">
                    <span
                        @click.stop="() => currentTicketIdForChat = t.id"
                        class="h-[42px] w-[42px] flex items-center justify-center active:bg-[var(--color-stroke-ui-dark)] rounded-full hover:bg-[var(--color-stroke-ui-light)]">
                      <UiIconChat class="!h-[24px] !w-[24px]"/>
                    </span>
                  <button
                      class="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--color-stroke-ui-light)] active:opacity-[.5]"
                      aria-label="More"
                      @click.stop
                  >
                    <UiIconDotsVertical @click.stop/>
                  </button>
                </div>
              </td>

            </tr>
            </tbody>
          </table>

<!--          <div v-if="!isLoading && tickets.length === 0" class="w-full h-[100px] flex items-center justify-center">-->
          <div v-if="tickets.length === 0" class="w-full h-[50vh] flex items-center justify-center">
            <UiButtonDefault state="info" @click="handleClickCreateNewTicket">
              <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]"/>
              <span>{{ t("support.page.newTicket") }}</span>
            </UiButtonDefault>
          </div>
        </div>

      </PanelDefault>

      <div v-else class="relative">
        <div
          class="absolute inset-0 backdrop-blur-sm rounded-lg flex items-center justify-center"
          v-if="isLoading"
        >
          <UiIconSpinnerDefault/>
        </div>

        <div v-if="tickets.length === 0" class="w-full h-[50vh] flex items-center justify-center">
          <UiButtonDefault state="info" @click="handleClickCreateNewTicket">
            <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]"/>
            <span>{{ t("support.page.newTicket") }}</span>
          </UiButtonDefault>
        </div>

        <div
          v-else
          class="grid gap-3"
          :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'"
        >
          <div
            v-for="ticket in filtered"
            :key="ticket.id"
            class="ticket-card cursor-pointer rounded-xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] p-4 transition hover:bg-[var(--color-stroke-ui-dark)]"
            @click="handleClickRow(ticket.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate font-semibold">{{ ticket.subject }}</div>
              </div>
              <UiBadge :outline="true" state="info" class="whitespace-nowrap">{{ ticket.status }}</UiBadge>
            </div>

            <div class="mt-3 flex items-center justify-between text-sm text-[var(--ui-text-secondary)]">
              <span>{{ t("support.page.lastUpdate") }}</span>
              <span class="whitespace-nowrap">{{ ticket.last_message_at }}</span>
            </div>

            <div class="mt-3 flex items-center justify-end gap-2">
              <button
                class="h-[36px] w-[36px] flex items-center justify-center rounded-md hover:bg-[var(--color-stroke-ui-light)] active:opacity-[.5]"
                @click.stop
                aria-label="Copy ID"
              >
                <UiIconCopy :text="ticket.id" />
              </button>
              <button
                class="h-[36px] w-[36px] flex items-center justify-center rounded-md hover:bg-[var(--color-stroke-ui-light)] active:opacity-[.5]"
                @click.stop="() => currentTicketIdForChat = ticket.id"
                aria-label="Open chat"
              >
                <UiIconChat class="!h-[20px] !w-[20px]"/>
              </button>
              <button
                class="h-[36px] w-[36px] flex items-center justify-center rounded-md hover:bg-[var(--color-stroke-ui-light)] active:opacity-[.5]"
                aria-label="More"
                @click.stop
              >
                <UiIconDotsVertical/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагінація -->
      <div class="px-5 h-[50px] mt-2 flex items-center justify-between">
        <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">
          <UiTextSmall class="mr-2">{{ t("support.page.perPage") }}</UiTextSmall>
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
              :class="{ 'bg-[var(--ui-primary-main)] text-white': currentPage === page }"
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

      <ChatDefault
          v-if="currentTicketIdForChat"
          :ticket-id="currentTicketIdForChat"
          :currentUser="currentUser"
          @close="handleCloseChat"
          class="fixed inset-0 z-50"
      />
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import ChatDefault from "~/components/block/chats/ChatDefault.vue";
import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import TicketsCreateNew from "~/pages/support/components/TicketsCreateNew.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from '~/components/ui/UiContainer.vue'
import UiIconChat from "~/components/ui/UiIconChat.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconPlus from "~/components/ui/UiIconPlus.vue";
import UiIconSearch from '~/components/ui/UiIconSearch.vue'
import UiIconSort from "~/components/ui/UiIconSort.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from '~/components/ui/UiInput.vue'
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import {definePageMeta, useAuthStore} from '~/.nuxt/imports'
import {ref, computed, nextTick, onMounted, onBeforeUnmount, computed as vComputed, reactive, inject, watch, h} from 'vue'
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";

type Status = 'resolved' | 'in_progress' | 'cancelled'

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const tickets = reactive([])

const currentUser = reactive({
  id: null,
  name: null,
})

const authStore = useAuthStore();

const sortByFilterData = reactive(
    [
      {
        id: 'created_at',
        value: 'created_at',
        text: 'Last created',
      },
      {
        id: 'last_message_at',
        value: 'last_message_at',
        text: 'Last updated',
      },
      {
        id: 'status',
        value: 'status',
        text: 'Status'
      }
    ]
)

const {t} = useI18n({useScope: 'global'})
const {openModal} = inject("modalControl") as { openModal: Function };

const appCore = useAppCore();

const isLoading = ref(false)
const isInitialLoading = ref(true)
const search = ref("");
const total = ref(0);
const perPage = ref(7);
const currentPage = ref(1);
const orderBy = ref("last_message_at");
const orderDirection = ref(ORDER_DIRECTION_DESC);
const currentRowActiveOptions = ref<number | null>(null);
const VIEW_MODE_STORAGE_KEY = "support_view_mode";
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

// ---

const currentTicketIdForChat = ref<number | null>(null);

const filtered = computed(() =>
    tickets.filter(t =>
        `${t.id} ${t.subject} ${t.lastUpdate} ${t.statusText}`.toLowerCase().includes(search.value.toLowerCase())
    )
)

const statusPillClass = (s: Status) => ({
  'border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10': s === 'resolved',
  'border-[var(--color-warning)]/30 text-[var(--color-warning)] bg-[var(--color-warning)]/10': s === 'in_progress',
  'border-[var(--color-danger)]/30  text-[var(--color-danger)]  bg-[var(--color-danger)]/10': s === 'cancelled',
})

definePageMeta({layout: 'cabinet', middleware: ['auth-client', 'client-check-auth']})

/* ===== Пересувний чат: без виділення і лагів ===== */
const panelRef = ref<HTMLElement | null>(null)
const chatRef = ref<HTMLElement | null>(null)
const chatOpen = ref(true)
const pos = ref({x: 16, y: 16})                 // логічні координати
const chatStyle = vComputed(() => ({               // застосовуємо transform замість left/top
  left: '0px',
  top: '0px',
  transform: `translate3d(${pos.value.x}px, ${pos.value.y}px, 0)`,
}))
const draft = ref('')

let dragging = false
let grabOffset = {x: 0, y: 0}
let bounds = {left: 0, top: 0, right: 0, bottom: 0}
let hostRectCache = {left: 0, top: 0, width: 0, height: 0}
let rafId = 0

let currentPointerId: number | null = null

const router = useRouter()

const getHostRect = () => {
  const chat = chatRef.value
  if (!chat) return {left: 0, top: 0, width: 0, height: 0}
  const isFixed = getComputedStyle(chat).position === 'fixed'
  if (isFixed) return {left: 0, top: 0, width: window.innerWidth, height: window.innerHeight}
  const host: any = (panelRef as any).value
  const el = host?.$el ?? host
  return el?.getBoundingClientRect?.() || {left: 0, top: 0, width: 0, height: 0}
}

const calcBounds = () => {
  const chat = chatRef.value
  if (!chat) return
  const chatRect = chat.getBoundingClientRect()
  const maxX = (hostRectCache.width ?? 0) - chatRect.width - 16
  const maxY = (hostRectCache.height ?? 0) - chatRect.height - 16
  bounds = {left: 16, top: 16, right: Math.max(16, maxX), bottom: Math.max(16, maxY)}
}

const placeBottomLeft = async () => {
  await nextTick()
  if (!chatRef.value) return
  hostRectCache = getHostRect()
  calcBounds()
  pos.value.x = bounds.left
  pos.value.y = bounds.bottom
}

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)

const onDragStart = (e: PointerEvent) => {
  const chat = chatRef.value
  if (!chat) return

  dragging = true
  currentPointerId = e.pointerId
  chat.setPointerCapture?.(e.pointerId)

  // Забороняємо виділення і ставимо курсор
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'

  e.preventDefault()
  hostRectCache = getHostRect()
  calcBounds()

  const rect = chat.getBoundingClientRect()
  grabOffset = {x: e.clientX - rect.left, y: e.clientY - rect.top}

  const onMove = (ev: PointerEvent) => {
    if (!dragging) return
    ev.preventDefault() // блокує виділення/скрол на сенсорі

    const nx = ev.clientX - (hostRectCache.left ?? 0) - grabOffset.x
    const ny = ev.clientY - (hostRectCache.top ?? 0) - grabOffset.y

    if (rafId) return
    rafId = requestAnimationFrame(() => {
      pos.value.x = clamp(nx, bounds.left, bounds.right)
      pos.value.y = clamp(ny, bounds.top, bounds.bottom)
      rafId = 0
    })
  }

  const onEnd = () => {
    dragging = false
    if (currentPointerId !== null) chat.releasePointerCapture?.(currentPointerId)
    window.removeEventListener('pointermove', onMove, passiveFalse)
    window.removeEventListener('pointerup', onEnd, passiveFalse)
    window.removeEventListener('pointercancel', onEnd, passiveFalse)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    if (rafId) cancelAnimationFrame(rafId), (rafId = 0)
  }

  window.addEventListener('pointermove', onMove, passiveFalse)
  window.addEventListener('pointerup', onEnd, passiveFalse)
  window.addEventListener('pointercancel', onEnd, passiveFalse)
}

const passiveFalse = {passive: false} as AddEventListenerOptions

const loadData = async () => {
  isLoading.value = true;
  const response = await appCore.tickets.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  });

  perPage.value = response.data.meta.per_page;
  currentPage.value = response.data.meta.current_page;
  total.value = response.data.meta.total;

  tickets.splice(0, tickets.length, ...response.data.data);
  isLoading.value = false;
  isInitialLoading.value = false;
}

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

const openChat = async () => {
  chatOpen.value = true
  await placeBottomLeft()
}

const handleClickCreateNewTicket = async () => {
  console.log('handleClickCreateNewTicket')
  openModal(TicketsCreateNew, {
    title: 'Создать новую заявку',
  });
}

const handleInputSearch = async (value: string) => {
  search.value = value;
  currentPage.value = 1;
  await loadData();
}

const handleClickUpdate = async () => {
  console.log('handleClickUpdate')
  await loadData();
}

const handleChangeFilterSortBy = async (value: string) => {
  if (orderBy.value === value)
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC
        ? ORDER_DIRECTION_ASC
        : ORDER_DIRECTION_DESC;
  else
    orderBy.value = value;

  await loadData();
}

const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC
          ? ORDER_DIRECTION_DESC
          : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const handleCloseChat = () => currentTicketIdForChat.value = null;

const handleChangePerPage = async (newPerPage: number) => {
  perPage.value = newPerPage;
  await loadData();
};

const handleCopyId = async (id: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(id);
    } else {
      const ta = document.createElement('textarea');
      ta.value = id;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    console.log('Скопійовано в буфер:', id);
    return true;
  } catch (err) {
    console.error('Не вдалося скопіювати:', err);
    return false;
  }
};

const handleClickRow = (ticketId:string) => router.push(`/support/${ticketId}`)


onMounted(async () => {
  useEventBus.on("loadDataForSupport", loadData);

  const response = await appCore.auth.getAuthUser();
  currentUser.id = response.data.id;
  currentUser.name = response.data.first_name;

  initViewMode()

  await nextTick()
  await placeBottomLeft()
  window.addEventListener('resize', placeBottomLeft)
  await loadData();
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', placeBottomLeft)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
})

const send = () => {
  draft.value = ''
}
/* ===== /Пересувний чат ===== */
</script>
