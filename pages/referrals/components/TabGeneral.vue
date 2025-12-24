<template>
  <div class="referrals-general flex flex-col gap-5 text-[var(--ui-text-main)]">
    <!-- Referral account summary -->
    <div class="panel account-panel">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-1">
            <UiTextH5>{{ t("cabinet.referrals.general.account.title") }}</UiTextH5>
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.referrals.general.account.description") }}
            </UiTextSmall>
          </div>
          <UiButtonDefault state="success" class="!px-5 !py-2 w-full sm:w-auto sm:self-start">
            {{ t("cabinet.referrals.general.withdrawLabel") }}
          </UiButtonDefault>
        </div>

        <div class="account-grid">
          <SummaryCard
            :label="t('cabinet.referrals.general.account.balance')"
            :value="`$${format(summary.balance)}`"
          />
          <SummaryCard
            :label="t('cabinet.referrals.general.account.totalEarned')"
            :value="`$${format(summary.totalEarned)}`"
          />
          <SummaryCard
            :label="t('cabinet.referrals.general.account.monthEarned')"
            :value="`$${format(summary.monthEarned)}`"
          />
          <SummaryCard
            :label="t('cabinet.referrals.general.account.prevMonth')"
            :value="`$${format(summary.prevMonth)}`"
          />
          <SummaryCard
            :label="t('cabinet.referrals.general.account.active')"
            :value="summary.active"
          />
          <SummaryCard
            :label="t('cabinet.referrals.general.account.conversion')"
            :value="`${summary.conversion}%`"
          />
        </div>

        <UiTextSmall class="text-[var(--ui-text-secondary)] text-left">
          {{ t("cabinet.referrals.general.account.transferHint") }}
        </UiTextSmall>
      </div>
    </div>

    <!-- Levels & 3-depth network -->
    <div class="grid gap-4 lg:grid-cols-2">
    <div class="panel">
      <div class="flex flex-col gap-[2.75rem]">
          <div class="flex items-center justify-between">
            <UiTextH5>{{ t("cabinet.referrals.general.levelsTitle") }}</UiTextH5>
            <UiBadge state="warning" outline>
              {{ t("cabinet.referrals.general.levelProgressLabel", { level: currentLevel.name }) }}
            </UiBadge>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-sm text-[var(--ui-text-secondary)]">
              <span>{{ t("cabinet.referrals.general.xp") }}: {{ currentLevel.xp }}/{{ currentLevel.nextXp }}</span>
              <span>{{ t("cabinet.referrals.general.level") }}: {{ currentLevel.name }}</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-stroke-ui-dark)]/60 relative">
              <div
                class="absolute inset-0 h-full transition-all"
                :style="{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--ui-primary-main), rgba(255,255,255,0.35))'
                }"
              />
            </div>
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.referrals.general.nextLevelHint", { level: currentLevel.nextName, xp: currentLevel.nextXp - currentLevel.xp }) }}
            </UiTextSmall>
          </div>
        </div>
      </div>

      <div class="network-plain h-full">
        <div class="network-grid">
          <div
            v-for="level in referralLevels"
            :key="level.id"
            class="network-card"
          >
            <div class="flex items-center justify-between gap-2 min-w-0">
              <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">{{ level.label }}</UiTextSmall>
              <UiBadge state="info" outline class="!px-2 !py-0.5 text-xs">{{ level.percent }}%</UiBadge>
            </div>
            <div class="flex flex-col items-center justify-center text-[32px] leading-9 font-semibold">
              {{ level.count }}
            </div>
            <UiTextSmall class="text-[var(--ui-text-secondary)] text-center">
              {{ t("cabinet.referrals.general.levelClients") }}
            </UiTextSmall>
          </div>
        </div>
      </div>
    </div>

    <!-- Link + QR -->
    <div class="panel link-qr-grid">
      <div class="flex min-w-0 flex-col gap-3 link-left">
        <div>
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.referrals.general.linkTitle") }}
          </UiTextH4>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.linkHint") }}
          </UiTextSmall>
        </div>

        <div class="mt-2 flex flex-col gap-2">
          <div
            class="relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[var(--ui-text-main)]"
            style="background: var(--referral-surface); border: 1px solid var(--color-stroke-ui-light);"
          >
            <input
              class="flex-1 bg-transparent text-sm outline-none text-[var(--ui-text-main)]"
              type="text"
              :value="referralLink"
              readonly
              @focus="$event.target.select()"
            />
            <UiIconCopy
              :text="referralLink"
              class="h-[18px] w-[18px] cursor-pointer text-[var(--ui-text-secondary)] transition hover:text-[var(--ui-text-main)]"
              :title="t('cabinet.referrals.general.copyButton')"
            />
          </div>
        </div>

        <div class="share-row flex flex-col gap-2 items-center">
          <UiTextSmall class="text-[var(--ui-text-secondary)] text-center">
            {{ t("cabinet.referrals.general.shareText") }}
          </UiTextSmall>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <UiButtonDefault
              v-for="btn in shareButtons"
              :key="btn.key"
              state="info--outline"
              class="share-btn share-btn-lg !p-0"
              :title="btn.title"
              @click="openShare(btn.link)"
            >
              <component :is="btn.icon" class="h-5 w-5" />
            </UiButtonDefault>
          </div>
        </div>
      </div>

      <div class="referral-card__qr">
        <div class="flex flex-col items-center gap-3">
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.qrHint") }}
          </UiTextSmall>
          <UiQRCode :link="referralLink" />
        </div>
      </div>
    </div>

    <!-- Earnings chart -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <UiTextH5>{{ t("cabinet.referrals.general.earningsChartTitle") }}</UiTextH5>
        <UiSelect
          class="min-w-[160px] w-[200px]"
          :data="chartRanges"
          :value="selectedRange"
          :withoutNoSelect="true"
          @change="selectedRange = $event as string"
        />
      </div>
      <SimpleChart :data="chartDataByRange" />
    </div>

    <!-- Referrals list -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <UiTextH5>{{ t("cabinet.referrals.general.listTitle") }}</UiTextH5>
        <div class="flex flex-wrap items-center gap-2">
          <UiInput
            v-model="search"
            :placeholder="t('cabinet.referrals.general.searchPlaceholder')"
              class="min-w-[200px] flex-1"
            >
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
            <UiButtonDefault state="info--small" class="!w-[44px]" @click="reloadReferrals">
              <UiIconUpdate />
            </UiButtonDefault>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--ui-text-secondary)] w-full lg:flex-nowrap">
            <div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                type="button"
                class="rounded-lg border px-3 py-1.5 transition truncate"
                :class="sortBy === opt.value ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white' : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'"
                @click="sortBy = opt.value"
              >
                {{ opt.text }}
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
              <button
                v-for="lvl in levelFilters"
                :key="lvl.value"
                type="button"
                class="rounded-lg border px-3 py-1.5 transition truncate"
                :class="activeLevel === lvl.value ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white' : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'"
                @click="activeLevel = lvl.value"
              >
                {{ lvl.text }}
              </button>
            </div>
          </div>
      </div>

      <div class="relative flex flex-col gap-2">
        <div
          v-if="isLoadingList"
          class="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] bg-black/20 rounded-2xl"
        >
          <UiIconSpinnerDefault />
        </div>
        <div
          v-for="item in paginatedReferrals"
          :key="item.id"
          class="referral-card-full"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-10 w-10 rounded-full bg-[var(--color-stroke-ui-dark)] grid place-items-center text-sm font-semibold">
                {{ item.initials }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold truncate">{{ item.name }}</div>
                <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">{{ item.email }}</UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.levelLabel", { level: item.level }) }}
                </UiTextSmall>
              </div>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <UiBadge :state="statusMap[item.status]" outline class="!px-2 !py-1">{{ statusLabel(item.status) }}</UiBadge>
              <div class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.earned") }}: ${{ item.earned.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="sortedReferrals.length === 0" class="referral-card-full text-center text-[var(--ui-text-secondary)]">
          {{ t("cabinet.referrals.general.empty") }}
        </div>

        <PaginationDefault
          :isLoading="isLoadingList"
          :perPage="perPage"
          :page="page"
          :totalRows="sortedReferrals.length"
          @pageChange="handlePageChange"
          @perPageChange="handlePerPageChange"
        />
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { computed, ref, h, watch } from "vue";
import { useI18n } from "vue-i18n";

