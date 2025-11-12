<template>
  <li
    class="relative md:w-[120px] lg:w-full mt-px h-[40px] flex justify-center transition-colors duration-300 cursor-pointer rounded-md"
    :class="isActive ? 'bg-[var(--color-ui-primary)]' : 'hover:bg-[var(--color-stroke-ui-dark)] hover:opacity-80'"
    @click="handleClickMenuItem">
    <div class="text-[var(--ui-text-main)] flex items-center justify-center h-full w-[60px] max-sm:w-[50px] relative">
      <component :is="icon" />
      <span
        class="absolute top-1 right-2 min-h-[16px] min-w-[16px] bg-[var(--ui-sticker-danger)] flex items-center justify-center rounded-full text-sm"
        v-if="notificationsCount > 0">
        {{ notificationsCount }}
      </span>
    </div>

    <div
      class="hidden lg:flex items-center justify-start w-full h-full text-[var(--ui-text-main)] text-[14px] font-medium whitespace-pre-wrap overflow-hidden transition-all duration-300"
      :class="props.sideBarIsOpen ? 'opacity-100' : 'opacity-0 lg:w-0'">
      {{ title }}
    </div>
  </li>
</template>

<script lang="ts" setup>
  import { useRoute } from "vue-router";
  import { computed } from "vue";

  const emit = defineEmits(["click"]);
  const props = defineProps({
    title: { type: String, required: true },
    to: { type: String, required: true },
    icon: { type: Object, default: "" },
    sideBarIsOpen: { type: Boolean, default: false },
    notificationsCount: { type: Number, default: 0 },
  });

  const route = useRoute();
  const isActive = computed(() => route.path === props.to);
  const handleClickMenuItem = () => emit("click", props.to);
</script>
