<template>
  <div class="flex flex-col gap-5">
    <PanelDefault class="border-none bg-transparent shadow-none">
      <div class="flex flex-col gap-4">
        <div class="referral-card soft narrow">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ t("cabinet.referrals.general.account.title") }}</UiTextH5>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.account.description") }}
              </UiTextSmall>
            </div>
            <div class="grid gap-3 md:grid-cols-3">
              <div class="stat-chip">
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ t("cabinet.referrals.general.account.balance") }}</UiTextSmall>
                <div class="font-semibold text-[var(--ui-text-main)]">${{ referralAccount.balance.toLocaleString() }}</div>
              </div>
              <div class="stat-chip">
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ t("cabinet.referrals.general.account.available") }}</UiTextSmall>
                <div class="font-semibold text-[var(--ui-text-main)]">${{ referralAccount.available.toLocaleString() }}</div>
              </div>
              <div class="stat-chip">
                <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ t("cabinet.referrals.general.account.pending") }}</UiTextSmall>
                <div class="font-semibold text-[var(--ui-text-main)]">${{ referralAccount.pending.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
            <UiSelect
              class="min-w-[220px] md:w-[260px]"
              :data="mtAccountOptions"
              :value="selectedMtAccount"
              :placeholder="t('cabinet.referrals.general.account.select')"
              @change="selectedMtAccount = $event as string"
            />
            <UiButtonDefault state="success" class="!px-4 !py-2 w-full sm:w-auto" @click="handleTransfer">
              {{ t("cabinet.referrals.general.transferLabel") || "Переказати" }}
            </UiButtonDefault>
            <UiTextSmall class="text-[var(--ui-text-secondary)] text-left">
              {{ t("cabinet.referrals.general.account.transferHint") }}
            </UiTextSmall>
          </div>
        </div>

        <div class="referral-card mt-2">
          <div class="flex min-w-0 flex-col gap-3">
            <UiTextH4 class="text-[var(--ui-text-main)]">
              {{ t("cabinet.referrals.general.linkTitle") }}
            </UiTextH4>

            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.referrals.general.linkHint") }}
            </UiTextSmall>

            <div class="mt-2 flex flex-col gap-2">
              <div
                class="relative flex w-full items-center gap-2 rounded-lg bg-[var(--ui-background-sidebar)] px-3 py-2 text-[var(--ui-text-main)]"
              >
                <span
                  ref="referralText"
                  class="flex-1 truncate text-sm"
                >
                  {{ referralLink }}
                </span>
                <UiIconCopy
                  :text="copyReferral.toString()"
                  class="h-[18px] w-[18px] cursor-pointer text-[var(--ui-text-secondary)] transition hover:text-[var(--ui-text-main)]"
                  :title="t('cabinet.referrals.general.copyButton')"
                />
              </div>
            </div>

            <div class="mt-4 flex flex-col items-center gap-3">
              <UiTextSmall class="text-center text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.shareText") }}
              </UiTextSmall>
              <div class="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  class="share-btn share-btn-lg"
                  :title="t('cabinet.referrals.general.shareTelegram')"
                  @click="openShare(telegramShareLink)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M9.97 16.73 9.82 20c.36 0 .52-.15.71-.33l1.7-1.62 3.52 2.58c.65.36 1.11.17 1.28-.6l2.33-10.94c.21-.95-.34-1.33-.97-1.1L3.94 11.3c-.93.36-.92.88-.16 1.11l3.59 1.12 8.35-5.27c.39-.26.74-.12.45.13"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="share-btn share-btn-lg"
                  :title="t('cabinet.referrals.general.shareWhatsApp')"
                  @click="openShare(whatsappShareLink)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M12.04 2a10 10 0 0 0-8.66 14.94L2 22l5.17-1.35A10 10 0 1 0 12.04 2Zm5.87 14.27c-.24.67-1.4 1.3-1.95 1.38-.5.08-1.1.12-1.77-.11-.41-.13-.94-.3-1.63-.59-2.86-1.23-4.71-4.11-4.85-4.31-.14-.2-1.16-1.54-1.16-2.94 0-1.4.73-2.08 .99-2.36.27-.29.59-.36.79-.36h.57c.18 0 .43-.07.67.5.24.58.82 2 .89 2.14.07.14.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.52-.15.15-.3.32-.13.63.17.32.76 1.25 1.62 2.02 1.12.99 2.04 1.3 2.35 1.45.3.15.48.12.66-.07.18-.2.77-.9.98-1.2.22-.3.41-.25.69-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.34.07.12.07.69-.17 1.36Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="share-btn share-btn-lg"
                  :title="t('cabinet.referrals.general.shareMessenger')"
                  @click="openShare(messengerShareLink)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M12 2C6.48 2 2 6 2 11c0 2.86 1.5 5.42 3.89 7.04v3.1l3.55-1.95c.84.23 1.72.36 2.56.36 5.52 0 10-4 10-9s-4.48-9-10-9Zm4.33 9.4-2.47 2.62-2.46-2.62-4.68 2.62 5.15-5.54 2.46 2.62 4.68-2.62-2.68 2.92Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="share-btn share-btn-lg"
                  :title="t('cabinet.referrals.general.shareMail')"
                  @click="openShare(mailShareLink)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M20 4H4a2 2 0 0 0-2 2v.01l10 5.99 10-6V6a2 2 0 0 0-2-2Zm0 4.24-7.6 4.55a1 1 0 0 1-1.05 0L4 8.24V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="referral-card__qr">
            <UiQRCode :link="referralLink" />
          </div>
      </div>
      </div>
    </PanelDefault>

    <PanelDefault class="border-none bg-transparent shadow-none">
      <div class="grid gap-3 p-4 md:grid-cols-2">
        <div class="stat-card">
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.totalEarned") }}
          </UiTextSmall>
          <UiTextH5 class="text-[var(--ui-text-main)]">${{ summary.totalEarned.toLocaleString() }}</UiTextH5>
        </div>
        <div class="stat-card">
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.pendingPayouts") }}
          </UiTextSmall>
          <UiTextH5 class="text-[var(--ui-text-main)]">${{ summary.pendingPayouts.toLocaleString() }}</UiTextH5>
        </div>
        <div class="stat-card">
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.activeReferrals") }}
          </UiTextSmall>
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ summary.active }}</UiTextH5>
        </div>
        <div class="stat-card">
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.conversion") }}
          </UiTextSmall>
          <UiTextH5 class="text-[var(--ui-text-main)]">{{ summary.conversion }}%</UiTextH5>
        </div>
      </div>
    </PanelDefault>

    <PanelDefault class="border-none bg-transparent shadow-none">
      <div class="flex flex-col gap-5 p-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("cabinet.referrals.general.levelsTitle") }}</UiTextH4>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.levelHint") }}
          </UiTextSmall>
        </div>
        <div class="space-y-2">
          <div
            v-for="level in levels"
            :key="level.id"
            class="flex items-center justify-between rounded-lg bg-[var(--color-stroke-ui-dark)] px-3 py-2 shadow-sm"
          >
            <span class="text-[var(--ui-text-main)]">{{ level.label }}</span>
            <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ level.percent }}%</UiTextSmall>
          </div>
        </div>
        <YourLevelProgress :current="progress.current" :total="progress.total" />
      </div>
    </PanelDefault>

    <PanelDefault class="border-none bg-transparent shadow-none">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("cabinet.referrals.general.listTitle") }}</UiTextH4>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="tab in filters"
              :key="tab.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm transition"
              :class="
                tab.value === activeFilter
                  ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white'
                  : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'
              "
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <UiInput v-model="search" :placeholder="t('cabinet.referrals.general.searchPlaceholder')">
            <template #icon-left>
              <UiIconSearch />
            </template>
          </UiInput>

          <div class="space-y-2">
            <div
              v-for="referral in filteredReferrals"
              :key="referral.id"
              class="flex flex-col gap-2 rounded-xl bg-[var(--color-stroke-ui-dark)] px-3 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3">
                <UiImageCircle :src="referral.avatar" alt="User" size="36" />
                <div>
                  <div class="text-sm font-semibold text-[var(--ui-text-main)]">{{ referral.name }}</div>
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ referral.email }}</UiTextSmall>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 md:justify-end">
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.referralsCount") }}: {{ referral.referralsCount }}
                </UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.earned") }}: ${{ referral.amount.toLocaleString() }}
                </UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.tier") }}: {{ referral.tier }}
                </UiTextSmall>
                <UiBadge
                  :outline="true"
                  :state="referral.status === 'active' ? 'success' : referral.status === 'pending' ? 'warning' : 'danger'"
                  class="!py-1 !px-2"
                >
                  {{ statusLabel(referral.status) }}
                </UiBadge>
              </div>
            </div>

            <div
              v-if="filteredReferrals.length === 0"
              class="rounded-xl bg-[var(--color-stroke-ui-dark)] px-4 py-6 text-center text-[var(--ui-text-secondary)] shadow-sm"
            >
              {{ t("cabinet.referrals.general.empty") }}
            </div>
          </div>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import QRCode from "qrcode";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiIconInfo from "~/components/ui/UiIconInfo.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import YourLevelProgress from "./YourLevelProgress.vue";

