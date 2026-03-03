<template>
  <div></div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";

definePageMeta({
  middleware: ["admin-root"],
  layout: "empty",
});
</script>
