<template>
  <UiContainer>
    <div class="payment-create">
      <UiTextH4 class="payment-create__title">Создать новый платеж</UiTextH4>
      <div class="payment-create__content">

        <PanelDefault class="payment-create__content__left">
          <UiTextH5 class="payment-create__content__left_title"># Выбор платежного способа</UiTextH5>
          <TabsDefault
              class="payment-create__content__left_tabs"
              :tabsList="tabsList"
              :active-tab-index="tabActiveIndex"
              @select-tab="handleSelectTab"
          />
<!--          <transition name="slide-short" mode="out-in">-->
            <component
                :is="tabsList[tabActiveIndex].component"
                :key="tabsList[tabActiveIndex].label"
            />
<!--          </transition>-->
        </PanelDefault>

        <PanelDefault class="payment-create__content__right">
          <UiTextH5 class="payment-create__content__right_title">Форма оплаты</UiTextH5>
          <div>
            ...
          </div>
        </PanelDefault>

      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import {reactive, ref} from "vue";
import {definePageMeta} from "~/.nuxt/imports";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import TabDeposit from "~/pages/payments/create/components/TabDeposit.vue";
import TabWithdrawal from "~/pages/payments/create/components/TabWithdrawal.vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client"],
});

const tabActiveIndex = ref(0);
const tabsList = reactive([
  {
    label: 'Пополнение',
    component: TabDeposit
  },
  {
    label: 'Выплата',
    component: TabWithdrawal
  },
]);

const handleSelectTab = (index: number) => {
  console.log('dcwdcwdcwc', index)
  tabActiveIndex.value = index;
}
</script>

<style lang="scss" scoped>
.payment-create {

  color: var(--ui-text-main);

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    gap: 20px;

    &__left {
      padding: 20px;
      width: 50%;

      &_title {
        margin-bottom: 20px;
      }

      &_tabs {
        justify-content: flex-end;
      }
    }

    &__right {
      padding: 20px;
      width: 50%;

      &_title {
        margin-bottom: 20px;
      }
    }
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
