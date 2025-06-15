<template>
  <div class="user-photo__wrapper">
    <PanelDefault class="user-photo-uploader">
      <div class="uploader-body">
        <div v-if="previewUrl" class="avatar-preview">
          <UiImage @click="clickSelectionFile" :src="previewUrl"/>
          <div
              v-if="previewUrl && !loading"
              class="btn-delete"
              @click="remove"
          ></div>
        </div>
        <div v-else class="avatar-placeholder" @click="clickSelectionFile">
          <span class="icon">👤</span>
          <span class="avatar-placeholder__choose-file">
            {{ t("cabinet.profile.components.tab-user-photo.buttons.choose") }}
          </span>
        </div>
        <div class="actions">
          <input
              id="fileSelectionBtn"
              type="file"
              accept="image/*"
              @change="onFileChange"
              hidden
          />
          <UiButtonDefault
              class="btn-upload"
              state="info--outline"
              :disabled="!file || loading || !!error"
              @click="upload"
          >
            {{ loading ? uploadProgress + "%" : t("cabinet.profile.components.tab-user-photo.buttons.upload") }}
          </UiButtonDefault>
        </div>
        <div v-if="loading" class="progress-bar">
          <div class="progress" :style="{ width: uploadProgress + '%' }"/>
        </div>
        <p v-if="error" class="error">{{ error }}</p>

        <UiTextSmall>Поддерживаемые форматы файлов: PNG, JPG, JPEG</UiTextSmall>
        <UiTextSmall>Фото пользователя не должно превышать размер в 5Мб.</UiTextSmall>
      </div>

      <UiHorizontalLine/>

      <UiTextH5 class="user-photo__panel__title"># Статус верификации</UiTextH5>
      <div class="user-photo__panel__verification-status">
          <span>
            <UiIconSuccess/>
          </span>
        <UiTextSmall>Успешно верифицировано!</UiTextSmall>
      </div>
    </PanelDefault>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import axios from "axios";
import {ref, computed, onMounted} from "vue";
import {useToast} from "vue-toastification";

import useApi from "~/composables/useApi";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {useAuthStore} from "~/stores/authStore";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiHorizontalLine from "~/components/ui/UiHorizontalLine.vue";
import UiImage from "~/components/ui/UiImage.vue";

const {t} = useI18n();
const toast = useToast();
const api = new useApi(true);
const authStore = useAuthStore();

const file = ref<File | null>(null);
const uploadProgress = ref<number>(0);
const loading = ref<boolean>(false);
const error = ref<string>("");

// Використовуємо photoUrl з Pinia
const previewUrl = computed<string>({
  get: () => authStore.photoUrl,
  set: (val: string) => authStore.setPhotoUrl(val),
});

const MAX_SIZE = 5 * 1024 * 1024;

function clickSelectionFile() {
  document.getElementById("fileSelectionBtn")?.click();
}

function onFileChange(e: Event) {
  error.value = "";
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    error.value = t("cabinet.profile.components.tab-user-photo.errors.type");
    return;
  }
  if (f.size > MAX_SIZE) {
    error.value = t("cabinet.profile.components.tab-user-photo.errors.size");
    return;
  }
  file.value = f;
  previewUrl.value = URL.createObjectURL(f);
  uploadProgress.value = 0;
}

async function upload() {
  if (!file.value) return;
  loading.value = true;
  error.value = "";

  try {
    const {data} = await api.post("client/s3/presign", {
      filename: file.value.name,
      contentType: file.value.type,
    });

    await axios.put(data.url, file.value, {
      headers: {"Content-Type": file.value.type},
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / (e.total || 1));
      },
    });

    const res = await api.post("client/user/photo", {key: data.key});
    // Оновлюємо як локально, так і в Pinia
    previewUrl.value = res.data.photo_url;
    file.value = null;

    toast.success(
        t("cabinet.profile.components.tab-user-photo.messages.upload_success")
    );
  } catch {
    error.value = t(
        "cabinet.profile.components.tab-user-photo.messages.upload_error"
    );
  } finally {
    loading.value = false;
  }
}

async function remove() {
  loading.value = true;
  error.value = "";
  try {
    await api.delete("client/user/photo");
    previewUrl.value = "";
    file.value = null;
    toast.success(
        t("cabinet.profile.components.tab-user-photo.messages.delete_success")
    );
  } catch {
    error.value = t(
        "cabinet.profile.components.tab-user-photo.messages.delete_error"
    );
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Підвантажуємо дані користувача разом з photoUrl
  await authStore.initAuth();
});
</script>

<style lang="scss" scoped>
.user-photo {
  color: var(--ui-text-main);

  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    width: 350px;
    margin: auto;
  }

  &__panel {
    padding: 20px;
    height: 100%;
    width: 100%;
    color: var(--ui-text-main);

    &__title {
      margin-bottom: 20px;
    }

    &__text {
      margin-bottom: 20px;
    }

    &__verification-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
  }
}

.btn-delete {
  background: var(--ui-background);
  border-radius: 50%;
  height: 30px;
  width: 30px;
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 3;
  border: 1px solid var(--color-stroke-ui-dark);

  &:hover {
    background: #ef4444;
  }

  &::before {
    content: "×";
    display: flex;
    justify-content: center;
    font-size: 18px;
    height: 30px;
    align-items: center;
    margin-top: -2px;
    width: 30px;
    text-align: center;
    color: var(--ui-text-main);
    border-radius: 50%;
    transform: translate(-0.06rem, -0.06rem);
  }
}

.user-photo-uploader {
  margin: 0 auto;
  text-align: center;
  padding: 20px;

  .title {
    margin-bottom: 20px;
  }

  .uploader-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .avatar-preview,
  .avatar-placeholder {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 10px;
    background: var(--ui-background);
    border: 1px solid var(--color-stroke-ui-dark);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      border-radius: 10px;
    }

    &:hover .avatar-placeholder__choose-file {
      visibility: visible;
      transition: visibility 0.2s;
    }

    &__choose-file {
      z-index: 3;

      visibility: hidden;
      transition: visibility 0.2s;

      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;

      height: 35%;
      width: 100%;

      padding: 10px;

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;

      background-color: var(--ui-background-secondary);
      border-radius: 0 0 10px 10px;
    }
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon {
    font-size: 4.5rem;
    color: #9ca3af;
  }

  .actions {
    gap: 20px;
    display: flex;
    flex-direction: column;

    .btn-select {
      cursor: pointer;
      color: var(--ui-text-main);
    }

    .btn-upload {
      cursor: pointer;
      color: var(--ui-text-main);
    }
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-ui-primary-defalt);
    border-radius: 3px;
    overflow: hidden;

    .progress {
      height: 100%;
      background: #3b82f6;
      transition: width 0.2s;
    }
  }

  .error {
    color: #dc2626;
    margin-top: 8px;
  }
}
</style>