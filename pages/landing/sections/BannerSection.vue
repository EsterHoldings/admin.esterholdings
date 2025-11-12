<template>
  <section class="banner-section">
    <UiContainer>
      <div class="banner-section__wrapper">
        <div class="banner-content">
          <h2 class="banner-title">
            {{ t('landing.sections.banner_section.title') }}
            <span class="banner-title__highlight">
              {{ t('landing.sections.banner_section.title_highlight') }}
            </span>
          </h2>
          <UiTextH6 class="banner-subtitle">
            {{ t('landing.sections.banner_section.subtitle') }}
          </UiTextH6>
          <div class="banner-buttons">
            <UiButtonDefault state="primary">
              {{ t('landing.sections.banner_section.button_primary') }}
            </UiButtonDefault>
            <UiButtonDefault
              class="btn-secondary"
              state="secondary">
              {{ t('landing.sections.banner_section.button_secondary') }}
            </UiButtonDefault>
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH6 from '~/components/ui/UiTextH6.vue';
  import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .banner-section {
    display: none;

    @media (min-width: 768px) {
      display: block;
    }

    &__wrapper {
      background-image: url('/static/banner-cta-bg.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 20px;
      border: 1px solid #0037ae;
      height: 280px;
      padding: 63px;
      display: flex;
      align-items: center;
      overflow: hidden;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          rgba(27, 99, 255, 0.95) 0%,
          rgba(1, 22, 68, 0.8) 35%,
          rgba(1, 22, 68, 0.3) 70%,
          transparent 100%
        );
        border-radius: 20px;
        z-index: 0;
      }
    }
  }

  .banner-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 498px;
    position: relative;
    z-index: 1;
  }

  .banner-title {
    font-family: Muli, sans-serif;
    font-weight: 700;
    font-size: 32px;
    line-height: 1.2;
    color: #ffffff;
    margin: 0;

    &__highlight {
      color: #f75709;
    }
  }

  .banner-subtitle {
    font-family: Muli, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.2;
    color: #b8b8c3;
    margin: 0;
  }

  .banner-buttons {
    display: flex;
    gap: 10px;
    align-items: center;

    :deep(.btn-secondary) {
      background-color: transparent !important;
      border: 1px solid #f75709 !important;
      color: #ffffff !important;

      &:hover {
        background-color: rgba(247, 87, 9, 0.1) !important;
      }
    }
  }
</style>
