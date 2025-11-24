<script setup lang="ts">
import UiContainer from '~/components/ui/UiContainer.vue'
</script>

<template>
  <UiContainer>
    <div class="my-5 w-full flex justify-between items-center">
      <slot name="header" />
    </div>

    <slot name="content" />
  </UiContainer>
</template>