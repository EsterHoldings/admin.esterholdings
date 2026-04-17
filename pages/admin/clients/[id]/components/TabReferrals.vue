<template>
  <div class="client-tab-space admin-referrals-tab">
    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">{{ t("cabinet.referrals.general.listTitle") }}</h3>
              <p class="client-card-subtitle">{{ t("admin.clients.tabsDescription.referrals") }}</p>
            </div>
            <PrimeButton
              icon="pi pi-refresh"
              rounded
              text
              :loading="isLoadingList"
              @click="reloadReferrals" />
          </div>

          <div class="admin-referrals-tab__toolbar">
            <span class="admin-referrals-tab__search">
              <i class="pi pi-search" aria-hidden="true" />
              <PrimeInputText
                v-model="search"
                :placeholder="t('cabinet.referrals.general.searchPlaceholder')"
                fluid />
            </span>

            <PrimeSelect
              v-model="sortBy"
              :options="sortOptions"
              option-label="text"
              option-value="value" />

            <PrimeSelect
              v-model="activeLevel"
              :options="levelFilters"
              option-label="text"
              option-value="value" />
          </div>
        </div>
      </template>
    </PrimeCard>

    <PrimeCard class="client-tab-card">
      <template #content>
        <div class="client-card-body">
          <div
            v-if="isLoadingList"
            class="admin-referrals-tab__skeletons">
            <PrimeSkeleton
              v-for="row in 5"
              :key="`referral-skeleton-${row}`"
              height="62px"
              border-radius="16px" />
          </div>

          <div
            v-else-if="sortedReferrals.length === 0"
            class="admin-referrals-tab__empty">
            {{ t("cabinet.referrals.general.empty") }}
          </div>

          <div
            v-else
            class="admin-referrals-tab__list">
            <article
              v-for="item in paginatedReferrals"
              :key="item.id"
              class="admin-referrals-tab__row">
              <div class="admin-referrals-tab__avatar">
                {{ item.initials }}
              </div>
              <div class="admin-referrals-tab__identity">
                <strong>{{ item.name }}</strong>
                <span>{{ item.email }}</span>
                <span>{{ t("cabinet.referrals.general.levelLabel", { level: item.level }) }}</span>
              </div>
              <div class="admin-referrals-tab__side">
                <span
                  class="client-inline-status"
                  :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
                <strong>${{ item.earned.toLocaleString() }}</strong>
              </div>
            </article>
          </div>

          <PrimePaginator
            v-if="sortedReferrals.length > 0"
            :first="(page - 1) * perPage"
            :rows="perPage"
            :total-records="sortedReferrals.length"
            :rows-per-page-options="[5, 10, 20]"
            @page="handlePaginatorPage" />
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n({ useScope: "global" });

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

const statusLabel = (status: string) =>
  ({
    active: t("cabinet.referrals.general.status.active", "Active"),
    pending: t("cabinet.referrals.general.status.pending", "Pending"),
    inactive: t("cabinet.referrals.general.status.inactive", "Inactive"),
  }[status] || status);

const statusClass = (status: string) => {
  if (status === "active") return "client-inline-status--success";
  if (status === "pending") return "client-inline-status--warning";
  return "";
};

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

const paginatedReferrals = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return sortedReferrals.value.slice(start, start + perPage.value);
});

watch(sortedReferrals, () => {
  if (page.value > Math.ceil(sortedReferrals.value.length / perPage.value)) page.value = 1;
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
  if (next < 1) return;
  page.value = next;
};

const handlePerPageChange = (next: number) => {
  if (!next || next <= 0) return;
  perPage.value = next;
  page.value = 1;
};

const handlePaginatorPage = (event: any) => {
  page.value = Number(event.page ?? 0) + 1;
  perPage.value = Number(event.rows ?? perPage.value);
};
</script>

<style lang="scss" scoped>
.admin-referrals-tab {
  min-width: 0;

  &__toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(170px, 220px) minmax(170px, 220px);
    gap: 10px;
  }

  &__search {
    position: relative;
    display: block;
  }

  &__search i {
    position: absolute;
    left: 12px;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    color: var(--ui-text-secondary);
  }

  &__search :deep(.p-inputtext) {
    padding-left: 38px;
  }

  &__list,
  &__skeletons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__row {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    border-radius: 16px;
    padding: 11px;
    background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
    transition:
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  &__row:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--ui-primary-main) 7%, var(--ui-background-card));
  }

  &__avatar {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    background: color-mix(in srgb, var(--ui-primary-main) 13%, transparent);
    color: var(--ui-primary-main);
    font-size: 13px;
    font-weight: 840;
  }

  &__identity,
  &__side {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__identity strong {
    color: var(--ui-text-main);
    font-size: 14px;
  }

  &__identity span {
    overflow: hidden;
    color: var(--ui-text-secondary);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__side {
    align-items: flex-end;
  }

  &__side strong {
    color: var(--ui-text-main);
    font-size: 14px;
  }

  &__empty {
    min-height: 180px;
    display: grid;
    place-items: center;
    color: var(--ui-text-secondary);
    text-align: center;
  }
}

@media (max-width: 860px) {
  .admin-referrals-tab {
    &__toolbar {
      grid-template-columns: 1fr;
    }

    &__row {
      grid-template-columns: 44px minmax(0, 1fr);
    }

    &__side {
      grid-column: 2;
      align-items: flex-start;
    }
  }
}
</style>
