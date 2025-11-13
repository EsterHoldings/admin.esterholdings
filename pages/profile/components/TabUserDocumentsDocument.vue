<template>
  <!-- рядок -->
  <div
      class="group grid items-center px-6 py-4 hover:bg-[var(--color-stroke-ui-dark)] transition
           [grid-template-columns:47px_1fr_1fr_1fr_30px]"
      role="row"
  >
    <!-- картинка/іконка -->
    <div
        class="h-10 w-10 rounded-xl overflow-hidden grid place-items-center
             bg-[var(--ui-primary-main)]/15 ring-1 ring-[var(--ui-primary-main)]/30"
    >
      <template v-if="thumbUrl">
        <img :src="thumbUrl" alt="" class="h-full w-full object-cover" />
      </template>
      <template v-else>
        <UiIconImage class="w-6 h-6" />
      </template>
    </div>

    <!-- назва -->
    <div class="truncate text-[var(--ui-text-main)] text-base">
      {{ displayName }}
    </div>

    <!-- дата -->
    <div class="truncate text-right whitespace-nowrap text-sm text-[var(--ui-text-main)]/80">
      {{ data.created_at }}
    </div>

    <!-- статус -->
    <div
        class="truncate text-right text-sm font-medium"
        :class="statusClass"
    >
      {{ statusText }}
    </div>

    <!-- дії -->
    <div class="flex items-center justify-end">
      <button
          type="button"
          :disabled="inProcessRemoving"
          @click="handleRemoveDocument"
          class="inline-flex items-center justify-center w-9 h-9 hover:bg-[var(--color-stroke-ui-light)]/70 disabled:opacity-60 transition"
      >
        <UiIconSpinnerDefault v-if="inProcessRemoving" />
        <UiIconTrash v-else class="text-[var(--ui-text-main)]" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import useAppCore from "~/composables/useAppCore";

import UiIconImage from "~/components/ui/UiIconImage.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

type State = "pending" | "approved" | "rejected";

interface DocData {
  id: string | number;
  created_at: string;
  state: State;
  document_type?: string;
  document_data?: { number?: string; [k: string]: any };
  // можливі прев’ю-поля (опційно)
  thumb_url?: string;
  preview_url?: string;
  url?: string;
}

const props = defineProps<{ data: DocData }>();
const emits = defineEmits<{
  (e: "documentWasRemoved"): void;
}>();

const appCore = useAppCore();
const inProcessRemoving = ref(false);

const displayName = computed(() =>
    props.data?.document_data?.number
        ? props.data.document_data.number
        : (props.data.document_type ?? "Document")
);

const statusText = computed(() => {
  switch (props.data.state) {
    case "pending":
      return "In progress";
    case "approved":
      return "Approved";
    default:
      return "Rejected";
  }
});

const statusClass = computed(() => {
  switch (props.data.state) {
    case "pending":
      return "text-[var(--color-warning)]";
    case "approved":
      return "text-[var(--color-success)]";
    default:
      return "text-[var(--color-danger)]";
  }
});

const thumbUrl = computed(
    () => props.data.thumb_url || props.data.preview_url || props.data.url || ""
);

const handleRemoveDocument = async () => {
  inProcessRemoving.value = true;
  await appCore.documents.delete(props.data.id);
  inProcessRemoving.value = false;
  emits("documentWasRemoved");
};
</script>
