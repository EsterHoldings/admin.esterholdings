<template>
  <div class="user-documents__wrapper">

    <div class="user-documents__left">
      <PanelDefault class="user-documents-uploader">
        <UiTextH5 class="user-documents-uploader__title">
          <span># Uploaded documents</span>
          <div class="user-documents-uploader__title__options">
            <span class="user-documents-uploader__title__options_reload"
                  @click="handleRefreshDocuments"
            >
              <UiIconUpdate :class="{ spin: isLoading }" />
            </span>
          </div>
        </UiTextH5>
        <div class="user-documents-uploader__documents">
          <TabUserDocumentsDocument
              v-for="document in documents"
              :data="document"
              :key="document.id"
              @document-was-removed="handleRefreshDocuments"
          />
          <div class="user-documents-uploader__documents--no-data" v-if="documents.length === 0">
            У вас нет загруженных документов.
          </div>
          <div class="user-documents-uploader__is-loading" v-if="isLoading">
            <UiIconSpinnerDefault />
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="user-documents__right">
      <PanelDefault class="user-documents__right__panel">
        <UiTextH5 class="user-documents__right__panel__title"># Upload new documents</UiTextH5>
        <UiDragAndDrop
            @files="handleFilesSelected"
            v-if="selectedFiles.length === 0"
        />
        <div
            class="user-documents__right__panel__upload-document-info"
            v-if="selectedFiles.length === 0"
        >
          Ви можете завантажити скани або фотографії документів загальним розміром до 20 МБ.
          Підтримувані формати файлів: PNG, JPG, JPEG, PDF.
        </div>
        <div
            v-for="(file, index) in selectedFiles"
            :key="file.name + `-${index}`"
            class="user-documents__right__panel__selected-file"
        >
          <div class="user-documents__right__panel__selected-file__wrapper">
            <UiIconDelete
                type="button"
                class="btn-delete"
                @click="removeFile(index)"
            />
            <div class="user-documents__right__panel__selected-file__wrapper__preview">
              <UiImage :src="getPreviewUrl(file)"/>
            </div>
            <div class="user-documents__right__panel__selected-file__wrapper__content">
              <UiFormControl :label="file.name">
                <UiInput
                    :model-value="docNumbers[index]"
                    @input="val => docNumbers[index] = val"
                    placeholder="Номер документа"
                    maxlength="100"
                />
              </UiFormControl>
              <div
                  v-if="docNumbers[index].length > 100"
                  class="validation-error"
              >
                Поле не може містити більше ніж 100 символів.
              </div>
              <div v-if="isUploading" class="upload-progress">
                Завантаження: {{ uploadProgress[index] }}%
              </div>
            </div>
          </div>
        </div>
        <UiFormControl
            label="Comment"
            class="user-documents__right__panel__comment"
        >
          <UiTextarea v-model="comment" placeholder="Ваш коментар..."/>
        </UiFormControl>
        <UiButtonDefault
            state="info--outline"
            :disabled="isUploading || selectedFiles.length === 0"
            @click="uploadFiles"
        >
          {{ isUploading ? "Uploading..." : "Upload and send to verification" }}
        </UiButtonDefault>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, onBeforeUnmount, onMounted} from "vue";
import useApi from "~/composables/useApi";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiDragAndDrop from "~/components/ui/UiDragAndDrop.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import axios from "axios";
import {useToast} from "vue-toastification";
import TabUserDocumentsDocument from "~/pages/profile/components/TabUserDocumentsDocument.vue";
import useAppCore from "~/composables/useAppCore";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";

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

const isLoading = ref(true)
let documents = reactive([]);

function isValidFormat(file: File): boolean {
  const allowed = ["image/png", "image/jpeg", "application/pdf"];
  return allowed.includes(file.type);
}

function getPreviewUrl(file: FileWithPreview): string {
  if (file._previewUrl) {
    return file._previewUrl;
  }
  const url = URL.createObjectURL(file);
  file._previewUrl = url;
  return url;
}

