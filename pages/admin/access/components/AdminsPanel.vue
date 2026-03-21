<template>
  <div class="access-entity-panel">
    <div class="access-entity-panel__toolbar">
      <div class="access-entity-panel__toolbar-left">
        <UiInput
          class="w-full"
          :placeholder="t('admin.access.components.admins-panel-search.placeholder')"
          :isLoading="isLoadingSearch"
          :value="searchFilter"
          @input="handleInputSearch"
        >
          <template #icon-left>
            <UiIconSearch />
          </template>
        </UiInput>
      </div>

      <div class="access-entity-panel__toolbar-right">
        <UiButtonDefault state="info--small" class="!w-[44px]" @click="handleClickRefresh">
          <UiIconUpdate :spinning="isLoading || isLoadingSearch" />
        </UiButtonDefault>

        <UiButtonDefault
          v-if="canCreateAdmins"
          state="secondary"
          class="shrink-0 whitespace-nowrap"
          @click="handleClickAddRole"
        >
          {{ resolveText("admin.access.components.admins-panel.actions.create", "New admin") }}
        </UiButtonDefault>
      </div>
    </div>

    <div v-if="isLoading && adminsData.length === 0" class="access-entity-panel__loading">
      <UiIconSpinnerDefault />
    </div>

    <div v-else-if="adminsData.length === 0" class="access-entity-panel__empty">
      {{ resolveText("admin.access.components.admins-panel.empty", "No admins found.") }}
    </div>

    <div v-else class="access-entity-list">
      <article
        v-for="admin in adminsData"
        :key="admin.id"
        class="access-entity-card"
      >
        <div class="access-entity-card__top">
          <div>
            <div class="access-entity-card__title">{{ admin.nickname || "-" }}</div>
            <div class="access-entity-card__subtitle">{{ admin.email || "-" }}</div>
          </div>

          <div class="access-entity-card__actions">
            <button
              v-if="canUpdateAdmins"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.admins-panel.actions.addNewAdmin', 'Edit admin')"
              @click="handleOpenClientPage(admin.id)"
            >
              <UiIconEdit />
            </button>
          </div>
        </div>

        <div class="access-entity-card__grid">
          <div>
            <div class="access-entity-card__label">{{ t("admin.access.components.admins-panel.columns.id") }}</div>
            <div class="access-entity-card__value">{{ admin.id }}</div>
          </div>

          <div>
            <div class="access-entity-card__label">{{ t("admin.access.components.admins-panel.columns.roles") }}</div>
            <div v-if="admin.roles.length" class="access-entity-card__chips">
              <span
                v-for="roleName in admin.roles"
                :key="roleName"
                class="access-entity-chip"
              >
                {{ roleName }}
              </span>
            </div>
            <div v-else class="access-entity-card__value">
              {{ emptyValueText }}
            </div>
          </div>

          <div>
            <div class="access-entity-card__label">{{ t("admin.access.components.admins-panel.columns.createdAt") }}</div>
            <div class="access-entity-card__value">{{ admin.created_at || emptyValueText }}</div>
          </div>
        </div>
      </article>
    </div>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { debounce } from "~/utils/helper/debounce";

import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";
import AdminsPanelEdit from "~/pages/admin/access/components/AdminsPanelEdit.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

type AdminItem = {
  id: string;
  nickname: string;
  email: string;
  roles: string[];
  created_at: string;
};

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const emptyValueText = "—";
const isLoading = ref(false);
const isLoadingSearch = ref(false);
const perPage = ref(6);
const page = ref(1);
const totalRows = ref(0);
const searchFields = ref(["id", "nickname", "email"]);
const searchFilter = ref("");
const adminsData = ref<AdminItem[]>([]);

const { openModal } = inject("modalControl") as { openModal: (component: unknown, props?: Record<string, unknown>) => void };
const canCreateAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-admins"));
const canUpdateAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-admins"));

const handleClickAddRole = () => {
  if (!canCreateAdmins.value) return;

  openModal(AdminsPanelAddNew, {
    title: resolveText("admin.access.components.admins-panel-add-new.title", "Create new Admin"),
  });
};

const loadData = async (isFilterQuery = false) => {
  const params = {
    page: isFilterQuery ? 1 : page.value,
    perPage: perPage.value,
    searchFilter: searchFilter.value,
    searchFields: searchFields.value,
  };

  if (!isFilterQuery) {
    isLoading.value = true;
  }

  try {
    const response = await appCore.admins.get(params);
    const payload = response?.data?.data ?? {};

    totalRows.value = Number(payload?.total ?? 0);
    adminsData.value = Array.isArray(payload?.data)
      ? payload.data.map((admin: any) => ({
          id: String(admin?.id ?? ""),
          nickname: String(admin?.nickname ?? ""),
          email: String(admin?.email ?? ""),
          roles: Array.isArray(admin?.roles) ? admin.roles.map((role: any) => String(role?.name ?? "")).filter(Boolean) : [],
          created_at: String(admin?.created_at ?? admin?.created_at_human ?? ""),
        }))
      : [];

    if (isFilterQuery) {
      page.value = 1;
    }
  } catch {
    totalRows.value = 0;
    adminsData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleOpenClientPage = (id: string) => {
  if (!canUpdateAdmins.value) return;

  openModal(AdminsPanelEdit, {
    title: resolveText("admin.access.components.admins-panel-edit.title", "Edit Admin Roles"),
    id,
  });
};

const handleClickRefresh = async () => {
  await loadData();
};

const handleChangePerPage = async (value: number) => {
  page.value = 1;
  perPage.value = value;
  await loadData();
};

const handleChangePage = async (value: number) => {
  page.value = value;
  await loadData();
};

const handleInputSearch = debounce(async (value: unknown) => {
  try {
    isLoadingSearch.value = true;
    searchFilter.value = String(value ?? "");
    await loadData(true);
  } finally {
    isLoadingSearch.value = false;
  }
}, 300);

onMounted(async () => {
  isLoading.value = true;
  await loadData();
  useEventBus.on("loadDataForAdmins", loadData);
});
</script>
