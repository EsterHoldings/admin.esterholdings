<template>
  <div class="user-docs-page text-[var(--ui-text-main)] space-y-6">
    <UiTextH5>Upload Documents</UiTextH5>

    <div class="relative min-h-[100px] grid place-items-center text-center" v-if="selectedFiles.length === 0">
      <UiDragAndDrop
          class="absolute top-0 bottom-0 left-0 right-0"
          @files="handleFilesSelected"
      />
    </div>

    <div
        v-for="(file, index) in selectedFiles"
        :key="file.name + `-${index}`"
        class="mb-4 flex flex-col gap-1.5 p-2.5 border border-dashed border-[var(--color-ui-primary)] rounded-lg"
    >
      <div class="relative grid [grid-template-columns:70px_1fr] gap-5 justify-between">
        <UiIconTrash
            type="button"
            class="absolute -top-1.5 -right-1.5 p-1 border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)] rounded-full cursor-pointer flex items-center justify-center text-[14px] leading-none hover:bg-red-500 hover:text-white"
            @click="removeFile(index)"
        />
        <div
            class="w-[70px] h-[70px] border border-[var(--color-stroke-ui-dark)] rounded overflow-hidden flex items-center justify-center">
          <UiImage :src="getPreviewUrl(file)"/>
        </div>
        <div class="flex flex-col gap-1.5">
          <UiFormControl :label="file.name">
            <UiInput
                :value="docNumbers[index]"
                @input="val => docNumbers[index] = val"
                placeholder="Название (Адрес, Паспорт и так далее.)"
                maxlength="100"
            />
          </UiFormControl>
          <div v-if="docNumbers[index].length > 100" class="text-[var(--color-danger)] text-[12px] mt-0.5">
            Поле не може містити більше ніж 100 символів.
          </div>
          <div v-if="isUploading" class="text-[13px] mt-1.5">Завантаження: {{ uploadProgress[index] }}%</div>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between rounded-xl border border-[var(--color-stroke-ui-dark)] h-[40px] px-4">
        <UiTextH6>Confirm your full name</UiTextH6>
        <div class="flex items-center justify-between gap-1.5">
          <UiIconWarningFull class="text-[var(--color-warning)]" v-if="verificationDocumentsStatus === 'pending'"/>
          <UiIconSuccessFull class="text-[var(--color-success)]" v-if="verificationDocumentsStatus === 'approved'"/>
          <UiIconDangerFull class="text-[var(--color-danger)]" v-if="verificationDocumentsStatus === 'rejected'"/>
          <span class="text-[var(--color-warning)]" v-if="verificationDocumentsStatus === 'pending'">In progress</span>
          <span class="text-[var(--color-success)]" v-if="verificationDocumentsStatus === 'approved'">Approved</span>
          <span class="text-[var(--color-danger)]" v-if="verificationDocumentsStatus === 'rejected'">Rejected</span>
        </div>
      </div>
      <div class="flex items-center justify-between rounded-xl border border-[var(--color-stroke-ui-dark)] h-[40px] px-4 mb-5">
        <UiTextH6>Confirm your address (passport or receipt)</UiTextH6>
        <div class="flex items-center justify-between gap-1.5">
          <UiIconWarningFull class="text-[var(--color-warning)]" v-if="verificationAddressStatus === 'pending'"/>
          <UiIconSuccessFull class="text-[var(--color-success)]" v-if="verificationAddressStatus === 'approved'"/>
          <UiIconDangerFull class="text-[var(--color-danger)]" v-if="verificationAddressStatus === 'rejected'"/>
          <span class="text-[var(--color-warning)]" v-if="verificationAddressStatus === 'pending'">In progress</span>
          <span class="text-[var(--color-success)]" v-if="verificationAddressStatus === 'approved'">Approved</span>
          <span class="text-[var(--color-danger)]" v-if="verificationAddressStatus === 'rejected'">Rejected</span>
        </div>
      </div>

      <UiButtonDefault
          state="info"
          :disabled="isUploading || selectedFiles.length === 0"
          class="!mt-5"
          @click="uploadFiles"
      >
        {{ isUploading ? "Uploading..." : "Upload and Send to Verification" }}
      </UiButtonDefault>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <UiTextH5>All Documents</UiTextH5>
        <button
            type="button"
            @click="handleRefreshDocuments"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
        >
          <UiIconUpdate :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>


      <div class="relative rounded-[22px] border border-[var(--color-ui-primary)] overflow-hidden shadow-[inset_0_1px_0_rgba(77,131,255,.45)]">
        <!-- Header -->
        <div
            class="grid items-center px-6 py-3 bg-[var(--color-ui-primary)] text-sm text-[var(--ui-text-main)]/90 [grid-template-columns:47px_1fr_1fr_1fr_30px]"
        >
          <div></div>
          <div>Name</div>
          <div class="text-right">Date</div>
          <div class="text-right">Status</div>
          <div></div>
        </div>


        <!-- Rows -->
        <div class="divide-y divide-[var(--color-stroke-ui-dark)]">
          <TabUserDocumentsDocument
              v-for="document in documents"
              :data="document"
              :key="document.id"
              @document-was-removed="handleRefreshDocuments"
          />


          <div class="flex items-center justify-center p-10 min-h-[300px]" v-if="documents?.length === 0">
            У вас нет загруженных документов.
          </div>
        </div>


        <!-- Loading overlay inside the table -->
        <div
            class="absolute inset-0 flex items-center justify-center rounded-[22px] bg-[var(--ui-background)]/30"
            v-if="isLoading"
        >
          <UiIconSpinnerDefault />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, onBeforeUnmount, onMounted} from "vue";
