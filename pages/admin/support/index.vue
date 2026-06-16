<template>
  <SupportPanel v-bind="supportPanelProps" />
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";

  import SupportPanel from "~/pages/admin/support/components/SupportPanel.vue";
  import { useSupportPage } from "~/composables/admin/support/useSupportPage";

  definePageMeta({
    layout: "default",
    middleware: ["admin-middleware"],
  });

  const { supportPanelProps } = useSupportPage();
</script>
