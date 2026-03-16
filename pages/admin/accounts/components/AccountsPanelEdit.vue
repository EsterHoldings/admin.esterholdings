<template>
  <AccountsPanelForm
    mode="edit"
    :id="id"
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
    id: {
      type: String,
      required: true,
    },
  });
</script>
