<template>
  <div class="client-tab-space client-kyc">
    <div class="client-kyc__stack">
      <PrimeCard class="client-tab-card client-kyc__identity-card">
        <template #content>
          <div class="client-card-body">
            <div class="client-card-header client-kyc__card-header">
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
              <aside class="client-kyc__photo-column">
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

                <div class="client-kyc__actions">
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
              </aside>

              <section class="client-kyc__profile-main">
                <div class="client-kyc__name-row">
                  <div>
                    <h4 class="client-kyc__name">{{ displayName }}</h4>
                    <p class="client-card-subtitle">
                      {{ props.userData.birthdate || resolveText("admin.clients.kyc.profile.birthdateMissing", "Birthdate is missing") }}
                    </p>
                  </div>

                  <div class="client-kyc__online-state">
                    <div class="client-kyc__online-top">
                      <span
                        class="client-kyc__online-dot"
                        :class="isClientOnline ? 'is-online' : 'is-offline'" />
                      <strong>{{ onlineStatusText }}</strong>
                    </div>
                    <span
                      v-if="!isClientOnline && lastSeenRelative"
                      class="client-kyc__online-relative">
                      {{ lastSeenRelative }}
                    </span>
                    <span
                      v-if="lastSeenExact"
                      class="client-kyc__online-exact">
                      {{ lastSeenExact }}
                    </span>
                  </div>
                </div>

                <div class="client-kyc__section">
                  <div class="client-kyc__section-header">
                    <h5>{{ resolveText("admin.clients.kyc.profile.contactSection", "Contact and access") }}</h5>
                  </div>
                  <div class="client-kyc__compact-grid">
                    <div
                      v-for="item in profileDataItems"
                      :key="item.key"
                      class="client-kyc__compact-item">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                  </div>
                </div>

                <div class="client-kyc__section">
                  <div class="client-kyc__section-header">
                    <h5>{{ resolveText("admin.clients.kyc.profile.addressSection", "Address") }}</h5>
                  </div>
                  <div class="client-kyc__compact-grid client-kyc__compact-grid--address">
                    <div
                      v-for="item in addressDataItems"
                      :key="item.key"
                      class="client-kyc__compact-item">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                    </div>
                  </div>
                </div>

                <div class="client-kyc__section">
                  <div class="client-kyc__section-header">
                    <div>
                      <h5>{{ resolveText("admin.clients.kyc.verification.title", "Verification") }}</h5>
                      <p>{{ resolveText("admin.clients.kyc.verification.description", "Current profile and document moderation status.") }}</p>
                    </div>
                  </div>

                  <div class="client-kyc__verification-grid">
                    <article
                      v-for="item in verificationSummaryItems"
                      :key="item.key"
                      class="client-kyc__verification-card">
                      <div class="client-kyc__verification-icon">
                        <i :class="item.icon" aria-hidden="true" />
                      </div>
                      <div>
                        <span>{{ item.label }}</span>
                        <strong>{{ item.value }}</strong>
                      </div>
                      <span
                        class="client-kyc__status-dot"
                        :class="statusClass(item.status)" />
                    </article>
                  </div>

                  <div class="client-kyc__documents">
                    <div class="client-kyc__documents-head">
                      <h6>{{ resolveText("admin.clients.kyc.documents.title", "Documents") }}</h6>
                      <span>{{ documentsSummaryText }}</span>
                    </div>

                    <div
                      v-if="isDetailsLoading"
                      class="client-kyc__documents-list">
                      <PrimeSkeleton
                        v-for="index in 3"
                        :key="`document-skeleton-${index}`"
                        height="42px"
                        border-radius="14px" />
                    </div>

                    <div
                      v-else-if="documentsItems.length === 0"
                      class="client-kyc__documents-empty">
                      {{ resolveText("admin.clients.kyc.documents.empty", "No identity documents uploaded yet.") }}
                    </div>

                    <div
                      v-else
                      class="client-kyc__documents-list">
                      <article
                        v-for="document in documentsItems"
                        :key="document.id"
                        class="client-kyc__document-row">
                        <div>
                          <strong>{{ document.name || resolveText("admin.clients.kyc.documents.defaultName", "Document") }}</strong>
                          <span>{{ document.created_at || emptyValue }}</span>
                        </div>
                        <span
                          class="client-kyc__status-pill"
                          :class="statusClass(document.state)">
                          <i aria-hidden="true" />
                          {{ statusLabel(document.state) }}
                        </span>
                      </article>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </template>
      </PrimeCard>

      <PrimeCard class="client-tab-card client-kyc__history-card">
        <template #content>
          <div class="client-card-body">
            <div class="client-card-header client-kyc__card-header">
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
                @click="loadKycData" />
            </div>

            <div
              v-if="isHistoryLoading"
              class="client-kyc__history-list">
              <PrimeSkeleton
                v-for="index in 4"
                :key="`history-skeleton-${index}`"
                height="64px"
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
                    <strong>{{ item.ip || emptyValue }}</strong>
                    <span>{{ formatDateTime(item.datetime) }}</span>
                  </div>
                  <div class="client-kyc__history-meta">
                    <span>{{ item.device_label || resolveDeviceTypeLabel(item.device_type) }}</span>
                    <span>{{ item.browser || emptyValue }}</span>
                    <span>{{ item.os || emptyValue }}</span>
                    <span>{{ resolveLocation(item) }}</span>
                    <span>{{ item.auth_label || item.auth_method || emptyValue }}</span>
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

