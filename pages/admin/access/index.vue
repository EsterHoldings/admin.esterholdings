<template>
  <div class="access-page">
    <div class="access-page__title">
      <div>
        <UiTextH4>{{ t("admin.access.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.access.index.subtitle") }}</UiTextParagraph>
      </div>

      <TabsDefault
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
      />
    </div>
    <div class="access-page__content">
      <transition name="slide-short" mode="out-in">
        <component
            class="access-page__tab-content"
            :is="tabsList[activeTabIndex].component"
            :key="activeTabIndex"
        />
      </transition>
      <!--      <div class="access-page__content__top">-->
      <!--        <div class="access-page__content__top__left">-->
      <!--          <RolesPanel />-->
      <!--        </div>-->
      <!--        <div class="access-page__content__top__right">-->
      <!--          <PermissionsPanel />-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <br />-->
      <!--      <div class="access-page__content__bottom">-->
      <!--        <AdminsPanel />-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";

import AdminsPanel from "~/pages/admin/access/components/AdminsPanel.vue";
import RolesPanel from "~/pages/admin/access/components/RolesPanel.vue";
import PermissionsPanel from "~/pages/admin/access/components/PermissionsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import {computed, ref} from "vue";
import TabAdmins from "~/pages/admin/access/components/TabAdmins.vue";
import TabRoles from "~/pages/admin/access/components/TabRoles.vue";
import TabPermissions from "~/pages/admin/access/components/TabPermissions.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});

const activeTabIndex = ref(0);

const tabsList = computed(() => {
  return [
    {
      label: "Admins",
      component: TabAdmins
    },
    {
      label: "Roles",
      component: TabRoles,
    },
    {
      label: "Permissions",
      component: TabPermissions,
    },
  ];
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style lang="scss" scoped>
.access {
  &-page {
    height: calc(100vh - 40px);
    width: 100%;
    padding: 20px;

    &__title {
      margin-bottom: 20px;
      color: var(--ui-text-main);
      display: flex;
      justify-content: space-between;
    }

    &__content {

      &__tab-content {
        background-color: red;
      }

      &__top {
        display: flex;
        justify-content: space-between;
        gap: 20px;

        @media (max-width: 1130px) {
          flex-direction: column;
        }

        &__left {
          width: 100%;
        }

        &__right {
          width: 100%;
        }
      }

      &__bottom {
        padding-bottom: 20px;
      }
    }
  }
}
</style>
