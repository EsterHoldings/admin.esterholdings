<template>
  <UiContainer>
    <div class="support-ticket-page text-[var(--ui-text-main)]">
      <div
        v-if="!isMobileViewport"
        class="support-ticket-header mb-5 flex items-center justify-between">
        <div class="flex justify-start items-center gap-2">
          <UiTextH4 class="text-[var(--ui-text-main)]"> {{ t("cabinet.accounts.account.title") }} : </UiTextH4>

          <span class="flex justify-start items-center gap-2">
            <UiIconCopy :text="id" />
            <span class="block truncate">{{ id }}</span>
          </span>
        </div>
      </div>

      <div
        class="support-ticket-grid grid gap-[20px] grid-cols-1 md:grid-cols-[1fr_2fr] items-stretch"
        :class="{ 'is-collapsed': !isSideExpanded, 'is-mobile': isMobileViewport }">
        <PanelDefault
          class="support-side p-2"
          :class="{
            'is-collapsed': !isSideExpanded,
            'is-mobile': isMobileViewport,
            'is-swiping': isSideSwipeDragging,
          }"
          @touchstart="handleSideTouchStart"
          @touchmove="handleSideTouchMove"
          @touchend="handleSideTouchEnd"
          @touchcancel="handleSideTouchEnd">
          <div
            v-if="isMobileViewport"
            class="support-side__mobile-bar">
            <button
              type="button"
              class="support-side__mobile-toggle"
              @click="toggleSideExpanded"
              aria-label="Toggle details">
              <UiIconChevronUp v-if="isSideExpanded" />
              <UiIconChevronDown v-else />
            </button>

            <div class="support-side__mobile-ticket min-w-0">
              <div class="support-side__mobile-ticket-id truncate">#{{ id }}</div>
              <div class="support-side__mobile-ticket-status truncate">{{ status || "in progress" }}</div>
            </div>

            <span
              class="support-side__mobile-copy"
              aria-label="Copy ticket id">
              <UiIconCopy :text="id" />
            </span>
          </div>

          <div class="support-side__scroll flex flex-col gap-4">
            <div class="support-side__card support-side__profile">
              <div class="flex items-center gap-3">
                <div class="support-side__avatar">
                  <img
                    v-if="authStore.photoUrl || userCard.photoUrl"
                    :src="authStore.photoUrl || userCard.photoUrl"
                    alt="User photo"
                    class="support-side__avatar-img" />
                  <span v-else>{{ userCard.initials }}</span>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ userCard.name }}</div>
                  <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ userCard.email }}</div>
                </div>
              </div>
            </div>

            <div
              class="support-side__expand"
              :class="{ 'is-expanded': isSideExpanded }">
              <div class="support-side__collapsible">
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
                          {{ person.initials }}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-medium truncate">{{ person.name }}</div>
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
                        class="support-side__link">
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

        <div class="support-chat-wrapper">
          <ChatDefault
            :as-block="true"
            :ticket-id="id"
            :currentUser="currentUser" />
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";

  import useAppCore from "~/composables/useAppCore";
  import { definePageMeta, useAuthStore } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useRoute } from "vue-router";
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });

  const route = useRoute();

  const appCore = useAppCore();

  const activeTabIndex = ref(0);
  const isLoading = ref(false);

  const id: string = computed(() => String(route.params.id));

  const currentUser = reactive({
    id: null,
    name: null,
  });
  const authStore = useAuthStore();

  const lastMessageAt = ref("");
  const status = ref("");
  const subject = ref("");
  const activeTab = ref<"media" | "videos" | "links">("media");
  const isSideExpanded = ref(false);
  const isMobileViewport = ref(false);
  const isSideSwipeDragging = ref(false);
  const userCard = reactive({
    name: "Ester Holdings Client",
    email: "client@esterholdings.com",
    initials: "EH",
    photoUrl: "",
  });
  const participants = reactive([
    { id: 1, name: "You", role: "Client", initials: "YC", online: true },
    { id: 2, name: "Support Agent", role: "Support", initials: "SA", online: true },
  ]);
  const tabs = [
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

  const MOBILE_BREAKPOINT = 768;
  const SWIPE_THRESHOLD = 42;
  const sideTouchStartY = ref(0);
  const sideTouchDeltaY = ref(0);
  const sideTouchTracking = ref(false);

  const updateViewportState = () => {
    if (typeof window === "undefined") return;

    const nextMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const wasMobile = isMobileViewport.value;

    isMobileViewport.value = nextMobile;

    if (nextMobile && !wasMobile) {
      isSideExpanded.value = false;
    }

    if (!nextMobile) {
      isSideSwipeDragging.value = false;
      sideTouchTracking.value = false;
      sideTouchDeltaY.value = 0;
    }
  };

  const toggleSideExpanded = () => {
    isSideExpanded.value = !isSideExpanded.value;
  };

  const handleSideTouchStart = (event: TouchEvent) => {
    if (!isMobileViewport.value) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    sideTouchTracking.value = true;
    sideTouchStartY.value = touch.clientY;
    sideTouchDeltaY.value = 0;
    isSideSwipeDragging.value = false;
  };

  const handleSideTouchMove = (event: TouchEvent) => {
    if (!isMobileViewport.value || !sideTouchTracking.value) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    sideTouchDeltaY.value = touch.clientY - sideTouchStartY.value;
    if (Math.abs(sideTouchDeltaY.value) > 8) {
      isSideSwipeDragging.value = true;
      event.preventDefault();
    }
  };

  const handleSideTouchEnd = () => {
    if (!isMobileViewport.value || !sideTouchTracking.value) return;

    if (sideTouchDeltaY.value <= -SWIPE_THRESHOLD) {
      isSideExpanded.value = true;
    } else if (sideTouchDeltaY.value >= SWIPE_THRESHOLD) {
      isSideExpanded.value = false;
    }

    sideTouchTracking.value = false;
    sideTouchDeltaY.value = 0;
    isSideSwipeDragging.value = false;
  };

  const loadData = async () => {
    console.log("run run run run run");
    isLoading.value = true;

    const response = await appCore.tickets.getById(route.params.id);

    console.log("response");
    console.log(response.data);

    lastMessageAt.value = response.data.last_message_at;
    status.value = response.data.status;
    subject.value = response.data.subject;

    isLoading.value = false;
  };

  onMounted(async () => {
    updateViewportState();
    window.addEventListener("resize", updateViewportState, { passive: true });

    const response = await appCore.auth.getAuthUser();
    currentUser.id = response.data.id;
    currentUser.name = response.data.first_name;
    authStore.setUser(response.data);
    const fullName = [response.data.first_name, response.data.last_name].filter(Boolean).join(" ").trim();
    userCard.name = fullName || response.data.first_name || userCard.name;
    if (response.data.email) userCard.email = response.data.email;
    if (response.data.photo_url) userCard.photoUrl = response.data.photo_url;
    if (response.data.first_name && response.data.last_name) {
      userCard.initials = `${response.data.first_name[0]}${response.data.last_name[0]}`.toUpperCase();
    }

    await loadData();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewportState);
  });
