<template>
  <section class="flex flex-col gap-4 text-[var(--ui-text-main)]">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4">
        <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.records }}</div>
        <div class="mt-2 text-3xl font-extrabold">{{ formatNumber(summary?.records?.total) }}</div>
      </div>
      <div class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4">
        <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.agents }}</div>
        <div class="mt-2 text-3xl font-extrabold">{{ formatNumber(summary?.records?.agents) }}</div>
      </div>
      <div class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4">
        <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.referrals }}</div>
        <div class="mt-2 text-3xl font-extrabold">{{ formatNumber(summary?.records?.referrals) }}</div>
      </div>
      <div class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4">
        <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.totalBonus }}</div>
        <div class="mt-2 text-3xl font-extrabold">{{ formatMoney(summary?.bonus?.total_bonus) }}</div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex rounded-xl border border-[var(--color-stroke-ui-light)] p-1">
        <button
          type="button"
          class="min-h-9 rounded-lg px-4 text-sm font-bold"
          :class="activeTab === 'network' ? 'bg-[var(--ui-primary-main)] text-white' : 'text-[var(--ui-text-main)]'"
          @click="setActiveTab('network')">
          {{ labels.network }}
        </button>
        <button
          type="button"
          class="min-h-9 rounded-lg px-4 text-sm font-bold"
          :class="activeTab === 'settings' ? 'bg-[var(--ui-primary-main)] text-white' : 'text-[var(--ui-text-main)]'"
          @click="setActiveTab('settings')">
          {{ labels.settings }}
        </button>
      </div>

      <button
        type="button"
        class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-3 text-sm font-bold disabled:cursor-wait disabled:opacity-60"
        :disabled="isLoading"
        @click="reload">
        <span
          class="pi"
          :class="isLoading ? 'pi-spin pi-spinner' : 'pi-refresh'" />
        <span>{{ labels.refresh }}</span>
      </button>
    </div>

    <template v-if="activeTab === 'network'">
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <label class="flex flex-col gap-1 lg:col-span-3">
          <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.search }}</span>
          <input
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="filters.search"
            @input="updateFilter('search', $event.target.value)" />
        </label>

        <label class="flex flex-col gap-1 lg:col-span-2">
          <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.role }}</span>
          <select
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="filters.role"
            @change="updateFilter('role', $event.target.value)">
            <option
              v-for="option in roleOptions"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1 lg:col-span-2">
          <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.status }}</span>
          <select
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="filters.status"
            @change="updateFilter('status', $event.target.value)">
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1 lg:col-span-2">
          <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.level }}</span>
          <select
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="filters.level"
            @change="updateFilter('level', $event.target.value)">
            <option
              v-for="option in levelOptions"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1 lg:col-span-3">
          <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.agent }}</span>
          <select
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="filters.agent_id"
            @change="updateFilter('agent_id', $event.target.value)">
            <option
              v-for="option in agentOptions"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="flex min-h-10 items-center gap-2 lg:col-span-4">
          <input
            type="checkbox"
            :checked="filters.include_descendants"
            @change="updateFilter('include_descendants', $event.target.checked)" />
          <span class="text-sm font-bold">{{ labels.includeDescendants }}</span>
        </label>

        <div class="flex items-end justify-end gap-2 lg:col-span-8">
          <button
            type="button"
            class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] px-4 text-sm font-bold"
            @click="resetFilters">
            {{ labels.reset }}
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)]">
        <div
          v-if="isLoading"
          class="flex min-h-[220px] items-center justify-center text-sm font-bold text-[var(--ui-text-secondary)]">
          {{ labels.loading }}
        </div>

        <div
          v-else-if="rows.length === 0"
          class="flex min-h-[220px] items-center justify-center text-sm font-bold text-[var(--ui-text-secondary)]">
          {{ labels.empty }}
        </div>

        <div
          v-else
          class="divide-y divide-[var(--color-stroke-ui-light)]">
          <article
            v-for="row in rows"
            :key="row.id"
            class="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_minmax(220px,1fr)_minmax(160px,0.7fr)]">
            <div class="flex min-w-0 items-center gap-3">
              <img
                v-if="row.user?.photo_url"
                :src="row.user.photo_url"
                alt=""
                class="h-11 w-11 rounded-full object-cover" />
              <div
                v-else
                class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ui-primary-main)] text-sm font-extrabold text-white">
                {{ initials(row.user) }}
              </div>
              <div class="min-w-0">
                <NuxtLink
                  :to="clientLink(row.user_id)"
                  class="block truncate text-base font-extrabold text-[var(--ui-text-main)] hover:text-[var(--ui-primary-main)]">
                  {{ formatName(row.user) }}
                </NuxtLink>
                <div class="truncate text-sm text-[var(--ui-text-secondary)]">{{ row.user?.email || "-" }}</div>
                <div class="mt-1 flex flex-wrap gap-1.5 text-xs font-bold">
                  <span class="rounded-full bg-[var(--color-stroke-ui-dark)] px-2 py-1">L{{ row.level }}</span>
                  <span
                    v-if="row.is_agent"
                    class="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-500">
                    {{ labels.agents }}: {{ row.referrals_count }}
                  </span>
                  <span
                    v-if="row.is_referral"
                    class="rounded-full bg-blue-500/20 px-2 py-1 text-blue-500">
                    {{ labels.referrals }}
                  </span>
                </div>
              </div>
            </div>

            <div class="min-w-0">
              <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.agentColumn }}</div>
              <NuxtLink
                v-if="row.agent?.user_id"
                :to="clientLink(row.agent.user_id)"
                class="mt-1 block truncate font-bold text-[var(--ui-text-main)] hover:text-[var(--ui-primary-main)]">
                {{ formatName(row.agent) }}
              </NuxtLink>
              <div
                v-else
                class="mt-1 text-sm text-[var(--ui-text-secondary)]">
                -
              </div>
              <div class="mt-1 truncate text-sm text-[var(--ui-text-secondary)]">{{ row.agent?.email || "" }}</div>
            </div>

            <div>
              <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.metrics }}</div>
              <div class="mt-1 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div class="font-extrabold">{{ formatNumber(row.successful_lots) }}</div>
                  <div class="text-[var(--ui-text-secondary)]">{{ labels.lots }}</div>
                </div>
                <div>
                  <div class="font-extrabold">{{ formatNumber(row.successful_trades) }}</div>
                  <div class="text-[var(--ui-text-secondary)]">{{ labels.trades }}</div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div>
                <div class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">{{ labels.bonus }}</div>
                <div class="mt-1 text-lg font-extrabold">{{ formatMoney(row.calculated_bonus) }}</div>
                <div class="text-xs text-[var(--ui-text-secondary)]">{{ formatMoney(row.rate_per_lot) }} / lot</div>
              </div>
              <button
                type="button"
                class="inline-flex min-h-8 w-fit items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-3 text-xs font-bold"
                @click="copyLink(row.referral_link)">
                <span class="pi pi-copy" />
                <span>{{ labels.link }}</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      <PaginationDefault
        :is-loading="isLoading"
        :per-page="perPage"
        :page="page"
        :total-rows="totalRows"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange" />
    </template>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-5 xl:grid-cols-2">
        <label class="flex flex-col gap-2">
          <span class="text-sm font-extrabold">{{ labels.maxLevels }}</span>
          <input
            type="number"
            min="1"
            max="10"
            class="min-h-11 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="settingsForm.max_levels"
            @input="updateSettingsField('max_levels', $event.target.value)" />
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-extrabold">{{ labels.strategy }}</span>
          <select
            class="min-h-11 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
            :value="settingsForm.bonus_strategy"
            @change="updateSettingsField('bonus_strategy', $event.target.value)">
            <option
              v-for="option in strategyOptions"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <span
            v-if="selectedStrategyDescription"
            class="text-sm text-[var(--ui-text-secondary)]">
            {{ selectedStrategyDescription }}
          </span>
        </label>

        <div class="xl:col-span-2">
          <div class="mb-3 text-sm font-extrabold">{{ labels.rates }}</div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <label
              v-for="level in settingsLevels"
              :key="level"
              class="flex flex-col gap-2 rounded-xl border border-[var(--color-stroke-ui-light)] p-3">
              <span class="text-xs font-bold uppercase text-[var(--ui-text-secondary)]">Level {{ level }}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                class="min-h-10 rounded-lg border border-[var(--color-stroke-ui-light)] bg-transparent px-3 outline-none"
                :value="settingsForm.level_rates[String(level)]"
                @input="updateLevelRate(level, $event.target.value)" />
              <span class="text-xs text-[var(--ui-text-secondary)]">{{ labels.perLot }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end xl:col-span-2">
          <button
            type="button"
            class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ui-primary-main)] px-5 font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
            :disabled="isSaving"
            @click="saveSettings">
            <span
              class="pi"
              :class="isSaving ? 'pi-spin pi-spinner' : 'pi-save'" />
            <span>{{ labels.save }}</span>
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
  import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
  import type { ReferralPanelProps } from "~/composables/admin/referral/useReferralPage";

  defineProps<ReferralPanelProps>();
</script>
