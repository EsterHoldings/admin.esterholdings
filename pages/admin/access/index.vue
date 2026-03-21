<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.access.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.access.index.subtitle") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <div class="access-page">
        <div
          v-if="tabsList.length > 0"
          class="access-page__tabs-grid"
        >
          <button
            v-for="(tab, index) in tabsList"
            :key="tab.label"
            type="button"
            class="access-page__tab-card"
            :class="{ 'is-active': activeTabIndex === index }"
            @click="handleActiveTab(index)"
          >
            <div class="access-page__tab-label">{{ tab.label }}</div>
            <div class="access-page__tab-description">{{ tab.description }}</div>
          </button>
        </div>

        <transition name="slide-short" mode="out-in">
          <component
            v-if="activeTabComponent"
            :is="activeTabComponent"
            :key="tabsList[activeTabIndex]?.label || activeTabIndex"
          />
        </transition>

        <div
          v-if="tabsList.length === 0"
          class="access-page__empty-state"
        >
          {{ t("admin.access.index.empty", "No access to any section of this page.") }}
        </div>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import {computed, ref, watch} from "vue";
import TabAdmins from "~/pages/admin/access/components/TabAdmins.vue";
import TabRoles from "~/pages/admin/access/components/TabRoles.vue";
import TabPermissions from "~/pages/admin/access/components/TabPermissions.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});
const adminAuthStore = useAdminAuthStore();
const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};
const normalizeTabLabel = (label: string) => label.replace(/^#\s*/, "").trim();

const activeTabIndex = ref(0);
const canViewAdmins = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-admins"));
const canViewRoles = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-roles"));
const canViewPermissions = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("view-permissions"));

const tabsList = computed(() => {
  return [
    canViewAdmins.value
      ? {
          label: normalizeTabLabel(resolveText("admin.access.components.admins-panel.title", "Admins")),
          description: resolveText(
            "admin.access.index.tabs.adminsDescription",
            "Manage admin accounts, assigned roles and internal access."
          ),
          component: TabAdmins,
        }
      : null,
    canViewRoles.value
      ? {
          label: normalizeTabLabel(resolveText("admin.access.components.roles-panel.title", "Roles")),
          description: resolveText(
            "admin.access.index.tabs.rolesDescription",
            "Configure reusable permission sets for the admin team."
          ),
          component: TabRoles,
        }
      : null,
    canViewPermissions.value
      ? {
          label: normalizeTabLabel(resolveText("admin.access.components.permissions-panel.title", "Permissions")),
          description: resolveText(
            "admin.access.index.tabs.permissionsDescription",
            "Enable or disable granular abilities used across admin pages."
          ),
          component: TabPermissions,
        }
      : null,
  ].filter(Boolean);
});

const activeTabComponent = computed(() => tabsList.value[activeTabIndex.value]?.component ?? null);

watch(
  tabsList,
  (tabs) => {
    if (tabs.length === 0) {
      activeTabIndex.value = 0;
      return;
    }

    if (activeTabIndex.value > tabs.length - 1) {
      activeTabIndex.value = 0;
    }
  },
  { immediate: true }
);

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};
</script>

<style lang="scss" scoped>
.access-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__tabs-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  &__tab-card {
    text-align: left;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    color: var(--ui-text-main);
    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: var(--ui-primary-main);
      transform: translateY(-1px);
    }

    &.is-active {
      border-color: var(--ui-primary-main);
      background: color-mix(in srgb, var(--ui-primary-main) 10%, var(--ui-background-panel));
    }
  }

  &__tab-label {
    font-size: 1rem;
    font-weight: 700;
  }

  &__tab-description {
    margin-top: 6px;
    font-size: 0.875rem;
    line-height: 1.45;
    color: var(--ui-text-secondary);
  }

  &__empty-state {
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed var(--color-stroke-ui-light);
    color: var(--ui-text-secondary);
    background: var(--ui-background-panel);
  }
}

:deep(.access-entity-panel) {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

:deep(.access-entity-panel__toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.access-entity-panel__toolbar-left) {
  flex: 1;
  min-width: 240px;
}

:deep(.access-entity-panel__toolbar-right) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.access-entity-panel__loading),
:deep(.access-entity-panel__empty) {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px dashed var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  color: var(--ui-text-secondary);
}

:deep(.access-entity-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.access-entity-card) {
  border-radius: 18px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.access-entity-card__top) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

:deep(.access-entity-card__title) {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

:deep(.access-entity-card__subtitle) {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--ui-text-secondary);
  word-break: break-word;
}

:deep(.access-entity-card__actions) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.access-entity-action) {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background: transparent;
  color: var(--ui-text-main);
  transition: border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
}

:deep(.access-entity-action:hover:not(:disabled)) {
  border-color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
}

:deep(.access-entity-action:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.access-entity-card__grid) {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

:deep(.access-entity-card__label) {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ui-text-secondary);
}

:deep(.access-entity-card__value) {
  margin-top: 6px;
  color: var(--ui-text-main);
  word-break: break-word;
}

:deep(.access-entity-card__chips) {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.access-entity-chip) {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.8125rem;
  color: var(--ui-text-main);
  background: color-mix(in srgb, var(--color-stroke-ui-light) 75%, transparent);
}

:deep(.access-entity-chip--muted) {
  color: var(--ui-text-secondary);
}

:deep(.access-permission-state) {
  font-size: 0.875rem;
  font-weight: 600;
}

:deep(.access-permission-state.is-active) {
  color: var(--ui-sticker-success);
}

:deep(.access-permission-state.is-disabled) {
  color: var(--ui-text-secondary);
}

@media (max-width: 900px) {
  .access-page__tabs-grid {
    grid-template-columns: 1fr;
  }

  :deep(.access-entity-panel__toolbar) {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.access-entity-panel__toolbar-left) {
    min-width: 0;
  }

  :deep(.access-entity-panel__toolbar-right) {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
