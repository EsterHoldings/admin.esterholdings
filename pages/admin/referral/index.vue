<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ referralPanelProps.labels.title }}</UiTextH4>
        <UiTextParagraph>{{ referralPanelProps.labels.subtitle }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <ReferralPanel v-bind="referralPanelProps" />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import ReferralPanel from "~/pages/admin/referral/components/ReferralPanel.vue";
  import { useReferralPage } from "~/composables/admin/referral/useReferralPage";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { referralPanelProps } = useReferralPage();
</script>
