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
              <UiButtonDefault
                :state="props.userData.is_blocked ? 'success' : 'danger--outline'"
                :disabled="isBlocking"
                @click="handleToggleBlock"
              >
                {{ isBlocking ? "Сохраняем..." : (props.userData.is_blocked ? "Разблокировать" : "Заблокировать") }}
              </UiButtonDefault>

              <UiButtonDefault
                state="info--outline"
                :disabled="isImpersonating"
                @click="handleImpersonate"
              >
                {{ isImpersonating ? "Подготавливаем вход..." : "Авторизоваться" }}
              </UiButtonDefault>
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
                  <span
                    class="profile-data__status-badge"
                    :class="props.userData.is_blocked ? 'profile-data__status-badge--blocked' : 'profile-data__status-badge--active'"
                  >
                    {{ props.userData.is_blocked ? "Доступ заблокирован" : "Доступ активен" }}
                  </span>
                  <span v-if="props.userData.is_blocked && props.userData.blocked_at" class="profile-data__summary-blocked-at">
                    Блокировка: {{ props.userData.blocked_at }}
                  </span>
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
                  <span class="hint">VerifyAt: {{ props.userData.email_verified_at || "-" }}</span>
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

        <div v-if="isHistoryLoading" class="browsing-history browsing-history--loading">
          <UiIconSpinnerDefault class="browsing-history__loader" />
        </div>

        <div v-else-if="historyItems.length === 0" class="browsing-history browsing-history--empty">
          <div class="browsing-history__empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L14.5 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </div>
          <UiTextH5 class="browsing-history__empty-title">История входов пока пуста</UiTextH5>
          <p class="browsing-history__empty-subtitle">
            Здесь появятся реальные записи о входах клиента с IP, устройством и типом авторизации.
          </p>
        </div>

        <div v-else class="browsing-history">
          <div
            v-for="item in visibleHistory"
            :key="item.id"
            class="browsing-history__card"
          >
            <div class="browsing-history__card-layout">
              <div class="browsing-history__card-icon" :class="`browsing-history__card-icon--${item.icon}`">
                <svg v-if="item.icon === 'mobile'" viewBox="0 0 24 24" fill="none">
                  <rect x="7" y="2.75" width="10" height="18.5" rx="2.5" stroke="currentColor" stroke-width="1.8" />
                  <path d="M10 18.25H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
                <svg v-else-if="item.icon === 'tablet'" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2.75" width="14" height="18.5" rx="2.5" stroke="currentColor" stroke-width="1.8" />
                  <circle cx="12" cy="17.75" r="0.9" fill="currentColor" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
                  <path d="M8 20H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M12 16V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </div>

              <div class="browsing-history__card-body">
                <div class="browsing-history__card-top">
                  <div class="browsing-history__card-ip">
                    <span class="ip-address">{{ item.ip }}</span>
                    <span class="visit-type">{{ item.auth_label }}</span>
                  </div>
                  <span class="datetime">{{ item.datetime }}</span>
                </div>

                <div class="browsing-history__headline">
                  <span class="device">{{ item.device_label }}</span>
                  <span class="separator">•</span>
                  <span class="browser">{{ item.browser }}</span>
                  <span class="separator">•</span>
                  <span class="os">{{ item.os }}</span>
                </div>

                <div class="browsing-history__card-meta">
                  <span>Локация: {{ resolveLocation(item) }}</span>
                  <span>Тип: {{ resolveDeviceTypeLabel(item.device_type) }}</span>
                  <span>Метод: {{ item.auth_method || "-" }}</span>
                </div>

                <div v-if="item.user_agent" class="browsing-history__user-agent">
                  {{ item.user_agent }}
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="visibleCount < historyItems.length"
            class="browsing-history__more"
            type="button"
            :disabled="isLoadingMore"
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
import { computed, onMounted, ref, watch } from "vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import { useToast } from "vue-toastification";
import useAppCore from "~/composables/useAppCore";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

