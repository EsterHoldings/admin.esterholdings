<template>
  <div class="card-wrapper">
    <!-- Background box with gradient border -->
    <div
      class="absolute inset-0 rounded-[20px] p-[1px]"
      :style="{
        background:
          type === 'demo'
            ? 'linear-gradient(138deg, rgba(247, 87, 9, 1) 2%, rgba(1, 22, 68, 1) 100%)'
            : 'linear-gradient(138deg, rgba(27, 99, 255, 1) 2%, rgba(1, 22, 68, 1) 100%)',
      }">
      <div class="w-full h-full rounded-[20px] bg-[#031743]" />
    </div>

    <!-- Blur layer -->
    <div
      class="blur-layer"
      :class="type === 'demo' ? 'bg-[var(--ui-primary-accent)]' : 'bg-[var(--color-stroke-ui-light)]'" />

    <!-- Content -->
    <div class="card-content">
      <!-- Title section -->
      <div class="title-section">
        <h2
          class="title"
          :class="type === 'demo' ? 'text-[var(--ui-primary-accent)]' : 'text-[#ffffff]'">
          {{ title }}
        </h2>
        <span class="subtitle">
          {{ subtitle }}
        </span>
      </div>

      <!-- Description -->
      <p class="description">
        {{ description }}
      </p>

      <!-- Features -->
      <div class="features-group">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-item">
          <UiIconCardCheck
            :is-recommended="isRecommended"
            class="shrink-0" />
          <span class="feature-text">
            {{ feature }}
          </span>
        </div>
      </div>

      <!-- Button -->
      <div class="button-wrapper">
        <UiButtonDefault
          :state="type === 'demo' ? 'warning' : 'primary'"
          class="card-button">
          {{ buttonText }}
        </UiButtonDefault>
      </div>
    </div>

    <!-- Badge for recommended -->
    <div
      v-if="isRecommended"
      class="badge-wrapper">
      <UiBadge
        state="warning"
        :outline="true"
        class="badge">
        <span class="badge-text">{{ $t("landing.sections.accounts__badge_recommended") }}</span>
      </UiBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiBadge from "~/components/ui/UiBadge.vue";

  const { t } = useI18n();

  interface Props {
    type: "demo" | "standard" | "pro" | "tandem" | "islamic";
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    buttonText: string;
    isRecommended?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isRecommended: false,
  });
</script>

<style scoped>
  /* Desktop  */
  .card-wrapper {
    position: relative;
    width: 287px;
    min-width: 287px;
    flex-shrink: 0;
  }

  .card-wrapper:has(.badge-wrapper) {
    height: 440px;
  }

  .card-wrapper:not(:has(.badge-wrapper)) {
    height: 396px;
    padding: 10px;
  }

  .blur-layer {
    position: absolute;
    left: 20px;
    top: 29px;
    width: 172px;
    height: 60px;
    border-radius: 9999px;
    opacity: 0.26;
    filter: blur(54.6px);
  }

  .card-wrapper:has(.badge-wrapper) .blur-layer {
    left: 7px;
    top: 62px;
    filter: blur(65.4px);
  }

  .card-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 17px 21px 21px 21px;
    overflow: hidden;
  }

  .card-wrapper:has(.badge-wrapper) .card-content {
    padding-top: 79px;
    padding-left: 22px;
    padding-right: 22px;
    padding-bottom: 22px;
  }

  .title-section {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  .title {
    font-family: Muli, sans-serif;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.15;
    word-break: break-word;
  }

  .subtitle {
    font-family: Muli, sans-serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.15;
    color: #b8b8c3;
    word-break: break-word;
  }

  .description {
    font-family: Muli, sans-serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.3;
    color: #ffffff;
    word-break: break-word;
  }

  .features-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-height: 26px;
  }

  .feature-text {
    font-family: Muli, sans-serif;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: #ffffff;
    word-break: break-word;
    flex: 1;
  }

  .button-wrapper {
    margin-top: auto;
  }

  .card-button {
    width: 100%;
    border-radius: 50px !important;
    padding: 16px 26px !important;
    font-family: Muli, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1em;
  }

  .badge-wrapper {
    position: absolute;
    top: 43px;
    left: 22px;
  }

  .badge {
    border-radius: 50px !important;
    padding: 6px 10px !important;
    height: auto !important;
    border: 1px solid #f75709 !important;
  }

  .badge-text {
    font-family: Muli, sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    color: #ffffff;
  }

  /* Tablet (md: 768px - 1279px) */
  @media (max-width: 1279px) and (min-width: 768px) {
    .card-wrapper {
      width: 270px;
      min-width: 270px;
    }

    .card-wrapper:has(.badge-wrapper) {
      height: 420px;
    }

    .card-wrapper:not(:has(.badge-wrapper)) {
      height: 380px;
    }

    .card-content {
      padding: 14px 20px 20px 20px;
      gap: 14px;
    }

    .card-wrapper:has(.badge-wrapper) .card-content {
      padding-top: 70px;
    }

    .title {
      font-size: 28px;
    }

    .subtitle {
      font-size: 14px;
    }

    .description {
      font-size: 13px;
    }

    .features-group {
      gap: 14px;
    }

    .feature-text {
      font-size: 13px;
    }
  }

  /* Mobile (< 768px) */
  @media (max-width: 767px) {
    .card-wrapper {
      width: 260px;
      min-width: 260px;
    }

    .card-wrapper:has(.badge-wrapper) {
      height: 400px;
    }

    .card-wrapper:not(:has(.badge-wrapper)) {
      height: 360px;
    }

    .blur-layer {
      left: 5px;
      top: 50px;
      width: 140px;
      height: 50px;
    }

    .card-content {
      padding: 14px 16px 16px 16px;
      gap: 12px;
    }

    .card-wrapper:has(.badge-wrapper) .card-content {
      padding-top: 60px;
    }

    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 13px;
    }

    .description {
      font-size: 12px;
      line-height: 1.3;
    }

    .features-group {
      gap: 12px;
    }

    .feature-item {
      min-height: auto;
    }

    .feature-text {
      font-size: 12px;
      line-height: 1.3;
    }

    .card-button {
      padding: 14px 20px !important;
      font-size: 13px;
    }

    .badge-wrapper {
      top: 35px;
      left: 16px;
    }

    .badge {
      padding: 5px 8px !important;
    }

    .badge-text {
      font-size: 11px;
    }
  }
</style>
