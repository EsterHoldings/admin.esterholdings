<template>
  <div class="min-h-dvh flex flex-col bg-[var(--ui-background)] bg-blend-multiply">
    <TheCabinetHeader class="shrink-0" />

    <div class="flex-1 min-h-0 flex">
      <TheCabinetSideBar class="shrink-0" />

      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-100 ease-in-out"
        leave-active-class="transition-opacity duration-100 ease-in-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <main
          :key="route.fullPath"
          class="flex-1 min-h-0 overflow-y-auto no-scrollbar box-border w-full p-1 lg:pl-[250px] text-white"
        >
          <slot />
        </main>
      </Transition>
    </div>

    <TheFooter class="h-[60px] shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import TheCabinetSideBar from "~/components/block/TheCabinetSideBar.vue";
import TheFooter from "~/components/block/TheFooter.vue";
import TheCabinetHeader from "~/components/block/TheCabinetHeader.vue";

const route = useRoute();
</script>

<style>
html,
body,
#__nuxt {
  height: 100%;
}

/* Optional: smoother scrolling on iOS */
.no-scrollbar {
  -webkit-overflow-scrolling: touch;
}

/* Hide scrollbar (Chrome, Safari, Edge) */
.no-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* Hide scrollbar (Firefox) */
.no-scrollbar {
  scrollbar-width: none;
}

/* Hide scrollbar (IE/old Edge) */
.no-scrollbar {
  -ms-overflow-style: none;
}
</style>