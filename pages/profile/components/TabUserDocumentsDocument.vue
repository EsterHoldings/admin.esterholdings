<template>
  <div class="document">
    <div class="document__image">
      <UiIconImage/>
    </div>
    <div class="document__content">
      <div class="document__content-left">
        <div class="document__content-left__doc-name">
          # {{ data.document_data.number }}
        </div>
        <div class="document__content-left__status">
          <span>
            <UiIconFailed v-if="data.state === 'rejected'"/>
            <UiIconWarning v-if="data.state === 'pending'"/>
            <UiIconSuccess v-if="data.state === 'approved'"/>
          </span>
          <span>{{ data.state }}</span>
        </div>
      </div>
      <div class="document__content-right">
        <span class="document__content-right__time">
          <UiIconTime/>{{ data.created_at }}
        </span>
        <span class="document__content-right__options">
          <UiIconTrash @click="handleRemoveDocument" />
          <UiIconSpinnerDefault v-if="inProcessRemoving"/>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import useAppCore from "~/composables/useAppCore";
import UiIconTime from "~/components/ui/UiIconTime.vue";
import UiIconImage from "~/components/ui/UiIconImage.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";

interface DocumentInterface {
  document_data: object
  document_type: string
  created_at: string
}

const props = defineProps({
  data: {
    type: Object,
    require: true
  }
});

const emits = defineEmits(['documentWasRemoved']);

const appCore = useAppCore();
const inProcessRemoving = ref(false);

const handleRemoveDocument = async () => {
  inProcessRemoving.value = true;
  await appCore.documents.delete(props.data.id)
  inProcessRemoving.value = false;
  emits('documentWasRemoved');
}
</script>

<style lang="scss" scoped>
.document {
  height: 100px;
  width: 100%;
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  color: var(--ui-text-main);

  &:hover {
    background-color: var(--color-stroke-ui-dark);
  }

  &:last-child {
    margin-bottom: 0;
  }

  &__image {
    height: 100%;
    width: 100px;
    border: 1px dashed var(--ui-text-main);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    width: 100%;
    height: 100%;
    display: flex;

    &-left {
      width: 100%;
      position: relative;

      &__doc-name {
        margin-bottom: 10px;
      }

      &__status {
        color: var(--color-warning);
        white-space: pre;
        display: flex;
        gap: 10px;
      }
    }

    &-right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;

      &__time {
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        white-space: pre;

        svg {
          height: 20px;
          width: 20px;
          margin-right: 5px;
        }
      }

      &__options {
        display: flex;
        justify-content: end;
        width: 100%;

        svg {
          margin-right: 10px;
          fill: var(--ui-text-main);

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>