import useApi from "~/composables/useApi";

import TabUserDocumentsDocument from "~/pages/profile/components/TabUserDocumentsDocument.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiDragAndDrop from "~/components/ui/UiDragAndDrop.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiIconCheck from "~/components/ui/UiIconCheck.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

import axios from "axios";
import useAppCore from "~/composables/useAppCore";
import {useToast} from "vue-toastification";
import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";

interface FileWithPreview extends File {
  _previewUrl?: string;
}

const selectedFiles = reactive<FileWithPreview[]>([]);
const docNumbers = reactive<string[]>([]);
const uploadProgress = reactive<number[]>([]);
const comment = ref("");
const isUploading = ref(false);
const toast = useToast();

const apiClient = new useApi(true);
const appCore = useAppCore();

const isLoading = ref(true);
let documents = reactive<any[]>([]);

let verificationAddressStatus = ref<'pending' | 'approved' | 'rejected'>("pending");
let verificationDocumentsStatus = ref<'pending' | 'approved' | 'rejected'>("pending");

let verificationAddressComment = ref("");
let verificationDocumentsComment = ref("");

function isValidFormat(file: File): boolean {
  const allowed = ["image/png", "image/jpeg", "application/pdf"];
  return allowed.includes(file.type);
}

function getPreviewUrl(file: FileWithPreview): string {
  if (file._previewUrl) return file._previewUrl;
  const url = URL.createObjectURL(file);
  file._previewUrl = url;
  return url;
}

function handleFilesSelected(files: File[] | undefined) {
  if (!files || !Array.isArray(files)) return;
  const invalid = files.filter((f) => !isValidFormat(f)).map((f) => f.name);
  if (invalid.length > 0) {
    toast.error(`Неприпустимий формат файлу(ів): ${invalid.join(", ")}. Дозволені формати: PNG, JPG, JPEG, PDF, SVG.`);
  }
  const validFiles = files.filter((f) => isValidFormat(f));
  selectedFiles.forEach((f) => {
    if (f._previewUrl) {
      URL.revokeObjectURL(f._previewUrl);
      delete f._previewUrl;
    }
  });
  selectedFiles.splice(0, selectedFiles.length);
  validFiles.forEach((f) => selectedFiles.push(f as FileWithPreview));
  docNumbers.splice(0, docNumbers.length);
  uploadProgress.splice(0, uploadProgress.length);
  for (let i = 0; i < validFiles.length; i++) {
    docNumbers.push("");
    uploadProgress.push(0);
  }
}

