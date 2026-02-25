<template>
  <!-- РЕЖИМ БЛОЧНОГО КОМПОНЕНТА (asBlock === true) -->
  <div
    v-if="asBlockMode"
    class="h-full min-h-0 w-full max-w-full">
    <!-- нет Teleport, нет fixed, нет draggable, и ВАЖНО: мы НЕ навешиваем attrs сюда -->
    <div
      class="support-chat flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-[10px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] shadow-none">
      <div
        class="drag-handle relative flex select-none items-center justify-between border-b border-[var(--color-stroke-ui-light)] px-4 py-3"
        @touchstart="handleHeaderTouchStart"
        @touchmove="handleHeaderTouchMove"
        @touchend="handleHeaderTouchEnd"
        @touchcancel="handleHeaderTouchEnd">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-[var(--ui-text-main)]">Support Chat</h3>
          <div class="flex items-center gap-2 text-sm text-[var(--ui-text-secondary)]">
            <span
              class="inline-flex h-2.5 w-2.5 rounded-full"
              :class="isCounterpartyOnline ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'" />
            <span>{{ isCounterpartyOnline ? "Online" : "Offline" }}</span>

            <button
              v-if="showMobileControls"
              type="button"
              class="chat-mobile-toggle ml-3"
              :class="{ 'is-expanded': props.mobilePanelExpanded }"
              aria-label="Toggle details"
              @click="emit('mobile-toggle-panel')">
              <svg
                viewBox="0 0 24 24"
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <button
          v-if="showMobileControls"
          type="button"
          class="chat-mobile-close"
          aria-label="Close chat"
          @click="emit('mobile-close-chat')">
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </button>

        <div
          v-else
          class="h-9 w-9"></div>
      </div>

      <div
        v-if="booting"
        class="absolute z-10 flex items-center justify-center backdrop-blur-sm p-4"
        style="left: 1px; right: 1px; top: 61px; bottom: 81px">
        <UiIconSpinnerDefault class="!text-[var(--ui-text-main)]" />
      </div>

      <div
        ref="listRef"
        class="messages no-scrollbar flex-1 overflow-y-auto px-4 py-5 space-y-6"
        :style="{ visibility: booting ? 'hidden' : 'visible' }"
        @scroll.passive="onScroll"
        @touchstart="handleMessagesTouchStart"
        @touchmove="handleMessagesTouchMove"
        @touchend="handleMessagesTouchEnd"
        @touchcancel="handleMessagesTouchEnd">
        <template
          v-for="item in renderItems"
          :key="item.key">
          <div
            v-if="item.kind === 'sep'"
            class="flex items-center gap-3 text-[var(--ui-text-secondary)] select-none">
            <span class="h-px flex-1 bg-[var(--color-stroke-ui-light)]"></span>
            <span class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]"> — {{ item.label }} — </span>
            <span class="h-px flex-1 bg-[var(--color-stroke-ui-light)]"></span>
          </div>

          <template v-else>
            <div
              v-if="!isMe(item.msg)"
              class="flex items-end gap-3"
              :data-mid="item.msg.id">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary-main)] text-sm font-semibold text-[var(--ui-text-main)]">
                S
              </div>
              <div
                class="max-w-[80%] rounded-[10px] bg-[var(--ui-background-card)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                <div class="mt-1 text-[12px] text-[var(--ui-text-secondary)]">
                  {{ formatDateTime(item.msg.createdAt) }}
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex items-end justify-end gap-3"
              :data-mid="item.msg.id">
              <div
                class="max-w-[82%] rounded-[10px] bg-[var(--ui-primary-main)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                <div class="mt-1 text-right text-[12px] text-[var(--ui-text-secondary)]">
                  {{ formatDateTime(item.msg.createdAt) }}
                </div>
              </div>
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-primary-accent)] text-sm font-semibold text-[var(--ui-text-main)]">
                <img
                  v-if="myAvatarUrl"
                  :src="myAvatarUrl"
                  alt="My avatar"
                  class="h-full w-full object-cover" />
                <span v-else>{{ myAvatarFallback }}</span>
              </div>
            </div>
          </template>
        </template>

        <div
          v-if="!messages.length && !booting"
          class="text-center text-[var(--ui-text-secondary)]">
          No messages yet
        </div>
      </div>

      <div
        class="chat-input-wrap border-t border-[var(--color-stroke-ui-light)] p-3"
        @touchstart="handleInputAreaTouchStart"
        @touchmove="handleInputAreaTouchMove"
        @touchend="handleInputAreaTouchEnd"
        @touchcancel="handleInputAreaTouchEnd">
        <div
          class="flex items-center gap-2 rounded-2xl bg-[var(--ui-background-panel)] p-2 ring-1 ring-[var(--color-stroke-ui-light)]">
          <input
            v-if="mobileTextInputMode"
            ref="inputRef"
            v-model="draft"
            type="text"
            @keydown.enter.prevent="send"
            class="no-drag max-h-28 flex-1 bg-transparent py-2 text-[15px] text-[var(--ui-text-main)] placeholder:text-[var(--ui-text-secondary)] outline-none"
            placeholder="Write your message" />
          <textarea
            v-else
            ref="inputRef"
            v-model="draft"
            rows="1"
            @keydown.enter.prevent="send"
            @keydown.shift.enter.stop
            class="no-drag max-h-28 flex-1 resize-none bg-transparent py-2 text-[15px] text-[var(--ui-text-main)] placeholder:text-[var(--ui-text-secondary)] outline-none"
            placeholder="Write your message" />
          <button
            :disabled="!canSend"
            @pointerdown="handleSendPointerDown"
            @click="handleSendClick"
            class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-primary-main)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="currentColor">
              <path d="m2.01 21 20-9L2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- РЕЖИМ ПЛАВАЮЧОГО ВІКНА (asBlock === false) -->
  <Teleport
    v-else
    to="body">
    <!-- ВАЖНО: именно здесь мы навешиваем attrs от родителя (сюда попадёт fixed, bottom-4 и т.д.) -->
    <div
      v-bind="attrs"
      class="pointer-events-none">
      <div class="relative h-full w-full">
        <VueDraggableResizable
          v-model:x="pos.left"
          v-model:y="pos.top"
          v-model:w="pos.width"
          v-model:h="pos.height"
          :parent="true"
          :draggable="true"
          :resizable="true"
          :handles="['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']"
          :drag-handle="dragHandle"
          drag-cancel=".no-drag, textarea, input, button"
          :min-width="minW"
          :min-height="minH"
          :z="10000"
          class="vdr-wrapper chat-frame pointer-events-auto"
          @dragstop="onDragStop"
          @resizestop="onResizeStop">
          <div
            class="support-chat flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--ui-primary-main)] bg-[var(--ui-background)] shadow-[0_8px_40px_var(--color-stroke-ui-dark)]">
            <div
              class="drag-handle relative flex select-none items-center justify-between border-b border-[var(--color-stroke-ui-light)] px-4 py-3">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-[var(--ui-text-main)]">Support Chat</h3>
                <div class="flex items-center gap-2 text-sm text-[var(--ui-text-secondary)]">
                  <span
                    class="inline-flex h-2.5 w-2.5 rounded-full"
                    :class="
                      isCounterpartyOnline ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'
                    " />
                  <span>{{ isCounterpartyOnline ? "Online" : "Offline" }}</span>
                </div>
              </div>
              <button
                @click="emit('close')"
                class="no-drag rounded-lg p-2 text-[var(--ui-text-secondary)] hover:bg-[var(--color-stroke-ui-dark)] hover:text-[var(--ui-text-main)]"
                title="Close">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="h-5 w-5"
                  fill="currentColor">
                  <path
                    d="M18.3 5.71 12 12.01l-6.3-6.3-1.4 1.41 6.29 6.29-6.3 6.3 1.41 1.4 6.3-6.29 6.29 6.3 1.41-1.41-6.3-6.3 6.3-6.29z" />
                </svg>
              </button>
            </div>

            <div
              v-if="booting"
              class="absolute z-10 flex items-center justify-center backdrop-blur-sm p-4"
              style="left: 1px; right: 1px; top: 61px; bottom: 81px">
              <UiIconSpinnerDefault class="!text-[var(--ui-text-main)]" />
            </div>

            <div
              ref="listRef"
              class="messages no-scrollbar flex-1 overflow-y-auto px-4 py-5 space-y-6"
              :style="{ overflowAnchor: 'none', visibility: booting ? 'hidden' : 'visible' }"
              @scroll.passive="onScroll"
              @touchstart="handleMessagesTouchStart"
              @touchmove="handleMessagesTouchMove"
              @touchend="handleMessagesTouchEnd"
              @touchcancel="handleMessagesTouchEnd">
              <template
                v-for="item in renderItems"
                :key="item.key">
                <div
                  v-if="item.kind === 'sep'"
                  class="flex items-center gap-3 text-[var(--ui-text-secondary)] select-none">
                  <span class="h-px flex-1 bg-[var(--color-stroke-ui-light)]"></span>
                  <span class="text-xs uppercase tracking-wider text-[var(--ui-text-secondary)]"
                    >— {{ item.label }} —</span
                  >
                  <span class="h-px flex-1 bg-[var(--color-stroke-ui-light)]"></span>
                </div>

                <template v-else>
                  <div
                    v-if="!isMe(item.msg)"
                    class="flex items-end gap-3"
                    :data-mid="item.msg.id">
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary-main)] text-sm font-semibold text-[var(--ui-text-main)]">
                      S
                    </div>
                    <div
                      class="max-w-[80%] rounded-[10px] bg-[var(--ui-background-card)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                      <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                      <div class="mt-1 text-[12px] text-[var(--ui-text-secondary)]">
                        {{ formatDateTime(item.msg.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="flex items-end justify-end gap-3"
                    :data-mid="item.msg.id">
                    <div
                      class="max-w-[82%] rounded-[10px] bg-[var(--ui-primary-main)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                      <p class="whitespace-pre-wrap break-words">{{ item.msg.body }}</p>
                      <div class="mt-1 text-right text-[12px] text-[var(--ui-text-secondary)]">
                        {{ formatDateTime(item.msg.createdAt) }}
                      </div>
                    </div>
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-primary-accent)] text-sm font-semibold text-[var(--ui-text-main)]">
                      <img
                        v-if="myAvatarUrl"
                        :src="myAvatarUrl"
                        alt="My avatar"
                        class="h-full w-full object-cover" />
                      <span v-else>{{ myAvatarFallback }}</span>
                    </div>
                  </div>
                </template>
              </template>

              <div
                v-if="!messages.length && !booting"
                class="text-center text-[var(--ui-text-secondary)]">
                No messages yet
              </div>
            </div>

            <div
              class="chat-input-wrap border-t border-[var(--color-stroke-ui-light)] p-3"
              @touchstart="handleInputAreaTouchStart"
              @touchmove="handleInputAreaTouchMove"
              @touchend="handleInputAreaTouchEnd"
              @touchcancel="handleInputAreaTouchEnd">
              <div
                class="flex items-center gap-2 rounded-2xl bg-[var(--ui-background-panel)] p-2 ring-1 ring-[var(--color-stroke-ui-light)]">
                <input
                  v-if="mobileTextInputMode"
                  ref="inputRef"
                  v-model="draft"
                  type="text"
                  @keydown.enter.prevent="send"
                  class="no-drag max-h-28 flex-1 bg-transparent py-2 text-[15px] text-[var(--ui-text-main)] placeholder:text-[var(--ui-text-secondary)] outline-none"
                  placeholder="Write your message" />
                <textarea
                  v-else
                  ref="inputRef"
                  v-model="draft"
                  rows="1"
                  @keydown.enter.prevent="send"
                  @keydown.shift.enter.stop
                  class="no-drag max-h-28 flex-1 resize-none bg-transparent py-2 text-[15px] text-[var(--ui-text-main)] placeholder:text-[var(--ui-text-secondary)] outline-none"
                  placeholder="Write your message" />
                <button
                  :disabled="!canSend"
                  @pointerdown="handleSendPointerDown"
                  @click="handleSendClick"
                  class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-primary-main)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Send">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="currentColor">
                    <path d="m2.01 21 20-9L2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </VueDraggableResizable>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, withDefaults, onMounted, onBeforeUnmount, nextTick, reactive, watch, useAttrs } from "vue";
  import { useNuxtApp } from "nuxt/app";
  import useAppCore from "~/composables/useAppCore";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import VueDraggableResizable from "vue-draggable-resizable";
  import "vue-draggable-resizable/style.css";

  // ГОВОРИМ VUE не лезь со своими атрибутами в корень за нас
  defineOptions({ inheritAttrs: false });

  const attrs = useAttrs();

  type ChatMessage = {
    id: string;
    userId: string;
    body: string;
    createdAt: number;
  };
  type ApiMsg = {
    id: string;
    ticket_id: string;
    user_id: any;
    type: string;
    body: string | null;
    meta: any;
    created_at: string;
  };
  type RenderSep = { kind: "sep"; key: string; label: "today" | "yesterday" };
  type RenderMsg = { kind: "msg"; key: string; msg: ChatMessage };
  type RenderItem = RenderSep | RenderMsg;
  type PresenceUser = { id: number; name: string; role?: string };
  type ChatCurrentUser = {
    id: number | string | null;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    role?: string;
  };

  const props = withDefaults(
    defineProps<{
      asBlock?: boolean;
      ticketId: string;
      currentUser: ChatCurrentUser;
      adminChat?: boolean;
      mobileControls?: boolean;
      mobilePanelExpanded?: boolean;
    }>(),
    {
      asBlock: false,
      adminChat: false,
      mobileControls: false,
      mobilePanelExpanded: false,
    }
  );
  const emit = defineEmits<{
    (e: "close"): void;
    (e: "mobile-toggle-panel"): void;
    (e: "mobile-close-chat"): void;
    (e: "mobile-header-swipe", direction: "up" | "down"): void;
    (e: "mobile-input-swipe-up"): void;
  }>();

  const mounted = ref(false);
  const minW = 320,
    minH = 420,
    margin = 16;
  const pos = reactive({ top: 0, left: 0, width: 380, height: 540 });
  const dragHandle = ref(".drag-handle");

  // режим компонента
  const asBlockMode = computed(() => props.asBlock === true);
  const showMobileControls = computed(() => props.mobileControls === true);
  const mobileTextInputMode = ref(false);
  const HEADER_SWIPE_THRESHOLD = 42;
  const MESSAGES_SWIPE_DOWN_THRESHOLD = 56;
  const MESSAGES_HORIZONTAL_DRIFT_LIMIT = 48;
  const INPUT_SWIPE_UP_THRESHOLD = 42;
  const headerTouchStartY = ref<number | null>(null);
  const headerTouchDeltaY = ref(0);
  const messagesTouchStartY = ref<number | null>(null);
  const messagesTouchStartX = ref<number | null>(null);
  const messagesTouchDeltaY = ref(0);
  const messagesTouchDeltaX = ref(0);
  const messagesSwipeDismissInProgress = ref(false);
  const inputTouchStartY = ref<number | null>(null);
  const inputTouchStartX = ref<number | null>(null);
  const inputTouchDeltaY = ref(0);
  const inputTouchDeltaX = ref(0);

  const handleHeaderTouchStart = (event: TouchEvent) => {
    if (!showMobileControls.value) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    headerTouchStartY.value = touch.clientY;
    headerTouchDeltaY.value = 0;
  };

  const handleHeaderTouchMove = (event: TouchEvent) => {
    if (!showMobileControls.value || headerTouchStartY.value === null) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    headerTouchDeltaY.value = touch.clientY - headerTouchStartY.value;
    if (Math.abs(headerTouchDeltaY.value) > 8) {
      event.preventDefault();
    }
  };

  const handleHeaderTouchEnd = () => {
    if (!showMobileControls.value || headerTouchStartY.value === null) return;

    if (headerTouchDeltaY.value >= HEADER_SWIPE_THRESHOLD) {
      emit("mobile-header-swipe", "down");
    } else if (headerTouchDeltaY.value <= -HEADER_SWIPE_THRESHOLD) {
      emit("mobile-header-swipe", "up");
    }

    headerTouchStartY.value = null;
    headerTouchDeltaY.value = 0;
  };

  const isMobileChatInteraction = () => {
    if (typeof window === "undefined") return false;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    return coarsePointer || window.innerWidth < 768;
  };

  const syncMobileTextInputMode = () => {
    mobileTextInputMode.value = isMobileChatInteraction();
  };

  const isKeyboardVisible = () => {
    if (typeof window === "undefined") return false;

    const active = document.activeElement as HTMLElement | null;
    const activeTag = active?.tagName;
    const focusedEditable = activeTag === "TEXTAREA" || activeTag === "INPUT" || !!active?.isContentEditable;

    const visualViewport = window.visualViewport;
    const viewportKeyboardGap =
      visualViewport && typeof visualViewport.height === "number" ? window.innerHeight - visualViewport.height : 0;
    const keyboardFromViewport = viewportKeyboardGap > 120;

    return focusedEditable || keyboardFromViewport;
  };

  const dismissKeyboard = () => {
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  };

  const resetMessagesTouch = () => {
    messagesTouchStartY.value = null;
    messagesTouchStartX.value = null;
    messagesTouchDeltaY.value = 0;
    messagesTouchDeltaX.value = 0;
    messagesSwipeDismissInProgress.value = false;
  };

  const resetInputTouch = () => {
    inputTouchStartY.value = null;
    inputTouchStartX.value = null;
    inputTouchDeltaY.value = 0;
    inputTouchDeltaX.value = 0;
  };

  const handleMessagesTouchStart = (event: TouchEvent) => {
    if (!isMobileChatInteraction()) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    messagesTouchStartY.value = touch.clientY;
    messagesTouchStartX.value = touch.clientX;
    messagesTouchDeltaY.value = 0;
    messagesTouchDeltaX.value = 0;
  };

  const handleMessagesTouchMove = (event: TouchEvent) => {
    if (!isMobileChatInteraction()) return;
    if (messagesTouchStartY.value === null || messagesTouchStartX.value === null) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    messagesTouchDeltaY.value = touch.clientY - messagesTouchStartY.value;
    messagesTouchDeltaX.value = touch.clientX - messagesTouchStartX.value;

    const verticalSwipe = Math.abs(messagesTouchDeltaY.value) > Math.abs(messagesTouchDeltaX.value);
    const smallHorizontalDrift = Math.abs(messagesTouchDeltaX.value) <= MESSAGES_HORIZONTAL_DRIFT_LIMIT;
    const swipeDown = messagesTouchDeltaY.value > 0;

    // While keyboard is open, capture downward swipe and dismiss keyboard
    // instead of letting chat content shift under the keyboard.
    if (verticalSwipe && smallHorizontalDrift && swipeDown && isKeyboardVisible()) {
      event.preventDefault();
      if (messagesTouchDeltaY.value >= MESSAGES_SWIPE_DOWN_THRESHOLD && !messagesSwipeDismissInProgress.value) {
        messagesSwipeDismissInProgress.value = true;
        dismissKeyboard();
      }
    }
  };

  const handleMessagesTouchEnd = () => {
    if (!isMobileChatInteraction()) {
      resetMessagesTouch();
      return;
    }
    if (messagesTouchStartY.value === null || messagesTouchStartX.value === null) {
      resetMessagesTouch();
      return;
    }

    if (messagesSwipeDismissInProgress.value) {
      resetMessagesTouch();
      return;
    }

    const verticalSwipe = Math.abs(messagesTouchDeltaY.value) > Math.abs(messagesTouchDeltaX.value);
    const smallHorizontalDrift = Math.abs(messagesTouchDeltaX.value) <= MESSAGES_HORIZONTAL_DRIFT_LIMIT;
    const swipeDown = messagesTouchDeltaY.value >= MESSAGES_SWIPE_DOWN_THRESHOLD;

    if (verticalSwipe && smallHorizontalDrift && swipeDown && isKeyboardVisible()) {
      dismissKeyboard();
    }

    resetMessagesTouch();
  };

  const handleInputAreaTouchStart = (event: TouchEvent) => {
    if (!isMobileChatInteraction()) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    inputTouchStartY.value = touch.clientY;
    inputTouchStartX.value = touch.clientX;
    inputTouchDeltaY.value = 0;
    inputTouchDeltaX.value = 0;
  };

  const handleInputAreaTouchMove = (event: TouchEvent) => {
    if (!isMobileChatInteraction()) return;
    if (inputTouchStartY.value === null || inputTouchStartX.value === null) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    inputTouchDeltaY.value = touch.clientY - inputTouchStartY.value;
    inputTouchDeltaX.value = touch.clientX - inputTouchStartX.value;

    const verticalSwipe = Math.abs(inputTouchDeltaY.value) > Math.abs(inputTouchDeltaX.value);
    const swipeUp = inputTouchDeltaY.value < 0;
    if (verticalSwipe && swipeUp) {
      event.preventDefault();
    }
  };

  const handleInputAreaTouchEnd = () => {
    if (!isMobileChatInteraction()) {
      resetInputTouch();
      return;
    }
    if (inputTouchStartY.value === null || inputTouchStartX.value === null) {
      resetInputTouch();
      return;
    }

    const verticalSwipe = Math.abs(inputTouchDeltaY.value) > Math.abs(inputTouchDeltaX.value);
    const smallHorizontalDrift = Math.abs(inputTouchDeltaX.value) <= MESSAGES_HORIZONTAL_DRIFT_LIMIT;
    const swipeUp = inputTouchDeltaY.value <= -INPUT_SWIPE_UP_THRESHOLD;

    if (verticalSwipe && smallHorizontalDrift && swipeUp) {
      emit("mobile-input-swipe-up");
    }

    resetInputTouch();
  };

  function clampToViewport() {
    const vw = window.innerWidth,
      vh = window.innerHeight;
    pos.width = Math.max(minW, Math.min(pos.width, vw - 2 * margin));
    pos.height = Math.max(minH, Math.min(pos.height, vh - 2 * margin));
    pos.left = Math.max(margin, Math.min(pos.left, vw - pos.width - margin));
    pos.top = Math.max(margin, Math.min(pos.top, vh - pos.height - margin));
  }
  function initPosition() {
    const isMobile = window.innerWidth < 768;
    pos.width = isMobile ? Math.max(minW, window.innerWidth - margin * 2) : 380;
    pos.height = isMobile ? Math.max(minH, Math.round(window.innerHeight * 0.7)) : 540;
    pos.left = window.innerWidth - pos.width - margin;
    pos.top = window.innerHeight - pos.height - margin;
    clampToViewport();
  }
  function onViewportResize() {
    if (asBlockMode.value) return;
    clampToViewport();
  }
  function onDragStop(l: number, t: number) {
    if (asBlockMode.value) return;
    pos.left = l;
    pos.top = t;
  }
  function onResizeStop(l: number, t: number, w: number, h: number) {
    if (asBlockMode.value) return;
    pos.left = l;
    pos.top = t;
    pos.width = w;
    pos.height = h;
  }

  const listRef = ref<HTMLElement | null>(null);
  const inputRef = ref<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const booting = ref(true);

  const PAGE_SIZE = 6;
  let nextPage = 2;
  const hasMore = ref(true);
  const draft = ref("");
  const messages = reactive<ChatMessage[]>([]);

  const userIsNearBottom = ref(true);
  let suppressScrollEvents = false;
  let lastUserScrollAt = 0;
  const STICKY_EPS = 16;
  const SCROLL_IDLE_MS = 200;

  const normalizeUserId = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };
  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
  const firstUpper = (value: string): string => value.charAt(0).toUpperCase();
  const currentUserId = computed(() => normalizeUserId(props.currentUser.id));
  const myAvatarUrl = computed(() => normalizeText(props.currentUser.photoUrl));
  const myAvatarFallback = computed(() => {
    const directFirstName = normalizeText(props.currentUser.firstName);
    const directLastName = normalizeText(props.currentUser.lastName);

    if (directFirstName && directLastName) {
      return `${firstUpper(directFirstName)}${firstUpper(directLastName)}`;
    }

    const fromName = normalizeText(props.currentUser.name).split(/\s+/).filter(Boolean);
    if (fromName.length >= 2) {
      return `${firstUpper(fromName[0])}${firstUpper(fromName[1])}`;
    }

    const emailValue = normalizeText(props.currentUser.email);
    if (emailValue) {
      const localPart = emailValue.split("@")[0] || emailValue;
      const normalizedEmail = localPart.replace(/[^a-zA-Z0-9]/g, "");
      if (normalizedEmail.length >= 2) return normalizedEmail.slice(0, 2).toUpperCase();
      if (normalizedEmail.length === 1) return `${normalizedEmail.toUpperCase()}${normalizedEmail.toUpperCase()}`;
    }

    if (directFirstName) {
      const two = directFirstName.slice(0, 2).toUpperCase();
      return two.length === 2 ? two : `${two}${two}`.slice(0, 2);
    }

    return "ME";
  });
  const isMe = (m: ChatMessage) => m.userId !== "" && m.userId === currentUserId.value;
  const canSend = computed(() => draft.value.trim().length > 0);

  const preserveInputFocusOnMobile = () => {
    if (!isMobileChatInteraction()) return;
    const field = inputRef.value;
    if (!field) return;

    requestAnimationFrame(() => {
      field.focus({ preventScroll: true });
      if (typeof field.setSelectionRange === "function") {
        const end = draft.value.length;
        field.setSelectionRange(end, end);
      }
    });
  };

  const handleSendPointerDown = (event: PointerEvent) => {
    if (!isMobileChatInteraction()) return;
    if (!canSend.value) return;
    event.preventDefault();
    void send();
  };

  const handleSendClick = (event: MouseEvent) => {
    if (isMobileChatInteraction()) {
      event.preventDefault();
      return;
    }
    void send();
  };

  function pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
  function formatDateTime(ts: number) {
    const d = new Date(ts);
    const YYYY = d.getFullYear(),
      MM = pad(d.getMonth() + 1),
      DD = pad(d.getDate());
    const hh = pad(d.getHours()),
      mm = pad(d.getMinutes()),
      ss = pad(d.getSeconds());
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }
  function parseLocalMs(input: string | number | Date): number {
    if (typeof input === "number") return input;
    if (input instanceof Date) return input.getTime();
    const s = String(input).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
    if (m) {
      const [, Y, Mo, D, h, mi, se] = m.map(Number) as unknown as number[];
      return new Date(Y, Mo - 1, D, h, mi, se, 0).getTime();
    }
    const t = Date.parse(s);
    return Number.isNaN(t) ? Date.now() : t;
  }
  const localDayKey = (ts: number) => {
    const d = new Date(ts);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  };
  const todayLocalKey = computed(() => localDayKey(Date.now()));
  const yesterdayLocalKey = computed(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return localDayKey(+y);
  });

  const renderItems = computed<RenderItem[]>(() => {
    const out: RenderItem[] = [];
    const seen = new Set<number>();
    for (const m of messages) {
      const key = localDayKey(m.createdAt);
      if (!seen.has(key)) {
        if (key === todayLocalKey.value)
          out.push({
            kind: "sep",
            key: `sep-${key}-today`,
            label: "today",
          });
        else if (key === yesterdayLocalKey.value)
          out.push({
            kind: "sep",
            key: `sep-${key}-yesterday`,
            label: "yesterday",
          });
        seen.add(key);
      }
      out.push({ kind: "msg", key: m.id, msg: m });
    }
    return out;
  });

  function firstVisibleEl(el: HTMLElement): HTMLElement | null {
    const cr = el.getBoundingClientRect();
    for (const c of Array.from(el.querySelectorAll<HTMLElement>("[data-mid]"))) {
      const r = c.getBoundingClientRect();
      if (r.bottom > cr.top && r.top < cr.bottom) return c;
    }
    return null;
  }
  async function keepScrollDuring(mut: () => void | Promise<void>) {
    const el = listRef.value!;
    suppressScrollEvents = true;
    const anchor = firstVisibleEl(el);
    const beforeTop = anchor ? anchor.getBoundingClientRect().top : 0;
    await Promise.resolve(mut());
    await nextTick();
    await new Promise(requestAnimationFrame);
    if (anchor) {
      const afterTop = anchor.getBoundingClientRect().top;
      el.scrollTop += afterTop - beforeTop;
    }
    suppressScrollEvents = false;
  }
  function scrollToBottom() {
    const el = listRef.value;
    if (!el) return;
    suppressScrollEvents = true;
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        suppressScrollEvents = false;
      });
    });
  }

  const appCore = useAppCore();
  function mapApi(m: ApiMsg): ChatMessage {
    return {
      id: m.id,
      userId: normalizeUserId(m.user_id),
      body: m.body ?? "",
      createdAt: parseLocalMs(m.created_at),
    };
  }
  function ensureAscOrder() {
    messages.sort((a, b) => a.createdAt - b.createdAt || (a.id > b.id ? 1 : -1));
  }
  async function fetchPageAsAsc(pageNum: number) {
    const params = {
      page: pageNum,
      pageSize: PAGE_SIZE,
      sort: "desc" as const,
    };
    const res = props.adminChat
      ? await appCore.adminModules.tickets.getTicketMessages(props.ticketId, params)
      : await appCore.tickets.getTicketMessages(props.ticketId, params);
    const arr: ApiMsg[] = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
    return arr.map(mapApi).reverse();
  }
  async function loadInitial() {
    booting.value = true;
    const asc = await fetchPageAsAsc(1);
    messages.splice(0, messages.length, ...asc);
    ensureAscOrder();
    await nextTick();
    await new Promise(requestAnimationFrame);
    scrollToBottom();
    userIsNearBottom.value = true;
    booting.value = false;
    hasMore.value = asc.length === PAGE_SIZE;
    nextPage = 2;
  }
  let loadingMore = false;
  async function loadMoreAbove() {
    if (loadingMore || !hasMore.value) return;
    loadingMore = true;
    const asc = await fetchPageAsAsc(nextPage);
    if (!asc.length) {
      hasMore.value = false;
      loadingMore = false;
      return;
    }
    await keepScrollDuring(() => {
      messages.splice(0, 0, ...asc);
      ensureAscOrder();
    });
    hasMore.value = asc.length === PAGE_SIZE;
    nextPage += 1;
    loadingMore = false;
  }
  function onScroll() {
    if (suppressScrollEvents) return;
    const el = listRef.value;
    if (!el) return;
    lastUserScrollAt = performance.now();
    userIsNearBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - STICKY_EPS;
    if (!loadingMore && hasMore.value && el.scrollTop <= 400) loadMoreAbove();
  }

  const { $echo } = useNuxtApp() as unknown as { $echo: any };

  function subscribePrivate() {
    const ch = $echo.private(`chat.${props.ticketId}`);
    ch.listen(".MessageSent", async (e: any) => {
      const el = listRef.value;
      const shouldStick = !!el && userIsNearBottom.value && performance.now() - lastUserScrollAt > SCROLL_IDLE_MS;
      messages.push(
        mapApi({
          id: e.id,
          ticket_id: e.ticket_id,
          user_id: e.user_id,
          type: e.type,
          body: e.body,
          meta: e.meta,
          created_at: e.created_at,
        })
      );
      ensureAscOrder();
      await nextTick();
      await new Promise(requestAnimationFrame);
      if (shouldStick) scrollToBottom();
    });
    return ch;
  }

  let presenceChan: any = null;
  const onlineMap = reactive<Map<number, PresenceUser>>(new Map());

  const isCounterpartyOnline = computed(() => {
    if (onlineMap.size === 0) return false;
    for (const u of Array.from(onlineMap.values())) {
      if (normalizeUserId(u.id) !== currentUserId.value) {
        return true;
      }
    }
    return false;
  });

  function applyPresencePayload(payload: any) {
    onlineMap.clear();
    if (payload && Array.isArray(payload.online_admins)) {
      payload.online_admins.forEach((u: any) => {
        onlineMap.set(Number(u.id), {
          id: Number(u.id),
          name: String(u.name),
          role: "admin",
        });
      });
    }
    if (payload && payload.online_client) {
      const u = payload.online_client;
      onlineMap.set(Number(u.id), {
        id: Number(u.id),
        name: String(u.name),
        role: "client",
      });
    }
  }

  function joinPresence() {
    presenceChan = $echo
      .private(`support.ticket.${props.ticketId}`)
      .listen(".ticket.presence.updated", (payload: any) => {
        applyPresencePayload(payload);
      });
  }
  function leavePresence() {
    try {
      $echo.leave(`support.ticket.${props.ticketId}`);
    } catch {}
    presenceChan = null;
    onlineMap.clear();
  }

  let hb: any = null;
  async function apiOpen(ticketId: string) {
    const data = await appCore.ticketsPresence.ping(ticketId);
    applyPresencePayload(data);
  }
  async function apiClose(ticketId: string) {
    await appCore.ticketsPresence.presence(ticketId);
  }
  async function startPresenceHeartbeat(ticketId: string) {
    await apiOpen(ticketId);
    stopPresenceHeartbeat();
    hb = setInterval(() => {
      apiOpen(ticketId).catch(() => {});
    }, 15000);
  }
  function stopPresenceHeartbeat() {
    if (hb) {
      clearInterval(hb);
      hb = null;
    }
  }

  let privateChan: any = null;
  let resizeListenerAttached = false;
  let mobileModeResizeListenerAttached = false;

  onMounted(async () => {
    mounted.value = true;
    const prefersTouch = window.matchMedia?.("(pointer: coarse)").matches;
    dragHandle.value = prefersTouch ? ".drag-handle" : ".support-chat";
    syncMobileTextInputMode();
    window.addEventListener("resize", syncMobileTextInputMode, { passive: true });
    mobileModeResizeListenerAttached = true;

    // позиціонування тільки для плавающего окна
    if (!asBlockMode.value) {
      initPosition();
    }

    await loadInitial();

    // resize listener тоже только для плавающего окна
    if (!asBlockMode.value) {
      window.addEventListener("resize", onViewportResize);
      resizeListenerAttached = true;
    }

    await apiOpen(props.ticketId);
    joinPresence();
    privateChan = subscribePrivate();
    startPresenceHeartbeat(props.ticketId);
  });

  onBeforeUnmount(() => {
    try {
      if (privateChan) $echo.leave(`chat.${props.ticketId}`);
    } catch {}
    leavePresence();
    stopPresenceHeartbeat();
    apiClose(props.ticketId).catch(() => {});

    if (resizeListenerAttached) {
      window.removeEventListener("resize", onViewportResize);
      resizeListenerAttached = false;
    }
    if (mobileModeResizeListenerAttached) {
      window.removeEventListener("resize", syncMobileTextInputMode);
      mobileModeResizeListenerAttached = false;
    }
  });

  watch(
    () => props.ticketId,
    async (id, oldId) => {
      if (id === oldId) return;
      try {
        if (privateChan) $echo.leave(`chat.${oldId}`);
      } catch {}
      leavePresence();
      await apiOpen(id);
      joinPresence();
      privateChan = subscribePrivate();
      stopPresenceHeartbeat();
      await startPresenceHeartbeat(id);
      booting.value = true;
      messages.splice(0, messages.length);
      nextPage = 2;
      hasMore.value = true;
      await loadInitial();
    }
  );

  async function send() {
    if (!canSend.value) return;
    const shouldKeepKeyboardOpen =
      isMobileChatInteraction() && (document.activeElement === inputRef.value || isKeyboardVisible());
    const body = draft.value.trim();
    draft.value = "";
    const el = listRef.value;
    const shouldStick = !!el && userIsNearBottom.value && performance.now() - lastUserScrollAt > SCROLL_IDLE_MS;

    if (props.adminChat)
      await appCore.adminModules.tickets.storeTicketMessage(props.ticketId, {
        user_id: props.currentUser.id,
        type: "text",
        body,
      });
    else
      await appCore.tickets.storeTicketMessage(props.ticketId, {
        user_id: props.currentUser.id,
        type: "text",
        body,
      });

    await nextTick();
    if (shouldStick) scrollToBottom();
    if (shouldKeepKeyboardOpen) preserveInputFocusOnMobile();
  }
