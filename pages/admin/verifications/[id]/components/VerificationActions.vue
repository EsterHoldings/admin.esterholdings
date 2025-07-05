<template>
  <div class="doc-actions">
    <UiButtonDefault state="info--outline--small"
        v-if="props.enableComment"
        class="doc-actions__btn doc-actions__btn--comment"
        :class="{ active: commentText.length > 0 || props.comment?.length > 0 || ''}"
        @click="toggleComment"
        title="Коментар"
    >
      <UiIconComment />
    </UiButtonDefault>
    <UiButtonDefault state="info--outline--small"
        class="doc-actions__btn doc-actions__btn--rejected"
        :class="{ active: props.status === 'rejected' }"
        @click="onReject"
        title="Відхилено"
    >
      <UiIconDelete />
    </UiButtonDefault>
    <UiButtonDefault state="info--outline--small"
        class="doc-actions__btn doc-actions__btn--pending"
        :class="{ active: props.status === 'pending' }"
        @click="onPending"
        title="В очікуванні"
    >
      <UiIconAlert />
    </UiButtonDefault>
    <UiButtonDefault state="info--outline--small"
        class="doc-actions__btn doc-actions__btn--approved"
        :class="{ active: props.status === 'approved' }"
        @click="onApprove"
        title="Підтверджено"
    >
      <UiIconCheck />
    </UiButtonDefault>

    <transition name="fade">
      <div v-if="isCommentOpen" class="comment-popup">

        <UiFormControl label="Comment">
          <UiTextarea
              :value="commentText || props.comment || ''"
              @input="handleInputComment"
              class="comment-popup__textarea"
              placeholder="Введіть коментар..."
          ></UiTextarea>
        </UiFormControl>

        <div class="comment-popup__actions">
          <UiButtonDefault
              state="info--outline--small"
              class="comment-popup__btn"
              @click="submitComment">
            Save
          </UiButtonDefault>

          <UiButtonDefault
              state="info--outline--small"
              class="comment-popup__btn"
              @click="cancelComment">
            Close
          </UiButtonDefault>
        </div>
      </div>
    </transition>

  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import UiIconDelete from '~/components/ui/UiIconDelete.vue';
import UiIconComment from '~/components/ui/UiIconComment.vue';
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconCheck from "~/components/ui/UiIconCheck.vue";
import UiIconAlert from "~/components/ui/UiIconAlert.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";

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
  }
});

const emit = defineEmits(['updateStatus', 'updateComment'] as const);

const isCommentOpen = ref<boolean>(false);
const commentText = ref<string>('');

function onReject(doc: any)   { emit('updateStatus', {status: 'rejected', comment: commentText.value}) }

function onPending(doc: any)  { emit('updateStatus', {status: 'pending', comment: commentText.value}) }

function onApprove(doc: any)  { emit('updateStatus', {status: 'approved', comment: commentText.value}) }

const handleInputComment = (e:any) => {
  commentText.value = e.target.value;
}

const toggleComment = () => isCommentOpen.value = !isCommentOpen.value;

const submitComment = () => {
  isCommentOpen.value = false;
  console.log('SUBMIT', commentText.value);
  emit('updateStatus', {
    status: props.status,
    comment: commentText.value || ''
  });
}

const cancelComment = () => {
  console.log('cancelComment', props.comment);
  isCommentOpen.value = false;
  commentText.value = '';
}

onMounted(() => {
  console.log('ON MOUNTED', props);
  commentText.value = props.comment || '';
})
</script>

<style scoped>
.active {
  background-color: var(--ui-text-secondary);
}

.doc-actions {
  position: relative;
  display: flex;
  gap: 5px;
  padding: 3px;
  border-radius: 10px;
  width: min-content;
}

.doc-actions__btn--comment  {
  border: 1px solid var(--color-stroke-ui-dark);
  color: var(--color-success);

  &:hover {
    background-color: var(--ui-primary-accent);
  }

  &.active {
    border: 1px solid var(--color-primary);
    color: var(--color-success);
  }
}

.doc-actions__btn--rejected  { color: var(--color-danger) }
.doc-actions__btn--pending   { color: var(--color-warning) }
.doc-actions__btn--approved  { color: var(--color-success) }


.comment-popup {
  position: absolute;
  top: 40px;
  left: 0;
  background: var(--ui-background);
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 8px;
  padding: 8px;
  z-index: 10;
  min-width: 300px;
  transform: translate(-50%, 0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.comment-popup__textarea {
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 4px;
  padding: 4px;
  resize: vertical;
}

.comment-popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
}

.comment-popup__btn {
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  min-width: min-content;
  width: 100%;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
}

.comment-popup__btn:hover {
  background: var(--color-stroke-ui-dark);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
