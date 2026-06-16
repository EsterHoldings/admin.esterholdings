<template>
  <PrimeDialog
    :visible="visible"
    modal
    :draggable="false"
    :closable="!submitting"
    :dismissable-mask="!submitting"
    class="w-[min(100%,460px)]"
    :header="title"
    @update:visible="handleVisibleUpdate">
    <div class="pt-3">
      <p class="text-sm leading-normal text-[var(--ui-text-main)]">{{ message }}</p>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-end gap-2.5">
        <label
          class="mr-auto inline-flex cursor-pointer items-center gap-2 text-[13px] font-bold text-[var(--ui-text-secondary)]">
          <input
            class="h-4 w-4 accent-[var(--ui-primary-main)]"
            type="checkbox"
            :checked="sendNotifications"
            @change="handleSendNotificationsChange" />
          <span>{{ sendNotificationsLabel }}</span>
        </label>

        <PrimeButton
          severity="secondary"
          text
          :disabled="submitting"
          :label="cancelLabel"
          @click="handleClose" />
        <PrimeButton
          :severity="confirmButtonSeverity"
          :loading="submitting"
          :label="confirmButtonLabel"
          @click="handleConfirm" />
      </div>
    </template>
  </PrimeDialog>
</template>

<script setup lang="ts">
  import type {
    VerificationReviewDialogEmits,
    VerificationReviewDialogProps,
  } from "~/composables/admin/verifications/components/VerificationReviewDialog";
  import { useVerificationReviewDialogSetup } from "~/composables/admin/verifications/components/VerificationReviewDialog/setup";

  const props = defineProps<VerificationReviewDialogProps>();
  const emit = defineEmits<VerificationReviewDialogEmits>();

  const {
    confirmButtonLabel,
    confirmButtonSeverity,
    handleClose,
    handleConfirm,
    handleSendNotificationsChange,
    handleVisibleUpdate,
  } = useVerificationReviewDialogSetup(props, emit);
</script>
