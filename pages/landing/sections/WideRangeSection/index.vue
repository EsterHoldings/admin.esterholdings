<template>
  <section class="wide_range_section">
    <UiTextH3>{{ t("wide_range__title") }}</UiTextH3>

    <div class="wide_range_section__tabs">
      <UiTabs
        :tabs="tabsList.tabs.value"
        @active-tab="setActiveTab"
        class="tabs"
      />
    </div>

    <div class="wide_range_section__content">
      <component :is="activeComponent" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTabs } from "./composables/index";
const { t } = useI18n();
import { activeComponent, setActiveTab } from "./composables/setup";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTabs from "~/components/ui/UiTabs.vue";

const tabsList = useTabs();
</script>

<style lang="scss" scoped>
.wide_range_section {
  h3 {
    color: var(--ui-text-main);
    text-align: center;
  }

  &__tabs {
    margin-top: 54px;
  }

  &__content {
    margin-top: 29px;
  }
}

@media (max-width: 991px) {
  .wide_range_section {
    h3 {
      font-size: 26px;
    }
  }
}
</style>
