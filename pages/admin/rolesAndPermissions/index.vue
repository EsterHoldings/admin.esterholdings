<script lang="ts" setup>
definePageMeta({
  middleware: ["admin-middleware"],
});

await navigateTo("/access", { replace: true });
</script>