type VisitHistoryItem = {
  id: string;
  ip: string;
  datetime: string;
  country?: string | null;
  city?: string | null;
  browser: string;
  os: string;
  device_type: string;
  device_label: string;
  icon: string;
  auth_method: string;
  auth_label: string;
  user_agent: string;
};

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
  clientId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["refresh-client"]);

const toast = useToast();
const appCore = useAppCore();

const isHistoryLoading = ref(false);
const isLoadingMore = ref(false);
const isBlocking = ref(false);
const isImpersonating = ref(false);
const visibleCount = ref(4);
const historyItems = ref<VisitHistoryItem[]>([]);

const visibleHistory = computed(() => historyItems.value.slice(0, visibleCount.value));

const resolveLocation = (item: VisitHistoryItem): string => {
  const parts = [item.country, item.city].filter((value) => typeof value === "string" && value.trim() !== "");
  return parts.length > 0 ? parts.join(" / ") : "Не удалось определить";
};

const resolveDeviceTypeLabel = (deviceType: string): string => {
  if (deviceType === "mobile") return "Мобильное устройство";
  if (deviceType === "tablet") return "Планшет";
  return "Десктоп";
};

const loadVisitHistory = async () => {
  if (!props.clientId) return;

  isHistoryLoading.value = true;

  try {
    const response = await appCore.adminModules.clients.getVisitHistory(props.clientId, { limit: 60 });
    historyItems.value = Array.isArray(response?.data?.data) ? response.data.data : [];
    visibleCount.value = Math.min(4, historyItems.value.length || 4);
  } catch (error: any) {
    historyItems.value = [];
    toast.error(error?.response?.data?.message ?? "Не удалось загрузить историю посещений.");
  } finally {
    isHistoryLoading.value = false;
  }
};

const handleLoadMore = async () => {
  if (isLoadingMore.value) return;

  isLoadingMore.value = true;

  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + 4, historyItems.value.length);
    isLoadingMore.value = false;
  }, 300);
};

const handleToggleBlock = async () => {
  if (!props.clientId || isBlocking.value) return;

  const nextState = !Boolean(props.userData?.is_blocked);
  const confirmed = window.confirm(
    nextState
      ? "Подтвердить блокировку клиента? Доступ в кабинет будет закрыт."
      : "Подтвердить разблокировку клиента?"
  );

  if (!confirmed) return;

  isBlocking.value = true;

  try {
    const response = await appCore.adminModules.clients.patchBlockState(props.clientId, {
      is_blocked: nextState,
    });

    if (props.userData) {
      props.userData.is_blocked = Boolean(response?.data?.data?.is_blocked);
      props.userData.blocked_at = response?.data?.data?.blocked_at ?? null;
    }

    emit("refresh-client");
    toast.success(response?.data?.message ?? (nextState ? "Клиент заблокирован." : "Клиент разблокирован."));
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Не удалось изменить статус блокировки.");
  } finally {
    isBlocking.value = false;
  }
};

const handleImpersonate = async () => {
  if (!props.clientId || isImpersonating.value) return;

  const popup = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;
  isImpersonating.value = true;

  try {
    const response = await appCore.adminModules.clients.createImpersonationLink(props.clientId);
    const url = response?.data?.data?.url;

    if (!url) {
      throw new Error("Cabinet auth link is missing.");
    }

    if (popup) {
      popup.location.href = url;
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }

    toast.success("Окно кабинета открыто. Выполняется вход под клиентом.");
  } catch (error: any) {
    popup?.close();
    toast.error(error?.response?.data?.message ?? error?.message ?? "Не удалось авторизоваться в кабинете клиента.");
  } finally {
    isImpersonating.value = false;
  }
};

onMounted(async () => {
  await loadVisitHistory();
});

