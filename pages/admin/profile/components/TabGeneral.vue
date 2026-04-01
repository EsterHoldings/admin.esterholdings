<template>
  <div class="admin-profile-general">
    <PanelDefault class="admin-profile-general__photo-panel">
      <div class="admin-profile-general__photo-hero">
        <div class="admin-profile-general__panel-header">
          <div>
            <UiTextH5 class="admin-profile-general__panel-title">
              {{ resolveText("admin.profile.general.sections.photo", "Profile photo") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-general__panel-subtitle">
              {{ resolveText("admin.profile.general.hints.fileSupport", "Upload JPG, JPEG or PNG up to 5 MB.") }}
            </UiTextSmall>
          </div>

          <UiBadge
            :state="props.profileData?.is_online ? 'success' : 'warning'"
            outline
            class="!px-3">
            {{
              props.profileData?.is_online
                ? resolveText("admin.profile.status.online", "Online")
                : resolveText("admin.profile.status.offline", "Offline")
            }}
          </UiBadge>
        </div>

        <div class="admin-profile-general__photo-chips">
          <div class="admin-profile-general__photo-chip">
            <span>{{ resolveText("admin.profile.general.sections.history", "Photo history") }}</span>
            <strong>{{ photoHistory.length }}</strong>
          </div>

          <div class="admin-profile-general__photo-chip">
            <span>{{ resolveText("admin.profile.general.fields.email", "Email") }}</span>
            <strong>{{ props.profileData?.email || "—" }}</strong>
          </div>
        </div>
      </div>

      <div class="admin-profile-general__photo-main">
        <div class="admin-profile-general__avatar">
          <UiImage
            v-if="avatarUrl"
            class="admin-profile-general__avatar-image"
            :src="avatarUrl" />
          <div
            v-else
            class="admin-profile-general__avatar-placeholder">
            {{ props.profileData?.initials || "AD" }}
          </div>
        </div>

        <div class="admin-profile-general__photo-meta">
          <div class="admin-profile-general__photo-name">
            {{ props.profileData?.name || props.profileData?.nickname || props.profileData?.email || "—" }}
          </div>
          <div class="admin-profile-general__photo-email">
            {{ props.profileData?.email || "—" }}
          </div>
          <div class="admin-profile-general__photo-last-seen">
            {{ resolveText("admin.profile.summary.lastSeen", "Last seen") }}:
            {{ formatDateTime(props.profileData?.last_seen_at) }}
          </div>
        </div>
      </div>

      <div class="admin-profile-general__photo-actions">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          hidden
          @change="handleFileSelect" />

        <UiButtonDefault
          state="info--outline"
          :disabled="isUploadingPhoto"
          @click="openFilePicker">
          {{ resolveText("admin.profile.actions.chooseFile", "Choose file") }}
        </UiButtonDefault>

        <UiButtonDefault
          state="primary"
          :disabled="!selectedFile || isUploadingPhoto"
          :isLoading="isUploadingPhoto"
          @click="uploadPhoto">
          {{ resolveText("admin.profile.actions.uploadPhoto", "Upload photo") }}
        </UiButtonDefault>
      </div>

      <div
        v-if="selectedFileName"
        class="admin-profile-general__selected-file">
        <strong>{{ resolveText("admin.profile.general.labels.selectedFile", "Selected file") }}:</strong>
        <span>{{ selectedFileName }}</span>
      </div>

      <div
        v-if="uploadProgress > 0 && isUploadingPhoto"
        class="admin-profile-general__upload-progress">
        <div
          class="admin-profile-general__upload-progress-bar"
          :style="{ width: `${uploadProgress}%` }" />
      </div>

      <div class="admin-profile-general__history-shell">
        <div class="admin-profile-general__history-header">
          <UiTextH5 class="admin-profile-general__panel-title">
            {{ resolveText("admin.profile.general.sections.history", "Photo history") }}
          </UiTextH5>
          <UiTextSmall class="admin-profile-general__panel-subtitle">
            {{
              resolveText(
                "admin.profile.general.hints.photoHistory",
                "Reuse any previously uploaded image or remove it from history."
              )
            }}
          </UiTextSmall>
        </div>

        <div
          v-if="photoHistory.length === 0"
          class="admin-profile-general__empty-state">
          {{ resolveText("admin.profile.general.empty.photoHistory", "No uploaded photos yet.") }}
        </div>

        <div
          v-else
          class="admin-profile-general__history-grid">
          <div
            v-for="photo in photoHistory"
            :key="photo.id"
            class="admin-profile-general__history-card">
            <UiImage
              v-if="photo.photo_url"
              class="admin-profile-general__history-image"
              :src="photo.photo_url" />
            <div
              v-else
              class="admin-profile-general__history-placeholder">
              {{ props.profileData?.initials || "AD" }}
            </div>

            <div class="admin-profile-general__history-card-body">
              <div class="admin-profile-general__history-card-top">
                <UiBadge
                  v-if="photo.is_current"
                  state="success"
                  outline
                  class="!px-3">
                  {{ resolveText("admin.profile.general.labels.currentPhoto", "Current") }}
                </UiBadge>
                <UiTextSmall class="admin-profile-general__history-date">
                  {{ formatDateTime(photo.created_at) }}
                </UiTextSmall>
              </div>

              <div class="admin-profile-general__history-card-actions">
                <UiButtonDefault
                  state="info--outline--small"
                  :disabled="photo.is_current || busyPhotoId === photo.id"
                  :isLoading="busyPhotoId === photo.id && busyPhotoAction === 'select'"
                  @click="selectPhoto(photo.id)">
                  {{ resolveText("admin.profile.actions.selectPhoto", "Use photo") }}
                </UiButtonDefault>

                <UiButtonDefault
                  state="danger--outline--small"
                  :disabled="busyPhotoId === photo.id"
                  :isLoading="busyPhotoId === photo.id && busyPhotoAction === 'delete'"
                  @click="deletePhoto(photo.id)">
                  {{ resolveText("admin.profile.actions.deletePhoto", "Delete") }}
                </UiButtonDefault>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelDefault>

    <PanelDefault class="admin-profile-general__details-panel">
      <div class="admin-profile-general__panel-header">
        <div>
          <UiTextH5 class="admin-profile-general__panel-title">
            {{ resolveText("admin.profile.general.sections.details", "General") }}
          </UiTextH5>
          <UiTextSmall class="admin-profile-general__panel-subtitle">
            {{
              resolveText(
                "admin.profile.general.hints.profileDetails",
                "Update the administrator account details used across the admin panel."
              )
            }}
          </UiTextSmall>
        </div>
      </div>

      <div class="admin-profile-general__form-grid">
        <div
          v-for="field in formFields"
          :key="field.key"
          class="admin-profile-general__field-card">
          <UiFormControl
            :label="field.label"
            :errors="formErrors[field.key] ?? []">
            <UiInput
              :type="field.type"
              :value="formData[field.key]"
              :placeholder="field.placeholder"
              @input="value => updateField(field.key, value)" />
          </UiFormControl>
        </div>
      </div>

      <div class="admin-profile-general__form-actions">
        <UiButtonDefault
          state="primary"
          :isLoading="isSaving"
          @click="saveProfile">
          {{ resolveText("admin.profile.actions.save", "Save changes") }}
        </UiButtonDefault>
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
  import axios from "axios";
  import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiBadge from "~/components/ui/UiBadge.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiImage from "~/components/ui/UiImage.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  const PHOTO_MAX_SIZE = 5 * 1024 * 1024;
  const PHOTO_PATH = "admin-profile-photos";

  const props = withDefaults(
    defineProps<{
      profileData?: Record<string, any> | null;
      isLoading?: boolean;
    }>(),
    {
      profileData: null,
      isLoading: false,
    }
  );

  const emit = defineEmits<{
    (event: "profile-updated", payload: any): void;
    (event: "profile-refresh"): void;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const selectedFile = ref<File | null>(null);
  const selectedPreviewUrl = ref("");
  const uploadProgress = ref(0);
  const isUploadingPhoto = ref(false);
  const isSaving = ref(false);
  const busyPhotoId = ref("");
  const busyPhotoAction = ref<"select" | "delete" | "">("");

  const fieldKeys = [
    "nickname",
    "email",
    "first_name",
    "mid_name",
    "last_name",
    "birthdate",
    "phone",
    "country",
    "state",
    "city",
    "address",
    "postal_code",
  ] as const;

  type FieldKey = (typeof fieldKeys)[number];

  const formData = reactive<Record<FieldKey, string>>({
    nickname: "",
    email: "",
    first_name: "",
    mid_name: "",
    last_name: "",
    birthdate: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    postal_code: "",
  });

  const createEmptyErrors = (): Record<FieldKey, string[]> => ({
    nickname: [],
    email: [],
    first_name: [],
    mid_name: [],
    last_name: [],
    birthdate: [],
    phone: [],
    country: [],
    state: [],
    city: [],
    address: [],
    postal_code: [],
  });

  const formErrors = reactive<Record<FieldKey, string[]>>(createEmptyErrors());

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const formFields = computed(() => [
    {
      key: "nickname" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.nickname", "Nickname"),
      placeholder: resolveText("admin.profile.general.fields.nickname", "Nickname"),
    },
    {
      key: "email" as FieldKey,
      type: "email",
      label: resolveText("admin.profile.general.fields.email", "Email"),
      placeholder: "admin@example.com",
    },
    {
      key: "first_name" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.firstName", "First name"),
      placeholder: resolveText("admin.profile.general.fields.firstName", "First name"),
    },
    {
      key: "last_name" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.lastName", "Last name"),
      placeholder: resolveText("admin.profile.general.fields.lastName", "Last name"),
    },
    {
      key: "mid_name" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.middleName", "Middle name"),
      placeholder: resolveText("admin.profile.general.fields.middleName", "Middle name"),
    },
    {
      key: "birthdate" as FieldKey,
      type: "date",
      label: resolveText("admin.profile.general.fields.birthdate", "Birthdate"),
      placeholder: "",
    },
    {
      key: "phone" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.phone", "Phone"),
      placeholder: resolveText("admin.profile.general.fields.phone", "Phone"),
    },
    {
      key: "country" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.country", "Country"),
      placeholder: resolveText("admin.profile.general.fields.country", "Country"),
    },
    {
      key: "state" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.state", "State / region"),
      placeholder: resolveText("admin.profile.general.fields.state", "State / region"),
    },
    {
      key: "city" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.city", "City"),
      placeholder: resolveText("admin.profile.general.fields.city", "City"),
    },
    {
      key: "address" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.address", "Address"),
      placeholder: resolveText("admin.profile.general.fields.address", "Address"),
    },
    {
      key: "postal_code" as FieldKey,
      type: "text",
      label: resolveText("admin.profile.general.fields.postalCode", "Postal code"),
      placeholder: resolveText("admin.profile.general.fields.postalCode", "Postal code"),
    },
  ]);

  const photoHistory = computed(() =>
    Array.isArray(props.profileData?.photo_history) ? props.profileData.photo_history : []
  );

  const avatarUrl = computed(() => selectedPreviewUrl.value || props.profileData?.photo_url || "");
  const selectedFileName = computed(() => selectedFile.value?.name || "");

  const resetErrors = () => {
    for (const key of fieldKeys) {
      formErrors[key] = [];
    }
  };

  const applyFormData = (payload: Record<string, any> | null | undefined) => {
    for (const key of fieldKeys) {
      formData[key] = String(payload?.[key] ?? "");
    }
  };

  const updateField = (field: FieldKey, value: string) => {
    formData[field] = value;
    formErrors[field] = [];
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const openFilePicker = () => {
    fileInputRef.value?.click();
  };

  const revokePreview = () => {
    if (!selectedPreviewUrl.value.startsWith("blob:")) {
      selectedPreviewUrl.value = "";
      return;
    }

    URL.revokeObjectURL(selectedPreviewUrl.value);
    selectedPreviewUrl.value = "";
  };

  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0] ?? null;
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(resolveText("admin.profile.general.errors.invalidFileType", "Please select an image file."));
      return;
    }

    if (file.size > PHOTO_MAX_SIZE) {
      toast.error(resolveText("admin.profile.general.errors.invalidFileSize", "Image size must be 5 MB or less."));
      return;
    }

    selectedFile.value = file;
    revokePreview();
    selectedPreviewUrl.value = URL.createObjectURL(file);
    uploadProgress.value = 0;
  };

  const saveProfile = async () => {
    isSaving.value = true;
    resetErrors();

    try {
      const response = await appCore.adminModules.profile.updateProfile({ ...formData });
      const payload = response?.data?.data ?? null;

      emit("profile-updated", payload);
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.general.messages.profileUpdated", "Profile updated successfully.")
      );
    } catch (error: any) {
      const responseErrors = error?.response?.data?.errors ?? {};
      for (const key of fieldKeys) {
        formErrors[key] = Array.isArray(responseErrors?.[key]) ? responseErrors[key] : [];
      }

      toast.error(
        error?.response?.data?.message ?? resolveText("admin.profile.errors.save", "Failed to save admin profile.")
      );
    } finally {
      isSaving.value = false;
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile.value) {
      return;
    }

    isUploadingPhoto.value = true;
    uploadProgress.value = 0;

    try {
      const presignResponse = await appCore.adminModules.profile.presignPhoto({
        filename: selectedFile.value.name,
        contentType: selectedFile.value.type,
        path: PHOTO_PATH,
      });

      const presignPayload = presignResponse?.data ?? {};
      if (!presignPayload?.url || !presignPayload?.key) {
        throw new Error("Presigned upload URL was not generated.");
      }

      await axios.put(presignPayload.url, selectedFile.value, {
        headers: {
          "Content-Type": selectedFile.value.type,
        },
        onUploadProgress: event => {
          uploadProgress.value = Math.round(((event.loaded ?? 0) * 100) / (event.total || 1));
        },
      });

      const response = await appCore.adminModules.profile.uploadPhoto({ key: presignPayload.key });
      emit("profile-updated", response?.data?.data ?? null);

      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.general.messages.photoUploaded", "Profile photo uploaded successfully.")
      );
      selectedFile.value = null;
      revokePreview();
      uploadProgress.value = 0;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.general.errors.photoUpload", "Failed to upload profile photo.")
      );
    } finally {
      isUploadingPhoto.value = false;
      if (fileInputRef.value) {
        fileInputRef.value.value = "";
      }
    }
  };

  const selectPhoto = async (photoId: string) => {
    busyPhotoId.value = photoId;
    busyPhotoAction.value = "select";

    try {
      const response = await appCore.adminModules.profile.selectPhoto(photoId);
      emit("profile-updated", response?.data?.data ?? null);
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.general.messages.photoSelected", "Profile photo updated successfully.")
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.general.errors.photoSelect", "Failed to select profile photo.")
      );
    } finally {
      busyPhotoId.value = "";
      busyPhotoAction.value = "";
    }
  };

  const deletePhoto = async (photoId: string) => {
    const isConfirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            resolveText("admin.profile.general.messages.photoDeleteConfirm", "Delete this photo from history?")
          );

    if (!isConfirmed) {
      return;
    }

    busyPhotoId.value = photoId;
    busyPhotoAction.value = "delete";

    try {
      const response = await appCore.adminModules.profile.deletePhoto(photoId);
      emit("profile-updated", response?.data?.data ?? null);
      toast.success(
        response?.data?.message ??
          resolveText("admin.profile.general.messages.photoDeleted", "Profile photo deleted successfully.")
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          resolveText("admin.profile.general.errors.photoDelete", "Failed to delete profile photo.")
      );
    } finally {
      busyPhotoId.value = "";
      busyPhotoAction.value = "";
    }
  };

  watch(
    () => props.profileData,
    value => {
      applyFormData(value);
    },
    { immediate: true, deep: true }
  );

  onBeforeUnmount(() => {
    revokePreview();
  });
