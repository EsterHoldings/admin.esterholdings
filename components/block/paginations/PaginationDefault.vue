<template>
  <div class="pagination">
    <div class="pagination__column pagination__column-left">
      <span>Per page:</span>
      <select class="custom-select" @change="handleOnChangePerPage">
        <option
          v-for="itemValue in perPageData"
          :key="itemValue"
          :selected="perPage === itemValue"
        >
          {{ itemValue }}
        </option>
      </select>
    </div>
    <div class="pagination__items pagination__column" v-if="!isLoading">
      <div v-if="totalPages > 1" class="pagination__items">
        <div
          class="pagination__item"
          @click="goToFirstPage"
          :class="{ disabled: page === 1 }"
        >
          <<
        </div>
        <div
          class="pagination__item"
          @click="goToPreviousPage"
          :class="{ disabled: page === 1 }"
        >
          <
        </div>
        <div
          class="pagination__item"
          v-for="pageNumber in visiblePages"
          :key="pageNumber"
          @click="goToPage(pageNumber)"
          :class="{ active: page === pageNumber }"
        >
          {{ pageNumber }}
        </div>
        <div
          class="pagination__item"
          @click="goToNextPage"
          :class="{ disabled: page === totalPages }"
        >
          >
        </div>
        <div
          class="pagination__item"
          @click="goToLastPage"
          :class="{ disabled: page === totalPages }"
        >
          >>
        </div>
      </div>
      <div v-else class="pagination__item-dot">•</div>
    </div>
    <div class="pagination__column pagination__column-right" v-if="!isLoading">
      {{ currentStartRow }} to {{ currentEndRow }} / Total: {{ totalRows }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["pageChange", "perPageChange"]);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    default: 1,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  totalRows: {
    type: Number,
    default: 0,
  },
});

const perPageData = [3, 5, 10, 15, 20, 25, 50, 100];

const totalPages = computed(() => Math.ceil(props.totalRows / props.perPage));
const visiblePages = computed(() => {
  const range = 2; // Кількість сусідніх сторінок
  const start = Math.max(1, props.page - range);
  const end = Math.min(totalPages.value, props.page + range);
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const currentStartRow = computed(() => (props.page - 1) * props.perPage + 1);
const currentEndRow = computed(() =>
  Math.min(props.page * props.perPage, props.totalRows)
);

const goToPage = (pageNumber: number) => {
  if (pageNumber !== props.page) {
    emit("pageChange", pageNumber);
  }
};

const goToFirstPage = () => {
  if (props.page > 1) {
    emit("pageChange", 1);
  }
};

const goToPreviousPage = () => {
  if (props.page > 1) {
    emit("pageChange", props.page - 1);
  }
};

const goToNextPage = () => {
  if (props.page < totalPages.value) {
    emit("pageChange", props.page + 1);
  }
};

const goToLastPage = () => {
  if (props.page < totalPages.value) {
    emit("pageChange", totalPages.value);
  }
};

const handleOnChangePerPage = (event: any) => {
  const newPerPage = parseInt(event.target.value, 10);
  emit("perPageChange", newPerPage);
};
</script>

<style lang="scss" scoped>
.custom-select {
  padding: 5px;
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 3px;
  background-color: var(--ui-background);
  color: #b0b0b0;
}

.pagination {
  padding: 10px 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  &__item-dot {
    font-size: 20px;
    font-weight: bold;
    color: gray;
    cursor: default;
    pointer-events: none;
  }

  &__column {
    min-width: min-content;
    max-width: 33%;
    width: 100%;

    &-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      span {
        font-size: 12px;
        font-weight: 600;
        margin-right: 5px;
      }
    }

    &-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      font-size: 12px;
      font-weight: 600;
    }
  }

  &__items {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 30px;
  }

  &__item {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 3px;

    height: 30px;
    width: 30px;

    margin-right: 5px;

    &:last-child {
      margin-right: 0;
    }

    &.disabled {
      color: gray;
      pointer-events: none;
    }

    &.active {
      background-color: var(--color-stroke-ui-dark);
      font-weight: bold;
    }
  }
}
</style>
