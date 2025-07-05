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
            <li><UiIconFailed/><span>Email is not verified!</span></li>
            <li><UiIconFailed/><span>{{ t("cabinet.dashboard.accountVerification.addressFailed") }}</span></li>
            <li><UiIconSuccess/><span>{{ t("cabinet.dashboard.accountVerification.documentVerified") }}</span></li>
            <li><UiIconWarning/><span>{{ t("cabinet.dashboard.accountVerification.paymentInProgress") }}</span></li>
            <li><UiIconWarning/><span>{{ t("cabinet.dashboard.accountVerification.profileInProgress") }}</span></li>
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
import {onMounted, ref} from "vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

const props = defineProps({
  userData: {
    type: Object,
    default: {}
  },
  clientId: {
    type: String,
    default: ""
  }
})

const {locale, t} = useI18n({useScope: "global"});

const isLoading = ref(false);

const loadVerificationData = async () => {
  isLoading.value = true;

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

          svg {
            margin-left: 10px;
          }

          span {
            margin-left: 40px;
            margin-right: 10px;
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
