<template>
  <div class="payments-redirect">
    <UiIconSpinnerDefault />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue";
  import { definePageMeta, navigateTo, useLocalePath } from "~/.nuxt/imports";

  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const localePath = useLocalePath();

  onMounted(async () => {
    await navigateTo(localePath("/withdrawal-requests"), { replace: true });
  });
</script>

<style scoped>
  .payments-redirect {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
