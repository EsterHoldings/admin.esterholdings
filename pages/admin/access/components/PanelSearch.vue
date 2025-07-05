<template>
  <div class="panel-search">
    <UiInput
      class="panel-search__input"
      :placeholder="
        t('admin.access.components.admins-panel-search.placeholder')
      "
      @input="handleInputSearch"
      :borderNone="true"
      :paddingNone="true"
      :isLoading="isLoadingSearch"
      :value="searchFilter"
    >
      <template #icon-left>
        <UiIconSearch />
      </template>
    </UiInput>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";

const { t } = useI18n({ useScope: "global" });

const emit = defineEmits(["input"]);
const props = defineProps({
  searchFilter: {
    type: String,
    default: "",
  },
  isLoadingSearch: {
    type: Boolean,
    default: false,
  },
});
const handleInputSearch = (event) => emit("input", event);
</script>

<style lang="scss" scoped>
.panel-search {
  overflow: hidden;
  margin-bottom: 20px;
  box-sizing: border-box;
  height: 60px;

  &__input {
    height: 50px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-dark);
    overflow: hidden;
  }
}
</style>
