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

          <div
            ref="supportSideScrollRef"
            class="support-side__scroll flex flex-col gap-4"
            :class="{ 'is-dragging': isSideScrollDragging }"
            @mousedown="handleSideScrollMouseDown">
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
                  <div class="support-side__library-header">
                    <div class="font-semibold">Shared Files</div>
                    <button
                      type="button"
                      class="support-side__refresh"
                      :disabled="isLibraryLoading"
                      @click="refreshLibrary">
                      <UiIconSpinnerDefault
                        v-if="isLibraryLoading"
                        class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                      <UiIconUpdate
                        v-else
                        class="h-4 w-4" />
                    </button>
                  </div>
                  <div class="support-side__tabs">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      type="button"
                      class="support-side__tab"
                      :class="activeTab === tab.id ? 'is-active' : ''"
                      @click="activeTab = tab.id">
                      <span class="support-side__tab-icon">
                        <UiIconImage
                          v-if="tab.id === 'media'"
                          class="h-4 w-4" />
                        <UiIconDocuments
                          v-else-if="tab.id === 'documents'"
                          class="h-4 w-4" />
                        <svg
                          v-else
                          viewBox="0 0 24 24"
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round">
                          <path d="M10 14a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L10 6" />
                          <path d="M14 10a5 5 0 00-7.07 0L4.1 12.83a5 5 0 007.07 7.07L14 18" />
                        </svg>
                      </span>
                      <span>{{ tab.label }}</span>
                      <span class="support-side__tab-count">{{ tab.count }}</span>
                    </button>
                  </div>

                  <div class="mt-4">
                    <div
                      v-if="isLibraryLoading && activeTabItemsCount === 0"
                      class="support-side__library-loading">
                      <UiIconSpinnerDefault class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                      <span>Loading {{ activeTabLabel.toLowerCase() }}...</span>
                    </div>

                    <div
                      v-else-if="activeTab === 'media'"
                      class="support-side__media-grid">
                      <a
                        v-for="media in mediaItems"
                        :key="media.id"
                        :href="media.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="support-side__media">
                        <img
                          v-if="media.kind === 'image'"
                          :src="media.url"
                          :alt="media.title"
                          class="support-side__media-preview" />
                        <div
                          v-else
                          class="support-side__video-preview">
                          <video
                            :src="media.url"
                            muted
                            playsinline
                            preload="metadata"
                            class="support-side__media-preview"></video>
                          <span class="support-side__video-badge">Video</span>
                        </div>
                        <span class="support-side__media-title">{{ media.title }}</span>
                      </a>
                      <div
                        v-if="!mediaItems.length"
                        class="support-side__links-empty">
                        No media in this chat yet
                      </div>
                    </div>

                    <div
                      v-else-if="activeTab === 'documents'"
                      class="flex flex-col gap-2">
                      <template v-if="documentItems.length">
                        <a
                          v-for="doc in documentItems"
                          :key="doc.id"
                          :href="doc.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="support-side__doc">
                          <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-primary-main)]" />
                          <div class="min-w-0">
                            <div class="font-medium truncate">{{ doc.title }}</div>
                            <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ doc.details }}</div>
                          </div>
                        </a>
                      </template>
                      <div
                        v-else
                        class="support-side__links-empty">
                        No documents in this chat yet
                      </div>
                    </div>

                    <div
                      v-else
                      class="flex flex-col gap-2">
                      <template v-if="linkItems.length">
                        <a
                          v-for="link in linkItems"
                          :key="link.id"
                          :href="link.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="support-side__link">
                          <div class="font-medium truncate">{{ link.title }}</div>
                          <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ link.url }}</div>
                        </a>
                      </template>
                      <div
                        v-else
                        class="support-side__links-empty">
                        No links in this chat yet
                      </div>
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
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconImage from "~/components/ui/UiIconImage.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  definePageMeta({ layout: "default", middleware: ["admin-middleware"] });

  const route = useRoute();
  const router = useRouter();

  const appCore = useAppCore();
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";
  const SUPPORT_MESSAGE_UPDATED_EVENT = "support-message-updated";

  const isLoading = ref(false);
  const supportGridRef = ref<HTMLElement | null>(null);
  const supportSidePanelRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
  const supportSideScrollRef = ref<HTMLElement | null>(null);
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
  type SupportTab = "media" | "documents" | "links";
  type SupportLinkItem = {
    id: string;
    title: string;
    url: string;
    createdAt: number;
  };
  type SupportMediaItem = {
    id: string;
    title: string;
    url: string;
    kind: "image" | "video";
    createdAt: number;
  };
  type SupportDocumentItem = {
    id: string;
    title: string;
    url: string;
    details: string;
    createdAt: number;
  };
  const activeTab = ref<SupportTab>("media");
  const isLibraryLoading = ref(false);
  const linkItems = ref<SupportLinkItem[]>([]);
  const mediaItems = ref<SupportMediaItem[]>([]);
  const documentItems = ref<SupportDocumentItem[]>([]);
  const isSideScrollDragging = ref(false);
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
  const tabs = computed(() => [
    { id: "media" as SupportTab, label: "Media", count: mediaItems.value.length },
    { id: "documents" as SupportTab, label: "Documents", count: documentItems.value.length },
    { id: "links" as SupportTab, label: "Links", count: linkItems.value.length },
  ]);
  const activeTabLabel = computed(() => tabs.value.find(tab => tab.id === activeTab.value)?.label ?? "Library");
  const activeTabItemsCount = computed(() => {
    if (activeTab.value === "media") return mediaItems.value.length;
    if (activeTab.value === "documents") return documentItems.value.length;
    return linkItems.value.length;
  });
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
  const LINKS_PAGE_SIZE = 50;
  const MAX_LINKS_PAGES = 40;
  const MESSAGE_URL_PATTERN = /\b((?:https?:\/\/|www\.)[^\s<>"'`]+)/gi;
  let sideScrollDragStartY = 0;
  let sideScrollStartTop = 0;
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

  const normalizeLinkUrl = (raw: string): string | null => {
    if (!raw) return null;

    let candidate = raw
      .trim()
      .replace(/^[("'[{<]+/g, "")
      .replace(/[)"'\]}>,.!?;:]+$/g, "");

    if (!candidate) return null;
    if (/^www\./i.test(candidate)) {
      candidate = `https://${candidate}`;
    }

    try {
      const parsed = new URL(candidate);
      if (!/^https?:$/i.test(parsed.protocol)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const buildLinkTitle = (url: string): string => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname && parsed.pathname !== "/" ? decodeURIComponent(parsed.pathname) : "";
      const summary = `${parsed.hostname}${path}`;
      return summary.length > 72 ? `${summary.slice(0, 69)}...` : summary;
    } catch {
      return url;
    }
  };

  const parseMessageCreatedAt = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const parsed = Date.parse(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : Date.now();
  };

  const formatFileSize = (size: unknown): string => {
    const value = Number(size ?? 0);
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let scaled = value;
    let unitIndex = 0;
    while (scaled >= 1024 && unitIndex < units.length - 1) {
      scaled /= 1024;
      unitIndex += 1;
    }
    const precision = unitIndex === 0 ? 0 : scaled < 10 ? 1 : 0;
    return `${scaled.toFixed(precision)} ${units[unitIndex]}`;
  };

  const resolveAttachmentUrl = (attachment: Record<string, unknown>): string => {
    return normalizeText(
      attachment.url ?? attachment.preview_url ?? attachment.previewUrl ?? attachment.path_url ?? attachment.pathUrl
    );
  };

  const resolveAttachmentKind = (attachment: Record<string, unknown>): "image" | "video" | "file" => {
    const kind = normalizeText(attachment.kind).toLowerCase();
    if (kind === "image" || kind === "video" || kind === "file") return kind;
    const mimeType = normalizeText(attachment.mime_type ?? attachment.mimeType).toLowerCase();
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
  };

  const resolveAttachmentDisplay = (attachment: Record<string, unknown>, kind: "image" | "video" | "file") => {
    if (kind === "file") return "file";
    const displayAs = normalizeText(attachment.display_as ?? attachment.displayAs).toLowerCase();
    return displayAs === "file" ? "file" : "media";
  };

  const resolveAttachmentTitle = (attachment: Record<string, unknown>, fallbackUrl: string): string => {
    const name = normalizeText(attachment.name ?? attachment.filename);
    if (name) return name;

    try {
      const parsed = new URL(fallbackUrl);
      const fileName = decodeURIComponent(parsed.pathname.split("/").pop() ?? "");
      return fileName || "Attachment";
    } catch {
      return "Attachment";
    }
  };

  const extractLinksFromText = (text: string): string[] => {
    if (!text) return [];
    const found = text.match(MESSAGE_URL_PATTERN) ?? [];
    return Array.from(
      new Set(
        found.map(normalizeLinkUrl).filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    );
  };

  const mergeLinkItems = (items: SupportLinkItem[]) => {
    if (!items.length) return;

    const merged = new Map<string, SupportLinkItem>();
    for (const existing of linkItems.value) {
      merged.set(existing.url.toLowerCase(), existing);
    }

    for (const item of items) {
      const key = item.url.toLowerCase();
      const previous = merged.get(key);
      if (!previous || item.createdAt >= previous.createdAt) {
        merged.set(key, item);
      }
    }

    linkItems.value = Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  const mergeMediaItems = (items: SupportMediaItem[]) => {
    if (!items.length) return;

    const merged = new Map<string, SupportMediaItem>();
    for (const existing of mediaItems.value) {
      merged.set(existing.url.toLowerCase(), existing);
    }

    for (const item of items) {
      const key = item.url.toLowerCase();
      const previous = merged.get(key);
      if (!previous || item.createdAt >= previous.createdAt) {
        merged.set(key, item);
      }
    }

    mediaItems.value = Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  const mergeDocumentItems = (items: SupportDocumentItem[]) => {
    if (!items.length) return;

    const merged = new Map<string, SupportDocumentItem>();
    for (const existing of documentItems.value) {
      merged.set(existing.url.toLowerCase(), existing);
    }

    for (const item of items) {
      const key = item.url.toLowerCase();
      const previous = merged.get(key);
      if (!previous || item.createdAt >= previous.createdAt) {
        merged.set(key, item);
      }
    }

    documentItems.value = Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  const mapTicketMessagesToLibrary = (messages: Array<Record<string, unknown>>) => {
    const links: SupportLinkItem[] = [];
    const media: SupportMediaItem[] = [];
    const documents: SupportDocumentItem[] = [];

    for (const message of messages) {
      const messageId = String(message.id ?? "");
      const createdAt = parseMessageCreatedAt(message.created_at ?? message.createdAt);
      const body = normalizeText(message.body);

      if (body) {
        const urls = extractLinksFromText(body);
        for (const url of urls) {
          links.push({
            id: `${messageId}-${url}`,
            title: buildLinkTitle(url),
            url,
            createdAt,
          });
        }
      }

      const meta = message.meta;
      const rawAttachments =
        meta && typeof meta === "object" && Array.isArray((meta as Record<string, unknown>).attachments)
          ? ((meta as Record<string, unknown>).attachments as Array<unknown>)
          : [];

      for (let index = 0; index < rawAttachments.length; index += 1) {
        const rawAttachment = rawAttachments[index];
        if (!rawAttachment || typeof rawAttachment !== "object") continue;

        const attachment = rawAttachment as Record<string, unknown>;
        const url = resolveAttachmentUrl(attachment);
        if (!url) continue;

        const kind = resolveAttachmentKind(attachment);
        const displayAs = resolveAttachmentDisplay(attachment, kind);
        const title = resolveAttachmentTitle(attachment, url);
        const sizeLabel = formatFileSize(attachment.size);
        const mimeType = normalizeText(attachment.mime_type ?? attachment.mimeType);
        const attachmentId = normalizeText(attachment.id) || `${messageId}-att-${index}`;

        if (displayAs === "media" && (kind === "image" || kind === "video")) {
          media.push({
            id: attachmentId,
            title,
            url,
            kind,
            createdAt,
          });
          continue;
        }

        documents.push({
          id: attachmentId,
          title,
          url,
          details: [sizeLabel, mimeType].filter(Boolean).join(" • "),
          createdAt,
        });
      }
    }

    return { links, media, documents };
  };

  const fetchTicketMessagesForLibraryPage = async (page: number): Promise<Array<Record<string, unknown>>> => {
    const response = await appCore.adminModules.tickets.getTicketMessages(id.value, {
      page,
      pageSize: LINKS_PAGE_SIZE,
      sort: "desc",
    });
    const payload = response?.data;
    if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
    if (Array.isArray(payload?.data)) return payload.data as Array<Record<string, unknown>>;
    return [];
  };

  const mergeLibraryFromMessages = (messages: Array<Record<string, unknown>>) => {
    if (!messages.length) return;
    const mapped = mapTicketMessagesToLibrary(messages);
    mergeLinkItems(mapped.links);
    mergeMediaItems(mapped.media);
    mergeDocumentItems(mapped.documents);
  };

  const loadLibraryFromChat = async () => {
    if (isLibraryLoading.value) return;
    isLibraryLoading.value = true;

    try {
      const allMessages: Array<Record<string, unknown>> = [];

      for (let page = 1; page <= MAX_LINKS_PAGES; page += 1) {
        const pageMessages = await fetchTicketMessagesForLibraryPage(page);
        if (!pageMessages.length) break;
        allMessages.push(...pageMessages);
        if (pageMessages.length < LINKS_PAGE_SIZE) break;
      }

      linkItems.value = [];
      mediaItems.value = [];
      documentItems.value = [];
      mergeLibraryFromMessages(allMessages);
    } catch {
      // noop
    } finally {
      isLibraryLoading.value = false;
    }
  };

  const refreshLibrary = async () => {
    await loadLibraryFromChat();
  };

  const handleSideScrollMouseMove = (event: MouseEvent) => {
    if (!isSideScrollDragging.value) return;
    const el = supportSideScrollRef.value;
    if (!el) return;

    const deltaY = event.clientY - sideScrollDragStartY;
    el.scrollTop = sideScrollStartTop - deltaY;
    event.preventDefault();
  };

  const handleSideScrollMouseUp = () => {
    if (!isSideScrollDragging.value) return;
    isSideScrollDragging.value = false;
    window.removeEventListener("mousemove", handleSideScrollMouseMove);
    window.removeEventListener("mouseup", handleSideScrollMouseUp);
  };

  const handleSideScrollMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("a,button,input,textarea,select,label")) return;

    const el = supportSideScrollRef.value;
    if (!el) return;

    isSideScrollDragging.value = true;
    sideScrollDragStartY = event.clientY;
    sideScrollStartTop = el.scrollTop;

    window.addEventListener("mousemove", handleSideScrollMouseMove, { passive: false });
    window.addEventListener("mouseup", handleSideScrollMouseUp);
    event.preventDefault();
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

  const handleSupportMessageUpdated = (payload?: any) => {
    if (!payload || typeof payload !== "object") return;

    const payloadTicketId = String((payload as Record<string, unknown>).ticketId ?? payload.ticket_id ?? "");
    if (!payloadTicketId || payloadTicketId !== id.value) return;

    const rawMessage =
      payload && typeof payload === "object" && (payload as Record<string, unknown>).message
        ? ((payload as Record<string, unknown>).message as Record<string, unknown>)
        : (payload as Record<string, unknown>);

    if (!rawMessage || typeof rawMessage !== "object") return;
    mergeLibraryFromMessages([rawMessage]);
  };

  onMounted(async () => {
    useEventBus.on(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    useEventBus.on(SUPPORT_MESSAGE_UPDATED_EVENT, handleSupportMessageUpdated);
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
    await loadLibraryFromChat();
    scheduleDesktopGridMeasure();
  });

  watch(activeTab, () => {
    if (activeTabItemsCount.value > 0 || isLibraryLoading.value) return;
    void loadLibraryFromChat();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_PRESENCE_UPDATED_EVENT, handleSupportPresenceUpdated);
    useEventBus.off(SUPPORT_MESSAGE_UPDATED_EVENT, handleSupportMessageUpdated);
    window.removeEventListener("resize", updateViewportState);
    clearSidePanelCloseTimer();
    if (desktopGridRafId !== null) {
      window.cancelAnimationFrame(desktopGridRafId);
      desktopGridRafId = null;
    }
    handleSideScrollMouseUp();
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
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y;
    scrollbar-width: none;
    cursor: grab;
    transition:
      max-height 0.25s ease,
      opacity 0.2s ease;
  }

  .support-side__scroll.is-dragging {
    cursor: grabbing;
    user-select: none;
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
    :global(body.support-chat-fullscreen) .page-header {
      z-index: 1 !important;
      pointer-events: none;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 180;
      isolation: isolate;
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
      z-index: 2;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-chat-wrapper :deep(.support-chat) {
      border-radius: 0;
      border-left: 0;
      border-right: 0;
      height: 100dvh;
      max-height: 100dvh;
    }

    .support-ticket-grid.is-mobile.is-mobile-fullscreen .support-chat-wrapper :deep(.drag-handle) {
      position: sticky;
      top: 0;
      z-index: 8;
      background: var(--ui-background-panel);
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

  .support-side__library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .support-side__refresh {
    height: 30px;
    width: 30px;
    border-radius: 9px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-main);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .support-side__refresh:hover:not(:disabled) {
    background: var(--ui-background-panel);
  }

  .support-side__refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .support-side__tab {
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    padding: 6px 10px;
    color: var(--ui-text-main);
    background: var(--ui-background-card);
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

  .support-side__tab-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .support-side__tab-count {
    min-width: 20px;
    border-radius: 999px;
    padding: 1px 6px;
    background: color-mix(in oklab, var(--ui-background-panel) 85%, transparent);
    font-size: 11px;
    text-align: center;
  }

  .support-side__library-loading {
    border-radius: 10px;
    border: 1px dashed var(--color-stroke-ui-light);
    background: color-mix(in oklab, var(--ui-background-card) 94%, transparent);
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .support-side__media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .support-side__media {
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .support-side__media-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    flex: 1;
  }

  .support-side__video-preview {
    position: relative;
    display: flex;
    flex: 1;
  }

  .support-side__video-badge {
    position: absolute;
    right: 6px;
    top: 6px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
  }

  .support-side__media-title {
    font-size: 11px;
    padding: 6px;
    color: var(--ui-text-secondary);
    border-top: 1px solid var(--color-stroke-ui-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .support-side__doc {
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    padding: 10px 12px;
    color: var(--ui-text-main);
    transition: background-color 0.2s ease;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .support-side__doc:hover {
    background: var(--ui-background-panel);
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

  .support-side__links-empty {
    border-radius: 10px;
    border: 1px dashed var(--color-stroke-ui-light);
    background: color-mix(in oklab, var(--ui-background-card) 94%, transparent);
    padding: 10px 12px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .support-side__library {
    margin-bottom: 10px;
  }
</style>
