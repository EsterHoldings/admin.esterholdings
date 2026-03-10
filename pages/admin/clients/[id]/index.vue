<template>
  <UiContainer>
    <div>
      <div class="mb-5">
        <UiTextH4 class="text-[var(--ui-text-main)]"> {{ userData.first_name }} {{ userData.last_name }} </UiTextH4>
        <UiTextParagraph class="text-[var(--ui-text-secondary)]">{{ userData.email }}</UiTextParagraph>
        <div class="mt-3 flex items-center gap-3 text-[var(--ui-text-main)]">
          <UiTextParagraph class="!text-[var(--ui-text-secondary)]">
            {{ t("clients.supportMode.label") }}
          </UiTextParagraph>
          <UiSwitchToggle
            :modelValue="fullSupportEnabled"
            @change="handleSupportModeToggle" />
          <UiTextParagraph>
            {{ fullSupportEnabled ? t("clients.supportMode.full") : t("clients.supportMode.simple") }}
          </UiTextParagraph>
          <UiIconSpinnerDefault
            v-if="supportModeUpdating"
            class="h-4 w-4 text-[var(--ui-text-main)]" />
        </div>
      </div>

      <PanelDefault>
        <div class="flex flex-row max-lg:flex-col">
          <div
            class="w-[240px] max-lg:w-full border-r max-lg:border-r-0 max-lg:border-b border-[var(--ui-primary-main)] p-2 max-lg:p-2">
            <TabsAsList
              :tabsList="tabsList"
              @selectTab="handleActiveTab"
              :activeTabIndex="activeTabIndex" />
          </div>

          <div class="flex-1 min-w-0">
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
                <div class="p-5 overflow-y-auto overflow-x-hidden">
                  <component
                    :is="tabsList[activeTabIndex].component"
                    :key="activeTabIndex"
                    :clientId="clientId"
                    :userData="userData" />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import useAppCore from "~/composables/useAppCore";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { useRoute } from "vue-router";

  import TabChangePassword from "~/pages/admin/clients/[id]/components/TabChangePassword.vue";
  import TabKYC from "~/pages/admin/clients/[id]/components/TabKYC.vue";
  import TabReferrals from "~/pages/admin/clients/[id]/components/TabReferrals.vue";
  import TabVerification from "~/pages/admin/clients/[id]/components/TabVerification.vue";
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const route = useRoute();
  const appCore = useAppCore();

  const clientId = ref(route.params.id as string);
  const supportModeUpdating = ref(false);

  let userData = reactive({
    address: null,
    birthdate: null,
    city: null,
    country: null,
    created_at: null,
    email: null,
    email_verified_at: null,
    first_name: null,
    id: null,
    last_name: null,
    mid_name: null,
    phone: null,
    photo_path: null,
    photo_url: null,
    postal_code: null,
    state: null,
    support_mode: "simple",
    updated_at: null,
  });

  const fullSupportEnabled = computed(() => String(userData.support_mode ?? "simple") === "full");

  const loadData = async () => {
    const resp = await appCore.adminModules.clients.getById(clientId.value);
    Object.assign(userData, resp.data.data);
  };

  const handleSupportModeToggle = async (enabled: boolean) => {
    if (supportModeUpdating.value) return;

    const nextMode = enabled ? "full" : "simple";
    const currentMode = String(userData.support_mode ?? "simple");
    if (nextMode === currentMode) return;

    supportModeUpdating.value = true;
    const previousMode = currentMode;
    userData.support_mode = nextMode;

    try {
      await appCore.adminModules.clients.patchSupportMode(clientId.value, {
        support_mode: nextMode,
      });
      toast.success(t("clients.supportMode.updated"));
    } catch (error) {
      userData.support_mode = previousMode;
      toast.error(t("clients.supportMode.updateFailed"));
      console.error("Failed to update support mode", error);
    } finally {
      supportModeUpdating.value = false;
    }
  };

  const STORAGE_KEY = "profileActiveTab";
  const tabsList = [
    { label: "KYC", component: TabKYC },
    { label: "Верификация", component: TabVerification },
    { label: "Рефералы", component: TabReferrals },
    { label: "Смена пароля", component: TabChangePassword },
  ];

  const activeTabIndex = ref(0);

  // При монтуванні – читаємо ?tab і записуємо в activeTabIndex
  onMounted(async () => {
    await loadData();

    const q = Number(route.query.tab);
    if (!isNaN(q) && q >= 0 && q < tabsList.length) {
      activeTabIndex.value = q;
    } else {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (!isNaN(saved) && saved >= 0 && saved < tabsList.length) {
        activeTabIndex.value = saved;
      }
    }

    // Ініціально в URL зробимо ?tab=…
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTabIndex.value.toString());
    window.history.replaceState(null, "", url.toString());
  });

  watch(activeTabIndex, newIndex => {
    localStorage.setItem(STORAGE_KEY, newIndex.toString());

    const url = new URL(window.location.href);
    url.searchParams.set("tab", newIndex.toString());
    window.history.replaceState(null, "", url.toString());
  });

  watch(
    () => route.query.tab,
    nextTab => {
      const q = Number(nextTab);
      if (!isNaN(q) && q >= 0 && q < tabsList.length && q !== activeTabIndex.value) {
        activeTabIndex.value = q;
      }
    }
  );

  const handleActiveTab = (i: number) => {
    activeTabIndex.value = i;
  };
