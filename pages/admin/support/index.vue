<template>
  <UiContainer>
    <div class="space-y-5">
      <div class="flex items-center justify-between w-full text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.support.title") }}</UiTextH4>

        <UiButtonDefault
          v-if="canCreateSupport"
          state="info"
          @click="handleClickCreateNewTicket">
          <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
          <span>New ticket</span>
        </UiButtonDefault>
      </div>

      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center justify-between gap-1 w-full max-w-60">
          <UiInput
            class="w-full max-w-[240px]"
            @input="handleInputSearch"
            :value="search"
            :placeholder="'Search'">
            <template #icon-left>
              <UiIconSearch />
            </template>
          </UiInput>
        </div>
        <div class="flex items-center justify-center gap-2">
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

          <ViewModeToggle
            v-if="!isMobileViewport"
            class="w-full sm:w-auto"
            bordered
            :modelValue="viewMode"
            :options="viewOptions"
            @update:modelValue="viewMode = $event" />

          <UiButtonDefault state="info--small">
            <UiIconFilters class="mr-2" />
            <UiTextSmall>Filters</UiTextSmall>
          </UiButtonDefault>
        </div>
      </div>

      <!-- Таблиця тікетів -->
      <PanelDefault
        v-if="viewMode === 'table'"
        ref="panelRef"
        class="relative rounded-2xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)]">
        <div
          class="absolute top-0 left-0 right-0 bottom-0 rounded-lg flex items-center justify-center bg-[var(--ui-background)]/40 backdrop-blur-sm"
          v-if="isLoading">
          <UiIconSpinnerDefault />
        </div>

        <div class="overflow-scroll no-scrollbar rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-stroke-ui-light)] h-[46px]">
              <tr class="text-left">
                <th class="px-4 font-semibold">
                  <UiTextSmall class="!text-[var(--ui-text-invert)]">ID Ticket</UiTextSmall>
                </th>
                <th class="px-4 font-semibold">
                  <UiTextSmall class="!text-[var(--ui-text-invert)]">Subject of the appeal</UiTextSmall>
                </th>
                <th class="px-4 font-semibold">
                  <div class="flex items-center justify-start gap-2">
                    <UiTextSmall
                      @click="handleOrderByAndDirection('last_message_at')"
                      class="!text-[var(--ui-text-invert)]">
                      Last Update
                    </UiTextSmall>
                    <UiIconSort
                      class="!text-[var(--ui-text-invert)]"
                      :active="orderBy === 'last_message_at'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('last_message_at')" />
                  </div>
                </th>
                <th class="px-4 font-semibold">
                  <UiTextSmall class="!text-[var(--ui-text-invert)] whitespace-nowrap">Counterparty</UiTextSmall>
                </th>
                <th class="px-4 font-semibold">
                  <div class="flex items-center justify-start gap-2">
                    <UiTextSmall
                      @click="handleOrderByAndDirection('status')"
                      class="!text-[var(--ui-text-invert)]">
                      Status
                    </UiTextSmall>
                    <UiIconSort
                      class="!text-[var(--ui-text-invert)]"
                      :active="orderBy === 'status'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('status')" />
                  </div>
                </th>
                <th class="px-2 font-semibold !text-[var(--ui-text-invert)]">...</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-stroke-ui-dark)]">
              <tr
                v-for="t in filtered"
                :key="t.id"
                class="bg-[var(--ui-background-panel)] hover:bg-[var(--color-stroke-ui-dark)] h-[60px] cursor-pointer"
                @click="handleClickRow(t.id)">
                <td class="px-4 whitespace-nowrap">
                  <div class="inline-flex items-center gap-2 min-w-0">
                    <div
                      class="h-[28px] w-[28px] rounded-full overflow-hidden border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background)] text-[10px] font-semibold text-[var(--ui-text-main)] flex items-center justify-center shrink-0 uppercase">
                      <img
                        v-if="getTicketClientAvatarUrl(t)"
                        :src="getTicketClientAvatarUrl(t)"
                        :alt="getTicketClientName(t)"
                        class="h-full w-full object-cover" />
                      <span v-else>{{ getTicketClientInitials(t) }}</span>
                    </div>
                    <span class="truncate">{{ t.id }}</span>
                    <span
                      class="shrink-0 text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-main)]"
                      title="Скопировать ID"
                      @click.stop>
                      <UiIconCopy :text="String(t.id)" />
                    </span>
                  </div>
                </td>

                <td class="px-4">
                  <div class="min-w-0">
                    <div class="truncate">
                      {{ t.subject }}
                    </div>
                    <span
                      class="ticket-channel-badge mt-1"
                      :class="getTicketChannelBadgeClass(t.channel, t.reply_email)">
                      {{ getTicketChannelLabel(t.channel, t.reply_email) }}
                    </span>
                  </div>
                </td>

                <td class="px-4 whitespace-nowrap">
                  {{ t.last_message_at }}
                </td>

                <td class="px-4">
                  <span
                    class="inline-flex items-center gap-1.5 text-xs text-[var(--ui-text-secondary)] whitespace-nowrap">
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="
                        t.counterparty_online ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'
                      " />
                    {{ t.counterparty_online ? "Online" : "Offline" }}
                  </span>
                </td>

                <td class="px-4">
                  <span
                    class="inline-flex items-center gap-1.5 text-xs text-[var(--ui-text-secondary)] whitespace-nowrap">
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="getTicketStatusDotClass(t.status)" />
                    {{ t.status }}
                  </span>
                </td>

                <td class="px-2 text-right">
                  <div class="flex items-center justify-end gap-2 relative">
                    <span
                      @click.stop="handleChatIconClick(t)"
                      class="relative h-[42px] w-[42px] flex items-center justify-center active:bg-[var(--color-stroke-ui-dark)] rounded-full hover:bg-[var(--color-stroke-ui-light)]">
                      <div
                        class="absolute top-1 right-1 bg-[--ui-sticker-danger] w-[16px] h-[16px] rounded-full border-none flex items-center justify-center"
                        v-if="t.unread_messages_count > 0">
                        {{ t.unread_messages_count }}
                      </div>
                      <UiIconChat class="!h-[24px] !w-[24px]" />
                    </span>
                    <button
                      class="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--color-stroke-ui-light)] active:opacity-[.5]"
                      aria-label="More"
                      @click.stop>
                      <UiIconDotsVertical />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PanelDefault>

      <div
        v-else
        class="relative">
        <div
          class="absolute inset-0 backdrop-blur-sm rounded-lg flex items-center justify-center"
          v-if="isLoading">
          <UiIconSpinnerDefault />
        </div>

        <div
          v-if="tickets.length === 0"
          class="w-full h-[50vh] flex items-center justify-center">
          <UiButtonDefault
            v-if="canCreateSupport"
            state="info"
            @click="handleClickCreateNewTicket">
            <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
            <span>New ticket</span>
          </UiButtonDefault>
        </div>

        <div
          v-else
          class="grid gap-3"
          :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'">
          <div
            v-for="ticket in filtered"
            :key="ticket.id"
            :class="[
              'ticket-card cursor-pointer rounded-xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] p-4 transition hover:bg-[var(--color-stroke-ui-dark)]',
              viewMode === 'full' ? 'ticket-card--full-row' : '',
            ]"
            @click="handleClickRow(ticket.id)">
            <div class="ticket-card__header">
              <div class="min-w-0">
                <div class="ticket-card__subject-row">
                  <div class="ticket-card__subject truncate">{{ ticket.subject }}</div>
                  <span
                    class="ticket-channel-badge"
                    :class="getTicketChannelBadgeClass(ticket.channel, ticket.reply_email)">
                    {{ getTicketChannelLabel(ticket.channel, ticket.reply_email) }}
                  </span>
                </div>
                <div class="ticket-card__id-row">#{{ ticket.id }}</div>
              </div>
            </div>

            <div class="ticket-card__meta-row">
              <div class="ticket-card__counterparty-col">
                <div class="ticket-card__avatar">
                  <img
                    v-if="getTicketClientAvatarUrl(ticket)"
                    :src="getTicketClientAvatarUrl(ticket)"
                    :alt="getTicketClientName(ticket)"
                    class="h-full w-full object-cover" />
                  <span v-else>{{ getTicketClientInitials(ticket) }}</span>
                </div>
                <span class="ticket-card__presence">
                  <span
                    class="ticket-card__presence-dot"
                    :class="
                      ticket.counterparty_online ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'
                    " />
                  {{ ticket.counterparty_online ? "Online" : "Offline" }}
                </span>
                <span class="ticket-card__updated">{{ ticket.last_message_at }}</span>
              </div>

              <div class="ticket-card__actions-col">
                <span class="ticket-card__status">
                  <span
                    class="ticket-card__status-dot"
                    :class="getTicketStatusDotClass(ticket.status)" />
                  {{ ticket.status }}
                </span>

                <div class="ticket-card__actions">
                  <button
                    class="ticket-card__icon-btn"
                    @click.stop
                    aria-label="Copy ID">
                    <UiIconCopy :text="String(ticket.id)" />
                  </button>
                  <button
                    class="ticket-card__icon-btn ticket-card__chat-btn"
                    @click.stop="handleChatIconClick(ticket)"
                    aria-label="Open chat">
                    <span
                      v-if="ticket.unread_messages_count > 0"
                      class="ticket-card__chat-badge">
                      {{ ticket.unread_messages_count }}
                    </span>
                    <UiIconChat class="!h-[20px] !w-[20px]" />
                  </button>
                  <button
                    class="ticket-card__icon-btn"
                    aria-label="More"
                    @click.stop>
                    <UiIconDotsVertical />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагінація -->
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
            :class="{ 'bg-[var(--ui-primary-main)] text-white': currentPage === page }"
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

      <ChatDefault
        :admin-chat="true"
        v-if="currentTicketIdForChat"
        :ticket-id="currentTicketIdForChat"
        :currentUser="currentUser"
        :can-reply="canUpdateSupport"
        @close="handleCloseChat"
        class="fixed inset-0 z-[12000]" />
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import {
    ref,
    computed,
    nextTick,
    onMounted,
    onBeforeUnmount,
    computed as vComputed,
    reactive,
    inject,
    watch,
    h,
  } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useNuxtApp } from "nuxt/app";
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";
  import UiIconPlus from "~/components/ui/UiIconPlus.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiIconFilters from "~/components/ui/UiIconFilters.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSort from "~/components/ui/UiIconSort.vue";
  import useAppCore from "~/composables/useAppCore";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconChat from "~/components/ui/UiIconChat.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import TicketsCreateNew from "~/pages/admin/support/components/TicketsCreateNew.vue";
  import { useRouter } from "vue-router";
  import useEventBus from "~/composables/useEventBus";
  import { useLocalePath } from "~/.nuxt/imports";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";
  const { $echo } = useNuxtApp() as { $echo?: any };

  const tickets = reactive([]);

  const currentUser = reactive({
    id: null,
    linkedUserId: null,
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    photoUrl: null,
  });

  const sortByFilterData = reactive([
    {
      id: "created_at",
      value: "created_at",
      text: "Last created",
    },
    {
      id: "last_message_at",
      value: "last_message_at",
      text: "Last updated",
    },
    {
      id: "status",
      value: "status",
      text: "Status",
    },
  ]);

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const { openModal } = inject("modalControl") as { openModal: Function };

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const router = useRouter();
  const localePath = useLocalePath();
  const canCreateSupport = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-support")
  );
  const canUpdateSupport = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-support")
  );

  const isLoading = ref(false);
  const search = ref("");
  const total = ref(0);
  const perPage = ref(7);
  const currentPage = ref(1);
  const orderBy = ref("last_message_at");
  const orderDirection = ref(ORDER_DIRECTION_DESC);
  const currentRowActiveOptions = ref<number | null>(null);
  const VIEW_MODE_STORAGE_KEY = "admin_support_view_mode";
  const ADMIN_SUPPORT_LIST_REFRESH_MS = 20000;
  const SUPPORT_REALTIME_RETRY_MS = 5000;
  const viewMode = ref<"table" | "cards" | "full">("table");
  const isMobileViewport = ref(false);
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

  const currentTicketIdForChat = ref<string | null>(null);

  const filtered = computed(() =>
    tickets.filter(t =>
      `${t.id} ${t.subject} ${t.last_message_at} ${t.status} ${t.channel ?? ""} ${t.reply_email ?? ""}`
        .toLowerCase()
        .includes(search.value.toLowerCase())
    )
  );

  const getTicketChannelKey = (channel: unknown, replyEmail?: unknown): "chat" | "email" => {
    const normalizedChannel = String(channel ?? "")
      .trim()
      .toLowerCase();

    const normalizedReplyEmail = String(replyEmail ?? "").trim();
    if (!normalizedChannel && normalizedReplyEmail) {
      return "email";
    }

    return normalizedChannel === "email" ? "email" : "chat";
  };

  const getTicketChannelLabel = (channel: unknown, replyEmail?: unknown): string =>
    getTicketChannelKey(channel, replyEmail) === "email" ? "Email" : "Chat";

  const getTicketChannelBadgeClass = (channel: unknown, replyEmail?: unknown): string =>
    getTicketChannelKey(channel, replyEmail) === "email" ? "ticket-channel-badge--email" : "ticket-channel-badge--chat";

  const getTicketStatusDotClass = (status: unknown) => {
    const normalizedStatus = String(status ?? "")
      .trim()
      .toLowerCase();

    if (["open", "in_progress", "in progress", "pending", "active"].includes(normalizedStatus)) {
      return "bg-[var(--ui-sticker-success)]";
    }

    if (["closed", "resolved", "cancelled", "rejected", "archived"].includes(normalizedStatus)) {
      return "bg-[var(--ui-sticker-danger)]";
    }

    return "bg-[var(--ui-text-secondary)]";
  };

  const getTicketClientAvatarUrl = (ticket: any): string => {
    const rawUrl = ticket?.creator?.photo_url ?? ticket?.creator_photo_url ?? "";
    return typeof rawUrl === "string" ? rawUrl.trim() : "";
  };

  const extractTicketClientInitials = (ticket: any): string => {
    const directInitials = String(ticket?.creator?.initials ?? ticket?.creator_initials ?? "")
      .trim()
      .toUpperCase();
    if (directInitials) {
      return directInitials.slice(0, 2);
    }

    const firstName = String(ticket?.creator?.first_name ?? "").trim();
    const lastName = String(ticket?.creator?.last_name ?? "").trim();
    const fullNameInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase();
    if (fullNameInitials) {
      return fullNameInitials.slice(0, 2);
    }

    const email = String(ticket?.creator?.email ?? ticket?.creator_email ?? "")
      .trim()
      .toUpperCase();
    if (email) {
      return email.slice(0, 2);
    }

    return "CL";
  };

  const getTicketClientInitials = (ticket: any): string => extractTicketClientInitials(ticket);

  const getTicketClientName = (ticket: any): string => {
    const firstName = String(ticket?.creator?.first_name ?? "").trim();
    const lastName = String(ticket?.creator?.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }

    const email = String(ticket?.creator?.email ?? ticket?.creator_email ?? "").trim();
    if (email) {
      return email;
    }

    return `Client #${String(ticket?.creator_id ?? ticket?.id ?? "")}`;
  };

  definePageMeta({ layout: "default", middleware: ["admin-middleware"] });

  /* ===== Пересувний чат: без виділення і лагів ===== */
  const panelRef = ref<HTMLElement | null>(null);
  const chatRef = ref<HTMLElement | null>(null);
  const chatOpen = ref(true);
  const pos = ref({ x: 16, y: 16 }); // логічні координати
  const chatStyle = vComputed(() => ({
    // застосовуємо transform замість left/top
    left: "0px",
    top: "0px",
    transform: `translate3d(${pos.value.x}px, ${pos.value.y}px, 0)`,
  }));
  const draft = ref("");

  let dragging = false;
  let grabOffset = { x: 0, y: 0 };
  let bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  let hostRectCache = { left: 0, top: 0, width: 0, height: 0 };
  let rafId = 0;

  let currentPointerId: number | null = null;

  const getHostRect = () => {
    const chat = chatRef.value;
    if (!chat) return { left: 0, top: 0, width: 0, height: 0 };
    const isFixed = getComputedStyle(chat).position === "fixed";
    if (isFixed) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const host: any = (panelRef as any).value;
    const el = host?.$el ?? host;
    return el?.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 };
  };

  const calcBounds = () => {
    const chat = chatRef.value;
    if (!chat) return;
    const chatRect = chat.getBoundingClientRect();
    const maxX = (hostRectCache.width ?? 0) - chatRect.width - 16;
    const maxY = (hostRectCache.height ?? 0) - chatRect.height - 16;
    bounds = { left: 16, top: 16, right: Math.max(16, maxX), bottom: Math.max(16, maxY) };
  };

  const placeBottomLeft = async () => {
    await nextTick();
    if (!chatRef.value) return;
    hostRectCache = getHostRect();
    calcBounds();
    pos.value.x = bounds.left;
    pos.value.y = bounds.bottom;
  };

  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

  const onDragStart = (e: PointerEvent) => {
    const chat = chatRef.value;
    if (!chat) return;

    dragging = true;
    currentPointerId = e.pointerId;
    chat.setPointerCapture?.(e.pointerId);

    // Забороняємо виділення і ставимо курсор
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    e.preventDefault();
    hostRectCache = getHostRect();
    calcBounds();

    const rect = chat.getBoundingClientRect();
    grabOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (ev: PointerEvent) => {
      if (!dragging) return;
      ev.preventDefault(); // блокує виділення/скрол на сенсорі

      const nx = ev.clientX - (hostRectCache.left ?? 0) - grabOffset.x;
      const ny = ev.clientY - (hostRectCache.top ?? 0) - grabOffset.y;

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        pos.value.x = clamp(nx, bounds.left, bounds.right);
        pos.value.y = clamp(ny, bounds.top, bounds.bottom);
        rafId = 0;
      });
    };

    const onEnd = () => {
      dragging = false;
      if (currentPointerId !== null) chat.releasePointerCapture?.(currentPointerId);
      window.removeEventListener("pointermove", onMove, passiveFalse);
      window.removeEventListener("pointerup", onEnd, passiveFalse);
      window.removeEventListener("pointercancel", onEnd, passiveFalse);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (rafId) (cancelAnimationFrame(rafId), (rafId = 0));
    };

    window.addEventListener("pointermove", onMove, passiveFalse);
    window.addEventListener("pointerup", onEnd, passiveFalse);
    window.addEventListener("pointercancel", onEnd, passiveFalse);
  };

  const passiveFalse = { passive: false } as AddEventListenerOptions;
  let adminSupportListRefreshTimer: ReturnType<typeof setInterval> | null = null;
  let supportGlobalChannel: any = null;
  let supportRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let supportSocketStateHandler: ((states: any) => void) | null = null;
  let supportResumeListenersAttached = false;
  let reloadQueued = false;
  const supportLoadErrorNotified = ref(false);

  const loadData = async () => {
    if (isLoading.value) {
      reloadQueued = true;
      return;
    }

    do {
      reloadQueued = false;
      isLoading.value = true;
      try {
        const response = await appCore.adminModules.tickets.get({
          search: search.value,
          channel: "all",
          perPage: perPage.value,
          page: currentPage.value,
          orderBy: orderBy.value,
          orderDirection: orderDirection.value,
        });

        perPage.value = response.data.meta.per_page;
        currentPage.value = response.data.meta.current_page;
        total.value = response.data.meta.total;

        tickets.splice(0, tickets.length, ...response.data.data);
        supportLoadErrorNotified.value = false;
      } catch (error) {
        console.error("admin support loadData failed", error);
        if (!supportLoadErrorNotified.value) {
          toast.error("Failed to load support tickets.");
          supportLoadErrorNotified.value = true;
        }
      } finally {
        isLoading.value = false;
      }
    } while (reloadQueued);
  };

  const resolveEchoClient = () => {
    if ($echo && typeof $echo.private === "function") {
      return $echo;
    }
    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }
    return null;
  };

  const reconnectSupportSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // noop
      }
    }
  };

  const connectSupportRealtime = () => {
    const echoClient = resolveEchoClient();
    if (!echoClient || supportGlobalChannel) return;

    reconnectSupportSocketTransport();
    supportGlobalChannel = echoClient.private("support.global");
    supportGlobalChannel.stopListening(".MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen(".MessageSent", handleSupportListReload);
    supportGlobalChannel.listen("MessageSent", handleSupportListReload);
    supportGlobalChannel.listen(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.listen("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.listen(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.listen(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.listen("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
  };

  const disconnectSupportRealtime = () => {
    if (!supportGlobalChannel) return;

    supportGlobalChannel.stopListening(".MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening("App\\Events\\MessageSent", handleSupportListReload);
    supportGlobalChannel.stopListening(".MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening("App\\Events\\MessageRead", handleSupportUnreadUpdated);
    supportGlobalChannel.stopListening(".ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("ticket.presence.updated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceRealtime);
    supportGlobalChannel = null;
  };

  const bindSupportSocketStateListener = () => {
    if (supportSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") return;

    supportSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        connectSupportRealtime();
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectSupportSocketTransport();
      }
    };

    connection.bind("state_change", supportSocketStateHandler);
  };

  const unbindSupportSocketStateListener = () => {
    if (!supportSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", supportSocketStateHandler);
    }
    supportSocketStateHandler = null;
  };

  const startSupportRealtimeRetry = () => {
    if (supportRealtimeRetryTimer) return;

    supportRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      reconnectSupportSocketTransport();
      connectSupportRealtime();
    }, SUPPORT_REALTIME_RETRY_MS);
  };

  const stopSupportRealtimeRetry = () => {
    if (!supportRealtimeRetryTimer) return;

    clearInterval(supportRealtimeRetryTimer);
    supportRealtimeRetryTimer = null;
  };

  const handleSupportRealtimeResume = () => {
    reconnectSupportSocketTransport();
    connectSupportRealtime();
  };

  const handleSupportVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    handleSupportRealtimeResume();
  };

  const handleSupportOnline = () => {
    handleSupportRealtimeResume();
  };

  const handleSupportPageShow = () => {
    handleSupportRealtimeResume();
  };

  const attachSupportResumeListeners = () => {
    if (supportResumeListenersAttached) return;
    document.addEventListener("visibilitychange", handleSupportVisibilityChange);
    window.addEventListener("online", handleSupportOnline);
    window.addEventListener("pageshow", handleSupportPageShow);
    supportResumeListenersAttached = true;
  };

  const detachSupportResumeListeners = () => {
    if (!supportResumeListenersAttached) return;
    document.removeEventListener("visibilitychange", handleSupportVisibilityChange);
    window.removeEventListener("online", handleSupportOnline);
    window.removeEventListener("pageshow", handleSupportPageShow);
    supportResumeListenersAttached = false;
  };

  const syncCurrentTicketUnreadCount = (ticketId: string, unreadCount: number) => {
    const target = tickets.find((item: any) => String(item.id) === String(ticketId));
    if (!target) return;
    target.unread_messages_count = Math.max(0, unreadCount);
  };

  const syncCurrentTicketCounterpartyOnline = (ticketId: string, counterpartyOnline: boolean) => {
    const target = tickets.find((item: any) => String(item.id) === String(ticketId));
    if (!target) return;
    target.counterparty_online = counterpartyOnline;
  };

  const normalizeSupportUnreadPayload = (payload?: any): { ticketId: string; unread: number } | null => {
    if (!payload || typeof payload !== "object") return null;

    const rawTicketId = payload.ticketId ?? payload.ticket_id;
    const rawUnread = payload.unread ?? payload.unread_count ?? payload.unread_messages_count;
    if (rawTicketId === undefined || rawTicketId === null || rawUnread === undefined || rawUnread === null) return null;

    const normalizedUnread = Number(rawUnread);
    if (!Number.isFinite(normalizedUnread)) return null;

    return {
      ticketId: String(rawTicketId),
      unread: Math.max(0, normalizedUnread),
    };
  };

  const applySupportUnreadPayload = (payload?: any): boolean => {
    const normalizedPayload = normalizeSupportUnreadPayload(payload);
    if (!normalizedPayload) return false;

    syncCurrentTicketUnreadCount(normalizedPayload.ticketId, normalizedPayload.unread);
    return true;
  };

  const normalizeSupportPresencePayload = (payload?: any): { ticketId: string; counterpartyOnline: boolean } | null => {
    if (!payload || typeof payload !== "object") return null;

    const data = payload?.data ?? payload;
    const rawTicketId = data.ticketId ?? data.ticket_id;
    const rawCounterpartyOnline = data.counterparty_online ?? data.counterpartyOnline ?? Boolean(data.online_client);
    if (rawTicketId === undefined || rawTicketId === null || rawCounterpartyOnline === undefined) return null;

    return {
      ticketId: String(rawTicketId),
      counterpartyOnline: Boolean(rawCounterpartyOnline),
    };
  };

  const applySupportPresencePayload = (payload?: any): boolean => {
    const normalizedPayload = normalizeSupportPresencePayload(payload);
    if (!normalizedPayload) return false;

    syncCurrentTicketCounterpartyOnline(normalizedPayload.ticketId, normalizedPayload.counterpartyOnline);
    return true;
  };

  const startAdminSupportListRefresh = () => {
    if (adminSupportListRefreshTimer) return;

    adminSupportListRefreshTimer = setInterval(() => {
      loadData().catch(() => {});
    }, ADMIN_SUPPORT_LIST_REFRESH_MS);
  };

  const stopAdminSupportListRefresh = () => {
    if (!adminSupportListRefreshTimer) return;

    clearInterval(adminSupportListRefreshTimer);
    adminSupportListRefreshTimer = null;
  };

  const syncViewport = () => {
    if (typeof window === "undefined") return;
    isMobileViewport.value = window.innerWidth < 768;
  };

  const handleWindowResize = () => {
    syncViewport();
    void placeBottomLeft();
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

  const openChat = async () => {
    chatOpen.value = true;
    await placeBottomLeft();
  };

  const handleClickCreateNewTicket = async () => {
    if (!canCreateSupport.value) {
      return;
    }

    openModal(TicketsCreateNew, {
      title: "Создать новую заявку",
    });
  };

  const handleInputSearch = async (value: string) => {
    search.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const handleClickUpdate = async () => {
    console.log("handleClickUpdate");
    await loadData();
  };

  const handleChangeFilterSortBy = async (value: string) => {
    if (orderBy.value === value)
      orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
    else orderBy.value = value;

    await loadData();
  };

  const handleOrderByAndDirection = async (value: string) => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    orderBy.value = value;
    await loadData();
  };

  const handleCloseChat = () => {
    currentTicketIdForChat.value = null;
  };

  const handleChangePerPage = async (newPerPage: number) => {
    perPage.value = newPerPage;
    await loadData();
  };

  const buildSupportRoute = (ticketId: string) => localePath(`/support/${ticketId}`);

  const handleClickRow = (ticketId: string) => router.push(buildSupportRoute(ticketId));

  const handleChatIconClick = (ticket: any) => {
    const ticketId = String(ticket?.id ?? "");
    if (!ticketId) return;

    const channel = getTicketChannelKey(ticket?.channel, ticket?.reply_email);
    if (channel === "email") {
      router.push(buildSupportRoute(ticketId));
      return;
    }

    if (isMobileViewport.value) {
      router.push(buildSupportRoute(ticketId));
      return;
    }

    currentTicketIdForChat.value = ticketId;
  };

  const handleSupportListReload = () => {
    loadData().catch(() => {});
  };

  const handleSupportUnreadUpdated = (payload?: any) => {
    if (applySupportUnreadPayload(payload)) return;
    loadData().catch(() => {});
  };

  const handleSupportPresenceUpdated = (payload?: any) => {
    applySupportPresencePayload(payload);
  };

  const handleSupportPresenceRealtime = (payload?: any) => {
    applySupportPresencePayload(payload);
  };

  onMounted(async () => {
    // useEventBus.on("loadDataForAdminSupport", loadData);
    useEventBus.on(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.on(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    connectSupportRealtime();
    bindSupportSocketStateListener();
    attachSupportResumeListeners();
    startSupportRealtimeRetry();

    const response = await appCore.adminModules.auth.getAuthUser();
    const photoUrl = response.data.photo_url ?? response.data.avatar_url ?? response.data.avatar ?? null;
    currentUser.id = response.data.id;
    currentUser.linkedUserId = response.data.user_id ?? null;
    currentUser.name = response.data.nickname ?? response.data.first_name ?? null;
    currentUser.firstName = response.data.first_name ?? null;
    currentUser.lastName = response.data.last_name ?? null;
    currentUser.email = response.data.email ?? null;
    currentUser.photoUrl = typeof photoUrl === "string" ? photoUrl : null;

    console.log("response.data", response.data.data);

    syncViewport();
    initViewMode();

    await nextTick();
    await placeBottomLeft();
    window.addEventListener("resize", handleWindowResize);
    await loadData();
    startAdminSupportListRefresh();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.off(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    disconnectSupportRealtime();
    unbindSupportSocketStateListener();
    detachSupportResumeListeners();
    stopSupportRealtimeRetry();
    stopAdminSupportListRefresh();
    window.removeEventListener("resize", handleWindowResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  });

  const send = () => {
    draft.value = "";
  };
  /* ===== /Пересувний чат ===== */
</script>

<style scoped>
  .ticket-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ticket-card__header {
    min-width: 0;
  }

  .ticket-card__subject {
    color: var(--ui-text-main);
    font-size: 16px;
    line-height: 1.25;
    font-weight: 700;
  }

  .ticket-card__subject-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .ticket-channel-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid transparent;
  }

  .ticket-channel-badge--chat {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
    border-color: color-mix(in srgb, var(--ui-primary-main) 50%, transparent);
  }

  .ticket-channel-badge--email {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-sticker-warning) 22%, transparent);
    border-color: color-mix(in srgb, var(--ui-sticker-warning) 55%, transparent);
  }

  .ticket-card__id-row {
    margin-top: 2px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.2;
  }

  .ticket-card__meta-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .ticket-card__counterparty-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
  }

  .ticket-card__avatar {
    height: 34px;
    width: 34px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background);
    color: var(--ui-text-main);
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  .ticket-card__presence {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.2;
    font-weight: 500;
    white-space: nowrap;
  }

  .ticket-card__presence-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .ticket-card__updated {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .ticket-card__actions-col {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ticket-card__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .ticket-card__status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .ticket-card__actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ticket-card__icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid transparent;
    color: var(--ui-text-secondary);
    background: transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .ticket-card__icon-btn:hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--color-stroke-ui-light) 40%, transparent);
  }

  .ticket-card__chat-badge {
    position: absolute;
    top: 1px;
    right: 1px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--ui-sticker-danger);
    color: #fff;
    font-size: 10px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ticket-card--full-row {
    display: grid;
    grid-template-columns: minmax(260px, 1.2fr) minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    row-gap: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  @media (max-width: 1024px) {
    .ticket-card--full-row {
      grid-template-columns: 1fr;
      row-gap: 10px;
    }
  }

  @media (max-width: 640px) {
    .ticket-card__meta-row {
      grid-template-columns: 1fr;
      align-items: flex-start;
    }

    .ticket-card__actions-col {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>

<!--<template>-->
<!--  <div class="settings">-->
<!--    <UiTextH4>{{ t("admin.settings.title") }}</UiTextH4>-->

<!--    <div>...</div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { ref, computed, watch, onMounted } from "vue";-->
<!--import { useI18n } from "vue-i18n";-->

<!--import TabsDefault from "~/components/block/tabs/TabsDefault.vue";-->
<!--import UiTextH4 from "~/components/ui/UiTextH4.vue";-->

<!--import Appearance from "./components/Appearance.vue";-->
<!--import General from "./components/General.vue";-->
<!--import Secure from "./components/Secure.vue";-->

<!--const { t } = useI18n();-->

<!--const STORAGE_KEY = "setingsActiveTab";-->
<!--const activeTabIndex = ref(0);-->
<!--const tabsList = computed(() => {-->
<!--  return [-->
<!--    { label: t("admin.settings.tabs.general"), component: General },-->
<!--    { label: t("admin.settings.tabs.appearance"), component: Appearance },-->
<!--    {-->
<!--      label: t("admin.settings.tabs.secure"),-->
<!--      component: Secure,-->
<!--    },-->
<!--  ];-->
<!--});-->

<!--const activeTabContent = computed(() => {-->
<!--  return tabsList.value[activeTabIndex.value].component;-->
<!--});-->

<!--const handleActiveTab = (tabIndex: number) => {-->
<!--  activeTabIndex.value = tabIndex;-->
<!--};-->

<!--onMounted(() => {-->
<!--  const saved = localStorage.getItem(STORAGE_KEY);-->
<!--  if (saved !== null && !isNaN(+saved)) {-->
<!--    activeTabIndex.value = +saved;-->
<!--  }-->
<!--});-->

<!--watch(activeTabIndex, (newIndex) => {-->
<!--  localStorage.setItem(STORAGE_KEY, newIndex.toString());-->
<!--});-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.settings {-->
<!--  padding: 20px;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  gap: 50px;-->

<!--  &__tabs {-->
<!--    display: flex;-->
<!--    align-items: end;-->
<!--    justify-content: end;-->
<!--  }-->

<!--  h4 {-->
<!--    color: var(&#45;&#45;ui-text-main);-->
<!--  }-->
<!--}-->

<!--.slide-short-enter-active,-->
<!--.slide-short-leave-active {-->
<!--  transition: opacity 0.1s ease, transform 0.1s ease;-->
<!--}-->

<!--.slide-short-enter-from {-->
<!--  opacity: 0;-->
<!--  transform: translateX(30px);-->
<!--}-->

<!--.slide-short-enter-to {-->
<!--  opacity: 1;-->
<!--  transform: translateX(0);-->
<!--}-->

<!--.slide-short-leave-from {-->
<!--  opacity: 1;-->
<!--  transform: translateX(0);-->
<!--}-->

<!--.slide-short-leave-to {-->
<!--  opacity: 0;-->
<!--  transform: translateX(-30px);-->
<!--}-->
<!--</style>-->
