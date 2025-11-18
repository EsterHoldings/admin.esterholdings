<script setup lang="ts">
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

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
    <div class="p-5 mb-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg flex items-center justify-between">
      <span>Id:</span>
      <span v-if="!props.isLoading">{{ props.id }}</span>
      <UiIconSpinnerDefault v-if="props.isLoading" />
    </div>
    <div class="p-5 mb-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg flex items-center justify-between">
      <span>Type:</span>
      <span v-if="!props.isLoading">{{ props.type }}</span>
      <UiIconSpinnerDefault v-if="props.isLoading" />
    </div>
    <div class="p-5 mb-3 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg flex items-center justify-between">
      <span>Number:</span>
      <span v-if="!props.isLoading">{{ props.number }}</span>
      <UiIconSpinnerDefault v-if="props.isLoading" />
    </div>
    <div class="p-5 bg-[var(--color-stroke-ui-dark)] hover:opacity-80 rounded-lg flex items-center justify-between">
      <span>Balance:</span>
      <span v-if="!props.isLoading">$ {{ props.balance }}</span>
      <UiIconSpinnerDefault v-if="props.isLoading" />
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">

</style>