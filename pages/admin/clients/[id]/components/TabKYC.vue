<template>
  <div class="client-tab-space client-kyc">
    <div class="client-tab-grid client-kyc__grid">
      <PrimeCard class="client-tab-card client-kyc__identity-card">
        <template #content>
          <div class="client-card-body">
            <div class="client-card-header">
              <div>
                <h3 class="client-card-title">{{ resolveText("admin.clients.kyc.profile.title", "Client profile") }}</h3>
                <p class="client-card-subtitle">
                  {{ resolveText("admin.clients.kyc.profile.description", "Identity, contact details and access controls.") }}
                </p>
              </div>
              <span
                class="client-inline-status"
                :class="props.userData.is_blocked ? 'client-inline-status--danger' : 'client-inline-status--success'">
                {{ accessStatusLabel }}
              </span>
            </div>

            <div class="client-kyc__profile-layout">
              <div class="client-kyc__photo-column">
                <img
                  v-if="props.userData.photo_url"
                  class="client-kyc__photo"
                  :src="props.userData.photo_url"
                  :alt="displayName" />
                <div
                  v-else
                  class="client-kyc__photo client-kyc__photo--placeholder">
                  <i class="pi pi-image" aria-hidden="true" />
                  <span>{{ resolveText("admin.clients.kyc.profile.photoMissing", "No photo uploaded") }}</span>
                </div>

                <PrimeButton
                  :label="isBlocking ? resolveText('admin.clients.kyc.actions.saving', 'Saving...') : props.userData.is_blocked ? resolveText('admin.clients.kyc.actions.unblock', 'Unblock') : resolveText('admin.clients.kyc.actions.block', 'Block')"
                  :icon="props.userData.is_blocked ? 'pi pi-unlock' : 'pi pi-ban'"
                  :severity="props.userData.is_blocked ? 'success' : 'danger'"
                  :loading="isBlocking"
                  :disabled="isBlocking"
                  outlined
                  @click="handleToggleBlock" />

                <PrimeButton
                  :label="isImpersonating ? resolveText('admin.clients.kyc.actions.preparingLogin', 'Preparing login...') : resolveText('admin.clients.kyc.actions.impersonate', 'Sign in as client')"
                  icon="pi pi-external-link"
                  :loading="isImpersonating"
                  :disabled="isImpersonating"
                  @click="handleImpersonate" />
              </div>

              <div class="client-kyc__profile-main">
                <div>
                  <h4 class="client-kyc__name">{{ displayName }}</h4>
                  <p class="client-card-subtitle">
                    {{ props.userData.birthdate || resolveText("admin.clients.kyc.profile.birthdateMissing", "Birthdate is missing") }}
                  </p>
                </div>

                <div class="client-data-grid">
                  <div
                    v-for="item in profileDataItems"
                    :key="item.key"
                    class="client-data-item">
                    <span class="client-data-item__label">{{ item.label }}</span>
                    <span class="client-data-item__value">{{ item.value }}</span>
                  </div>
                </div>

                <div class="client-data-grid">
                  <div
                    v-for="item in addressDataItems"
                    :key="item.key"
                    class="client-data-item">
                    <span class="client-data-item__label">{{ item.label }}</span>
                    <span class="client-data-item__value">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="client-tab-card client-kyc__history-card">
        <template #content>
          <div class="client-card-body">
            <div class="client-card-header">
              <div>
                <h3 class="client-card-title">{{ resolveText("admin.clients.kyc.history.title", "Visit history") }}</h3>
                <p class="client-card-subtitle">
                  {{ resolveText("admin.clients.kyc.history.description", "Recent client sign-ins with IP, device and browser details.") }}
                </p>
              </div>
              <PrimeButton
                icon="pi pi-refresh"
                rounded
                text
                :loading="isHistoryLoading"
                :aria-label="resolveText('admin.clients.kyc.actions.refreshHistory', 'Refresh history')"
                @click="loadVisitHistory" />
            </div>

            <div
              v-if="isHistoryLoading"
              class="client-kyc__history-list">
              <PrimeSkeleton
                v-for="index in 4"
                :key="`history-skeleton-${index}`"
                height="74px"
                border-radius="16px" />
            </div>

            <div
              v-else-if="historyItems.length === 0"
              class="client-kyc__empty">
              <i class="pi pi-clock" aria-hidden="true" />
              <strong>{{ resolveText("admin.clients.kyc.history.emptyTitle", "No visits yet") }}</strong>
              <span>{{ resolveText("admin.clients.kyc.history.emptyDescription", "Real sign-in records will appear here after the client visits the cabinet.") }}</span>
            </div>

            <div
              v-else
              class="client-kyc__history-list">
              <article
                v-for="item in visibleHistory"
                :key="item.id"
                class="client-kyc__history-row">
                <div class="client-kyc__history-icon">
                  <i
                    :class="item.icon === 'mobile' ? 'pi pi-mobile' : item.icon === 'tablet' ? 'pi pi-tablet' : 'pi pi-desktop'"
                    aria-hidden="true" />
                </div>

                <div class="client-kyc__history-body">
                  <div class="client-kyc__history-top">
                    <strong>{{ item.ip || "-" }}</strong>
                    <span>{{ item.datetime || "-" }}</span>
                  </div>
                  <div class="client-kyc__history-meta">
                    <span>{{ item.device_label || resolveDeviceTypeLabel(item.device_type) }}</span>
                    <span>{{ item.browser || "-" }}</span>
                    <span>{{ item.os || "-" }}</span>
                    <span>{{ resolveLocation(item) }}</span>
                    <span>{{ item.auth_method || "-" }}</span>
                  </div>
                  <p
                    v-if="item.user_agent"
                    class="client-kyc__user-agent">
                    {{ item.user_agent }}
                  </p>
                </div>
              </article>

              <PrimeButton
                v-if="visibleCount < historyItems.length"
                class="client-kyc__more"
                :label="resolveText('admin.clients.kyc.actions.loadMore', 'Load more')"
                text
                :loading="isLoadingMore"
                :disabled="isLoadingMore"
                @click="handleLoadMore" />
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import useAppCore from "~/composables/useAppCore";

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

