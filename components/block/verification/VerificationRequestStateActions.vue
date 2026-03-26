<template>
  <div class="request-review-actions">
    <button
      type="button"
      class="request-review-actions__btn request-review-actions__btn--viewed"
      :class="{ 'is-active': props.state === 'viewed' }"
      :disabled="props.disabled"
      :title="viewedLabel"
      :aria-label="viewedLabel"
      @click.stop="emitState('viewed')"
    >
      <UiIconEye />
    </button>

    <button
      type="button"
      class="request-review-actions__btn request-review-actions__btn--approved"
      :class="{ 'is-active': props.state === 'approved' }"
      :disabled="props.disabled"
      :title="approvedLabel"
      :aria-label="approvedLabel"
      @click.stop="emitState('approved')"
    >
      <UiIconSuccess />
    </button>

    <button
      type="button"
      class="request-review-actions__btn request-review-actions__btn--rejected"
      :class="{ 'is-active': props.state === 'rejected' }"
      :disabled="props.disabled"
      :title="rejectedLabel"
      :aria-label="rejectedLabel"
      @click.stop="emitState('rejected')"
    >
      <UiIconFailed />
    </button>
  </div>
</template>

<script setup lang="ts">
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";

type RequestReviewState = "pending" | "viewed" | "approved" | "rejected";

const props = withDefaults(
  defineProps<{
    state: RequestReviewState;
    disabled?: boolean;
    viewedLabel?: string;
    approvedLabel?: string;
    rejectedLabel?: string;
  }>(),
  {
    disabled: false,
    viewedLabel: "Просмотрено",
    approvedLabel: "Успешно обработано",
    rejectedLabel: "Отклонено",
  }
);

const emit = defineEmits<{
  (e: "updateState", value: Exclude<RequestReviewState, "pending">): void;
}>();

const emitState = (value: Exclude<RequestReviewState, "pending">): void => {
  if (props.disabled) {
    return;
  }

  emit("updateState", value);
};
</script>

<style lang="scss" scoped>
.request-review-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.request-review-actions__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--ui-text-secondary);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.request-review-actions__btn svg {
  width: 14px;
  height: 14px;
}

.request-review-actions__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.request-review-actions__btn:not(:disabled):hover {
  color: var(--ui-text-main);
  background: rgba(255, 255, 255, 0.06);
}

.request-review-actions__btn--viewed.is-active {
  color: var(--ui-text-main);
  background: rgba(73, 108, 222, 0.18);
}

.request-review-actions__btn--approved.is-active {
  color: #d9ffe6;
  background: rgba(34, 197, 94, 0.18);
}

.request-review-actions__btn--rejected.is-active {
  color: #ffd8d8;
  background: rgba(239, 68, 68, 0.18);
}
</style>
