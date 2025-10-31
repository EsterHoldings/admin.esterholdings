<template>
  <section class="lates_updates">
    <UiContainer>
      <UiTextH3 class="lates_updates_title">{{ t('landing.sections.latest_updates__title') }}</UiTextH3>

      <div class="lates_updates_cards">
        <UiCard
          v-for="(card, index) in newsItems"
          :key="index"
          :src="card.src"
          :title="card.title"
          :subTitle="card.subTitle"
          :time="card.time" />
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { computed } from 'vue';
  import UiTextH3 from '~/components/ui/UiTextH3.vue';
  import UiCard from '~/components/ui/UiCard.vue';
  import UiContainer from '~/components/ui/UiContainer.vue';

  const { t, tm } = useI18n();

  const newsItems = computed(() => {
    const items = tm('landing.sections.latest_updates__items') as any[];
    return Array.isArray(items)
      ? items.map((_, index) => ({
          src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGiL_OXNaefDrdif97UBefC4OW4azk1cyOLQ&s',
          title: t(`landing.sections.latest_updates__items[${index}].title`),
          subTitle: t(`landing.sections.latest_updates__items[${index}].subtitle`),
          time: t(`landing.sections.latest_updates__items[${index}].time`),
        }))
      : [];
  });
</script>

<style lang="scss" scoped>
  .lates_updates {
    &_title {
      text-align: center;
      color: var(--ui-text-main);
    }

    &_cards {
      margin-top: 50px;
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 30px;
    }
  }

  .help-block {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    background: transparent;
    padding: 10px 20px;
    text-align: center;
    position: relative;
    width: 100%;
    margin-top: 100px;
    transition: all 0.3s ease-in-out;
    border: 1px solid rgb(0, 55, 174);
    border-radius: 15px;

    h4 {
      color: var(--ui-text-main);
      font-weight: 700;

      br {
        display: none;
      }
    }

    &:hover {
      border-color: rgba(42, 74, 245, 1);
    }
  }

  .help-block__link {
    color: #f75709;
    font-weight: 700;
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease-in-out;
    font-size: inherit;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 767px) {
    .lates_updates_cards {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .help-block {
      margin-top: 50px;

      h4 > br {
        display: block;
      }
    }
  }
</style>
