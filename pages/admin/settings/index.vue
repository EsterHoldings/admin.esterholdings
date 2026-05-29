<template>
  <div class="settings-page">
    <div class="settings-page__header">
      <div>
        <h1>{{ resolveText("admin.settings.title", "Настройки") }}</h1>
        <p>{{ resolveText("admin.settings.subtitle", "Системные настройки, резервные копии и мониторинг сервера.") }}</p>
      </div>
    </div>

    <PrimeCard class="settings-page-card">
      <template #content>
        <div class="settings-page__layout">
          <aside class="settings-page__nav">
            <PrimeButton
              v-for="(tab, index) in tabsList"
              :key="tab.id"
              type="button"
              class="settings-page__nav-button"
              :class="{ 'is-active': activeTabIndex === index }"
              :icon="tab.icon"
              :label="tab.label"
              text
              @click="handleActiveTab(index)" />
          </aside>

          <main class="settings-page__content">
            <div class="settings-page__content-header">
              <div>
                <h2>{{ tabsList[activeTabIndex]?.label }}</h2>
                <p>{{ tabsList[activeTabIndex]?.description }}</p>
              </div>
            </div>

            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
              mode="out-in">
              <component
                :is="activeTabContent"
                :key="activeTabIndex" />
            </Transition>
          </main>
        </div>
      </template>
    </PrimeCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta } from "~/.nuxt/imports";

import Appearance from "./components/Appearance.vue";
import General from "./components/General.vue";
import Secure from "./components/Secure.vue";
import SystemMonitoring from "./components/SystemMonitoring.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n();

const STORAGE_KEY = "settingsActiveTab";
const activeTabIndex = ref(0);

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const tabsList = computed(() => {
  return [
    {
      id: "general",
      label: resolveText("admin.settings.tabs.general", "Главная"),
      description: resolveText("admin.settings.tabsDescription.general", "Резервные копии базы данных и состояние хранения."),
      icon: "pi pi-database",
      component: General,
    },
    {
      id: "monitoring",
      label: resolveText("admin.settings.tabs.systemMonitoring", "Мониторинг системы"),
      description: resolveText(
        "admin.settings.tabsDescription.systemMonitoring",
        "CPU, RAM, диск и история нагрузки почти в реальном времени."
      ),
      icon: "pi pi-chart-line",
      component: SystemMonitoring,
    },
    {
      id: "appearance",
      label: resolveText("admin.settings.tabs.appearance", "Внешний вид"),
      description: resolveText("admin.settings.tabsDescription.appearance", "Настройки темы и интерфейса."),
      icon: "pi pi-palette",
      component: Appearance,
    },
    {
      id: "secure",
      label: resolveText("admin.settings.tabs.secure", "Безопасность"),
      description: resolveText("admin.settings.tabsDescription.secure", "Сроки токенов и параметры доступа."),
      icon: "pi pi-shield",
      component: Secure,
    },
  ];
});

const activeTabContent = computed(() => {
  return tabsList.value[activeTabIndex.value].component;
});

const handleActiveTab = (tabIndex: number) => {
  activeTabIndex.value = tabIndex;
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("setingsActiveTab");
  if (saved !== null && !isNaN(+saved)) {
    activeTabIndex.value = Math.min(Math.max(+saved, 0), tabsList.value.length - 1);
  }
});

watch(activeTabIndex, (newIndex) => {
  localStorage.setItem(STORAGE_KEY, newIndex.toString());
});
</script>

<style lang="scss" scoped>
.settings-page {
  --settings-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
  --settings-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
  --settings-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  --settings-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(12px, 1.35vw, 22px);
  color: var(--ui-text-main);

  &__header h1 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: clamp(24px, 2.1vw, 36px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  &__header p {
    max-width: 760px;
    margin: 7px 0 0;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  &-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid var(--settings-glass-border);
    border-radius: 22px;
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--ui-primary-main) 10%, transparent), transparent 38%),
      linear-gradient(145deg, var(--settings-glass-bg), var(--settings-glass-bg-strong));
    box-shadow: var(--settings-glass-shadow);
    backdrop-filter: blur(22px) saturate(135%);
    -webkit-backdrop-filter: blur(22px) saturate(135%);
  }

  &-card :deep(.p-card-body),
  &-card :deep(.p-card-content) {
    padding: 0;
  }

  &__layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    min-height: 620px;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px;
    border-right: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  &__nav-button {
    justify-content: flex-start;
    min-height: 42px;
    border-radius: 14px;
    color: var(--ui-text-secondary);
    background: transparent;
    transition:
      color 0.18s ease,
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  &__nav-button:hover,
  &__nav-button.is-active {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
    transform: translateX(2px);
  }

  &__nav-button.is-active {
    box-shadow: inset 2px 0 0 var(--ui-primary-main);
  }

  &__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__content-header {
    min-height: 74px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  &__content-header h2 {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 840;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  &__content-header p {
    max-width: 820px;
    margin: 5px 0 0;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.45;
  }
}

@media (max-width: 980px) {
  .settings-page__layout {
    grid-template-columns: 1fr;
  }

  .settings-page__nav {
    flex-direction: row;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  }

  .settings-page__nav-button {
    flex: 0 0 auto;
  }

  .settings-page__nav-button:hover,
  .settings-page__nav-button.is-active {
    transform: translateY(-1px);
  }

  .settings-page__nav-button.is-active {
    box-shadow: inset 0 -2px 0 var(--ui-primary-main);
  }
}

@media (max-width: 640px) {
  .settings-page {
    padding: 12px;
  }

  .settings-page__content-header {
    min-height: auto;
    padding: 12px;
  }
}
</style>
