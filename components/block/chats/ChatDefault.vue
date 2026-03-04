<template>
  <!-- РЕЖИМ БЛОЧНОГО КОМПОНЕНТА (asBlock === true) -->
  <div
    v-if="asBlockMode"
    class="support-chat-block flex min-h-0 w-full max-w-full flex-1">
    <!-- нет Teleport, нет fixed, нет draggable, и ВАЖНО: мы НЕ навешиваем attrs сюда -->
    <div
      class="support-chat flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-[10px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] shadow-none">
      <div
        class="drag-handle relative flex select-none items-center justify-between border-b border-[var(--color-stroke-ui-light)] px-4 py-3"
        @touchstart="handleHeaderTouchStart"
        @touchmove="handleHeaderTouchMove"
        @touchend="handleHeaderTouchEnd"
        @touchcancel="handleHeaderTouchEnd">
        <div class="flex items-center gap-3 min-w-0">
          <button
            v-if="showMobileControls"
            type="button"
            class="chat-mobile-back"
            aria-label="Back to tickets"
            @click="emit('mobile-back')">
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <h3 class="text-lg font-semibold text-[var(--ui-text-main)]">Support Chat</h3>
          <div class="flex items-center gap-2 text-sm text-[var(--ui-text-secondary)]">
            <span
              class="inline-flex h-2.5 w-2.5 rounded-full"
              :class="isCounterpartyOnline ? 'bg-[var(--ui-sticker-success)]' : 'bg-[var(--ui-text-secondary)]'" />
            <span>{{ isCounterpartyOnline ? "Online" : "Offline" }}</span>
            <span
              v-if="isCounterpartyTyping"
              class="text-[var(--ui-primary-accent)]">
              typing...
            </span>
          </div>
        </div>

        <button
          v-if="showMobileControls"
          type="button"
          class="chat-mobile-toggle"
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
                class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-primary-main)] text-sm font-semibold text-[var(--ui-text-main)]">
                <img
                  v-if="getMessageAvatarUrl(item.msg)"
                  :src="getMessageAvatarUrl(item.msg)"
                  alt="Author avatar"
                  class="h-full w-full object-cover" />
                <span v-else>{{ getMessageAvatarFallback(item.msg) }}</span>
              </div>
              <div
                class="max-w-[80%] rounded-[10px] bg-[var(--ui-background-card)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                <div
                  v-if="getMessageAttachments(item.msg).length"
                  class="mb-2 space-y-2">
                  <div
                    v-if="getMediaAttachments(item.msg).length"
                    class="grid gap-2"
                    :class="mediaGridClass(getMediaAttachments(item.msg).length)">
                    <button
                      v-for="attachment in getMediaAttachments(item.msg)"
                      :key="attachment.id"
                      type="button"
                      class="overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)]"
                      @click="openMediaViewer(item.msg, attachment.id)">
                      <img
                        v-if="attachment.kind === 'image'"
                        :src="attachment.url"
                        :alt="attachment.name"
                        class="h-32 w-full object-cover" />
                      <video
                        v-else
                        :src="attachment.url"
                        class="h-32 w-full object-cover"
                        muted
                        playsinline
                        preload="metadata"></video>
                    </button>
                  </div>
                  <div
                    v-if="getFileAttachments(item.msg).length"
                    class="space-y-1">
                    <a
                      v-for="attachment in getFileAttachments(item.msg)"
                      :key="attachment.id"
                      :href="attachment.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-1 text-[13px] hover:bg-[var(--ui-background-panel)]">
                      <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                      <span
                        class="truncate"
                        :title="attachment.name">
                        {{ shortFileName(attachment.name) }}
                      </span>
                      <span class="ml-auto shrink-0 text-[11px] text-[var(--ui-text-secondary)]">
                        {{ formatFileSize(attachment.size) }}
                      </span>
                    </a>
                  </div>
                </div>
                <p
                  v-if="item.msg.body"
                  class="whitespace-pre-wrap break-words">
                  {{ item.msg.body }}
                </p>
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
                <div
                  v-if="getMessageAttachments(item.msg).length"
                  class="mb-2 space-y-2">
                  <div
                    v-if="getMediaAttachments(item.msg).length"
                    class="grid gap-2"
                    :class="mediaGridClass(getMediaAttachments(item.msg).length)">
                    <button
                      v-for="attachment in getMediaAttachments(item.msg)"
                      :key="attachment.id"
                      type="button"
                      class="overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)]"
                      @click="openMediaViewer(item.msg, attachment.id)">
                      <img
                        v-if="attachment.kind === 'image'"
                        :src="attachment.url"
                        :alt="attachment.name"
                        class="h-32 w-full object-cover" />
                      <video
                        v-else
                        :src="attachment.url"
                        class="h-32 w-full object-cover"
                        muted
                        playsinline
                        preload="metadata"></video>
                    </button>
                  </div>
                  <div
                    v-if="getFileAttachments(item.msg).length"
                    class="space-y-1">
                    <a
                      v-for="attachment in getFileAttachments(item.msg)"
                      :key="attachment.id"
                      :href="attachment.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-1 text-[13px] hover:bg-[var(--ui-background-panel)]">
                      <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                      <span
                        class="truncate"
                        :title="attachment.name">
                        {{ shortFileName(attachment.name) }}
                      </span>
                      <span class="ml-auto shrink-0 text-[11px] text-[var(--ui-text-secondary)]">
                        {{ formatFileSize(attachment.size) }}
                      </span>
                    </a>
                  </div>
                </div>
                <p
                  v-if="item.msg.body"
                  class="whitespace-pre-wrap break-words">
                  {{ item.msg.body }}
                </p>
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
          v-if="pendingAttachments.length"
          class="mb-2 rounded-xl border border-[var(--color-stroke-ui-light)] p-2">
          <div class="mb-2 flex items-center justify-between text-[12px] text-[var(--ui-text-secondary)]">
            <span>{{ pendingAttachments.length }} files selected</span>
            <span>{{ formatFileSize(pendingAttachmentsTotalSize) }}</span>
            <span>Send as {{ pickerDisplayAs === "media" ? "media" : "file" }}</span>
          </div>
          <div
            v-if="isSending && uploadProgress.active"
            class="mb-2 rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-2">
            <div class="mb-1 flex items-center justify-between text-[11px] text-[var(--ui-text-secondary)]">
              <span>Uploading...</span>
              <span>{{ uploadProgressLabel }}</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-stroke-ui-light)]">
              <div
                class="h-full rounded-full bg-[var(--ui-primary-main)] transition-all duration-200 ease-linear"
                :style="{ width: `${uploadProgressPercent}%` }"></div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="attachment in pendingAttachments"
              :key="attachment.id"
              class="relative w-20 overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)]">
              <img
                v-if="attachment.kind === 'image' && attachment.displayAs === 'media'"
                :src="attachment.previewUrl"
                :alt="attachment.name"
                class="h-16 w-full object-cover" />
              <video
                v-else-if="attachment.kind === 'video' && attachment.displayAs === 'media'"
                :src="attachment.previewUrl"
                class="h-16 w-full object-cover"
                muted
                playsinline
                preload="metadata"></video>
              <div
                v-else
                class="flex h-16 w-full flex-col items-center justify-center bg-[var(--ui-background-panel)] px-1 text-[11px] text-[var(--ui-text-secondary)]">
                <UiIconDocuments class="h-5 w-5" />
                <span
                  class="mt-1 max-w-full truncate text-[10px]"
                  :title="attachment.name">
                  {{ shortFileName(attachment.name, 12) }}
                </span>
              </div>
              <div
                v-if="isSending"
                class="absolute inset-0 flex items-center justify-center bg-black/35">
                <UiIconSpinnerDefault class="!h-4 !w-4 !text-white" />
              </div>
              <button
                type="button"
                class="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ui-background-panel)] text-[var(--ui-text-main)]"
                :disabled="isSending"
                @click="removePendingAttachment(attachment.id)">
                ✕
              </button>
            </div>
          </div>
        </div>
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
            type="button"
            class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-background-card)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            title="Add media"
            :disabled="isSending"
            @click="openMediaPicker">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
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
          </button>
          <button
            type="button"
            class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-background-card)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            title="Add file"
            :disabled="isSending"
            @click="openFilePicker">
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path
                d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3.5 3.5 0 014.95 4.95L10.83 17.4a2 2 0 11-2.83-2.83l7.78-7.78" />
            </svg>
          </button>
          <button
            :disabled="!canSend"
            @pointerdown="handleSendPointerDown"
            @click="handleSendClick"
            class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-primary-main)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send">
            <UiIconSpinnerDefault
              v-if="isSending"
              class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
            <svg
              v-else
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
                  <span
                    v-if="isCounterpartyTyping"
                    class="text-[var(--ui-primary-accent)]">
                    typing...
                  </span>
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
                      class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ui-primary-main)] text-sm font-semibold text-[var(--ui-text-main)]">
                      <img
                        v-if="getMessageAvatarUrl(item.msg)"
                        :src="getMessageAvatarUrl(item.msg)"
                        alt="Author avatar"
                        class="h-full w-full object-cover" />
                      <span v-else>{{ getMessageAvatarFallback(item.msg) }}</span>
                    </div>
                    <div
                      class="max-w-[80%] rounded-[10px] bg-[var(--ui-background-card)] p-2 text-[15px] leading-6 text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)]">
                      <div
                        v-if="getMessageAttachments(item.msg).length"
                        class="mb-2 space-y-2">
                        <div
                          v-if="getMediaAttachments(item.msg).length"
                          class="grid gap-2"
                          :class="mediaGridClass(getMediaAttachments(item.msg).length)">
                          <button
                            v-for="attachment in getMediaAttachments(item.msg)"
                            :key="attachment.id"
                            type="button"
                            class="overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)]"
                            @click="openMediaViewer(item.msg, attachment.id)">
                            <img
                              v-if="attachment.kind === 'image'"
                              :src="attachment.url"
                              :alt="attachment.name"
                              class="h-32 w-full object-cover" />
                            <video
                              v-else
                              :src="attachment.url"
                              class="h-32 w-full object-cover"
                              muted
                              playsinline
                              preload="metadata"></video>
                          </button>
                        </div>
                        <div
                          v-if="getFileAttachments(item.msg).length"
                          class="space-y-1">
                          <a
                            v-for="attachment in getFileAttachments(item.msg)"
                            :key="attachment.id"
                            :href="attachment.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-1 text-[13px] hover:bg-[var(--ui-background-panel)]">
                            <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                            <span
                              class="truncate"
                              :title="attachment.name">
                              {{ shortFileName(attachment.name) }}
                            </span>
                            <span class="ml-auto shrink-0 text-[11px] text-[var(--ui-text-secondary)]">
                              {{ formatFileSize(attachment.size) }}
                            </span>
                          </a>
                        </div>
                      </div>
                      <p
                        v-if="item.msg.body"
                        class="whitespace-pre-wrap break-words">
                        {{ item.msg.body }}
                      </p>
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
                      <div
                        v-if="getMessageAttachments(item.msg).length"
                        class="mb-2 space-y-2">
                        <div
                          v-if="getMediaAttachments(item.msg).length"
                          class="grid gap-2"
                          :class="mediaGridClass(getMediaAttachments(item.msg).length)">
                          <button
                            v-for="attachment in getMediaAttachments(item.msg)"
                            :key="attachment.id"
                            type="button"
                            class="overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)]"
                            @click="openMediaViewer(item.msg, attachment.id)">
                            <img
                              v-if="attachment.kind === 'image'"
                              :src="attachment.url"
                              :alt="attachment.name"
                              class="h-32 w-full object-cover" />
                            <video
                              v-else
                              :src="attachment.url"
                              class="h-32 w-full object-cover"
                              muted
                              playsinline
                              preload="metadata"></video>
                          </button>
                        </div>
                        <div
                          v-if="getFileAttachments(item.msg).length"
                          class="space-y-1">
                          <a
                            v-for="attachment in getFileAttachments(item.msg)"
                            :key="attachment.id"
                            :href="attachment.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-2 py-1 text-[13px] hover:bg-[var(--ui-background-panel)]">
                            <UiIconDocuments class="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]" />
                            <span
                              class="truncate"
                              :title="attachment.name">
                              {{ shortFileName(attachment.name) }}
                            </span>
                            <span class="ml-auto shrink-0 text-[11px] text-[var(--ui-text-secondary)]">
                              {{ formatFileSize(attachment.size) }}
                            </span>
                          </a>
                        </div>
                      </div>
                      <p
                        v-if="item.msg.body"
                        class="whitespace-pre-wrap break-words">
                        {{ item.msg.body }}
                      </p>
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
                v-if="pendingAttachments.length"
                class="mb-2 rounded-xl border border-[var(--color-stroke-ui-light)] p-2">
                <div class="mb-2 flex items-center justify-between text-[12px] text-[var(--ui-text-secondary)]">
                  <span>{{ pendingAttachments.length }} files selected</span>
                  <span>{{ formatFileSize(pendingAttachmentsTotalSize) }}</span>
                  <span>Send as {{ pickerDisplayAs === "media" ? "media" : "file" }}</span>
                </div>
                <div
                  v-if="isSending && uploadProgress.active"
                  class="mb-2 rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-2">
                  <div class="mb-1 flex items-center justify-between text-[11px] text-[var(--ui-text-secondary)]">
                    <span>Uploading...</span>
                    <span>{{ uploadProgressLabel }}</span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-stroke-ui-light)]">
                    <div
                      class="h-full rounded-full bg-[var(--ui-primary-main)] transition-all duration-200 ease-linear"
                      :style="{ width: `${uploadProgressPercent}%` }"></div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="attachment in pendingAttachments"
                    :key="attachment.id"
                    class="relative w-20 overflow-hidden rounded-lg border border-[var(--color-stroke-ui-light)]">
                    <img
                      v-if="attachment.kind === 'image' && attachment.displayAs === 'media'"
                      :src="attachment.previewUrl"
                      :alt="attachment.name"
                      class="h-16 w-full object-cover" />
                    <video
                      v-else-if="attachment.kind === 'video' && attachment.displayAs === 'media'"
                      :src="attachment.previewUrl"
                      class="h-16 w-full object-cover"
                      muted
                      playsinline
                      preload="metadata"></video>
                    <div
                      v-else
                      class="flex h-16 w-full flex-col items-center justify-center bg-[var(--ui-background-panel)] px-1 text-[11px] text-[var(--ui-text-secondary)]">
                      <UiIconDocuments class="h-5 w-5" />
                      <span
                        class="mt-1 max-w-full truncate text-[10px]"
                        :title="attachment.name">
                        {{ shortFileName(attachment.name, 12) }}
                      </span>
                    </div>
                    <div
                      v-if="isSending"
                      class="absolute inset-0 flex items-center justify-center bg-black/35">
                      <UiIconSpinnerDefault class="!h-4 !w-4 !text-white" />
                    </div>
                    <button
                      type="button"
                      class="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ui-background-panel)] text-[var(--ui-text-main)]"
                      :disabled="isSending"
                      @click="removePendingAttachment(attachment.id)">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
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
                  type="button"
                  class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-background-card)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Add media"
                  :disabled="isSending"
                  @click="openMediaPicker">
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
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
                </button>
                <button
                  type="button"
                  class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-background-card)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Add file"
                  :disabled="isSending"
                  @click="openFilePicker">
                  <svg
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <path
                      d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l8.49-8.49a3.5 3.5 0 014.95 4.95L10.83 17.4a2 2 0 11-2.83-2.83l7.78-7.78" />
                  </svg>
                </button>
                <button
                  :disabled="!canSend"
                  @pointerdown="handleSendPointerDown"
                  @click="handleSendClick"
                  class="no-drag inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ui-primary-main)] text-[var(--ui-text-main)] ring-1 ring-[var(--color-stroke-ui-light)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Send">
                  <UiIconSpinnerDefault
                    v-if="isSending"
                    class="!h-4 !w-4 !text-[var(--ui-text-main)]" />
                  <svg
                    v-else
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

  <input
    ref="fileInputRef"
    type="file"
    class="hidden"
    :accept="pickerAccept"
    multiple
    @change="handleFileInputChange" />

  <Teleport to="body">
    <div
      v-if="mediaViewer.open && activeMediaAttachment"
      class="fixed inset-0 z-[13000] flex items-center justify-center bg-black/80 p-4"
      @click.self="closeMediaViewer"
      @pointerdown="handleMediaViewerPointerDown"
      @pointerup="handleMediaViewerPointerUp"
      @touchstart.passive="handleMediaViewerTouchStart"
      @touchend="handleMediaViewerTouchEnd">
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        @click="closeMediaViewer">
        ✕
      </button>
      <button
        v-if="mediaViewer.items.length > 1"
        type="button"
        class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        @click="moveMediaViewer(-1)">
        ‹
      </button>
      <div
        class="max-h-[88vh] max-w-[92vw] overflow-hidden rounded-xl border border-white/20 bg-black/50"
        @click.stop>
        <img
          v-if="activeMediaAttachment.kind === 'image'"
          :src="activeMediaAttachment.url"
          :alt="activeMediaAttachment.name"
          class="max-h-[82vh] max-w-[92vw] object-contain" />
        <video
          v-else
          :src="activeMediaAttachment.url"
          class="max-h-[82vh] max-w-[92vw] object-contain"
          controls
          autoplay
          playsinline></video>
        <div class="px-3 py-2 text-sm text-white/90">
          {{ activeMediaAttachment.name }}
        </div>
      </div>
      <button
        v-if="mediaViewer.items.length > 1"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        @click="moveMediaViewer(1)">
        ›
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, withDefaults, onMounted, onBeforeUnmount, nextTick, reactive, watch, useAttrs } from "vue";
  import type { AxiosProgressEvent, AxiosRequestConfig } from "axios";
  import { useNuxtApp } from "nuxt/app";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import VueDraggableResizable from "vue-draggable-resizable";
  import "vue-draggable-resizable/style.css";

  // ГОВОРИМ VUE не лезь со своими атрибутами в корень за нас
  defineOptions({ inheritAttrs: false });

  const attrs = useAttrs();
  const toast = useToast();
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_PRESENCE_UPDATED_EVENT = "support-presence-updated";
  const SUPPORT_ACTIVE_TICKET_CHANGED_EVENT = "support-active-ticket-changed";
  const SUPPORT_MESSAGE_UPDATED_EVENT = "support-message-updated";
  const MAX_CHAT_FILE_SIZE_BYTES = 200 * 1024 * 1024;
  const MAX_PENDING_ATTACHMENTS = 10;
  const UPLOAD_REQUEST_TIMEOUT_MS = 15 * 60 * 1000;
  const VIEWER_SWIPE_THRESHOLD = 52;
  const VIEWER_MAX_VERTICAL_DRIFT = 120;

  type ChatAttachmentDisplay = "media" | "file";
  type ChatAttachmentKind = "image" | "video" | "file";
  type ChatAttachment = {
    id: string;
    kind: ChatAttachmentKind;
    displayAs: ChatAttachmentDisplay;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    path?: string;
    extension?: string;
  };
  type ChatMessageMeta = {
    attachments: ChatAttachment[];
    attachmentsCount: number;
    [key: string]: unknown;
  };
  type PendingAttachment = {
    id: string;
    file: File;
    kind: ChatAttachmentKind;
    displayAs: ChatAttachmentDisplay;
    name: string;
    mimeType: string;
    size: number;
    previewUrl: string;
  };
  type ChatMessage = {
    id: string;
    userId: string;
    body: string;
    type: string;
    meta: ChatMessageMeta | null;
    createdAt: number;
    author?: string;
    authorPhotoUrl?: string;
    authorFirstName?: string;
    authorLastName?: string;
    authorEmail?: string;
    authorInitials?: string;
  };
  type ApiMsg = {
    id: string;
    ticket_id: string;
    user_id: any;
    type: string;
    body: string | null;
    meta: any;
    created_at: string;
    author?: string | null;
    author_photo_url?: string | null;
    author_first_name?: string | null;
    author_last_name?: string | null;
    author_email?: string | null;
    author_initials?: string | null;
  };
  type RenderSep = { kind: "sep"; key: string; label: "today" | "yesterday" };
  type RenderMsg = { kind: "msg"; key: string; msg: ChatMessage };
  type RenderItem = RenderSep | RenderMsg;
  type PresenceUser = { id: string; name: string; role?: string };
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
    (e: "mobile-back"): void;
    (e: "mobile-toggle-panel"): void;
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
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const booting = ref(true);
  const isSending = ref(false);

  const PAGE_SIZE = 6;
  let nextPage = 2;
  const hasMore = ref(true);
  const draft = ref("");
  const messages = reactive<ChatMessage[]>([]);
  const pendingAttachments = ref<PendingAttachment[]>([]);
  const pickerAccept = ref("");
  const pickerDisplayAs = ref<ChatAttachmentDisplay>("media");
  const mediaViewer = reactive<{
    open: boolean;
    items: ChatAttachment[];
    index: number;
  }>({
    open: false,
    items: [],
    index: 0,
  });
  const uploadProgress = reactive({
    active: false,
    loaded: 0,
    total: 0,
    percent: 0,
  });
  const mediaViewerSwipeStart = reactive({
    x: null as number | null,
    y: null as number | null,
  });

  const userIsNearBottom = ref(true);
  let suppressScrollEvents = false;
  let lastUserScrollAt = 0;
  const STICKY_EPS = 16;
  const SCROLL_IDLE_MS = 200;
  const LOCAL_TYPING_IDLE_MS = 1400;
  const LOCAL_TYPING_HEARTBEAT_MS = 1800;
  const REMOTE_TYPING_TTL_MS = 3500;

  const normalizeUserId = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };
  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
  const normalizeOptionalText = (value: unknown): string | undefined => {
    const text = normalizeText(value);
    return text || undefined;
  };
  const toAttachmentKind = (value: unknown, fallbackMimeType = ""): ChatAttachmentKind => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "image" || normalized === "video" || normalized === "file") {
      return normalized;
    }
    if (fallbackMimeType.startsWith("image/")) return "image";
    if (fallbackMimeType.startsWith("video/")) return "video";
    return "file";
  };
  const toDisplayMode = (value: unknown): ChatAttachmentDisplay => {
    return String(value ?? "")
      .trim()
      .toLowerCase() === "file"
      ? "file"
      : "media";
  };
  const toPositiveInt = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.trunc(number) : 0;
  };
  const formatFileSize = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let size = value;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    const precision = unitIndex === 0 ? 0 : size < 10 ? 1 : 0;
    return `${size.toFixed(precision)} ${units[unitIndex]}`;
  };
  const shortFileName = (value: string, maxLength = 22): string => {
    const fileName = normalizeText(value);
    if (!fileName) return "file";
    if (fileName.length <= maxLength) return fileName;

    const dotIndex = fileName.lastIndexOf(".");
    const hasExtension = dotIndex > 0 && dotIndex < fileName.length - 1;
    const extension = hasExtension ? fileName.slice(dotIndex + 1) : "";
    const extensionPart = extension ? `.${extension}` : "";
    const maxBaseLength = Math.max(4, maxLength - extensionPart.length - 1);
    const base = hasExtension ? fileName.slice(0, dotIndex) : fileName;

    return `${base.slice(0, maxBaseLength)}…${extensionPart}`;
  };
  const pendingAttachmentsTotalSize = computed(() => {
    return pendingAttachments.value.reduce((total, attachment) => total + (attachment.size || 0), 0);
  });
  const uploadProgressPercent = computed(() => {
    if (!uploadProgress.active) return 0;
    if (uploadProgress.percent > 0) return uploadProgress.percent;
    if (uploadProgress.total > 0) {
      return Math.round((uploadProgress.loaded / uploadProgress.total) * 100);
    }

    return 0;
  });
  const uploadProgressLabel = computed(() => {
    if (!uploadProgress.active) return "";
    if (uploadProgress.total > 0) {
      return `${uploadProgressPercent.value}% • ${formatFileSize(uploadProgress.loaded)} / ${formatFileSize(uploadProgress.total)}`;
    }

    if (uploadProgress.loaded > 0) {
      return `${formatFileSize(uploadProgress.loaded)} uploaded`;
    }

    return "Uploading...";
  });
  const resetUploadProgress = () => {
    uploadProgress.active = false;
    uploadProgress.loaded = 0;
    uploadProgress.total = 0;
    uploadProgress.percent = 0;
  };
  const updateUploadProgress = (event: AxiosProgressEvent) => {
    uploadProgress.active = true;
    uploadProgress.loaded = Number(event.loaded ?? 0);
    uploadProgress.total = Number(event.total ?? 0);
    uploadProgress.percent = Number.isFinite(event.progress || 0) ? Math.round((event.progress || 0) * 100) : 0;
  };
  const mediaGridClass = (count: number): string => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    return "grid-cols-2";
  };
  const normalizeMessageMeta = (value: unknown): ChatMessageMeta | null => {
    if (!value || typeof value !== "object") return null;
    const metaRecord = value as Record<string, unknown>;
    const rawAttachments = Array.isArray(metaRecord.attachments) ? metaRecord.attachments : [];
    const attachments: ChatAttachment[] = rawAttachments
      .map((rawAttachment, index) => {
        if (!rawAttachment || typeof rawAttachment !== "object") return null;

        const attachmentRecord = rawAttachment as Record<string, unknown>;
        const mimeType = normalizeText(attachmentRecord.mime_type || attachmentRecord.mimeType);
        const url = normalizeText(attachmentRecord.url || attachmentRecord.preview_url || attachmentRecord.path_url);
        const name = normalizeText(attachmentRecord.name || attachmentRecord.filename);
        const id = normalizeText(attachmentRecord.id) || `att-${index}`;
        const kind = toAttachmentKind(attachmentRecord.kind, mimeType);
        const displayAs =
          kind === "file" ? "file" : toDisplayMode(attachmentRecord.display_as ?? attachmentRecord.displayAs);

        return {
          id,
          kind,
          displayAs,
          name: name || `Attachment ${index + 1}`,
          url,
          mimeType,
          size: toPositiveInt(attachmentRecord.size),
          path: normalizeOptionalText(attachmentRecord.path),
          extension: normalizeOptionalText(attachmentRecord.extension),
        } as ChatAttachment;
      })
      .filter((attachment): attachment is ChatAttachment => Boolean(attachment && attachment.url));

    return {
      ...metaRecord,
      attachments,
      attachmentsCount: attachments.length,
    };
  };
  const firstUpper = (value: string): string => value.charAt(0).toUpperCase();
  const buildAvatarFallback = ({
    firstName,
    lastName,
    name,
    email,
    initials,
    fallback,
  }: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    initials?: string | null;
    fallback: string;
  }): string => {
    const normalizedInitials = normalizeText(initials)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase();
    if (normalizedInitials.length === 2) return normalizedInitials;

    const directFirstName = normalizeText(firstName);
    const directLastName = normalizeText(lastName);
    if (directFirstName && directLastName) {
      return `${firstUpper(directFirstName)}${firstUpper(directLastName)}`;
    }

    const fromName = normalizeText(name).split(/\s+/).filter(Boolean);
    if (fromName.length >= 2) {
      return `${firstUpper(fromName[0])}${firstUpper(fromName[1])}`;
    }

    const emailValue = normalizeText(email);
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

    return fallback;
  };

  const currentUserId = computed(() => normalizeUserId(props.currentUser.id));
  const myAvatarUrl = computed(() => normalizeText(props.currentUser.photoUrl));
  const isMe = (m: ChatMessage) => m.userId !== "" && m.userId === currentUserId.value;
  const myAvatarFallback = computed(() => {
    return buildAvatarFallback({
      firstName: props.currentUser.firstName,
      lastName: props.currentUser.lastName,
      name: props.currentUser.name,
      email: props.currentUser.email,
      fallback: "ME",
    });
  });
  const getMessageAvatarUrl = (message: ChatMessage): string => {
    if (isMe(message)) return myAvatarUrl.value;
    return normalizeText(message.authorPhotoUrl);
  };
  const getMessageAvatarFallback = (message: ChatMessage): string => {
    if (isMe(message)) return myAvatarFallback.value;
    return buildAvatarFallback({
      firstName: message.authorFirstName,
      lastName: message.authorLastName,
      name: message.author,
      email: message.authorEmail,
      initials: message.authorInitials,
      fallback: "US",
    });
  };
  const getMessageAttachments = (message: ChatMessage): ChatAttachment[] => {
    return message.meta?.attachments ?? [];
  };
  const getMediaAttachments = (message: ChatMessage): ChatAttachment[] => {
    return getMessageAttachments(message).filter(
      attachment => attachment.displayAs === "media" && (attachment.kind === "image" || attachment.kind === "video")
    );
  };
  const getFileAttachments = (message: ChatMessage): ChatAttachment[] => {
    return getMessageAttachments(message).filter(
      attachment => attachment.displayAs === "file" || (attachment.kind !== "image" && attachment.kind !== "video")
    );
  };
  const canSend = computed(
    () => !isSending.value && (draft.value.trim().length > 0 || pendingAttachments.value.length > 0)
  );
  const remoteTypingUsers = reactive<Set<string>>(new Set());
  const remoteTypingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let localTypingStopTimer: ReturnType<typeof setTimeout> | null = null;
  let localTypingSent = false;
  let localTypingLastPingAt = 0;

  const isCounterpartyTyping = computed(() => {
    if (remoteTypingUsers.size === 0) return false;

    for (const userId of Array.from(remoteTypingUsers.values())) {
      if (userId !== currentUserId.value) {
        return true;
      }
    }

    return false;
  });

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
  const extractRequestErrorMessage = (error: unknown): string => {
    const fallback = "Failed to send message.";
    if (!error || typeof error !== "object") return fallback;

    const errorRecord = error as Record<string, any>;
    const responseData = errorRecord?.response?.data;
    if (responseData && typeof responseData === "object") {
      if (typeof responseData.message === "string" && responseData.message.trim() !== "") {
        return responseData.message.trim();
      }

      if (responseData.errors && typeof responseData.errors === "object") {
        const firstError = Object.values(responseData.errors)
          .flat()
          .find(value => typeof value === "string");
        if (typeof firstError === "string" && firstError.trim() !== "") {
          return firstError.trim();
        }
      }
    }

    if (typeof errorRecord.message === "string" && errorRecord.message.trim() !== "") {
      return errorRecord.message.trim();
    }

    return fallback;
  };

  const revokePendingAttachment = (attachment: PendingAttachment) => {
    if (attachment.previewUrl && attachment.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  };

  const clearPendingAttachments = () => {
    for (const attachment of pendingAttachments.value) {
      revokePendingAttachment(attachment);
    }
    pendingAttachments.value = [];
  };

  const removePendingAttachment = (attachmentId: string) => {
    const attachmentIndex = pendingAttachments.value.findIndex(attachment => attachment.id === attachmentId);
    if (attachmentIndex === -1) return;

    const [attachment] = pendingAttachments.value.splice(attachmentIndex, 1);
    if (attachment) {
      revokePendingAttachment(attachment);
    }
  };

  const openPicker = (displayAs: ChatAttachmentDisplay) => {
    if (isSending.value) return;

    const hasDifferentMode = pendingAttachments.value.some(attachment => attachment.displayAs !== displayAs);
    if (hasDifferentMode) {
      clearPendingAttachments();
    }
    pickerDisplayAs.value = displayAs;
    pickerAccept.value = displayAs === "media" ? "image/*,video/*" : "";
    if (!fileInputRef.value) return;

    fileInputRef.value.value = "";
    fileInputRef.value.click();
  };

  const openMediaPicker = () => {
    openPicker("media");
  };

  const openFilePicker = () => {
    openPicker("file");
  };

  const createPendingAttachment = (file: File): PendingAttachment => {
    const mimeType = normalizeText(file.type) || "application/octet-stream";
    const kind = toAttachmentKind("", mimeType);
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      kind,
      displayAs: kind === "file" ? "file" : pickerDisplayAs.value,
      name: file.name,
      mimeType,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    };
  };

  const handleFileInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement | null;
    if (!input?.files?.length) return;

    const oversizedFileNames: string[] = [];
    const eligibleFiles: File[] = [];
    for (const file of Array.from(input.files)) {
      if (file.size > MAX_CHAT_FILE_SIZE_BYTES) {
        oversizedFileNames.push(file.name);
        continue;
      }

      eligibleFiles.push(file);
    }

    if (oversizedFileNames.length) {
      const example = oversizedFileNames.slice(0, 2).join(", ");
      const extraCount = oversizedFileNames.length - 2;
      const extraLabel = extraCount > 0 ? ` (+${extraCount})` : "";
      toast.error(`File is larger than 200 MB: ${example}${extraLabel}`);
    }

    const availableSlots = Math.max(0, MAX_PENDING_ATTACHMENTS - pendingAttachments.value.length);
    if (availableSlots === 0) {
      toast.warning(`Only ${MAX_PENDING_ATTACHMENTS} files can be attached per message.`);
      input.value = "";
      return;
    }

    const pickedAttachments = eligibleFiles.slice(0, availableSlots).map(createPendingAttachment);
    if (!pickedAttachments.length) {
      input.value = "";
      return;
    }

    if (eligibleFiles.length > availableSlots) {
      toast.warning(`Only ${MAX_PENDING_ATTACHMENTS} files can be attached per message.`);
    }

    pendingAttachments.value = pendingAttachments.value.concat(pickedAttachments);
    input.value = "";
  };

  const closeMediaViewer = () => {
    mediaViewer.open = false;
    mediaViewer.items = [];
    mediaViewer.index = 0;
    resetMediaViewerSwipe();
  };

  const openMediaViewer = (message: ChatMessage, attachmentId: string) => {
    const media = getMediaAttachments(message);
    if (!media.length) return;

    const index = media.findIndex(attachment => attachment.id === attachmentId);
    mediaViewer.open = true;
    mediaViewer.items = media;
    mediaViewer.index = index >= 0 ? index : 0;
  };

  const moveMediaViewer = (direction: -1 | 1) => {
    if (!mediaViewer.items.length) return;

    const length = mediaViewer.items.length;
    mediaViewer.index = (mediaViewer.index + direction + length) % length;
  };

  const activeMediaAttachment = computed(() => {
    return mediaViewer.items[mediaViewer.index] ?? null;
  });
  const resetMediaViewerSwipe = () => {
    mediaViewerSwipeStart.x = null;
    mediaViewerSwipeStart.y = null;
  };
  const completeMediaViewerSwipe = (currentX: number | null, currentY: number | null) => {
    if (mediaViewer.items.length <= 1 || mediaViewerSwipeStart.x === null || mediaViewerSwipeStart.y === null) {
      resetMediaViewerSwipe();
      return;
    }

    if (currentX === null || currentY === null) {
      resetMediaViewerSwipe();
      return;
    }

    const deltaX = currentX - mediaViewerSwipeStart.x;
    const deltaY = currentY - mediaViewerSwipeStart.y;
    if (Math.abs(deltaX) >= VIEWER_SWIPE_THRESHOLD && Math.abs(deltaY) <= VIEWER_MAX_VERTICAL_DRIFT) {
      moveMediaViewer(deltaX > 0 ? -1 : 1);
    }

    resetMediaViewerSwipe();
  };
  const handleMediaViewerPointerDown = (event: PointerEvent) => {
    if (mediaViewer.items.length <= 1) return;
    mediaViewerSwipeStart.x = event.clientX;
    mediaViewerSwipeStart.y = event.clientY;
  };
  const handleMediaViewerPointerUp = (event: PointerEvent) => {
    completeMediaViewerSwipe(event.clientX, event.clientY);
  };
  const handleMediaViewerTouchStart = (event: TouchEvent) => {
    if (mediaViewer.items.length <= 1) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    mediaViewerSwipeStart.x = touch.clientX;
    mediaViewerSwipeStart.y = touch.clientY;
  };
  const handleMediaViewerTouchEnd = (event: TouchEvent) => {
    const touch = event.changedTouches?.[0];
    completeMediaViewerSwipe(touch?.clientX ?? null, touch?.clientY ?? null);
  };
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if (!mediaViewer.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMediaViewer();
      return;
    }

    if (mediaViewer.items.length <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveMediaViewer(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveMediaViewer(1);
    }
  };

  const clearRemoteTypingTimer = (userId: string) => {
    const timer = remoteTypingTimers.get(userId);
    if (!timer) return;

    clearTimeout(timer);
    remoteTypingTimers.delete(userId);
  };

  const clearAllRemoteTyping = () => {
    for (const timer of Array.from(remoteTypingTimers.values())) {
      clearTimeout(timer);
    }
    remoteTypingTimers.clear();
    remoteTypingUsers.clear();
  };

  const applyRemoteTypingState = (userId: unknown, isTyping: boolean) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId || normalizedUserId === currentUserId.value) return;

    clearRemoteTypingTimer(normalizedUserId);

    if (!isTyping) {
      remoteTypingUsers.delete(normalizedUserId);
      return;
    }

    remoteTypingUsers.add(normalizedUserId);
    const timer = setTimeout(() => {
      remoteTypingUsers.delete(normalizedUserId);
      remoteTypingTimers.delete(normalizedUserId);
    }, REMOTE_TYPING_TTL_MS);
    remoteTypingTimers.set(normalizedUserId, timer);
  };

  const clearLocalTypingStopTimer = () => {
    if (!localTypingStopTimer) return;

    clearTimeout(localTypingStopTimer);
    localTypingStopTimer = null;
  };

  const sendTypingState = async (isTyping: boolean) => {
    const payload = { is_typing: isTyping };
    try {
      if (props.adminChat) {
        await appCore.adminModules.tickets.typing(props.ticketId, payload);
      } else {
        await appCore.tickets.typing(props.ticketId, payload);
      }
    } catch {
      // noop
    }
  };

  const scheduleLocalTypingStop = () => {
    clearLocalTypingStopTimer();
    localTypingStopTimer = setTimeout(() => {
      void stopTyping();
    }, LOCAL_TYPING_IDLE_MS);
  };

  const startTyping = async () => {
    const now = Date.now();

    if (!localTypingSent || now - localTypingLastPingAt >= LOCAL_TYPING_HEARTBEAT_MS) {
      localTypingSent = true;
      localTypingLastPingAt = now;
      await sendTypingState(true);
    }

    scheduleLocalTypingStop();
  };

  const stopTyping = async (force = false) => {
    clearLocalTypingStopTimer();

    if (!localTypingSent && !force) return;

    localTypingSent = false;
    localTypingLastPingAt = 0;
    await sendTypingState(false);
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

  const lastReadAckMessageId = ref<string | null>(null);
  let markReadInFlight = false;
  let markReadRafId: number | null = null;
  let markReadDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingMarkReadMessageId: string | null = null;

  const isMessageElementVisible = (containerRect: DOMRect, messageEl: HTMLElement): boolean => {
    const rect = messageEl.getBoundingClientRect();
    return rect.bottom > containerRect.top && rect.top < containerRect.bottom;
  };

  const messageIndexById = computed(() => {
    const index = new Map<string, number>();
    messages.forEach((message, idx) => {
      index.set(message.id, idx);
    });
    return index;
  });

  const messageById = computed(() => {
    const mapped = new Map<string, ChatMessage>();
    messages.forEach(message => {
      mapped.set(message.id, message);
    });
    return mapped;
  });

  const isIncomingMessageId = (messageId: string): boolean => {
    const message = messageById.value.get(messageId);
    if (!message) return false;

    return message.userId !== currentUserId.value;
  };

  const isMessageIdNewerThan = (candidateId: string, baselineId: string | null): boolean => {
    if (!baselineId) return true;
    if (candidateId === baselineId) return false;

    const candidateIndex = messageIndexById.value.get(candidateId);
    const baselineIndex = messageIndexById.value.get(baselineId);

    if (candidateIndex !== undefined && baselineIndex !== undefined) {
      return candidateIndex > baselineIndex;
    }

    return candidateId > baselineId;
  };

  const getLastVisibleIncomingMessageId = (): string | null => {
    const list = listRef.value;
    if (!list) return null;

    const containerRect = list.getBoundingClientRect();
    const nodes = Array.from(list.querySelectorAll<HTMLElement>("[data-mid]"));
    let lastVisibleId: string | null = null;

    for (const node of nodes) {
      if (!isMessageElementVisible(containerRect, node)) continue;
      const mid = node.dataset.mid?.trim();
      if (mid && isIncomingMessageId(mid)) {
        lastVisibleId = mid;
      }
    }

    return lastVisibleId;
  };

  const getLatestIncomingMessageId = (): string | null => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.userId !== currentUserId.value) {
        return message.id;
      }
    }

    return null;
  };

  const appCore = useAppCore();
  const emitSupportMessageUpdated = (message: ChatMessage) => {
    useEventBus.emit(SUPPORT_MESSAGE_UPDATED_EVENT, {
      ticketId: String(props.ticketId),
      message: {
        id: message.id,
        user_id: message.userId,
        type: message.type,
        body: message.body,
        meta: message.meta,
        created_at: new Date(message.createdAt).toISOString(),
      },
    });
  };
  const waitForNextPaint = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  const emitActiveSupportTicket = (ticketId: string | null) => {
    useEventBus.emit(SUPPORT_ACTIVE_TICKET_CHANGED_EVENT, {
      ticketId: ticketId ? String(ticketId).trim() : "",
    });
  };

  const hasMessagesOverflow = () => {
    const el = listRef.value;
    if (!el) return true;
    return el.scrollHeight > el.clientHeight + 1;
  };

  async function ensureScrollableHistoryForBlock() {
    if (!asBlockMode.value) return;

    const MAX_PREFILL_PAGES = 8;
    let attempts = 0;

    while (hasMore.value && !hasMessagesOverflow() && attempts < MAX_PREFILL_PAGES) {
      await loadMoreAbove();
      await nextTick();
      await waitForNextPaint();
      attempts += 1;
    }
  }

  function mapApi(m: ApiMsg): ChatMessage {
    return {
      id: m.id,
      userId: normalizeUserId(m.user_id),
      type: normalizeText(m.type) || "text",
      body: m.body ?? "",
      meta: normalizeMessageMeta(m.meta),
      createdAt: parseLocalMs(m.created_at),
      author: normalizeOptionalText(m.author),
      authorPhotoUrl: normalizeOptionalText(m.author_photo_url),
      authorFirstName: normalizeOptionalText(m.author_first_name),
      authorLastName: normalizeOptionalText(m.author_last_name),
      authorEmail: normalizeOptionalText(m.author_email),
      authorInitials: normalizeOptionalText(m.author_initials),
    };
  }
  function isSameMessage(a: ChatMessage, b: ChatMessage): boolean {
    const aMeta = JSON.stringify(a.meta ?? null);
    const bMeta = JSON.stringify(b.meta ?? null);
    return (
      a.id === b.id &&
      a.userId === b.userId &&
      a.type === b.type &&
      a.body === b.body &&
      aMeta === bMeta &&
      a.createdAt === b.createdAt &&
      a.author === b.author &&
      a.authorPhotoUrl === b.authorPhotoUrl &&
      a.authorFirstName === b.authorFirstName &&
      a.authorLastName === b.authorLastName &&
      a.authorEmail === b.authorEmail &&
      a.authorInitials === b.authorInitials
    );
  }
  function upsertMessage(incoming: ChatMessage): "inserted" | "updated" | "unchanged" {
    const index = messages.findIndex(message => message.id === incoming.id);
    if (index === -1) {
      messages.push(incoming);
      return "inserted";
    }

    const current = messages[index];
    if (isSameMessage(current, incoming)) {
      return "unchanged";
    }

    messages[index] = incoming;
    return "updated";
  }
  async function syncLatestMessagesFromServer() {
    try {
      const latestAsc = await fetchPageAsAsc(1);
      if (!latestAsc.length) return;

      let changed = false;
      for (const message of latestAsc) {
        const state = upsertMessage(message);
        if (state !== "unchanged") changed = true;
      }

      if (!changed) return;

      ensureAscOrder();
      await nextTick();
      await waitForNextPaint();
      if (userIsNearBottom.value) {
        scrollToBottom();
      }
      await markVisibleMessagesAsRead();
    } catch {
      // noop
    }
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
    hasMore.value = asc.length === PAGE_SIZE;
    nextPage = 2;
    await ensureScrollableHistoryForBlock();
    scrollToBottom();
    userIsNearBottom.value = true;
    await waitForNextPaint();
    await markVisibleMessagesAsRead();
    booting.value = false;
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
    scheduleMarkVisibleMessagesAsRead();
  }

  const { $echo } = useNuxtApp() as unknown as { $echo: any };

  function subscribePrivate(ticketId: string) {
    const ch = $echo.private(`chat.${ticketId}`);
    ch.listen(".MessageSent", async (e: any) => {
      const el = listRef.value;
      const shouldStick = !!el && userIsNearBottom.value && performance.now() - lastUserScrollAt > SCROLL_IDLE_MS;
      const incomingMessage = mapApi({
        id: e.id,
        ticket_id: e.ticket_id,
        user_id: e.user_id,
        type: e.type,
        body: e.body,
        meta: e.meta,
        created_at: e.created_at,
        author: e.author,
        author_photo_url: e.author_photo_url,
        author_first_name: e.author_first_name,
        author_last_name: e.author_last_name,
        author_email: e.author_email,
        author_initials: e.author_initials,
      });
      upsertMessage(incomingMessage);
      ensureAscOrder();
      emitSupportMessageUpdated(incomingMessage);
      await nextTick();
      await new Promise(requestAnimationFrame);
      if (shouldStick) {
        scrollToBottom();
        await waitForNextPaint();
      }
      if (incomingMessage.userId !== currentUserId.value) {
        await markVisibleMessagesAsRead();
      }
    });
    ch.listen(".Typing", (e: { user_id: string; is_typing: boolean }) => {
      applyRemoteTypingState(e?.user_id, Boolean(e?.is_typing));
    });
    return ch;
  }

  let presenceChan: any = null;
  const onlineMap = reactive<Map<string, PresenceUser>>(new Map());

  const isCounterpartyOnline = computed(() => {
    if (onlineMap.size === 0) return false;
    for (const u of Array.from(onlineMap.values())) {
      if (u.id !== currentUserId.value) {
        return true;
      }
    }
    return false;
  });

  watch(
    () => [props.ticketId, isCounterpartyOnline.value] as const,
    ([ticketId, counterpartyOnline]) => {
      useEventBus.emit(SUPPORT_PRESENCE_UPDATED_EVENT, {
        ticketId,
        counterparty_online: counterpartyOnline,
      });
    },
    { immediate: true }
  );

  function applyPresencePayload(payload: any) {
    const data = payload?.data ?? payload;
    onlineMap.clear();
    if (data && Array.isArray(data.online_admins)) {
      data.online_admins.forEach((u: any) => {
        const id = normalizeUserId(u?.id);
        if (!id) return;

        onlineMap.set(id, {
          id,
          name: String(u.name),
          role: "admin",
        });
      });
    }
    if (data && data.online_client) {
      const u = data.online_client;
      const id = normalizeUserId(u?.id);
      if (!id) return;

      onlineMap.set(id, {
        id,
        name: String(u.name),
        role: "client",
      });
    }
  }

  function joinPresence(ticketId: string) {
    presenceChan = $echo.private(`support.ticket.${ticketId}`).listen(".ticket.presence.updated", (payload: any) => {
      applyPresencePayload(payload);
    });
  }
  function leavePresence(ticketId: string) {
    try {
      $echo.leave(`support.ticket.${ticketId}`);
    } catch {}
    presenceChan = null;
    onlineMap.clear();
  }

  let hb: any = null;
  async function apiOpen(ticketId: string) {
    const response = props.adminChat
      ? await appCore.adminModules.tickets.presencePing(ticketId)
      : await appCore.ticketsPresence.ping(ticketId);

    applyPresencePayload(response?.data ?? response);
  }
  async function apiClose(ticketId: string) {
    if (props.adminChat) {
      await appCore.adminModules.tickets.presenceLeave(ticketId);
      return;
    }

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
  let appResumeListenersAttached = false;

  const reconnectSocketTransport = () => {
    const pusher = $echo?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed") {
      try {
        pusher.connect();
      } catch {
        // noop
      }
    }
  };

  const leavePrivate = (ticketId: string) => {
    try {
      $echo.leave(`chat.${ticketId}`);
    } catch {
      // noop
    }
    privateChan = null;
  };

  const subscribeRealtimeForTicket = async (ticketId: string) => {
    reconnectSocketTransport();
    leavePrivate(ticketId);
    leavePresence(ticketId);
    joinPresence(ticketId);
    privateChan = subscribePrivate(ticketId);
    stopPresenceHeartbeat();
    await startPresenceHeartbeat(ticketId);
  };

  const handleRealtimeResume = async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    await subscribeRealtimeForTicket(props.ticketId);
    await syncLatestMessagesFromServer();
  };

  const handleVisibilityChange = () => {
    if (typeof document === "undefined" || document.visibilityState !== "visible") return;
    void handleRealtimeResume();
  };

  const handleBrowserOnline = () => {
    void handleRealtimeResume();
  };

  const handlePageShow = () => {
    void handleRealtimeResume();
  };

  async function markReadUpToMessageId(messageId: string) {
    if (!messageId || !isIncomingMessageId(messageId)) return;
    if (!isMessageIdNewerThan(messageId, lastReadAckMessageId.value)) return;

    if (markReadInFlight) {
      if (isMessageIdNewerThan(messageId, pendingMarkReadMessageId)) {
        pendingMarkReadMessageId = messageId;
      }
      return;
    }

    markReadInFlight = true;
    const payload = { last_message_id: messageId };

    try {
      const response = props.adminChat
        ? await appCore.adminModules.tickets.markRead(props.ticketId, payload)
        : await appCore.tickets.markRead(props.ticketId, payload);
      const updatedCount = Number(response?.data?.data?.updated_count ?? response?.data?.updated_count ?? 0);
      const unreadCount = Number(
        response?.data?.data?.unread_messages_count ?? response?.data?.unread_messages_count ?? Number.NaN
      );

      const latestIncomingId = Number.isFinite(unreadCount) && unreadCount === 0 ? getLatestIncomingMessageId() : null;
      if (latestIncomingId && isMessageIdNewerThan(latestIncomingId, messageId)) {
        lastReadAckMessageId.value = latestIncomingId;
      } else {
        lastReadAckMessageId.value = messageId;
      }

      if (Number.isFinite(updatedCount) && updatedCount > 0) {
        const normalizedUnread = Number.isFinite(unreadCount) ? Math.max(0, unreadCount) : 0;
        useEventBus.emit(SUPPORT_UNREAD_UPDATED_EVENT, {
          ticketId: props.ticketId,
          unread: normalizedUnread,
        });
      }
    } catch (error) {
      console.error("[ChatDefault] markRead failed", error);
    } finally {
      markReadInFlight = false;

      if (pendingMarkReadMessageId) {
        const pending = pendingMarkReadMessageId;
        pendingMarkReadMessageId = null;
        await markReadUpToMessageId(pending);
      }
    }
  }

  async function markVisibleMessagesAsRead() {
    const lastVisibleId = getLastVisibleIncomingMessageId();
    if (!lastVisibleId) return;

    await markReadUpToMessageId(lastVisibleId);
  }

  function scheduleMarkVisibleMessagesAsRead() {
    if (markReadDebounceTimer) {
      clearTimeout(markReadDebounceTimer);
    }

    markReadDebounceTimer = setTimeout(() => {
      markReadDebounceTimer = null;
      if (markReadRafId !== null) return;

      markReadRafId = requestAnimationFrame(() => {
        markReadRafId = null;
        markVisibleMessagesAsRead().catch(() => {});
      });
    }, 180);
  }

  watch(draft, value => {
    if (!mounted.value) return;

    if (value.trim().length === 0) {
      void stopTyping();
      return;
    }

    void startTyping();
  });

  onMounted(async () => {
    mounted.value = true;
    clearAllRemoteTyping();
    localTypingSent = false;
    localTypingLastPingAt = 0;
    clearLocalTypingStopTimer();
    const prefersTouch = window.matchMedia?.("(pointer: coarse)").matches;
    dragHandle.value = prefersTouch ? ".drag-handle" : ".support-chat";
    syncMobileTextInputMode();
    window.addEventListener("resize", syncMobileTextInputMode, { passive: true });
    window.addEventListener("keydown", handleGlobalKeydown);
    mobileModeResizeListenerAttached = true;

    // позиціонування тільки для плавающего окна
    if (!asBlockMode.value) {
      initPosition();
    }

    lastReadAckMessageId.value = null;
    emitActiveSupportTicket(props.ticketId);
    await loadInitial();

    // resize listener тоже только для плавающего окна
    if (!asBlockMode.value) {
      window.addEventListener("resize", onViewportResize);
      resizeListenerAttached = true;
    }

    await subscribeRealtimeForTicket(props.ticketId);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("pageshow", handlePageShow);
    appResumeListenersAttached = true;
  });

  onBeforeUnmount(() => {
    void stopTyping(true);
    clearAllRemoteTyping();
    leavePrivate(props.ticketId);
    leavePresence(props.ticketId);
    stopPresenceHeartbeat();
    apiClose(props.ticketId).catch(() => {});

    if (resizeListenerAttached) {
      window.removeEventListener("resize", onViewportResize);
      resizeListenerAttached = false;
    }
    if (mobileModeResizeListenerAttached) {
      window.removeEventListener("resize", syncMobileTextInputMode);
      window.removeEventListener("keydown", handleGlobalKeydown);
      mobileModeResizeListenerAttached = false;
    }
    if (markReadRafId !== null) {
      cancelAnimationFrame(markReadRafId);
      markReadRafId = null;
    }
    if (markReadDebounceTimer) {
      clearTimeout(markReadDebounceTimer);
      markReadDebounceTimer = null;
    }
    pendingMarkReadMessageId = null;
    clearLocalTypingStopTimer();
    clearPendingAttachments();
    resetUploadProgress();
    closeMediaViewer();

    if (appResumeListenersAttached) {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("pageshow", handlePageShow);
      appResumeListenersAttached = false;
    }

    emitActiveSupportTicket(null);
  });

  watch(
    () => props.ticketId,
    async (id, oldId) => {
      if (id === oldId) return;
      emitActiveSupportTicket(id);
      await stopTyping(true);
      clearAllRemoteTyping();
      leavePrivate(oldId);
      leavePresence(oldId);
      await subscribeRealtimeForTicket(id);
      booting.value = true;
      messages.splice(0, messages.length);
      lastReadAckMessageId.value = null;
      nextPage = 2;
      hasMore.value = true;
      await loadInitial();
    }
  );

  async function send() {
    if (!canSend.value || isSending.value) return;
    await stopTyping(true);
    const shouldKeepKeyboardOpen =
      isMobileChatInteraction() && (document.activeElement === inputRef.value || isKeyboardVisible());
    const body = draft.value.trim();
    const selectedAttachments = [...pendingAttachments.value];
    if (!body && selectedAttachments.length === 0) return;

    draft.value = "";
    pendingAttachments.value = [];

    const el = listRef.value;
    const shouldStick = !!el && userIsNearBottom.value && performance.now() - lastUserScrollAt > SCROLL_IDLE_MS;

    const payload = new FormData();
    payload.append("user_id", String(props.currentUser.id ?? ""));
    payload.append("type", selectedAttachments.length > 0 ? "attachment" : "text");
    if (body) {
      payload.append("body", body);
    }
    if (selectedAttachments.length > 0) {
      const displayAs = selectedAttachments[0]?.displayAs ?? pickerDisplayAs.value;
      payload.append("display_as", displayAs);
      for (const attachment of selectedAttachments) {
        payload.append("files[]", attachment.file, attachment.name);
      }
    }

    isSending.value = true;
    resetUploadProgress();
    if (selectedAttachments.length > 0) {
      uploadProgress.active = true;
      uploadProgress.total = selectedAttachments.reduce((total, attachment) => total + (attachment.size || 0), 0);
      uploadProgress.loaded = 0;
      uploadProgress.percent = 0;
    }

    let shouldRevokePreview = true;

    try {
      const requestConfig: AxiosRequestConfig = {};
      if (selectedAttachments.length > 0) {
        requestConfig.timeout = UPLOAD_REQUEST_TIMEOUT_MS;
        requestConfig.onUploadProgress = updateUploadProgress;
      }

      const response = props.adminChat
        ? await appCore.adminModules.tickets.storeTicketMessage(props.ticketId, payload, requestConfig)
        : await appCore.tickets.storeTicketMessage(props.ticketId, payload, requestConfig);

      const rawMessage = response?.data?.data ?? response?.data ?? null;
      if (rawMessage?.id) {
        const latestMessage = mapApi({
          id: rawMessage.id,
          ticket_id: rawMessage.ticket_id ?? props.ticketId,
          user_id: rawMessage.user_id ?? props.currentUser.id,
          type: rawMessage.type ?? (selectedAttachments.length > 0 ? "attachment" : "text"),
          body: rawMessage.body ?? body,
          meta: rawMessage.meta ?? null,
          created_at: rawMessage.created_at ?? new Date().toISOString(),
          author: rawMessage.author,
          author_photo_url: rawMessage.author_photo_url,
          author_first_name: rawMessage.author_first_name,
          author_last_name: rawMessage.author_last_name,
          author_email: rawMessage.author_email,
          author_initials: rawMessage.author_initials,
        });
        upsertMessage(latestMessage);
        emitSupportMessageUpdated(latestMessage);
        ensureAscOrder();
      }

      await nextTick();
      if (shouldStick) scrollToBottom();
      if (shouldKeepKeyboardOpen) preserveInputFocusOnMobile();

      // If socket was unstable in PWA, fetch first page to backfill any missed broadcast messages.
      void syncLatestMessagesFromServer();
    } catch (error) {
      draft.value = body;
      pendingAttachments.value = selectedAttachments;
      shouldRevokePreview = false;
      toast.error(extractRequestErrorMessage(error));
      console.error("[ChatDefault] send failed", error);
    } finally {
      isSending.value = false;
      resetUploadProgress();
      if (shouldRevokePreview) {
        for (const attachment of selectedAttachments) {
          revokePendingAttachment(attachment);
        }
      }
    }
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

  .chat-mobile-back {
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
