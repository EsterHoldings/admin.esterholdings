<template>
  <div class="panel-search">
    <UiInput
        class="panel-search__input"
        :placeholder="t('admin.access.components.admins-panel-search.placeholder')"
        @input="handleInputSearch"
        :borderNone="true"
        :paddingNone="true"
        :isLoading="isLoadingSearch"
        :value="searchFilter"
    >
      <template #icon-left>
        <UiIconSearch/>
      </template>
    </UiInput>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";

const {t} = useI18n({useScope: "global"});

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
const handleInputSearch = (value: string) => emit("input", value);
</script>

<style lang="scss" scoped>
.panel-search {
  border: none;
  margin-bottom: 0;
  border-radius: 10px;
  background-color: var(--ui-background);

  &__input {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 10px;
    overflow: hidden;
  }
}
</style>