const handleRemoveAddressComment = async () => {
  await appCore.verifications.removeCommentForAddress();
  await loadVerificationData();
  await loadUploadedDocuments();
};

const handleRemoveDocumentComment = async () => {
  await appCore.verifications.removeCommentForDocuments();
  await loadVerificationData();
  await loadUploadedDocuments();
};

function removeFile(index: number) {
  const file = selectedFiles[index];
  if (file && file._previewUrl) URL.revokeObjectURL(file._previewUrl);
  selectedFiles.splice(index, 1);
  docNumbers.splice(index, 1);
  uploadProgress.splice(index, 1);
}

async function uploadFiles() {
  if (selectedFiles.length === 0) {
    toast.warning("Будь ласка, виберіть файл(и).");
    return;
  }
  isUploading.value = true;

  const documentsPayload: {
    name: string;
    path: string;
    document_type: string;
    document_data: { number: string };
  }[] = [];

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const docNumber = docNumbers[i] || "";
    try {
      const presignResp = await apiClient.post("client/s3/presign", {
        filename: file.name,
        contentType: file.type,
        path: "documents",
      });
      const {url, key} = presignResp.data as { url: string; key: string };
      await axios.put(url, file, {
        headers: {"Content-Type": file.type},
        onUploadProgress(event) {
          uploadProgress[i] = Math.round((event.loaded / (event.total || 1)) * 100);
        },
      });
      documentsPayload.push({
        name: file.name,
        path: key,
        document_type: "passport",
        document_data: {number: docNumber},
      });
    } catch (err) {
      console.error(`Не вдалося завантажити файл ${file.name}:`, err);
      toast.error(`Не вдалося завантажити файл "${file.name}". Продовжую інші…`);
      continue;
    }
  }

  try {
    await apiClient.post("/client/user/documents", {
      documents: documentsPayload,
      comment: comment.value || "",
    });
    toast.success("Усі документи успішно відправлені на збереження.");
  } catch (err) {
    console.error("Помилка при збереженні документів у базу:", err);
    toast.error("Не вдалося зберегти документи. Спробуйте пізніше.");
  }

  selectedFiles.forEach((f) => {
    if (f._previewUrl) {
      URL.revokeObjectURL(f._previewUrl);
      delete f._previewUrl;
    }
  });

  selectedFiles.splice(0, selectedFiles.length);
  docNumbers.splice(0, docNumbers.length);
  uploadProgress.splice(0, uploadProgress.length);
  comment.value = "";
  isUploading.value = false;

  await loadUploadedDocuments();
}

const loadUploadedDocuments = async () => {
  console.log('---');
  isLoading.value = true;
  const response = await appCore.documents.get();
  documents.splice(0, documents.length, ...response.data.data.data);
  console.log(documents);
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
};

const loadVerificationData = async () => {
  isLoading.value = true;
  const response = await appCore.verifications.get();
  console.log(response.data.data)
  verificationAddressStatus.value = response.data.data.address?.verification_status;
  verificationDocumentsStatus.value = response.data.data.documents?.verification_status;
  verificationAddressComment.value = response.data.data.address?.comment;
  verificationDocumentsComment.value = response.data.data.documents?.comment;
  isLoading.value = false;
};

const handleRefreshDocuments = async () => {
  await loadVerificationData();
  await loadUploadedDocuments();
};

onBeforeUnmount(() => {
  selectedFiles.forEach((f) => {
    if (f._previewUrl) {
      URL.revokeObjectURL(f._previewUrl);
      delete f._previewUrl;
    }
  });
});

onMounted(async () => {
  console.log('012');
  await loadUploadedDocuments();
  console.log('123');
  await loadVerificationData();
  console.log('234');
});
</script>