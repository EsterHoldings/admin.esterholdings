<template>
  <div class="client-page">
    <div class="client-page__title">
      <UiTextH4>{{ userData.first_name }} {{ userData.last_name }}</UiTextH4>
      <UiTextParagraph>{{ userData.email }}</UiTextParagraph>
    </div>
    <div class="client-page__content">
      <TabsDefault
          class="tabs"
          :tabsList="tabsList"
          @selectTab="handleActiveTab"
          :activeTabIndex="activeTabIndex"
      />
      <component
          :is="tabsList[activeTabIndex].component"
          :key="activeTabIndex"
          :clientId="clientId"
          :userData="userData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import useAppCore from "~/composables/useAppCore";
import {computed, onMounted, reactive, ref, watch} from "vue";
import {definePageMeta} from "~/.nuxt/imports";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";

import TabChangePassword from "~/pages/admin/clients/[id]/components/TabChangePassword.vue";
import TabKYC from "~/pages/admin/clients/[id]/components/TabKYC.vue";
import TabReferrals from "~/pages/admin/clients/[id]/components/TabReferrals.vue";
import TabVerification from "~/pages/admin/clients/[id]/components/TabVerification.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
const route = useRoute();
const router = useRouter();
const appCore = useAppCore();

const clientId = ref(route.params.id as string);


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
  updated_at: null,
});


const loadData = async () => {
  const resp = await appCore.adminModules.clients.getById(clientId.value);
  Object.assign(userData, resp.data.data);
};

const STORAGE_KEY = "profileActiveTab";
const tabsList = [
  { label: 'KYC', component: TabKYC },
  { label: 'Верификация', component: TabVerification },
  { label: 'Рефералы', component: TabReferrals },
  { label: 'Смена пароля', component: TabChangePassword },
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
  url.searchParams.set('tab', activeTabIndex.value.toString());
  window.history.replaceState(null, '', url.toString());
});

watch(activeTabIndex, (newIndex) => {
  localStorage.setItem(STORAGE_KEY, newIndex.toString());

  const url = new URL(window.location.href);
  url.searchParams.set('tab', newIndex.toString());
  window.history.replaceState(null, '', url.toString());
});

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

<style lang="scss" scoped>
.client {
  &-page {
    height: calc(100vh - 40px);
    width: 100%;
    padding: 20px;

    &__title {
      margin-bottom: 20px;
      color: var(--ui-text-main);
    }

    &__content {
      padding-bottom: 20px;

      .tabs {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