function handleFilesSelected(files: File[] | undefined) {
  if (!files || !Array.isArray(files)) {
    return;
  }
  const invalid = files.filter((f) => !isValidFormat(f)).map((f) => f.name);
  if (invalid.length > 0) {
    toast.error(
        `Неприпустимий формат файлу(ів): ${invalid.join(", ")}. Дозволені формати: PNG, JPG, JPEG, PDF.`
    );
  }
  const validFiles = files.filter((f) => isValidFormat(f));
  selectedFiles.forEach((f) => {
    if (f._previewUrl) {
      URL.revokeObjectURL(f._previewUrl);
      delete f._previewUrl;
    }
  });
  selectedFiles.splice(0, selectedFiles.length);
  validFiles.forEach((f) => {
    selectedFiles.push(f as FileWithPreview);
  });
  docNumbers.splice(0, docNumbers.length);
  uploadProgress.splice(0, uploadProgress.length);
  for (let i = 0; i < validFiles.length; i++) {
    docNumbers.push("");
    uploadProgress.push(0);
  }
}

function removeFile(index: number) {
  const file = selectedFiles[index];
  if (file && file._previewUrl) {
    URL.revokeObjectURL(file._previewUrl);
  }
  selectedFiles.splice(index, 1);
  docNumbers.splice(index, 1);
  uploadProgress.splice(index, 1);
}

async function uploadFiles() {

  console.log('uploadFiles -> start');

  if (selectedFiles.length === 0) {
    toast.warning("Спочатку виберіть принаймні один файл.");
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
        headers: {
          "Content-Type": file.type
        },
        onUploadProgress(event) {
          uploadProgress[i] = Math.round((event.loaded / (event.total || 1)) * 100);
        },
      });
      documentsPayload.push({
        name: file.name,
        path: key,
        document_type: 'passport',
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
  isLoading.value = true;
  // TODO :: LOAD UPLOADED DOCUMENTS
  const response = await appCore.documents.get();
  documents.splice(0, documents.length, ...response.data.data.data);

  setTimeout(() => {
    isLoading.value = false;
  }, 300)
}

const handleRefreshDocuments = async () => {
  await loadUploadedDocuments();
}

onBeforeUnmount(() => {
  selectedFiles.forEach((f) => {
    if (f._previewUrl) {
      URL.revokeObjectURL(f._previewUrl);
      delete f._previewUrl;
    }
  });
});

onMounted(async () => {
  await loadUploadedDocuments();
})
</script>

<style lang="scss" scoped>
.user-documents {
  color: var(--ui-text-main);

  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  &__left {
    width: 50%;

    & > div {
      padding: 20px;
    }
  }

  &__right {
    width: 50%;

    & > div {
      padding: 20px;
    }

    &__panel {
      padding: 20px;
      height: 100%;
      width: 100%;
      color: var(--ui-text-main);

      &__title {
        margin-bottom: 20px;
      }

      &__comment {
        margin-top: 20px;
        margin-bottom: 20px;
      }

      &__upload-document-info {
        margin-top: 10px;
        margin-bottom: 20px;
        font-size: 13px;
        color: var(--color-warning);
      }

      &__selected-file {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 10px;
        border: 1px dashed var(--ui-text-main);
        border-radius: 8px;

        &__wrapper {
          position: relative;
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 20px;
          justify-content: space-between;
        }

        &__wrapper__preview {
          width: 100px;
          height: 100px;
          border: 1px solid var(--color-stroke-ui-dark);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        &__wrapper__content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .validation-error {
          color: var(--color-danger);
          font-size: 12px;
          margin-top: 2px;
        }

        .upload-progress {
          font-size: 13px;
          color: var(--ui-text-main);
          margin-top: 5px;
        }
      }
    }
  }
}

.btn-delete {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-stroke-ui-dark);
  background-color: var(--ui-background);
  border-radius: 50%;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;

  &:before {
    content: "×";
    color: #000;
  }

  &:hover {
    background: #ef4444;
    color: #fff;
  }
}

.user-documents-uploader {
  color: var(--ui-text-main);
  transition: .3s;

  &__title {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__options {
      &_reload {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        padding: 5px;

        &:hover {
          background-color: var(--color-stroke-ui-dark);
        }
      }
    }
  }

  &__documents {
    position: relative;

    &--no-data {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 40px;
    }
  }

  &__is-loading {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: var(--ui-background);
    opacity: .3;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