const { t } = useI18n({ useScope: "global" });
const toast = useToast();
const appCore = useAppCore();

const isHistoryLoading = ref(false);
const isLoadingMore = ref(false);
const isBlocking = ref(false);
const isImpersonating = ref(false);
const visibleCount = ref(4);
const historyItems = ref<VisitHistoryItem[]>([]);

const visibleHistory = computed(() => historyItems.value.slice(0, visibleCount.value));

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const emptyValue = computed(() => resolveText("admin.clients.common.emptyValue", "-"));

const displayName = computed(() => {
  const name = [props.userData.first_name, props.userData.last_name, props.userData.mid_name]
    .map(value => String(value ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return name || props.userData.email || resolveText("admin.clients.detail.unknownClient", "Unknown client");
});

const accessStatusLabel = computed(() =>
  props.userData.is_blocked
    ? resolveText("admin.clients.kyc.profile.accessBlocked", "Access blocked")
    : resolveText("admin.clients.kyc.profile.accessActive", "Access active")
);

const profileDataItems = computed(() => [
  { key: "email", label: "Email", value: props.userData.email || emptyValue.value },
  {
    key: "emailVerified",
    label: resolveText("admin.clients.kyc.profile.emailVerifiedAt", "Email verified at"),
    value: props.userData.email_verified_at || emptyValue.value,
  },
  { key: "phone", label: resolveText("admin.clients.kyc.profile.phone", "Phone"), value: props.userData.phone || emptyValue.value },
  {
    key: "createdAt",
    label: resolveText("admin.clients.kyc.profile.createdAt", "Created at"),
    value: props.userData.created_at || emptyValue.value,
  },
  ...(props.userData.is_blocked
    ? [{
        key: "blockedAt",
        label: resolveText("admin.clients.kyc.profile.blockedAt", "Blocked at"),
        value: props.userData.blocked_at || emptyValue.value,
      }]
    : []),
]);

const addressDataItems = computed(() => [
  { key: "country", label: resolveText("admin.clients.columns.country", "Country"), value: props.userData.country || emptyValue.value },
  { key: "city", label: resolveText("admin.clients.columns.city", "City"), value: props.userData.city || emptyValue.value },
  { key: "state", label: resolveText("admin.clients.columns.state", "State / Region"), value: props.userData.state || emptyValue.value },
  { key: "address", label: resolveText("admin.clients.columns.address", "Address"), value: props.userData.address || emptyValue.value },
  { key: "postalCode", label: resolveText("admin.clients.columns.postalCode", "Postal code"), value: props.userData.postal_code || emptyValue.value },
]);

const resolveLocation = (item: VisitHistoryItem): string => {
  const parts = [item.country, item.city].filter((value) => typeof value === "string" && value.trim() !== "");
  return parts.length > 0 ? parts.join(" / ") : resolveText("admin.clients.kyc.history.locationUnknown", "Unknown location");
};

const resolveDeviceTypeLabel = (deviceType: string): string => {
  if (deviceType === "mobile") return resolveText("admin.clients.kyc.history.device.mobile", "Mobile");
  if (deviceType === "tablet") return resolveText("admin.clients.kyc.history.device.tablet", "Tablet");
  return resolveText("admin.clients.kyc.history.device.desktop", "Desktop");
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
    toast.error(error?.response?.data?.message ?? resolveText("admin.clients.kyc.history.loadFailed", "Failed to load visit history."));
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
      ? resolveText("admin.clients.kyc.confirm.block", "Block this client? Cabinet access will be closed.")
      : resolveText("admin.clients.kyc.confirm.unblock", "Unblock this client?")
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
    toast.success(response?.data?.message ?? (nextState ? resolveText("admin.clients.kyc.toasts.blocked", "Client blocked.") : resolveText("admin.clients.kyc.toasts.unblocked", "Client unblocked.")));
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? resolveText("admin.clients.kyc.toasts.blockFailed", "Failed to update block status."));
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
      throw new Error(resolveText("admin.clients.kyc.toasts.authLinkMissing", "Cabinet auth link is missing."));
    }

    if (popup) {
      popup.location.href = url;
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }

    toast.success(resolveText("admin.clients.kyc.toasts.impersonationStarted", "Cabinet window opened. Signing in as client."));
  } catch (error: any) {
    popup?.close();
    toast.error(error?.response?.data?.message ?? error?.message ?? resolveText("admin.clients.kyc.toasts.impersonationFailed", "Failed to sign in as client."));
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
  .client-kyc__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  }

  .client-kyc__profile-layout {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 14px;
  }

  .client-kyc__photo-column {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 10px;
  }

  .client-kyc__photo {
    width: 100%;
    min-height: 218px;
    max-height: 320px;
    object-fit: cover;
    border-radius: 18px;
    background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 12%, var(--color-stroke-ui-light));
  }

  .client-kyc__photo--placeholder {
    display: grid;
    place-items: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    text-align: center;
    font-size: 12px;
  }

  .client-kyc__photo--placeholder i {
    color: var(--ui-primary-main);
    font-size: 26px;
  }

  .client-kyc__profile-main {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 12px;
  }

  .client-kyc__name {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 21px;
    font-weight: 860;
    letter-spacing: -0.025em;
  }

  .client-kyc__history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .client-kyc__history-row {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 11px;
    border-radius: 16px;
    padding: 11px;
    background: color-mix(in srgb, var(--ui-background-card) 56%, transparent);
    border: 1px solid transparent;
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  .client-kyc__history-row:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 25%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 7%, var(--ui-background-card));
  }

  .client-kyc__history-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
  }

  .client-kyc__history-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .client-kyc__history-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--ui-text-main);
    font-size: 13px;
  }

  .client-kyc__history-top span {
    color: var(--ui-text-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  .client-kyc__history-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .client-kyc__user-agent {
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.45;
    word-break: break-word;
  }

  .client-kyc__empty {
    min-height: 240px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    border-radius: 18px;
    border: 1px dashed color-mix(in srgb, var(--ui-primary-main) 24%, var(--color-stroke-ui-light));
    padding: 22px;
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .client-kyc__empty i {
    color: var(--ui-primary-main);
    font-size: 28px;
  }

  .client-kyc__empty strong {
    color: var(--ui-text-main);
  }

  .client-kyc__more {
    align-self: center;
  }

  @media (max-width: 1200px) {
    .client-kyc__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .client-kyc__profile-layout {
      grid-template-columns: 1fr;
    }

    .client-kyc__photo {
      min-height: 180px;
    }
  }
</style>
