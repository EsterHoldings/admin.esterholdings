<template>
  <div class="verification-widget dashboard-side-widget text-[var(--ui-text-main)]">
    <div class="verification-header-card">
      <div class="verification-header-card__left">
        <div class="verification-title">
          {{ t("cabinet.dashboard.accountVerification.title") }}
        </div>
        <div class="verification-subtitle" :title="summaryText">
          {{ summaryText }}
        </div>
        <div class="verification-remaining">
          {{ stepsRemainingText }}
        </div>
      </div>

      <NuxtLink :to="profileLink" class="verification-profile">
        <UiImageCircle :twoChars="initials" :src="photoUrl" />
      </NuxtLink>
    </div>

    <div class="verification-progress-card">
      <div class="verification-progress-card__top">
        <span class="verification-progress-card__title">{{ progressTitle }}</span>
        <UiBadge state="info" outline class="!px-2.5 !py-0.5 text-xs">
          {{ verifiedCountText }}
        </UiBadge>
      </div>

      <div class="verification-progress-track" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
        <span class="verification-progress-fill" :style="{ width: `${progressPercent}%` }"></span>
      </div>

      <div class="verification-progress-meta">
        <span class="verification-progress-meta__item is-success">
          {{ doneLabel }}: {{ approvedCount }}
        </span>
        <span class="verification-progress-meta__item is-warning">
          {{ inProgressLabel }}: {{ pendingCount }}
        </span>
        <span class="verification-progress-meta__item is-danger">
          {{ requiredLabel }}: {{ rejectedCount }}
        </span>
      </div>
    </div>

    <div class="verification-list-wrap">
      <div v-if="isLoading" class="verification-list">
        <div v-for="idx in 5" :key="idx" class="verification-step verification-step--skeleton animate-pulse">
          <div class="h-8 w-8 rounded-lg bg-[var(--color-stroke-ui-light)]"></div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="h-3 w-24 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-3 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="h-5 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
        </div>
      </div>

      <div v-else class="verification-list">
        <div v-for="step in verificationSteps" :key="step.key" class="verification-step">
          <div class="verification-step__icon" :class="step.stateClass">
            <component :is="step.icon" class="h-4 w-4" />
          </div>

          <div class="verification-step__meta">
            <div class="verification-step__title" :title="step.title">
              {{ step.title }}
            </div>
            <div class="verification-step__status">
              <span class="verification-step__status-dot" :class="step.stateClass"></span>
              <span>{{ step.statusLabel }}</span>
            </div>
          </div>

          <UiBadge :state="step.badgeState" outline class="verification-step__badge !px-2.5 !py-0.5 text-xs">
            {{ step.statusLabel }}
          </UiBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "~/.nuxt/imports";

import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiIconImage from "~/components/ui/UiIconImage.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconMails from "~/components/ui/UiIconMails.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAuthStore } from "~/stores/authStore";

type VerificationStatus = "pending" | "approved" | "rejected";
type BadgeState = "warning" | "success" | "danger";

const { t } = useI18n({ useScope: "global" });
const localePath = useLocalePath();
const appCore = useAppCore();
const authStore = useAuthStore();

const profileLink = computed(() => localePath("/profile"));
const isLoading = ref(false);
const verificationRequestData = reactive<Record<string, any>>({});

const resolveText = (key: string, fallback: string): string => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

const photoUrl = computed(() => authStore.photoUrl || "");
const initials = computed(() => {
  const user = authStore.user;
  const first = user?.first_name?.[0] || "";
  const last = user?.last_name?.[0] || "";
  const value = `${first}${last}`.toUpperCase();
  return value.length ? value : "U";
});

const emailStatus = ref<VerificationStatus>("pending");
const infoStatus = ref<VerificationStatus>("pending");
const photoStatus = ref<VerificationStatus>("pending");
const documentsStatus = ref<VerificationStatus>("pending");
const depositStatus = ref<VerificationStatus>("pending");

