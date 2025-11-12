<template>
  <UiContainer>
    <div>
      <UiTextH3 class="!text-[var(--ui-text-main)] text-center">
        {{ t('landing.pages.company.documents.title') }}
      </UiTextH3>

      <UiTextH5 class="!text-[var(--ui-text-main)] text-center mb-5">
        {{ t('landing.pages.company.documents.intro') }}
      </UiTextH5>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <PanelDefault class="p-8 h-full">
          <div class="flex flex-col h-full">
            <UiTextH4 class="text-[var(--ui-text-main)] mb-4">
              {{ t('landing.pages.company.documents.regulations_title') }}
            </UiTextH4>

            <UiTextH5 class="!text-[var(--ui-text-main)] mb-4">
              {{ t('landing.pages.company.documents.regulations_subtitle') }}
            </UiTextH5>

            <ul class="list-none pl-2 text-[var(--ui-text-main)]">
              <li
                  v-for="(item, index) in regulationsList"
                  :key="index"
                  class="mb-2 flex items-center gap-5"
              >
                <UiIconSuccess />
                <span>{{ item }}</span>
              </li>
            </ul>

            <div class="mt-5 flex justify-center">
              <UiButtonDefault state="info">
                {{ t('landing.pages.company.documents.button') }}
              </UiButtonDefault>
            </div>
          </div>
        </PanelDefault>

        <PanelDefault class="p-8 h-full">
          <div class="flex flex-col h-full">
            <UiTextH4 class="text-[var(--ui-text-main)] mb-5">
              {{ t('landing.pages.company.documents.contract_title') }}
            </UiTextH4>

            <UiTextH5 class="!text-[var(--ui-text-main)] mb-5">
              {{ t('landing.pages.company.documents.contract_description') }}
            </UiTextH5>

            <div class="mt-auto flex justify-center">
              <UiButtonDefault state="info" @click="handleClickContract">
                {{ t('landing.pages.company.documents.button') }}
              </UiButtonDefault>
            </div>
          </div>
        </PanelDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import { definePageMeta } from '~/.nuxt/imports';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import UiContainer from '~/components/ui/UiContainer.vue';
import UiTextH3 from '~/components/ui/UiTextH3.vue';
import UiTextH5 from '~/components/ui/UiTextH5.vue';
import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';
import UiIconSuccess from '~/components/ui/UiIconSuccess.vue';
import PanelDefault from '~/components/block/panels/PanelDefault.vue';
import UiTextH4 from '~/components/ui/UiTextH4.vue';

definePageMeta({
  layout: 'main',
  alias: '/documents',
});

const { t, tm } = useI18n();

const regulationsList = computed(() => {
  const list = tm('landing.pages.company.documents.regulations_list') as any[];
  return Array.isArray(list)
      ? list.map((_, index) => t(`landing.pages.company.documents.regulations_list[${index}]`))
      : [];
});

const handleClickContract = () => {
  const url = 'https://esterholdings.com/wp-content/uploads/ESTER-HOLDINGS-INC_PUBLIC_OFFER_2024_EN.pdf';
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>
