<template>
  <BirthdaysPanel v-bind="birthdaysPanelProps" />
</template>

<script setup lang="ts">
  import { definePageMeta } from "~/.nuxt/imports";

  import BirthdaysPanel from "~/pages/admin/birthdays/components/BirthdaysPanel.vue";
  import { useBirthdaysPage } from "~/composables/admin/birthdays/useBirthdaysPage";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { birthdaysPanelProps } = useBirthdaysPage();
</script>
