<script setup lang="ts">
import { useI18n } from "vue-i18n";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";

import useApi from "~/composables/useApi";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import { useAuthStore } from "~/stores/authStore";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";

const { t } = useI18n();
const toast = useToast();
const api = new useApi(true);
const authStore = useAuthStore();

const file = ref<File | null>(null);
const uploadProgress = ref<number>(0);
const loading = ref<boolean>(false);
const error = ref<string>("");

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

<template>
  <div class="text-[var(--ui-text-main)]">

      <div class="flex items-center gap-4">
        <!-- AVATAR -->
        <div v-if="previewUrl" class="relative w-[80px] h-[80px] rounded-full bg-[var(--ui-background)] border border-[var(--color-stroke-ui-dark)] overflow-hidden">
          <UiImage
              :src="previewUrl"
              class="w-full h-full object-cover cursor-pointer"
              @click="clickSelectionFile"
          />
          <button
              v-if="!loading"
              class="absolute -right-2 -top-2 z-30 h-[20px] w-[20px] rounded-full border border-[var(--color-stroke-ui-dark)] bg-[red] text-[var(--ui-text-main)] flex items-center justify-center hover:bg-red-500 transition"
              @click="remove"
              aria-label="Delete photo"
              type="button"
          >×</button>
        </div>

        <div v-else class="relative w-[80px] h-[80px] rounded-full bg-[var(--ui-background)] border border-[var(--color-stroke-ui-dark)] flex items-center justify-center group cursor-pointer" @click="clickSelectionFile">
          <span><UiIconUser/></span>
        </div>

        <div class="flex flex-col gap-2">

          <!-- ACTIONS -->
          <div class="flex flex-row gap-5">
            <input
                id="fileSelectionBtn"
                type="file"
                accept="image/*"
                @change="onFileChange"
                hidden
            />

            <UiButtonDefault
                state="info--outline"
                class="p-2.5 flex items-center justify-center"
                @click="clickSelectionFile"
            >
              <span class="text-[var(--ui-text-main)]">
                {{ t("cabinet.profile.components.tab-user-photo.buttons.choose") }}
              </span>
            </UiButtonDefault>

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
          <div v-if="loading" class="h-1.5 bg-[var(--color-ui-primary-defalt)] rounded-md overflow-hidden">
            <div class="h-full bg-blue-500 transition-[width] duration-200" :style="{ width: uploadProgress + '%' }"></div>
          </div>

          <!-- ERROR -->
          <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>

          <UiTextSmall>PNG,JPG,JPEG - max 5&nbsp;Mb</UiTextSmall>
        </div>
      </div>

  </div>
</template>