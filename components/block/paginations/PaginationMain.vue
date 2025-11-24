<script setup lang="ts">
import {computed, reactive} from 'vue'
import { useI18n } from 'vue-i18n'
import UiButtonDefault from '~/components/ui/UiButtonDefault.vue'
import UiSelect from "~/components/ui/UiSelect.vue";

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  currentPage: any
  totalPages: any
  total: any
  perPage: any
  visiblePages: number[]
  perPageOptions?: number[]
}>()

const emit = defineEmits<{
  (e: 'go-prev'): void
  (e: 'go-next'): void
  (e: 'set-page', page: number): void
  (e: 'set-per-page', perPage: number): void
}>()

const perPageList = reactive([
  {id: 1, value: 1, text: "1"},
  {id: 2, value: 2, text: "2"},
  {id: 3, value: 3, text: "3"},
  {id: 4, value: 4, text: "4"},
  {id: 5, value: 5, text: "5"},
  {id: 6, value: 6, text: "6"},
  {id: 7, value: 7, text: "7"},
  {id: 8, value: 8, text: "8"},
  {id: 9, value: 9, text: "9"},
  {id: 10, value: 10, text: "10"},
  {id: 12, value: 12, text: "12"},
  {id: 15, value: 15, text: "15"},
  {id: 20, value: 20, text: "20"},
  {id: 25, value: 25, text: "25"},
  {id: 50, value: 50, text: "50"},
  {id: 100, value: 100, text: "100"},
]);

const showPagination = computed(() => {
  if (!props.total) return false
  return props.total > props.perPage
})

const rangeStart = computed(() => {
  if (!props.total) return 0
  return (props.currentPage - 1) * props.perPage + 1
})

const rangeEnd = computed(() => {
  if (!props.total) return 0
  const end = props.currentPage * props.perPage
  return end > props.total ? props.total : end
})

const handleClickPrev = () => {
  emit('go-prev')
}

const handleClickNext = () => {
  emit('go-next')
}

const handleClickPage = (page: number) => {
  emit('set-page', page)
}

const handleChangePerPage = (value: any) => {
  emit('set-per-page', Number(value))
}
</script>

<template>
  <div
      v-if="showPagination"
      class="flex items-center justify-between gap-4"
  >
    <div class="flex items-center">
      <span class="text-sm text-[var(--ui-text-main)]">
        {{ t('ui.pagination.perPage') }}
      </span>

      <div class="relative">

        <UiSelect
            class="mr-2"
            :value="perPage"
            :data="perPageList"
            :withoutNoSelect="true"
            :withoutOverlay="true"
            @change="handleChangePerPage"
        />

<!--        <select-->
<!--            class="h-9 min-w-[80px] rounded-full bg-[var(&#45;&#45;color-stroke-ui-dark)] border border-[var(&#45;&#45;color-ui-border)] px-4 pr-8 text-sm text-[var(&#45;&#45;ui-text-main)] appearance-none focus:outline-none focus:border-[var(&#45;&#45;color-ui-accent)]"-->
<!--            :value="perPage"-->
<!--            @change="handleChangePerPage"-->
<!--        >-->
<!--          <option-->
<!--              v-for="option in perPageOptions"-->
<!--              :key="option"-->
<!--              :value="option"-->
<!--          >-->
<!--            {{ option }}-->
<!--          </option>-->
<!--        </select>-->
<!--        <span-->
<!--            class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[var(&#45;&#45;ui-text-main)]"-->
<!--        >-->
<!--          ˅-->
<!--        </span>-->
      </div>
    </div>

    <div class="flex-1 flex justify-center">
      <span class="text-sm text-[var(--ui-text-main)]">
        {{ rangeStart }}-{{ rangeEnd }} / {{ total }}
      </span>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UiButtonDefault
          v-if="currentPage !== 1 && total > perPage"
          state="pagination--small"
          class="px-3 py-1.5 text-sm"
          @click="handleClickPrev"
      >
        {{ t('cabinet.billing.pagination.prev') }}
      </UiButtonDefault>

      <UiButtonDefault
          v-if="visiblePages.length && visiblePages[0] > 1"
          state="pagination--small"
          class="px-3 py-1.5 text-sm"
          @click="handleClickPage(1)"
      >
        1
      </UiButtonDefault>

      <span
          v-if="visiblePages.length && visiblePages[0] > 2"
          class="text-sm text-[var(--ui-text-main)]"
      >
        ...
      </span>

      <UiButtonDefault
          v-for="page in visiblePages"
          :key="page"
          state="pagination--small"
          class="px-3 py-1.5 text-sm"
          :class="{
          '!bg-[var(--color-stroke-ui-light)] text-white !border-[var(--color-stroke-ui-light)]':
            currentPage === page
        }"
          @click="handleClickPage(page)"
      >
        {{ page }}
      </UiButtonDefault>

      <span
          v-if="
          visiblePages.length &&
          visiblePages[visiblePages.length - 1] < totalPages
        "
          class="text-sm text-[var(--ui-text-main)]"
      >
        ...
      </span>

      <UiButtonDefault
          v-if="
          visiblePages.length &&
          visiblePages[visiblePages.length - 1] < totalPages
        "
          state="pagination--small"
          class="px-3 py-1.5 text-sm"
          @click="handleClickPage(totalPages)"
      >
        {{ totalPages }}
      </UiButtonDefault>

      <UiButtonDefault
          v-if="currentPage !== totalPages && total > perPage"
          state="pagination--small"
          class="px-3 py-1.5 text-sm"
          @click="handleClickNext"
      >
        {{ t('cabinet.billing.pagination.next') }}
      </UiButtonDefault>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
