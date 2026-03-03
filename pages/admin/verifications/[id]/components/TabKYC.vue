<template>
  <div class="profile__tab--kyc">
    <div class="profile__tab--kyc__left profile__tab--kyc__profile-data">
      <PanelDefault>
        <div class="profile__tab--kyc__profile-data__form">
          <UiTextH5 class="title">
            <span># Основные данные пользователя</span>
            <span>
              <UiTextH5>
                {{ props.userData.first_name }}
                {{ props.userData.last_name }}
                {{ props.userData.mid_name }}
              </UiTextH5>
              <div class="profile-data__info_personal-info__birthdate">
                {{ props.userData.birthdate }}
              </div>
            </span>
          </UiTextH5>
<!--          <UiTextSmall>Id: {{ clientId }}</UiTextSmall>-->
          <div class="profile-data__info">

            <div class="profile-data__info_photo__wrapper">
              <UiImage
                v-if="props.userData.photo_url"
                class="profile-data__info_photo"
                :src="props.userData.photo_url"
              />
              <div v-else class="profile-data__info_photo profile-data__info_photo--placeholder">
                <span>Фото не загружено</span>
              </div>
            </div>

            <div class="profile-data__info_personal-info">
              <div class="profile-data__info_personal-info__phone">
                {{ props.userData.phone }}
              </div>

              <div class="profile-data__info_personal-info__email">
                {{ props.userData.email }}
              </div>
              <div class="profile-data__info_personal-info__email__verify_at">
                VerifyAt: {{ props.userData.email_verified_at }}
              </div>
              <div class="profile-data__info_personal-info__address">
                <span>Страна: {{ props.userData.country }}</span>
                <span>Город: {{ props.userData.city }}</span>
                <span>Штат: {{ props.userData.state }}</span>
                <span>Адрес: {{ props.userData.address }}</span>
                <span>Индекс: {{ props.userData.postal_code }}</span>
              </div>

              <div class="profile-data__info_personal-info__created-at">
                {{ props.userData.created_at }}
              </div>
            </div>
          </div>
        </div>
        <div class="actions">
          <UiButtonDefault state="danger--outline">Заблокировать</UiButtonDefault>
          <UiButtonDefault state="info--outline">Авторизоваться</UiButtonDefault>
        </div>
      </PanelDefault>
    </div>

    <div class="profile__tab--kyc__right profile__tab--kyc__profile-data--additional">
      <PanelDefault>
        <div class="profile__tab--kyc__profile-data--additional__form">
          <UiTextH5 class="title"># История посещений - IP</UiTextH5>
          <div class="browsing-history">
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 11:34:21</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 12:01:11</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 12:04:42</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 12:12:13</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 12:13:14</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">172.11.29.41</span>
              <span class="datetime">2025-06-19 12:23:55</span>
            </div>
            <div class="browsing-history__log">
              <span class="ip-address">178.41.47.211</span>
              <span class="datetime">2025-06-19 12:23:55</span>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {
  validatorUserDataForm,
} from "~/pages/admin/verifications/[id]/composables/validation";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

import {useToast} from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

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

const {t} = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);

const handleInputBirthday = (value) => {
  validatorUserDataForm.doValidateField(
      'birthdate',
      value
  )
}

const handleSubmit = async () => {

};

onMounted(async () => {

});
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 20px;
}

.profile__tab--kyc {
  height: 80vh;
  width: 100%;
  border-radius: 10px;

  display: flex;
  gap: 20px;

  @media (max-width: 1058px) {
    flex-direction: column;

    .profile__tab--kyc__left {
      width: 100%;
    }

    .profile__tab--kyc__right {
      width: 100%;
    }

    .profile-data__info_photo {
      max-height: 350px;
      height: auto;
    }
  }

  &__profile-data {
    width: 50%;
    //height: 100%;

    .actions {
      width: 100%;
      display: flex;
      padding: 0 20px 20px 20px;
      gap: 20px;
      justify-content: space-between;
    }

    &__title {
      padding: 0 20px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    &__form {
      padding: 20px;

      .title {
        display: flex;
        justify-content: space-between;
      }

      &__field {
        margin-bottom: 10px;
      }

      .profile-data__info {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;

        &_photo {
          margin-top: 20px;
          width: 200px;
          height: auto;
          max-height: 350px;
          border-radius: 10px;

          &__wrapper {
            width: 50%;
            height: auto;
          }

          &--placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 12px;
            background: var(--color-stroke-ui-light);
            color: var(--ui-text-secondary);
            font-size: 13px;
          }
        }

        &_personal-info {
          padding-top: 20px;
          width: 50%;

          &__birthdate {
            width: 100%;
            text-align: right;
            font-size: 14px;
            color: var(--ui-gray);
          }

          &__full-name {
            width: 100%;
          }

          &__phone {
            margin-bottom: 10px;
          }

          &__email {
            font-size: 14px;
            color: var(--ui-text-main);

            &__verify_at {
              font-size: 13px;
              color: var(--color-ui-warning)
            }
          }

          &__address {
            color: var(--ui-text-main);
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--color-stroke-ui-dark);

            span {
              width: 100%;
              display: block;
              margin-top: 10px;
              font-size: 14px;
            }
          }

          &__created-at {
            font-size: 14px;
            margin-top: 20px;
            text-align: right;
            width: 100%;
          }

        }
      }
    }
  }

  &__profile-data--additional {
    width: 50%;
    height: 100%;

    &__title {
      padding: 0 20px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    &__form {
      padding: 20px;

      &__field {
        margin-bottom: 10px;

        &__save_btn {
          margin-top: 35px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .browsing-history {
        &__log {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-stroke-ui-dark);
          height: 40px;
          font-size: 14px;

          .ip-address {
            color: var(--ui-text-main);
            font-weight: 600;
          }

          .datetime {
            color: var(--ui-text-main);
            font-size: 13px;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
