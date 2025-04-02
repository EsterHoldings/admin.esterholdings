<template>
  <section class="wide_range_section">
    <UiTextH3>Wide Range of Products</UiTextH3>

    <div class="wide_range_section__tabs">
      <UiTabs :tabs="tabs" @active-tab="setActiveTab" class="tabs" />
    </div>

    <div class="wide_range_section__content">
      <component :is="activeComponent" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { tabs } from "./composables/index";
import { activeComponent, setActiveTab } from "./composables/setup";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTabs from "~/components/ui/UiTabs.vue";
</script>

<style lang="scss" scoped>
.wide_range_section {
  h3 {
    color: var(--color-ui-primary-defalt);
    text-align: center;
  }

  &__tabs {
    margin-top: 54px;
  }

  &__content {
    margin-top: 29px;
  }
}
</style>
