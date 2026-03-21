<template>
  <div class="user-verification__wrapper">
    <div class="user-verification__right">
      <PanelDefault class="user-verification__right__panel">
        <div class="user-profile-card">
          <div class="user-profile-card__header">
            <div>
              <UiTextH5 class="user-profile-card__name">
                {{ props.userData.first_name }}
                {{ props.userData.last_name }}
                {{ props.userData.mid_name }}
              </UiTextH5>
              <div class="user-profile-card__subtitle">
                {{ props.userData.email || "-" }}
              </div>
            </div>
            <div class="user-profile-card__meta">
              <span>Дата рождения: {{ props.userData.birthdate || "-" }}</span>
              <span>Телефон: {{ props.userData.phone || "-" }}</span>
            </div>
          </div>

          <div class="user-profile-card__grid">
            <div class="user-profile-card__item">
              <span class="label">Страна</span>
              <span class="value">{{ props.userData.country || "-" }}</span>
            </div>
            <div class="user-profile-card__item">
              <span class="label">Город</span>
              <span class="value">{{ props.userData.city || "-" }}</span>
            </div>
            <div class="user-profile-card__item">
              <span class="label">Штат</span>
              <span class="value">{{ props.userData.state || "-" }}</span>
            </div>
            <div class="user-profile-card__item">
              <span class="label">Индекс</span>
              <span class="value">{{ props.userData.postal_code || "-" }}</span>
            </div>
            <div class="user-profile-card__item wide">
              <span class="label">Адрес</span>
              <span class="value">{{ props.userData.address || "-" }}</span>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="user-verification__left">
      <PanelDefault>
        <div class="user-verification__left__title__wrapper">
          <UiTextH5 class="user-verification__left__title"># Status</UiTextH5>
          <div>
            <span
              class="user-documents-uploader__title__options_reload"
              @click="handleRefreshDocuments">
              <UiIconUpdate :class="{ spin: isLoading }" />
            </span>
          </div>
        </div>

        <div class="user-verification__left__verification-list_wrapper">
          <ul class="user-verification__left__verification-list">
            <li>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="infoStatus === 'approved'" />
                <UiIconWarning v-if="infoStatus === 'pending'" />
                <UiIconFailed v-if="infoStatus === 'rejected'" />
                <span v-if="infoStatus === 'approved'">{{ "Профиль — Успешно верифицирован!" }}</span>
                <span v-if="infoStatus === 'pending'">{{ "Профиль — Ожидает верификации!" }}</span>
                <span v-if="infoStatus === 'rejected'">{{ "Профиль — Отклонено!" }}</span>
              </div>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                <VerificationActions
                  :enable-comment="true"
                  :comment="infoComment"
                  :status="infoStatus"
                  :disabled="!canUpdateVerifications"
                  @update-status="handleVerificationProfile" />
              </div>
            </li>

            <li>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="emailStatus === 'approved'" />
                <UiIconWarning v-if="emailStatus === 'pending'" />
                <UiIconFailed v-if="emailStatus === 'rejected'" />
                <span v-if="emailStatus === 'approved'">{{ "Email — Успешно верифицирован!" }}</span>
                <span v-if="emailStatus === 'pending'">{{ "Email — Ожидает подтверждения!" }}</span>
                <span v-if="emailStatus === 'rejected'">{{ "Email — Отклонено!" }}</span>
              </div>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>

            <li>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="photoStatus === 'approved'" />
                <UiIconWarning v-if="photoStatus === 'pending'" />
                <UiIconFailed v-if="photoStatus === 'rejected'" />
                <span v-if="photoStatus === 'approved'">{{ "Фото профиля — Успешно верифицирован!" }}</span>
                <span v-if="photoStatus === 'pending'">{{ "Фото профиля — Не загружено!" }}</span>
                <span v-if="photoStatus === 'rejected'">{{ "Фото профиля — Отклонено!" }}</span>
              </div>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>

            <li>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="documentsStatus === 'approved'" />
                <UiIconWarning v-if="documentsStatus === 'pending'" />
                <UiIconFailed v-if="documentsStatus === 'rejected'" />
                <span v-if="documentsStatus === 'approved'">{{ "Документы — Успешно верифицирован!" }}</span>
                <span v-if="documentsStatus === 'pending'">{{ "Документы — Ожидает верификации!" }}</span>
                <span v-if="documentsStatus === 'rejected'">{{ "Документы — Отклонено!" }}</span>
              </div>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                <VerificationActions
                  :enable-comment="true"
                  :comment="documentsComment"
                  :status="documentsStatus"
                  :disabled="!canUpdateVerifications"
                  @update-status="handleVerificationDocuments" />
              </div>
            </li>
            <li>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                <UiIconSuccess v-if="depositStatus === 'approved'" />
                <UiIconWarning v-if="depositStatus === 'pending'" />
                <UiIconFailed v-if="depositStatus === 'rejected'" />
                <span v-if="depositStatus === 'approved'">{{ "1-й Депозит — Успешно верифицирован!" }}</span>
                <span v-if="depositStatus === 'pending'">{{ "1-й Депозит — Ожидает верификации!" }}</span>
                <span v-if="depositStatus === 'rejected'">{{ "1-й Депозит — Отклонено!" }}</span>
              </div>
              <div
                class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
            </li>
          </ul>
          <div
            class="user-verification__left__verification-list--is-loading"
            v-if="isLoading">
            <UiIconSpinnerDefault />
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>

  <div class="user-verification__documents_wrapper">
    <PanelDefault class="user-verification__documents">
      <UiTextH5 class="user-verification__documents__title"># Documents verification</UiTextH5>

      <div class="user-verification__documents__content">
        <div v-if="documentsListRequestData.length === 0">No documents...</div>

        <div
          class="document"
          v-for="documentRequestData in documentsListRequestData"
          :key="documentRequestData.id">
          <UiImage
            class="document__image"
            :src="documentRequestData.document_data.full_url"
            @click="handleClientDocumentImage(documentRequestData.document_data.full_url)" />
          <div class="document__meta">
            <span class="document__title"># {{ documentRequestData.document_data.number }}</span>
          </div>
          <div class="document__options">
            <VerificationActions
              :status="documentRequestData.state"
              :disabled="!canUpdateVerifications"
              @update-status="handleVerificationDocument($event, documentRequestData.id)" />
          </div>
        </div>
      </div>
    </PanelDefault>
  </div>

  <div class="user-verification__panel_wrapper">
    <PanelDefault class="user-verification__panel">
      <UiTextH5 class="user-verification__panel__title"># KYC verification history</UiTextH5>
      <div class="user-verification__panel__verification-history">
        <div class="user-verification__panel__verification-history_log">
          <span class="approved">Sent verification mail.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:04</span>
        </div>
        <div class="user-verification__panel__verification-history_log">
          <span class="pending">You requested profile photo verification.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:11</span>
        </div>
        <div class="user-verification__panel__verification-history_log">
          <span class="approved">Your profile photo was automatic approved.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:15</span>
        </div>
        <div class="user-verification__panel__verification-history_log">
          <span class="pending">Requested user data verification.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 00:45</span>
        </div>
        <div class="user-verification__panel__verification-history_log">
          <span class="approved">Your user data was approved.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 02:41</span>
        </div>
        <div class="user-verification__panel__verification-history_log">
          <span class="rejected">Your user data was rejected.</span>
          <span class="user-verification__panel__verification-history_log_time">2025-06-10 02:43</span>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script lang="ts" setup>
  import useAppCore from "~/composables/useAppCore";
  import { computed, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiIconFailed from "~/components/ui/UiIconFailed.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconWarning from "~/components/ui/UiIconWarning.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
  import UiImage from "~/components/ui/UiImage.vue";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  interface VerificationSection {
    verification_status: string;
    comment: string;
  }

  interface VerificationRequestDto {
    info: VerificationSection;
    photo: VerificationSection;
    email: VerificationSection;
    documents: VerificationSection;
    deposit: VerificationSection;
  }

  const initialData: VerificationRequestDto = {
    info: { verification_status: "pending", comment: "" },
    email: { verification_status: "pending", comment: "" },
    photo: { verification_status: "pending", comment: "" },
    documents: { verification_status: "pending", comment: "" },
    deposit: { verification_status: "pending", comment: "" },
  };

  const props = defineProps({
    userData: {
      type: Object,
      default: {},
    },
    clientId: {
      type: String,
      required: false,
    },
  });

  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const isLoading = ref(false);
  const toast = useToast();
  let verificationRequestData = reactive<VerificationRequestDto>(initialData);
  let documentsListRequestData = reactive([]);
  const { t } = useI18n({ useScope: "global" });
  const canUpdateVerifications = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-verifications")
  );

  const infoStatus = ref("pending");
  const infoComment = ref("");
  const emailStatus = ref("pending");
  const emailComment = ref("");
  const photoStatus = ref("pending");
  const photoComment = ref("");
  const depositStatus = ref("pending");
  const depositComment = ref("");
  const documentsStatus = ref("pending");
  const documentsComment = ref("");

  const loadVerificationData = async () => {
    isLoading.value = true;

    const response = await appCore.adminModules.verificationRequests.get(props.clientId);
    const verificationRequestDto = response.data.data.length > 0 ? response.data.data[0] : {};

    Object.assign(verificationRequestData, verificationRequestDto.data);

    if (verificationRequestData) {
      infoStatus.value = verificationRequestData?.info?.verification_status;
      infoComment.value = verificationRequestData?.info?.comment;
      emailStatus.value = verificationRequestData?.email?.verification_status;
      emailComment.value = verificationRequestData?.email?.comment;
      photoStatus.value = verificationRequestData?.photo?.verification_status;
      photoComment.value = verificationRequestData?.photo?.comment;
      depositStatus.value = verificationRequestData?.deposit?.verification_status;
      depositComment.value = verificationRequestData?.deposit?.comment;
      documentsStatus.value = verificationRequestData?.documents?.verification_status;
      documentsComment.value = verificationRequestData?.documents?.comment;
    }
    const responseDocumentsRequest = await appCore.adminModules.documents.get({ clientId: props.clientId });
    documentsListRequestData.splice(0, documentsListRequestData.length, ...responseDocumentsRequest.data.data);

    isLoading.value = false;
  };

  const handleRefreshDocuments = async () => {
    await loadVerificationData();
  };

  const handleVerificationDocuments = async (value: any) => {
    if (!canUpdateVerifications.value) {
      return;
    }

    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "documents",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Address status updated!");
    await loadVerificationData();
  };

  const handleVerificationDocument = async (value: any, docId: string = "") => {
    if (!canUpdateVerifications.value) {
      return;
    }

    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      docId: docId,
      type: "document",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Document status updated!");
    await loadVerificationData();
  };

  const handleVerificationProfile = async (value: any) => {
    if (!canUpdateVerifications.value) {
      return;
    }

    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      documentId: "",
      type: "info",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Address status updated!");
    await loadVerificationData();
  };

  const handleClientDocumentImage = url => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  onMounted(async () => {
    await loadVerificationData();
  });
