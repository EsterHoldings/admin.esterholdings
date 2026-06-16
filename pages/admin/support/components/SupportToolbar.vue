<template>
  <div class="flex items-center justify-between mb-5">
    <div class="flex items-center justify-between gap-1 w-full max-w-60">
      <UiInput
        class="w-full max-w-[240px]"
        @input="handleInputSearch"
        :value="search"
        :placeholder="supportListText.searchPlaceholder">
        <template #icon-left>
          <UiIconSearch />
        </template>
      </UiInput>
    </div>
    <div class="flex items-center justify-center gap-2">
      <UiButtonDefault
        state="info--small"
        class="mr-2"
        @click="handleClickUpdate">
        <UiIconUpdate v-if="!isLoading" />
        <UiIconSpinnerDefault v-if="isLoading" />
      </UiButtonDefault>

      <UiSelect
        class="mr-2"
        :value="orderBy"
        :data="sortByFilterData"
        :withoutNoSelect="true"
        @change="handleChangeFilterSortBy">
        <template #icon-left>
          <UiIconSortBy
            class="mr-2 !w-[16px] !h-[16px]"
            :orderDirectionEnabled="true"
            :orderDirection="orderDirection" />
        </template>
      </UiSelect>

      <ViewModeToggle
        v-if="!isMobileViewport"
        class="w-full sm:w-auto"
        bordered
        :modelValue="viewMode"
        :options="viewOptions"
        @update:modelValue="handleViewModeChange" />

      <button
        type="button"
        class="support-archive-filter"
        :class="{ 'is-active': showArchived }"
        @click="handleToggleArchived">
        <span class="support-archive-filter__dot" />
        <span>{{ showArchived ? supportListText.archived : supportListText.active }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import type { SupportToolbarProps } from "~/composables/admin/support/components/SupportToolbar";
  import { useSupportToolbarSetup } from "~/composables/admin/support/components/SupportToolbar/setup";

  const props = defineProps<SupportToolbarProps>();

  useSupportToolbarSetup(props);
</script>
