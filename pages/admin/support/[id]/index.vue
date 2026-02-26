<template>
  <UiContainer>
    <div class="support-ticket-page text-[var(--ui-text-main)]">
      <div
        ref="supportGridRef"
        class="support-ticket-grid grid gap-[20px] grid-cols-1 md:grid-cols-[1fr_2fr] items-stretch"
        :style="supportGridStyle">
        <PanelDefault class="support-side p-2">
          <div class="support-side__scroll flex flex-col gap-4">
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

            <div class="support-side__card support-side__status-card">
              <div class="flex items-center justify-between gap-3">
                <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">Status</div>
                <div class="support-side__status-pill">
                  <span class="support-side__status-dot"></span>
                  <span class="text-sm font-semibold">{{ status || "open" }}</span>
                </div>
              </div>
            </div>

            <div class="support-side__card support-side__subject-card">
              <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">Subject</div>
              <div class="mt-2 text-sm font-semibold">{{ subject || "-" }}</div>
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
        </PanelDefault>

        <div class="support-chat-wrapper">
          <ChatDefault
            :as-block="true"
            :admin-chat="true"
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
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import ChatDefault from "~/components/block/chats/ChatDefault.vue";

  import useAppCore from "~/composables/useAppCore";
  import { definePageMeta } from "~/.nuxt/imports";
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useRoute } from "vue-router";

  definePageMeta({ layout: "default", middleware: ["auth-client", "client-check-auth"] });

  const route = useRoute();
  const appCore = useAppCore();

  const supportGridRef = ref<HTMLElement | null>(null);
  const desktopGridHeight = ref<number | null>(null);
  const isMobileViewport = ref(false);
  let desktopGridRafId: number | null = null;

  const id = computed(() => String(route.params.id));

  const status = ref("");
  const subject = ref("");

  const currentUser = reactive({
    id: null as number | null,
    name: null as string | null,
    firstName: null as string | null,
    lastName: null as string | null,
    email: null as string | null,
    photoUrl: null as string | null,
  });

  type SupportTab = "media" | "videos" | "links";
  const activeTab = ref<SupportTab>("media");

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

  const MOBILE_BREAKPOINT = 768;
  const DESKTOP_GRID_BOTTOM_GAP = 16;
  const MIN_DESKTOP_GRID_HEIGHT = 320;

  const supportGridStyle = computed(() => {
    if (isMobileViewport.value || desktopGridHeight.value === null) return undefined;

    const height = `${desktopGridHeight.value}px`;
    return {
      height,
      minHeight: height,
      marginBottom: "1rem",
    };
  });

  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
  const firstUpper = (value: string): string => value.charAt(0).toUpperCase();
  const buildFullName = (firstName?: string | null, lastName?: string | null): string => {
    return [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(" ").trim();
  };
  const buildInitials = (
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null,
    fallback = "US"
  ): string => {
    const first = normalizeText(firstName);
    const last = normalizeText(lastName);
    if (first && last) return `${firstUpper(first)}${firstUpper(last)}`;
    if (first.length >= 2) return first.slice(0, 2).toUpperCase();

    const local = normalizeText(email).split("@")[0] || "";
    const normalized = local.replace(/[^a-zA-Z0-9]/g, "");
    if (normalized.length >= 2) return normalized.slice(0, 2).toUpperCase();
    if (normalized.length === 1) return `${normalized.toUpperCase()}${normalized.toUpperCase()}`;

    return fallback;
  };

  const measureDesktopGridHeight = () => {
    if (typeof window === "undefined") return;
    if (isMobileViewport.value) {
      desktopGridHeight.value = null;
      return;
    }

    const grid = supportGridRef.value;
    if (!grid) return;

    const top = grid.getBoundingClientRect().top;
    const available = Math.floor(window.innerHeight - top - DESKTOP_GRID_BOTTOM_GAP);
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

    isMobileViewport.value = window.innerWidth < MOBILE_BREAKPOINT;

    if (isMobileViewport.value) {
      desktopGridHeight.value = null;
    }

    scheduleDesktopGridMeasure();
  };

  const loadData = async () => {
    const response = await appCore.adminModules.tickets.getById(route.params.id);
    const ticket = response?.data ?? {};
    const creator = ticket?.creator ?? null;

    status.value = ticket?.status ?? "";
    subject.value = ticket?.subject ?? "";

    const creatorFirstName = creator?.first_name ?? null;
    const creatorLastName = creator?.last_name ?? null;
    const creatorEmail = creator?.email ?? null;
    const creatorPhotoUrl = normalizeText(creator?.photo_url);
    const creatorFullName = buildFullName(creatorFirstName, creatorLastName);

    participants[1].name = creatorFullName || normalizeText(creatorEmail) || "Client";
    participants[1].initials = buildInitials(creatorFirstName, creatorLastName, creatorEmail, "CL");
    participants[1].photoUrl = creatorPhotoUrl;

    await nextTick();
    scheduleDesktopGridMeasure();
  };

  onMounted(async () => {
    updateViewportState();
    window.addEventListener("resize", updateViewportState, { passive: true });

    const authResponse = await appCore.adminModules.auth.getAuthUser();
    const photoUrl = authResponse.data.photo_url ?? authResponse.data.avatar_url ?? authResponse.data.avatar ?? null;
    const firstName = authResponse.data.first_name ?? null;
    const lastName = authResponse.data.last_name ?? null;
    const email = authResponse.data.email ?? null;
    const normalizedPhotoUrl = normalizeText(photoUrl);
    const fullName = buildFullName(firstName, lastName);
    const displayName = fullName || normalizeText(authResponse.data.nickname) || normalizeText(firstName) || "Admin";

    currentUser.id = authResponse.data.id;
    currentUser.name = displayName;
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.email = email;
    currentUser.photoUrl = normalizedPhotoUrl || null;

    participants[0].name = displayName;
    participants[0].initials = buildInitials(firstName, lastName, email, "AD");
    participants[0].photoUrl = normalizedPhotoUrl;

    await loadData();
    scheduleDesktopGridMeasure();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewportState);

    if (desktopGridRafId !== null) {
      window.cancelAnimationFrame(desktopGridRafId);
      desktopGridRafId = null;
    }
  });
</script>

<style lang="scss" scoped>
  .support-ticket-page {
    min-height: 0;
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
  }

  .support-side__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .support-side__scroll::-webkit-scrollbar {
    display: none;
  }

  .support-ticket-grid {
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

  .support-side__card {
    border-radius: 14px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: var(--ui-background-panel);
    padding: 5px 10px;
  }

  .support-side__profile {
    background: var(--ui-background-card);
  }

  .support-side__status-card {
    background: var(--ui-background-card);
    border-color: var(--color-stroke-ui-dark);
  }

  .support-side__subject-card {
    background: var(--ui-background-card);
    border-color: var(--color-stroke-ui-dark);
  }

  .support-side__ticket-id-row {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
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

  @media (max-width: 767px) {
    .support-ticket-grid {
      grid-template-columns: 1fr;
      height: auto !important;
      min-height: 0 !important;
      margin-bottom: 1rem;
    }

    .support-side,
    .support-chat-wrapper {
      height: auto;
      min-height: 0;
    }

    .support-side__scroll {
      max-height: none;
      overflow: visible;
    }
  }
</style>
