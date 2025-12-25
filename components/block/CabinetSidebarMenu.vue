<template>
  <ul class="w-full p-3 lg:p-0 flex flex-row items-start justify-evenly gap-0 lg:flex-col lg:justify-start lg:gap-1">
    <CabinetSidebarMenuItem
      v-for="menuItem in menuItems"
      :key="menuItem.title"
      :title="menuItem.title"
      :to="menuItem.to"
      :icon="menuItem.icon"
      :sideBarIsOpen="sideBarIsOpen"
      @click="handleClickMenuItem" />

    <UiSpacer />

    <CabinetSidebarMenuItem
      v-for="menuItem in secondMenuItems"
      :key="menuItem.title"
      :title="menuItem.title"
      :to="menuItem.to"
      :icon="menuItem.icon"
      :sideBarIsOpen="sideBarIsOpen"
      :notificationsCount="menuItem.notificationsCount ?? null"
      @click="handleClickMenuItem" />
  </ul>
</template>

<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";

  import CabinetSidebarMenuItem from "~/components/block/CabinetSidebarMenuItem.vue";
  import UiIconHome from "~/components/ui/UiIconHome.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconReferral from "~/components/ui/UiIconReferral.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";
  import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";

  const { locale, t } = useI18n({ useScope: "global" });
  const addCurrentLocaleToPath = (path = "") => `/${locale.value}/${path}`;

  const router = useRouter();
  const sideBarIsOpen = ref(true);

  const menuItems = computed(() => [
    { title: t("cabinet.menu.dashboard"), to: addCurrentLocaleToPath("dashboard"), icon: UiIconHome },
    { title: t("cabinet.menu.billing"), to: addCurrentLocaleToPath("payments"), icon: UiIconPayment },
    {
      title: t("cabinet.menu.payment_details"),
      to: addCurrentLocaleToPath("payments/details"),
      icon: UiIconPaymentDetail,
    },
    { title: t("cabinet.menu.accounts"), to: addCurrentLocaleToPath("accounts"), icon: UiIconUser },
    { title: t("cabinet.menu.referral_system"), to: addCurrentLocaleToPath("referrals"), icon: UiIconReferral },
  ]);

  const secondMenuItems = computed(() => [
    {
      title: t("cabinet.menu.support"),
      to: addCurrentLocaleToPath("support"),
      icon: UiIconSupport,
      notificationsCount: 3,
    },
    { title: t("cabinet.menu.settings"), to: addCurrentLocaleToPath("profile"), icon: UiIconSetting },
  ]);

  const handleClickMenuItem = (to: string) => {
    router.push(to);
  };
</script>
