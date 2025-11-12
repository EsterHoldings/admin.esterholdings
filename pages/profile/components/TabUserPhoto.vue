<template>
  <div class="text-[var(--ui-text-main)]">
    <PanelDefault class="mx-auto text-center p-5 w-[350px]">
      <div class="flex flex-col items-center gap-4">
        <!-- AVATAR -->
        <div v-if="previewUrl" class="relative w-[300px] h-[300px] rounded-[10px] bg-[var(--ui-background)] border border-[var(--color-stroke-ui-dark)] overflow-hidden">
          <UiImage
              :src="previewUrl"
              class="w-full h-full object-cover cursor-pointer"
              @click="clickSelectionFile"
          />
          <button
              v-if="!loading"
              class="absolute -right-2 -top-2 z-30 h-[30px] w-[30px] rounded-full border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)] text-[var(--ui-text-main)] flex items-center justify-center hover:bg-red-500 transition"
              @click="remove"
              aria-label="Delete photo"
              type="button"
          >
            ×
          </button>
        </div>

        <div v-else class="relative w-[300px] h-[300px] rounded-[10px] bg-[var(--ui-background)] border border-[var(--color-stroke-ui-dark)] flex items-center justify-center group cursor-pointer" @click="clickSelectionFile">
          <span class="text-7xl text-gray-400">👤</span>

          <div class="absolute left-0 right-0 bottom-0 h-[35%] w-full p-2.5 flex items-center justify-center bg-[var(--ui-background-secondary)] rounded-b-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-[var(--ui-text-main)]">
              {{ t("cabinet.profile.components.tab-user-photo.buttons.choose") }}
            </span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex flex-col gap-5 w-full">
          <input
              id="fileSelectionBtn"
              type="file"
              accept="image/*"
              @change="onFileChange"
              hidden
          />

          <UiButtonDefault
              class="cursor-pointer text-[var(--ui-text-main)]"
              state="info--outline"
              :disabled="!file || loading || !!error"
              @click="upload"
          >
            {{ loading ? uploadProgress + "%" : t("cabinet.profile.components.tab-user-photo.buttons.upload") }}
          </UiButtonDefault>
        </div>

        <!-- PROGRESS -->
        <div v-if="loading" class="w-full h-1.5 bg-[var(--color-ui-primary-defalt)] rounded-md overflow-hidden">
          <div class="h-full bg-blue-500 transition-[width] duration-200" :style="{ width: uploadProgress + '%' }"></div>
        </div>

        <!-- ERROR -->
        <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>

        <UiTextSmall>Підтримувані формати: PNG, JPG, JPEG</UiTextSmall>
        <UiTextSmall>Фото не повинно перевищувати 5&nbsp;МБ.</UiTextSmall>
      </div>

      <UiHorizontalLine class="my-5" />

      <UiTextH5 class="mb-5"># Статус верифікації</UiTextH5>
      <div class="flex items-center justify-center gap-2">
        <span><UiIconSuccess /></span>
        <UiTextSmall>Успішно верифіковано!</UiTextSmall>
      </div>
    </PanelDefault>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";

import useApi from "~/composables/useApi";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import { useAuthStore } from "~/stores/authStore";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiHorizontalLine from "~/components/ui/UiHorizontalLine.vue";
import UiImage from "~/components/ui/UiImage.vue";

const { t } = useI18n();
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
    const { data } = await api.post("client/s3/presign", {
      filename: file.value.name,
      contentType: file.value.type,
    });

    await axios.put(data.url, file.value, {
      headers: { "Content-Type": file.value.type },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / (e.total || 1));
      },
    });

    const res = await api.post("client/user/photo", { key: data.key });
    previewUrl.value = res.data.photo_url;
    file.value = null;

    toast.success(t("cabinet.profile.components.tab-user-photo.messages.upload_success"));
  } catch {
    error.value = t("cabinet.profile.components.tab-user-photo.messages.upload_error");
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
    toast.success(t("cabinet.profile.components.tab-user-photo.messages.delete_success"));
  } catch {
    error.value = t("cabinet.profile.components.tab-user-photo.messages.delete_error");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await authStore.initAuth();
});
</script>
