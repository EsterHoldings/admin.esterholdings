<template>
  <div class="user-verification__wrapper">
    <div class="user-verification__left">
      <PanelDefault>
        <div class="user-verification__left__title__wrapper">
          <UiTextH5 class="user-verification__left__title"># Verification status</UiTextH5>
          <div>
            <span class="user-documents-uploader__title__options_reload"
                  @click="handleRefreshDocuments"
            >
              <UiIconUpdate :class="{ spin: isLoading }" />
            </span>
          </div>
        </div>
        <div class="user-verification__left__verification-list_wrapper">
          <ul class="user-verification__left__verification-list">
            <li>
              <span>Email</span>
              <UiIconFailed v-if="emailStatus === 'rejected'"/>
              <UiIconWarning v-if="emailStatus === 'pending'"/>
              <UiIconSuccess v-if="emailStatus === 'approved'"/>
              <span v-if="emailStatus === 'rejected'">Отклонен!</span>
              <span v-if="emailStatus === 'pending'">В обработке!</span>
              <span v-if="emailStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="emailComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="emailComment"></div>
              <div v-if="emailComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ emailComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
            <li>
              <span>Фото</span>
              <UiIconFailed v-if="photoStatus === 'rejected'"/>
              <UiIconWarning v-if="photoStatus === 'pending'"/>
              <UiIconSuccess v-if="photoStatus === 'approved'"/>
              <span v-if="photoStatus === 'rejected'">Отклонен!</span>
              <span v-if="photoStatus === 'pending'">В обработке!</span>
              <span v-if="photoStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="photoComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="photoComment"></div>
              <div v-if="photoComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ photoComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
            <li>
              <span>Адрес</span>
              <UiIconFailed v-if="addressStatus === 'rejected'"/>
              <UiIconWarning v-if="addressStatus === 'pending'"/>
              <UiIconSuccess v-if="addressStatus === 'approved'"/>
              <span v-if="addressStatus === 'rejected'">Отклонен!</span>
              <span v-if="addressStatus === 'pending'">В обработке!</span>
              <span v-if="addressStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="addressComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="addressComment"></div>
              <div v-if="addressComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ addressComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
            <li>
              <span>Документы</span>
              <UiIconFailed v-if="documentsStatus === 'rejected'"/>
              <UiIconWarning v-if="documentsStatus === 'pending'"/>
              <UiIconSuccess v-if="documentsStatus === 'approved'"/>
              <span v-if="documentsStatus === 'rejected'">Отклонен!</span>
              <span v-if="documentsStatus === 'pending'">В обработке!</span>
              <span v-if="documentsStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="documentsComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="documentsComment"></div>
              <div v-if="documentsComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ documentsComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
            <li>
              <span>1-й Депозит</span>
              <UiIconFailed v-if="depositStatus === 'rejected'"/>
              <UiIconWarning v-if="depositStatus === 'pending'"/>
              <UiIconSuccess v-if="depositStatus === 'approved'"/>
              <span v-if="depositStatus === 'rejected'">Отклонен!</span>
              <span v-if="depositStatus === 'pending'">В обработке!</span>
              <span v-if="depositStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="depositComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="depositComment"></div>
              <div v-if="depositComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ depositComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
            <li>
              <span>Профиль</span>
              <UiIconFailed v-if="infoStatus === 'rejected'"/>
              <UiIconWarning v-if="infoStatus === 'pending'"/>
              <UiIconSuccess v-if="infoStatus === 'approved'"/>
              <span v-if="infoStatus === 'rejected'">Отклонен!</span>
              <span v-if="infoStatus === 'pending'">В обработке!</span>
              <span v-if="infoStatus === 'approved'">Успешно подтвержден!</span>
              <div v-if="infoComment" class="user-verification__left__verification-list__item-comment-title">Comment</div>
              <div v-if="infoComment"></div>
              <div v-if="infoComment" class="user-verification__left__verification-list__item-comment-text">
                <UiBadge state="warning" :outline="true"><UiTextSmall>{{ infoComment }}</UiTextSmall></UiBadge>
              </div>
            </li>
          </ul>
          <div class="user-verification__left__verification-list--is-loading" v-if="isLoading">
            <UiIconSpinnerDefault />
          </div>
        </div>
      </PanelDefault>
    </div>

    <div class="user-verification__right">
      <PanelDefault class="user-verification__right__panel">
        <UiTextH5 class="user-verification__right__panel__title"># Verification history</UiTextH5>
        <div class="user-verification__right__panel__verification-history">
          <div class="user-verification__right__panel__verification-history_log">
            <span class="approved">Sent verification mail.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 00:04</span>
          </div>
          <div class="user-verification__right__panel__verification-history_log">
            <span class="pending">You requested profile photo verification.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 00:11</span>
          </div>
          <div class="user-verification__right__panel__verification-history_log">
            <span class="approved">Your profile photo was automatic approved.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 00:15</span>
          </div>
          <div class="user-verification__right__panel__verification-history_log">
            <span class="pending">Requested user data verification.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 00:45</span>
          </div>
          <div class="user-verification__right__panel__verification-history_log">
            <span class="approved">Your user data was approved.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 02:41</span>
          </div>
          <div class="user-verification__right__panel__verification-history_log">
            <span class="rejected">Your user data was rejected.</span>
            <span class="user-verification__right__panel__verification-history_log_time">2025-06-10 02:43</span>
          </div>
        </div>
      </PanelDefault>
    </div>
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
import useAppCore from "~/composables/useAppCore";
import {accountsData} from "~/pages/admin/accounts/composables";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

