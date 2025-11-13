<template>
  <div class="accounts-page">
    <div class="accounts-page__title">
      <UiTextH4>{{ $t("admin.accounts.index.title") }}</UiTextH4>
      <UiTextParagraph>{{
        $t("admin.accounts.index.subtitle")
      }}</UiTextParagraph>
    </div>
    <div class="accounts-page__content">
      <AccountsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.accounts-page {
  height: 100vh;
  width: 100%;
  padding: 20px;

  &__title {
    margin-bottom: 20px;
    color: var(--ui-text-main);

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {
    height: calc(100vh - 120px);
  }
}
</style>
