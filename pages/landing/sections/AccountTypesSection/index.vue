<template>
  <section class="py-10 md:py-16">
    <div class="w-full max-w-[1400px] mx-auto px-4">
      <UiTextH3 class="text-[var(--ui-text-main)] text-center mb-10 md:mb-[70px]">
        {{ t("landing.sections.accounts__title") }}
      </UiTextH3>

      <div class="swiper-container-wrapper">
        <swiper
          :slides-per-view="1.15"
          :initial-slide="0"
          :breakpoints="breakpoints"
          class="account-cards-swiper">
          <swiper-slide
            v-for="(card, index) in accountCards"
            :key="index">
            <TheCard
              :type="card.type"
              :title="card.title"
              :subtitle="card.subtitle"
              :description="card.description"
              :features="card.features"
              :button-text="card.buttonText"
              :is-recommended="card.isRecommended" />
          </swiper-slide>
        </swiper>
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

  const { t, tm } = useI18n();

  const breakpoints = {
    320: {
      slidesPerView: 1.4,
    },
    640: {
      slidesPerView: 1.5,
    },
    768: {
      slidesPerView: 2.5,
    },
    1024: {
      slidesPerView: 3.2,
    },
    1280: {
      slidesPerView: 4.2,
    },
  };

  const accountCards = computed(() => {
    const options = tm("landing.sections.accounts__options") as any[];
    return Array.isArray(options)
      ? options.map((option: any, index: number) => ({
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
      : [];
  });
</script>

<style scoped>
  .swiper-container-wrapper {
    position: relative;
    width: 100%;
  }

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
    background: linear-gradient(to right, #000b1f 0%, transparent 100%);
  }

  .swiper-container-wrapper::after {
    right: 0;
    background: linear-gradient(to left, #000b1f 0%, transparent 100%);
  }

  .account-cards-swiper {
    width: 100%;
  }

  :deep(.swiper-slide) {
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px !important;
  }
</style>
