<template>
  <section class="py-10 md:py-16">
    <div class="w-full max-w-[1400px] mx-auto px-4">
      <UiTextH3 class="text-[var(--ui-text-main)] text-center mb-10 md:mb-[70px]">
        {{ t("landing.sections.accounts__title") }}
      </UiTextH3>

      <div class="swiper-container-wrapper">
        <Swiper
          class="account-cards-swiper"
          :initial-slide="0"
          :speed="350"
          :resistance-ratio="0.35"
          :centered-slides="false"
          :watch-overflow="true"
          :slides-per-view="1.15"
          :slides-offset-before="baseOffset"
          :slides-offset-after="baseOffset"
          :breakpoints="breakpoints">
          <SwiperSlide
            v-for="(card, index) in accountCards"
            :key="index">
            <TheCard
              :type="card.type"
              :title="card.title"
              :subtitle="card.subtitle"
              :description="card.description"
              :features="card.features"
              :button-text="card.buttonText"
              :is-recommended="card.isRecommended"
              :theme="themeStore.currentTheme" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { computed } from "vue";
  import { Swiper, SwiperSlide } from "swiper/vue";
  import "swiper/css";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";
  import TheCard from "~/pages/landing/sections/AccountTypesSection/components/TheCard.vue";
  import { useThemeStore } from "~/stores/themeStore";

  const { t, tm } = useI18n();
  const themeStore = useThemeStore();

  /**
   * Ширина градієнтних “шторок” по боках = 100px (див. CSS нижче)
   * Зовнішній паддінг контейнера = 16px (px-4)
   * Щоб перший слайд був досяжний і не “відскакував”, додаємо відступи саме у Swiper:
   * slidesOffsetBefore/After = 100 + 16 = 116
   */
  const GRADIENT_WIDTH = 100;
  const CONTAINER_PADDING = 16;
  const baseOffset = GRADIENT_WIDTH + CONTAINER_PADDING; // 116

  const breakpoints = {
    320: {
      slidesPerView: 1.1,
      slidesOffsetBefore: baseOffset,
      slidesOffsetAfter: baseOffset,
    },
    640: {
      slidesPerView: 1.5,
      slidesOffsetBefore: baseOffset,
      slidesOffsetAfter: baseOffset,
    },
    768: {
      slidesPerView: 2.5,
      slidesOffsetBefore: baseOffset,
      slidesOffsetAfter: baseOffset,
    },
    1024: {
      slidesPerView: 3.2,
      slidesOffsetBefore: baseOffset,
      slidesOffsetAfter: baseOffset,
    },
    1280: {
      slidesPerView: 4.2,
      slidesOffsetBefore: baseOffset,
      slidesOffsetAfter: baseOffset,
    },
  };

  const accountCards = computed(() => {
    const options = tm("landing.sections.accounts__options") as any[];
    return Array.isArray(options)
      ? options
          .map((option: any, index: number) => ({
            type: t(`landing.sections.accounts__options[${index}].type`) as
              | "demo"
              | "standard"
              | "pro"
              | "tandem"
              | "islamic",
            title: t(`landing.sections.accounts__options[${index}].title`),
            subtitle: t(`landing.sections.accounts__options[${index}].subtitle`),
            description: t(`landing.sections.accounts__options[${index}].description`),
            features: (tm(`landing.sections.accounts__options[${index}].features`) as any[]).map((_, fIndex) =>
              t(`landing.sections.accounts__options[${index}].features[${fIndex}]`)
            ),
            buttonText: t(`landing.sections.accounts__options[${index}].buttonText`),
            isRecommended: Boolean(option.isRecommended),
          }))
          .filter(card => card.type !== "pro")
      : [];
  });
</script>

<style scoped>
  .swiper-container-wrapper {
    position: relative;
    width: 100%;
  }

  /* Бокові градієнтні маски. Вони НЕ перехоплюють події (pointer-events:none) */
  @media (max-width: 1279px) {
    .swiper-container-wrapper::before,
    .swiper-container-wrapper::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100px;
      z-index: 10;
      pointer-events: none;
    }

    .swiper-container-wrapper::before {
      left: 0;
      background: linear-gradient(to right, var(--ui-background) 0%, transparent 100%);
    }

    .swiper-container-wrapper::after {
      right: 0;
      background: linear-gradient(to left, var(--ui-background) 0%, transparent 100%);
    }
  }

  .account-cards-swiper {
    width: 100%;
    display: flex;
  }

  :deep(.swiper-wrapper) {
    display: flex;
    align-items: center;
    gap: 50px;
  }

  /* Висота слайдів під контент */
  :deep(.swiper-slide) {
    height: auto;
    display: flex;
    align-items: stretch;
    justify-content: center;
    margin-right: 0 !important;
  }

  /* Приховати горизонтальний скролбар у WebKit, зберегти інерцію на iOS */
  :deep(.swiper) {
    -webkit-overflow-scrolling: touch;
  }
</style>
