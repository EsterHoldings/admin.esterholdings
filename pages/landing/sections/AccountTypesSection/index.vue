<template>
  <section class="account-types__wrapper">
    <UiContainer>
      <UiTextH3 class="account-types__title">{{ t('landing.sections.accounts__title') }} </UiTextH3>

      <div class="cards-scroll-wrapper">
        <div class="cards-scroll-container">
          <TheCard
            v-for="(card, index) in accountCards"
            :key="index"
            :type="card.type"
            :title="card.title"
            :subtitle="card.subtitle"
            :description="card.description"
            :features="card.features"
            :button-text="card.buttonText"
            :is-recommended="card.isRecommended" />
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { computed } from 'vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import TheCard from '~/components/block/TheCard.vue';

  const { t, tm } = useI18n();

  const accountCards = computed(() => {
    const options = tm('landing.sections.accounts__options') as any[];
    return Array.isArray(options)
      ? options.map((option: any, index: number) => ({
          type: t(`landing.sections.accounts__options[${index}].type`) as
            | 'demo'
            | 'standard'
            | 'pro'
            | 'tandem'
            | 'islamic',
          title: t(`landing.sections.accounts__options[${index}].title`),
          subtitle: t(`landing.sections.accounts__options[${index}].subtitle`),
          description: t(`landing.sections.accounts__options[${index}].description`),
          features: (tm(`landing.sections.accounts__options[${index}].features`) as any[]).map((_, fIndex) =>
            t(`landing.sections.accounts__options[${index}].features[${fIndex}]`),
          ),
          buttonText: t(`landing.sections.accounts__options[${index}].buttonText`),
          isRecommended: Boolean(option.isRecommended),
        }))
      : [];
  });
</script>

<style lang="scss" scoped>
  .account-types {
    &__wrapper {
      padding: 40px 0;
    }

    &__title {
      color: var(--ui-text-main);
      text-align: center;
      margin-bottom: 70px;
    }
  }

  .cards-scroll-wrapper {
    padding: 20px 0;
    overflow: hidden;
  }

  .cards-scroll-container {
    display: flex;
    align-items: center;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 20px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 0px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  @media (max-width: 767px) {
    .account-types {
      &__title {
        font-size: 24px;
        margin-bottom: 40px;
      }
    }

    .cards-scroll-wrapper {
      padding: 10px 0;
    }

    .cards-scroll-container {
      gap: 12px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }
</style>
