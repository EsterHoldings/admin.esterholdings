<template>
  <div class="doc-actions">
    <div class="doc-actions__row">
      <button
        v-if="props.enableComment"
        type="button"
        class="action-toggle action-toggle--comment"
        :class="{ active: props.commentOpen }"
        :disabled="props.disabled"
        @click="toggleComment"
        title="Коментар"
        aria-label="Коментар"
      >
        <UiIconComment />
      </button>
      <div class="action-group">
        <button
          type="button"
          class="action-toggle"
          :class="{ active: props.status === 'rejected' }"
          :disabled="props.disabled"
          @click="onReject"
          title="Відхилено"
          aria-label="Відхилено"
        >
          <UiIconFailed />
        </button>
        <button
          type="button"
          class="action-toggle"
          :class="{ active: props.status === 'pending' }"
          :disabled="props.disabled"
          @click="onPending"
          title="В очікуванні"
          aria-label="В очікуванні"
        >
          <UiIconWarning />
        </button>
        <button
          type="button"
          class="action-toggle"
          :class="{ active: props.status === 'approved' }"
          :disabled="props.disabled"
          @click="onApprove"
          title="Підтверджено"
          aria-label="Підтверджено"
        >
          <UiIconSuccess />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiIconComment from '~/components/ui/UiIconComment.vue';
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: ""
  },
  enableComment: {
    type: Boolean,
    default: false
  },
  commentOpen: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['updateStatus', 'toggleComment'] as const);

function onReject(doc: any)   { if (!props.disabled) emit('updateStatus', {status: 'rejected', comment: props.comment || ''}) }

function onPending(doc: any)  { if (!props.disabled) emit('updateStatus', {status: 'pending', comment: props.comment || ''}) }

function onApprove(doc: any)  { if (!props.disabled) emit('updateStatus', {status: 'approved', comment: props.comment || ''}) }

const toggleComment = () => {
  if (props.disabled) {
    return;
  }

  emit('toggleComment');
};
</script>

<style lang="scss" scoped>
.doc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min-content;
}

.doc-actions__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
}

.action-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  width: 34px;
  border-radius: 8px;
  color: var(--ui-text-main);
  background: transparent;
  border: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.action-toggle svg {
  height: 18px;
  width: 18px;
}

.action-toggle--comment {
  height: 34px;
  width: 34px;
  background: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
  margin-right: 12px;
  box-shadow: inset 0 0 0 1px var(--color-stroke-ui-dark);
}

.action-toggle--comment.active {
  background: transparent;
  border-color: var(--ui-primary-main);
  color: var(--ui-text-main);
  box-shadow: none;
}

.action-toggle--comment:hover {
  background: var(--color-stroke-ui-dark);
}

.action-toggle.active {
  background: var(--ui-primary-main);
  color: #fff;
}

.action-toggle:not(.active):hover {
  background: var(--color-stroke-ui-light);
}


</style>