import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

import SummaryCard from "./partials/SummaryCard.vue";
import SimpleChart from "./partials/SimpleChart.vue";
const { t } = useI18n();

const referralLink = "https://esterholdings.com/ref/X1Y2Z3";

const summary = {
  balance: 12450,
  totalEarned: 45210,
  monthEarned: 8200,
  prevMonth: 7150,
  active: 86,
  conversion: 64,
};

const referralLevels = [
  { id: 1, label: "Level 1", count: 25, percent: 30 },
  { id: 2, label: "Level 2", count: 40, percent: 10 },
  { id: 3, label: "Level 3", count: 90, percent: 5 },
];

const currentLevel = {
  name: "Advanced",
  nextName: "Expert",
  xp: 6200,
  nextXp: 20000,
};

const progressPercent = computed(() => Math.min(100, Math.round((currentLevel.xp / currentLevel.nextXp) * 100)));

const shareButtons = [
  {
    key: "tg",
    title: t("cabinet.referrals.general.shareTelegram"),
    link: "https://t.me/share/url",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", class: "h-5 w-5" }, [
          h("path", {
            fill: "currentColor",
            d: "M9.97 16.73 9.82 20c.36 0 .52-.15.71-.33l1.7-1.62 3.52 2.58c.65.36 1.11.17 1.28-.6l2.33-10.94c.21-.95-.34-1.33-.97-1.1L3.94 11.3c-.93.36-.92.88-.16 1.11l3.59 1.12 8.35-5.27c.39-.26.74-.12.45.13",
          }),
        ]);
      },
    },
  },
  {
    key: "wa",
    title: t("cabinet.referrals.general.shareWhatsApp"),
    link: "https://wa.me",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", class: "h-5 w-5", fill: "currentColor" }, [
          h("path", {
            d: "M12.04 2a10 10 0 0 0-8.66 14.94L2 22l5.17-1.35A10 10 0 1 0 12.04 2Zm5.87 14.27c-.24.67-1.4 1.3-1.95 1.38-.5.08-1.1.12-1.77-.11-.41-.13-.94-.3-1.63-.59-2.86-1.23-4.71-4.11-4.85-4.31-.14-.2-1.16-1.54-1.16-2.94 0-1.4.73-2.08 .99-2.36.27-.29.59-.36.79-.36h.57c.18 0 .43-.07.67.5.24.58.82 2 .89 2.14.07.14.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.52-.15.15-.3.32-.13.63.17.32.76 1.25 1.62 2.02 1.12.99 2.04 1.3 2.35 1.45.3.15.48.12.66-.07.18-.2.77-.9.98-1.2.22-.3.41-.25.69-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.34.07.12.07.69-.17 1.36Z",
          }),
        ]);
      },
    },
  },
  {
    key: "mail",
    title: t("cabinet.referrals.general.shareMail"),
    link: "mailto:?subject=Join&body=link",
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", class: "h-5 w-5", fill: "currentColor" }, [
          h("path", {
            d: "M20 4H4a2 2 0 0 0-2 2v.01l10 5.99 10-6V6a2 2 0 0 0-2-2Zm0 4.24-7.6 4.55a1 1 0 0 1-1.05 0L4 8.24V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z",
          }),
        ]);
      },
    },
  },
  {
    key: "other",
    title: t("cabinet.referrals.general.shareOther"),
    link: referralLink,
    icon: {
      render() {
        return h("svg", { viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("circle", { cx: "18", cy: "5", r: "3" }),
          h("circle", { cx: "6", cy: "12", r: "3" }),
          h("circle", { cx: "18", cy: "19", r: "3" }),
          h("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
          h("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" }),
        ]);
      },
    },
  },
];