const normalizeStatus = (value: unknown, fallback: VerificationStatus): VerificationStatus => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
  if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
  return "pending";
};

const statusLabel = (status: VerificationStatus): string => {
  if (status === "approved") return resolveText("cabinet.dashboard.accountVerification.statuses.done", "Done");
  if (status === "rejected") return resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required");
  return resolveText("cabinet.dashboard.accountVerification.statuses.inProgress", "In progress");
};

const stateClass = (status: VerificationStatus): "success" | "warning" | "danger" => {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
};

const badgeState = (status: VerificationStatus): BadgeState => {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
};

const verificationSteps = computed(() => [
  {
    key: "photo",
    title: resolveText("cabinet.dashboard.accountVerification.steps.photo", "Profile photo"),
    status: photoStatus.value,
    statusLabel: statusLabel(photoStatus.value),
    stateClass: stateClass(photoStatus.value),
    badgeState: badgeState(photoStatus.value),
    icon: UiIconImage,
  },
  {
    key: "profile",
    title: resolveText("cabinet.dashboard.accountVerification.steps.profile", "Profile data"),
    status: infoStatus.value,
    statusLabel: statusLabel(infoStatus.value),
    stateClass: stateClass(infoStatus.value),
    badgeState: badgeState(infoStatus.value),
    icon: UiIconProfile,
  },
  {
    key: "email",
    title: resolveText("cabinet.dashboard.accountVerification.steps.email", "Email verification"),
    status: emailStatus.value,
    statusLabel: statusLabel(emailStatus.value),
    stateClass: stateClass(emailStatus.value),
    badgeState: badgeState(emailStatus.value),
    icon: UiIconMails,
  },
  {
    key: "documents",
    title: resolveText("cabinet.dashboard.accountVerification.steps.documents", "Documents"),
    status: documentsStatus.value,
    statusLabel: statusLabel(documentsStatus.value),
    stateClass: stateClass(documentsStatus.value),
    badgeState: badgeState(documentsStatus.value),
    icon: UiIconDocuments,
  },
  {
    key: "deposit",
    title: resolveText("cabinet.dashboard.accountVerification.steps.deposit", "First deposit"),
    status: depositStatus.value,
    statusLabel: statusLabel(depositStatus.value),
    stateClass: stateClass(depositStatus.value),
    badgeState: badgeState(depositStatus.value),
    icon: UiIconPayment,
  },
]);

const totalCount = computed(() => verificationSteps.value.length);
const approvedCount = computed(() => verificationSteps.value.filter((step) => step.status === "approved").length);
const rejectedCount = computed(() => verificationSteps.value.filter((step) => step.status === "rejected").length);
const pendingCount = computed(() => totalCount.value - approvedCount.value - rejectedCount.value);
const remainingCount = computed(() => totalCount.value - approvedCount.value);
const progressPercent = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((approvedCount.value / totalCount.value) * 100);
});

const doneLabel = computed(() => resolveText("cabinet.dashboard.accountVerification.statuses.done", "Done"));
const inProgressLabel = computed(() => resolveText("cabinet.dashboard.accountVerification.statuses.inProgress", "In progress"));
const requiredLabel = computed(() => resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required"));

const progressTitle = computed(() =>
  resolveText("cabinet.dashboard.accountVerification.progressTitle", "Verification progress"),
);

const verifiedCountText = computed(() =>
  resolveText("cabinet.dashboard.accountVerification.verifiedCount", "Verified {done}/{total}")
    .replace("{done}", String(approvedCount.value))
    .replace("{total}", String(totalCount.value)),
);

const summaryText = computed(() => {
  if (approvedCount.value === totalCount.value && totalCount.value > 0) {
    return resolveText("cabinet.dashboard.accountVerification.complete", "Account fully verified");
  }

  return resolveText("cabinet.dashboard.accountVerification.notComplete", "Account is not fully verified");
});

const stepsRemainingText = computed(() =>
  resolveText("cabinet.dashboard.accountVerification.stepsRemaining", "Remaining steps: {count}")
    .replace("{count}", String(remainingCount.value)),
);

const handleDashboardRefresh = () => {
  loadVerificationData();
};

const loadVerificationData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const response = await appCore.verifications.get();
    Object.assign(verificationRequestData, response.data.data);

    emailStatus.value = normalizeStatus(verificationRequestData.email?.verification_status, "pending");
    photoStatus.value = normalizeStatus(verificationRequestData.photo?.verification_status, "pending");
    infoStatus.value = normalizeStatus(verificationRequestData.info?.verification_status, "pending");
    documentsStatus.value = normalizeStatus(verificationRequestData.documents?.verification_status, "pending");
    depositStatus.value = normalizeStatus(verificationRequestData.deposit?.verification_status, "pending");
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 250);
  }
};