type VerificationStatus = "pending" | "approved" | "rejected" | "processing" | "failed" | string;

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

type ClientDocumentItem = {
  id: string;
  name: string;
  state: VerificationStatus;
  created_at: string;
  updated_at: string;
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

const { t, locale } = useI18n({ useScope: "global" });
const toast = useToast();
const appCore = useAppCore();

const isHistoryLoading = ref(false);
const isDetailsLoading = ref(false);
const isLoadingMore = ref(false);
const isBlocking = ref(false);
const isImpersonating = ref(false);
const visibleCount = ref(4);
const historyItems = ref<VisitHistoryItem[]>([]);
const documentsItems = ref<ClientDocumentItem[]>([]);
const verificationPayload = ref<any>({});
const metricsSummary = ref<any>({});

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

const isClientOnline = computed(() =>
  Boolean(props.userData.is_online) || Number(metricsSummary.value?.currently_online_users ?? 0) > 0
);

const firstHistoryDate = computed(() => {
  const first = historyItems.value[0]?.datetime;
  return typeof first === "string" && first.trim() !== "" ? first : "";
});

const lastSeenRaw = computed(() => String(metricsSummary.value?.last_seen_at || firstHistoryDate.value || ""));

const lastSeenExact = computed(() => formatDateTime(lastSeenRaw.value));

const lastSeenRelative = computed(() => {
  const parsed = parseDateValue(lastSeenRaw.value);
  if (!parsed) return "";

  return formatRelativeTime(parsed);
});

const onlineStatusText = computed(() => {
  if (isClientOnline.value) {
    return resolveText("admin.clients.online.onlineNow", "Online");
  }

  return resolveText("admin.clients.online.offlineNow", "Offline");
});

const infoStatus = computed<VerificationStatus>(() =>
  normalizeStatus(verificationPayload.value?.info?.verification_status || verificationPayload.value?.info?.status || "pending")
);

const documentsStatus = computed<VerificationStatus>(() =>
  normalizeStatus(verificationPayload.value?.documents?.verification_status || verificationPayload.value?.documents?.status || aggregateDocumentStatus.value)
);

const aggregateDocumentStatus = computed<VerificationStatus>(() => {
  if (documentsItems.value.length === 0) return "pending";
  if (documentsItems.value.some(document => normalizeStatus(document.state) === "pending")) return "pending";
  if (documentsItems.value.some(document => normalizeStatus(document.state) === "rejected")) return "rejected";
  if (documentsItems.value.every(document => normalizeStatus(document.state) === "approved")) return "approved";

  return "pending";
});

const verificationSummaryItems = computed(() => [
  {
    key: "profile",
    icon: "pi pi-user",
    label: resolveText("admin.clients.kyc.verification.profileData", "Profile data"),
    value: statusLabel(infoStatus.value),
    status: infoStatus.value,
  },
  {
    key: "documents",
    icon: "pi pi-file-check",
    label: resolveText("admin.clients.kyc.verification.documents", "Identity documents"),
    value: statusLabel(documentsStatus.value),
    status: documentsStatus.value,
  },
]);

const documentsSummaryText = computed(() => {
  const count = documentsItems.value.length;
  if (count === 0) {
    return resolveText("admin.clients.kyc.documents.none", "0 uploaded");
  }

  return resolveText("admin.clients.kyc.documents.count", "{count} uploaded").replace("{count}", String(count));
});

const profileDataItems = computed(() => [
  { key: "email", label: "Email", value: props.userData.email || emptyValue.value },
  {
    key: "emailVerified",
    label: resolveText("admin.clients.kyc.profile.emailVerifiedAt", "Email verified at"),
    value: formatDateTime(props.userData.email_verified_at) || emptyValue.value,
  },
  { key: "phone", label: resolveText("admin.clients.kyc.profile.phone", "Phone"), value: props.userData.phone || emptyValue.value },
  {
    key: "createdAt",
    label: resolveText("admin.clients.kyc.profile.createdAt", "Created at"),
    value: formatDateTime(props.userData.created_at) || emptyValue.value,
  },
  ...(props.userData.is_blocked
    ? [{
        key: "blockedAt",
        label: resolveText("admin.clients.kyc.profile.blockedAt", "Blocked at"),
        value: formatDateTime(props.userData.blocked_at) || emptyValue.value,
      }]
    : []),
]);

const addressDataItems = computed(() => [
  { key: "country", label: resolveText("admin.clients.columns.country", "Country"), value: props.userData.country || emptyValue.value },
  { key: "state", label: resolveText("admin.clients.columns.state", "State / Region"), value: props.userData.state || emptyValue.value },
  { key: "city", label: resolveText("admin.clients.columns.city", "City"), value: props.userData.city || emptyValue.value },
  { key: "address", label: resolveText("admin.clients.columns.address", "Address"), value: props.userData.address || emptyValue.value },
  { key: "postalCode", label: resolveText("admin.clients.columns.postalCode", "Postal code"), value: props.userData.postal_code || emptyValue.value },
]);

const normalizeStatus = (status: unknown): VerificationStatus => {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["done", "success", "successful", "verified"].includes(normalized)) return "approved";
  if (["cancelled", "canceled", "declined", "reject"].includes(normalized)) return "rejected";
  if (["process", "in_progress", "in-progress"].includes(normalized)) return "processing";

  return normalized || "pending";
};

