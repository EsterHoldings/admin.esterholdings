<template>
  <div class="verification-widget flex flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="flex flex-col gap-3 rounded-xl bg-[var(--color-stroke-ui-dark)]/70 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
          {{ t("cabinet.dashboard.accountVerification.title") }}
        </div>
        <div class="text-sm text-[var(--ui-text-secondary)]">
          {{ t("cabinet.dashboard.accountVerification.subtitle") }}
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex flex-col text-right">
          <UiTextH5 class="justify-end text-[var(--ui-text-main)]">
            {{ displayName }}
          </UiTextH5>
          <UiTextParagraph class="justify-end">
            <strong>{{ displayEmail }}</strong>
          </UiTextParagraph>
          <UiTextSmall class="justify-end">
            {{ displayBirthdate }}
          </UiTextSmall>
        </div>

        <NuxtLink :to="profileLink" class="shrink-0">
          <UiImageCircle :twoChars="initials" :src="photoUrl" />
        </NuxtLink>
      </div>
    </div>

    <div class="relative">
      <div v-if="isLoading" class="flex flex-col gap-2">
        <div v-for="idx in 5" :key="idx" class="verification-item animate-pulse">
          <div class="flex items-start gap-3 sm:items-center">
            <div class="h-8 w-8 rounded-lg bg-[var(--color-stroke-ui-light)]"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-3 w-40 rounded bg-[var(--color-stroke-ui-light)]"></div>
              <div class="h-3 w-56 rounded bg-[var(--color-stroke-ui-light)]"></div>
              <div class="h-3 w-32 rounded bg-[var(--color-stroke-ui-light)]"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in verificationSteps"
          :key="item.key"
          class="verification-item"
        >
          <div class="flex items-start gap-3 sm:items-center">
            <div class="step-icon" :class="item.state">
              <component :is="item.icon" class="h-4 w-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                <span class="text-sm font-semibold text-[var(--ui-text-main)] truncate" :title="item.title">
                  {{ item.title }}
                </span>
                <UiBadge :state="badgeState(item.state)" outline class="!py-0.5 !px-2 text-xs">
                  {{ item.statusLabel }}
                </UiBadge>
              </div>
              <UiTextSmall class="text-[var(--ui-text-secondary)] leading-snug">
                {{ item.statusText }}
              </UiTextSmall>
              <UiTextSmall v-if="item.comment" class="text-[var(--ui-primary-accent)] mt-1 leading-snug">
                {{ item.comment }}
              </UiTextSmall>
              <UiTextSmall v-if="item.hint" class="text-[var(--ui-text-secondary)] mt-1 leading-snug">
                {{ item.hint }}
              </UiTextSmall>
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
import { useLocalePath } from "~/.nuxt/imports";

import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAuthStore } from "~/stores/authStore";

type VerificationStatus = "pending" | "approved" | "rejected";

const { t } = useI18n({ useScope: "global" });
const localePath = useLocalePath();
const appCore = useAppCore();
const authStore = useAuthStore();

const profileLink = computed(() => localePath("/profile"));

const displayName = computed(() => {
  const user = authStore.user;
  const first = user?.first_name || "";
  const last = user?.last_name || "";
  const full = `${first} ${last}`.trim();
  return full.length ? full : user?.email || "-";
});

const displayEmail = computed(() => authStore.user?.email || "-");
const displayBirthdate = computed(() => authStore.user?.birthdate || "-");
const photoUrl = computed(() => authStore.photoUrl || "");
const initials = computed(() => {
  const user = authStore.user;
  const first = user?.first_name?.[0] || "";
  const last = user?.last_name?.[0] || "";
  const value = `${first}${last}`.toUpperCase();
  return value.length ? value : "U";
});

const isLoading = ref(false);
const verificationRequestData = reactive<Record<string, any>>({});
const handleDashboardRefresh = () => loadVerificationData();

const emailStatus = ref<VerificationStatus>("pending");
const infoStatus = ref<VerificationStatus>("pending");
const photoStatus = ref<VerificationStatus>("pending");
const documentsStatus = ref<VerificationStatus>("pending");
const depositStatus = ref<VerificationStatus>("pending");

const emailComment = ref("");
const infoComment = ref("");
const photoComment = ref("");
const documentsComment = ref("");
const depositComment = ref("");

const statusState = (status: VerificationStatus) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warn";
};

const statusLabel = (status: VerificationStatus) => {
  if (status === "approved") return t("cabinet.dashboard.accountVerification.statuses.done") || "Done";
  if (status === "rejected") return t("cabinet.dashboard.accountVerification.statuses.required") || "Required";
  return t("cabinet.dashboard.accountVerification.statuses.inProgress") || "In progress";
};

