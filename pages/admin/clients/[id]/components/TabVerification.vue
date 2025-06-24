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

          <div>
            {{ verificationRequestData }}
          </div>

          <ul class="user-verification__left__verification-list">
            <li>
              <UiIconFailed/>
              <span>Email is not verified!</span>
              <span class="spacer"></span>
            </li>

            <li>
              <UiIconFailed/>
              <span>{{ t("cabinet.dashboard.accountVerification.addressFailed") }}</span>
              <VerificationActions status="rejected"/>
            </li>
            <li>
              <UiIconSuccess/>
              <span>{{ t("cabinet.dashboard.accountVerification.documentVerified") }}</span>
              <VerificationActions status="approved"/>
            </li>
            <li>
              <UiIconWarning/>
              <span>{{ t("cabinet.dashboard.accountVerification.paymentInProgress") }}</span>
              <span class="spacer"></span>
            </li>
            <li>
              <UiIconWarning/>
              <span>{{ t("cabinet.dashboard.accountVerification.profileInProgress") }}</span>
              <VerificationActions status="pending"/>
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
          <VerificationActions status="pending"/>
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
        <div class="document">
          <div class="document__options">
            <VerificationActions :document="{'name': 1}" status="rejected"/>
          </div>
          <UiIconImage/>
          <span># Doc1</span>
        </div>

        <div class="document">
          <div class="document__options">
            <VerificationActions :document="{'name': 1}" status="pending"/>
          </div>
          <UiIconImage/>
          <span># Doc2</span>
        </div>

        <div class="document">
          <div class="document__options">
            <VerificationActions :document="{'name': 1}" status="pending"/>
          </div>
          <UiIconImage/>
          <span># Doc3</span>
        </div>

        <div class="document">
          <div class="document__options">
            <VerificationActions :document="{'name': 1}" status="approved"/>
          </div>
          <UiIconImage/>
          <span># Doc4</span>
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
import {useI18n} from "vue-i18n";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import {onMounted, reactive, ref} from "vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconImage from "~/components/ui/UiIconImage.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import useAppCore from "~/composables/useAppCore";
import verificationRequestsModule
  from "~/composables/core/modules/adminModules/verificationRequests/verificationRequests.module";

interface VerificationSection {
  verification_status: "",
  comment: ""
}

interface VerificationRequestDto {
  info: VerificationSection
  photo: VerificationSection
  email: VerificationSection
  address: VerificationSection
  documents: VerificationSection
  deposit: VerificationSection
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
let verificationRequestData = reactive({});
const {t} = useI18n({useScope: "global"});

const loadVerificationData = async () => {
  isLoading.value = true;

  const response = await appCore.adminModules.verificationRequests.get(props.clientId.value);
  const verificationRequestDto = response.data.data.length > 0 ? response.data.data[0] : {};
  Object.assign(verificationRequestData, verificationRequestDto.data);

  isLoading.value = false;
}

const handleRefreshDocuments = async () => {
  await loadVerificationData();
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

.user {
  &-verification {
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
          height: 50px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--color-stroke-ui-dark);
          justify-content: space-between;
          padding: 0 10px;

          span {
          }

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
    display: flex;
    gap: 20px;

    .document {
      height: 200px;
      width: 200px;

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
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        text-align: center;
        border-radius: 10px;
        height: 30px;
        width: min-content;
        margin: 0 auto 10px auto;
        background-color: var(--color-stroke-ui-dark);
      }

      &:hover {
        background-color: var(--ui-primary-main);
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