const statusLabel = (status: VerificationStatus): string => {
  const normalized = normalizeStatus(status);
  const key = `admin.clients.kyc.status.${normalized}`;
  const fallback = normalized
    .split(/[_-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return resolveText(key, fallback);
};

const statusClass = (status: VerificationStatus): string => {
  const normalized = normalizeStatus(status);
  if (normalized === "approved") return "is-success";
  if (normalized === "rejected" || normalized === "failed") return "is-danger";
  if (normalized === "processing") return "is-info";

  return "is-warning";
};

const resolveLocation = (item: VisitHistoryItem): string => {
  const parts = [item.city, item.country]
    .filter((value) => typeof value === "string" && value.trim() !== "")
    .map(value => String(value).trim());

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return resolveText("admin.clients.kyc.history.locationNotProvided", "Geo data not provided");
};

const resolveDeviceTypeLabel = (deviceType: string): string => {
  if (deviceType === "mobile") return resolveText("admin.clients.kyc.history.device.mobile", "Mobile");
  if (deviceType === "tablet") return resolveText("admin.clients.kyc.history.device.tablet", "Tablet");
  return resolveText("admin.clients.kyc.history.device.desktop", "Desktop");
};

const parseDateValue = (value?: string | null): Date | null => {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;

  const date = new Date(normalized.includes("T") ? normalized : normalized.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value?: string | null): string => {
  const date = parseDateValue(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(locale.value || "en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (date: Date): string => {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale.value || "en", { numeric: "auto" });

  if (absolute < 60) return formatter.format(diffSeconds, "second");
  if (absolute < 3600) return formatter.format(Math.round(diffSeconds / 60), "minute");
  if (absolute < 86400) return formatter.format(Math.round(diffSeconds / 3600), "hour");
  if (absolute < 2592000) return formatter.format(Math.round(diffSeconds / 86400), "day");
  if (absolute < 31536000) return formatter.format(Math.round(diffSeconds / 2592000), "month");

  return formatter.format(Math.round(diffSeconds / 31536000), "year");
};

const normalizeDocument = (row: any): ClientDocumentItem => ({
  id: String(row?.id ?? ""),
  name: String(row?.name ?? row?.document_data?.number ?? ""),
  state: normalizeStatus(row?.state),
  created_at: formatDateTime(row?.created_at) || String(row?.created_at ?? ""),
  updated_at: formatDateTime(row?.updated_at) || String(row?.updated_at ?? ""),
});

const loadKycData = async () => {
  if (!props.clientId) return;

  isHistoryLoading.value = true;
  isDetailsLoading.value = true;

  try {
    const metricsDateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const [historyResponse, verificationResponse, documentsResponse, metricsResponse] = await Promise.all([
      appCore.adminModules.clients.getVisitHistory(props.clientId, { limit: 60 }),
      appCore.adminModules.verificationRequests.get(props.clientId),
      appCore.adminModules.documents.get({ clientId: props.clientId }),
      appCore.adminModules.clients.getMetrics(props.clientId, {
        date_from: metricsDateFrom,
        limit: 1,
      }),
    ]);

    historyItems.value = Array.isArray(historyResponse?.data?.data) ? historyResponse.data.data : [];
    visibleCount.value = Math.min(4, historyItems.value.length || 4);

    const verificationRequestDto = Array.isArray(verificationResponse?.data?.data) ? verificationResponse.data.data[0] : null;
    verificationPayload.value = verificationRequestDto?.data || {};

    documentsItems.value = Array.isArray(documentsResponse?.data?.data)
      ? documentsResponse.data.data.map(normalizeDocument)
      : [];

    metricsSummary.value = metricsResponse?.data?.data?.summary || {};
  } catch (error: any) {
    historyItems.value = [];
    documentsItems.value = [];
    verificationPayload.value = {};
    metricsSummary.value = {};
    toast.error(error?.response?.data?.message ?? resolveText("admin.clients.kyc.history.loadFailed", "Failed to load visit history."));
  } finally {
    isHistoryLoading.value = false;
    isDetailsLoading.value = false;
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
  await loadKycData();
});

watch(
  () => props.clientId,
  async () => {
    await loadKycData();
  }
);
</script>

<style lang="scss" scoped>
.client-kyc {
  width: 100%;
}

.client-kyc__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.client-kyc__card-header {
  align-items: flex-start;
  gap: 12px;
}

.client-kyc__identity-card,
.client-kyc__history-card {
  width: 100%;
}

.client-kyc__profile-layout {
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
  gap: 14px;
}

.client-kyc__photo-column,
.client-kyc__profile-main,
.client-kyc__actions,
.client-kyc__section,
.client-kyc__documents,
.client-kyc__documents-list,
.client-kyc__history-list {
  display: flex;
  flex-direction: column;
}

.client-kyc__photo-column,
.client-kyc__actions,
.client-kyc__profile-main,
.client-kyc__section,
.client-kyc__documents,
.client-kyc__documents-list,
.client-kyc__history-list {
  gap: 10px;
}

.client-kyc__photo {
  width: 100%;
  min-height: 220px;
  max-height: 320px;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--ui-primary-main) 12%, var(--color-stroke-ui-light));
  background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
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

.client-kyc__actions :deep(.p-button) {
  width: 100%;
}

.client-kyc__name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.client-kyc__name {
  margin: 0;
  color: var(--ui-text-main);
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 860;
  letter-spacing: -0.035em;
}

.client-kyc__online-state {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: var(--ui-text-secondary);
  font-size: 12px;
  text-align: right;
}

.client-kyc__online-top {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ui-text-main);
}

.client-kyc__online-dot,
.client-kyc__status-dot,
.client-kyc__status-pill i {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 999px;
}

.client-kyc__online-dot.is-online,
.client-kyc__status-dot.is-success,
.client-kyc__status-pill.is-success i {
  background: var(--ui-success-main, #26c281);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-success-main, #26c281) 14%, transparent);
}

.client-kyc__online-dot.is-offline {
  background: var(--ui-text-secondary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-text-secondary) 14%, transparent);
}

.client-kyc__online-exact,
.client-kyc__online-relative {
  line-height: 1.25;
}

.client-kyc__section {
  border-radius: 18px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--ui-primary-main) 10%, var(--color-stroke-ui-light));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--ui-primary-main) 6%, transparent), transparent 38%),
    color-mix(in srgb, var(--ui-background-panel) 84%, transparent);
}

