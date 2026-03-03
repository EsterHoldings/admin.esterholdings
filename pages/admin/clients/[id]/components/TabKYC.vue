<template>
  <div class="profile__tab--kyc">
    <div class="profile__tab--kyc__left profile__tab--kyc__profile-data">
        <div class="profile__tab--kyc__profile-data__form">
          <UiTextH5 class="title"># Основные данные пользователя</UiTextH5>
          <div class="profile-data__summary">
            <div class="profile-data__summary-photo">
              <UiImage
                v-if="props.userData.photo_url"
                class="profile-data__info_photo"
                :src="props.userData.photo_url"
              />
              <div v-else class="profile-data__info_photo profile-data__info_photo--placeholder">
                <span>Фото не загружено</span>
              </div>
              <div class="actions actions--photo">
                <UiButtonDefault state="danger--outline">Заблокировать</UiButtonDefault>
                <UiButtonDefault state="info--outline">Авторизоваться</UiButtonDefault>
              </div>
            </div>

            <PanelDefault class="profile-data__summary-panel">
              <div class="profile-data__summary-main">
                <div class="profile-data__summary-header">
                  <div>
                    <UiTextH5 class="profile-data__summary-name">
                      {{ props.userData.first_name }}
                      {{ props.userData.last_name }}
                      {{ props.userData.mid_name }}
                    </UiTextH5>
                    <div class="profile-data__summary-birthdate">
                      {{ props.userData.birthdate || "-" }}
                    </div>
                  </div>
                  <div class="profile-data__summary-meta">
                    <span>{{ props.userData.created_at || "-" }}</span>
                  </div>
                </div>

                <div class="profile-data__summary-grid">
                  <div class="summary-item">
                    <span class="label">Телефон</span>
                    <span class="value">{{ props.userData.phone || "-" }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Email</span>
                    <span class="value">{{ props.userData.email || "-" }}</span>
                    <span class="hint">
                      VerifyAt: {{ props.userData.email_verified_at || "-" }}
                    </span>
                  </div>
                </div>

                <div class="profile-data__summary-address">
                  <div class="label">Адрес</div>
                  <div class="value">
                    <span>Страна: {{ props.userData.country || "-" }}</span>
                    <span>Город: {{ props.userData.city || "-" }}</span>
                    <span>Штат: {{ props.userData.state || "-" }}</span>
                    <span>Адрес: {{ props.userData.address || "-" }}</span>
                    <span>Индекс: {{ props.userData.postal_code || "-" }}</span>
                  </div>
                </div>
              </div>
            </PanelDefault>
          </div>
        </div>
    </div>

    <div class="profile__tab--kyc__right profile__tab--kyc__profile-data--additional">
        <div class="profile__tab--kyc__profile-data--additional__form">
          <UiTextH5 class="title"># История посещений - IP</UiTextH5>
          <div class="browsing-history">
            <div
              v-for="item in visibleHistory"
              :key="item.id"
              class="browsing-history__card"
            >
              <div class="browsing-history__card-top">
                <span class="ip-address">{{ item.ip }}</span>
                <span class="datetime">{{ item.datetime }}</span>
              </div>
              <div class="browsing-history__card-meta">
                <span>Страна: {{ item.country }}</span>
                <span>Город: {{ item.city }}</span>
                <span>Устройство: {{ item.device }}</span>
              </div>
            </div>

            <button
              v-if="visibleCount < historyItems.length"
              class="browsing-history__more"
              type="button"
              @click="handleLoadMore"
            >
              <UiIconSpinnerDefault v-if="isLoadingMore" class="h-4 w-4" />
              <span v-else>Показать еще</span>
            </button>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref} from "vue";
import {
  validatorUserDataForm,
} from "~/pages/admin/clients/[id]/composables/validation";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

import {useToast} from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
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

const {t} = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);
const isLoadingMore = ref(false);
const visibleCount = ref(4);
const historyItems = [
  {
    id: 1,
    ip: "172.11.29.41",
    datetime: "2025-06-19 11:34:21",
    country: "Россия",
    city: "Москва",
    device: "Windows / Chrome",
  },
  {
    id: 2,
    ip: "172.11.29.41",
    datetime: "2025-06-19 12:01:11",
    country: "Россия",
    city: "Москва",
    device: "iOS / Safari",
  },
  {
    id: 3,
    ip: "172.11.29.41",
    datetime: "2025-06-19 12:04:42",
    country: "Россия",
    city: "Москва",
    device: "Android / Chrome",
  },
  {
    id: 4,
    ip: "172.11.29.41",
    datetime: "2025-06-19 12:12:13",
    country: "Россия",
    city: "Москва",
    device: "macOS / Chrome",
  },
  {
    id: 5,
    ip: "172.11.29.41",
    datetime: "2025-06-19 12:13:14",
    country: "Россия",
    city: "Москва",
    device: "Windows / Edge",
  },
  {
    id: 6,
    ip: "172.11.29.41",
    datetime: "2025-06-19 12:23:55",
    country: "Россия",
    city: "Москва",
    device: "Android / Firefox",
  },
  {
    id: 7,
    ip: "178.41.47.211",
    datetime: "2025-06-19 12:23:55",
    country: "Украина",
    city: "Киев",
    device: "Windows / Chrome",
  },
  {
    id: 8,
    ip: "178.41.47.212",
    datetime: "2025-06-19 12:28:02",
    country: "Украина",
    city: "Львов",
    device: "macOS / Safari",
  },
];

