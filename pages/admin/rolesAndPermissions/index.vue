<script lang="ts" setup>
import { definePageMeta, navigateTo } from "nuxt/app";

definePageMeta({
  middleware: ["admin-middleware"],
});

await navigateTo("/access", { replace: true });
</script>
