<template>
  <div class="settings">
    <UiTextH3>Settings</UiTextH3>

    <div class="settings__tabs">
      <UiTabs :tabs="tabs" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiTabs from "~/components/ui/UiTabs.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

import { tabs } from "./composables";
</script>

<style lang="scss" scoped>
.settings {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;

  &__tabs {
    width: 1192px;
    margin: 0 auto;
  }
}
</style>
