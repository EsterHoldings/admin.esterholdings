<template>
  <div class="flex items-center justify-between gap-3 max-[767px]:flex-col max-[767px]:items-stretch">
    <div class="flex w-full items-center gap-2.5 lg:max-w-[520px]">
      <UiInput
        class="w-full"
        clearable
        :value="searchFilter"
        :placeholder="searchPlaceholder"
        @input="handleSearch">
        <template #icon-left>
          <UiIconSearch />
        </template>
      </UiInput>
    </div>

    <div class="flex items-center justify-end gap-2.5 max-[767px]:w-full max-[767px]:justify-stretch">
      <UiButtonDefault
        state="info--small"
        class="!w-11 max-[767px]:!w-full"
        @click="handleRefresh">
        <UiIconUpdate :spinning="isRefreshing" />
      </UiButtonDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import type {
    WithdrawalToolbarEmits,
    WithdrawalToolbarProps,
  } from "~/composables/admin/withdrawal-requests/components/WithdrawalToolbar";
  import { useWithdrawalToolbarSetup } from "~/composables/admin/withdrawal-requests/components/WithdrawalToolbar/setup";

  defineProps<WithdrawalToolbarProps>();
  const emit = defineEmits<WithdrawalToolbarEmits>();

  const { handleRefresh, handleSearch } = useWithdrawalToolbarSetup(emit);
</script>