const { t } = useI18n({ useScope: "global" });
const toast = useToast();

const referralLink = "https://stage.esterholdings.website?ref=w23dhDf73l4fcs1";
const referralText = ref<HTMLElement | null>(null);
const qrDataUrl = ref<string | null>(null);

const levels = reactive([
  { id: 1, label: t("cabinet.referrals.general.level", { level: 1 }), percent: 10 },
  { id: 2, label: t("cabinet.referrals.general.level", { level: 2 }), percent: 5 },
  { id: 3, label: t("cabinet.referrals.general.level", { level: 3 }), percent: 3 },
]);

const progress = reactive({ current: 150, total: 200 });

const referrals = reactive([
  {
    id: "2d1223fr23d23ed",
    name: "Anton Andriyenko",
    email: "anton@example.com",
    referralsCount: 3,
    amount: 1249,
    status: "active",
    tier: "Gold",
    avatar: "/images/user1.png",
  },
  {
    id: "32dij239dij239di",
    name: "Victor Dolgiy",
    email: "victor@example.com",
    referralsCount: 1,
    amount: 145,
    status: "pending",
    tier: "Silver",
    avatar: "/images/user1.png",
  },
  {
    id: "34v3443v23j3dkk3f",
    name: "Nick Naumenko",
    email: "nick@example.com",
    referralsCount: 8,
    amount: 45249,
    status: "active",
    tier: "Platinum",
    avatar: "/images/user1.png",
  },
  {
    id: "34v3443v23j3dkk3g",
    name: "Anna Abramova",
    email: "anna@example.com",
    referralsCount: 5,
    amount: 5541,
    status: "active",
    tier: "Silver",
    avatar: "/images/user1.png",
  },
  {
    id: "f34f43jg34gg3kk333",
    name: "Igor Baystryuk",
    email: "igor@example.com",
    referralsCount: 2,
    amount: 750,
    status: "blocked",
    tier: "Bronze",
    avatar: "/images/user1.png",
  },
]);

