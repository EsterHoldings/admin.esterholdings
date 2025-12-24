<template>
  <div>
    <div
        class="modal-overlay"
        :class="{ open: isOpen }"
        @click="handleOverlayClick"
    ></div>

    <div
        class="modal-right-side"
        :class="{ open: isOpen }"
        @click.stop
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
    >
      <!-- Хрестик -->
      <button
          class="modal-close-btn"
          type="button"
          aria-label="Закрити"
          @click="closeModal"
      >
        ×
      </button>

      <!-- Контент модалки -->
      <slot :close="closeModal" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const isOpen = ref(false);

const openModal = () => (isOpen.value = true);
const closeModal = () => (isOpen.value = false);
const openCloseModal = () => (isOpen.value ? closeModal() : openModal());
const handleOverlayClick = () => closeModal();

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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;
  z-index: 998;

  &.open {
    opacity: 1;
    visibility: visible;
  }
}

.modal-right-side {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  max-width: 600px;
  background-color: var(--ui-background);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 999;
  box-sizing: border-box;
  overflow-y: auto;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);

  &.open {
    transform: translateX(0);
  }
}

/* Хрестик */
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}
</style>
