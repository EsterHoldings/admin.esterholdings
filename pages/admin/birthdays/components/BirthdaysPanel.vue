<template>
  <section class="flex min-h-full flex-col gap-3 p-2.5 text-[var(--ui-text-main)]">
    <header
      class="flex items-start justify-between gap-4 rounded-xl bg-transparent px-5 py-[18px] max-[640px]:flex-col max-[640px]:items-stretch">
      <div class="min-w-0">
        <h1 class="m-0 text-[28px] font-extrabold leading-[1.15] text-[var(--ui-text-main)]">{{ labels.title }}</h1>
        <p class="mt-1.5 max-w-[780px] text-sm leading-[1.45] text-[var(--ui-text-secondary)]">
          {{ labels.subtitle }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border-0 bg-[var(--ui-primary-main)] px-3.5 font-bold text-white transition-opacity disabled:cursor-wait disabled:opacity-55 max-[640px]:w-full"
        :disabled="isBusy"
        @click="reloadBirthdays">
        <span class="pi pi-refresh" />
        <span>{{ labels.refresh }}</span>
      </button>
    </header>

    <div class="mt-0 flex flex-wrap items-center gap-3.5 rounded-xl bg-transparent p-3">
      <div class="inline-flex flex-wrap items-center gap-2">
        <span class="text-[13px] font-bold text-[var(--ui-text-secondary)]">{{ labels.period }}</span>
        <button
          v-for="option in periodOptions"
          :key="option.value"
          type="button"
          class="min-h-8 rounded-full border px-3 text-[13px] font-bold"
          :class="
            filters.period === option.value
              ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white'
              : 'border-transparent bg-transparent text-[var(--ui-text-main)]'
          "
          @click="updatePeriod(option.value)">
          {{ option.label }}
        </button>
      </div>

      <div class="inline-flex flex-wrap items-center gap-2">
        <span class="text-[13px] font-bold text-[var(--ui-text-secondary)]">{{ labels.group }}</span>
        <button
          v-for="option in scopeOptions"
          :key="option.value"
          type="button"
          class="min-h-8 rounded-full border px-3 text-[13px] font-bold"
          :class="
            filters.scope === option.value
              ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white'
              : 'border-transparent bg-transparent text-[var(--ui-text-main)]'
          "
          @click="updateScope(option.value)">
          {{ option.label }}
        </button>
      </div>

      <label class="ml-auto inline-flex flex-wrap items-center gap-2 max-[640px]:ml-0 max-[640px]:w-full">
        <span class="text-[13px] font-bold text-[var(--ui-text-secondary)]">{{ labels.show }}</span>
        <select
          class="min-h-8 rounded-lg border border-transparent bg-transparent px-3 text-[13px] font-bold text-[var(--ui-text-main)] disabled:cursor-wait disabled:opacity-60 max-[640px]:w-full"
          :value="perPage"
          :disabled="isBusy"
          @change="handlePerPageChange">
          <option
            v-for="option in perPageOptions"
            :key="option"
            :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </div>

    <div
      class="mt-0 flex flex-wrap gap-2.5 rounded-[10px] bg-transparent px-3 py-2.5 text-[13px] text-[var(--ui-text-secondary)]">
      <span>{{ labels.year }}: {{ meta?.year || currentYear }}</span>
      <span>{{ labels.range }}: {{ formatDate(meta?.from) }} - {{ formatDate(meta?.to) }}</span>
      <span>{{ labels.found }}: {{ totalItems }}</span>
      <span>{{ labels.shown }}: {{ shownItems }}</span>
      <span>{{ labels.page }}: {{ currentPage }} / {{ lastPage }}</span>
    </div>

    <BirthdaysStateBlock
      v-if="showInitialLoading"
      :text="labels.loading"
      loading />

    <BirthdaysStateBlock
      v-else-if="showInitialError"
      :text="loadError"
      danger />

    <BirthdaysStateBlock
      v-else-if="showEmpty"
      :text="labels.empty" />

    <div
      v-else-if="showResults"
      class="flex flex-col gap-3">
      <div
        v-if="loadError"
        class="text-center text-[13px] font-bold text-[var(--ui-sticker-danger)]">
        {{ loadError }}
      </div>

      <div class="grid gap-3">
        <BirthdayCard
          v-for="item in items"
          :key="item.user_id"
          :item="item"
          :labels="{ history: labels.history, noEmails: labels.noEmails }"
          :client-link="clientLink"
          :format-day-month="formatDayMonth"
          :format-date-time="formatDateTime"
          :initials="initials"
          :age-label="ageLabel"
          :days-label="daysLabel"
          :recipient-label="recipientLabel"
          :type-label="typeLabel"
          :status-label="statusLabel" />
      </div>

      <div
        class="mt-0 flex items-center justify-center gap-2 rounded-[10px] bg-transparent px-3 py-2.5 max-[640px]:flex-wrap">
        <button
          type="button"
          class="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-transparent bg-transparent px-2.5 font-extrabold text-[var(--ui-text-main)] disabled:cursor-not-allowed disabled:opacity-55"
          :disabled="isBusy || currentPage <= 1"
          @click="goToPage(currentPage - 1)">
          <span class="pi pi-chevron-left" />
        </button>
        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-lg border px-2.5 font-extrabold disabled:opacity-55"
          :class="
            currentPage === pageNumber
              ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white'
              : 'border-transparent bg-transparent text-[var(--ui-text-main)]'
          "
          :disabled="isBusy"
          @click="goToPage(pageNumber)">
          {{ pageNumber }}
        </button>
        <button
          type="button"
          class="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-transparent bg-transparent px-2.5 font-extrabold text-[var(--ui-text-main)] disabled:cursor-not-allowed disabled:opacity-55"
          :disabled="isBusy || currentPage >= lastPage"
          @click="goToPage(currentPage + 1)">
          <span class="pi pi-chevron-right" />
        </button>
      </div>

      <button
        v-if="hasMore"
        type="button"
        class="mx-auto mt-0 inline-flex min-h-[38px] w-fit items-center justify-center gap-2 rounded-lg border border-[var(--ui-primary-main)] bg-transparent px-[18px] font-extrabold text-[var(--ui-primary-main)] disabled:cursor-wait disabled:opacity-60"
        :disabled="isBusy"
        @click="loadMore">
        <span
          v-if="isLoadingMore"
          class="pi pi-spin pi-spinner" />
        <span>{{ labels.loadMore }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import BirthdayCard from "./BirthdayCard.vue";
  import BirthdaysStateBlock from "./BirthdaysStateBlock.vue";
  import type { BirthdaysPanelProps } from "~/composables/admin/birthdays/components/BirthdaysPanel";
  import { useBirthdaysPanelSetup } from "~/composables/admin/birthdays/components/BirthdaysPanel/setup";

  const props = defineProps<BirthdaysPanelProps>();
  const {
    handlePerPageChange,
    showEmpty,
    showInitialError,
    showInitialLoading,
    showResults,
    updatePeriod,
    updateScope,
  } = useBirthdaysPanelSetup(props);
</script>
