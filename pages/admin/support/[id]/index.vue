<template>
  <UiContainer>
    <div class="support-ticket-page text-[var(--ui-text-main)]">
      <div
        ref="supportGridRef"
        class="support-ticket-grid grid gap-[20px] grid-cols-1 items-stretch"
        :class="{
          'md:grid-cols-[1fr_2fr]': !isEmailTicket,
          'md:grid-cols-1': isEmailTicket,
          'is-collapsed': !isSideExpanded,
          'is-mobile': isMobileViewport,
          'is-mobile-fullscreen': isMobileFullscreenChat,
        }"
        :style="supportGridStyle">
        <PanelDefault
          v-if="!isEmailTicket"
          ref="supportSidePanelRef"
          class="support-side p-2"
          :class="{
            'is-collapsed': !isSideExpanded,
            'is-mobile': isMobileViewport,
          }"
          :style="supportSideStyle"
          @touchstart.passive="handleSidePanelTouchStart"
          @touchmove="handleSidePanelTouchMove"
          @touchend="handleSidePanelTouchEnd"
          @touchcancel="handleSidePanelTouchEnd">
          <div
            v-if="isMobileViewport && isMobileFullscreenChat"
            class="support-side__mobile-header">
            <button
              type="button"
              class="support-side__mobile-arrow"
              :aria-label="supportText.closeDetailsAria"
              @click="collapseSidePanel()">
              <UiIconChevronUp />
            </button>
          </div>

          <div
            ref="supportSideScrollRef"
            class="support-side__scroll flex flex-col gap-4"
            :class="{ 'is-dragging': isSideScrollDragging }"
            @mousedown="handleSideScrollMouseDown"
            @wheel="handleSideScrollWheel"
            @touchstart.passive="handleSideScrollTouchStart"
            @touchmove="handleSideScrollTouchMove"
            @touchend="handleSideScrollTouchEnd"
            @touchcancel="handleSideScrollTouchEnd">
            <div
              class="support-side__expand"
              :class="{
                'is-expanded': isSideExpanded,
                'is-top-collapsed': isSideTopCollapsed,
                'is-top-interacting': isSideTopInteracting,
              }"
              :style="sideTopExpandStyle">
              <div class="support-side__collapsible">
                <div
                  ref="ticketMetaCardRef"
                  class="support-side__card support-side__ticket-meta">
                  <div class="support-side__meta-row">
                    <div class="support-side__meta-item support-side__meta-item--id">
                      <span class="support-side__meta-label">{{ supportText.ticket }}</span>
                      <div
                        class="support-side__meta-value-wrap"
                        :class="{ 'is-open': activeMetaTooltip === 'id' }">
                        <UiIconCopy :text="id" />
                        <button
                          type="button"
                          class="support-side__meta-value-trigger"
                          :title="id"
                          @click.stop="toggleMetaTooltip('id')">
                          <span class="support-side__meta-value-text">{{ id }}</span>
                        </button>
                        <div class="support-side__meta-tooltip">{{ id }}</div>
                      </div>
                    </div>

                    <span
                      class="support-side__meta-divider"
                      aria-hidden="true"></span>

                    <div class="support-side__meta-item support-side__meta-item--subject">
                      <span class="support-side__meta-label">{{ supportText.subject }}</span>
                      <div
                        class="support-side__meta-value-wrap support-side__meta-value-wrap--subject"
                        :class="{ 'is-open': activeMetaTooltip === 'subject' }">
                        <button
                          type="button"
                          class="support-side__meta-value-trigger"
                          :title="subject || '-'"
                          @click.stop="toggleMetaTooltip('subject')">
                          <span class="support-side__meta-value-text">{{ subject || "-" }}</span>
                        </button>
                        <div class="support-side__meta-tooltip">{{ subject || "-" }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="support-side__card support-side__status-card">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]">
                      {{ supportText.status }}
                    </div>
                    <div class="support-side__status-pill">
                      <span class="support-side__status-dot"></span>
                      <span class="text-sm font-semibold">{{ status }}</span>
                    </div>
                  </div>
                </div>

                <div
                  ref="participantsCardRef"
                  class="support-side__card support-side__participants">
                  <button
                    type="button"
                    class="support-side__participants-trigger"
                    :aria-expanded="isParticipantsPopoverOpen ? 'true' : 'false'"
                    @click="toggleParticipantsPopover">
                    <div class="support-side__participants-head">
                      <div class="font-semibold">{{ supportText.participants }}</div>
                      <span class="text-xs text-[var(--ui-text-secondary)]">
                        {{ onlineParticipantsCount }} {{ supportText.onlineCountSuffix }}
                      </span>
                    </div>

                    <div class="support-side__participants-summary">
                      <div class="support-side__participants-stack">
                        <div
                          v-for="(person, index) in participantsPreview"
                          :key="person.id"
                          class="support-side__participant-avatar support-side__participant-avatar--stack"
                          :style="{ zIndex: String(participantsPreview.length - index) }">
                          <img
                            v-if="person.photoUrl"
                            :src="person.photoUrl"
                            :alt="person.name"
                            class="support-side__participant-avatar-img" />
                          <span v-else>{{ person.initials }}</span>
                        </div>
                        <div
                          v-if="participantsHiddenCount > 0"
                          class="support-side__participant-avatar support-side__participant-avatar--stack support-side__participant-avatar--more">
                          +{{ participantsHiddenCount }}
                        </div>
                      </div>

                      <span class="support-side__participants-summary-text">
                        {{ totalParticipantsCount }} {{ supportText.inChatSuffix }}
                      </span>
                    </div>
                  </button>

                  <div
                    v-if="isParticipantsPopoverOpen"
                    class="support-side__participants-popover">
                    <div class="support-side__participants-popover-head">
                      <div class="support-side__participants-popover-title">{{ supportText.participantsDetails }}</div>
                      <button
                        type="button"
                        class="support-side__participants-add-button"
                        :aria-expanded="isParticipantsAddPanelOpen ? 'true' : 'false'"
                        @click.stop="toggleParticipantsAddPanel">
                        + {{ supportText.addAdmin }}
                      </button>
                    </div>

                    <div
                      v-if="isParticipantsAddPanelOpen"
                      class="support-side__participants-add-panel"
                      @click.stop>
                      <input
                        v-model="participantsAdminSearch"
                        type="text"
                        class="support-side__participants-add-search"
                        :placeholder="supportText.searchAdminPlaceholder"
                        @input="handleParticipantsAdminSearchInput" />

                      <div class="support-side__participants-add-list">
                        <button
                          v-for="candidate in participantsAdminCandidates"
                          :key="candidate.id"
                          type="button"
                          class="support-side__participants-add-item"
                          :disabled="
                            participantsAdminLoading ||
                            participantsAdminAddingId === candidate.id ||
                            candidate.alreadyParticipant
                          "
                          @click="addAdminParticipant(candidate.id)">
                          <div class="support-side__participant-avatar support-side__participant-avatar--sm">
                            <span>{{ candidate.initials }}</span>
                          </div>
                          <div class="min-w-0 text-left">
                            <div class="text-sm font-medium truncate">{{ candidate.name }}</div>
                            <div class="text-xs text-[var(--ui-text-secondary)] truncate">{{ candidate.email }}</div>
                          </div>
                          <span
                            class="h-2 w-2 rounded-full"
                            :class="
                              candidate.online ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'
                            " />
                          <span class="support-side__participants-add-item-action">
                            {{
                              candidate.alreadyParticipant
                                ? supportText.added
                                : participantsAdminAddingId === candidate.id
                                  ? supportText.adding
                                  : supportText.add
                            }}
                          </span>
                        </button>

                        <div
                          v-if="!participantsAdminLoading && participantsAdminCandidates.length === 0"
                          class="support-side__participants-add-empty">
                          {{ supportText.noAdminsFound }}
                        </div>
                      </div>
                    </div>

                    <div class="support-side__participants-list">
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
                              <strong v-if="person.isYou">({{ supportText.you }})</strong>
                            </div>
                            <div class="text-xs text-[var(--ui-text-secondary)]">{{ person.role }}</div>
                          </div>
                        </div>
                        <div class="support-side__participant-status">
                          <span
                            class="h-2 w-2 rounded-full support-side__presence"
                            :class="
                              person.online ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'
                            " />
                          <span class="text-xs text-[var(--ui-text-secondary)]">
                            {{ person.online ? supportText.online : supportText.offline }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                v-if="isSideTopCollapsed"
                type="button"
                class="support-side__top-expand"
                :aria-label="supportText.expandDetailsAria"
                @click="expandSideTopSection">
                <UiIconChevronDown />
              </button>

              <div class="support-side__card support-side__library">
                <div class="support-side__library-header">
                  <div class="font-semibold">{{ supportText.sharedFiles }}</div>
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

                <div class="support-side__library-content">
                  <div
                    v-if="isLibraryLoading && activeTabItemsCount === 0"
                    class="support-side__library-loading">
                    <UiIconSpinnerDefault class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                    <span>{{ supportText.loading }} {{ activeTabLabel.toLowerCase() }}...</span>
                  </div>

                  <div
                    v-else-if="activeTab === 'media'"
                    class="support-side__media-grid">
                    <button
                      v-for="media in mediaItems"
                      :key="media.id"
                      type="button"
                      class="support-side__media"
                      @click="openLibraryMediaViewer(media.id)">
                      <div class="support-side__media-preview-wrap">
                        <img
                          v-if="media.kind === 'image'"
                          :src="media.url"
                          :alt="media.title"
                          class="support-side__media-preview" />
                        <video
                          v-else
                          :src="media.url"
                          muted
                          playsinline
                          preload="metadata"
                          class="support-side__media-preview"></video>
                        <span class="support-side__media-kind-badge">
                          <svg
                            v-if="media.kind === 'image'"
                            viewBox="0 0 24 24"
                            class="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2" />
                            <circle
                              cx="8.5"
                              cy="8.5"
                              r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                          <svg
                            v-else
                            viewBox="0 0 24 24"
                            class="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <rect
                              x="2.75"
                              y="4"
                              width="14.5"
                              height="16"
                              rx="2" />
                            <path d="m17 9 4-2.5v11L17 15z" />
                          </svg>
                          <span>{{ mediaTypeLabel(media.kind) }}</span>
                        </span>
                      </div>
                      <span class="support-side__media-title">{{ media.title }}</span>
                    </button>
                    <div
                      v-if="!mediaItems.length"
                      class="support-side__links-empty">
                      {{ supportText.emptyMedia }}
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
                      {{ supportText.emptyDocuments }}
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
                      {{ supportText.emptyLinks }}
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
              :aria-label="supportText.toggleDetailsAria">
              <UiIconChevronUp v-if="isSideExpanded" />
              <UiIconChevronDown v-else />
            </button>
          </div>
        </PanelDefault>

        <div
          class="support-chat-wrapper"
          :style="supportChatWrapperStyle">
          <ChatDefault
            v-if="!isEmailTicket"
            :as-block="true"
            :admin-chat="true"
            :ticket-id="id"
            :currentUser="currentUser"
            :counterparty-online="counterpartyOnline"
            :mobile-controls="isMobileViewport && isMobileFullscreenChat"
            :mobile-panel-expanded="isSideExpanded"
            @mobile-back="handleMobileBack"
            @mobile-toggle-panel="toggleSideExpanded"
            @mobile-header-swipe="handleMobileHeaderSwipe"
            @mobile-input-swipe-up="handleMobileInputSwipeUp" />

          <div
            v-else
            class="support-email">
            <div class="support-email__head">
              <div class="support-email__title-wrap">
                <div class="support-email__title">{{ supportText.emailRequestTitle }}</div>
                <div class="support-email__reply-to">
                  {{ supportText.replyToLabel }}:
                  <strong>{{ ticketReplyEmail || supportText.notProvided }}</strong>
                </div>
              </div>
              <button
                type="button"
                class="support-email__refresh"
                :disabled="isEmailThreadLoading"
                @click="reloadEmailThread">
                <UiIconSpinnerDefault
                  v-if="isEmailThreadLoading"
                  class="!h-4 !w-4" />
                <UiIconUpdate
                  v-else
                  class="h-4 w-4" />
              </button>
            </div>

            <form
              class="support-email__reply"
              @submit.prevent="sendEmailReply">
              <textarea
                v-model="emailReplyDraft"
                class="support-email__reply-input"
                rows="4"
                :placeholder="supportText.replyPlaceholder"></textarea>
              <button
                type="submit"
                class="support-email__reply-submit"
                :disabled="isEmailReplySending || !emailReplyDraft.trim()">
                <span v-if="isEmailReplySending">{{ supportText.sendingReply }}</span>
                <span v-else>{{ supportText.sendReply }}</span>
              </button>
            </form>

            <div class="support-email__thread">
              <div
                v-if="isEmailThreadLoading && emailThreadItems.length === 0"
                class="support-email__state">
                <UiIconSpinnerDefault class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                <span>{{ supportText.emailThreadLoading }}</span>
              </div>

              <div
                v-else-if="emailThreadItems.length === 0"
                class="support-email__state">
                {{ supportText.emailThreadEmpty }}
              </div>

              <template v-else>
                <article
                  v-for="entry in emailThreadItems"
                  :key="entry.id"
                  class="support-email__entry">
                  <div class="support-email__entry-head">
                    <strong class="truncate">{{ entry.authorName }}</strong>
                    <span class="support-email__entry-date">{{ entry.createdAtLabel }}</span>
                  </div>

                  <p
                    v-if="entry.bodyText"
                    class="support-email__entry-body">
                    {{ entry.bodyText }}
                  </p>

                  <div
                    v-if="entry.attachments.length"
                    class="support-email__attachments">
                    <a
                      v-for="attachment in entry.attachments"
                      :key="attachment.id"
                      :href="attachment.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="support-email__attachment">
                      <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                      <span class="truncate">{{ attachment.title }}</span>
                      <span class="support-email__attachment-details">{{ attachment.details }}</span>
                    </a>
                  </div>
                </article>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="libraryMediaViewer.open && activeLibraryMediaItem"
        class="fixed inset-0 z-[13000] flex items-center justify-center bg-black/80 p-4"
        @click.self="closeLibraryMediaViewer"
        @pointerdown="handleLibraryMediaViewerPointerDown"
        @pointerup="handleLibraryMediaViewerPointerUp"
        @touchstart.passive="handleLibraryMediaViewerTouchStart"
        @touchend="handleLibraryMediaViewerTouchEnd">
        <button
          type="button"
          class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          :aria-label="supportText.closeMediaViewerAria"
          @click="closeLibraryMediaViewer">
          ✕
        </button>
        <button
          v-if="mediaItems.length > 1"
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          :aria-label="supportText.previousMediaAria"
          @click="moveLibraryMediaViewer(-1)">
          ‹
        </button>
        <div
          class="max-h-[88vh] max-w-[92vw] overflow-hidden rounded-xl border border-white/20 bg-black/50"
          @click.stop>
          <img
            v-if="activeLibraryMediaItem.kind === 'image'"
            :src="activeLibraryMediaItem.url"
            :alt="activeLibraryMediaItem.title"
            class="max-h-[82vh] max-w-[92vw] object-contain" />
          <video
            v-else
            :src="activeLibraryMediaItem.url"
            class="max-h-[82vh] max-w-[92vw] object-contain"
            controls
            autoplay
            playsinline></video>
          <div class="px-3 py-2 text-sm text-white/90">
            {{ activeLibraryMediaItem.title }}
          </div>
        </div>
        <button
          v-if="mediaItems.length > 1"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          :aria-label="supportText.nextMediaAria"
          @click="moveLibraryMediaViewer(1)">
          ›
        </button>
      </div>
    </Teleport>
  </UiContainer>
</template>

<script lang="ts" setup>
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { definePageMeta, useHead, useNuxtApp } from "~/.nuxt/imports";
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
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
  const { t, locale } = useI18n({ useScope: "global" });
  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const supportText = reactive({
    ticket: "",
    subject: "",
    status: "",
    participants: "",
    participantsDetails: "",
    onlineCountSuffix: "",
    inChatSuffix: "",
    online: "",
    offline: "",
    you: "",
    sharedFiles: "",
    media: "",
    documents: "",
    links: "",
    library: "",
    loading: "",
    emptyMedia: "",
    emptyDocuments: "",
    emptyLinks: "",
    roleAdmin: "",
    roleClient: "",
    addAdmin: "",
    add: "",
    added: "",
    adding: "",
    noAdminsFound: "",
    searchAdminPlaceholder: "",
    closeDetailsAria: "",
    expandDetailsAria: "",
    toggleDetailsAria: "",
    closeMediaViewerAria: "",
    previousMediaAria: "",
    nextMediaAria: "",
    mediaPhoto: "",
    mediaVideo: "",
    addAdminSuccess: "",
    addAdminAlready: "",
    addAdminFailed: "",
    emailRequestTitle: "",
    replyToLabel: "",
    notProvided: "",
    emailThreadLoading: "",
    emailThreadEmpty: "",
    replyPlaceholder: "",
    sendReply: "",
    sendingReply: "",
    emailReplySent: "",
    emailReplyFailed: "",
  });
  const syncSupportText = () => {
    supportText.ticket = resolveText("support.chat.ticket", "Ticket");
    supportText.subject = resolveText("support.chat.subject", "Subject");
    supportText.status = resolveText("support.chat.status", "Status");
    supportText.participants = resolveText("support.chat.participants", "Participants");
    supportText.participantsDetails = resolveText("support.chat.participantsDetails", "Participants details");
    supportText.onlineCountSuffix = resolveText("support.chat.onlineCountSuffix", "online");
    supportText.inChatSuffix = resolveText("support.chat.inChatSuffix", "in chat");
    supportText.online = resolveText("support.chat.online", "Online");
    supportText.offline = resolveText("support.chat.offline", "Offline");
    supportText.you = resolveText("support.chat.you", "You");
    supportText.sharedFiles = resolveText("support.chat.sharedFiles", "Shared Files");
    supportText.media = resolveText("support.chat.media", "Media");
    supportText.documents = resolveText("support.chat.documents", "Documents");
    supportText.links = resolveText("support.chat.links", "Links");
    supportText.library = resolveText("support.chat.library", "Library");
    supportText.loading = resolveText("support.chat.loading", "Loading");
    supportText.emptyMedia = resolveText("support.chat.emptyMedia", "No media in this chat yet");
    supportText.emptyDocuments = resolveText("support.chat.emptyDocuments", "No documents in this chat yet");
    supportText.emptyLinks = resolveText("support.chat.emptyLinks", "No links in this chat yet");
    supportText.roleAdmin = resolveText("support.chat.roleAdmin", "Admin");
    supportText.roleClient = resolveText("support.chat.roleClient", "Client");
    supportText.addAdmin = resolveText("support.chat.addAdmin", "Add admin");
    supportText.add = resolveText("support.chat.add", "Add");
    supportText.added = resolveText("support.chat.added", "Added");
    supportText.adding = resolveText("support.chat.adding", "Adding...");
    supportText.noAdminsFound = resolveText("support.chat.noAdminsFound", "No admins found");
    supportText.searchAdminPlaceholder = resolveText(
      "support.chat.searchAdminPlaceholder",
      "Search admin by nickname or email"
    );
    supportText.closeDetailsAria = resolveText("support.chat.closeDetailsAria", "Close details");
    supportText.expandDetailsAria = resolveText("support.chat.expandDetailsAria", "Expand details");
    supportText.toggleDetailsAria = resolveText("support.chat.toggleDetailsAria", "Toggle details");
    supportText.closeMediaViewerAria = resolveText("support.chat.closeMediaViewerAria", "Close media viewer");
    supportText.previousMediaAria = resolveText("support.chat.previousMediaAria", "Previous media");
    supportText.nextMediaAria = resolveText("support.chat.nextMediaAria", "Next media");
    supportText.mediaPhoto = resolveText("support.chat.photo", "Photo");
    supportText.mediaVideo = resolveText("support.chat.video", "Video");
    supportText.addAdminSuccess = resolveText("support.chat.addAdminSuccess", "Admin added to chat");
    supportText.addAdminAlready = resolveText("support.chat.addAdminAlready", "Admin is already in chat");
    supportText.addAdminFailed = resolveText("support.chat.addAdminFailed", "Failed to add admin to chat");
    supportText.emailRequestTitle = resolveText("support.chat.emailRequestTitle", "Email support request");
    supportText.replyToLabel = resolveText("support.chat.replyToLabel", "Reply to");
    supportText.notProvided = resolveText("support.chat.notProvided", "not provided");
    supportText.emailThreadLoading = resolveText("support.chat.emailThreadLoading", "Loading request history...");
    supportText.emailThreadEmpty = resolveText("support.chat.emailThreadEmpty", "No messages in this request yet");
    supportText.replyPlaceholder = resolveText(
      "support.chat.replyPlaceholder",
      "Write a reply that will be sent to the client by email..."
    );
    supportText.sendReply = resolveText("support.chat.sendReply", "Send reply");
    supportText.sendingReply = resolveText("support.chat.sendingReply", "Sending...");
    supportText.emailReplySent = resolveText("support.chat.emailReplySent", "Reply sent.");
    supportText.emailReplyFailed = resolveText("support.chat.emailReplyFailed", "Failed to send reply.");
  };
  syncSupportText();

  const route = useRoute();
  const router = useRouter();
  const { $echo } = useNuxtApp() as { $echo?: any };

  const appCore = useAppCore();
  const toast = useToast();
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";
  const SUPPORT_MESSAGE_UPDATED_EVENT = "support-message-updated";

  const isLoading = ref(false);
  const supportGridRef = ref<HTMLElement | null>(null);
  const supportSidePanelRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
  const supportSideScrollRef = ref<HTMLElement | null>(null);
  const ticketMetaCardRef = ref<HTMLElement | null>(null);
  const desktopGridHeight = ref<number | null>(null);

  const id = computed(() => String(route.params.id));

  const currentUser = reactive({
    id: null,
    linkedUserId: null,
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    photoUrl: null,
  });
  const status = ref("");
  const subject = ref("");
  const ticketChannel = ref<"chat" | "email">("chat");
  const ticketReplyEmail = ref("");
  const isEmailThreadLoading = ref(false);
  const isEmailReplySending = ref(false);
  const emailReplyDraft = ref("");
  type EmailThreadAttachment = {
    id: string;
    title: string;
    url: string;
    details: string;
  };
  type EmailThreadItem = {
    id: string;
    authorName: string;
    createdAtLabel: string;
    bodyText: string;
    attachments: EmailThreadAttachment[];
  };
  const emailThreadItems = ref<EmailThreadItem[]>([]);
  const isEmailTicket = computed(() => ticketChannel.value === "email");
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
  const isSideTopCollapsed = ref(false);
  const isMobileViewport = ref(false);
  const isMobileFullscreenChat = ref(true);
  const participantsCardRef = ref<HTMLElement | null>(null);
  const isParticipantsPopoverOpen = ref(false);
  type MetaTooltipField = "id" | "subject";
  const activeMetaTooltip = ref<MetaTooltipField | null>(null);
  type ParticipantItem = {
    id: string;
    name: string;
    role: string;
    roleKey: "agent" | "customer";
    initials: string;
    online: boolean;
    isYou: boolean;
    photoUrl: string;
  };
  type ParticipantAdminCandidate = {
    id: string;
    name: string;
    email: string;
    initials: string;
    online: boolean;
    alreadyParticipant: boolean;
  };
  const participants = ref<ParticipantItem[]>([]);
  const presenceOnlineAdmins = ref<Array<Record<string, unknown>>>([]);
  const presenceOnlineClient = ref<Record<string, unknown> | null>(null);
  const participantsPreview = computed(() => participants.value.slice(0, 5));
  const participantsHiddenCount = computed(() =>
    Math.max(0, participants.value.length - participantsPreview.value.length)
  );
  const onlineParticipantsCount = computed(() => participants.value.filter(participant => participant.online).length);
  const totalParticipantsCount = computed(() => participants.value.length);
  const counterpartyOnline = computed(() => {
    const onlineCustomerId = normalizeText(presenceOnlineClient.value?.id);
    if (onlineCustomerId) return true;

    return participants.value.some(participant => participant.roleKey === "customer" && participant.online);
  });
  const isParticipantsAddPanelOpen = ref(false);
  const participantsAdminSearch = ref("");
  const participantsAdminLoading = ref(false);
  const participantsAdminAddingId = ref("");
  const participantsAdminCandidates = ref<ParticipantAdminCandidate[]>([]);
  let participantsAdminSearchTimer: ReturnType<typeof setTimeout> | null = null;
  let participantsPresencePollTimer: ReturnType<typeof setInterval> | null = null;
  let supportTicketChannel: any = null;
  const tabs = computed(() => [
    { id: "media" as SupportTab, label: supportText.media, count: mediaItems.value.length },
    { id: "documents" as SupportTab, label: supportText.documents, count: documentItems.value.length },
    { id: "links" as SupportTab, label: supportText.links, count: linkItems.value.length },
  ]);
  const activeTabLabel = computed(
    () => tabs.value.find(tab => tab.id === activeTab.value)?.label ?? supportText.library
  );
  const activeTabItemsCount = computed(() => {
    if (activeTab.value === "media") return mediaItems.value.length;
    if (activeTab.value === "documents") return documentItems.value.length;
    return linkItems.value.length;
  });
  const mediaTypeLabel = (kind: SupportMediaItem["kind"]): string => {
    return kind === "video" ? supportText.mediaVideo : supportText.mediaPhoto;
  };
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
  const normalizeParticipantRoleKey = (role: unknown): "agent" | "customer" => {
    const normalized = String(role ?? "")
      .trim()
      .toLowerCase();
    return normalized === "agent" ? "agent" : "customer";
  };
  const resolveParticipantRoleLabel = (roleKey: "agent" | "customer"): string => {
    return roleKey === "agent" ? supportText.roleAdmin : supportText.roleClient;
  };
  const isParticipantCurrentUser = (participantId: string): boolean => {
    const currentId = normalizeText(currentUser.id);
    const linkedUserId = normalizeText(currentUser.linkedUserId);
    return participantId !== "" && (participantId === currentId || participantId === linkedUserId);
  };
  const mapParticipantsFromPayload = (payload: Array<Record<string, unknown>>): ParticipantItem[] => {
    return payload
      .map(raw => {
        const participantId = normalizeText(raw.id);
        if (!participantId) return null;

        const roleKey = normalizeParticipantRoleKey(raw.role_key ?? raw.role);
        const firstName = normalizeText(raw.first_name);
        const lastName = normalizeText(raw.last_name);
        const email = normalizeText(raw.email);
        const name =
          normalizeText(raw.name) ||
          buildFullName(firstName, lastName) ||
          email ||
          (roleKey === "agent" ? supportText.roleAdmin : supportText.roleClient);
        const initials =
          normalizeText(raw.initials).toUpperCase() ||
          buildParticipantInitials(firstName, lastName, email, roleKey === "agent" ? "AD" : "CL");
        const photoUrl = normalizeText(raw.photo_url);

        return {
          id: participantId,
          name,
          role: resolveParticipantRoleLabel(roleKey),
          roleKey,
          initials: initials.slice(0, 2),
          online: Boolean(raw.online),
          isYou: isParticipantCurrentUser(participantId),
          photoUrl,
        } as ParticipantItem;
      })
      .filter((participant): participant is ParticipantItem => Boolean(participant))
      .sort((left, right) => {
        if (left.isYou && !right.isYou) return -1;
        if (!left.isYou && right.isYou) return 1;
        if (left.roleKey !== right.roleKey) return left.roleKey === "customer" ? -1 : 1;
        return left.name.localeCompare(right.name);
      });
  };
  const applyParticipantsPayload = (payload: unknown) => {
    const normalizedPayload = Array.isArray(payload) ? payload.filter(item => item && typeof item === "object") : [];
    participants.value = mapParticipantsFromPayload(normalizedPayload as Array<Record<string, unknown>>);
  };
  const applyPresenceSnapshot = (payload: Record<string, unknown>) => {
    presenceOnlineAdmins.value = Array.isArray(payload.online_admins)
      ? (payload.online_admins.filter(item => item && typeof item === "object") as Array<Record<string, unknown>>)
      : [];
    presenceOnlineClient.value =
      payload.online_client && typeof payload.online_client === "object"
        ? (payload.online_client as Record<string, unknown>)
        : null;
  };
  const updateParticipantsOnlineFromPresence = (payload: Record<string, unknown>) => {
    applyPresenceSnapshot(payload);
    if (!participants.value.length) return;

    const onlineAdminsRaw = Array.isArray(payload.online_admins) ? payload.online_admins : [];
    const onlineClientRaw =
      payload.online_client && typeof payload.online_client === "object" ? payload.online_client : null;

    const onlineAgentIds = new Set<string>();
    for (const rawOnlineAdmin of onlineAdminsRaw) {
      if (!rawOnlineAdmin || typeof rawOnlineAdmin !== "object") continue;
      const participantUserId =
        normalizeText((rawOnlineAdmin as Record<string, unknown>).participant_user_id) ||
        normalizeText((rawOnlineAdmin as Record<string, unknown>).id);
      if (participantUserId) {
        onlineAgentIds.add(participantUserId);
      }
    }

    const onlineCustomerId = normalizeText((onlineClientRaw as Record<string, unknown> | null)?.id);
    participants.value = participants.value.map(participant => ({
      ...participant,
      isYou: isParticipantCurrentUser(participant.id),
      online:
        participant.roleKey === "agent" ? onlineAgentIds.has(participant.id) : participant.id === onlineCustomerId,
    }));
  };
  const loadParticipantAdminCandidates = async () => {
    participantsAdminLoading.value = true;

    try {
      const response = await appCore.adminModules.tickets.getParticipantAdmins(id.value, {
        search: participantsAdminSearch.value,
        limit: 20,
      });

      const rawItems = Array.isArray(response?.data?.data?.items) ? response.data.data.items : [];
      participantsAdminCandidates.value = rawItems
        .map((item: Record<string, unknown>) => {
          const candidateId = normalizeText(item.id);
          if (!candidateId) return null;

          const name =
            normalizeText(item.name) ||
            normalizeText(item.nickname) ||
            normalizeText(item.email) ||
            supportText.roleAdmin;
          const email = normalizeText(item.email);
          const initials =
            normalizeText(item.initials).toUpperCase() || buildParticipantInitials(name, "", email, "AD");

          return {
            id: candidateId,
            name,
            email,
            initials: initials.slice(0, 2),
            online: Boolean(item.online),
            alreadyParticipant: Boolean(item.already_participant),
          } as ParticipantAdminCandidate;
        })
        .filter((candidate: ParticipantAdminCandidate | null): candidate is ParticipantAdminCandidate =>
          Boolean(candidate)
        );
    } catch {
      participantsAdminCandidates.value = [];
    } finally {
      participantsAdminLoading.value = false;
    }
  };
  const toggleParticipantsAddPanel = () => {
    isParticipantsAddPanelOpen.value = !isParticipantsAddPanelOpen.value;
    if (isParticipantsAddPanelOpen.value) {
      void loadParticipantAdminCandidates();
    }
  };
  const handleParticipantsAdminSearchInput = () => {
    if (participantsAdminSearchTimer) {
      clearTimeout(participantsAdminSearchTimer);
    }

    participantsAdminSearchTimer = setTimeout(() => {
      void loadParticipantAdminCandidates();
    }, 220);
  };
  const addAdminParticipant = async (adminId: string) => {
    if (!adminId || participantsAdminAddingId.value) return;

    participantsAdminAddingId.value = adminId;
    try {
      const response = await appCore.adminModules.tickets.addParticipantAdmins(id.value, {
        admin_ids: [adminId],
      });

      const participantsPayload = response?.data?.data?.participants;
      if (Array.isArray(participantsPayload)) {
        applyParticipantsPayload(participantsPayload);
      }

      const addedCount = Number(response?.data?.data?.added ?? 0);
      if (addedCount > 0) {
        toast.success(supportText.addAdminSuccess);
      } else {
        toast.info(supportText.addAdminAlready);
      }

      await loadParticipantAdminCandidates();
    } catch {
      toast.error(supportText.addAdminFailed);
    } finally {
      participantsAdminAddingId.value = "";
    }
  };
  const toggleParticipantsPopover = () => {
    const nextState = !isParticipantsPopoverOpen.value;
    isParticipantsPopoverOpen.value = nextState;
    if (!nextState) {
      isParticipantsAddPanelOpen.value = false;
    }
  };
  const closeParticipantsPopover = () => {
    isParticipantsPopoverOpen.value = false;
    isParticipantsAddPanelOpen.value = false;
  };
  const closeMetaTooltip = () => {
    activeMetaTooltip.value = null;
  };
  const toggleMetaTooltip = (field: MetaTooltipField) => {
    if (!isMobileViewport.value) return;
    activeMetaTooltip.value = activeMetaTooltip.value === field ? null : field;
  };
  const handleParticipantsPointerDown = (event: PointerEvent) => {
    const target = event.target as Node;

    if (isParticipantsPopoverOpen.value) {
      const participantsCard = participantsCardRef.value;
      if (participantsCard && !participantsCard.contains(target)) {
        closeParticipantsPopover();
      }
    }

    if (activeMetaTooltip.value) {
      const ticketMetaCard = ticketMetaCardRef.value;
      if (ticketMetaCard && !ticketMetaCard.contains(target)) {
        closeMetaTooltip();
      }
    }
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
  const SIDE_TOP_COLLAPSE_DISTANCE = 220;
  const SIDE_TOP_COLLAPSE_SNAP_THRESHOLD = 0.45;
  const SIDE_TOP_WHEEL_SNAP_MS = 140;
  const SIDE_TOP_HORIZONTAL_DRIFT_LIMIT = 56;
  const LIBRARY_VIEWER_SWIPE_THRESHOLD = 52;
  const LIBRARY_VIEWER_MAX_VERTICAL_DRIFT = 120;
  const LINKS_PAGE_SIZE = 50;
  const MAX_LINKS_PAGES = 40;
  const MESSAGE_URL_PATTERN = /\b((?:https?:\/\/|www\.)[^\s<>"'`]+)/gi;
  let sideScrollDragStartY = 0;
  let sideScrollStartTop = 0;
  let sideTopMouseGestureActive = false;
  let sideTopMouseGestureStartProgress = 0;
  let sideTopWheelSnapTimeoutId: ReturnType<typeof setTimeout> | null = null;
  const sideScrollTouchStartY = ref<number | null>(null);
  const sideScrollTouchStartX = ref<number | null>(null);
  const sideScrollTouchDeltaY = ref(0);
  const sideScrollTouchDeltaX = ref(0);
  const sideScrollTouchFromTopSection = ref(false);
  const sideScrollTouchStartProgress = ref(0);
  const sideTopCollapseProgress = ref(0);
  const isSideTopInteracting = ref(false);
  const panelTouchStartY = ref<number | null>(null);
  const panelTouchStartX = ref<number | null>(null);
  const panelTouchDeltaY = ref(0);
  const panelTouchDeltaX = ref(0);
  const panelDragOffset = ref(0);
  const panelDragMaxOffset = ref(0);
  const isPanelDragging = ref(false);
  const libraryMediaViewer = reactive({
    open: false,
    index: 0,
  });
  const libraryViewerSwipeStart = reactive({
    x: null as number | null,
    y: null as number | null,
  });
  let panelCloseTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let desktopGridRafId: number | null = null;

  const supportGridStyle = computed(() => {
    if (isEmailTicket.value || isMobileViewport.value || desktopGridHeight.value === null) return undefined;

    const height = `${desktopGridHeight.value}px`;
    return {
      height,
      minHeight: height,
    };
  });

  const supportChatWrapperStyle = computed(() => {
    if (isEmailTicket.value) return undefined;
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

  const sideTopExpandStyle = computed<Record<string, string>>(() => ({
    "--support-side-top-progress": `${sideTopCollapseProgress.value}`,
  }));

  const activeLibraryMediaItem = computed<SupportMediaItem | null>(() => {
    return mediaItems.value[libraryMediaViewer.index] ?? null;
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
      closeMetaTooltip();
    }

    if (!nextMobile) {
      closeMetaTooltip();
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
    expandSideTopSection();
    isSideExpanded.value = true;
  };

  const handleMobileHeaderSwipe = (direction: "up" | "down") => {
    if (!isMobileViewport.value || !isMobileFullscreenChat.value) return;

    if (direction === "down") {
      clearSidePanelCloseTimer();
      panelDragOffset.value = 0;
      isPanelDragging.value = false;
      expandSideTopSection();
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
    expandSideTopSection();
    panelDragOffset.value = 0;
    closeMetaTooltip();
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

  const formatEmailThreadDate = (value: unknown): string => {
    const timestamp = parseMessageCreatedAt(value);
    return new Date(timestamp).toLocaleString(locale.value || undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const convertMessageBodyToPlainText = (value: unknown): string => {
    const source = String(value ?? "");
    if (!source.trim()) return "";

    return source
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
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
    if (isEmailTicket.value) return;
    await loadLibraryFromChat();
  };

  const mapEmailThreadMessages = (messages: Array<Record<string, unknown>>): EmailThreadItem[] => {
    return messages
      .map((message, messageIndex) => {
        const messageId = normalizeText(message.id) || `${id.value}-email-${messageIndex}`;
        const authorName =
          normalizeText(message.author) ||
          buildFullName(normalizeText(message.author_first_name), normalizeText(message.author_last_name)) ||
          normalizeText(message.author_email) ||
          supportText.roleClient;
        const bodyText = convertMessageBodyToPlainText(message.body);
        const createdAtLabel = formatEmailThreadDate(message.created_at ?? message.createdAt);
        const createdAt = parseMessageCreatedAt(message.created_at ?? message.createdAt);

        const rawMeta = message.meta;
        const rawAttachments =
          rawMeta && typeof rawMeta === "object" && Array.isArray((rawMeta as Record<string, unknown>).attachments)
            ? ((rawMeta as Record<string, unknown>).attachments as Array<unknown>)
            : [];

        const attachments: EmailThreadAttachment[] = rawAttachments
          .map((rawAttachment, attachmentIndex) => {
            if (!rawAttachment || typeof rawAttachment !== "object") return null;
            const attachment = rawAttachment as Record<string, unknown>;
            const url = resolveAttachmentUrl(attachment);
            if (!url) return null;

            const attachmentId = normalizeText(attachment.id) || `${messageId}-attachment-${attachmentIndex}`;
            const title = resolveAttachmentTitle(attachment, url);
            const sizeLabel = formatFileSize(attachment.size);
            const mimeType = normalizeText(attachment.mime_type ?? attachment.mimeType);

            return {
              id: attachmentId,
              title,
              url,
              details: [sizeLabel, mimeType].filter(Boolean).join(" • "),
            } as EmailThreadAttachment;
          })
          .filter((attachment): attachment is EmailThreadAttachment => Boolean(attachment));

        return {
          id: messageId,
          authorName,
          createdAtLabel,
          bodyText,
          attachments,
          createdAt,
        };
      })
      .sort((left, right) => left.createdAt - right.createdAt)
      .map(({ createdAt, ...item }) => item);
  };

  const loadEmailThread = async () => {
    if (!isEmailTicket.value) {
      emailThreadItems.value = [];
      return;
    }
    if (isEmailThreadLoading.value) return;

    isEmailThreadLoading.value = true;
    try {
      const response = await appCore.adminModules.tickets.getTicketMessages(id.value, {
        page: 1,
        pageSize: 100,
        sort: "desc",
      });
      const payload = response?.data;
      const messages = Array.isArray(payload?.data)
        ? (payload.data as Array<Record<string, unknown>>)
        : Array.isArray(payload)
          ? (payload as Array<Record<string, unknown>>)
          : [];
      emailThreadItems.value = mapEmailThreadMessages(messages);

      const latestMessage = messages[messages.length - 1];
      const latestMessageId = normalizeText(latestMessage?.id);
      if (latestMessageId) {
        await appCore.adminModules.tickets.markRead(id.value, { last_message_id: latestMessageId });
        useEventBus.emit(SUPPORT_UNREAD_UPDATED_EVENT, {
          ticketId: id.value,
          unread: 0,
        });
      }
    } catch {
      // noop
    } finally {
      isEmailThreadLoading.value = false;
    }
  };

  const reloadEmailThread = async () => {
    await loadEmailThread();
  };

  const sendEmailReply = async () => {
    if (!isEmailTicket.value) return;
    const body = emailReplyDraft.value.trim();
    if (!body || isEmailReplySending.value) return;

    isEmailReplySending.value = true;
    try {
      await appCore.adminModules.tickets.storeTicketMessage(id.value, {
        type: "text",
        body,
      });
      emailReplyDraft.value = "";
      toast.success(supportText.emailReplySent);
      await loadEmailThread();
    } catch {
      toast.error(supportText.emailReplyFailed);
    } finally {
      isEmailReplySending.value = false;
    }
  };

  const resetLibraryViewerSwipe = () => {
    libraryViewerSwipeStart.x = null;
    libraryViewerSwipeStart.y = null;
  };

  const closeLibraryMediaViewer = () => {
    libraryMediaViewer.open = false;
    libraryMediaViewer.index = 0;
    resetLibraryViewerSwipe();
  };

  const openLibraryMediaViewer = (mediaId: string) => {
    const index = mediaItems.value.findIndex(item => item.id === mediaId);
    libraryMediaViewer.index = index >= 0 ? index : 0;
    libraryMediaViewer.open = true;
  };

  const moveLibraryMediaViewer = (direction: -1 | 1) => {
    if (!mediaItems.value.length) return;
    const length = mediaItems.value.length;
    libraryMediaViewer.index = (libraryMediaViewer.index + direction + length) % length;
  };

  const completeLibraryViewerSwipe = (currentX: number | null, currentY: number | null) => {
    if (
      mediaItems.value.length <= 1 ||
      libraryViewerSwipeStart.x === null ||
      libraryViewerSwipeStart.y === null ||
      currentX === null ||
      currentY === null
    ) {
      resetLibraryViewerSwipe();
      return;
    }

    const deltaX = currentX - libraryViewerSwipeStart.x;
    const deltaY = currentY - libraryViewerSwipeStart.y;
    if (Math.abs(deltaX) >= LIBRARY_VIEWER_SWIPE_THRESHOLD && Math.abs(deltaY) <= LIBRARY_VIEWER_MAX_VERTICAL_DRIFT) {
      moveLibraryMediaViewer(deltaX > 0 ? -1 : 1);
    }

    resetLibraryViewerSwipe();
  };

  const handleLibraryMediaViewerPointerDown = (event: PointerEvent) => {
    if (mediaItems.value.length <= 1) return;
    libraryViewerSwipeStart.x = event.clientX;
    libraryViewerSwipeStart.y = event.clientY;
  };

  const handleLibraryMediaViewerPointerUp = (event: PointerEvent) => {
    completeLibraryViewerSwipe(event.clientX, event.clientY);
  };

  const handleLibraryMediaViewerTouchStart = (event: TouchEvent) => {
    if (mediaItems.value.length <= 1) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    libraryViewerSwipeStart.x = touch.clientX;
    libraryViewerSwipeStart.y = touch.clientY;
  };

  const handleLibraryMediaViewerTouchEnd = (event: TouchEvent) => {
    const touch = event.changedTouches?.[0];
    completeLibraryViewerSwipe(touch?.clientX ?? null, touch?.clientY ?? null);
  };

  const handleLibraryMediaViewerKeydown = (event: KeyboardEvent) => {
    if (!libraryMediaViewer.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeLibraryMediaViewer();
      return;
    }

    if (mediaItems.value.length <= 1) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLibraryMediaViewer(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLibraryMediaViewer(1);
    }
  };
  const isSideScrollAtTop = (): boolean => {
    const el = supportSideScrollRef.value;
    if (!el) return true;
    return el.scrollTop <= 1;
  };
  const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
  const clearSideTopWheelSnapTimer = () => {
    if (sideTopWheelSnapTimeoutId !== null) {
      clearTimeout(sideTopWheelSnapTimeoutId);
      sideTopWheelSnapTimeoutId = null;
    }
  };
  const isTopSectionGestureTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    return !!target.closest(".support-side__collapsible, .support-side__mobile-header");
  };
  const resolveLibraryContentElement = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    const libraryContent = target.closest(".support-side__library-content");
    return libraryContent instanceof HTMLElement ? libraryContent : null;
  };
  const isLibraryContentAtTop = (target: EventTarget | null): boolean => {
    const libraryContent = resolveLibraryContentElement(target);
    if (!libraryContent) return false;
    return libraryContent.scrollTop <= 1;
  };
  const canStartSideTopGesture = (target: EventTarget | null): boolean => {
    return isTopSectionGestureTarget(target) || isLibraryContentAtTop(target);
  };
  const setSideTopCollapseProgress = (value: number) => {
    const nextProgress = clampNumber(value, 0, 1);
    sideTopCollapseProgress.value = nextProgress;

    const nextCollapsed = nextProgress >= 0.999;
    if (nextCollapsed !== isSideTopCollapsed.value) {
      isSideTopCollapsed.value = nextCollapsed;
      if (nextCollapsed) {
        closeParticipantsPopover();
        closeMetaTooltip();
      }
    }
  };
  const snapSideTopCollapseProgress = () => {
    if (sideTopCollapseProgress.value >= SIDE_TOP_COLLAPSE_SNAP_THRESHOLD) {
      collapseSideTopSection();
      return;
    }
    expandSideTopSection();
  };
  const collapseSideTopSection = () => {
    clearSideTopWheelSnapTimer();
    isSideTopInteracting.value = false;
    setSideTopCollapseProgress(1);
  };
  const expandSideTopSection = () => {
    clearSideTopWheelSnapTimer();
    isSideTopInteracting.value = false;
    setSideTopCollapseProgress(0);
  };
  const resetSideScrollTouchGesture = () => {
    sideScrollTouchStartY.value = null;
    sideScrollTouchStartX.value = null;
    sideScrollTouchDeltaY.value = 0;
    sideScrollTouchDeltaX.value = 0;
    sideScrollTouchFromTopSection.value = false;
    sideScrollTouchStartProgress.value = 0;
  };
  const handleSideScrollWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) < 3) return;
    if (!isSideScrollAtTop()) return;
    if (!canStartSideTopGesture(event.target)) return;
    const movingTowardCollapse = event.deltaY > 0;
    if (sideTopCollapseProgress.value <= 0.001 && !movingTowardCollapse) return;
    if (sideTopCollapseProgress.value >= 0.999 && movingTowardCollapse) return;

    isSideTopInteracting.value = true;
    setSideTopCollapseProgress(sideTopCollapseProgress.value + event.deltaY / SIDE_TOP_COLLAPSE_DISTANCE);
    event.preventDefault();

    clearSideTopWheelSnapTimer();
    sideTopWheelSnapTimeoutId = setTimeout(() => {
      isSideTopInteracting.value = false;
      snapSideTopCollapseProgress();
    }, SIDE_TOP_WHEEL_SNAP_MS);
  };
  const handleSideScrollTouchStart = (event: TouchEvent) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    sideScrollTouchStartY.value = touch.clientY;
    sideScrollTouchStartX.value = touch.clientX;
    sideScrollTouchDeltaY.value = 0;
    sideScrollTouchDeltaX.value = 0;
    sideScrollTouchFromTopSection.value = canStartSideTopGesture(event.target);
    sideScrollTouchStartProgress.value = sideTopCollapseProgress.value;
  };
  const handleSideScrollTouchMove = (event: TouchEvent) => {
    if (sideScrollTouchStartY.value === null || sideScrollTouchStartX.value === null) return;
    if (!sideScrollTouchFromTopSection.value) return;
    if (!isSideScrollAtTop()) return;

    const touch = event.touches?.[0];
    if (!touch) return;

    sideScrollTouchDeltaY.value = touch.clientY - sideScrollTouchStartY.value;
    sideScrollTouchDeltaX.value = touch.clientX - sideScrollTouchStartX.value;
    const verticalSwipe = Math.abs(sideScrollTouchDeltaY.value) > Math.abs(sideScrollTouchDeltaX.value);
    const smallHorizontalDrift = Math.abs(sideScrollTouchDeltaX.value) <= SIDE_TOP_HORIZONTAL_DRIFT_LIMIT;
    if (!verticalSwipe || !smallHorizontalDrift) return;

    clearSideTopWheelSnapTimer();
    isSideTopInteracting.value = true;
    const progressDelta = -sideScrollTouchDeltaY.value / SIDE_TOP_COLLAPSE_DISTANCE;
    const movingTowardCollapse = progressDelta > 0;
    if (sideTopCollapseProgress.value <= 0.001 && !movingTowardCollapse) return;
    if (sideTopCollapseProgress.value >= 0.999 && movingTowardCollapse) return;
    setSideTopCollapseProgress(sideScrollTouchStartProgress.value + progressDelta);
    event.preventDefault();
  };
  const handleSideScrollTouchEnd = () => {
    if (sideScrollTouchFromTopSection.value && isSideTopInteracting.value) {
      isSideTopInteracting.value = false;
      snapSideTopCollapseProgress();
    }
    resetSideScrollTouchGesture();
  };

  const handleSideScrollMouseMove = (event: MouseEvent) => {
    if (sideTopMouseGestureActive) {
      const deltaY = sideScrollDragStartY - event.clientY;
      setSideTopCollapseProgress(sideTopMouseGestureStartProgress + deltaY / SIDE_TOP_COLLAPSE_DISTANCE);
      event.preventDefault();
      return;
    }

    if (!isSideScrollDragging.value) return;
    const el = supportSideScrollRef.value;
    if (!el) return;

    const deltaY = event.clientY - sideScrollDragStartY;
    el.scrollTop = sideScrollStartTop - deltaY;
    event.preventDefault();
  };

  const handleSideScrollMouseUp = () => {
    if (!isSideScrollDragging.value && !sideTopMouseGestureActive) return;

    if (sideTopMouseGestureActive) {
      sideTopMouseGestureActive = false;
      isSideTopInteracting.value = false;
      snapSideTopCollapseProgress();
    }

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

    if (!isSideTopCollapsed.value && isSideScrollAtTop() && canStartSideTopGesture(event.target)) {
      clearSideTopWheelSnapTimer();
      isSideTopInteracting.value = true;
      sideTopMouseGestureActive = true;
      sideTopMouseGestureStartProgress = sideTopCollapseProgress.value;
      sideScrollDragStartY = event.clientY;

      window.addEventListener("mousemove", handleSideScrollMouseMove, { passive: false });
      window.addEventListener("mouseup", handleSideScrollMouseUp);
      event.preventDefault();
      return;
    }

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
    const channel = normalizeText(ticket?.channel).toLowerCase();
    const hasReplyEmail = normalizeText(ticket?.reply_email) !== "";
    const isEmailByPayload = channel === "email" || (channel === "" && hasReplyEmail);

    status.value = ticket?.status ?? "open";
    subject.value = ticket?.subject ?? "-";
    ticketChannel.value = isEmailByPayload ? "email" : "chat";
    if (ticketChannel.value === "email") {
      linkItems.value = [];
      mediaItems.value = [];
      documentItems.value = [];
    }

    const creatorFirstName = creator?.first_name ?? null;
    const creatorLastName = creator?.last_name ?? null;
    const creatorEmail = creator?.email ?? null;
    ticketReplyEmail.value = normalizeText(ticket?.reply_email ?? creatorEmail);
    const creatorPhotoUrl = normalizeText(creator?.photo_url);
    const creatorFullName = buildFullName(creatorFirstName, creatorLastName);
    applyPresenceSnapshot({});
    const serverParticipants = Array.isArray(ticket?.participants) ? ticket.participants : [];
    if (serverParticipants.length > 0) {
      applyParticipantsPayload(serverParticipants);
    } else {
      const fallbackParticipants: Array<Record<string, unknown>> = [];
      const currentParticipantId = normalizeText(currentUser.linkedUserId) || normalizeText(currentUser.id);
      if (currentParticipantId) {
        fallbackParticipants.push({
          id: currentParticipantId,
          role_key: "agent",
          role: supportText.roleAdmin,
          name: normalizeText(currentUser.name) || supportText.roleAdmin,
          first_name: currentUser.firstName,
          last_name: currentUser.lastName,
          email: currentUser.email,
          initials: buildParticipantInitials(currentUser.firstName, currentUser.lastName, currentUser.email, "AD"),
          photo_url: currentUser.photoUrl,
          online: true,
        });
      }

      const creatorId = normalizeText(ticket?.creator_id);
      if (creatorId) {
        fallbackParticipants.push({
          id: creatorId,
          role_key: "customer",
          role: supportText.roleClient,
          name: creatorFullName || normalizeText(creatorEmail) || supportText.roleClient,
          first_name: creatorFirstName,
          last_name: creatorLastName,
          email: creatorEmail,
          initials: buildParticipantInitials(creatorFirstName, creatorLastName, creatorEmail, "CL"),
          photo_url: creatorPhotoUrl,
          online: false,
        });
      }

      applyParticipantsPayload(fallbackParticipants);
    }

    isLoading.value = false;
    await nextTick();
    scheduleDesktopGridMeasure();
  };

  const refreshParticipantsFromTicket = async () => {
    try {
      const response = await appCore.adminModules.tickets.getById(id.value);
      const ticket = response?.data ?? {};
      const serverParticipants = Array.isArray(ticket?.participants) ? ticket.participants : [];
      if (serverParticipants.length > 0) {
        applyParticipantsPayload(serverParticipants);
        return;
      }
      updateParticipantsOnlineFromPresence({});
    } catch {
      // noop
    }
  };

  const stopParticipantsPresencePoll = () => {
    if (!participantsPresencePollTimer) return;
    clearInterval(participantsPresencePollTimer);
    participantsPresencePollTimer = null;
  };

  const startParticipantsPresencePoll = () => {
    stopParticipantsPresencePoll();
    if (isEmailTicket.value) return;

    participantsPresencePollTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void refreshParticipantsFromTicket();
    }, 5000);
  };

  const handleSupportPresenceUpdated = (payload?: any) => {
    if (!payload || typeof payload !== "object") return;

    const payloadTicketId = String(payload.ticketId ?? payload.ticket_id ?? "");
    if (!payloadTicketId || payloadTicketId !== id.value) return;
    const actorParticipantId = normalizeText(payload.actor_participant_id);
    if (actorParticipantId && !normalizeText(currentUser.linkedUserId)) {
      currentUser.linkedUserId = actorParticipantId;
    }

    applyPresenceSnapshot(payload as Record<string, unknown>);

    const participantsPayload = Array.isArray(payload.participants) ? payload.participants : [];
    if (participantsPayload.length > 0) {
      applyParticipantsPayload(participantsPayload);
      return;
    }

    updateParticipantsOnlineFromPresence(payload as Record<string, unknown>);
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

  const disconnectSupportPresenceRealtime = () => {
    if (!supportTicketChannel) return;

    supportTicketChannel.stopListening(".ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening("ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
    supportTicketChannel = null;
  };

  const connectSupportPresenceRealtime = () => {
    if (!id.value || isEmailTicket.value || supportTicketChannel) return;

    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    supportTicketChannel = echoClient.private(`support.ticket.${id.value}`);
    supportTicketChannel.stopListening(".ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening("ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
    supportTicketChannel.stopListening("App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
    supportTicketChannel.listen(".ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.listen("ticket.presence.updated", handleSupportPresenceUpdated);
    supportTicketChannel.listen(".App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
    supportTicketChannel.listen("App\\Events\\TicketPresenceUpdated", handleSupportPresenceUpdated);
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

    const messageType = normalizeText(rawMessage.type).toLowerCase();
    const messageMeta =
      rawMessage.meta && typeof rawMessage.meta === "object" ? (rawMessage.meta as Record<string, unknown>) : null;
    const messageEvent = normalizeText(messageMeta?.event);
    if (
      messageType === "system" &&
      ["participant_joined", "participant_added", "participant_removed", "participant_left"].includes(messageEvent)
    ) {
      void refreshParticipantsFromTicket();
    }

    if (isEmailTicket.value) {
      void loadEmailThread();
      return;
    }

    mergeLibraryFromMessages([rawMessage]);
  };

  onMounted(async () => {
    useEventBus.on(SUPPORT_MESSAGE_UPDATED_EVENT, handleSupportMessageUpdated);
    updateViewportState();
    window.addEventListener("resize", updateViewportState, { passive: true });
    window.addEventListener("keydown", handleLibraryMediaViewerKeydown);

    const response = await appCore.adminModules.auth.getAuthUser();
    const firstName = response.data.first_name ?? null;
    const lastName = response.data.last_name ?? null;
    const email = response.data.email ?? null;
    const photoUrl = response.data.photo_url ?? response.data.avatar_url ?? response.data.avatar ?? null;
    const normalizedPhotoUrl = normalizeText(photoUrl);
    const fullName = buildFullName(firstName, lastName);
    const displayName =
      fullName || normalizeText(response.data.nickname) || normalizeText(firstName) || supportText.roleAdmin;

    currentUser.id = response.data.id;
    currentUser.linkedUserId = response.data.user_id ?? null;
    currentUser.name = displayName;
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.email = email;
    currentUser.photoUrl = normalizedPhotoUrl || null;

    await loadData();
    if (isEmailTicket.value) {
      await loadEmailThread();
    } else {
      await loadLibraryFromChat();
      connectSupportPresenceRealtime();
    }
    startParticipantsPresencePoll();
    scheduleDesktopGridMeasure();
    window.addEventListener("pointerdown", handleParticipantsPointerDown);
  });

  watch(activeTab, () => {
    if (isEmailTicket.value) return;
    if (activeTabItemsCount.value > 0 || isLibraryLoading.value) return;
    void loadLibraryFromChat();
  });

  watch(locale, () => {
    syncSupportText();
    participants.value = participants.value.map(participant => ({
      ...participant,
      role: resolveParticipantRoleLabel(participant.roleKey),
    }));
    if (isEmailTicket.value) {
      void loadEmailThread();
      disconnectSupportPresenceRealtime();
    } else {
      connectSupportPresenceRealtime();
    }
  });

  watch(mediaItems, () => {
    if (!libraryMediaViewer.open) return;
    if (!mediaItems.value.length) {
      closeLibraryMediaViewer();
      return;
    }

    if (libraryMediaViewer.index >= mediaItems.value.length) {
      libraryMediaViewer.index = mediaItems.value.length - 1;
    }
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_MESSAGE_UPDATED_EVENT, handleSupportMessageUpdated);
    window.removeEventListener("resize", updateViewportState);
    window.removeEventListener("keydown", handleLibraryMediaViewerKeydown);
    window.removeEventListener("pointerdown", handleParticipantsPointerDown);
    clearSidePanelCloseTimer();
    clearSideTopWheelSnapTimer();
    if (desktopGridRafId !== null) {
      window.cancelAnimationFrame(desktopGridRafId);
      desktopGridRafId = null;
    }
    if (participantsAdminSearchTimer) {
      clearTimeout(participantsAdminSearchTimer);
      participantsAdminSearchTimer = null;
    }
    stopParticipantsPresencePoll();
    disconnectSupportPresenceRealtime();
    handleSideScrollMouseUp();
    closeLibraryMediaViewer();
  });
</script>

<style lang="scss" scoped>
  :global(html.support-chat-fullscreen),
  :global(body.support-chat-fullscreen) {
    height: 100dvh !important;
    overflow: hidden !important;
  }

  :global(html.support-chat-fullscreen .page-header),
  :global(body.support-chat-fullscreen .page-header) {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateY(-120%) !important;
  }

  :global(html.support-chat-fullscreen .page-content),
  :global(body.support-chat-fullscreen .page-content) {
    padding-top: 0 !important;
  }

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

  .support-email {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
  }

  .support-email__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid var(--color-stroke-ui-light);
    padding: 14px 16px;
  }

  .support-email__title-wrap {
    min-width: 0;
  }

  .support-email__title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--ui-text-main);
  }

  .support-email__reply-to {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--ui-text-secondary);
    word-break: break-word;
  }

  .support-email__refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-main);
  }

  .support-email__refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .support-email__thread {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    padding: 12px 16px;
  }

  .support-email__state {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    font-size: 13px;
  }

  .support-email__entry {
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: var(--ui-background-card);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .support-email__entry-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
    color: var(--ui-text-main);
  }

  .support-email__entry-date {
    color: var(--ui-text-secondary);
    white-space: nowrap;
    font-size: 12px;
  }

  .support-email__entry-body {
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--ui-text-main);
    font-size: 14px;
    line-height: 1.5;
  }

  .support-email__attachments {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .support-email__attachment {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: var(--ui-background-panel);
    padding: 8px 10px;
    color: var(--ui-text-main);
    text-decoration: none;
  }

  .support-email__attachment-details {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
  }

  .support-email__reply {
    border-top: 1px solid var(--color-stroke-ui-light);
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--ui-background-card);
  }

  .support-email__reply-input {
    width: 100%;
    min-height: 92px;
    resize: vertical;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    color: var(--ui-text-main);
    padding: 10px 12px;
    font-size: 14px;
    line-height: 1.45;
  }

  .support-email__reply-submit {
    align-self: flex-end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 130px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: var(--ui-primary-main);
    color: var(--ui-text-main);
    font-weight: 600;
    font-size: 14px;
  }

  .support-email__reply-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    flex: 1;
    min-height: 0;
    --support-side-top-progress: 0;
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
    max-height: calc(2000px * (1 - var(--support-side-top-progress, 0)));
    opacity: calc(1 - var(--support-side-top-progress, 0));
    transform: translateY(calc(-8px * var(--support-side-top-progress, 0)));
    transform-origin: top;
    transition:
      max-height 0.26s ease,
      opacity 0.22s ease,
      transform 0.26s ease;
  }

  .support-side__expand.is-top-collapsed .support-side__collapsible {
    max-height: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
    pointer-events: none;
  }

  .support-side__expand.is-top-interacting .support-side__collapsible {
    transition: none;
  }

  .support-side__top-expand {
    align-self: center;
    position: sticky;
    top: 0;
    z-index: 2;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in oklab, var(--ui-background-card) 95%, transparent);
    color: var(--ui-text-main);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .support-side__top-expand:hover {
    background: var(--ui-background-panel);
    transform: translateY(-1px);
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

  .support-side__ticket-meta {
    background: var(--ui-background-card);
    border-color: var(--color-stroke-ui-dark);
  }

  .support-side__meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .support-side__meta-item {
    min-width: 0;
    flex: 1 1 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .support-side__meta-item--id {
    flex: 0 1 46%;
  }

  .support-side__meta-item--subject {
    flex: 1 1 54%;
  }

  .support-side__meta-label {
    font-size: 11px;
    line-height: 1.2;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ui-text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .support-side__meta-divider {
    width: 1px;
    align-self: stretch;
    background: var(--color-stroke-ui-dark);
    opacity: 0.75;
    flex-shrink: 0;
  }

  .support-side__meta-value-wrap {
    position: relative;
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .support-side__meta-value-wrap--subject {
    gap: 0;
  }

  .support-side__meta-value-trigger {
    min-width: 0;
    width: 100%;
    border: 0;
    margin: 0;
    padding: 0;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--ui-text-main);
    background: transparent;
    cursor: pointer;
  }

  .support-side__meta-value-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .support-side__meta-tooltip {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 30;
    max-width: min(70vw, 360px);
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: color-mix(in oklab, var(--ui-background-panel) 96%, transparent);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.35;
    white-space: normal;
    word-break: break-word;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-2px);
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  .support-side__meta-value-wrap--subject .support-side__meta-tooltip {
    left: auto;
    right: 0;
  }

  @media (hover: hover) {
    .support-side__meta-value-wrap:hover .support-side__meta-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .support-side__meta-value-wrap.is-open .support-side__meta-tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 767px) {
    .support-side__meta-label {
      font-size: 10px;
    }

    .support-side__meta-item--id {
      flex-basis: 48%;
    }

    .support-side__meta-item--subject {
      flex-basis: 52%;
    }

    .support-side__meta-tooltip {
      max-width: min(84vw, 320px);
    }
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

  .support-side__participants {
    position: relative;
  }

  .support-side__participants-trigger {
    width: 100%;
    border: 0;
    background: transparent;
    padding: 0;
    margin: 0;
    color: inherit;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: pointer;
  }

  .support-side__participants-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .support-side__participants-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .support-side__participants-summary-text {
    font-size: 12px;
    line-height: 1.3;
    color: var(--ui-text-secondary);
    white-space: nowrap;
  }

  .support-side__participants-stack {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .support-side__participant-avatar--stack {
    width: 30px;
    height: 30px;
    margin-left: -8px;
    border: 2px solid var(--ui-background-panel);
  }

  .support-side__participant-avatar--stack:first-child {
    margin-left: 0;
  }

  .support-side__participant-avatar--more {
    font-size: 10px;
    font-weight: 700;
    color: var(--ui-text-secondary);
    background: var(--ui-background);
  }

  .support-side__participants-popover {
    position: absolute;
    z-index: 22;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-dark);
    background: color-mix(in oklab, var(--ui-background-panel) 96%, transparent);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    padding: 10px;
  }

  .support-side__participants-popover-title {
    font-size: 12px;
    line-height: 1.35;
    color: var(--ui-text-secondary);
    margin-bottom: 0;
  }

  .support-side__participants-popover-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .support-side__participants-add-button {
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-main);
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .support-side__participants-add-panel {
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 8px;
  }

  .support-side__participants-add-search {
    width: 100%;
    border: 1px solid var(--color-stroke-ui-light);
    background: transparent;
    color: var(--ui-text-main);
    border-radius: 8px;
    padding: 7px 9px;
    font-size: 13px;
    line-height: 1.3;
    outline: none;
  }

  .support-side__participants-add-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: min(220px, 34vh);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .support-side__participants-add-list::-webkit-scrollbar {
    display: none;
  }

  .support-side__participants-add-item {
    width: 100%;
    border: 1px solid var(--color-stroke-ui-light);
    background: transparent;
    color: var(--ui-text-main);
    border-radius: 9px;
    padding: 7px 8px;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 8px;
  }

  .support-side__participants-add-item:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .support-side__participants-add-item-action {
    font-size: 11px;
    line-height: 1.2;
    color: var(--ui-text-secondary);
    white-space: nowrap;
  }

  .support-side__participants-add-empty {
    font-size: 12px;
    line-height: 1.3;
    color: var(--ui-text-secondary);
    text-align: center;
    padding: 8px 4px;
  }

  .support-side__participants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(340px, 44vh);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .support-side__participants-list::-webkit-scrollbar {
    display: none;
  }

  .support-side__participant-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
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

  .support-side__participant-avatar--sm {
    width: 28px;
    height: 28px;
    font-size: 11px;
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

  .support-side__library-content {
    margin-top: 16px;
    flex: 1;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .support-side__library-content::-webkit-scrollbar {
    display: none;
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
    cursor: pointer;
    padding: 0;
    text-align: left;
    color: inherit;
  }

  .support-side__media-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    flex: 1;
  }

  .support-side__media-preview-wrap {
    position: relative;
    display: flex;
    flex: 1;
  }

  .support-side__media-kind-badge {
    position: absolute;
    right: 6px;
    top: 6px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    pointer-events: none;
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
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
