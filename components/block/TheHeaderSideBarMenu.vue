<template>
  <nav class="nav">
    <ul class="nav-menu">
      <TheHeaderSideBarMenuItem
        v-for="menuItem in menuList"
        :title="menuItem.title"
        :to="menuItem.to"
        :icon="menuItem.icon"
        :sideBarIsOpen="sideBarIsOpen"
        :key="menuItem.title"
        @click="handleClickMenuItem"
        >{{ menuItem.icon }}
      </TheHeaderSideBarMenuItem>
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

const { t } = useI18n();
const localePath = useLocalePath();
const store = useAdminAuthStore();

const hasPermission = (required?: string | string[]) => {
  if (!required) return true;
  const list = Array.isArray(required) ? required : [required];

  return list.some(permissionName => store.hasPermission(permissionName));
};

const router = useRouter();

const props = defineProps({
  sideBarIsOpen: {
    type: Boolean,
    default: false,
  },
});

const menuItems = [
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
    title: t("admin.menu.payments"),
    to: localePath("/payments"),
    icon: UiIconProfile,
    displayIfHasPermission: "view-payments",
  },
  {
    title: t("admin.menu.support"),
    to: localePath("/support"),
    icon: UiIconSupport,
    displayIfHasPermission: "view-support",
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
    displayIfHasPermission: ["view-admins", "view-roles", "view-permissions"],
  },
  {
    title: t("admin.menu.news"),
    to: localePath("/news"),
    icon: UiIconNews,
    displayIfHasPermission: "view-news",
  },
];

const menuList = computed(() => {
  return menuItems.filter((x) => hasPermission(x.displayIfHasPermission));
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
</style>
