<template>
  <div class="user-verification__wrapper">
    <div class="user-verification__left">
      <PanelDefault>

        <div class="user-verification__left__title__wrapper">
          <UiTextH5 class="user-verification__left__title"># Status</UiTextH5>
          <div>
            <span class="user-documents-uploader__title__options_reload"
                  @click="handleRefreshDocuments"
            >
              <UiIconUpdate :class="{ spin: isLoading }"/>
            </span>
          </div>
        </div>

        <div class="user-verification__left__verification-list_wrapper">
          <ul class="user-verification__left__verification-list">

            <li>
              <span>Email</span>
              <UiIconSuccess v-if="emailStatus === 'approved'"/>
              <UiIconWarning v-if="emailStatus === 'pending'"/>
              <UiIconFailed v-if="emailStatus === 'rejected'"/>
              <span v-if="emailStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="emailStatus === 'pending'">{{ 'Ожидает подтверждения!' }}</span>
              <span v-if="emailStatus === 'rejected'">{{ 'Отклонено!' }}</span>
              <span class="spacer"></span>
            </li>

            <li>
              <span>Фото профиля</span>
              <UiIconSuccess v-if="photoStatus === 'approved'"/>
              <UiIconWarning v-if="photoStatus === 'pending'"/>
              <UiIconFailed v-if="photoStatus === 'rejected'"/>
              <span v-if="photoStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="photoStatus === 'pending'">{{ 'Не загружено!' }}</span>
              <span v-if="photoStatus === 'rejected'">{{ 'Отклонено!' }}</span>
              <span class="spacer"></span>
            </li>

            <li>
              <span>Адрес</span>
              <UiIconSuccess v-if="addressStatus === 'approved'"/>
              <UiIconWarning v-if="addressStatus === 'pending'"/>
              <UiIconFailed v-if="addressStatus === 'rejected'"/>
              <span v-if="addressStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="addressStatus === 'pending'">{{ 'Ожидает верификации!' }}</span>
              <span v-if="addressStatus === 'rejected'">{{ 'Отклонено!' }}</span>
              <VerificationActions
                  :enable-comment="true"
                  :comment="addressComment"
                  :status="addressStatus"
                  @update-status="handleVerificationAddress"
              />
            </li>
            <li>
              <span>Документы</span>
              <UiIconSuccess v-if="documentsStatus === 'approved'"/>
              <UiIconWarning v-if="documentsStatus === 'pending'"/>
              <UiIconFailed v-if="documentsStatus === 'rejected'"/>
              <span v-if="documentsStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="documentsStatus === 'pending'">{{ 'Ожидает верификации!' }}</span>
              <span v-if="documentsStatus === 'rejected'">{{ 'Отклонено!' }}</span>
              <VerificationActions
                  :enable-comment="true"
                  :comment="documentsComment"
                  :status="documentsStatus"
                  @update-status="handleVerificationDocuments"
              />
            </li>
            <li>
              <span>1-й Депозит</span>
              <UiIconSuccess v-if="depositStatus === 'approved'"/>
              <UiIconWarning v-if="depositStatus === 'pending'"/>
              <UiIconFailed v-if="depositStatus === 'rejected'"/>
              <span v-if="depositStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="depositStatus === 'pending'">{{ 'Ожидает верификации!' }}</span>
              <span v-if="depositStatus === 'rejected'">{{ 'Отклонено!' }}</span>
              <span class="spacer"></span>
            </li>
            <li>
              <span>Профиль</span>
              <UiIconSuccess v-if="infoStatus === 'approved'"/>
              <UiIconWarning v-if="infoStatus === 'pending'"/>
              <UiIconFailed v-if="infoStatus === 'rejected'"/>
              <span v-if="infoStatus === 'approved'">{{ 'Успешно верифицирован!' }}</span>
              <span v-if="infoStatus === 'pending'">{{ 'Ожидает верификации!' }}</span>
              <span v-if="infoStatus === 'rejected'">{{ 'Отклонено!' }}</span>
            </li>
          </ul>
          <div class="user-verification__left__verification-list--is-loading" v-if="isLoading">
            <UiIconSpinnerDefault/>
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="user-verification__right">
      <PanelDefault class="user-verification__right__panel">

        <UiTextH5 class="user-verification__right__panel__title">
          <span># Profile info</span>
          <VerificationActions
              :enable-comment="true"
              :comment="infoComment"
              :status="infoStatus"
              @update-status="handleVerificationProfile"
          />
        </UiTextH5>

        <div class="user-verification__right__panel__personal-info">
          <div class="personal-info__item">
            <span>Имя: </span>
            <span>{{ props.userData.first_name }}</span>
          </div>

          <div class="personal-info__item">
            <span>Фамилия: </span>
            <span>{{ props.userData.last_name }}</span>
          </div>

          <div class="personal-info__item">
            <span>Отчество: </span>
            <span>{{ props.userData.mid_name }}</span>
          </div>

          <div class="personal-info__item">
            <span>Дата рождения: </span>
            <span>{{ props.userData.birthdate }}</span>
          </div>

          <div class="personal-info__item">
            <span>Телефон: </span>
            <span>{{ props.userData.phone }}</span>
          </div>

          <div class="personal-info__item">
            <span>Страна: </span>
            <span>{{ props.userData.country }}</span>
          </div>

          <div class="personal-info__item">
            <span>Город: </span>
            <span>{{ props.userData.city }}</span>
          </div>

          <div class="personal-info__item">
            <span>Штат: </span>
            <span>{{ props.userData.state }}</span>
          </div>

          <div class="personal-info__item">
            <span>Адрес: </span>
            <span>{{ props.userData.address }}</span>
          </div>

          <div class="personal-info__item">
            <span>Индекс: </span>
            <span>{{ props.userData.postal_code }}</span>
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

        <div class="document" v-for="documentRequestData in documentsListRequestData" :key="documentRequestData.id">
          <div class="document__options">
            <VerificationActions
                :status="documentRequestData.state"
                @update-status="handleVerificationDocument($event, documentRequestData.id)"
            />
          </div>
          <UiImage
              class="document__options__doc-image"
              :src="documentRequestData.document_data.full_url"
              @click="handleClientDocumentImage(documentRequestData.document_data.full_url)"
          />
          <span class="document__options__doc-title"># {{ documentRequestData.document_data.number }}</span>
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
import {onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import UiImage from "~/components/ui/UiImage.vue";

interface VerificationSection {
  verification_status: string,
  comment: string
}

interface VerificationRequestDto {
  info: VerificationSection
  photo: VerificationSection
  email: VerificationSection
  address: VerificationSection
  documents: VerificationSection
  deposit: VerificationSection
}

const initialData: VerificationRequestDto = {
  info: {verification_status: "pending", comment: ""},
  email: {verification_status: "pending", comment: ""},
  photo: {verification_status: "pending", comment: ""},
  address: {verification_status: "pending", comment: ""},
  documents: {verification_status: "pending", comment: ""},
  deposit: {verification_status: "pending", comment: ""},
}

const props = defineProps({
  userData: {
    type: Object,
    default: {}
  },
  clientId: {
    type: String,
    required: false
  },
});

const appCore = useAppCore();
const isLoading = ref(false);
const toast = useToast();
let verificationRequestData = reactive<VerificationRequestDto>(initialData)
let documentsListRequestData = reactive([])
const {t} = useI18n({useScope: "global"});

const infoStatus = ref("pending");
const infoComment = ref("");
const emailStatus = ref("pending");
const emailComment = ref("");
const photoStatus = ref("pending");
const photoComment = ref("");
const addressStatus = ref("pending");
const addressComment = ref("");
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
    infoStatus.value = verificationRequestData?.info?.verification_status
    infoComment.value = verificationRequestData?.info?.comment
    emailStatus.value = verificationRequestData?.email?.verification_status
    emailComment.value = verificationRequestData?.email?.comment
    photoStatus.value = verificationRequestData?.photo?.verification_status
    photoComment.value = verificationRequestData?.photo?.comment
    addressStatus.value = verificationRequestData?.address?.verification_status
    addressComment.value = verificationRequestData?.address?.comment
    depositStatus.value = verificationRequestData?.deposit?.verification_status
    depositComment.value = verificationRequestData?.deposit?.comment
    documentsStatus.value = verificationRequestData?.documents?.verification_status
    documentsComment.value = verificationRequestData?.documents?.comment
  }
  const responseDocumentsRequest = await appCore.adminModules.documents.get({clientId: props.clientId})
  documentsListRequestData.splice(0, documentsListRequestData.length, ...responseDocumentsRequest.data.data);

  isLoading.value = false;
}

