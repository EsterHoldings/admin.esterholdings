<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title mb-5">{{ t('landing.pages.company.about.title') }}</UiTextH3>

      <PanelDefault class="p-8">
        <div class="about-company_text">
          <UiTextParagraph>
            <span>{{ t('landing.pages.company.about.intro_1.highlight') }}</span>
            {{ t('landing.pages.company.about.intro_1.text') }}
          </UiTextParagraph>

          <UiTextParagraph>
            {{ t('landing.pages.company.about.intro_2') }}
            <br />
            <strong>{{ t('landing.pages.company.about.intro_3') }}</strong>
          </UiTextParagraph>

          <UiTextParagraph>
            {{ t('landing.pages.company.about.intro_4') }}
            <br />
            <strong>{{ t('landing.pages.company.about.intro_5.highlight') }}</strong>
            {{ t('landing.pages.company.about.intro_5.text') }}
          </UiTextParagraph>
        </div>
      </PanelDefault>

      <UiTextH3 class="about-company_title mt-5">{{ t('landing.pages.company.about.business_model_title') }}</UiTextH3>

      <PanelDefault class="p-8">

        <h2 class="about-company_subtitle mb-4">
          {{ t('landing.pages.company.about.business_model_subtitle') }}
        </h2>

        <ul class="about-company_list">
          <li
            v-for="(item, index) in businessModelList"
            :key="index">
            <UiIconSuccess />
            <span>{{ item }}</span>
          </li>
        </ul>

        <UiImage
          class="schema"
          src="/static/sxema01_eng.jpg" />

      </PanelDefault>

      <UiTextH3 class="about-company_title mt-5">{{ t('landing.pages.company.about.activity_title') }}</UiTextH3>
      <PanelDefault class="p-8 mt-5">
        <ul class="about-company_list">
          <li
              v-for="(item, index) in activityList"
              :key="index">
            <UiIconSuccess />
            <span>{{ item }}</span>
          </li>
        </ul>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
  import { definePageMeta } from '~/.nuxt/imports';
  import { useI18n } from 'vue-i18n';
  import { computed } from 'vue';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiTextParagraph from '~/components/ui/UiTextParagraph.vue';
  import UiImage from '~/components/ui/UiImage.vue';
  import UiIconSuccess from '~/components/ui/UiIconSuccess.vue';
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  definePageMeta({
    layout: 'main',
    alias: '/about-company',
  });

  const { t, tm } = useI18n();

  const businessModelList = computed(() => {
    const list = tm('landing.pages.company.about.business_model_list') as any[];
    return Array.isArray(list)
      ? list.map((_, index) => t(`landing.pages.company.about.business_model_list[${index}]`))
      : [];
  });

  const activityList = computed(() => {
    const list = tm('landing.pages.company.about.activity_list') as any[];
    return Array.isArray(list) ? list.map((_, index) => t(`landing.pages.company.about.activity_list[${index}]`)) : [];
  });
</script>

<style lang="scss" scoped>
  .schema {
    max-width: 550px;
    width: 100%;
    margin: auto auto 40px auto;
  }

  .about-company {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &_title {
      color: var(--ui-text-main);
      text-align: center;
    }

    &_subtitle {
      font-weight: 700;
      font-size: 14px;
      color: #138ee7;
    }

    &_text {
      display: flex;
      flex-direction: column;
      gap: 20px;

      p {
        color: var(--ui-text-secondary);
        line-height: 25px;

        span {
          font-weight: 700;
          color: #138ee7;
        }

        strong {
          font-weight: 700;
        }
      }
    }

    &_list {
      color: var(--ui-text-secondary);
      font-size: 14px;

      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      list-style: none;

      li {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
      }
    }
  }
</style>
