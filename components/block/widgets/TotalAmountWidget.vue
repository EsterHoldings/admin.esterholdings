<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
</script>

<template>
  <PanelDefault class="relative h-full max-h-[260px] p-3 sm:p-4 md:p-5">
    <div class="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-1 sm:items-center">
      <div class="flex flex-col items-center space-y-1 sm:items-start">
        <UiTextSmall class="!text-[var(--color-success)] text-center sm:text-left">
          Total amount
        </UiTextSmall>
        <UiTextH3
          class="amount-text !text-[var(--color-success)] text-center sm:text-left whitespace-nowrap overflow-hidden text-ellipsis"
        >
          $ 4 292.00
        </UiTextH3>
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">
.amount-text {
  font-size: clamp(20px, 4vw, 28px);
  line-height: 1.1;
}
</style>
