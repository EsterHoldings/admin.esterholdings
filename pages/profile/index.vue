<template>
  <UiContainer>
    <div>
      <div class="mb-5 flex items-center justify-between">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.profile.index.title") }}
        </UiTextH4>
      </div>

      <PanelDefault>
        <div class="grid grid-cols-[240px_1fr] max-lg:grid-cols-[70px_1fr]">
          <div class="border-r border-[var(--ui-primary-main)] p-5 max-lg:p-2">
            <TabsAsList
              :tabsList="tabsList"
              @selectTab="handleActiveTab"
              :activeTabIndex="activeTabIndex" />
          </div>

          <div>
            <Transition
              enter-active-class="transition ease-linear duration-100"
              enter-from-class="opacity-0 translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition ease-linear duration-100"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-4"
              mode="out-in">
              <div>
                <div
                  class="text-[--ui-text-main] h-[66px] w-full pl-5 pr-5 border-b border-solid border-[var(--ui-primary-main)] flex items-center justify-start">
                  {{ tabsList[activeTabIndex].label }}
                </div>
                <div class="p-5 overflow-y-scroll">
                  <component
                    :is="tabsList[activeTabIndex].component"
                    :key="activeTabIndex" />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref, onMounted, watch, computed } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";

  import TabGeneral from "~/pages/profile/components/TabGeneral.vue";
  import TabUserPhoto from "~/pages/profile/components/TabUserPhoto.vue";
  import TabUserDocuments from "~/pages/profile/components/TabUserDocuments.vue";
  import TabChangePassword from "~/pages/profile/components/TabChangePassword.vue";
  import TabUserVerification from "~/pages/profile/components/TabUserVerification.vue";

  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconImage from "~/components/ui/UiIconImage.vue";
  import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  const { t } = useI18n();

  const STORAGE_KEY = "profileActiveTab";
  const activeTabIndex = ref(0);

  const tabsList = computed(() => [
    {
      icon: UiIconSetting,
      label: t("cabinet.profile.index.tabs.general"),
      component: TabGeneral,
    },
    // {
    //   icon: UiIconImage,
    //   label: t("cabinet.profile.index.tabs.photo"),
    //   component: TabUserPhoto,
    // },
    {
      icon: UiIconDocuments,
      label: t("cabinet.profile.index.tabs.documents"),
      component: TabUserDocuments,
    },
    {
      icon: UiIconUser,
      label: t("cabinet.profile.index.tabs.verification"),
      component: TabUserVerification,
    },
    {
      icon: UiIconSetting,
      label: t("cabinet.profile.index.tabs.change_password"),
      component: TabChangePassword,
    },
  ]);

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null && !isNaN(+saved)) {
      activeTabIndex.value = +saved;
    }
  });

  watch(activeTabIndex, idx => {
    localStorage.setItem(STORAGE_KEY, idx.toString());
  });

  const handleActiveTab = (tabIndex: number) => {
    activeTabIndex.value = tabIndex;
  };
</script>
