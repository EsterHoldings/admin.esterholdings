<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  balance: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <PanelDefault class="p-5">
    <div class="space-y-3">
      <div class="grid grid-cols-[1fr_10rem_11.25rem] items-center px-5 py-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg">
        <span class="truncate">Deposit:</span>
        <span class="text-right font-mono tabular-nums text-lg text-[var(--ui-sticker-success)]">$ +5000</span>
        <span class="text-right font-mono tabular-nums text-sm">12.08.2025 16:19</span>
      </div>

      <div class="grid grid-cols-[1fr_10rem_11.25rem] items-center px-5 py-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg">
        <span class="truncate">Deposit:</span>
        <span class="text-right font-mono tabular-nums text-lg text-[var(--ui-sticker-success)]">$ +15540</span>
        <span class="text-right font-mono tabular-nums text-sm">12.08.2025 16:20</span>
      </div>

      <div class="grid grid-cols-[1fr_10rem_11.25rem] items-center px-5 py-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg">
        <span class="truncate">Transfer to account 954573936:</span>
        <span class="text-right font-mono tabular-nums text-lg text-[var(--ui-sticker-danger)]">$ -5000</span>
        <span class="text-right font-mono tabular-nums text-sm">12.08.2025 16:21</span>
      </div>

      <div class="grid grid-cols-[1fr_10rem_11.25rem] items-center px-5 py-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg">
        <span class="truncate">Withdrawal:</span>
        <span class="text-right font-mono tabular-nums text-lg text-[var(--ui-sticker-danger)]">$ -200</span>
        <span class="text-right font-mono tabular-nums text-sm">12.08.2025 16:23</span>
      </div>

      <div class="grid grid-cols-[1fr_10rem_11.25rem] items-center px-5 py-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg">
        <span class="truncate">Withdrawal:</span>
        <span class="text-right font-mono tabular-nums text-lg text-[var(--ui-sticker-danger)]">$ -500</span>
        <span class="text-right font-mono tabular-nums text-sm">12.08.2025 16:31</span>
      </div>
    </div>
  </PanelDefault>

</template>

<style scoped lang="scss">

</style>