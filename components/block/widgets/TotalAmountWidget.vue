<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
</script>

<template>
  <PanelDefault class="relative p-3 sm:p-4 md:p-5">
    <div class="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div class="flex flex-col items-center space-y-1 sm:items-start">
        <UiTextSmall class="!text-[var(--color-success)] text-center sm:text-left">
          Total amount
        </UiTextSmall>
        <UiTextH3 class="!text-[var(--color-success)] text-center sm:text-left">
          $ 4 292.00
        </UiTextH3>
      </div>
      <div class="flex items-start justify-center sm:justify-end">
        <UiIconClients class="!h-4 !w-4 sm:!h-5 sm:!w-5" />
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>
