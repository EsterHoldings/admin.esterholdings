<template>
  <article
    class="overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--ui-primary-main)_14%,var(--color-stroke-ui-light))] bg-[radial-gradient(circle_at_14%_0%,color-mix(in_srgb,var(--ui-primary-main)_7%,transparent),transparent_36%),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent)] shadow-[0_14px_36px_color-mix(in_srgb,#000000_9%,transparent)] backdrop-blur-[18px]">
    <div class="flex flex-col gap-3 p-[13px]">
      <div class="flex items-start justify-between gap-3 max-[640px]:flex-col">
        <div class="flex min-w-0 items-center gap-2.5">
          <i
            class="pi pi-credit-card grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[14px] bg-[color-mix(in_srgb,var(--ui-primary-main)_11%,transparent)] text-[var(--ui-primary-main)]"
            aria-hidden="true" />
          <div class="min-w-0">
            <h3 class="m-0 break-words text-base font-[840] leading-tight text-[var(--ui-text-main)]">
              {{ paymentDetail.name || "-" }}
            </h3>
            <span class="text-xs text-[var(--ui-text-secondary)]">{{ paymentDetail.paymentSystemName || "-" }}</span>
          </div>
        </div>

        <span
          class="inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-extrabold"
          :class="statusClass(paymentDetail.status)">
          {{ statusText(paymentDetail.status) }}
        </span>
      </div>

      <div class="grid grid-cols-4 gap-2.5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div
          v-for="field in paymentPrimaryFields(paymentDetail)"
          :key="`${paymentDetail.id}:${field.key}`"
          class="grid gap-1 rounded-[14px] border border-[color-mix(in_srgb,var(--ui-primary-main)_12%,var(--color-stroke-ui-light))] bg-[color-mix(in_srgb,var(--ui-background-card)_48%,transparent)] p-2.5">
          <span class="text-[11px] font-bold text-[var(--ui-text-secondary)]">{{ field.label }}</span>
          <strong class="break-words text-[13px] font-bold text-[var(--ui-text-main)]">{{ field.value || "-" }}</strong>
        </div>

        <div
          class="grid gap-1 rounded-[14px] border border-[color-mix(in_srgb,var(--ui-primary-main)_12%,var(--color-stroke-ui-light))] bg-[color-mix(in_srgb,var(--ui-background-card)_48%,transparent)] p-2.5">
          <span class="text-[11px] font-bold text-[var(--ui-text-secondary)]">{{ updatedAtLabel }}</span>
          <strong class="break-words text-[13px] font-bold text-[var(--ui-text-main)]">
            {{ formatDateTime(paymentDetail.updatedAt) }}
          </strong>
        </div>
      </div>

      <div
        v-if="paymentDetail.documents.length"
        class="flex flex-wrap gap-2">
        <button
          v-for="(document, index) in paymentDetail.documents"
          :key="`${paymentDetail.id}:document:${index}`"
          type="button"
          class="grid h-[46px] w-[46px] place-items-center overflow-hidden rounded-[13px] border border-[color-mix(in_srgb,var(--ui-primary-main)_14%,var(--color-stroke-ui-light))] bg-[color-mix(in_srgb,var(--ui-background-card)_58%,transparent)] text-[11px] font-extrabold text-[var(--ui-text-secondary)]"
          @click="openDocument(document)">
          <img
            v-if="document.previewUrl"
            :src="document.previewUrl"
            :alt="document.name || documentAltLabel"
            class="h-full w-full object-cover" />
          <span v-else>{{ documentLabel(document, index) }}</span>
        </button>
      </div>

      <div
        v-if="paymentDetail.adminComment"
        class="grid gap-1 rounded-[14px] border border-[color-mix(in_srgb,var(--color-warning)_20%,var(--color-stroke-ui-light))] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] px-3 py-2.5">
        <span class="text-[11px] font-bold text-[var(--ui-text-secondary)]">{{ adminCommentLabel }}</span>
        <strong class="text-[13px] font-bold text-[var(--ui-text-main)]">{{ paymentDetail.adminComment }}</strong>
      </div>

      <div
        v-if="showChangeStatus || showStatusActions"
        class="flex flex-wrap items-center justify-end gap-2 border-t border-[color-mix(in_srgb,var(--ui-primary-main)_10%,var(--color-stroke-ui-light))] pt-3">
        <PrimeButton
          v-if="showChangeStatus"
          type="button"
          size="small"
          icon="pi pi-pencil"
          :label="changeStatusLabel"
          :disabled="isUpdatingStatus"
          @click="emit('start-status-edit')" />

        <template v-else>
          <PrimeButton
            type="button"
            size="small"
            icon="pi pi-check"
            severity="success"
            :label="approveLabel"
            :loading="isUpdatingStatus"
            :disabled="isUpdatingStatus"
            @click="emit('change-status', 'approved')" />
          <PrimeButton
            type="button"
            size="small"
            icon="pi pi-times"
            severity="danger"
            :label="rejectLabel"
            :disabled="isUpdatingStatus"
            @click="emit('change-status', 'rejected')" />
          <PrimeButton
            v-if="showCancelStatusEdit"
            type="button"
            size="small"
            severity="secondary"
            text
            :label="cancelLabel"
            :disabled="isUpdatingStatus"
            @click="emit('cancel-status-edit')" />
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type {
    AdminPaymentDetail,
    AdminPaymentDetailDocument,
    PaymentDetailField,
    PaymentDetailDecisionStatus,
    PaymentDetailStatus,
  } from "~/composables/admin/clients/components/TabPaymentDetails";

  defineProps<{
    paymentDetail: AdminPaymentDetail;
    updatedAtLabel: string;
    documentAltLabel: string;
    adminCommentLabel: string;
    changeStatusLabel: string;
    approveLabel: string;
    rejectLabel: string;
    cancelLabel: string;
    showChangeStatus: boolean;
    showStatusActions: boolean;
    showCancelStatusEdit: boolean;
    isUpdatingStatus: boolean;
    paymentPrimaryFields: (paymentDetail: AdminPaymentDetail) => PaymentDetailField[];
    formatDateTime: (value: string) => string;
    statusText: (status: PaymentDetailStatus) => string;
    statusClass: (status: PaymentDetailStatus) => string;
    documentLabel: (document: AdminPaymentDetailDocument, index: number) => string;
    openDocument: (document: AdminPaymentDetailDocument) => void;
  }>();

  const emit = defineEmits<{
    (event: "start-status-edit"): void;
    (event: "cancel-status-edit"): void;
    (event: "change-status", status: PaymentDetailDecisionStatus): void;
  }>();
</script>