const filters = computed(() => [
  { value: "all", label: t("cabinet.referrals.general.filter.all") },
  { value: "active", label: t("cabinet.referrals.general.filter.active") },
  { value: "pending", label: t("cabinet.referrals.general.filter.pending") },
  { value: "blocked", label: t("cabinet.referrals.general.filter.blocked") },
]);
const activeFilter = ref("all");
const search = ref("");

const filteredReferrals = computed(() => {
  const term = search.value.toLowerCase();
  return referrals.filter((item) => {
    const matchesFilter = activeFilter.value === "all" ? true : item.status === activeFilter.value;
    const matchesSearch = [item.name, item.email, item.tier].some((field) => field.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });
});

const referralAccount = reactive({
  number: "RF-2384023",
  balance: 2350,
  available: 2200,
  pending: 150,
});

const mtAccountOptions = [
  { id: "mt-1", value: "MT4-2384001", text: "MT4-2384001" },
  { id: "mt-2", value: "MT4-2384002", text: "MT4-2384002" },
];

const selectedMtAccount = ref(mtAccountOptions[0].value);

const summary = computed(() => {
  const totalEarned = referrals.reduce((acc, r) => acc + r.amount, 0);
  const active = referrals.filter((r) => r.status === "active").length;
  const pendingPayouts = referrals.filter((r) => r.status === "pending").reduce((acc, r) => acc + r.amount, 0);
  const conversion = referrals.length ? Math.min(100, Math.round((active / referrals.length) * 100)) : 0;
  return { totalEarned, active, pendingPayouts, conversion };
});

const copyReferral = async () => {
  const text = referralText.value?.textContent ?? referralLink;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(t("cabinet.referrals.general.copied"));
  } catch (err) {
    toast.error(t("cabinet.referrals.general.copyError"));
  }
};

