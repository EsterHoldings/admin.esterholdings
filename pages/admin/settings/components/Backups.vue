<template>
  <div class="settings-backups">
    <div class="settings-backups__toolbar">
      <div>
        <h3>{{ resolveText("admin.settings.backups.title", "Мониторинг бэкапов") }}</h3>
        <p>
          {{
            resolveText(
              "admin.settings.backups.subtitle",
              "Ежедневные бэкапы базы данных в S3, очередь выполнения и хранение последних 7 дней."
            )
          }}
        </p>
      </div>

      <div class="settings-backups__actions">
        <PrimeButton
          icon="pi pi-refresh"
          :label="resolveText('admin.settings.backups.refresh', 'Обновить')"
          size="small"
          :loading="isLoading"
          outlined
          @click="loadBackups()" />
        <PrimeButton
          icon="pi pi-database"
          :label="resolveText('admin.settings.backups.runNow', 'Запустить бэкап')"
          size="small"
          :loading="isQueueing"
          @click="queueBackup" />
      </div>
    </div>

    <PrimeMessage
      v-if="errorMessage"
      severity="error"
      :closable="false">
      {{ errorMessage }}
    </PrimeMessage>

    <div class="settings-backups__summary-grid">
      <PrimeCard
        v-for="card in summaryCards"
        :key="card.id"
        class="settings-backups__summary-card">
        <template #content>
          <div class="settings-backups__summary-body">
            <span class="settings-backups__summary-label">{{ card.label }}</span>
            <strong class="settings-backups__summary-value">{{ card.value }}</strong>
            <span
              v-if="card.note"
              class="settings-backups__summary-note">
              {{ card.note }}
            </span>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeCard class="settings-backups__table-card">
      <template #content>
        <PrimeDataTable
          :value="items"
          :loading="isLoading"
          data-key="id"
          responsive-layout="scroll"
          striped-rows
          size="small"
          class="settings-backups__table">
          <PrimeColumn
            field="status"
            :header="resolveText('admin.settings.backups.columns.status', 'Статус')"
            style="min-width: 130px">
            <template #body="{ data }">
              <PrimeTag
                :value="statusLabel(data.status)"
                :severity="statusSeverity(data.status)" />
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="filename"
            :header="resolveText('admin.settings.backups.columns.file', 'Файл')"
            style="min-width: 280px">
            <template #body="{ data }">
              <div class="settings-backups__file">
                <strong>{{ data.filename || "-" }}</strong>
                <span>{{ data.path || "-" }}</span>
              </div>
            </template>
          </PrimeColumn>

          <PrimeColumn
            field="size_bytes"
            :header="resolveText('admin.settings.backups.columns.size', 'Размер')"
            style="min-width: 110px">
            <template #body="{ data }">{{ formatBytes(data.size_bytes) }}</template>
          </PrimeColumn>

          <PrimeColumn
            field="started_at"
            :header="resolveText('admin.settings.backups.columns.started', 'Старт')"
            style="min-width: 170px">
            <template #body="{ data }">{{ formatDate(data.started_at || data.created_at) }}</template>
          </PrimeColumn>

          <PrimeColumn
            field="completed_at"
            :header="resolveText('admin.settings.backups.columns.completed', 'Завершен')"
            style="min-width: 170px">
            <template #body="{ data }">{{ formatDate(data.completed_at) }}</template>
          </PrimeColumn>

          <PrimeColumn
            field="error"
            :header="resolveText('admin.settings.backups.columns.error', 'Ошибка')"
            style="min-width: 240px">
            <template #body="{ data }">
              <span
                class="settings-backups__error"
                :title="data.error || ''">
                {{ data.error || "-" }}
              </span>
            </template>
          </PrimeColumn>
        </PrimeDataTable>
      </template>
    </PrimeCard>
  </div>
</template>