</script>

<style scoped lang="scss">
  .admin-profile-general {
    display: grid;
    grid-template-columns: minmax(360px, 0.95fr) minmax(0, 1.35fr);
    gap: 22px;
  }

  .admin-profile-general__photo-panel,
  .admin-profile-general__details-panel {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .admin-profile-general__photo-panel {
    position: sticky;
    top: 20px;
    align-self: start;
    background:
      radial-gradient(circle at top left, rgba(113, 158, 223, 0.16), transparent 38%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  }

  .admin-profile-general__photo-hero {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .admin-profile-general__panel-header,
  .admin-profile-general__history-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-general__panel-title {
    color: var(--ui-text-main);
  }

  .admin-profile-general__panel-subtitle {
    color: var(--ui-text-secondary);
    line-height: 1.5;
  }

  .admin-profile-general__photo-chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .admin-profile-general__photo-chip {
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(7, 18, 53, 0.42);
    border: 1px solid rgba(113, 158, 223, 0.16);
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .admin-profile-general__photo-chip span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .admin-profile-general__photo-chip strong {
    color: var(--ui-text-main);
    font-size: 14px;
    word-break: break-word;
  }

  .admin-profile-general__photo-main {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px;
    border-radius: 24px;
    background: rgba(6, 15, 40, 0.34);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .admin-profile-general__avatar,
  .admin-profile-general__avatar-image,
  .admin-profile-general__avatar-placeholder {
    width: 136px;
    height: 136px;
    border-radius: 26px;
  }

  .admin-profile-general__avatar-image,
  .admin-profile-general__history-image {
    object-fit: cover;
    box-shadow: 0 18px 34px rgba(0, 0, 0, 0.24);
  }

  .admin-profile-general__avatar-placeholder,
  .admin-profile-general__history-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(50, 110, 255, 0.24), rgba(113, 158, 223, 0.42));
    color: var(--ui-text-main);
    font-size: 34px;
    font-weight: 700;
  }

  .admin-profile-general__photo-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-profile-general__photo-name {
    color: var(--ui-text-main);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.15;
  }

  .admin-profile-general__photo-email,
  .admin-profile-general__photo-last-seen {
    color: var(--ui-text-secondary);
    line-height: 1.5;
  }

  .admin-profile-general__photo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .admin-profile-general__photo-actions :deep(button) {
    min-width: 170px;
  }

  .admin-profile-general__selected-file {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--ui-text-secondary);
    padding: 0 2px;
  }

  .admin-profile-general__upload-progress {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .admin-profile-general__upload-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, rgba(113, 158, 223, 0.7), rgba(113, 223, 173, 0.85));
  }

  .admin-profile-general__history-shell {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 6px;
    border-top: 1px solid rgba(113, 158, 223, 0.12);
  }

  .admin-profile-general__empty-state {
    min-height: 132px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.025);
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .admin-profile-general__history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 14px;
  }

  .admin-profile-general__history-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .admin-profile-general__history-card:hover {
    transform: translateY(-2px);
    border-color: rgba(113, 158, 223, 0.22);
    background: rgba(255, 255, 255, 0.05);
  }

  .admin-profile-general__history-image,
  .admin-profile-general__history-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16px;
  }

  .admin-profile-general__history-card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-general__history-card-top {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-profile-general__history-date {
    color: var(--ui-text-secondary);
  }

  .admin-profile-general__history-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .admin-profile-general__details-panel {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)), rgba(7, 18, 53, 0.28);
  }

  .admin-profile-general__form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .admin-profile-general__field-card {
    padding: 14px 14px 10px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .admin-profile-general__field-card:hover {
    border-color: rgba(113, 158, 223, 0.2);
    background: rgba(255, 255, 255, 0.045);
  }

  .admin-profile-general__field-card :deep(.ui-form-control__label) {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ui-text-secondary);
  }

  .admin-profile-general__form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 4px;
  }

  .admin-profile-general__form-actions :deep(button) {
    min-width: 220px;
  }

  @media (max-width: 1120px) {
    .admin-profile-general {
      grid-template-columns: 1fr;
    }

    .admin-profile-general__photo-panel {
      position: static;
    }
  }

  @media (max-width: 720px) {
    .admin-profile-general__photo-chips,
    .admin-profile-general__form-grid {
      grid-template-columns: 1fr;
    }

    .admin-profile-general__panel-header,
    .admin-profile-general__history-header,
    .admin-profile-general__photo-main {
      flex-direction: column;
      align-items: flex-start;
    }

    .admin-profile-general__photo-actions,
    .admin-profile-general__form-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-profile-general__photo-actions :deep(button),
    .admin-profile-general__form-actions :deep(button) {
      width: 100%;
      min-width: 0;
    }
  }
</style>
