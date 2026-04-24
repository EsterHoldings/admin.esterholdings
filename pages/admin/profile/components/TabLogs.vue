<template>
  <div class="admin-profile-tab-space admin-profile-logs">
    <div class="admin-profile-logs__summary-grid">
      <section class="admin-profile-logs__summary-card">
        <UiTextSmall class="admin-profile-logs__summary-label">
          {{ resolveText("admin.profile.logs.summary.actions", "Admin actions") }}
        </UiTextSmall>
        <UiTextH5 class="admin-profile-logs__summary-value">{{ actionRows.length }}</UiTextH5>
        <UiTextSmall class="admin-profile-logs__summary-hint">
          {{
            resolveText(
              "admin.profile.logs.summary.actionsHint",
              "Changes to profile, security settings and other admin actions."
            )
          }}
        </UiTextSmall>
      </section>

      <section class="admin-profile-logs__summary-card">
        <UiTextSmall class="admin-profile-logs__summary-label">
          {{ resolveText("admin.profile.logs.summary.chatConnections", "Chat connections") }}
        </UiTextSmall>
        <UiTextH5 class="admin-profile-logs__summary-value">{{ chatRows.length }}</UiTextH5>
        <UiTextSmall class="admin-profile-logs__summary-hint">
          {{
            resolveText(
              "admin.profile.logs.summary.chatConnectionsHint",
              "Support chat connect and disconnect events."
            )
          }}
        </UiTextSmall>
      </section>
    </div>

    <div class="admin-profile-logs__panels">
      <section class="admin-profile-logs__panel">
        <div class="admin-profile-logs__panel-header">
          <div>
            <UiTextH5 class="admin-profile-logs__panel-title">
              {{ resolveText("admin.profile.activity.sections.actions", "Admin actions") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-logs__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.actions",
                  "Profile updates, security changes and write actions from the admin panel."
                )
              }}
            </UiTextSmall>
          </div>

          <UiButtonDefault
            state="info--outline--small"
            :isLoading="isLoading"
            @click="loadActivity"
          >
            {{ resolveText("admin.profile.actions.refresh", "Refresh") }}
          </UiButtonDefault>
        </div>

        <div
          v-if="actionRows.length === 0"
          class="admin-profile-logs__empty-state"
        >
          {{ resolveText("admin.profile.activity.empty.actions", "No actions recorded yet.") }}
        </div>

        <div
          v-else
          class="admin-profile-logs__list"
        >
          <div
            v-for="row in visibleActionRows"
            :key="row.id"
            class="admin-profile-logs__card"
          >
            <div class="admin-profile-logs__card-top">
              <div class="admin-profile-logs__card-title-wrap">
                <strong>{{ row.title }}</strong>
                <span class="admin-profile-logs__type-chip">{{ row.type }}</span>
              </div>

              <span class="admin-profile-logs__card-time">{{ formatDateTime(row.created_at) }}</span>
            </div>

            <div
              v-if="row.description"
              class="admin-profile-logs__card-description"
            >
              {{ row.description }}
            </div>

            <div class="admin-profile-logs__meta">
              <span v-if="row.method">{{ row.method }}</span>
              <span v-if="row.path">{{ row.path }}</span>
              <span v-if="row.route_name">{{ row.route_name }}</span>
              <span v-if="row.ip">{{ row.ip }}</span>
            </div>
          </div>

          <div
            v-if="canLoadMoreActions"
            class="admin-profile-logs__load-more"
          >
            <button
              type="button"
              class="admin-profile-logs__load-more-button"
              @click="visibleActionCount += 10"
            >
              {{ resolveText("admin.profile.actions.loadMore", "Load more") }}
            </button>
          </div>
        </div>
      </section>

      <section class="admin-profile-logs__panel">
        <div class="admin-profile-logs__panel-header">
          <div>
            <UiTextH5 class="admin-profile-logs__panel-title">
              {{ resolveText("admin.profile.activity.sections.chatConnections", "Chat connections") }}
            </UiTextH5>
            <UiTextSmall class="admin-profile-logs__panel-subtitle">
              {{
                resolveText(
                  "admin.profile.activity.descriptions.chatConnections",
                  "All connections and disconnections from support chats."
                )
              }}
            </UiTextSmall>
          </div>
        </div>

        <div
          v-if="chatRows.length === 0"
          class="admin-profile-logs__empty-state"
        >
          {{ resolveText("admin.profile.activity.empty.chatConnections", "No chat connections recorded yet.") }}
        </div>

        <div
          v-else
          class="admin-profile-logs__list"
        >
          <div
            v-for="row in visibleChatRows"
            :key="row.id"
            class="admin-profile-logs__card admin-profile-logs__card--chat"
          >
            <div class="admin-profile-logs__card-top">
              <div class="admin-profile-logs__card-title-wrap">
                <strong>{{ row.title }}</strong>
                <span class="admin-profile-logs__type-chip admin-profile-logs__type-chip--success">
                  {{ row.action }}
                </span>
              </div>

              <span class="admin-profile-logs__card-time">{{ formatDateTime(row.created_at) }}</span>
            </div>

            <div
              v-if="row.description"
              class="admin-profile-logs__card-description"
            >
              {{ row.description }}
            </div>

            <div class="admin-profile-logs__meta">
              <span v-if="row.meta?.ticket_id">Ticket #{{ row.meta.ticket_id }}</span>
              <span v-if="row.meta?.session_id">Session {{ row.meta.session_id }}</span>
              <span v-if="row.ip">{{ row.ip }}</span>
              <span v-if="row.path">{{ row.path }}</span>
            </div>
          </div>

          <div
            v-if="canLoadMoreChats"
            class="admin-profile-logs__load-more"
          >
            <button
              type="button"
              class="admin-profile-logs__load-more-button"
              @click="visibleChatCount += 10"
            >
              {{ resolveText("admin.profile.actions.loadMore", "Load more") }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  const props = withDefaults(
    defineProps<{
      profileData?: Record<string, any> | null;
      isLoading?: boolean;
      profileScope?: "self" | "admin";
    }>(),
    {
      profileData: null,
      isLoading: false,
      profileScope: "self",
    }
  );

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const activity = ref<any>(null);
  const isLoading = ref(false);
  const visibleActionCount = ref(10);
  const visibleChatCount = ref(10);

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const actionRows = computed(() => (Array.isArray(activity.value?.actions) ? activity.value.actions : []));
  const chatRows = computed(() =>
    Array.isArray(activity.value?.chat_connections) ? activity.value.chat_connections : []
  );

  const visibleActionRows = computed(() => actionRows.value.slice(0, visibleActionCount.value));
  const visibleChatRows = computed(() => chatRows.value.slice(0, visibleChatCount.value));
  const canLoadMoreActions = computed(() => visibleActionRows.value.length < actionRows.value.length);
  const canLoadMoreChats = computed(() => visibleChatRows.value.length < chatRows.value.length);

  const loadActivity = async () => {
    const adminId = String(props.profileData?.id ?? "").trim();
    if (!adminId) {
      activity.value = null;
      return;
    }

    isLoading.value = true;

    try {
      const response =
        props.profileScope === "self"
          ? await appCore.adminModules.profile.getActivity({ limit: 100 })
          : await appCore.admins.getActivity(adminId, { limit: 100 });

      activity.value = response?.data?.data ?? null;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? resolveText("admin.profile.activity.errors.load", "Failed to load activity.")
      );
    } finally {
      isLoading.value = false;
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString();
  };

  watch(
    () => props.profileData?.id,
    async () => {
      visibleActionCount.value = 10;
      visibleChatCount.value = 10;
      await loadActivity();
    },
    { immediate: true }
  );
</script>

<style scoped lang="scss">
  .admin-profile-logs {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .admin-profile-logs__summary-grid,
  .admin-profile-logs__panels {
    display: grid;
    gap: 14px;
  }

  .admin-profile-logs__summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-profile-logs__panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-profile-logs__summary-card,
  .admin-profile-logs__panel {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 10%, var(--color-stroke-ui-light));
    background:
      radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--ui-primary-main) 6%, transparent), transparent 34%),
      color-mix(in srgb, var(--ui-background-panel) 78%, transparent);
  }

  .admin-profile-logs__summary-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-profile-logs__summary-label,
  .admin-profile-logs__summary-hint,
  .admin-profile-logs__panel-subtitle,
  .admin-profile-logs__card-time,
  .admin-profile-logs__meta {
    color: var(--ui-text-secondary);
  }

  .admin-profile-logs__summary-value,
  .admin-profile-logs__panel-title {
    color: var(--ui-text-main);
  }

  .admin-profile-logs__panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .admin-profile-logs__panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-profile-logs__empty-state {
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed color-mix(in srgb, var(--ui-primary-main) 12%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-card) 90%, transparent);
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .admin-profile-logs__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-logs__card {
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 8%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .admin-profile-logs__card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .admin-profile-logs__card-title-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
  }

  .admin-profile-logs__type-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  }

  .admin-profile-logs__type-chip--success {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-success) 18%, transparent);
  }

  .admin-profile-logs__card-description {
    color: var(--ui-text-main);
    line-height: 1.5;
  }

  .admin-profile-logs__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    font-size: 0.8125rem;
  }

  .admin-profile-logs__load-more {
    display: flex;
    justify-content: center;
    padding-top: 4px;
  }

  .admin-profile-logs__load-more-button {
    color: var(--ui-primary-main);
    font-size: 0.875rem;
    font-weight: 700;
    transition: opacity 0.2s ease;
  }

  .admin-profile-logs__load-more-button:hover {
    opacity: 0.78;
    text-decoration: underline;
  }

  @media (max-width: 1120px) {
    .admin-profile-logs__summary-grid,
    .admin-profile-logs__panels {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .admin-profile-logs__panel-header,
    .admin-profile-logs__card-top {
      flex-direction: column;
    }
  }
</style>
