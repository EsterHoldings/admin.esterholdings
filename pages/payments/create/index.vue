<template>
  <UiContainer class="overflow-y-scroll">
    <div class="text-[var(--ui-text-main)] p-5">
      <div class="flex items-center gap-3 mb-5">
        <button
            v-if="isSelected"
            type="button"
            class="h-[34px] w-[34px] rounded-[10px] border border-[var(--color-stroke-ui-dark)] inline-flex items-center justify-center"
            @click="goBackToSelect"
            aria-label="Back"
        >
          <svg viewBox="0 0 24 24" class="h-[18px] w-[18px] text-[var(--ui-text-main)]" fill="none">
            <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
        </button>

        <UiTextH4 class="mb-0">Створити новий платіж</UiTextH4>
      </div>

      <div class="grid grid-cols-1 gap-5 items-start">
        <div>
          <UiTextH5 class="mb-5"># Вибір платіжного способу</UiTextH5>

          <component
              :is="componentIs.component"
              :paymentSystemsList="paymentSystemsForUi"
              :activePaymentSystemIndex="activePaymentSystemIndexForUi"
              @select="handleSelectPaymentSystem"
              :isLoading="paymentSystemsListIsLoading"
          />
        </div>

        <div>
          <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
          >
            <!-- wrapper ВАЖЛИВИЙ: гарантує 1 root для Transition -->
            <div v-if="isFormVisible && activePaymentSystem?.componentForm" key="payment-form">
              <component
                  :is="activePaymentSystem.componentForm"
                  :paymentSystem="paymentSystems.find(
                  ps => (ps.config_key ?? ps.componentForm?.config_key) === activePaymentSystem.cfgKey
                )"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import useAppCore from '~/composables/useAppCore'
import { definePageMeta } from '~/.nuxt/imports'
import { reactive, ref, computed, onMounted } from 'vue'

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
  cfgKey?: string
}>>([])

const tabActiveIndex = ref(0)
const paymentSystemsListIsLoading = ref(false)

const tabsList = reactive([
  { label: 'Поповнення', component: TabDeposit },
  { label: 'Виплата', component: TabWithdrawal },
])

const componentIs = computed(() => tabsList[tabActiveIndex.value])

const activePaymentSystemIndex = ref<number | null>(null)
const activePaymentSystem = computed(() => {
  if (activePaymentSystemIndex.value === null) return null
  return paymentSystems[activePaymentSystemIndex.value] || null
})

const isSelected = computed(() => activePaymentSystemIndex.value !== null)

const CARD_ANIM_MS = 260
const FORM_LEAVE_MS = 200

const isCollapsed = ref(false)

const paymentSystemsForUi = computed(() => {
  if (isCollapsed.value && activePaymentSystem.value) return [activePaymentSystem.value]
  return paymentSystems
})

const activePaymentSystemIndexForUi = computed(() => {
  if (activePaymentSystemIndex.value === null) return -1
  return isCollapsed.value ? 0 : activePaymentSystemIndex.value
})

const isFormVisible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const handleSelectPaymentSystem = (i: number) => {
  clearTimer()

  isFormVisible.value = false
  isCollapsed.value = false
  activePaymentSystemIndex.value = i

  requestAnimationFrame(() => {
    isCollapsed.value = true
  })

  timer = setTimeout(() => {
    isFormVisible.value = true
  }, CARD_ANIM_MS)
}

const goBackToSelect = () => {
  clearTimer()

  isFormVisible.value = false

  timer = setTimeout(() => {
    isCollapsed.value = false
    activePaymentSystemIndex.value = null
  }, FORM_LEAVE_MS)
}

onMounted(async () => {
  paymentSystemsListIsLoading.value = true
  const { data } = await appCore.paymentSystems.get()

  paymentSystems.splice(
      0,
      paymentSystems.length,
      ...data
          .filter((x: any) => x.isActive)
          .map((item: any) => {
            const cfg = Object.values(configMap).find(c => c.cfgKey === item.config_key) || ({} as any)
            return { ...item, ...cfg }
          })
  )

  paymentSystemsListIsLoading.value = false
})
</script>
