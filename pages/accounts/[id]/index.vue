<template>

  <UiContainer>
    <div>
      <div class="mb-5 flex items-center justify-between">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.accounts.account.title") + ': ' + accountData.number }}
        </UiTextH4>
      </div>

      <PanelDefault>
        <div class="grid grid-cols-[240px_1fr]">
          <div class="border-r border-[var(--ui-primary-main)] p-5">
            <TabsAsList
                :tabsList="tabsList"
                @selectTab="handleActiveTab"
                :activeTabIndex="activeTabIndex"
            />
          </div>

          <div class="p-5">
            <transition
                enter-active-class="transition ease-linear duration-100"
                enter-from-class="opacity-0 translate-x-4"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition ease-linear duration-100"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-4"
                mode="out-in"
            >
              <component
                  :is="tabsList[activeTabIndex].component"
                  :id="id"
                  :type="accountData.type"
                  :number="accountData.number"
                  :balance="accountData.balance"
                  :key="activeTabIndex"
                  :isLoading="isLoading"
              />
            </transition>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import {computed, onMounted, ref} from "vue";
import TabGeneral from "~/pages/accounts/[id]/components/TabGeneral.vue";

import TabUserPhoto from "~/pages/profile/components/TabUserPhoto.vue";
import TabUserDocuments from "~/pages/profile/components/TabUserDocuments.vue";
import useAppCore from "~/composables/useAppCore";
import TabHistory from "~/pages/accounts/[id]/components/TabHistory.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";
import UiIconHistory from "~/components/ui/UiIconHistory.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });

const route = useRoute();

const appCore = useAppCore();

const activeTabIndex = ref(0);
const isLoading = ref(false);

const tabsList = computed(() => {
  return [
    {
      icon: UiIconUser,
      label: 'Карта счета',
      component: TabGeneral
    },
    {
      icon: UiIconHistory,
      label: 'История',
      component: TabHistory
    },
  ];
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};

const id = computed(() => String(route.params.id));

const tab = computed(() => {
  const q = route.query.tab;
  return Array.isArray(q) ? q[0] : (q ?? '1');
});

watch(() => route.query.tab, (t) => {
  // ...підвантажити дані, перемкнути вью тощо
});

const accountData = reactive({
  type: '',
  number: '',
  balance: 0,
});

const loadData = async () => {
  isLoading.value = true;
  const accountId = String(route.params.id);
  const response = await appCore.accounts.getById(accountId);
  accountData.type = response.data.data.account_type.name;
  accountData.balance = response.data.data.balance;
  accountData.number = response.data.data.number;
  isLoading.value = false;
}

onMounted(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped>
.icon-update {
  height: 14px;
  width: 14px;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    animation: wiggle 0.2s ease;
  }
}

.icon-update.spinning {
  animation: spin 0.5s linear;
}

.balance-sum {
  cursor: pointer;
}

.wiggle:hover {
  animation: wiggle 0.3s ease;
}

/* ========== KEYFRAMES ========== */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}

.accounts {
  &__title {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {

  }
}
</style>
