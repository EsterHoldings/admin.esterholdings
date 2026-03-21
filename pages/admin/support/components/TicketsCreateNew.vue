<template>
  <div class="accounts__edit">
    <div class="accounts__edit__top" v-if="props.title">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
        class="accounts__edit__content"
        :class="{ 'without-top': !props.title }"
    >
      <div class="accounts__edit__content__fields">
        <UiFormControl
            :label="'Название (Тема)'"
            :errors="validatorTicketForm?.errorsFormData?.subject?.errors"
        >
          <UiInput
              type="text"
              :placeholder="'Например: Проблемы с пополнением'"
              :value="formData.subject"
              :isDirty="validatorTicketForm?.errorsFormData?.subject?.isDirty"
              :isInvalid="validatorTicketForm?.errorsFormData?.subject?.errors?.length > 0"
              @blur="validatorTicketForm?.doValidateField('subject',$event.target.value)"
              @input="validatorTicketForm?.doValidateField('subject',$event.target.value)"
          />
        </UiFormControl>

        <UiFormControl
            :label="'Текст заявки'"
            :errors="validatorTicketForm?.errorsFormData?.message?.errors"
        >
          <UiTextarea
              class="!h-[calc(100vh_-_350px)] w-full"
              type="text"
              :placeholder="'Суть вашей проблемы, например: У меня не получается пополнить счет <номер счета>, я пытаюсь пополнить через <платежный метод, например: USDT-TRC20>'"
              :value="formData.message"
              :isDirty="validatorTicketForm?.errorsFormData?.message?.isDirty"
              :isInvalid="validatorTicketForm?.errorsFormData?.message?.errors?.length > 0"
              @blur="validatorTicketForm?.doValidateField('message',$event.target.value)"
              @input="validatorTicketForm?.doValidateField('message',$event.target.value)"
          />
        </UiFormControl>
      </div>
    </div>
  </div>

  <div class="accounts__edit__bottom">
    <UiButtonDefault
        class="accounts__edit__bottom__save-btn"
        state="secondary"
        :disabled="isLoading || !canCreateSupport"
        @click="handleSubmitForm"
    >
      <span v-if="!isLoading">{{ 'Создать новую заявку' }}</span>
      <UiIconSpinnerDefault v-if="isLoading"/>
    </UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import { validatorTicketForm, validateTicketForm } from "~/pages/admin/support/composables/validation";
import {formData} from "~/pages/admin/support/composables";
import {computed, reactive, inject, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const isLoading = ref(false);
const {t} = useI18n({useScope: "global"});
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const toast = useToast();
let accountTypes = reactive([]);

const app = useAppCore();
const adminAuthStore = useAdminAuthStore();
const canCreateSupport = computed(
  () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-support")
);

const {closeModal} = inject("modalControl") as { closeModal: Function };

const getAccountTypes = async () => {
  const response = await app.accountTypes.get({perPage: 20});
  accountTypes.splice(0, accountTypes.length,
      ...response.data.data.data.map(({id, name}) => ({
        id: String(id),
        value: String(id),
        text: String(name),
      }))
  );
};

const handleSubmitForm = async () => {
  if (!canCreateSupport.value) {
    return;
  }

  validateTicketForm(async () => {
    try {
      isLoading.value = true;
      await app.adminModules.tickets.post(formData);
      closeModal();
      useEventBus.emit("loadDataForSupport");
      toast.success('Тикет успешно создан!');
    } catch (errorResponse) {
      console.log("handleSubmitForm -> errorResponse", errorResponse);
    } finally {
      isLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getAccountTypes();
});
</script>

<style lang="scss" scoped>
.accounts__edit {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid var(--color-stroke-ui-dark);
  }

  &__content {
    height: calc(100vh - 120px);

    &.without-top {
      height: calc(100vh - 50px);
    }

    &__fields {
      padding: 40px;

      .ui-form-control {
        margin-bottom: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  &__bottom {
    height: 70px;

    padding-left: 40px;
    padding-right: 40px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-top: 1px solid var(--color-stroke-ui-dark);

    .btn {
      height: 40px;
    }
  }
}
</style>
