<template>
  <Teleport to="body">
    <div
      class="modal-root"
      :class="{ open: isOpen }"
      :aria-hidden="!isOpen">
      <div
        class="modal-overlay"
        :class="{ open: isOpen }"
        @click="handleOverlayClick"></div>

      <div
        class="modal-right-side"
        :class="{ open: isOpen }"
        @click.stop
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd">
        <button
          class="modal-close-btn"
          type="button"
          aria-label="Закрити"
          @click="closeModal">
          ×
        </button>

        <div class="modal-right-side__content">
          <slot :close="closeModal" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, ref, watch } from "vue";

  const isOpen = ref(false);
  const LOCK_CLASS = "modal-right-side-open";

  const lockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.add(LOCK_CLASS);
    document.body.classList.add(LOCK_CLASS);
  };

  const unlockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove(LOCK_CLASS);
    document.body.classList.remove(LOCK_CLASS);
  };

  const onEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const openModal = () => (isOpen.value = true);
  const closeModal = () => (isOpen.value = false);
  const openCloseModal = () => (isOpen.value ? closeModal() : openModal());
  const handleOverlayClick = () => closeModal();

  watch(isOpen, value => {
    if (typeof document === "undefined") return;

    if (value) {
      lockScroll();
      document.addEventListener("keydown", onEscape);
      return;
    }

    document.removeEventListener("keydown", onEscape);
    unlockScroll();
  });

  onBeforeUnmount(() => {
    if (typeof document === "undefined") return;
    document.removeEventListener("keydown", onEscape);
    unlockScroll();
  });

  /**
   * Свайп для закриття:
   * якщо користувач провів пальцем по модалці горизонтально
   * (в будь-який бік) більше ніж на 50px — закриваємо.
   */
  const touchStartX = ref<number | null>(null);

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartX.value = touch.clientX;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.value === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.value;

    // Поріг "свайпа" — 50px
    if (Math.abs(deltaX) > 50) {
      closeModal();
    }

    touchStartX.value = null;
  };

  defineExpose({
    openModal,
    closeModal,
    openCloseModal,
  });
</script>

<style lang="scss" scoped>
  .modal-root {
    position: fixed;
    inset: 0;
    z-index: 11000;
    pointer-events: none;

    &.open {
      pointer-events: auto;
    }
  }

  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out;
    z-index: 1;

    &.open {
      opacity: 1;
      visibility: visible;
    }
  }

  .modal-right-side {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    height: 100dvh;
    width: 100%;
    max-width: 600px;
    background-color: var(--ui-background);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 2;
    overflow: hidden;

    &.open {
      transform: translateX(0);
    }
  }

  .modal-right-side__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: max(16px, calc(env(safe-area-inset-bottom, 0px) + 12px));
  }

  .modal-close-btn {
    position: absolute;
    top: max(12px, calc(env(safe-area-inset-top, 0px) + 12px));
    right: max(12px, calc(env(safe-area-inset-right, 0px) + 12px));
    border: none;
    background: transparent;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    z-index: 3;
    color: var(--ui-text-main);
  }

  :global(html.modal-right-side-open),
  :global(body.modal-right-side-open) {
    overflow: hidden;
    overscroll-behavior: none;
  }
</style>
