<template>
  <div class="access-entity-panel">
    <div class="access-entity-panel__toolbar">
      <div class="access-entity-panel__toolbar-left">
        <UiInput
          class="w-full"
          :placeholder="t('admin.access.components.admins-panel-search.placeholder')"
          clearable
          :value="searchDraft"
          @input="handleInputSearch">
          <template #icon-left>
            <UiIconSearch />
          </template>
        </UiInput>
      </div>

      <div class="access-entity-panel__toolbar-right">
        <UiButtonDefault
          state="info--small"
          class="!w-[44px]"
          @click="handleClickRefresh">
          <UiIconUpdate :spinning="isLoading" />
        </UiButtonDefault>

        <UiButtonDefault
          v-if="canCreateAdmins"
          state="secondary"
          class="shrink-0 whitespace-nowrap"
          @click="handleClickAddRole">
          {{ resolveText("admin.access.components.admins-panel.actions.create", "New admin") }}
        </UiButtonDefault>
      </div>
    </div>

    <div
      v-if="isLoading && adminsData.length === 0"
      class="access-entity-panel__loading">
      <UiIconSpinnerDefault />
    </div>

    <div
      v-else-if="adminsData.length === 0"
      class="access-entity-panel__empty">
      {{ resolveText("admin.access.components.admins-panel.empty", "No admins found.") }}
    </div>

    <div
      v-else
      class="access-entity-list">
      <article
        v-for="admin in adminsData"
        :key="admin.id"
        class="access-entity-card access-admin-card">
        <div class="access-admin-row">
          <div class="access-entity-card__identity">
            <button
              type="button"
              class="access-entity-card__avatar-link"
              @click="openAdminProfile(admin.id)">
              <UiImage
                v-if="admin.photo_url"
                class="access-entity-card__avatar-image"
                :src="admin.photo_url" />
              <span
                v-else
                class="access-entity-card__avatar-placeholder">
                {{ admin.initials || "AD" }}
              </span>
            </button>

            <div class="access-entity-card__identity-copy">
              <div class="access-entity-card__status-line">
                <button
                  type="button"
                  class="access-entity-card__title-link"
                  @click="openAdminProfile(admin.id)">
                  {{ admin.name || admin.nickname || "-" }}
                </button>
              </div>

              <button
                type="button"
                class="access-entity-card__subtitle-link"
                @click="openAdminProfile(admin.id)">
                {{ admin.email || "-" }}
              </button>
            </div>
          </div>

          <div class="access-admin-columns">
            <div class="access-admin-column">
              <div class="access-entity-card__label">
                {{ resolveText("admin.access.components.admins-panel.columns.status", "Status") }}
              </div>
              <div
                class="access-admin-status"
                :class="admin.is_online ? 'is-online' : 'is-offline'">
                <span class="access-admin-status__dot" />
                <span>
                  {{
                    admin.is_online
                      ? resolveText("admin.profile.status.online", "Online")
                      : resolveText("admin.profile.status.offline", "Offline")
                  }}
                </span>
              </div>
            </div>

            <div class="access-admin-column access-admin-column--roles">
              <div class="access-entity-card__label">{{ t("admin.access.components.admins-panel.columns.roles") }}</div>
              <div
                v-if="admin.roles.length"
                class="access-entity-card__chips access-entity-card__chips--compact"
                :title="admin.roles.join(', ')">
                <span
                  v-for="roleName in visibleRoles(admin.roles)"
                  :key="roleName"
                  class="access-entity-chip">
                  {{ roleName }}
                </span>
                <span
                  v-if="hiddenRolesCount(admin.roles) > 0"
                  class="access-entity-chip access-entity-chip--muted">
                  +{{ hiddenRolesCount(admin.roles) }}
                </span>
              </div>
              <div
                v-else
                class="access-entity-card__value">
                {{ emptyValueText }}
              </div>
            </div>

            <div class="access-admin-column">
              <div class="access-entity-card__label">
                {{ resolveText("admin.access.components.admins-panel.columns.wasOnline", "Last online") }}
              </div>
              <div
                class="access-entity-card__value"
                :title="formatLastSeenTitle(admin)">
                {{ formatLastSeen(admin) }}
              </div>
            </div>

            <div class="access-admin-column access-admin-column--created">
              <div class="access-entity-card__label">
                {{ t("admin.access.components.admins-panel.columns.createdAt") }}
              </div>
              <div class="access-entity-card__value">{{ admin.created_at || emptyValueText }}</div>
            </div>
          </div>

          <div class="access-entity-card__actions">
            <button
              v-if="canManageAdminRoles"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.admins-panel.actions.addNewAdmin', 'Edit admin')"
              @click="handleOpenClientPage(admin.id)">
              <UiIconEdit />
            </button>

            <button
              v-if="canDeleteAdmins"
              type="button"
              class="access-entity-action"
              :title="resolveText('admin.access.components.admins-panel.actions.delete', 'Delete admin')"
              @click="handleDeleteAdmin(admin.id)">
              <UiIconDelete />
            </button>
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
      @pageChange="handleChangePage" />
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

  const { t, locale } = useI18n({ useScope: "global" });
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
  const searchDraft = ref("");
  const adminsData = ref<AdminItem[]>([]);
  const MAX_VISIBLE_ROLES = 3;

  const { openModal } = inject("modalControl") as {
    openModal: (component: unknown, props?: Record<string, unknown>) => void;
  };
  const canCreateAdmins = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-admins")
  );
  const canManageAdminRoles = computed(
    () =>
      adminAuthStore.hasRole("super-admin") ||
      adminAuthStore.hasPermission("update-admins") ||
      adminAuthStore.hasPermission("assign-admin-roles")
  );
  const canDeleteAdmins = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("delete-admins")
  );

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
            roles: Array.isArray(admin?.roles)
              ? admin.roles.map((role: any) => String(role?.name ?? "")).filter(Boolean)
              : [],
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

  const applySearch = debounce(async (value: string) => {
    try {
      isLoadingSearch.value = true;
      searchFilter.value = value.trim();
      await loadData(true);
    } finally {
      isLoadingSearch.value = false;
    }
  }, 300);

  const handleInputSearch = (value: unknown) => {
    searchDraft.value = String(value ?? "");
    applySearch(searchDraft.value);
  };

  onMounted(async () => {
    isLoading.value = true;
    await loadData();
    useEventBus.on("loadDataForAdmins", loadData);
  });

  const visibleRoles = (roles: string[]) => roles.slice(0, MAX_VISIBLE_ROLES);

  const hiddenRolesCount = (roles: string[]) => Math.max(0, roles.length - MAX_VISIBLE_ROLES);

  const parseDateValue = (value?: string | null) => {
    if (!value) return null;

    const normalized = String(value).includes("T") ? String(value) : String(value).replace(" ", "T");
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDateTime = (value?: string | null) => {
    const date = parseDateValue(value);
    if (!date) return value ? String(value) : emptyValueText;

    return date.toLocaleString(locale.value || undefined);
  };

  const formatRelativeDateTime = (value?: string | null) => {
    const date = parseDateValue(value);
    if (!date) return value ? String(value) : emptyValueText;

    const diffMs = date.getTime() - Date.now();
    const absDiffMs = Math.abs(diffMs);
    const formatter = new Intl.RelativeTimeFormat(locale.value || undefined, { numeric: "auto" });
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    if (absDiffMs < minute) {
      return resolveText("admin.access.components.admins-panel.lastSeen.justNow", "just now");
    }

    if (absDiffMs < hour) {
      return formatter.format(Math.round(diffMs / minute), "minute");
    }

    if (absDiffMs < day) {
      return formatter.format(Math.round(diffMs / hour), "hour");
    }

    if (absDiffMs < week) {
      return formatter.format(Math.round(diffMs / day), "day");
    }

    if (absDiffMs < month) {
      return formatter.format(Math.round(diffMs / week), "week");
    }

    if (absDiffMs < year) {
      return formatter.format(Math.round(diffMs / month), "month");
    }

    return formatter.format(Math.round(diffMs / year), "year");
  };

  const formatLastSeen = (admin: AdminItem) => {
    if (admin.is_online) {
      return resolveText("admin.profile.status.online", "Online");
    }

    return formatRelativeDateTime(admin.last_seen_at);
  };

  const formatLastSeenTitle = (admin: AdminItem) => {
    if (!admin.last_seen_at) return emptyValueText;

    return formatDateTime(admin.last_seen_at);
  };
</script>

<style scoped lang="scss">
  .access-admin-row {
    display: grid;
    grid-template-columns: minmax(220px, 1.15fr) minmax(430px, 2fr) auto;
    align-items: center;
    gap: 14px;
  }

  .access-admin-columns {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(82px, 0.55fr) minmax(150px, 1.1fr) minmax(122px, 0.85fr) minmax(118px, 0.8fr);
    align-items: center;
    gap: 10px;
  }

  .access-admin-column {
    min-width: 0;
  }

  .access-admin-column--roles {
    min-width: 130px;
  }

  .access-entity-card__identity {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .access-entity-card__avatar-link {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
    transition:
      border-color 0.2s ease,
      transform 0.2s ease;
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
    font-size: 0.8125rem;
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
    align-items: center;
    gap: 8px;
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
    overflow: hidden;
    max-width: 100%;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--ui-text-main);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .access-entity-card__subtitle-link {
    overflow: hidden;
    max-width: 100%;
    font-size: 0.8125rem;
    color: var(--ui-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .access-admin-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
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

  .access-entity-card__chips--compact {
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .access-admin-column .access-entity-card__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1180px) {
    .access-admin-row {
      grid-template-columns: minmax(220px, 1fr) auto;
    }

    .access-admin-columns {
      grid-column: 1 / -1;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .access-admin-row {
      grid-template-columns: 1fr;
    }

    .access-admin-columns {
      grid-template-columns: 1fr 1fr;
    }

    .access-entity-card__actions {
      justify-content: flex-start;
    }
  }
</style>
