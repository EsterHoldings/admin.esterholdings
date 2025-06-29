<template>
  <ul class="side-bar-cabinet__menu">
    <TheHeaderSideBarMenuItem
        v-for="menuItem in menuItems"
        :title="menuItem.title"
        :to="menuItem.to"
        :icon="menuItem.icon"
        :sideBarIsOpen="sideBarIsOpen"
        :key="menuItem.title"
        @click="handleClickMenuItem"
    />
  </ul>
</template>

<script lang="ts" setup>
import TheHeaderSideBarMenuItem from "~/components/block/!!!TheHeaderSideBarMenuItem.vue";
import UiIconHome from "~/components/ui/UiIconHome.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconReferral from "~/components/ui/UiIconReferral.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconKeys from "~/components/ui/UiIconKeys.vue";

import {ref, computed} from "vue";
import {useRouter} from "vue-router";
import UiIconSupport from "~/components/ui/UiIconSupport.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";

import {useI18n} from "vue-i18n";

const {locale, t} = useI18n({useScope: "global"});
const localePath = useLocalePath();
const addCurrentLocaleToPath = (path = "") => {
  return `/${locale.value}/${path}`;
};

const router = useRouter();
const sideBarIsOpen = ref(true);

const menuItems = computed(() => {
  return [
    {
      title: t("admin.menu.dashboard"),
      to: localePath("/admin/dashboard"),
      icon: UiIconHome,
      displayIfHasPermission: "view-dashboard",
    },
    {
      title: t("admin.menu.clients"),
      to: localePath("/admin/clients"),
      icon: UiIconClients,
      displayIfHasPermission: "view-clients",
    },
    {
      title: t("admin.menu.accounts"),
      to: localePath("/admin/accounts"),
      icon: UiIconUser,
      displayIfHasPermission: "view-accounts",
    },
    {
      title: t("admin.menu.referral"),
      to: localePath("/admin/referral"),
      icon: UiIconReferral,
      displayIfHasPermission: "view-referrals",
    },
    {
      title: t("admin.menu.payments"),
      to: localePath("/admin/payments"),
      icon: UiIconProfile,
      displayIfHasPermission: "view-payments",
    },
    {
      title: t("admin.menu.settings"),
      to: localePath("/admin/settings"),
      icon: UiIconSetting,
      displayIfHasPermission: "view-settings",
    },
    {
      title: t("admin.menu.access"),
      to: localePath("/admin/access"),
      icon: UiIconKeys,
      displayIfHasPermission: "view-admins",
    },
  ];
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
}
</style>