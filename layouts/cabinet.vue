<template>
  <div class="cabinet-layout min-h-dvh flex flex-col bg-[var(--ui-background)] bg-blend-multiply pb-safe-area">
    <CabinetHeader class="cabinet-header shrink-0" />

    <div class="flex-1 min-h-0 flex">
      <CabinetSidebar class="shrink-0" />

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
          class="cabinet-main flex-1 min-h-0 overflow-y-auto no-scrollbar box-border w-full p-1 lg:pl-[250px] text-white pb-safe-area mb-[90px] lg:mb-0"
        >
          <UiContainer>
            <div v-if="breadcrumbs.length" class="cabinet-breadcrumbs text-sm text-[var(--ui-text-secondary)]">
              <UiBreadcrumb :list="breadcrumbs" />
            </div>
          </UiContainer>
          <slot />
        </main>
      </Transition>
    </div>
    <!--<TheFooter class="h-[60px] shrink-0 pb-safe-area" />-->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import CabinetSidebar from "~/components/block/CabinetSidebar.vue";
import TheFooter from "~/components/block/TheFooter.vue";
import CabinetHeader from "~/components/block/CabinetHeader.vue";
import UiBreadcrumb from "~/components/ui/UiBreadcrumb.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const route = useRoute();
const { t, locale } = useI18n({ useScope: "global" });

const resolveLabel = (key: string, fallback: string) => {
  const val = t(key);
  return val === key ? fallback : val;
};

const labels: Record<string, string> = {
  dashboard: resolveLabel("cabinet.dashboard.title", "Dashboard"),
  accounts: resolveLabel("cabinet.accounts.account.title", "Accounts"),
  payments: resolveLabel("cabinet.dashboard.transactions.title", "Payments"),
  support: resolveLabel("cabinet.support.title", "Support"),
  referrals: resolveLabel("cabinet.referrals.title", "Referrals"),
  profile: resolveLabel("cabinet.profile.title", "Profile"),
};

const breadcrumbs = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  const currentLocale = locale.value?.toLowerCase?.();
  const startIdx = currentLocale && segments[0]?.toLowerCase() === currentLocale ? 1 : 0;
  const basePrefix = startIdx ? "/" + segments.slice(0, startIdx).join("/") : "";
  const visibleSegments = segments.slice(startIdx);

  const list = visibleSegments.map((seg, idx) => {
    const key = seg.toLowerCase();
    const name = labels[key] ?? decodeURIComponent(seg);
    const to = basePrefix + "/" + visibleSegments.slice(0, idx + 1).join("/");
    return { name, to };
  });
  const dashCrumb = { name: labels.dashboard ?? "Dashboard", to: basePrefix + "/dashboard" };
  if (!list.length) return [dashCrumb];
  if (list[0].name.toLowerCase() !== "dashboard") return [dashCrumb, ...list];
  return [dashCrumb, ...list.slice(1)];
});
</script>

<style>
html,
body,
#__nuxt {
  height: 100%;
}

.cabinet-layout {
  position: relative;
  isolation: isolate;
}

.cabinet-layout::before,
.cabinet-layout::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.cabinet-layout::before {
  background: url("/static/mbg.gif") center/cover repeat;
  z-index: -2;
}

.cabinet-layout::after {
  background: var(--ui-background);
  opacity: 0.97;
  z-index: -1;
}

.cabinet-breadcrumbs {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 10px 0;
}

.cabinet-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--ui-background);
}

.cabinet-main {
  padding-top: 60px;
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