.client-kyc__section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.client-kyc__section-header h5,
.client-kyc__documents-head h6 {
  margin: 0;
  color: var(--ui-text-main);
  font-size: 13px;
  font-weight: 820;
}

.client-kyc__section-header p,
.client-kyc__documents-head span {
  margin: 3px 0 0;
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.client-kyc__compact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;
}

.client-kyc__compact-grid--address {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.client-kyc__compact-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.client-kyc__compact-item span,
.client-kyc__document-row span,
.client-kyc__history-meta,
.client-kyc__user-agent {
  color: var(--ui-text-secondary);
}

.client-kyc__compact-item span {
  font-size: 11px;
  font-weight: 680;
}

.client-kyc__compact-item strong {
  overflow-wrap: anywhere;
  color: var(--ui-text-main);
  font-size: 13px;
  font-weight: 780;
}

.client-kyc__verification-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.client-kyc__verification-card {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 10px;
  background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
}

.client-kyc__verification-icon,
.client-kyc__history-icon {
  display: grid;
  place-items: center;
  color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
}

.client-kyc__verification-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
}

.client-kyc__verification-card span {
  display: block;
  color: var(--ui-text-secondary);
  font-size: 11px;
}

.client-kyc__verification-card strong {
  display: block;
  margin-top: 2px;
  color: var(--ui-text-main);
  font-size: 13px;
}