const chartRanges = [
  { id: "week", value: "week", text: t("cabinet.referrals.general.chart.week") },
  { id: "month", value: "month", text: t("cabinet.referrals.general.chart.month") },
  { id: "quarter", value: "quarter", text: t("cabinet.referrals.general.chart.quarter") },
  { id: "year", value: "year", text: t("cabinet.referrals.general.chart.year") },
];
const selectedRange = ref("month");
const chartDataSets: Record<string, { label: string; value: number }[]> = {
  week: [
    { label: "Mon", value: 400 },
    { label: "Tue", value: 600 },
    { label: "Wed", value: 500 },
    { label: "Thu", value: 900 },
    { label: "Fri", value: 700 },
  ],
  month: [
    { label: "W1", value: 1800 },
    { label: "W2", value: 2200 },
    { label: "W3", value: 2600 },
    { label: "W4", value: 1600 },
  ],
  quarter: [
    { label: "Jan", value: 6200 },
    { label: "Feb", value: 7100 },
    { label: "Mar", value: 8400 },
  ],
  year: [
    { label: "Q1", value: 21000 },
    { label: "Q2", value: 24500 },
    { label: "Q3", value: 26800 },
    { label: "Q4", value: 28100 },
  ],
};

const chartDataByRange = computed(() => chartDataSets[selectedRange.value] || chartDataSets.month);

const openShare = (link: string) => {
  window.open(link, "_blank");
};