</script>

<!--<script lang="ts" setup>-->
<!--import useAppCore from "~/composables/useAppCore";-->
<!--import {computed, onMounted, reactive, ref, watch} from "vue";-->
<!--import {definePageMeta} from "~/.nuxt/imports";-->
<!--import {useI18n} from "vue-i18n";-->
<!--import {useRoute} from 'vue-router'-->

<!--import TabChangePassword from "~/pages/admin/clients/[id]/components/TabChangePassword.vue";-->
<!--import TabKYC from "~/pages/admin/clients/[id]/components/TabKYC.vue";-->
<!--import TabReferrals from "~/pages/admin/clients/[id]/components/TabReferrals.vue";-->
<!--import TabVerification from "~/pages/admin/clients/[id]/components/TabVerification.vue";-->
<!--import TabsDefault from "~/components/block/tabs/TabsDefault.vue";-->
<!--import UiTextH4 from "~/components/ui/UiTextH4.vue";-->
<!--import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";-->

<!--definePageMeta({-->
<!--  middleware: ["admin-middleware"],-->
<!--});-->

<!--const {t} = useI18n({useScope: "global"});-->
<!--const route = useRoute()-->
<!--const appCore = useAppCore()-->

<!--const clientId = ref(route.params.id as string);-->

<!--let userData = reactive({-->
<!--  address: null,-->
<!--  birthdate: null,-->
<!--  city: null,-->
<!--  country: null,-->
<!--  created_at: null,-->
<!--  email: null,-->
<!--  email_verified_at: null,-->
<!--  first_name: null,-->
<!--  id: null,-->
<!--  last_name: null,-->
<!--  mid_name: null,-->
<!--  phone: null,-->
<!--  photo_path: null,-->
<!--  photo_url: null,-->
<!--  postal_code: null,-->
<!--  state: null,-->
<!--  updated_at: null,-->
<!--})-->

<!--const loadData = async () => {-->
<!--  const response = await appCore.adminModules.clients.getById(clientId.value);-->
<!--  const data = response.data.data;-->
<!--  const result = {...userData, ...data};-->
<!--  Object.assign(userData, result);-->
<!--}-->

<!--onMounted(async () => {-->
<!--  const saved = localStorage.getItem(STORAGE_KEY);-->
<!--  if (saved !== null && !isNaN(+saved)) {-->
<!--    activeTabIndex.value = +saved;-->
<!--  }-->
<!--  // -&#45;&#45;-->
<!--  await loadData();-->
<!--})-->

<!--// -&#45;&#45;-->

<!--const STORAGE_KEY = "profileActiveTab";-->
<!--const activeTabIndex = ref(0);-->

<!--const tabsList = computed(() => {-->
<!--  return [-->
<!--    {-->
<!--      label: 'KYC',-->
<!--      component: TabKYC,-->
<!--    },-->
<!--    {-->
<!--      label: 'Верификация',-->
<!--      component: TabVerification,-->
<!--    },-->
<!--    {-->
<!--      label: 'Рефералы',-->
<!--      component: TabReferrals,-->
<!--    },-->
<!--    {-->
<!--      label: 'Смена пароля',-->
<!--      component: TabChangePassword,-->
<!--    },-->
<!--  ];-->
<!--});-->

<!--const currentTab = computed(() => tabsList.value[activeTabIndex.value]);-->

<!--watch(activeTabIndex, (newIndex) => {-->
<!--  localStorage.setItem(STORAGE_KEY, newIndex.toString());-->
<!--});-->

<!--const handleActiveTab = (tabIndex: number) => {-->
<!--  activeTabIndex.value = tabIndex;-->
<!--};-->

<!--</script>-->

<style lang="scss" scoped></style>