watch(
  () => props.clientId,
  async () => {
    await loadVisitHistory();
  }
);
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

    &__form {
      padding: 0;

      .title {
        display: flex;
        justify-content: space-between;
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
        gap: 6px;
        text-align: right;
        color: var(--ui-text-secondary);
        font-size: 12px;
      }

      .profile-data__summary-birthdate {
        color: var(--ui-text-secondary);
        font-size: 12px;
        margin-top: 4px;
      }

      .profile-data__status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 700;
      }

      .profile-data__status-badge--active {
        background: rgba(35, 159, 103, 0.18);
        color: #7ee5b4;
      }

      .profile-data__status-badge--blocked {
        background: rgba(226, 90, 90, 0.18);
        color: #ff9d9d;
      }

      .profile-data__summary-blocked-at {
        color: var(--ui-text-secondary);
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

    &__form {
      padding: 0;

      .browsing-history {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .browsing-history--loading,
      .browsing-history--empty {
        align-items: center;
        justify-content: center;
        min-height: 260px;
        border: 1px dashed var(--color-stroke-ui-light);
        border-radius: 18px;
        background: var(--ui-background-panel);
        text-align: center;
        padding: 24px;
      }

      .browsing-history__loader {
        width: 42px;
        height: 42px;
      }

      .browsing-history__empty-icon {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: var(--color-stroke-ui-dark);
        color: var(--ui-primary-main);
        margin-bottom: 16px;
      }

      .browsing-history__empty-icon svg {
        width: 28px;
        height: 28px;
      }

      .browsing-history__empty-title {
        color: var(--ui-text-main);
        margin-bottom: 8px;
      }

      .browsing-history__empty-subtitle {
        color: var(--ui-text-secondary);
        max-width: 420px;
        line-height: 1.45;
      }

      .browsing-history__card {
        width: 100%;
        border-radius: 14px;
        background: var(--ui-background-panel);
        border: 1px solid var(--color-stroke-ui-light);
        padding: 14px 16px;
        transition: background-color 0.2s ease, transform 0.1s ease, border-color 0.2s ease;
      }

      .browsing-history__card:hover {
        background: var(--color-stroke-ui-dark);
        border-color: var(--ui-primary-main);
      }

      .browsing-history__card-layout {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      .browsing-history__card-icon {
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-primary-main);
        background: rgba(20, 92, 255, 0.14);
      }

      .browsing-history__card-icon--mobile {
        color: #81d3ff;
        background: rgba(24, 126, 255, 0.15);
      }

      .browsing-history__card-icon--tablet {
        color: #8eb7ff;
        background: rgba(74, 111, 255, 0.16);
      }

      .browsing-history__card-icon--desktop {
        color: #7ee5b4;
        background: rgba(35, 159, 103, 0.16);
      }

      .browsing-history__card-icon svg {
        width: 24px;
        height: 24px;
      }

      .browsing-history__card-body {
        flex: 1;
        min-width: 0;
      }

      .browsing-history__card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .browsing-history__card-ip {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .browsing-history__headline {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        color: var(--ui-text-main);
        margin-top: 6px;
        font-size: 13px;
      }

      .browsing-history__card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        margin-top: 10px;
        font-size: 12px;
        color: var(--ui-text-secondary);
      }

      .browsing-history__user-agent {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--color-stroke-ui-dark);
        color: var(--ui-text-secondary);
        font-size: 12px;
        line-height: 1.45;
        word-break: break-word;
      }

      .browsing-history__more {
        align-self: center;
        padding: 8px 16px;
        border-radius: 10px;
        color: var(--ui-text-main);
        transition: background-color 0.2s ease, transform 0.1s ease;
      }

      .browsing-history__more:hover {
        background: var(--color-stroke-ui-dark);
      }

      .ip-address {
        color: var(--ui-text-main);
        font-weight: 700;
      }

      .visit-type {
        color: var(--ui-primary-main);
        font-size: 12px;
        font-weight: 600;
      }

      .datetime {
        color: var(--ui-text-main);
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
      }

      .device {
        font-weight: 700;
      }

      .separator {
        color: var(--ui-text-secondary);
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

  .profile__tab--kyc__profile-data--additional__form .browsing-history__card-layout {
    flex-direction: column;
  }

  .profile__tab--kyc__profile-data--additional__form .browsing-history__card-top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
