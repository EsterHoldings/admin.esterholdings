<template>
  <div class="container-fluid">
    <div
      class="page-wrapper"
      :class="{ 'sidebar-open': isSidebarOpen }">
      <div
        class="sidebar-overlay"
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"></div>
      <AdminSidebar
        class="page-sidebar"
        :class="{ 'is-open': isSidebarOpen }"
        @close="isSidebarOpen = false" />

      <div class="page-content-wrapper">
        <AdminHeader
          class="page-header"
          :breadcrumbs="breadcrumbs"
          :show-breadcrumbs="showBreadcrumbs"
          @toggle-sidebar="isSidebarOpen = true" />
        <Transition
          name="fade"
          mode="out-in">
          <div class="page-content">
            <div
              class="page"
              :key="route.fullPath">
              <UiContainer>
                <slot />
              </UiContainer>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AdminSidebar from "~/components/block/AdminSidebar.vue";

  import UiImage from "~/components/ui/UiImage.vue";
  import TheFooter from "@/components/block/TheFooter.vue";
  import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";
  import { computed, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import AdminHeader from "~/components/block/AdminHeader.vue";
  import UiIconHome from "~/components/ui/UiIconHome.vue";

  const route = useRoute();
  const isSidebarOpen = ref(false);
  const { t, locale } = useI18n({ useScope: "global" });

  const resolveLabel = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const labels: Record<string, string> = {
    admin: resolveLabel("admin.breadcrumbs.home", "Главная"),
    dashboard: resolveLabel("admin.breadcrumbs.home", "Главная"),
    clients: resolveLabel("admin.menu.clients", "Clients"),
    accounts: resolveLabel("admin.menu.accounts", "Accounts"),
    payments: resolveLabel("admin.menu.payments", "Payments"),
    referral: resolveLabel("admin.menu.referral", "Referral"),
    settings: resolveLabel("admin.menu.settings", "Settings"),
    support: resolveLabel("admin.menu.support", "Support"),
    access: resolveLabel("admin.menu.access", "Access"),
    verifications: resolveLabel("admin.menu.verificationRequests", "Verifications"),
    profile: resolveLabel("admin.menu.profile", "Profile"),
    news: resolveLabel("admin.menu.news", "News"),
  };

  const breadcrumbs = computed(() => {
    const segments = route.path.split("/").filter(Boolean);
    const currentLocale = locale.value?.toLowerCase?.();
    const startIdx = currentLocale && segments[0]?.toLowerCase() === currentLocale ? 1 : 0;
    const basePrefix = startIdx ? "/" + segments.slice(0, startIdx).join("/") : "";
    const visibleSegments = segments.slice(startIdx);

    const filteredSegments = visibleSegments.filter(seg => seg.toLowerCase() !== "dashboard");

    const list = filteredSegments.map((seg, idx) => {
      const key = seg.toLowerCase();
      const name = labels[key] ?? decodeURIComponent(seg);
      const to = basePrefix + "/" + filteredSegments.slice(0, idx + 1).join("/");
      return { name, to };
    });

    const dashCrumb = {
      name: labels.dashboard ?? "Главная",
      to: basePrefix + "/dashboard",
      icon: UiIconHome,
    };
    if (!list.length) return [dashCrumb];
    if (list[0].name.toLowerCase() !== "главная") return [dashCrumb, ...list];
    return [dashCrumb, ...list.slice(1)];
  });

  const showBreadcrumbs = computed(() => {
    const segments = route.path.split("/").filter(Boolean);
    const currentLocale = locale.value?.toLowerCase?.();
    const startIdx = currentLocale && segments[0]?.toLowerCase() === currentLocale ? 1 : 0;
    const visibleSegments = segments.slice(startIdx);
    return visibleSegments.join("/") !== "dashboard";
  });

  watch(
    () => route.fullPath,
    () => {
      isSidebarOpen.value = false;
    }
  );
</script>

<style lang="scss" scoped>
  .bg-image {
    position: fixed;
    left: 0;
    top: 0;
    opacity: 1;
    z-index: -1;
  }

  .page {
    min-height: 0;
    height: auto;
    overflow: visible;
    background-color: var(--ui-background-admin);

    &-wrapper {
      display: grid;
      grid-template-columns: 264px 1fr;
      background-color: var(--ui-background-admin);
      color: #b0b0b0;
      overflow: hidden;
      position: relative;
      min-height: 100dvh;
      height: 100dvh;
    }

    &-content {
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      height: 100%;
      min-height: 100%;
      padding-top: 60px;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;

      &-wrapper {
        min-width: 0;
        min-height: 0;
        height: 100dvh;
        overflow: hidden;
      }
    }
  }

  .page-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 264px;
    z-index: 40;
    background: var(--ui-background-admin);
    width: calc(100% - 264px);
  }

  .sidebar-overlay {
    display: none;
  }

  @media (max-width: 1023px) {
    .page-wrapper {
      grid-template-columns: 1fr;
    }

    .page-header {
      left: 0;
      width: 100%;
    }

    .page-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
      z-index: 60;
    }

    .page-sidebar.is-open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 50;
    }
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 150ms ease;
  }
</style>
