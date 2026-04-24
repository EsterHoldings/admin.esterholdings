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
          <div class="access-entity-card__identity">
            <button
              type="button"
              class="access-entity-card__avatar-link"
              @click="openAdminProfile(admin.id)"
            >
              <UiImage
                v-if="admin.photo_url"
                class="access-entity-card__avatar-image"
                :src="admin.photo_url"
              />
              <span
                v-else
                class="access-entity-card__avatar-placeholder"
              >
                {{ admin.initials || "AD" }}
              </span>
            </button>

            <div class="access-entity-card__identity-copy">
              <div class="access-entity-card__status-line">
                <button
                  type="button"
                  class="access-entity-card__title-link"
                  @click="openAdminProfile(admin.id)"
                >
                  {{ admin.name || admin.nickname || "-" }}
                </button>

                <span
                  class="access-admin-status"
                  :class="admin.is_online ? 'is-online' : 'is-offline'"
                >
                  <span class="access-admin-status__dot" />
                  <span>
                    {{
                      admin.is_online
                        ? resolveText("admin.profile.status.online", "Online")
                        : resolveText("admin.profile.status.offline", "Offline")
                    }}
                  </span>
                </span>
              </div>

              <button
                type="button"
                class="access-entity-card__subtitle-link"
                @click="openAdminProfile(admin.id)"
              >
                {{ admin.email || "-" }}
              </button>
            </div>
          </div>

          <div class="access-entity-card__actions">
            <button
              v-if="canManageAdminRoles"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.admins-panel.actions.addNewAdmin', 'Edit admin')"
              @click="handleOpenClientPage(admin.id)"
            >
              <UiIconEdit />
            </button>

            <button
              v-if="canDeleteAdmins"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.admins-panel.actions.delete', 'Delete admin')"
              @click="handleDeleteAdmin(admin.id)"
            >
              <UiIconDelete />
            </button>
          </div>
        </div>

        <div class="access-entity-card__grid">
          <div>
            <div class="access-entity-card__label">{{ t("admin.access.components.admins-panel.columns.id") }}</div>
            <div class="access-entity-card__value">{{ admin.id }}</div>
          </div>

          <div>
            <div class="access-entity-card__label">
              {{ resolveText("admin.access.components.admins-panel.columns.lastSeen", "Last seen") }}
            </div>
            <div class="access-entity-card__value">
              {{ admin.is_online ? resolveText("admin.profile.status.online", "Online") : formatDateTime(admin.last_seen_at) }}
            </div>
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
import { navigateTo, useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { debounce } from "~/utils/helper/debounce";

import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconDelete from "~/components/ui/UiIconDelete.vue";
import UiIconEdit from "~/components/ui/UiIconEdit.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";
import AdminsPanelEdit from "~/pages/admin/access/components/AdminsPanelEdit.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

type AdminItem = {
  id: string;
  name: string;
  initials: string;
  nickname: string;
  email: string;
  photo_url: string | null;
  is_online: boolean;
  last_seen_at: string | null;
  roles: string[];
  created_at: string;
};

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();
const localePath = useLocalePath();

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
const canManageAdminRoles = computed(
  () =>
    adminAuthStore.hasRole("super-admin") ||
    adminAuthStore.hasPermission("update-admins") ||
    adminAuthStore.hasPermission("assign-admin-roles")
);
const canDeleteAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-admins"));

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
          name: String(admin?.name ?? ""),
          initials: String(admin?.initials ?? ""),
          nickname: String(admin?.nickname ?? ""),
          email: String(admin?.email ?? ""),
          photo_url: typeof admin?.photo_url === "string" && admin.photo_url ? admin.photo_url : null,
          is_online: Boolean(admin?.is_online),
          last_seen_at: admin?.last_seen_at ? String(admin.last_seen_at) : null,
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
  if (!canManageAdminRoles.value) return;

  openModal(AdminsPanelEdit, {
    title: resolveText("admin.access.components.admins-panel-edit.title", "Edit Admin Roles"),
    id,
  });
};

const handleDeleteAdmin = async (id: string) => {
  if (!canDeleteAdmins.value) return;

  const isConfirmed = window.confirm(
    resolveText("admin.access.components.admins-panel.actions.deleteConfirm", "Delete this admin?")
  );
  if (!isConfirmed) return;

  await appCore.admins.delete(id);
  await loadData();
};

const handleClickRefresh = async () => {
  await loadData();
};

const openAdminProfile = async (id: string) => {
  await navigateTo(
    localePath({
      path: "/profile",
      query: { adminId: id },
    })
  );
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

const formatDateTime = (value?: string | null) => {
  if (!value) return emptyValueText;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
};
</script>

<style scoped lang="scss">
.access-entity-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.access-entity-card__avatar-link {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-stroke-ui-light);
  background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.access-entity-card__avatar-link:hover {
  border-color: var(--ui-primary-main);
  transform: translateY(-1px);
}

.access-entity-card__avatar-image,
.access-entity-card__avatar-placeholder {
  width: 100%;
  height: 100%;
}

.access-entity-card__avatar-image {
  object-fit: cover;
}

.access-entity-card__avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-text-main);
  font-size: 0.95rem;
  font-weight: 700;
}

.access-entity-card__identity-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.access-entity-card__status-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.access-entity-card__title-link,
.access-entity-card__subtitle-link {
  text-align: left;
  transition: color 0.2s ease;
}

.access-entity-card__title-link:hover,
.access-entity-card__subtitle-link:hover {
  color: var(--ui-primary-main);
}

.access-entity-card__title-link {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.access-entity-card__subtitle-link {
  font-size: 0.875rem;
  color: var(--ui-text-secondary);
  word-break: break-word;
}

.access-admin-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.access-admin-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.access-admin-status.is-online {
  color: var(--ui-sticker-success);
}

.access-admin-status.is-offline {
  color: var(--ui-text-secondary);
}
</style>