const {locale, t} = useI18n({useScope: "global"});

const appCore = useAppCore();
const isLoading = ref(false);

let verificationRequestData = reactive({});

const addressStatus = ref('pending');
const documentsStatus = ref('pending');
const depositStatus = ref('pending');
const emailStatus = ref('pending');
const infoStatus = ref('pending');
const photoStatus = ref('pending');

const addressComment = ref('');
const documentsComment = ref('');
const depositComment = ref('');
const emailComment = ref('');
const infoComment = ref('');
const photoComment = ref('');

const loadVerificationData = async () => {
  isLoading.value = true;

  const response = await appCore.verifications.get();
  Object.assign(verificationRequestData, response.data.data);

  addressStatus.value = verificationRequestData['address']['verification_status'];
  emailStatus.value = verificationRequestData['email']['verification_status'];
  photoStatus.value = verificationRequestData['photo']['verification_status'];
  infoStatus.value = verificationRequestData['info']['verification_status'];
  documentsStatus.value = verificationRequestData['documents']['verification_status'];
  depositStatus.value = verificationRequestData['deposit']['verification_status'];

  addressComment.value = verificationRequestData['address']['comment'];
  emailComment.value = verificationRequestData['email']['comment'];
  photoComment.value = verificationRequestData['photo']['comment'];
  infoComment.value = verificationRequestData['info']['comment'];
  documentsComment.value = verificationRequestData['documents']['comment'];
  depositComment.value = verificationRequestData['deposit']['comment'];

  setTimeout(() => {
    isLoading.value = false;
  }, 1000)
}

const handleRefreshDocuments = async () => {
  await loadVerificationData();
}

onMounted(async () => {
  await loadVerificationData();
})
</script>

<style lang="scss" scoped>
.approved {
  color: var(--color-success)
}

.pending {
  color: var(--color-warning)
}

.rejected {
  color: var(--color-danger)
}

@media (max-width: 560px) {
  .user-verification__left__verification-list li { grid-template-columns: 80px 24px 1fr !important; }
}

@media (max-width: 991px) {
  .user-verification__wrapper { flex-direction: column }
  .user-verification__left { width: 100% !important; }
  .user-verification__right { width: 100% !important; }
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

        &__item-comment {
          &-title {
            font-size: 13px;
            font-weight: bold;
            padding: 10px;
          }

          &-text {
            display: flex;
            align-items: center;
            width: 100%;
            height: 50px;
          }
        }

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
          min-height: 60px;
          display: grid;
          align-items: center;
          grid-template-columns: 140px 40px 1fr;
          border-bottom: 1px solid var(--color-stroke-ui-dark);
          gap: 10px;
          padding-top: 10px;
          padding-bottom: 10px;

          svg {
            margin-left: 10px;
          }

          span {
            margin-left: 10px;
            margin-right: 10px;
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

      &__panel {
        padding: 20px;
        height: 100%;
        width: 100%;

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
</style>