const visibleHistory = computed(() => historyItems.slice(0, visibleCount.value));

const handleLoadMore = async () => {
  if (isLoadingMore.value) return;
  isLoadingMore.value = true;
  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + 4, historyItems.length);
    isLoadingMore.value = false;
  }, 600);
};

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
  height: auto;
  width: 100%;
  border-radius: 10px;

  display: flex;
  gap: 20px;

  @media (min-width: 1px) {
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

    .actions--photo {
      padding: 12px 0 0;
      flex-direction: column;
      gap: 8px;
    }

    &__title {
      padding: 0 20px;
      height: 40px;
      display: flex;
      align-items: center;
    }

    &__form {
      padding: 0;

      .title {
        display: flex;
        justify-content: space-between;
      }

      &__field {
        margin-bottom: 10px;
      }

      .profile-data__summary {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 20px;
      }

      .profile-data__summary-photo {
        width: 200px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .profile-data__info_photo {
        width: 200px;
        height: auto;
        max-height: 350px;
        border-radius: 10px;
      }

      .profile-data__info_photo--placeholder {
        width: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px;
        background: var(--color-stroke-ui-light);
        color: var(--ui-text-secondary);
        font-size: 13px;
      }

      .profile-data__summary-main {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .profile-data__summary-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .profile-data__summary-name {
        color: var(--ui-text-main);
      }

      .profile-data__summary-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: right;
        color: var(--ui-text-secondary);
        font-size: 12px;
      }

      .profile-data__summary-birthdate {
        color: var(--ui-text-secondary);
        font-size: 12px;
        margin-top: 4px;
      }

      .profile-data__summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 16px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .summary-item .label {
        font-size: 12px;
        color: var(--ui-text-secondary);
      }

      .summary-item .value {
        color: var(--ui-text-main);
        font-size: 14px;
        word-break: break-word;
      }

      .summary-item .hint {
        font-size: 12px;
        color: var(--color-ui-warning);
      }

      .profile-data__summary-address {
        border-top: 1px solid var(--color-stroke-ui-dark);
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .profile-data__summary-address .label {
        font-size: 12px;
        color: var(--ui-text-secondary);
      }

      .profile-data__summary-address .value {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px 12px;
        font-size: 14px;
        color: var(--ui-text-main);
        word-break: break-word;
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
      padding: 0;

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
        display: flex;
        flex-direction: column;
        gap: 10px;

        &__card {
          width: 100%;
          border-radius: 12px;
          background: var(--ui-background-panel);
          border: 1px solid var(--color-stroke-ui-light);
          padding: 12px 14px;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        &__card:hover {
          background: var(--color-stroke-ui-dark);
        }

        &__card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        &__card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          margin-top: 6px;
          font-size: 12px;
          color: var(--ui-text-secondary);
        }

        &__more {
          align-self: center;
          padding: 8px 16px;
          border-radius: 10px;
          color: var(--ui-text-main);
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        &__more:hover {
          background: var(--color-stroke-ui-dark);
        }

        .ip-address {
          color: var(--ui-text-main);
          font-weight: 600;
        }

        .datetime {
          color: var(--ui-text-main);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile__tab--kyc {
    gap: 12px;
  }

  .profile__tab--kyc__profile-data .actions {
    flex-direction: column;
    gap: 12px;
  }

  .profile__tab--kyc__profile-data .actions :deep(button) {
    width: 100%;
  }

  .profile__tab--kyc__profile-data__form .title {
    flex-direction: column;
    gap: 8px;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-photo {
    width: 100%;
  }

  .profile__tab--kyc__profile-data__form .profile-data__info_photo {
    width: 100%;
    height: auto;
    max-height: 280px;
    object-fit: cover;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-meta {
    text-align: left;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-address {
    padding-top: 8px;
  }

  .profile__tab--kyc__profile-data__form .profile-data__summary-address .value {
    grid-template-columns: 1fr;
  }

  .profile__tab--kyc__profile-data--additional__form .browsing-history__card-top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
