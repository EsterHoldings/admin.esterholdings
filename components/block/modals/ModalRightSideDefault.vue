<template>
  <div>
    <div class="modal-overlay"
         :class="{ open: isOpen }"
         @click="handleOverlayClick"
    ></div>
    <div class="modal-right-side"
         :class="{ open: isOpen }"
         @click.stop
    >
      <slot :close="closeModal" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const isOpen = ref(false);

const openModal = () => isOpen.value = true;
const closeModal = () => isOpen.value = false;
const openCloseModal = () => isOpen.value ? closeModal() : openModal();
const handleOverlayClick = () => closeModal();

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
  width: 600px;
  background-color: var(--ui-background);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 999;

  &.open {
    transform: translateX(0);
  }
}
</style>