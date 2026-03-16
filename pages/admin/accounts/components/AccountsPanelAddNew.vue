<template>
  <AccountsPanelForm
    mode="create"
    :title="title"
  />
</template>

<script setup lang="ts">
  import AccountsPanelForm from "~/pages/admin/accounts/components/AccountsPanelForm.vue";

  defineProps({
    title: {
      type: String,
      default: "",
    },
  });
</script>