</script>

<style>
  .chat-frame {
    transition: box-shadow 120ms ease;
    border-radius: 16px;
  }
  .support-chat {
    height: 100%;
    min-height: 0;
  }
  .messages {
    min-height: 0;
    flex: 1 1 auto;
  }

  .chat-mobile-toggle {
    height: 30px;
    width: 30px;
    display: inline-flex;
    flex: 0 0 30px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-main);
  }

  .chat-mobile-toggle svg {
    transition: transform 0.2s ease;
  }

  .chat-mobile-toggle.is-expanded svg {
    transform: rotate(180deg);
  }

  .chat-mobile-close {
    margin-left: auto;
    height: 30px;
    width: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-card);
    color: var(--ui-text-main);
  }
  .chat-frame.dragging,
  .chat-frame.resizing {
    box-shadow: 0 12px 48px var(--color-stroke-ui-dark);
  }

  .vdr .handle {
    width: 10px;
    height: 10px;
    border-radius: 4px;
    background: var(--color-stroke-ui-dark);
    outline: 1px solid var(--color-stroke-ui-light);
    box-shadow: 0 0 0 1px var(--color-stroke-ui-dark) inset;
    z-index: 20;
    pointer-events: auto;
  }
  .vdr .handle:hover {
    background: var(--color-stroke-ui-light);
  }
  .vdr .handle.handle-tl {
    transform: translate(-2px, -2px);
    cursor: nwse-resize;
  }
  .vdr .handle.handle-tr {
    transform: translate(2px, -2px);
    cursor: nesw-resize;
  }
  .vdr .handle.handle-bl {
    transform: translate(-2px, 2px);
    cursor: nesw-resize;
  }
  .vdr .handle.handle-br {
    transform: translate(2px, 2px);
    cursor: nwse-resize;
  }
  .vdr .handle.handle-tm,
  .vdr .handle.handle-bm {
    cursor: ns-resize;
  }
  .vdr .handle.handle-ml,
  .vdr .handle.handle-mr {
    cursor: ew-resize;
  }

  .messages {
    overscroll-behavior: contain;
    scroll-behavior: auto;
  }

  @media (max-width: 767px) {
    .chat-input-wrap {
      padding: calc(0.75rem + 10px);
    }
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