const format = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const referrals = ref(
  Array.from({ length: 40 }).map((_, idx) => {
    const names = [
      ["Anna", "Kovalenko", 1, "active"],
      ["John", "Doe", 2, "pending"],
      ["Mei", "Lin", 3, "inactive"],
      ["Carlos", "Ruiz", 1, "active"],
    ];
    const [first, last, level, status] = names[idx % names.length];
    const name = `${first} ${last}`;
    const initials = `${first[0]}${last[0]}`.toUpperCase();
    return {
      id: idx + 1,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${idx}@example.com`,
      level,
      status,
      earned: 50 + (idx % 10) * 120,
      initials,
    };
  }),
);

const statusMap: Record<string, string> = { active: "success", pending: "warning", inactive: "info" };
const statusLabel = (status: string) =>
  ({
    active: t("cabinet.referrals.general.status.active", "Active"),
    pending: t("cabinet.referrals.general.status.pending", "Pending"),
    inactive: t("cabinet.referrals.general.status.inactive", "Inactive"),
  }[status] || status);

const search = ref("");
const sortBy = ref("earned");
const activeLevel = ref("all");

const sortOptions = [
  { id: "earned", value: "earned", text: t("cabinet.referrals.general.sortEarned", "By earnings") },
  { id: "name", value: "name", text: t("cabinet.referrals.general.sortName", "By name") },
  { id: "active", value: "active", text: t("cabinet.referrals.general.sortActive", "Active") },
  { id: "pending", value: "pending", text: t("cabinet.referrals.general.sortPending", "Pending") },
  { id: "inactive", value: "inactive", text: t("cabinet.referrals.general.sortInactive", "Inactive") },
];

const levelFilters = [
  { id: "all", value: "all", text: t("cabinet.referrals.general.filterAll") },
  { id: "level1", value: "level1", text: t("cabinet.referrals.general.filterLevel1") },
  { id: "level2", value: "level2", text: t("cabinet.referrals.general.filterLevel2") },
  { id: "level3", value: "level3", text: t("cabinet.referrals.general.filterLevel3") },
];

const isLoadingList = ref(false);

const sortedReferrals = computed(() => {
  const term = search.value.toLowerCase();
  const filtered = referrals.value.filter((r) => {
    const levelMatch = activeLevel.value === "all" || `level${r.level}` === activeLevel.value;
    const searchMatch = !term || r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
    return levelMatch && searchMatch;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy.value === "name") return a.name.localeCompare(b.name);
    if (sortBy.value === "active" || sortBy.value === "pending" || sortBy.value === "inactive") {
      const order = (status: string) => (status === sortBy.value ? 0 : 1);
      return order(a.status) - order(b.status);
    }
    return b.earned - a.earned;
  });
  return sorted;
});

const page = ref(1);
const perPage = ref(5);
const totalPages = computed(() => Math.max(1, Math.ceil(sortedReferrals.value.length / perPage.value)));

const paginatedReferrals = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return sortedReferrals.value.slice(start, start + perPage.value);
});

watch(sortedReferrals, () => {
  if (page.value > totalPages.value) page.value = 1;
});

const reloadReferrals = () => {
  isLoadingList.value = true;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 1000);
};

watch([search, sortBy, activeLevel], () => {
  isLoadingList.value = true;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 500);
});

const handlePageChange = (next: number) => {
  if (next < 1 || next > totalPages.value) return;
  isLoadingList.value = true;
  page.value = next;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 500);
};

const handlePerPageChange = (next: number) => {
  if (!next || next <= 0) return;
  isLoadingList.value = true;
  perPage.value = next;
  page.value = 1;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 500);
};

</script>

<style scoped>
.referrals-general {
  --referral-surface: color-mix(in srgb, var(--ui-background) 98%, transparent);
  --referral-panel: color-mix(in srgb, var(--ui-background-panel) 97%, transparent);
}

.panel {
  border-radius: 18px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--referral-panel);
  padding: 18px 16px;
  box-shadow: 0 10px 30px color-mix(in srgb, var(--ui-background) 70%, transparent);
}

.network-card {
  border-radius: 12px;
  padding: 14px;
  background: var(--referral-panel);
  border: 1px solid var(--color-stroke-ui-light);
  color: var(--ui-text-main);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.network-plain {
  border-radius: 18px;
  padding: 0;
  background: transparent;
  border: none;
  display: flex;
  height: 100%;
}

.network-grid {
  display: grid;
  width: 100%;
  align-content: stretch;
  align-items: stretch;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.account-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.link-qr-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .link-qr-grid {
    grid-template-columns: 1.4fr 1fr;
    align-items: start;
  }
}

.referral-card__qr {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}

.share-btn {
  height: 40px;
  width: 40px;
  border-radius: 12px;
}

.link-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.link-left {
  gap: 10px;
}
@media (min-width: 1024px) {
  .link-left {
    gap: 40px;
  }
}
.share-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@media (max-width: 1023px) {
  .referral-card__qr {
    order: 2;
  }
}

.referral-card-full {
  width: 100%;
  border-radius: 12px;
  background: var(--referral-panel);
  border: 1px solid var(--color-stroke-ui-light);
  padding: 12px 14px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.referral-card-full:hover {
  background: var(--color-stroke-ui-dark);
}
</style>
