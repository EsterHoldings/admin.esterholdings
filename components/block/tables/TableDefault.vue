<template>
  <div class="cards-container">
    <!-- Загрузка -->
    <div
        v-if="isLoading"
        v-for="n in rowsPerPage"
        :key="'loader-'+n"
        class="card card--loading"
    >
      <UiLoaderPlaceholder class="card__loader"/>
    </div>

    <div
        v-else-if="!isLoading && data.length === 0"
        class="card card--empty"
    >{{ t("ui-components.tables.table-default") }}</div>

    <div
        v-else
        v-for="(row, rowIndex) in data"
        :key="'card-'+rowIndex"
        class="card"
    >
      <div class="card-grid">
        <div
            v-for="(col, colIndex) in columns"
            :key="'cell-'+rowIndex+'-'+colIndex"
            class="card-cell"
        >
          <div class="card-cell__title">{{ col.title }}</div>
          <div class="card-cell__value">
            <template
                v-if="Array.isArray(row[col.key]) && row[col.key][0]?.isIcon"
            >
              <div
                  v-for="(icon, iconIndex) in row[col.key]"
                  :key="iconIndex"
                  class="icon-container"
              >
                <component
                    :is="icon.is"
                    v-bind="icon.props"
                    v-on="icon.events"
                >
                  <template v-if="icon.slot">
                    <component :is="icon.slot"/>
                  </template>
                </component>
              </div>
            </template>

            <!-- Кастомні компоненти -->
            <template
                v-else-if="
                  Array.isArray(row[col.key]) &&
                  row[col.key].length &&
                  row[col.key][0]?.is
                "
            >
              <div class="custom-component-wrapper">
                <component
                    v-for="(compData, compIndex) in row[col.key]"
                    :key="compIndex"
                    :is="compData.is"
                    v-bind="compData.props"
                    v-on="compData.events"
                >
                  <template v-if="compData.slot">
                    <template
                        v-if="
                          typeof compData.slot === 'string' ||
                          typeof compData.slot === 'number'
                        "
                    >
                      {{ compData.slot }}
                    </template>
                    <template v-else>
                      <component :is="compData.slot"/>
                    </template>
                  </template>
                </component>
              </div>
            </template>

            <!-- Масив простих значень -->
            <span v-else-if="Array.isArray(row[col.key])">
              {{ row[col.key].join(", ") }}
            </span>

            <!-- За замовчуванням -->
            <span v-else>
              {{ row[col.key] !== undefined ? row[col.key] : "-" }}
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import UiLoaderPlaceholder from "~/components/ui/UiLoaderPlaceholder.vue";

const {t} = useI18n();

const props = defineProps({
  columns: {
    type: Array as () => { title: string; key: string }[],
    default: () => [],
  },
  data: {
    type: Array as () => Record<string, any>[],
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  rowsPerPage: {
    type: Number,
    default: 4,
  },
});
</script>

<style lang="scss" scoped>
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.card {
  background-color: var(--ui-background-panel);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-grid {
  display: grid;
  grid-auto-flow: row dense;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.card-grid > .card-cell:last-child {
  grid-column: -1;
  align-self: center;
  justify-self: center;
  background-color: var(--ui-background-panel);
  padding: 5px;
  border-radius: 8px;
}

.card-grid > .card-cell:last-child .card-cell__value {
  justify-content: flex-end;
}

.card-cell__value {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.card-cell__title {
  font-weight: 600;
  color: #6b6b6b;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.card-cell__value {
  font-size: 0.95rem;
  color: var(--ui-text-main);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.card--loading {
  align-items: center;
  justify-content: center;
  height: 150px;
}

.card__loader {
  width: 100%;
  height: 100%;
}

.card--empty {
  text-align: center;
  color: #a2a2a2;
  font-style: italic;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.custom-component-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>