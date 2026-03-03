<template>
  <UiContainer>
    <div class="support-ticket-page text-[var(--ui-text-main)]">
      <div
        ref="supportGridRef"
        class="support-ticket-grid grid gap-[20px] grid-cols-1 md:grid-cols-[1fr_2fr] items-stretch"
        :class="{
          'is-collapsed': !isSideExpanded,
          'is-mobile': isMobileViewport,
          'is-mobile-fullscreen': isMobileFullscreenChat,
        }"
        :style="supportGridStyle">
        <PanelDefault
          ref="supportSidePanelRef"
          class="support-side p-2"
          :class="{
            'is-collapsed': !isSideExpanded,
            'is-mobile': isMobileViewport,
          }"
          :style="supportSideStyle"
          @touchstart="handleSidePanelTouchStart"
          @touchmove="handleSidePanelTouchMove"
          @touchend="handleSidePanelTouchEnd"
          @touchcancel="handleSidePanelTouchEnd">
          <div
            v-if="isMobileViewport && isMobileFullscreenChat"
            class="support-side__mobile-header">
            <button
              type="button"
              class="support-side__mobile-arrow"
              aria-label="Close details"
              @click="collapseSidePanel()">
              <UiIconChevronUp />
            </button>
          </div>

          <div class="support-side__scroll flex flex-col gap-4">
            <div
              class="support-side__expand"
              :class="{ 'is-expanded': isSideExpanded }">
              <div class="support-side__collapsible">
                <div class="support-side__card support-side__ticket-card">
                  <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">Ticket ID</div>
                  <div class="support-side__ticket-id-row">
                    <UiIconCopy :text="id" />
                    <span
                      class="text-sm font-semibold truncate"
                      :title="id">
                      {{ id }}
                    </span>
                  </div>
                </div>

                <div class="support-side__status-grid">
                  <div class="support-side__card support-side__status-card">
                    <div class="flex items-center justify-between gap-3">
                      <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">Status</div>
                      <div class="support-side__status-pill">
                        <span class="support-side__status-dot"></span>
                        <span class="text-sm font-semibold">{{ status }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="support-side__card support-side__subject-card">
                    <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">Subject</div>
                    <div class="mt-2 text-sm font-semibold">{{ subject }}</div>
                  </div>
                </div>

                <div class="support-side__card support-side__participants">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold">Participants</div>
                    <span class="text-xs text-[var(--ui-text-secondary)]">{{ participants.length }} people</span>
                  </div>
                  <div class="mt-3 flex flex-col gap-2">
                    <div
                      v-for="person in participants"
                      :key="person.id"
                      class="support-side__participant">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="support-side__participant-avatar">
                          <img
                            v-if="person.photoUrl"
                            :src="person.photoUrl"
                            :alt="person.name"
                            class="support-side__participant-avatar-img" />
                          <span v-else>{{ person.initials }}</span>
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-medium truncate">
                            {{ person.name }}
                            <strong v-if="person.isYou">(You)</strong>
                          </div>
                          <div class="text-xs text-[var(--ui-text-secondary)]">{{ person.role }}</div>
                        </div>
                      </div>
                      <span
                        class="h-2 w-2 rounded-full support-side__presence"
                        :class="person.online ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'"
                        :title="person.online ? 'Online' : 'Offline'" />
                    </div>
                  </div>
                </div>

                <div class="support-side__card support-side__library">
                  <div class="support-side__tabs">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      type="button"
                      class="support-side__tab"
                      :class="activeTab === tab.id ? 'is-active' : ''"
                      @click="activeTab = tab.id">
                      {{ tab.label }}
                    </button>
                  </div>

                  <div class="mt-4">
                    <div
                      v-if="activeTab === 'media'"
                      class="grid grid-cols-3 gap-2">
                      <div
                        v-for="media in mediaItems"
                        :key="media.id"
                        class="support-side__media">
                        {{ media.label }}
                      </div>
                    </div>

                    <div
                      v-else-if="activeTab === 'videos'"
                      class="grid grid-cols-2 gap-2">
                      <div
                        v-for="video in videoItems"
                        :key="video.id"
                        class="support-side__video">
                        <div class="text-xs text-[var(--ui-text-secondary)]">Video</div>
                        <div class="mt-1 font-medium text-sm truncate">{{ video.title }}</div>
                        <div class="mt-2 text-xs text-[var(--ui-text-secondary)]">{{ video.duration }}</div>
                      </div>
                    </div>

                    <div
                      v-else
                      class="flex flex-col gap-2">
                      <a
                        v-for="link in linkItems"
                        :key="link.id"
                        href="#"
                        class="support-side__link"
                        @click.prevent>
                        <div class="font-medium truncate">{{ link.title }}</div>
                        <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ link.url }}</div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="!isMobileViewport"
              class="support-side__toggle"
              :class="{ 'is-static': isSideExpanded }"
              @click="isSideExpanded = !isSideExpanded"
              aria-label="Toggle details">
              <UiIconChevronUp v-if="isSideExpanded" />
              <UiIconChevronDown v-else />
            </button>
          </div>
        </PanelDefault>

        <div
          class="support-chat-wrapper"
          :style="supportChatWrapperStyle">
          <ChatDefault
            :as-block="true"
            :admin-chat="true"
            :ticket-id="id"
            :currentUser="currentUser"
            :mobile-controls="isMobileViewport && isMobileFullscreenChat"
            :mobile-panel-expanded="isSideExpanded"
            @mobile-back="handleMobileBack"
            @mobile-toggle-panel="toggleSideExpanded"
            @mobile-header-swipe="handleMobileHeaderSwipe"
            @mobile-input-swipe-up="handleMobileInputSwipeUp" />
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { definePageMeta, useHead } from "~/.nuxt/imports";
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";

  definePageMeta({ layout: "default", middleware: ["admin-middleware"] });

  const route = useRoute();
  const router = useRouter();

  const appCore = useAppCore();
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";

  const isLoading = ref(false);
  const supportGridRef = ref<HTMLElement | null>(null);
  const supportSidePanelRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
  const desktopGridHeight = ref<number | null>(null);

  const id = computed(() => String(route.params.id));

  const currentUser = reactive({
    id: null,
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    photoUrl: null,
  });
  const status = ref("");
  const subject = ref("");
  type SupportTab = "media" | "videos" | "links";
  const activeTab = ref<SupportTab>("media");
  const isSideExpanded = ref(false);
  const isMobileViewport = ref(false);
  const isMobileFullscreenChat = ref(true);
  type ParticipantItem = {
    id: number;
    name: string;
    role: string;
    initials: string;
    online: boolean;
    isYou: boolean;
    photoUrl: string;
  };
  const participants = reactive<ParticipantItem[]>([
    { id: 1, name: "Admin", role: "Admin", initials: "AD", online: true, isYou: true, photoUrl: "" },
    { id: 2, name: "Client", role: "Client", initials: "CL", online: false, isYou: false, photoUrl: "" },
  ]);
  const tabs: Array<{ id: SupportTab; label: string }> = [
    { id: "media", label: "Media" },
    { id: "videos", label: "Video" },
    { id: "links", label: "Links" },
  ];
  const mediaItems = [
    { id: 1, label: "Photo" },
    { id: 2, label: "Photo" },
    { id: 3, label: "Photo" },
    { id: 4, label: "Photo" },
    { id: 5, label: "Photo" },
    { id: 6, label: "Photo" },
  ];
  const videoItems = [
    { id: 1, title: "Screen recording", duration: "02:14" },
    { id: 2, title: "Issue reproduction", duration: "00:46" },
  ];
  const linkItems = [
    { id: 1, title: "Trading Platform Docs", url: "https://esterholdings.com/docs" },
    { id: 2, title: "Account Verification", url: "https://esterholdings.com/verify" },
    { id: 3, title: "Support Center", url: "https://esterholdings.com/support" },
  ];
  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
  const firstUpper = (value: string): string => value.charAt(0).toUpperCase();
  const buildFullName = (firstName?: string | null, lastName?: string | null): string => {
    return [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" ").trim();
  };
  const buildParticipantInitials = (
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null,
    fallback = "US"
  ): string => {
    const first = normalizeText(firstName);
    const last = normalizeText(lastName);

    if (first && last) return `${firstUpper(first)}${firstUpper(last)}`;
    if (first.length >= 2) return first.slice(0, 2).toUpperCase();

    const localPart = normalizeText(email).split("@")[0] || "";
    const normalizedLocal = localPart.replace(/[^a-zA-Z0-9]/g, "");
    if (normalizedLocal.length >= 2) return normalizedLocal.slice(0, 2).toUpperCase();
    if (normalizedLocal.length === 1) return `${normalizedLocal.toUpperCase()}${normalizedLocal.toUpperCase()}`;

    return fallback;
  };

  const MOBILE_BREAKPOINT = 768;
  const TABLET_BREAKPOINT = 1024;
  const DESKTOP_GRID_BOTTOM_GAP = 16;
  const TABLET_BOTTOM_MENU_RESERVED = 78;
  const MIN_DESKTOP_GRID_HEIGHT = 320;
  const MOBILE_CHAT_BOTTOM_GAP = 20;
  const MOBILE_PANEL_CLOSE_MIN_SWIPE = 42;
  const MOBILE_PANEL_CLOSE_BOTTOM_THRESHOLD = 0.4;
  const MOBILE_PANEL_HORIZONTAL_DRIFT_LIMIT = 52;
  const MOBILE_PANEL_SNAP_MS = 280;
  const panelTouchStartY = ref<number | null>(null);
  const panelTouchStartX = ref<number | null>(null);
  const panelTouchDeltaY = ref(0);
  const panelTouchDeltaX = ref(0);
  const panelDragOffset = ref(0);
  const panelDragMaxOffset = ref(0);
  const isPanelDragging = ref(false);
  let panelCloseTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let desktopGridRafId: number | null = null;

  const supportGridStyle = computed(() => {
    if (isMobileViewport.value || desktopGridHeight.value === null) return undefined;

    const height = `${desktopGridHeight.value}px`;
    return {
      height,
      minHeight: height,
    };
  });

  const supportChatWrapperStyle = computed(() => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value) return undefined;

    const bottom = `calc(${MOBILE_CHAT_BOTTOM_GAP}px + env(safe-area-inset-bottom, 0px))`;
    return { bottom };
  });

  const panelDragProgress = computed(() => {
    if (panelDragMaxOffset.value <= 0) return 0;
    return Math.min(1, panelDragOffset.value / panelDragMaxOffset.value);
  });

  const supportSideStyle = computed(() => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value || !isSideExpanded.value) return undefined;

    return {
      transform: `translateY(${-panelDragOffset.value}px)`,
      opacity: `${Math.max(0, 1 - panelDragProgress.value * 1.2)}`,
      transition: isPanelDragging.value ? "none" : "opacity 0.28s ease, transform 0.28s ease, border-color 0.2s ease",
    } as const;
  });

  const measureDesktopGridHeight = () => {
    if (typeof window === "undefined") return;
    if (isMobileViewport.value) {
      desktopGridHeight.value = null;
      return;
    }

    const grid = supportGridRef.value;
    if (!grid) return;

    const top = grid.getBoundingClientRect().top;
    const hasTabletBottomMenu = window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT;
    const bottomReserved = hasTabletBottomMenu
      ? TABLET_BOTTOM_MENU_RESERVED + DESKTOP_GRID_BOTTOM_GAP
      : DESKTOP_GRID_BOTTOM_GAP;
    const available = Math.floor(window.innerHeight - top - bottomReserved);
    desktopGridHeight.value = Math.max(MIN_DESKTOP_GRID_HEIGHT, available);
  };

  const scheduleDesktopGridMeasure = () => {
    if (typeof window === "undefined") return;

    if (desktopGridRafId !== null) {
      window.cancelAnimationFrame(desktopGridRafId);
    }

    desktopGridRafId = window.requestAnimationFrame(() => {
      desktopGridRafId = null;
      measureDesktopGridHeight();
    });
  };

  const updateViewportState = () => {
    if (typeof window === "undefined") return;

    const nextMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const wasMobile = isMobileViewport.value;

    isMobileViewport.value = nextMobile;

    if (nextMobile && !wasMobile) {
      isSideExpanded.value = false;
      isMobileFullscreenChat.value = true;
    }

    if (nextMobile) {
      desktopGridHeight.value = null;
    }

    if (!nextMobile) {
      isMobileFullscreenChat.value = true;
    }

    scheduleDesktopGridMeasure();
  };

  const toggleSideExpanded = () => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value) return;
    if (isSideExpanded.value) {
      collapseSidePanel();
      return;
    }
    clearSidePanelCloseTimer();
    panelDragOffset.value = 0;
    isPanelDragging.value = false;
    isSideExpanded.value = true;
  };

  const handleMobileHeaderSwipe = (direction: "up" | "down") => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value) return;

    if (direction === "down") {
      clearSidePanelCloseTimer();
      panelDragOffset.value = 0;
      isPanelDragging.value = false;
      isSideExpanded.value = true;
      return;
    }

    collapseSidePanel();
  };

  const resolveSidePanelElement = () => {
    const value = supportSidePanelRef.value;
    if (!value) return null;
    if (value instanceof HTMLElement) return value;
    if ("$el" in value && value.$el instanceof HTMLElement) return value.$el;
    return null;
  };

  const clearSidePanelCloseTimer = () => {
    if (panelCloseTimeoutId !== null) {
      clearTimeout(panelCloseTimeoutId);
      panelCloseTimeoutId = null;
    }
  };

  const resolveSidePanelCloseThreshold = () => {
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : panelDragMaxOffset.value;
    const rawThreshold = viewportHeight * MOBILE_PANEL_CLOSE_BOTTOM_THRESHOLD - MOBILE_CHAT_BOTTOM_GAP;
    const minThreshold = Math.max(MOBILE_PANEL_CLOSE_MIN_SWIPE, rawThreshold);
    return Math.min(panelDragMaxOffset.value || minThreshold, minThreshold);
  };

  const resetSidePanelTouch = () => {
    panelTouchStartY.value = null;
    panelTouchStartX.value = null;
    panelTouchDeltaY.value = 0;
    panelTouchDeltaX.value = 0;
    panelDragMaxOffset.value = 0;
    isPanelDragging.value = false;
  };

  const collapseSidePanel = () => {
    clearSidePanelCloseTimer();
    isPanelDragging.value = false;
    isSideExpanded.value = false;
    panelDragOffset.value = 0;
    resetSidePanelTouch();
  };

  const animateSidePanelClose = () => {
    clearSidePanelCloseTimer();
    isPanelDragging.value = false;
    panelDragOffset.value =
      panelDragMaxOffset.value || Math.max(1, typeof window !== "undefined" ? window.innerHeight : 1);
    panelCloseTimeoutId = setTimeout(() => {
      collapseSidePanel();
    }, MOBILE_PANEL_SNAP_MS);
  };

  const handleSidePanelTouchStart = (event: TouchEvent) => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value || !isSideExpanded.value) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    clearSidePanelCloseTimer();
    panelTouchStartY.value = touch.clientY;
    panelTouchStartX.value = touch.clientX;
    panelTouchDeltaY.value = 0;
    panelTouchDeltaX.value = 0;
    panelDragOffset.value = 0;
    isPanelDragging.value = false;

    const panelElement = resolveSidePanelElement();
    panelDragMaxOffset.value = Math.max(1, Math.round(panelElement?.getBoundingClientRect().height ?? 0));
  };

  const handleSidePanelTouchMove = (event: TouchEvent) => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value || !isSideExpanded.value) return;
    if (panelTouchStartY.value === null || panelTouchStartX.value === null) return;

    const touch = event.touches?.[0];
    if (!touch) return;

    panelTouchDeltaY.value = touch.clientY - panelTouchStartY.value;
    panelTouchDeltaX.value = touch.clientX - panelTouchStartX.value;

    const verticalSwipe = Math.abs(panelTouchDeltaY.value) > Math.abs(panelTouchDeltaX.value);
    const smallHorizontalDrift = Math.abs(panelTouchDeltaX.value) <= MOBILE_PANEL_HORIZONTAL_DRIFT_LIMIT;
    const swipeUpDistance = Math.max(0, -panelTouchDeltaY.value);
    const swipeUp = swipeUpDistance > 0;

    if (!isPanelDragging.value && verticalSwipe && smallHorizontalDrift && swipeUp && swipeUpDistance > 4) {
      isPanelDragging.value = true;
    }

    if (isPanelDragging.value) {
      panelDragOffset.value = Math.min(panelDragMaxOffset.value || 1, swipeUpDistance);
      event.preventDefault();
      return;
    }
  };

  const handleSidePanelTouchEnd = () => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value) {
      resetSidePanelTouch();
      return;
    }
    if (panelTouchStartY.value === null || panelTouchStartX.value === null) {
      resetSidePanelTouch();
      return;
    }

    const closeThreshold = resolveSidePanelCloseThreshold();
    const shouldClose = panelDragOffset.value >= closeThreshold;

    if (shouldClose) {
      animateSidePanelClose();
      return;
    }

    isPanelDragging.value = false;
    panelDragOffset.value = 0;
    resetSidePanelTouch();
  };

  const handleMobileBack = () => {
    router.push("/support");
  };

  const handleMobileInputSwipeUp = () => {
    if (!isMobileViewport.value) return;
    if (isMobileFullscreenChat.value) return;

    clearSidePanelCloseTimer();
    isMobileFullscreenChat.value = true;
    collapseSidePanel();
  };

  useHead(() => ({
    htmlAttrs: {
      class: {
        "support-chat-fullscreen": isMobileViewport.value && isMobileFullscreenChat.value,
      },
    },
    bodyAttrs: {
      class: {
        "support-chat-fullscreen": isMobileViewport.value && isMobileFullscreenChat.value,
      },
    },
  }));

  const loadData = async () => {
    isLoading.value = true;

    const response = await appCore.adminModules.tickets.getById(route.params.id);
    const ticket = response?.data ?? {};
    const creator = ticket?.creator ?? null;

    status.value = ticket?.status ?? "open";
    subject.value = ticket?.subject ?? "-";

    const creatorFirstName = creator?.first_name ?? null;
    const creatorLastName = creator?.last_name ?? null;
    const creatorEmail = creator?.email ?? null;
    const creatorPhotoUrl = normalizeText(creator?.photo_url);
    const creatorFullName = buildFullName(creatorFirstName, creatorLastName);

    participants[1].name = creatorFullName || normalizeText(creatorEmail) || "Client";
    participants[1].initials = buildParticipantInitials(creatorFirstName, creatorLastName, creatorEmail, "CL");
    participants[1].photoUrl = creatorPhotoUrl;

    isLoading.value = false;
    await nextTick();
    scheduleDesktopGridMeasure();
  };

  const handleSupportPresenceUpdated = (payload?: any) => {
    if (!payload || typeof payload !== "object") return;

    const payloadTicketId = String(payload.ticketId ?? payload.ticket_id ?? "");
    if (!payloadTicketId || payloadTicketId !== id.value) return;

    const counterpartyOnline = Boolean(payload.counterparty_online ?? payload.counterpartyOnline);
    participants[0].online = true;
    participants[1].online = counterpartyOnline;
  };

  onMounted(async () => {
    useEventBus.on(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    updateViewportState();
    window.addEventListener("resize", updateViewportState, { passive: true });

    const response = await appCore.adminModules.auth.getAuthUser();
    const firstName = response.data.first_name ?? null;
    const lastName = response.data.last_name ?? null;
    const email = response.data.email ?? null;
    const photoUrl = response.data.photo_url ?? response.data.avatar_url ?? response.data.avatar ?? null;
    const normalizedPhotoUrl = normalizeText(photoUrl);
    const fullName = buildFullName(firstName, lastName);
    const displayName = fullName || normalizeText(response.data.nickname) || normalizeText(firstName) || "Admin";

    currentUser.id = response.data.id;
    currentUser.name = displayName;
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.email = email;
    currentUser.photoUrl = normalizedPhotoUrl || null;

    participants[0].name = displayName;
    participants[0].initials = buildParticipantInitials(firstName, lastName, email, "AD");
    participants[0].photoUrl = normalizedPhotoUrl;

    await loadData();
    scheduleDesktopGridMeasure();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    window.removeEventListener("resize", updateViewportState);
    clearSidePanelCloseTimer();
    if (desktopGridRafId !== null) {
      window.cancelAnimationFrame(desktopGridRafId);
      desktopGridRafId = null;
    }
  });
</script>

<style lang="scss" scoped>
  .support-ticket-page {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .support-side {
    color: var(--ui-text-main);
    height: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-bottom: 0;
    transition:
      max-height 0.25s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .support-side__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
    transition:
      max-height 0.25s ease,
      opacity 0.2s ease;
  }

  .support-side__scroll::-webkit-scrollbar {
    display: none;
  }

  .support-ticket-grid {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
    grid-auto-rows: minmax(0, 1fr);
  }

  .support-chat-wrapper {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .support-chat-wrapper :deep(.support-chat) {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
  }

  .support-chat-wrapper :deep(.messages) {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
  }

  @media (max-width: 767px) {
    .support-ticket-grid.is-mobile.is-mobile-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 120;
      display: block;
      width: 100vw;
      height: 100dvh;
      min-height: 100dvh;
      margin: 0;
      padding: 0;
      background: var(--ui-background);
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-chat-wrapper {
      position: absolute;
      inset: 0;
      height: 100dvh;
      max-height: 100dvh;
      width: 100%;
      z-index: 1;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-chat-wrapper :deep(.support-chat) {
      border-radius: 0;
      border-left: 0;
      border-right: 0;
      height: 100dvh;
      max-height: 100dvh;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-chat-wrapper :deep(.drag-handle) {
      padding-top: calc(10px + env(safe-area-inset-top, 0px));
    }
  }

  .support-side__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);
    padding: 6px;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--ui-text-main);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .support-side__toggle:hover {
    background: var(--ui-background-panel);
  }

  .support-side__toggle.is-static {
    position: static;
    transform: none;
    margin: 8px auto 0;
    display: flex;
  }

  .support-side__mobile-header,
  .support-side__mobile-arrow {
    display: none;
  }

  .support-side__expand {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .support-side__expand:not(.is-expanded) {
    gap: 0;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
  }

  .support-side__collapsible {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition:
      max-height 0.35s ease,
      opacity 0.25s ease;
  }

  .support-side__expand.is-expanded .support-side__collapsible {
    max-height: 1200px;
    opacity: 1;
  }

  @media (max-width: 767px) {
    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side.is-mobile {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: calc(20px + env(safe-area-inset-bottom, 0px));
      z-index: 4;
      margin: 0;
      padding: 0 !important;
      border-radius: 0;
      border-top: 0;
      border-left: 0;
      border-right: 0;
      border: 1px solid var(--color-stroke-ui-light);
      background: color-mix(in oklab, var(--ui-background-panel) 96%, transparent);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
      opacity: 1;
      transform: translateY(0);
      overflow: hidden;
      transition:
        opacity 0.28s ease,
        transform 0.28s ease,
        border-color 0.2s ease;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side.is-mobile.is-collapsed {
      opacity: 0;
      pointer-events: none;
      transform: translateY(calc(-100% - 24px));
      border-color: transparent;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side.is-mobile .support-side__scroll {
      height: 100%;
      padding: 8px;
      transition: opacity 0.2s ease;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side__mobile-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: calc(8px + env(safe-area-inset-top, 0px));
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-stroke-ui-light);
      background: color-mix(in oklab, var(--ui-background-card) 96%, transparent);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side__mobile-arrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid var(--color-stroke-ui-light);
      background: var(--ui-background-card);
      color: var(--ui-text-main);
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side.is-mobile.is-collapsed .support-side__scroll {
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      gap: 0;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen
      .support-side.is-mobile:not(.is-collapsed)
      .support-side__scroll {
      opacity: 1;
      pointer-events: auto;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-side.is-mobile:not(.is-collapsed) {
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .support-side__toggle {
      display: none;
    }

    .support-side__expand.is-expanded {
      gap: 12px;
    }

    .support-side__expand.is-expanded .support-side__collapsible {
      max-height: none;
      opacity: 1;
      overflow: visible;
    }
  }

  @media (min-width: 768px) {
    .support-side__expand {
      gap: 12px;
      max-height: none;
      overflow: visible;
      opacity: 1;
    }

    .support-side__expand:not(.is-expanded) {
      max-height: none;
      overflow: visible;
      opacity: 1;
      gap: 12px;
    }

    .support-side__collapsible {
      max-height: none;
      opacity: 1;
      overflow: visible;
    }

    .support-side__scroll {
      gap: 12px;
    }

    .support-side__toggle {
      display: none;
    }
  }

  .support-side__card {
    border-radius: 14px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: var(--ui-background-panel);
    padding: 5px 10px;
  }

  .support-side__profile {
    background: var(--ui-background-card);
  }

  .support-side__status-grid {
    display: grid;
    gap: 12px;
  }

  .support-side__ticket-id-row {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .support-side__status-card {
    background: var(--ui-background-card);
    border-color: var(--color-stroke-ui-dark);
  }

  .support-side__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-main);
  }

  .support-side__status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--ui-sticker-success);
  }

  .support-side__avatar {
    height: 48px;
    width: 48px;
    border-radius: 999px;
    background: var(--ui-background-card);
    color: var(--ui-primary-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    overflow: hidden;
  }

  .support-side__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .support-side__participant {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    padding: 8px 10px;
    background: var(--ui-background-card);
  }

  .support-side__participant-avatar {
    height: 32px;
    width: 32px;
    border-radius: 999px;
    background: var(--ui-background-card);
    color: var(--ui-text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    overflow: hidden;
  }

  .support-side__participant-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .support-side__tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    flex-wrap: wrap;
  }

  .support-side__tab {
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    padding: 6px 12px;
    color: var(--ui-text-main);
    background: var(--ui-background-card);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .support-side__tab:hover {
    background: var(--ui-background-card);
  }

  .support-side__tab.is-active {
    border-color: var(--ui-primary-main);
    background: var(--ui-primary-main);
    color: var(--ui-text-main);
  }

  .support-side__media {
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--ui-text-secondary);
  }

  .support-side__video {
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    padding: 12px;
  }

  .support-side__link {
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    padding: 10px 12px;
    color: var(--ui-text-main);
    transition: background-color 0.2s ease;
  }

  .support-side__link:hover {
    background: var(--ui-background-panel);
  }

  .support-side__library {
    margin-bottom: 10px;
  }
</style>
