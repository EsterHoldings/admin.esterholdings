<script setup lang="ts">
import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
</script>

<template>
  <PanelDefault class="relative h-full max-h-[260px] p-3 sm:p-4 md:p-5">
    <div class="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div class="flex flex-col items-center space-y-1 sm:items-start">
        <UiTextSmall class="!text-[var(--color-warning)] text-center sm:text-left">
          Pending transactions
        </UiTextSmall>
        <UiTextH3 class="!text-[var(--color-warning)] text-center sm:text-left">1</UiTextH3>
      </div>
      <div class="flex items-start justify-center gap-2 sm:justify-end">
        <UiIconWithdraw class="text-[var(--ui-text-main)] !h-4 !w-4 sm:!h-5 sm:!w-5" />
        <UiIconPayment class="text-[var(--ui-text-main)] !h-4 !w-4 sm:!h-5 sm:!w-5" />
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>
