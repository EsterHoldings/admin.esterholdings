<script setup lang="ts">
</script>

<template>
  <div class="overflow-x-auto relative">
    <table
        class="w-full text-[var(--ui-text-main)] text-sm border-separate border-spacing-0"
    >
      <thead class="h-46px">
      <slot name="thead" />
      </thead>

      <tbody>
      <slot name="tbody" />
      </tbody>
    </table>
  </div>

  <slot name="empty" />

  <slot name="pagination" />
</template>

<style scoped lang="scss">
:deep(thead) {
  background: var(--color-stroke-ui-light);
}

:deep(thead tr th:first-child) {
  border-top-left-radius: 10px;
}

:deep(thead tr th:last-child) {
  border-top-right-radius: 10px;
}

:deep(tbody tr) {
  height: 54px;
}
</style>
