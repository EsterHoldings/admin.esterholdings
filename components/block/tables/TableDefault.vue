<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr v-if="columns.length > 0">
          <th
            v-for="(col, index) in columns"
            :key="'head-' + index"
            class="table__header"
          >
            {{ col.title }}
          </th>
        </tr>
        <tr v-if="columns?.length === 0">
          <th class="table__header">{{ isLoading ? "..." : "---" }}</th>
        </tr>
      </thead>

      <tbody class="table__body">
        <tr v-if="!isLoading && data.length === 0">
          <td>Nothing to show... =(</td>
        </tr>

        <tr
          v-if="isLoading"
          v-for="rowIndex in rowsPerPage"
          :key="'loader-row-' + rowIndex"
        >
          <td
            v-for="(col, colIndex) in columns"
            :key="'loader-cell-' + rowIndex + '-' + colIndex"
            class="table__body__loader"
          >
            <UiLoaderPlaceholder />
          </td>
        </tr>

        <tr
          v-if="!isLoading"
          v-for="(row, rowIndex) in data"
          :key="'row-' + rowIndex"
          class="table__row"
        >
          <td
            v-for="(col, colIndex) in columns"
            :key="'cell-' + rowIndex + '-' + colIndex"
            :class="[
              'table__cell',
              { 'table__cell--icons': col.key === 'options' },
            ]"
          >
            <!-- Логіка для isIcon (залишаємо без змін) -->
            <template
              v-if="Array.isArray(row[col.key]) && row[col.key][0]?.isIcon"
            >
              <div
                v-for="(icon, iconIndex) in row[col.key]"
                :key="'icon-' + rowIndex + '-' + colIndex + '-' + iconIndex"
                :class="{ 'icon-container': icon.isIcon }"
              >
                <component
                  v-if="icon.is"
                  :is="icon.is"
                  v-bind="icon.props"
                  v-on="icon.events"
                >
                  <template v-if="icon.slot">
                    <component :is="icon.slot" />
                  </template>
                </component>
              </div>
            </template>

            <!-- Нова логіка для відображення компоненту або рядка, переданого через slot -->
            <template
              v-else-if="
                Array.isArray(row[col.key]) &&
                row[col.key].length &&
                row[col.key][0].is
              "
            >
              <div class="custom-component-wrapper">
                <component
                  v-for="(compData, compIndex) in row[col.key]"
                  :key="'comp-' + rowIndex + '-' + colIndex + '-' + compIndex"
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
                      <component :is="compData.slot" />
                    </template>
                  </template>
                </component>
              </div>
            </template>

            <!-- Якщо масив, але не містить об'єктів з компонентами -->
            <span v-else-if="Array.isArray(row[col.key])">
              {{ row[col.key].join(", ") }}
            </span>

            <!-- За замовчуванням -->
            <span v-else>
              {{ row[col.key] !== undefined ? row[col.key] : "-" }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import UiLoaderPlaceholder from "~/components/ui/UiLoaderPlaceholder.vue";

const props = defineProps({
  columns: {
    type: Array as () => {
      title: string;
      key: string;
    }[],
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
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--ui-background);
  font-family: Montserrat, sans-serif;
}

.table th {
  padding: 5px 10px;
  text-align: left;
}

.table td {
  padding: 10px;
  text-align: left;
}

.table__header {
  background-color: var(--ui-background);
  color: #a2a2a2;
  font-weight: 500;
  border: 1px solid var(--color-stroke-ui-dark);
}

.table__body {
  &__loader {
    background-color: rgba(183, 182, 182, 0.29);
  }
}

.table__row:nth-child(even) {
  background-color: var(--color-stroke-ui-dark);
}

.table__row:hover {
  background-color: var(--ui-background);
}

.table__cell:last-child {
  text-align: center;
}

.table__cell--icons {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: 0.1s;
  margin-right: 5px;
  height: 22px;
  width: 22px;

  &:last-child {
    margin-right: 0;
  }

  &:active {
    background-color: #8f8f8f;
    transition: 0.1s;
  }

  &:hover {
    background-color: var(--color-stroke-ui-dark);
    transition: 0.1s;
  }
}
</style>
