<template>
  <ul class="side-bar-cabinet__menu">
    <TheCabinetSideBarMenuItem
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
import TheCabinetSideBarMenuItem from "~/components/block/TheCabinetSideBarMenuItem.vue";
import UiIconHome from "~/components/ui/UiIconHome.vue";
import UiIconClients from "~/components/ui/UiIconClients.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconReferral from "~/components/ui/UiIconReferral.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconKeys from "~/components/ui/UiIconKeys.vue";

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import UiIconSupport from "~/components/ui/UiIconSupport.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";

import { useI18n } from "vue-i18n";

const { locale, t } = useI18n({ useScope: "global" });
const addCurrentLocaleToPath = (path = "") => {
  return `/${locale.value}/${path}`;
};

const router = useRouter();
const sideBarIsOpen = ref(true);

const menuItems = computed(() => [
  {
    title: t("cabinet.menu.dashboard"),
    to: addCurrentLocaleToPath("dashboard"),
    icon: UiIconHome,
  },
  {
    title: 'Deposit',
    to: addCurrentLocaleToPath("payments"),
    icon: UiIconPayment,
  },
  {
    title: t("cabinet.menu.payment_details"),
    to: addCurrentLocaleToPath("payments/details"),
    icon: UiIconClients,
  },
  {
    title: t("cabinet.menu.accounts"),
    to: addCurrentLocaleToPath("accounts"),
    icon: UiIconUser,
  },
  {
    title: t("cabinet.menu.referral_system"),
    to: addCurrentLocaleToPath("referrals"),
    icon: UiIconReferral,
  },
  // {
  //   title: t("cabinet.menu.settings"),
  //   to: addCurrentLocaleToPath("settings"),
  //   icon: UiIconSetting,
  // },
  {
    title: t("cabinet.menu.support"),
    to: addCurrentLocaleToPath("support"),
    icon: UiIconSupport,
  },
]);

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
