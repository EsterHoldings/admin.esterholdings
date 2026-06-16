<template>
  <article :class="cardClass">
    <div class="flex items-start justify-between gap-3 max-[767px]:flex-col">
      <div class="min-w-0">
        <div class="mb-2.5 flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-[0.04em] text-[var(--ui-text-secondary)]">
            #{{ shortId(requestItem.id) }}
          </span>
          <span :class="statusBadgeClass">{{ statusText(requestItem.status) }}</span>
        </div>

        <div class="flex min-w-0 items-center gap-2.5">
          <NuxtLink
            v-if="requestItem.user_id"
            :to="clientUrl"
            :class="avatarClass">
            <img
              v-if="requestItem.owner_photo_path"
              :src="requestItem.owner_photo_path"
              :alt="requestItem.owner_name || requestItem.owner_email || 'Client'"
              class="h-full w-full object-cover" />
            <span v-else>{{ ownerInitials(requestItem) }}</span>
            <i
              class="absolute bottom-px right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--ui-background-panel)]"
              :class="onlineIndicatorClass" />
          </NuxtLink>
          <div
            v-else
            :class="avatarClass">
            <span>{{ ownerInitials(requestItem) }}</span>
            <i
              class="absolute bottom-px right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--ui-background-panel)]"
              :class="onlineIndicatorClass" />
          </div>

          <div class="grid min-w-0 gap-0.5">
            <NuxtLink
              v-if="requestItem.user_id"
              :to="clientUrl"
              class="block truncate text-xl font-bold leading-tight text-[var(--ui-text-main)]">
              {{ requestItem.owner_name || "-" }}
            </NuxtLink>
            <div
              v-else
              class="block truncate text-xl font-bold leading-tight text-[var(--ui-text-main)]">
              {{ requestItem.owner_name || "-" }}
            </div>
            <div class="flex flex-wrap gap-1.5 text-[13px] leading-snug text-[var(--ui-text-secondary)]">
              <NuxtLink
                v-if="requestItem.user_id"
                :to="clientUrl">
                {{ requestItem.owner_email || "-" }}
              </NuxtLink>
              <span v-else>{{ requestItem.owner_email || "-" }}</span>
              <span v-if="requestItem.owner_phone">· {{ requestItem.owner_phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="ml-auto flex flex-col items-end gap-2.5 max-[767px]:ml-0 max-[767px]:w-full max-[767px]:items-stretch">
        <div class="inline-flex items-center justify-end gap-3 max-[767px]:w-full max-[767px]:justify-between">
          <button
            v-if="canEdit"
            type="button"
            class="inline-flex min-h-[30px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--ui-primary-main)_24%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary-main)_10%,transparent)] px-3 text-xs font-bold leading-none text-[var(--ui-primary-main)] transition duration-200 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--ui-primary-main)_42%,transparent)] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isUpdating"
            @click="handleToggleEdit">
            {{ isEditing ? labels.cancelEditText : labels.editText }}
          </button>

          <div class="whitespace-nowrap text-2xl font-bold leading-none">{{ amountText }}</div>
        </div>

        <div
          v-if="canManagePayments"
          class="flex flex-col items-end gap-2 max-[767px]:w-full max-[767px]:items-start">
          <label
            class="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold leading-snug text-[var(--ui-text-secondary)]">
            <input
              class="m-0 h-4 w-4 cursor-pointer accent-[var(--ui-primary-main)]"
              type="checkbox"
              :checked="notifyChecked"
              @change="handleNotifyChange" />
            <span>{{ labels.notifyClientText }}</span>
          </label>

          <div
            class="flex items-center justify-end gap-1 rounded-[11px] border border-[var(--color-stroke-ui-light)] bg-[color-mix(in_srgb,var(--ui-background)_74%,transparent)] p-[3px] max-[767px]:w-full"
            role="group"
            :aria-label="labels.actionsStatusSelector">
            <button
              type="button"
              :class="successfulActionClass"
              :disabled="statusDisabled('successful')"
              :title="successfulActionTitle(requestItem)"
              @click="handleSuccessfulStatus">
              <UiIconSuccessFull class="h-4 w-4" />
            </button>

            <button
              type="button"
              :class="rejectedActionClass"
              :disabled="statusDisabled('rejected')"
              :title="labels.rejectText"
              @click="handleRejectedStatus">
              <UiIconDangerFull class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
      <div>
        <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.accountText }}</div>
        <div class="break-words font-semibold leading-snug text-[var(--ui-text-main)]">{{ accountText }}</div>
      </div>

      <div>
        <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.paymentMethodText }}</div>
        <div class="break-words font-semibold leading-snug text-[var(--ui-text-main)]">
          {{ requestItem.payment_system_name || "-" }}
        </div>
      </div>

      <div>
        <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">
          {{ requestItem.is_internal_transfer ? labels.transferRouteText : labels.paymentDetailText }}
        </div>
        <div class="break-words font-semibold leading-snug text-[var(--ui-text-main)]">
          {{ routeOrPaymentDetailText }}
        </div>
      </div>

      <div>
        <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.createdAtText }}</div>
        <div class="break-words font-semibold leading-snug text-[var(--ui-text-main)]">
          {{ formatDateTime(requestItem.created_at) }}
        </div>
      </div>

      <div v-if="requestItem.is_internal_transfer">
        <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.executionText }}</div>
        <div class="break-words font-semibold leading-snug text-[var(--ui-text-main)]">
          {{ internalTransferExecutionText(requestItem) }}
        </div>
      </div>
    </div>

    <div v-if="requestItem.comment">
      <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.clientCommentText }}</div>
      <div class="whitespace-pre-wrap leading-normal text-[var(--ui-text-main)]">{{ requestItem.comment }}</div>
    </div>

    <div v-if="requestItem.admin_comment">
      <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.adminCommentText }}</div>
      <div class="whitespace-pre-wrap leading-normal text-[var(--ui-text-main)]">{{ requestItem.admin_comment }}</div>
    </div>

    <div
      v-if="hasDetails"
      class="flex flex-col gap-2.5">
      <div class="flex flex-wrap items-start justify-between gap-2.5">
        <div>
          <div class="mb-1 text-xs text-[var(--ui-text-secondary)]">{{ labels.paymentDetailText }}</div>
          <div class="text-[15px] font-bold leading-snug text-[var(--ui-text-main)]">{{ detailTitle }}</div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-1 text-xs font-medium text-[var(--ui-text-main)] transition hover:border-[var(--ui-primary-accent)]"
          :aria-expanded="paymentDetailExpanded ? 'true' : 'false'"
          :title="labels.paymentDetailText"
          @click="handleTogglePaymentDetail">
          <span>{{ labels.documentsText }} {{ documentsCount }}</span>
          <UiIconChevronUp
            v-if="paymentDetailExpanded"
            class="!h-3.5 !w-3.5" />
          <UiIconChevronDown
            v-else
            class="!h-3.5 !w-3.5" />
        </button>
      </div>

      <div
        v-if="paymentDetailExpanded"
        class="flex flex-col gap-2.5">
        <div
          v-if="paymentEntries.length"
          class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
          <div
            v-for="entry in paymentEntries"
            :key="entry.key"
            class="flex flex-col gap-1">
            <div class="text-[11px] leading-snug text-[var(--ui-text-secondary)]">{{ entry.label }}</div>
            <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <UiIconCopy
                class="text-[var(--ui-text-secondary)] transition hover:text-[var(--ui-primary-main)]"
                :text="entry.value"
                :title="labels.copyValueText" />
              <div class="break-words text-[13px] font-semibold leading-snug text-[var(--ui-text-main)]">
                {{ entry.value }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="requestItem.payment_detail?.documents?.length"
          class="flex flex-col gap-2">
          <div class="text-[11px] leading-snug text-[var(--ui-text-secondary)]">{{ labels.documentsText }}</div>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="document in requestItem.payment_detail.documents"
              :key="`${requestItem.id}-${document.path}`"
              class="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-2 text-[var(--ui-text-main)] transition hover:border-[var(--ui-primary-accent)]"
              :href="paymentDetailDocumentHref(document)"
              target="_blank"
              rel="noopener noreferrer">
              <img
                v-if="isPaymentDetailDocumentImage(document)"
                :src="paymentDetailDocumentHref(document)"
                :alt="document.name || labels.documentsText"
                class="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div
                v-else
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] text-[10px] font-semibold uppercase text-[var(--ui-text-secondary)]">
                {{ paymentDetailDocumentExtension(document) }}
              </div>
              <span class="truncate text-sm font-medium">{{ document.name || document.path }}</span>
            </a>
          </div>
        </div>

        <div
          v-if="requestItem.payment_detail?.comment"
          class="flex flex-col gap-2">
          <div class="text-[11px] leading-snug text-[var(--ui-text-secondary)]">{{ labels.requisitesCommentText }}</div>
          <div class="whitespace-pre-wrap leading-normal text-[var(--ui-text-main)]">
            {{ requestItem.payment_detail.comment }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isEditing"
      class="flex flex-col gap-3.5 border-t border-[var(--color-stroke-ui-light)] pt-3.5">
      <div
        v-if="isAuxiliaryLoading"
        class="flex min-h-[120px] items-center justify-center">
        <UiIconSpinnerDefault />
      </div>

      <template v-else>
        <div class="grid grid-cols-3 gap-3 max-[767px]:grid-cols-1">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-[var(--ui-text-secondary)]">{{ labels.accountText }}</label>
            <UiSelect
              :without-no-select="true"
              :value="editForm.accountId"
              :data="accountOptions"
              @change="value => handleEditSelectChange('accountId', value)" />
            <div
              v-if="editErrors.accountId"
              class="text-xs text-[var(--ui-sticker-danger)]">
              {{ editErrors.accountId }}
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-[var(--ui-text-secondary)]">{{ labels.paymentDetailText }}</label>
            <UiSelect
              :without-no-select="true"
              :value="editForm.paymentDetailId"
              :data="paymentDetailOptions"
              @change="value => handleEditSelectChange('paymentDetailId', value)" />
            <div
              v-if="editErrors.paymentDetailId"
              class="text-xs text-[var(--ui-sticker-danger)]">
              {{ editErrors.paymentDetailId }}
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-[var(--ui-text-secondary)]">{{ labels.amountText }}</label>
            <UiInput
              type="number"
              :value="editForm.amount"
              @input="value => handleEditInput('amount', value)" />
            <div
              v-if="editErrors.amount"
              class="text-xs text-[var(--ui-sticker-danger)]">
              {{ editErrors.amount }}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs text-[var(--ui-text-secondary)]">{{ labels.clientCommentText }}</label>
          <textarea
            class="min-h-[110px] w-full resize-y rounded-[10px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-control-bg)] p-3 text-[var(--ui-text-main)] outline-none"
            :value="editForm.comment"
            @input="event => handleEditTextarea('comment', event)" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs text-[var(--ui-text-secondary)]">{{ labels.adminCommentText }}</label>
          <textarea
            class="min-h-[110px] w-full resize-y rounded-[10px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-control-bg)] p-3 text-[var(--ui-text-main)] outline-none"
            :value="editForm.adminComment"
            @input="event => handleEditTextarea('adminComment', event)" />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <UiButtonDefault
            state="info"
            class="max-w-[220px]"
            :disabled="isUpdating"
            @click="handleSaveEdit">
            {{ labels.saveText }}
          </UiButtonDefault>
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import type {
    WithdrawalRequestCardEmits,
    WithdrawalRequestCardProps,
  } from "~/composables/admin/withdrawal-requests/components/WithdrawalRequestCard";
  import { useWithdrawalRequestCardSetup } from "~/composables/admin/withdrawal-requests/components/WithdrawalRequestCard/setup";

  const props = defineProps<WithdrawalRequestCardProps>();
  const emit = defineEmits<WithdrawalRequestCardEmits>();

  const {
    accountText,
    amountText,
    avatarClass,
    canEdit,
    cardClass,
    clientUrl,
    detailTitle,
    documentsCount,
    handleEditInput,
    handleEditSelectChange,
    handleEditTextarea,
    handleNotifyChange,
    handleRejectedStatus,
    handleSaveEdit,
    handleSuccessfulStatus,
    handleToggleEdit,
    handleTogglePaymentDetail,
    hasDetails,
    isAuxiliaryLoading,
    isEditing,
    isUpdating,
    notifyChecked,
    onlineIndicatorClass,
    paymentDetailExpanded,
    paymentEntries,
    rejectedActionClass,
    routeOrPaymentDetailText,
    statusBadgeClass,
    statusDisabled,
    successfulActionClass,
  } = useWithdrawalRequestCardSetup(props, emit);
</script>