onMounted(async () => {
  await loadVerificationData();
  useEventBus.on("dashboardRefresh", handleDashboardRefresh);
});

onBeforeUnmount(() => {
  useEventBus.off("dashboardRefresh", handleDashboardRefresh);
});
</script>

<style scoped>
.verification-widget {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.dashboard-side-widget {
  --dashboard-side-widget-height: clamp(360px, 43vh, 440px);
  min-height: var(--dashboard-side-widget-height);
  height: var(--dashboard-side-widget-height);
}

.verification-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background:
    linear-gradient(110deg, rgba(18, 179, 126, 0.14) 0%, transparent 52%),
    var(--ui-background-panel);
}

.verification-header-card__left {
  min-width: 0;
}

.verification-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.1;
}

.verification-subtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.25;
  color: var(--ui-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verification-remaining {
  margin-top: 2px;
  font-size: 11px;
  color: var(--ui-text-secondary);
}

.verification-profile {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.verification-progress-card {
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  padding: 10px 12px;
}

.verification-progress-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.verification-progress-card__title {
  font-size: 12px;
  color: var(--ui-text-secondary);
}

.verification-progress-track {
  margin-top: 8px;
  height: 8px;
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-stroke-ui-light);
}

.verification-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--ui-primary-accent), var(--color-success));
  transition: width 0.25s ease;
}

.verification-progress-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 11px;
}

.verification-progress-meta__item {
  white-space: nowrap;
}

.verification-progress-meta__item.is-success {
  color: var(--color-success);
}

.verification-progress-meta__item.is-warning {
  color: var(--color-ui-warning);
}

.verification-progress-meta__item.is-danger {
  color: var(--color-danger);
}

.verification-list-wrap {
  min-height: 0;
  flex: 1;
}

.verification-list {
  height: 100%;
  display: grid;
  gap: 8px;
  grid-auto-rows: minmax(64px, auto);
  align-content: start;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.verification-step {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  padding: 10px 12px;
  min-height: 64px;
  overflow: hidden;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.verification-step:hover {
  background: var(--ui-background-card);
}

.verification-step--skeleton {
  pointer-events: none;
}

.verification-step__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--ui-background-card);
  flex-shrink: 0;
}

.verification-step__icon.success {
  color: var(--color-success);
}

.verification-step__icon.warning {
  color: var(--color-ui-warning);
}

.verification-step__icon.danger {
  color: var(--color-danger);
}

.verification-step__meta {
  min-width: 0;
  width: 100%;
}

.verification-step__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ui-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verification-step__status {
  margin-top: 4px;
  font-size: 11px;
  color: var(--ui-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;
}

.verification-step__status > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verification-step__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.verification-step__status-dot.success {
  background: var(--color-success);
}

.verification-step__status-dot.warning {
  background: var(--color-ui-warning);
}

.verification-step__status-dot.danger {
  background: var(--color-danger);
}

.verification-step__badge {
  margin-left: auto;
  flex-shrink: 0;
  max-width: 100%;
}

@media (max-width: 1023px) {
  .dashboard-side-widget {
    min-height: 0;
    height: auto;
  }

  .verification-list {
    height: auto;
    overflow: visible;
    padding-right: 0;
  }
}
</style>
