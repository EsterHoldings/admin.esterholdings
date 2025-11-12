<template>
  <div
      class="relative min-h-dvh overflow-hidden
         bg-[var(--ui-background)]
         bg-blend-multiply"
  >
    <TheCabinetHeader />
    <TheCabinetSideBar />

    <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-100 ease-in-out"
        leave-active-class="transition-opacity duration-100 ease-in-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div class="min:h-[calc(100vh_-_60px)] flex flex-col">
        <main
            :key="route.fullPath"
            class="flex-1 box-border w-full p-1 lg:pl-[250px] text-white min:h-[calc(100vh_-_100px)]"
        >
          <slot />
        </main>

        <TheFooter class="h-[60px] shrink-0" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import TheCabinetSideBar from "~/components/block/TheCabinetSideBar.vue";
import TheFooter from "~/components/block/TheFooter.vue";
import TheCabinetHeader from "~/components/block/TheCabinetHeader.vue";

const route = useRoute();
</script>
