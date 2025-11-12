<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="payment-create">-->
<!--      <UiTextH4 class="payment-create__title">Створити новий платіж</UiTextH4>-->
<!--      <div class="payment-create__content">-->

<!--        <PanelDefault class="payment-create__content__left">-->
<!--          <UiTextH5 class="payment-create__content__left_title">-->
<!--            # Вибір платіжного способу-->
<!--          </UiTextH5>-->

<!--          &lt;!&ndash;          <TabsDefault&ndash;&gt;-->
<!--          &lt;!&ndash;              class="payment-create__content__left_tabs"&ndash;&gt;-->
<!--          &lt;!&ndash;              :tabsList="tabsList"&ndash;&gt;-->
<!--          &lt;!&ndash;              :active-tab-index="tabActiveIndex"&ndash;&gt;-->
<!--          &lt;!&ndash;              @select-tab="handleSelectTab"&ndash;&gt;-->
<!--          &lt;!&ndash;          />&ndash;&gt;-->

<!--          <component-->
<!--              :is="componentIs.component"-->
<!--              :paymentSystemsList="paymentSystems"-->
<!--              :activePaymentSystemIndex="activePaymentSystemIndex"-->
<!--              @select="handleSelectPaymentSystem"-->
<!--              :isLoading="paymentSystemsListIsLoading"-->
<!--          />-->

<!--        </PanelDefault>-->

<!--        <PanelDefault class="payment-create__content__right">-->
<!--          <component-->
<!--              :is="activePaymentSystem.componentForm"-->
<!--              :paymentSystem="paymentSystems.find(-->
<!--                  ps => (ps.config_key ?? ps.componentForm?.config_key) === activePaymentSystem.cfgKey)"-->
<!--          />-->
<!--        </PanelDefault>-->

<!--      </div>-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import useAppCore from '~/composables/useAppCore'-->

<!--import {definePageMeta} from '~/.nuxt/imports'-->
<!--import {reactive, ref, computed, onMounted} from 'vue'-->

<!--import PanelDefault from '~/components/block/panels/PanelDefault.vue'-->
<!--import TabDeposit from '~/pages/payments/create/components/TabDeposit.vue'-->
<!--import TabDepositFormBTC from '~/pages/payments/create/components/TabDepositFormBTC.vue'-->
<!--import TabDepositFormUsdtErc20 from '~/pages/payments/create/components/TabDepositFormUsdtErc20.vue'-->
<!--import TabDepositFormUsdtTrc20 from '~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue'-->
<!--import TabWithdrawal from '~/pages/payments/create/components/TabWithdrawal.vue'-->
<!--import UiContainer from '~/components/ui/UiContainer.vue'-->
<!--import UiIconBTC from '~/components/ui/UiIconBTC.vue'-->
<!--import UiIconPayment from '~/components/ui/UiIconPayment.vue'-->
<!--import UiIconUsdtErc20 from '~/components/ui/UiIconUsdtErc20.vue'-->
<!--import UiIconUsdtTrc20 from '~/components/ui/UiIconUsdtTrc20.vue'-->
<!--import UiIconVisaAndMasterCard from '~/components/ui/UiIconVisaAndMasterCard.vue'-->
<!--import UiTextH4 from '~/components/ui/UiTextH4.vue'-->
<!--import UiTextH5 from '~/components/ui/UiTextH5.vue'-->
<!--import {-->
<!--  PAYMENT_SYSTEM_CONFIG_KEY_BTC,-->
<!--  PAYMENT_SYSTEM_CONFIG_KEY_ERC20,-->
<!--  PAYMENT_SYSTEM_CONFIG_KEY_TRC20,-->
<!--  PAYMENT_SYSTEM_CONFIG_KEY_VISA_MASTERCARD,-->
<!--  PAYMENT_SYSTEM_CONFIG_KEY_VISA_CUSTOM_PAYMENT-->
<!--} from "~/constants/paymentSystemsCfgKeys";-->

<!--definePageMeta({-->
<!--  layout: 'cabinet',-->
<!--  middleware: ['auth-client', 'client-check-auth'],-->
<!--})-->

<!--const appCore = useAppCore()-->

