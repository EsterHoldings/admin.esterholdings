<template>
  <UiContainer>
    <div class="profile">
      <div class="profile__title">
        <!-- <UiTextH4>Profile</UiTextH4> -->

        <UiTextH4>{{ t("cabinet.profile.index.title") }}</UiTextH4>
        <TabsDefault
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
        />
      </div>
      <transition name="slide-short" mode="out-in">
        <component
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex"
        />
      </transition>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { reactive, ref, onMounted, watch, computed } from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import TabGeneral from "~/pages/profile/components/TabGeneral.vue";
import TabUserPhoto from "~/pages/profile/components/TabUserPhoto.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import TabUserDocuments from "~/pages/profile/components/TabUserDocuments.vue";
import TabChangePassword from "~/pages/profile/components/TabChangePassword.vue";
import TabUserVerification from "~/pages/profile/components/TabUserVerification.vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client"],
});
const { t } = useI18n();

const STORAGE_KEY = "profileActiveTab";
const activeTabIndex = ref(0);

// const tabsList = reactive([
//   { label: "General", component: TabGeneral },
//   { label: "User photo", component: TabUserPhoto },
//   { label: "Documents", component: TabUserDocuments },
//   { label: "Verification", component: TabUserPhoto },
//   { label: "Change password", component: TabChangePassword },
// ]);

const tabsList = computed(() => {
  return [
    { label: t("cabinet.profile.index.tabs.general"), component: TabGeneral },
    { label: t("cabinet.profile.index.tabs.photo"), component: TabUserPhoto },
    {
      label: t("cabinet.profile.index.tabs.documents"),
      component: TabUserDocuments,
    },
    {
      label: t("cabinet.profile.index.tabs.verification"),
      component: TabUserVerification,
    },
    {
      label: t("cabinet.profile.index.tabs.change_password"),
      component: TabChangePassword,
    },
  ];
});

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null && !isNaN(+saved)) {
    activeTabIndex.value = +saved;
  }
});

watch(activeTabIndex, (newIndex) => {
  localStorage.setItem(STORAGE_KEY, newIndex.toString());
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style lang="scss" scoped>
.profile {
  padding-bottom: 40px;

  &__title {
    margin-bottom: 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.slide-short-enter-active,
.slide-short-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.slide-short-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-short-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-short-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>