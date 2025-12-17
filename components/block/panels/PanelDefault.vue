<template>
  <div class="bg-[var(--ui-background-panel)] border border-[var(--color-stroke-ui-light)] rounded-[10px]">
    <div
      v-if="title.length > 0"
      class="px-[10px] h-10 flex items-center font-semibold">
      <div class="flex items-center justify-between w-full">
        <span>{{ props.title }}</span>
        <div>
          <slot name="title-extra"></slot>
        </div>
      </div>
    </div>
    <div class="w-full h-auto">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
  });
</script>
