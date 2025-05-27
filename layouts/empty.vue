<template>
  <div class="page__wrapper">
    <div class="page">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  &__wrapper {
    background-color: var(--ui-background-admin);
  }
}
</style>