</script>

<style lang="scss" scoped>
  .icon-update {
    height: 14px;
    width: 14px;
    margin-right: 10px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      animation: wiggle 0.2s ease;
    }
  }

  .icon-update.spinning {
    animation: spin 0.5s linear;
  }

  .balance-sum {
    cursor: pointer;
  }

  .wiggle:hover {
    animation: wiggle 0.3s ease;
  }

  /* ========== KEYFRAMES ========== */

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

  .accounts {
    &__title {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      h4 {
        color: var(--ui-text-main);
      }
    }

    &__content {
    }
  }

  .support-side {
    color: var(--ui-text-main);
    height: calc(100dvh - 170px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-bottom: 10px;
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
    min-height: calc(100dvh - 160px);
    height: calc(100dvh - 160px);
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
    .support-ticket-grid.is-mobile {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: block;
      width: 100vw;
      height: 100dvh;
      min-height: 100dvh;
      margin: 0;
      padding: 0;
      background: var(--ui-background);
    }

    .support-chat-wrapper {
      position: absolute;
      inset: 0;
      height: 100dvh;
      max-height: 100dvh;
      width: 100%;
      z-index: 1;
    }

    .support-chat-wrapper :deep(.support-chat) {
      border-radius: 0;
      border-left: 0;
      border-right: 0;
      height: 100dvh;
      max-height: 100dvh;
    }

    .support-chat-wrapper :deep(.drag-handle) {
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

  .support-side__mobile-bar,
  .support-side__mobile-toggle,
  .support-side__mobile-copy {
    display: none;
  }

  .support-side__mobile-ticket-id {
    font-size: 13px;
    font-weight: 600;
    color: var(--ui-text-main);
    line-height: 1.15;
  }

  .support-side__mobile-ticket-status {
    margin-top: 2px;
    font-size: 11px;
    color: var(--ui-text-secondary);
    line-height: 1;
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
    .support-side.is-mobile {
      position: absolute;
      top: max(8px, env(safe-area-inset-top, 0px));
      left: 8px;
      right: 8px;
      z-index: 4;
      margin: 0;
      border-radius: 16px;
      border: 1px solid var(--color-stroke-ui-light);
      background: color-mix(in oklab, var(--ui-background-panel) 90%, transparent);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
      max-height: calc(100dvh - max(8px, env(safe-area-inset-top, 0px)) - 8px);
      overflow: hidden;
    }

    .support-side.is-mobile.is-collapsed {
      max-height: 72px;
    }

    .support-side.is-mobile .support-side__mobile-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 56px;
      width: 100%;
      padding: 8px 10px 6px;
      border-bottom: 1px solid transparent;
    }

    .support-side.is-mobile:not(.is-collapsed) .support-side__mobile-bar {
      border-bottom-color: var(--color-stroke-ui-dark);
    }

    .support-side__mobile-toggle,
    .support-side__mobile-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--color-stroke-ui-light);
      background: var(--ui-background-card);
      color: var(--ui-text-main);
      flex: 0 0 34px;
    }

    .support-side.is-mobile .support-side__scroll {
      max-height: calc(100dvh - 140px);
      padding-top: 8px;
    }

    .support-side.is-mobile.is-collapsed .support-side__scroll {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      pointer-events: none;
      gap: 0;
    }

    .support-side.is-mobile:not(.is-collapsed) .support-side__scroll {
      opacity: 1;
      pointer-events: auto;
    }

    .support-side.is-mobile.is-swiping {
      transition: none;
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
    .support-side__mobile-bar,
    .support-side__mobile-toggle,
    .support-side__mobile-copy {
      display: none !important;
    }

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