const handleRefreshDocuments = async () => {
  await loadVerificationData();
}

const handleVerificationAddress = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    type: 'address',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleVerificationDocuments = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    type: 'documents',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleVerificationDocument = async (value: any, docId: string = '') => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    docId: docId,
    type: 'document',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Document status updated!')
  await loadVerificationData();
}

const handleVerificationProfile = async (value: any) => {
  isLoading.value = true;
  await appCore.adminModules.verificationRequests.put(props.clientId, {
    documentId: '',
    type: 'info',
    updatedStatus: {status : value.status, comment: value.comment}
  })
  toast.success('Address status updated!')
  await loadVerificationData();
}

const handleClientDocumentImage = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
}

onMounted(async () => {
  await loadVerificationData();
})
</script>

<style lang="scss" scoped>
.spacer {
  width: 90px;
  height: 20px;
  margin: 0;
}

.approved {
  color: var(--color-success)
}

.pending {
  color: var(--color-warning)
}

.rejected {
  color: var(--color-danger)
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
}

.user {
  &-verification {
    &__wrapper {
      display: flex;
      justify-content: space-between;
      gap: 20px;

      color: var(--ui-text-main);
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

        &_wrapper {
          position: relative;
        }

        &--is-loading {
          display: flex;
          align-items: center;
          justify-content: center;

          background-color: var(--ui-background);
          opacity: .3;

          border-radius: 10px;

          position: absolute;

          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        li {
          min-height: 50px;
          display: grid;
          align-items: center;
          border-bottom: 1px solid var(--color-stroke-ui-dark);
          grid-template-columns: 110px 60px 1fr 140px;
          padding: 10px 20px;

          &:last-child {
            border-bottom: none;
          }
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

      .personal-info__item {
        margin-top: 10px;
        margin-bottom: 10px;
        height: 30px;
        border-bottom: 1px solid var(--color-stroke-ui-dark);
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:last-child {
          border-bottom: none;
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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 20px;

    @media (max-width: 1073px) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media (max-width: 794px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 601px) {
      grid-template-columns: 1fr;
    }

    .document {
      min-height: 200px;
      height: auto;
      min-width: 180px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;

      border: 1px solid var(--color-stroke-ui-dark);
      border-radius: 8px;
      user-select: none;

      position: relative;

      &__options {
        z-index: 99;
        background-color: var(--ui-background);
        position: absolute;
        bottom: 0;
        right: 10px;
        text-align: center;
        border-radius: 10px;
        height: 38px;
        width: min-content;
        margin: 0 auto 10px auto;

        &__doc-title {
          color: var(--ui-text-main);
          font-weight: bold;
          position: absolute;
          left: 10px;
          top: 10px;
          background-color: var(--ui-background);
          border: 1px solid var(--color-primary);
          padding: 5px;
          border-radius: 4px;
        }

        &__doc-image {
          border-radius: 7px;
        }
      }

      &:hover {
        background-color: var(--color-stroke-ui-dark);
        border: 1px solid var(--ui-primary-main);
      }

      &:active {
        opacity: .5;
      }
    }
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
</style>
