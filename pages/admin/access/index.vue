<template>
  <div class="access-page">
    <div class="access-page__title">
      <div>
        <UiTextH4>{{ t("admin.access.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.access.index.subtitle") }}</UiTextParagraph>
      </div>

      <TabsDefault
          v-if="tabsList.length > 0"
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
      />
    </div>
    <div class="access-page__content">
      <transition name="slide-short" mode="out-in">
        <component
            v-if="activeTabComponent"
            class="access-page__tab-content"
            :is="activeTabComponent"
            :key="activeTabIndex"
        />
      </transition>
      <div v-if="tabsList.length === 0" class="access-page__empty-state">
        {{ t("admin.access.index.empty", "No access to any section of this page.") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import {computed, ref, watch} from "vue";
import TabAdmins from "~/pages/admin/access/components/TabAdmins.vue";
import TabRoles from "~/pages/admin/access/components/TabRoles.vue";
import TabPermissions from "~/pages/admin/access/components/TabPermissions.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
const adminAuthStore = useAdminAuthStore();

const activeTabIndex = ref(0);
const canViewAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-admins"));
const canViewRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-roles"));
const canViewPermissions = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-permissions"));

const tabsList = computed(() => {
  return [
    canViewAdmins.value
      ? {
          label: "Admins",
          component: TabAdmins,
        }
      : null,
    canViewRoles.value
      ? {
          label: "Roles",
          component: TabRoles,
        }
      : null,
    canViewPermissions.value
      ? {
          label: "Permissions",
          component: TabPermissions,
        }
      : null,
  ].filter(Boolean);
});

const activeTabComponent = computed(() => tabsList.value[activeTabIndex.value]?.component ?? null);

watch(
  tabsList,
  (tabs) => {
    if (tabs.length === 0) {
      activeTabIndex.value = 0;
      return;
    }

    if (activeTabIndex.value > tabs.length - 1) {
      activeTabIndex.value = 0;
    }
  },
  { immediate: true }
);

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

    &__empty-state {
      color: var(--ui-text-secondary);
      padding: 20px 0;
    }
  }
}
</style>
