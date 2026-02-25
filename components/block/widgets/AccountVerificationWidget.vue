<template>
  <div class="verification-widget dashboard-side-widget text-[var(--ui-text-main)]">
    <div class="verification-header-card">
      <div class="verification-header-card__left">
        <div class="verification-title">
          {{ t("cabinet.dashboard.accountVerification.title") }}
        </div>
        <div
          class="verification-subtitle"
          :title="summaryText">
          {{ summaryText }}
        </div>
      </div>

      <div class="verification-profile">
        <UiImageCircle
          :twoChars="initials"
          :src="photoUrl" />
      </div>
    </div>

    <div class="verification-progress-card">
      <div class="verification-progress-card__top">
        <span class="verification-progress-card__title">{{ progressTitle }}</span>
        <UiBadge
          state="info"
          outline
          class="!px-2.5 !py-0.5 text-xs">
          {{ verifiedCountText }}
        </UiBadge>
      </div>

      <div
        class="verification-step-progress"
        :aria-label="verifiedCountText">
        <span
          v-for="step in orderedSteps"
          :key="`progress-${step.key}`"
          class="verification-step-progress__item"
          :class="`is-${step.status}`">
          <span class="verification-step-progress__label">{{ step.title }}</span>
        </span>
      </div>
    </div>

    <div class="verification-list-wrap">
      <div
        v-if="isLoading"
        class="verification-list">
        <div
          v-for="idx in 5"
          :key="idx"
          class="verification-step verification-step--skeleton animate-pulse">
          <div class="h-8 w-8 rounded-lg bg-[var(--color-stroke-ui-light)]"></div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="h-3 w-24 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-3 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="h-5 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
        </div>
      </div>

      <div
        v-else
        class="verification-list">
        <div
          v-for="step in orderedSteps"
          :key="step.key"
          class="verification-step">
          <div
            class="verification-step__icon"
            :class="step.stateClass">
            <component
              :is="step.icon"
              class="verification-step__icon-svg" />
          </div>

          <div class="verification-step__meta">
            <div class="verification-step__title-row">
              <div
                class="verification-step__title"
                :title="step.title">
                {{ step.title }}
              </div>

              <UiBadge
                :state="step.badgeState"
                outline
                class="verification-step__badge !px-2.5 !py-0.5 text-xs">
                {{ step.statusLabel }}
              </UiBadge>
            </div>
            <div class="verification-step__status">
              <span
                class="verification-step__status-dot"
                :class="step.stateClass"></span>
              <span>{{ step.statusLabel }}</span>
            </div>
            <div
              v-if="step.comment"
              class="verification-step__comment">
              {{ step.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";

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
  type VerificationStepKey = "photo" | "profile" | "email" | "documents" | "deposit";

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();
  const authStore = useAuthStore();

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
    if (status === "rejected")
      return resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required");
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

  const getComment = (key: string): string => {
    const raw = verificationRequestData?.[key]?.comment;
    if (typeof raw !== "string") return "";
    return raw.trim();
  };

  const allSteps = computed(() => [
    {
      key: "photo" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.photo", "Profile photo"),
      status: photoStatus.value,
      statusLabel: statusLabel(photoStatus.value),
      stateClass: stateClass(photoStatus.value),
      badgeState: badgeState(photoStatus.value),
      comment: getComment("photo"),
      icon: UiIconImage,
    },
    {
      key: "profile" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.profile", "Profile data"),
      status: infoStatus.value,
      statusLabel: statusLabel(infoStatus.value),
      stateClass: stateClass(infoStatus.value),
      badgeState: badgeState(infoStatus.value),
      comment: getComment("info"),
      icon: UiIconProfile,
    },
    {
      key: "email" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.email", "Email verification"),
      status: emailStatus.value,
      statusLabel: statusLabel(emailStatus.value),
      stateClass: stateClass(emailStatus.value),
      badgeState: badgeState(emailStatus.value),
      comment: getComment("email"),
      icon: UiIconMails,
    },
    {
      key: "documents" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.documents", "Documents"),
      status: documentsStatus.value,
      statusLabel: statusLabel(documentsStatus.value),
      stateClass: stateClass(documentsStatus.value),
      badgeState: badgeState(documentsStatus.value),
      comment: getComment("documents"),
      icon: UiIconDocuments,
    },
    {
      key: "deposit" as VerificationStepKey,
      title: resolveText("cabinet.dashboard.accountVerification.steps.deposit", "First deposit"),
      status: depositStatus.value,
      statusLabel: statusLabel(depositStatus.value),
      stateClass: stateClass(depositStatus.value),
      badgeState: badgeState(depositStatus.value),
      comment: getComment("deposit"),
      icon: UiIconPayment,
    },
  ]);

  const statusPriority: Record<VerificationStatus, number> = {
    approved: 0,
    pending: 1,
    rejected: 2,
  };

  const keyPriority: Record<VerificationStepKey, number> = {
    photo: 0,
    profile: 1,
    email: 2,
    documents: 3,
    deposit: 4,
  };

  const orderedSteps = computed(() =>
    [...allSteps.value].sort((a, b) => {
      const byStatus = statusPriority[a.status] - statusPriority[b.status];
      if (byStatus !== 0) return byStatus;
      return keyPriority[a.key] - keyPriority[b.key];
    })
  );

  const totalCount = computed(() => allSteps.value.length);
  const approvedCount = computed(() => allSteps.value.filter(step => step.status === "approved").length);
  const isFullyVerified = computed(
    () => totalCount.value > 0 && allSteps.value.every(step => step.status === "approved")
  );

  const progressTitle = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.progressTitle", "Verification progress")
  );

  const verifiedCountText = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.verifiedCount", "Verified {done}/{total}")
      .replace("{done}", String(approvedCount.value))
      .replace("{total}", String(totalCount.value))
  );

  const summaryText = computed(() => {
    if (isFullyVerified.value) {
      return resolveText("cabinet.dashboard.accountVerification.complete", "Account fully verified");
    }

    return resolveText("cabinet.dashboard.accountVerification.notComplete", "Account is not fully verified");
  });

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
    border-radius: 14px;
    border: 0;
    background: var(--ui-background-panel);
    padding: 12px;
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
    margin: -12px -12px 0;
    padding: 12px;
    border-radius: 0;
    background:
      linear-gradient(
        110deg,
        color-mix(in srgb, var(--color-success, var(--ui-primary-accent)) 18%, transparent) 0%,
        transparent 52%
      ),
      var(--ui-background-card);
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

  .verification-profile {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .verification-progress-card {
    border-radius: 12px;
    background: transparent;
    padding: 8px 0 0;
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

  .verification-step-progress {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  .verification-step-progress__item {
    min-height: 30px;
    height: 30px;
    max-height: 30px;
    border-radius: 10px;
    background: var(--color-stroke-ui-light);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 8px;
    min-width: 0;
  }

  .verification-step-progress__label {
    font-size: 10px;
    line-height: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    width: 100%;
  }

  .verification-step-progress__item.is-approved {
    background: color-mix(in srgb, var(--color-success, var(--ui-primary-accent)) 24%, transparent);
  }

  .verification-step-progress__item.is-pending {
    background: color-mix(in srgb, var(--color-ui-warning, var(--ui-primary-accent)) 22%, transparent);
  }

  .verification-step-progress__item.is-rejected {
    background: color-mix(in srgb, var(--color-danger, var(--ui-primary-accent)) 22%, transparent);
  }

  .verification-list-wrap {
    position: relative;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .verification-list-wrap::after {
    content: "";
    position: absolute;
    left: 0;
    right: 4px;
    bottom: 0;
    height: 28px;
    pointer-events: none;
    z-index: 2;
    background: linear-gradient(180deg, transparent 0%, var(--ui-background-panel) 92%);
  }

  .verification-list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    gap: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    padding-bottom: 0;
  }

  .verification-step {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    align-items: flex-start;
    gap: 10px;
    border-radius: 12px;
    border: 0;
    background: transparent;
    padding: 10px 12px;
    min-height: 0;
    transition: background-color 0.2s ease;
  }

  .verification-step:hover {
    background: var(--ui-background-card);
  }

  .verification-step--skeleton {
    pointer-events: none;
  }

  .verification-step__icon {
    width: 28px;
    height: 28px;
    margin-top: 2px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--ui-background-card);
    flex-shrink: 0;
  }

  .verification-step__icon-svg {
    width: 18px;
    height: 18px;
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

  .verification-step__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .verification-step__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--ui-text-main);
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
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
    white-space: normal;
    overflow-wrap: anywhere;
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
    flex-shrink: 0;
  }

  .verification-step__comment {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.3;
    color: var(--ui-text-secondary);
    white-space: normal;
    overflow-wrap: anywhere;
  }

  @media (max-width: 767px) {
    .verification-step-progress {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .verification-step-progress__item:last-child {
      grid-column: span 2;
    }

    .verification-step__title-row {
      flex-direction: column;
      gap: 6px;
    }
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
      padding-bottom: 0;
    }

    .verification-list-wrap::after {
      display: none;
    }
  }
</style>