const telegramShareLink = computed(() => {
  const url = encodeURIComponent(referralLink);
  const text = encodeURIComponent(t("cabinet.referrals.general.shareText"));
  return `https://t.me/share/url?url=${url}&text=${text}`;
});

const whatsappShareLink = computed(() => {
  const url = encodeURIComponent(referralLink);
  const text = encodeURIComponent(t("cabinet.referrals.general.shareText"));
  return `https://wa.me/?text=${text}%20${url}`;
});

const messengerShareLink = computed(() => {
  const url = encodeURIComponent(referralLink);
  return `https://www.facebook.com/dialog/send?app_id=000000000&link=${url}`;
});

const mailShareLink = computed(() => {
  const subject = encodeURIComponent(t("cabinet.referrals.general.linkTitle"));
  const body = encodeURIComponent(`${t("cabinet.referrals.general.shareText")} ${referralLink}`);
  return `mailto:?subject=${subject}&body=${body}`;
});

const handleTransfer = () => {
  toast.info(
    `Переказ з реферального рахунку на ${selectedMtAccount.value} буде реалізовано після бекенд-оновлення.`,
    { timeout: 3000 }
  );
};

const createQrFile = async () => {
  if (!qrDataUrl.value) return null;
  try {
    const response = await fetch(qrDataUrl.value);
    const blob = await response.blob();
    return new File([blob], "referral-qr.png", { type: blob.type || "image/png" });
  } catch (err) {
    console.error("Cannot build QR file", err);
    return null;
  }
};

const openShare = async (link: string) => {
  const text = `${t("cabinet.referrals.general.shareText")} ${referralLink}`;
  const file = await createQrFile();

  if (file && navigator.canShare?.({ files: [file], text })) {
    try {
      await navigator.share({ files: [file], text });
      return;
    } catch (err) {
      console.warn("Share with QR failed, fallback to link", err);
    }
  }

  window.open(link, "_blank", "noopener,noreferrer");
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: t("cabinet.referrals.general.status.active"),
    pending: t("cabinet.referrals.general.status.pending"),
    blocked: t("cabinet.referrals.general.status.blocked"),
  };
  return map[status] ?? status;
};

onMounted(async () => {
  try {
    qrDataUrl.value = await QRCode.toDataURL(referralLink);
  } catch (err) {
    console.error("QR generation failed", err);
  }
});
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
}

.pill {
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 999px;
  padding: 8px 12px;
  color: var(--ui-text-main);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
  font-size: 12px;
  line-height: 1.3;
}

.share-btn {
  height: 36px;
  width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  color: var(--ui-text-main);
  background: var(--color-stroke-ui-dark);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.share-btn:hover {
  background: var(--ui-background-sidebar);
  color: var(--ui-text-main);
}

.share-btn-lg {
  height: 44px;
  width: 44px;
}

.referral-card {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
  border-radius: 14px;
  padding: 16px;
  max-width: 960px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.stat-chip {
  border-radius: 12px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05));
}

.referral-card__qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.referral-card__divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  color: var(--ui-text-secondary);
  min-height: 120px;
}

.referral-card__divider::before {
  content: "";
  position: absolute;
  inset: 12px auto 12px auto;
  width: 1px;
  background: var(--color-stroke-ui-light);
}

.divider-text {
  position: relative;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 12px;
  letter-spacing: 0.02em;
  text-align: center;
  padding: 10px 4px;
  border-radius: 10px;
  background: var(--color-stroke-ui-dark);
  z-index: 1;
}
</style>
