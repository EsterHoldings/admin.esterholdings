<script setup lang="ts">
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconBell from "~/components/ui/UiIconBell.vue";
</script>

<template>
  <PanelDefault class="relative h-full max-h-[260px] p-3 sm:p-4 md:p-5">
    <div class="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div class="flex flex-col items-center space-y-2 sm:items-start">
        <UiTextSmall class="!text-[var(--color-warning)] text-center sm:text-left">
          Missed Notifications
        </UiTextSmall>
        <UiTextH3 class="!text-[var(--color-warning)] flex items-center justify-center gap-2 px-4 text-center sm:justify-start sm:px-0 sm:text-left">
          3
        </UiTextH3>
      </div>
      <div class="flex items-start justify-center sm:justify-end">
        <UiIconBell class="!h-4 !w-4 sm:!h-5 sm:!w-5" />
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>