<script setup lang="ts">
  import type Echo from "laravel-echo";
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useNuxtApp } from "nuxt/app";
  import useAppCore from "~/composables/useAppCore";

  type BackupItem = {
    id: string;
    status: string;
    disk?: string;
    path?: string | null;
    filename?: string | null;
    size_bytes?: number | null;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    error?: string | null;
  };

  type BackupsSummary = {
    latest?: BackupItem | null;
    last_completed?: BackupItem | null;
    stored_count?: number;
    stored_size_bytes?: number;
    active_count?: number;
    disk?: string;
    prefix?: string;
    retention_days?: number;
    next_run_at?: string | null;
  };

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();
  const { $echo } = useNuxtApp() as { $echo?: Echo };

  const items = ref<BackupItem[]>([]);
  const summary = ref<BackupsSummary>({});
  const isLoading = ref(false);
  const isQueueing = ref(false);
  const errorMessage = ref("");
  let realtimeChannel: any = null;

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const summaryCards = computed(() => [
    {
      id: "last",
      label: resolveText("admin.settings.backups.summary.last", "Последний успешный"),
      value: formatDate(summary.value.last_completed?.completed_at),
      note: summary.value.last_completed?.filename || "",
    },
    {
      id: "stored",
      label: resolveText("admin.settings.backups.summary.stored", "Хранится"),
      value: String(summary.value.stored_count ?? 0),
      note: formatBytes(summary.value.stored_size_bytes),
    },
    {
      id: "active",
      label: resolveText("admin.settings.backups.summary.active", "В очереди/работает"),
      value: String(summary.value.active_count ?? 0),
      note: statusLabel(summary.value.latest?.status || ""),
    },
    {
      id: "next",
      label: resolveText("admin.settings.backups.summary.next", "Следующий запуск"),
      value: formatDate(summary.value.next_run_at),
      note: `${summary.value.disk || "s3"}:${summary.value.prefix || "database-backups"}`,
    },
  ]);

  async function loadBackups(silent = false): Promise<void> {
    if (!silent) {
      isLoading.value = true;
    }
    errorMessage.value = "";

    try {
      const response = await appCore.adminModules.system.getBackups({ limit: 50 });
      const payload = response?.data?.data ?? {};
      items.value = Array.isArray(payload.items) ? payload.items : [];
      summary.value = payload.summary ?? {};
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message || resolveText("admin.settings.backups.loadError", "Не удалось загрузить бэкапы.");
    } finally {
      isLoading.value = false;
    }
  }

  async function queueBackup(): Promise<void> {
    isQueueing.value = true;
    errorMessage.value = "";

    try {
      await appCore.adminModules.system.queueBackup();
      await loadBackups(true);
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message || resolveText("admin.settings.backups.queueError", "Не удалось поставить бэкап в очередь.");
    } finally {
      isQueueing.value = false;
    }
  }

  function statusLabel(status?: string): string {
    const normalized = String(status ?? "").toLowerCase();
    const labels: Record<string, string> = {
      queued: resolveText("admin.settings.backups.status.queued", "В очереди"),
      running: resolveText("admin.settings.backups.status.running", "Выполняется"),
      completed: resolveText("admin.settings.backups.status.completed", "Готово"),
      failed: resolveText("admin.settings.backups.status.failed", "Ошибка"),
    };

    return labels[normalized] || (normalized ? normalized : "-");
  }

  function statusSeverity(status?: string): "success" | "secondary" | "info" | "warn" | "danger" {
    const normalized = String(status ?? "").toLowerCase();
    if (normalized === "completed") return "success";
    if (normalized === "running") return "info";
    if (normalized === "queued") return "warn";
    if (normalized === "failed") return "danger";
    return "secondary";
  }

  function formatDate(value?: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatBytes(value?: number | null): string {
    const bytes = Number(value ?? 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function connectRealtime(): void {
    const echo = resolveEchoClient();
    if (!echo || realtimeChannel) return;

    realtimeChannel = echo.private("system.admin");
    for (const eventName of [
      ".system.backup.updated",
      "system.backup.updated",
      ".Modules\\System\\Events\\DatabaseBackupUpdated",
      "Modules\\System\\Events\\DatabaseBackupUpdated",
      ".DatabaseBackupUpdated",
      "DatabaseBackupUpdated",
    ]) {
      realtimeChannel.stopListening(eventName, handleRealtimeBackupUpdate);
      realtimeChannel.listen(eventName, handleRealtimeBackupUpdate);
    }
  }

  function disconnectRealtime(): void {
    if (!realtimeChannel) return;

    for (const eventName of [
      ".system.backup.updated",
      "system.backup.updated",
      ".Modules\\System\\Events\\DatabaseBackupUpdated",
      "Modules\\System\\Events\\DatabaseBackupUpdated",
      ".DatabaseBackupUpdated",
      "DatabaseBackupUpdated",
    ]) {
      realtimeChannel.stopListening(eventName, handleRealtimeBackupUpdate);
    }
    realtimeChannel = null;
  }

  function handleRealtimeBackupUpdate(): void {
    void loadBackups(true);
  }

  function resolveEchoClient() {
    if ($echo && typeof $echo.private === "function") return $echo;
    if (typeof window !== "undefined" && (window as any).Echo?.private) return (window as any).Echo;

    return null;
  }

  onMounted(() => {
    void loadBackups();
    connectRealtime();
  });

  onBeforeUnmount(() => {
    disconnectRealtime();
  });
</script>

<style scoped lang="scss">
  .settings-backups {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
  }

  .settings-backups__toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .settings-backups__toolbar h3 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 20px;
    font-weight: 840;
  }

  .settings-backups__toolbar p {
    max-width: 720px;
    margin: 6px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .settings-backups__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .settings-backups__summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .settings-backups__summary-card {
    overflow: hidden;
    border-radius: 18px;
    border-color: color-mix(in srgb, var(--ui-primary-main) 15%, var(--color-stroke-ui-light));
  }

  .settings-backups__summary-body {
    display: flex;
    min-height: 118px;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
  }

  .settings-backups__summary-label {
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 760;
  }

  .settings-backups__summary-value {
    color: var(--ui-text-main);
    font-size: 20px;
    font-weight: 860;
    line-height: 1.12;
  }

  .settings-backups__summary-note {
    min-width: 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.35;
    word-break: break-word;
  }

  .settings-backups__table-card {
    overflow: hidden;
    border-radius: 18px;
    border-color: color-mix(in srgb, var(--ui-primary-main) 15%, var(--color-stroke-ui-light));
  }

  .settings-backups__file {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }

  .settings-backups__file strong {
    color: var(--ui-text-main);
    font-size: 13px;
    word-break: break-word;
  }

  .settings-backups__file span,
  .settings-backups__error {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.35;
    word-break: break-word;
  }

  .settings-backups__error {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  @media (max-width: 1180px) {
    .settings-backups__summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .settings-backups__toolbar {
      flex-direction: column;
    }

    .settings-backups__actions,
    .settings-backups__actions :deep(.p-button) {
      width: 100%;
    }

    .settings-backups__summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
