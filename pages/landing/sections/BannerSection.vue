<template>
  <section class="banner-section">
    <UiContainer>
      <div class="banner-section__wrapper">
        <div class="banner-image">
          <UiImage class="banner-image__image" src="/static/banner-bg.png" />
          <img
            class="banner-image__image small"
            src="/static/banner-bg-front.png"
          />
        </div>

        <div class="banner-content">
          <UiTextH3 class="banner-title bold">
            {{ t("banner_section.title") }}</UiTextH3
          >
          <UiTextH6 class="banner-subtitle">
            {{ t("banner_section.subtitle") }}
          </UiTextH6>

          <div>
            <UiButtonDefault state="primary">
              {{ t("banner_section.button") }}</UiButtonDefault
            >
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const { t, tm } = useI18n();
</script>

<style lang="scss" scoped>
.banner-section {
  padding: 60px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;

  &__wrapper {
    position: relative;
    overflow: hidden;
    height: 450px;
    width: 100%;
  }
}

.banner-content {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 40px);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.banner-title {
  overflow-wrap: break-word;
}

.banner-subtitle {
  overflow-wrap: break-word;
  color: var(--ui-gray);
}

.banner-image {
  width: 100%;
  z-index: 1;

  &__image {
    position: absolute;
    top: 0;
    width: 100%;
  }
}

.banner-image img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}

img.banner-image__image.small {
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 60vw !important;
  z-index: 0;
}

@media (max-width: 991px) {
  .banner-title {
    font-size: 26px;
  }

  img.banner-image__image.small {
    top: 58%;
  }
}

@media (max-width: 767px) {
  .banner-content {
    padding: 10px;
    width: 100%;
  }

  img.banner-image__image.small {
    width: 90vw !important;
    top: 65%;
  }
}
</style>
