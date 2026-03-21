<template>
  <nav class="nav">
    <ul class="nav-menu">
      <template v-if="showMenuSkeleton">
        <li
          v-for="index in 6"
          :key="`header-menu-skeleton-${index}`"
          class="nav-menu__placeholder" />
      </template>
      <template v-else>
        <TheHeaderSideBarMenuItem
          v-for="menuItem in menuList"
          :title="menuItem.title"
          :to="menuItem.to"
          :icon="menuItem.icon"
          :notificationsCount="menuItem.notificationsCount ?? 0"
          :sideBarIsOpen="sideBarIsOpen"
          :key="menuItem.title"
          @click="handleClickMenuItem"
          >{{ menuItem.icon }}
        </TheHeaderSideBarMenuItem>
      </template>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import TheHeaderSideBarMenuItem from "~/components/block/TheHeaderSideBarMenuItem.vue";

import UiIconHome from "~/components/ui/UiIconHome.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconReferral from "~/components/ui/UiIconReferral.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconKeys from "~/components/ui/UiIconKeys.vue";
import UiIconSupport from "~/components/ui/UiIconSupport.vue";
import UiIconCheck from "~/components/ui/UiIconCheck.vue";
import UiIconNews from "~/components/ui/UiIconNews.vue";

import { useRouter } from "vue-router";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { computed } from "vue";
import {useLocalePath} from "~/.nuxt/imports";
import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";

const { t } = useI18n();
const localePath = useLocalePath();
const store = useAdminAuthStore();
const adminNotificationsStore = useAdminNotificationsStore();

const hasPermission = (required?: string | string[]) => {
  if (!required) return true;
  if (store.hasRole("super-admin")) return true;
  const list = Array.isArray(required) ? required : [required];

  return list.some(permissionName => store.hasPermission(permissionName));
};

const router = useRouter();

const props = defineProps({
  sideBarIsOpen: {
    type: Boolean,
    default: false,
  },
  supportUnreadCount: {
    type: Number,
    default: 0,
  },
});

const supportMenuUnreadCount = computed(() =>
  Math.max(Number(props.supportUnreadCount ?? 0), Number(adminNotificationsStore.unreadSupportNotificationsCount ?? 0))
);

const menuItems = computed(() => [
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
    title: t("admin.menu.withdrawalRequests"),
    to: localePath("/withdrawal-requests"),
    icon: UiIconProfile,
    displayIfHasPermission: "view-payments",
    notificationsCount: adminNotificationsStore.unreadWithdrawalRequestsCount,
  },
  {
    title: t("admin.menu.support"),
    to: localePath("/support"),
    icon: UiIconSupport,
    displayIfHasPermission: "view-support",
    notificationsCount: supportMenuUnreadCount.value,
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
    title: t("admin.menu.access"),
    to: localePath("/access"),
    icon: UiIconKeys,
    displayIfHasPermission: "view-access",
  },
  {
    title: t("admin.menu.news"),
    to: localePath("/news"),
    icon: UiIconNews,
    displayIfHasPermission: "view-news",
  },
]);

const menuList = computed(() => {
  return menuItems.value.filter((x) => hasPermission(x.displayIfHasPermission));
});

const showMenuSkeleton = computed(() => {
  return menuList.value.length === 0 && !store.isAuthInitialized;
});

// const handleClickMenuItem = (to: string) => {
//   router.push(to);
// };

const handleClickMenuItem = (to: string) => {
  router.push(to).catch((err) => {
    if (err.name !== "NavigationDuplicated") {
      console.error(err);
    }
  });
};
</script>

<style scoped lang="scss">
.nav {
  min-height: calc(100vh - 141px);
}

.nav-menu__placeholder {
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
  animation: header-sidebar-menu-skeleton 1.4s ease-in-out infinite;
}

@keyframes header-sidebar-menu-skeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