.client-kyc__status-dot.is-warning,
.client-kyc__status-pill.is-warning i {
  background: var(--color-ui-warning, #ff9f43);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-ui-warning, #ff9f43) 14%, transparent);
}

.client-kyc__status-dot.is-danger,
.client-kyc__status-pill.is-danger i {
  background: var(--ui-danger-main, #e25a5a);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-danger-main, #e25a5a) 14%, transparent);
}

.client-kyc__status-dot.is-info,
.client-kyc__status-pill.is-info i {
  background: var(--ui-primary-main);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
}

.client-kyc__documents {
  margin-top: 2px;
}

.client-kyc__documents-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.client-kyc__documents-empty,
.client-kyc__document-row,
.client-kyc__history-row {
  border-radius: 16px;
  background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
}

.client-kyc__documents-empty {
  padding: 12px;
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.client-kyc__document-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.client-kyc__document-row > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.client-kyc__document-row strong {
  overflow-wrap: anywhere;
  color: var(--ui-text-main);
  font-size: 13px;
}

.client-kyc__document-row span {
  font-size: 11px;
}

.client-kyc__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  color: var(--ui-text-main);
  font-size: 12px;
  font-weight: 760;
}

.client-kyc__history-list {
  width: 100%;
}

.client-kyc__history-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 11px;
  padding: 11px;
  border: 1px solid transparent;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.client-kyc__history-row:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
  background: color-mix(in srgb, var(--ui-primary-main) 6%, var(--ui-background-card));
}

.client-kyc__history-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
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
  font-size: 12px;
}

.client-kyc__user-agent {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  word-break: break-word;
}

.client-kyc__empty {
  min-height: 220px;
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
  .client-kyc__compact-grid,
  .client-kyc__compact-grid--address {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .client-kyc__profile-layout,
  .client-kyc__verification-grid {
    grid-template-columns: 1fr;
  }

  .client-kyc__photo {
    min-height: 180px;
    max-height: 280px;
  }
}

@media (max-width: 640px) {
  .client-kyc__card-header,
  .client-kyc__name-row,
  .client-kyc__documents-head,
  .client-kyc__document-row,
  .client-kyc__history-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .client-kyc__online-state {
    min-width: 0;
    align-items: flex-start;
    text-align: left;
  }

  .client-kyc__compact-grid,
  .client-kyc__compact-grid--address {
    grid-template-columns: 1fr;
  }
}
</style>
