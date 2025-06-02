<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const id_token = hash.get("id_token");
  const error = hash.get("error");

  if (id_token) {
    window.opener?.postMessage({ id_token }, window.location.origin);
  } else if (error) {
    window.opener?.postMessage({ error }, window.location.origin);
  }

  window.close();
});
</script>

<template>
  <p>Completing login...</p>
</template>
