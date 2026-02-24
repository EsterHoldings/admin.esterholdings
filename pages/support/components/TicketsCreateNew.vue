<template>
  <div class="accounts__edit">
    <div
      v-if="props.title"
      class="accounts__edit__top">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
      class="accounts__edit__content"
      :class="{ 'without-top': !props.title }">
      <div class="accounts__edit__content__fields">
        <UiFormControl
          :label="t('support.tickets.subjectLabel')"
          :errors="validatorTicketForm?.errorsFormData?.subject?.errors">
          <UiInput
            type="text"
            :placeholder="t('support.tickets.subjectPlaceholder')"
            :value="formData.subject"
            :isDirty="validatorTicketForm?.errorsFormData?.subject?.isDirty"
            :isInvalid="validatorTicketForm?.errorsFormData?.subject?.errors?.length > 0"
            @blur="validatorTicketForm?.doValidateField('subject', $event.target.value)"
            @input="validatorTicketForm?.doValidateField('subject', $event.target.value)" />
        </UiFormControl>

        <UiFormControl
          :label="t('support.tickets.messageLabel')"
          :errors="validatorTicketForm?.errorsFormData?.message?.errors">
          <UiTextarea
            class="accounts__edit__message-field w-full"
            type="text"
            :placeholder="t('support.tickets.messagePlaceholder')"
            :value="formData.message"
            :isDirty="validatorTicketForm?.errorsFormData?.message?.isDirty"
            :isInvalid="validatorTicketForm?.errorsFormData?.message?.errors?.length > 0"
            @blur="validatorTicketForm?.doValidateField('message', $event.target.value)"
            @input="validatorTicketForm?.doValidateField('message', $event.target.value)" />
        </UiFormControl>

        <div class="accounts__edit__actions">
          <UiButtonDefault
            class="accounts__edit__save-btn"
            state="info"
            @click="handleSubmitForm">
            <span v-if="!isLoading">{{ t("support.tickets.createButton") }}</span>
            <UiIconSpinnerDefault v-if="isLoading" />
          </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { formData } from "~/pages/support/composables";
  import { validateTicketForm, validatorTicketForm } from "~/pages/support/composables/validation";

  const isLoading = ref(false);
  const { t } = useI18n({ useScope: "global" });
  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
  });

  const toast = useToast();
  const app = useAppCore();
  const { closeModal } = inject("modalControl") as { closeModal: Function };

  const handleSubmitForm = async () => {
    validateTicketForm(async () => {
      try {
        isLoading.value = true;
        await app.tickets.post(formData);
        closeModal();
        useEventBus.emit("loadDataForSupport");
        toast.success(t("support.tickets.createdSuccess"));
      } catch (errorResponse) {
        console.log("handleSubmitForm -> errorResponse", errorResponse);
      } finally {
        isLoading.value = false;
      }
    });
  };
</script>

<style lang="scss" scoped>
  .accounts__edit {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;

    &__top {
      min-height: 50px;
      padding-left: 40px;
      padding-right: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: 1px solid var(--color-stroke-ui-dark);
    }

    &__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      &.without-top {
        border-top: none;
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

    &__message-field {
      min-height: 220px;
    }

    &__actions {
      margin-top: 24px;
      padding-bottom: max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px));
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &__save-btn {
      min-height: 40px;
    }
  }

  @media (max-width: 768px) {
    .accounts__edit {
      &__top {
        padding-left: 20px;
        padding-right: 20px;
      }

      &__content {
        &__fields {
          padding: 20px;
        }
      }

      &__message-field {
        min-height: 180px;
      }

      &__actions {
        margin-top: 20px;
      }

      &__save-btn {
        width: 100%;
      }
    }
  }
</style>
