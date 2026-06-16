<template>
  <article
    :class="cardClass"
    @click="handleOpen">
    <div class="flex min-w-0 gap-3 max-[760px]:flex-col">
      <div
        class="relative grid h-[42px] w-[42px] shrink-0 place-items-center overflow-visible rounded-full border border-[color-mix(in_srgb,var(--ui-primary-main)_28%,var(--color-stroke-ui-light))] bg-[linear-gradient(135deg,var(--ui-primary-main),color-mix(in_srgb,var(--ui-primary-main)_60%,#000000))] text-[13px] font-extrabold text-white">
        <img
          v-if="requestItem.user.photo_url"
          :src="requestItem.user.photo_url"
          :alt="clientName"
          class="h-full w-full rounded-[inherit] object-cover" />
        <span v-else>{{ clientInitials }}</span>
        <span
          v-if="requestItem.user.is_online"
          class="absolute bottom-0.5 -right-px h-[11px] w-[11px] rounded-full border-2 border-[var(--ui-background-admin)] bg-[var(--ui-sticker-success)]"
          aria-hidden="true" />
      </div>

      <div class="flex min-w-0 flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2.5">
          <h3 class="m-0 text-lg font-bold leading-tight text-[var(--ui-text-main)]">{{ clientName }}</h3>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--ui-text-secondary)]">
          <span class="break-all">{{ email }}</span>
          <span>#{{ shortId(requestItem.id) }}</span>
          <span>{{ updatedAt }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <template v-if="focusItems.length">
            <button
              v-for="item in focusItems"
              :key="`${requestItem.id}:${item.id}`"
              type="button"
              :class="changeChipClass(item)"
              @click.stop="handleOpenFocus(item)">
              <i
                :class="item.icon"
                aria-hidden="true" />
              <span>{{ item.label }}</span>
            </button>
          </template>

          <span
            v-else
            class="text-xs text-[var(--ui-text-secondary)]">
            {{ noChangesLabel }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="flex min-w-[210px] flex-col items-end justify-start gap-3 max-[1180px]:items-start max-[760px]:min-w-0 max-[760px]:items-stretch">
      <div
        v-if="isPending"
        class="flex flex-wrap items-start justify-end gap-2 max-[760px]:flex-col"
        @click.stop>
        <PrimeButton
          class="max-[760px]:w-full"
          :label="approveLabel"
          icon="pi pi-check"
          size="small"
          severity="success"
          :loading="isApproveUpdating"
          :disabled="isAnyUpdating"
          @click="handleReview('approved')" />
        <PrimeButton
          class="max-[760px]:w-full"
          :label="rejectLabel"
          icon="pi pi-times"
          size="small"
          severity="danger"
          outlined
          :loading="isRejectUpdating"
          :disabled="isAnyUpdating"
          @click="handleReview('rejected')" />
      </div>

      <span :class="statusClass">
        <i
          class="block h-2 w-2 rounded-full bg-current"
          aria-hidden="true" />
        {{ statusText }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type {
    VerificationRequestCardEmits,
    VerificationRequestCardProps,
  } from "~/composables/admin/verifications/components/VerificationRequestCard";
  import { useVerificationRequestCardSetup } from "~/composables/admin/verifications/components/VerificationRequestCard/setup";

  const props = defineProps<VerificationRequestCardProps>();
  const emit = defineEmits<VerificationRequestCardEmits>();

  const {
    cardClass,
    changeChipClass,
    clientInitials,
    clientName,
    email,
    focusItems,
    handleOpen,
    handleOpenFocus,
    handleReview,
    isAnyUpdating,
    isApproveUpdating,
    isPending,
    isRejectUpdating,
    statusClass,
    statusText,
    updatedAt,
  } = useVerificationRequestCardSetup(props, emit);
</script>
