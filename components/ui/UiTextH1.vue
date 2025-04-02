<template>
  <h1 class="h1">
    <slot />
  </h1>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.h1 {
  font-size: 60px;
  font-weight: 700;
}

@media (max-width: 991px) {
  .h1 {
    font-size: 35px;
  }
}
</style>
