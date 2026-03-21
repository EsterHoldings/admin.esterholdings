<template>
  <div class="modal">
    <div class="multi-select-wrapper" ref="multiSelectRef">
      <div
          class="multi-select"
          :class="{ 'is-open': isListVisible, 'is-invalid': isInvalid }"
          @click="toggleList"
      >
        <div v-if="selectedDataComputed.length === 0">
          <span class="multi-select__placeholder">{{ props.placeholder }}</span>
        </div>
        <div
            class="multi-select__item"
            v-for="itemX in selectedDataComputed"
            :key="itemX.id"
        >
          <span
              class="multi-select__item__remove"
              @click.stop="handleClickRemove(itemX.id)"
          >
            +
          </span>
          <span class="multi-select__item__text">{{ itemX.name }}</span>
        </div>
      </div>
      <div class="multi-select__list-wrapper" v-if="isListVisible">
        <div class="multi-select__search">
          <input
            v-model.trim="searchQuery"
            class="multi-select__search-input"
            type="text"
            :placeholder="searchPlaceholder"
            @click.stop
          />
        </div>
        <div class="multi-select__list">
          <div
              class="multi-select__list__item"
              :class="{ 'is-select': isItemSelected(itemY.id) }"
            v-for="itemY in filteredData"
            :key="itemY.id"
            @click="handleSelectItem(itemY.id)"
          >
            {{ itemY.name }}
          </div>
          <div v-if="filteredData.length === 0" class="multi-select__list__empty">
            Nothing found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

interface IMultiSelectItem {
  id: string;
  name: string;
}

const emit = defineEmits(["update", "remove", "open", "close"]);

const props = defineProps({
  selected: {
    type: Array<IMultiSelectItem>,
    default: () => [],
  },
  data: {
    type: Array<IMultiSelectItem>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
})

const isListVisible = ref(false);
const multiSelectRef = ref<HTMLElement | null>(null);
const searchQuery = ref("");
const searchPlaceholder = "Search";
const normalizedData = computed<IMultiSelectItem[]>(() =>
  Array.isArray(props.data) ? props.data : []
);
const normalizedSelected = computed<string[]>(() =>
  Array.isArray(props.selected) ? props.selected : []
);
const selectedDataComputed = computed(() => {
  return normalizedData.value.filter((item) =>
    normalizedSelected.value.includes(item.id)
  );
});
const filteredData = computed(() => {
  const query = searchQuery.value.toLowerCase();

  if (!query) {
    return normalizedData.value;
  }

  return normalizedData.value.filter((item) =>
    String(item?.name ?? "").toLowerCase().includes(query)
  );
});

const isItemSelected = (id: string) => normalizedSelected.value.includes(id);
const handleSelectItem = (id: string) => emit("update", id);

const toggleList = () =>
  (isListVisible.value = !isListVisible.value)
    ? emit("open")
    : (searchQuery.value = "", emit("close"));

const handleClickRemove = (id: string) => emit("remove", id);

</script>

<style lang="scss" scoped>
.multi-select {
  border-radius: var(--ui-input--border-radius);
  border: 1px solid var(--color-stroke-ui-dark);
  padding: 15px;
  min-height: 40px;

  flex-wrap: wrap;
  gap: 8px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  &__placeholder {
    font-size: 14px;
    font-weight: 300;
    color: var(--color-text-muted);
  }

  &__item {
    position: relative;
    display: flex;
    color: var(--ui-text-main);

    &__remove {
      position: absolute;
      height: 14px;
      width: 14px;
      top: -7px;
      right: 1px;
      border: 1px solid #d77272;
      background-color: #f7f7f7;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 200;
      transform: rotate(45deg);
      transform-origin: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: red;
      line-height: 10px;

      &:hover {
        background-color: #d77272;
        cursor: pointer;
      }
    }

    &__text {
      border: 1px solid var(--color-stroke-ui-dark);
      border-radius: 5px;
      font-size: 12px;
      padding: 4px 6px;
      margin-right: 4px;
      white-space: pre;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.is-open {
    border-bottom: none;
    border-radius: var(--ui-input--border-radius) var(--ui-input--border-radius) 0 0;
  }

  &.is-invalid {
    border: 1px solid red;
  }

  &__list {
    color: var(--ui-text-main);
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    border: 1px solid var(--color-stroke-ui-dark);
    overflow-y: auto;
    overflow-x: hidden;
    max-height: min(420px, 50vh);
    border-radius: 0 0 var(--ui-input--border-radius) var(--ui-input--border-radius);
    background-color: var(--ui-background);

    &-wrapper {
      position: relative;
    }

    &__item {
      background-color: var(--color-stroke-ui-dark);
      margin-bottom: 1px;
      height: 30px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      transition: background-color 0.3s;
      font-weight: 200;
      font-size: 16px;

      &.is-select {
        background-color: var(--color-stroke-ui-dark) !important;
      }

      &:hover {
        cursor: pointer;
        opacity: 0.5;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__empty {
      background-color: var(--color-stroke-ui-dark);
      min-height: 44px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-weight: 200;
      font-size: 16px;
    }
  }

  &-wrapper {
    position: relative;
  }

  &__search {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-stroke-ui-dark);
    border-bottom: none;
    border-radius: 0 0 0 0;
    background-color: var(--ui-background);
    z-index: 2;

    &-input {
      width: 100%;
      min-height: 40px;
      border: 1px solid var(--color-stroke-ui-dark);
      border-radius: 10px;
      padding: 0 12px;
      background-color: var(--color-stroke-ui-dark);
      color: var(--ui-text-main);
      outline: none;
    }
  }
}

.multi-select__list-wrapper .multi-select__list {
  top: 56px;
}
</style>
