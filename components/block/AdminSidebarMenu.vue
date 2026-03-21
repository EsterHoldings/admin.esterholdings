<template>
  <ul class="side-bar-cabinet__menu">
    <template v-if="showMenuSkeleton">
      <li
        v-for="index in 6"
        :key="`menu-skeleton-${index}`"
        class="side-bar-cabinet__menu__placeholder" />
    </template>

    <AdminSidebarMenuItem
      v-else
      v-for="menuItem in menuItems"
      :title="menuItem.title"
      :to="menuItem.to"
      :icon="menuItem.icon"
      :notificationsCount="menuItem.notificationsCount ?? 0"
      :sideBarIsOpen="sideBarIsOpen"
      :key="menuItem.title"
      @click="handleClickMenuItem" />
  </ul>
</template>

<script lang="ts" setup>
  import AdminSidebarMenuItem from "~/components/block/AdminSidebarMenuItem.vue";
  import UiIconHome from "~/components/ui/UiIconHome.vue";
  import UiIconClients from "~/components/ui/UiIconClients.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconReferral from "~/components/ui/UiIconReferral.vue";
  import UiIconProfile from "~/components/ui/UiIconProfile.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconKeys from "~/components/ui/UiIconKeys.vue";

  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";

  import { useI18n } from "vue-i18n";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconCheck from "~/components/ui/UiIconCheck.vue";
  import { useLocalePath } from "~/.nuxt/imports";
  import UiIconNews from "~/components/ui/UiIconNews.vue";

  const { locale, t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const props = withDefaults(
    defineProps<{
      supportUnreadCount?: number;
      verificationRequestsUnreadCount?: number;
      withdrawalRequestsUnreadCount?: number;
    }>(),
    {
      supportUnreadCount: 0,
      verificationRequestsUnreadCount: 0,
      withdrawalRequestsUnreadCount: 0,
    }
  );
  const addCurrentLocaleToPath = (path = "") => {
    return `/${locale.value}/${path}`;
  };

  const router = useRouter();
  const sideBarIsOpen = ref(true);
  const adminAuthStore = useAdminAuthStore();

  const hasPermission = (required?: string | string[]) => {
    if (!required) return true;
    if (adminAuthStore.hasRole("super-admin")) return true;

    const list = Array.isArray(required) ? required : [required];
    return list.some(permissionName => adminAuthStore.hasPermission(permissionName));
  };

  const menuItems = computed(() => {
    const items = [
      {
        title: t("admin.menu.dashboard"),
        to: localePath("/dashboard"),
        icon: UiIconHome,
        displayIfHasPermission: "view-dashboard",
      },
      {
        title: t("admin.menu.verificationRequests"),
        to: localePath("/verifications"),
        icon: UiIconCheck,
        displayIfHasPermission: "view-verifications",
        notificationsCount: props.verificationRequestsUnreadCount,
      },
      {
        title: t("admin.menu.withdrawalRequests"),
        to: localePath("/withdrawal-requests"),
        icon: UiIconProfile,
        displayIfHasPermission: "view-withdrawal-requests",
        notificationsCount: props.withdrawalRequestsUnreadCount,
      },
      {
        title: t("admin.menu.clients"),
        to: localePath("/clients"),
        icon: UiIconClients,
        displayIfHasPermission: "view-clients",
      },
      {
        title: t("admin.menu.accounts"),
        to: localePath("/accounts"),
        icon: UiIconUser,
        displayIfHasPermission: "view-accounts",
      },
      {
        title: t("admin.menu.support"),
        to: localePath("/support"),
        icon: UiIconSupport,
        displayIfHasPermission: "view-support",
        notificationsCount: props.supportUnreadCount,
      },
      {
        title: t("admin.menu.referral"),
        to: localePath("/referral"),
        icon: UiIconReferral,
        displayIfHasPermission: "view-referrals",
      },
      {
        title: t("admin.menu.settings"),
        to: localePath("/settings"),
        icon: UiIconSetting,
        displayIfHasPermission: "view-settings",
      },
      {
        title: t("admin.menu.news"),
        to: localePath("/news"),
        icon: UiIconNews,
        displayIfHasPermission: "view-news",
      },
      {
        title: t("admin.menu.access"),
        to: localePath("/access"),
        icon: UiIconKeys,
        displayIfHasPermission: "view-access",
      },
    ];

    return items.filter(item => hasPermission(item.displayIfHasPermission));
  });

  const showMenuSkeleton = computed(() => {
    return menuItems.value.length === 0 && !adminAuthStore.isAuthInitialized;
  });

  const handleClickMenuItem = (to: string) => {
    router.push(to);
  };
</script>

<style lang="scss" scoped>
  .side-bar-cabinet {
    &__menu {
      width: 100%;
    }

    &__menu__placeholder {
      height: 40px;
      margin-bottom: 5px;
      border-radius: 8px;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.06) 0%,
        rgba(255, 255, 255, 0.12) 50%,
        rgba(255, 255, 255, 0.06) 100%
      );
      background-size: 200% 100%;
      animation: sidebar-menu-skeleton 1.4s ease-in-out infinite;
    }
  }

  @keyframes sidebar-menu-skeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