const statusTextByKey = (key: string, status: VerificationStatus) => {
  if (key === "photo") {
    if (status === "approved") return t("cabinet.dashboard.accountVerification.profilePhotoVerified");
    if (status === "rejected") return t("cabinet.dashboard.accountVerification.profilePhotoRejected");
    return t("cabinet.dashboard.accountVerification.profilePhotoInProgress");
  }

  if (key === "docs") {
    if (status === "approved") return t("cabinet.dashboard.accountVerification.documentVerified");
    if (status === "rejected") return t("cabinet.dashboard.accountVerification.documentRejected");
    return t("cabinet.dashboard.accountVerification.documentInProgress");
  }

  if (key === "deposit") {
    if (status === "approved") return t("cabinet.dashboard.accountVerification.paymentVerified");
    if (status === "rejected") return t("cabinet.dashboard.accountVerification.paymentRejected");
    return t("cabinet.dashboard.accountVerification.paymentInProgress");
  }

  if (key === "profile") {
    if (status === "approved") return t("cabinet.dashboard.accountVerification.profileVerified");
    if (status === "rejected") return t("cabinet.dashboard.accountVerification.profileRejected");
    return t("cabinet.dashboard.accountVerification.profileInProgress");
  }

  if (status === "approved") return t("cabinet.dashboard.accountVerification.profileVerified");
  if (status === "rejected") return t("cabinet.dashboard.accountVerification.profileRejected");
  return t("cabinet.dashboard.accountVerification.profileInProgress");
};

const verificationSteps = computed(() => [
  {
    key: "photo",
    title: "Фото користувача",
    status: photoStatus.value,
    statusText: statusTextByKey("photo", photoStatus.value),
    statusLabel: statusLabel(photoStatus.value),
    hint: "Загрузите фото пользователя, система в скоро времени проведет автоматическую ферификацию!",
    comment: photoComment.value,
    icon: photoStatus.value === "approved" ? UiIconSuccess : photoStatus.value === "rejected" ? UiIconFailed : UiIconWarning,
    state: statusState(photoStatus.value),
  },
  {
    key: "profile",
    title: "Дані користувача",
    status: infoStatus.value,
    statusText: statusTextByKey("profile", infoStatus.value),
    statusLabel: statusLabel(infoStatus.value),
    hint: "Заповніть персональні дані в профілі — після цього система автоматично продовжить верифікацію.",
    comment: infoComment.value,
    icon: infoStatus.value === "approved" ? UiIconSuccess : infoStatus.value === "rejected" ? UiIconFailed : UiIconWarning,
    state: statusState(infoStatus.value),
  },
  {
    key: "email",
    title: "Верифікація пошти",
    status: emailStatus.value,
    statusText: statusTextByKey("email", emailStatus.value),
    statusLabel: statusLabel(emailStatus.value),
    hint: "Підтвердіть email через лист — інколи він потрапляє в «Спам» або «Промоакції».",
    comment: emailComment.value,
    icon: emailStatus.value === "approved" ? UiIconSuccess : emailStatus.value === "rejected" ? UiIconFailed : UiIconWarning,
    state: statusState(emailStatus.value),
  },
  {
    key: "docs",
    title: "Документи",
    status: documentsStatus.value,
    statusText: statusTextByKey("docs", documentsStatus.value),
    statusLabel: statusLabel(documentsStatus.value),
    hint: "",
    comment: documentsComment.value,
    icon: documentsStatus.value === "approved" ? UiIconSuccess : documentsStatus.value === "rejected" ? UiIconFailed : UiIconWarning,
    state: statusState(documentsStatus.value),
  },
  {
    key: "deposit",
    title: "1-й депозит",
    status: depositStatus.value,
    statusText: statusTextByKey("deposit", depositStatus.value),
    statusLabel: statusLabel(depositStatus.value),
    hint: "Зробіть перший депозит — після зарахування система автоматично оновить статус.",
    comment: depositComment.value,
    icon: depositStatus.value === "approved" ? UiIconSuccess : depositStatus.value === "rejected" ? UiIconFailed : UiIconWarning,
    state: statusState(depositStatus.value),
  },
]);

const badgeState = (state: "warn" | "error" | "success") => {
  if (state === "success") return "success";
  if (state === "error") return "danger";
  return "warning";
};

const loadVerificationData = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const response = await appCore.verifications.get();
    Object.assign(verificationRequestData, response.data.data);

    emailStatus.value = verificationRequestData["email"]?.["verification_status"] ?? emailStatus.value;
    photoStatus.value = verificationRequestData["photo"]?.["verification_status"] ?? photoStatus.value;
    infoStatus.value = verificationRequestData["info"]?.["verification_status"] ?? infoStatus.value;
    documentsStatus.value = verificationRequestData["documents"]?.["verification_status"] ?? documentsStatus.value;
    depositStatus.value = verificationRequestData["deposit"]?.["verification_status"] ?? depositStatus.value;

    emailComment.value = verificationRequestData["email"]?.["comment"] ?? "";
    photoComment.value = verificationRequestData["photo"]?.["comment"] ?? "";
    infoComment.value = verificationRequestData["info"]?.["comment"] ?? "";
    documentsComment.value = verificationRequestData["documents"]?.["comment"] ?? "";
    depositComment.value = verificationRequestData["deposit"]?.["comment"] ?? "";
  } finally {
    setTimeout(() => (isLoading.value = false), 250);
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
.verification-item {
  border-radius: 12px;
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  padding: 14px 16px;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.verification-item:hover {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
}

.step-icon {
  height: 32px;
  width: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--ui-background-card);
}

.step-icon.warn {
  color: var(--color-ui-warning);
}

.step-icon.error {
  color: var(--color-danger);
}

.step-icon.success {
  color: var(--color-success);
}
</style>