</script>

<style lang="scss" scoped>
  .spacer {
    width: 90px;
    height: 20px;
    margin: 0;
  }

  .approved {
    color: var(--color-success);
  }

  .pending {
    color: var(--color-warning);
  }

  .rejected {
    color: var(--color-danger);
  }

  @media (max-width: 991px) {
    .user-verification__wrapper {
      flex-direction: column;
    }

    .user-verification__left {
      width: 100% !important;
    }

    .user-verification__right {
      width: 100% !important;
    }

    .user-profile-card__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .user-profile-card__meta {
      text-align: left;
    }

    .user-profile-card__grid {
      grid-template-columns: 1fr;
    }
  }

  .user {
    &-verification {
      &__wrapper {
        display: flex;
        justify-content: space-between;
        gap: 20px;

        color: var(--ui-text-main);
      }

      .user-profile-card {
        background: var(--ui-background-panel);
        border: 1px solid var(--color-stroke-ui-light);
        border-radius: 14px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .user-profile-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .user-profile-card__name {
        color: var(--ui-text-main);
      }

      .user-profile-card__subtitle {
        color: var(--ui-text-secondary);
        font-size: 13px;
        margin-top: 4px;
      }

      .user-profile-card__meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: right;
        color: var(--ui-text-secondary);
        font-size: 12px;
      }

      .user-profile-card__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 16px;
      }

      .user-profile-card__item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-profile-card__item .label {
        color: var(--ui-text-secondary);
        font-size: 12px;
      }

      .user-profile-card__item .value {
        color: var(--ui-text-main);
        font-size: 14px;
        word-break: break-word;
      }

      .user-profile-card__item.wide {
        grid-column: 1 / -1;
      }

      &__left {
        width: 50%;

        & > div {
          padding: 20px;
        }

        &__title {
          margin-bottom: 40px;

          &__wrapper {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
          }
        }

        &__verification-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;

          &_wrapper {
            position: relative;
          }

          &--is-loading {
            display: flex;
            align-items: center;
            justify-content: center;

            background-color: var(--ui-background);
            opacity: 0.6;

            border-radius: 12px;
            backdrop-filter: blur(6px);
            z-index: 10;

            position: absolute;

            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          li {
            min-height: 36px;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 12px;
            padding: 0;
          }
        }

        &__verification-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          width: 100%;

          &--status {
            justify-content: flex-start;

            span {
              display: block;
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          &--actions {
            justify-content: flex-end;
          }
        }
      }

      &__right {
        width: 50%;

        & > div {
          padding: 20px;
        }

        &__title {
          margin-bottom: 20px;
        }

        &__panel {
          &__title {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }

    &-photo {
      &-uploader {
        color: var(--ui-text-main);
      }

      &__right__panel {
        color: var(--ui-text-main);
      }
    }
  }

  .user-verification__documents {
    padding: 20px;

    &_wrapper {
      margin-top: 20px;
      margin-bottom: 20px;
    }

    &__title {
      margin-bottom: 20px;
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .document {
        min-height: 120px;
        height: auto;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        background: var(--ui-background-panel);
        border: 1px solid var(--color-stroke-ui-light);
        border-radius: 12px;
        padding: 12px 14px;
        user-select: none;
        position: relative;

        &__options {
          z-index: 1;
          background-color: transparent;
          position: static;
          border-radius: 0;
          height: auto;
          width: auto;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          margin-left: auto;
        }

        &__image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          flex-shrink: 0;
        }

        &__meta {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          min-width: 0;
        }

        &__title {
          color: var(--ui-text-main);
          font-weight: 600;
        }

        &:hover {
          background-color: var(--color-stroke-ui-dark);
        }

        &:active {
          opacity: 0.5;
        }
      }

      @media (max-width: 768px) {
        .document {
          flex-direction: column;
        }

        .document__options {
          width: 100%;
          align-items: flex-start;
          margin-left: 0;
        }

        .document__image {
          width: 100%;
          height: auto;
        }
      }
    }
  }

  .user-verification__right__info-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    li {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 8px;
      padding: 0;
    }
  }

  .user-verification__right__info-group {
    background: var(--ui-background-panel);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 12px;
    padding: 8px;
  }

  .user-verification__right__status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    margin-bottom: 16px;
  }

  .user-verification__right__status-row-text {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .user-verification__right__info-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    width: 100%;
    white-space: nowrap;

    &--value {
      justify-content: flex-end;

      span {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &--actions {
      display: none;
    }
  }

  .user-verification__panel {
    padding: 20px;
    height: 100%;
    width: 100%;

    &_wrapper {
      padding-bottom: 20px;
    }

    &__title {
      margin-bottom: 20px;
    }

    &__verification-history {
      padding-top: 10px;
      padding-bottom: 10px;

      &_log {
        padding: 10px;
        border-bottom: 1px solid var(--color-stroke-ui-dark);
        margin-bottom: 1px;

        display: flex;
        align-items: center;
        justify-content: space-between;

        &_time {
          font-size: 12px;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .user-verification__left__verification-list li {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .user-verification__left__verification-cell--actions {
      width: 100%;
      justify-content: flex-start;
    }

    .user-verification__right__info-list {
      grid-template-columns: 1fr;
    }

    .user-verification__right__info-list li {
      grid-template-columns: 1fr;
      align-items: flex-start;
      gap: 6px;
    }

    .user-verification__right__info-cell--actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