<!--const configMap = reactive<Record<string, {-->
<!--  cfgKey: string-->
<!--  name: string-->
<!--  icon: any-->
<!--  componentForm: any-->
<!--}>>({-->
<!--  trc20: {-->
<!--    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_TRC20,-->
<!--    name: 'USDT TRC-20',-->
<!--    icon: UiIconUsdtTrc20,-->
<!--    componentForm: TabDepositFormUsdtTrc20,-->
<!--  },-->
<!--  erc20: {-->
<!--    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_ERC20,-->
<!--    name: 'USDT ERC-20',-->
<!--    icon: UiIconUsdtErc20,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--  btc: {-->
<!--    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_BTC,-->
<!--    name: 'BTC',-->
<!--    icon: UiIconBTC,-->
<!--    componentForm: TabDepositFormBTC,-->
<!--  },-->
<!--  visa_mastercard: {-->
<!--    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_VISA_MASTERCARD,-->
<!--    name: 'Visa / MasterCard',-->
<!--    icon: UiIconVisaAndMasterCard,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--  custom_payment: {-->
<!--    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_VISA_CUSTOM_PAYMENT,-->
<!--    name: 'Custom Payment',-->
<!--    icon: UiIconPayment,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--})-->

<!--const paymentSystems = reactive<Array<{-->
<!--  id: string-->
<!--  name: string-->
<!--  config_key: string-->
<!--  isActive: boolean-->
<!--  created_at: string-->
<!--  updated_at: string-->
<!--  icon: any-->
<!--  componentForm: any-->
<!--}>>([])-->

<!--const activePaymentSystemIndex = ref(0)-->
<!--const tabActiveIndex = ref(0)-->
<!--const paymentSystemsListIsLoading = ref(false)-->

<!--const tabsList = reactive([-->
<!--  {label: 'Поповнення', component: TabDeposit},-->
<!--  {label: 'Виплата', component: TabWithdrawal},-->
<!--])-->

<!--const componentIs = computed(() => tabsList[tabActiveIndex.value])-->
<!--const activePaymentSystem = computed(-->
<!--    () => paymentSystems[activePaymentSystemIndex.value] || {}-->
<!--)-->

<!--function handleSelectTab(i: number) {-->
<!--  tabActiveIndex.value = i-->
<!--}-->

<!--const handleSelectPaymentSystem = (i: number) => activePaymentSystemIndex.value = i;-->

<!--onMounted(async () => {-->
<!--  paymentSystemsListIsLoading.value = true;-->
<!--  const {data} = await appCore.paymentSystems.get();-->

<!--  paymentSystems.splice(0, paymentSystems.length, ...data-->
<!--      .filter(x => x.isActive)-->
<!--      .map(item => {-->
<!--        const cfg = Object.values(configMap).find(c => c.cfgKey === item.config_key) || {};-->
<!--        return { ...item, ...cfg };-->
<!--      })-->
<!--  );-->

<!--  paymentSystemsListIsLoading.value = false;-->
<!--});-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.payment-create {-->
<!--  color: var(&#45;&#45;ui-text-main);-->

<!--  &__title {-->
<!--    margin-bottom: 20px;-->
<!--  }-->

<!--  &__content {-->
<!--    display: flex;-->
<!--    gap: 20px;-->
<!--    justify-content: space-between;-->

<!--    &__left,-->
<!--    &__right {-->
<!--      padding: 20px;-->
<!--      width: 50%;-->
<!--    }-->

<!--    &__left_title,-->
<!--    &__right_title {-->
<!--      margin-bottom: 20px;-->
<!--    }-->

<!--    &__left_tabs {-->
<!--      justify-content: flex-end;-->
<!--      margin-bottom: 20px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->

<template>
  <UiContainer>
    <div class="text-[var(--ui-text-main)]">
      <!-- Title -->
      <UiTextH4 class="mb-5">Створити новий платіж</UiTextH4>

      <!-- Content -->
      <div
          class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
      >
        <!-- Left -->
        <PanelDefault class="p-5">
          <UiTextH5 class="mb-5"># Вибір платіжного способу</UiTextH5>

          <!-- Якщо знадобиться повернути таби — просто розкоментуй TabsDefault -->
          <!--
          <TabsDefault
            class="mb-5 justify-end"
            :tabsList="tabsList"
            :active-tab-index="tabActiveIndex"
            @select-tab="handleSelectTab"
          />
          -->

          <component
              :is="componentIs.component"
              :paymentSystemsList="paymentSystems"
              :activePaymentSystemIndex="activePaymentSystemIndex"
              @select="handleSelectPaymentSystem"
              :isLoading="paymentSystemsListIsLoading"
          />
        </PanelDefault>

        <!-- Right -->
        <PanelDefault class="p-5">
          <component
              :is="activePaymentSystem.componentForm"
              :paymentSystem="paymentSystems.find(
              ps => (ps.config_key ?? ps.componentForm?.config_key) === activePaymentSystem.cfgKey
            )"
          />
        </PanelDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import useAppCore from '~/composables/useAppCore'
import { definePageMeta } from '~/.nuxt/imports'
import { reactive, ref, computed, onMounted } from 'vue'

import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import TabDeposit from '~/pages/payments/create/components/TabDeposit.vue'
import TabDepositFormBTC from '~/pages/payments/create/components/TabDepositFormBTC.vue'
import TabDepositFormUsdtErc20 from '~/pages/payments/create/components/TabDepositFormUsdtErc20.vue'
import TabDepositFormUsdtTrc20 from '~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue'
import TabWithdrawal from '~/pages/payments/create/components/TabWithdrawal.vue'
import UiContainer from '~/components/ui/UiContainer.vue'
import UiIconBTC from '~/components/ui/UiIconBTC.vue'
import UiIconPayment from '~/components/ui/UiIconPayment.vue'
import UiIconUsdtErc20 from '~/components/ui/UiIconUsdtErc20.vue'
import UiIconUsdtTrc20 from '~/components/ui/UiIconUsdtTrc20.vue'
import UiIconVisaAndMasterCard from '~/components/ui/UiIconVisaAndMasterCard.vue'
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import UiTextH5 from '~/components/ui/UiTextH5.vue'

import {
  PAYMENT_SYSTEM_CONFIG_KEY_BTC,
  PAYMENT_SYSTEM_CONFIG_KEY_ERC20,
  PAYMENT_SYSTEM_CONFIG_KEY_TRC20,
  PAYMENT_SYSTEM_CONFIG_KEY_VISA_MASTERCARD,
  PAYMENT_SYSTEM_CONFIG_KEY_VISA_CUSTOM_PAYMENT
} from '~/constants/paymentSystemsCfgKeys'

definePageMeta({
  layout: 'cabinet',
  middleware: ['auth-client', 'client-check-auth'],
})

const appCore = useAppCore()

const configMap = reactive<Record<string, {
  cfgKey: string
  name: string
  icon: any
  componentForm: any
}>>({
  trc20: {
    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_TRC20,
    name: 'USDT TRC-20',
    icon: UiIconUsdtTrc20,
    componentForm: TabDepositFormUsdtTrc20,
  },
  erc20: {
    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_ERC20,
    name: 'USDT ERC-20',
    icon: UiIconUsdtErc20,
    componentForm: TabDepositFormUsdtErc20,
  },
  btc: {
    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_BTC,
    name: 'BTC',
    icon: UiIconBTC,
    componentForm: TabDepositFormBTC,
  },
  visa_mastercard: {
    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_VISA_MASTERCARD,
    name: 'Visa / MasterCard',
    icon: UiIconVisaAndMasterCard,
    componentForm: TabDepositFormUsdtErc20,
  },
  custom_payment: {
    cfgKey: PAYMENT_SYSTEM_CONFIG_KEY_VISA_CUSTOM_PAYMENT,
    name: 'Custom Payment',
    icon: UiIconPayment,
    componentForm: TabDepositFormUsdtErc20,
  },
})

const paymentSystems = reactive<Array<{
  id: string
  name: string
  config_key: string
  isActive: boolean
  created_at: string
  updated_at: string
  icon: any
  componentForm: any
}>>([])

const activePaymentSystemIndex = ref(0)
const tabActiveIndex = ref(0)
const paymentSystemsListIsLoading = ref(false)

const tabsList = reactive([
  { label: 'Поповнення', component: TabDeposit },
  { label: 'Виплата', component: TabWithdrawal },
])

const componentIs = computed(() => tabsList[tabActiveIndex.value])
const activePaymentSystem = computed(
    () => paymentSystems[activePaymentSystemIndex.value] || {}
)

function handleSelectTab(i: number) {
  tabActiveIndex.value = i
}

const handleSelectPaymentSystem = (i: number) => {
  activePaymentSystemIndex.value = i
}

onMounted(async () => {
  paymentSystemsListIsLoading.value = true
  const { data } = await appCore.paymentSystems.get()

  paymentSystems.splice(
      0,
      paymentSystems.length,
      ...data
          .filter(x => x.isActive)
          .map(item => {
            const cfg = Object.values(configMap).find(c => c.cfgKey === item.config_key) || {}
            return { ...item, ...cfg }
          })
  )

  paymentSystemsListIsLoading.value = false
})
</script>

<!-- Tailwind використовується у класах; окремий <style> не потрібен -->
