<template>
  <section class="banner-section">
    <UiContainer>
      <div class="banner-section__wrapper">
        <div class="banner-image">
          <UiImage class="banner-image__image" src="/static/banner-bg.png" />
          <UiImage
            class="banner-image__image"
            src="/static/banner-bg-front.png"
          />
        </div>

        <div class="banner-content">
          <UiTextH3 class="banner-title bold"
            >Trade the Markets Like a Pro!</UiTextH3
          >
          <UiTextH6 class="banner-subtitle">
            Whether you're a beginner or a pro, our advanced tools and resources
            help you make informed trading decisions.
          </UiTextH6>

          <div>
            <UiButtonDefault state="primary"
              >Start trading today!</UiButtonDefault
            >
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import UiImage from "~/components/ui/UiImage.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
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
  color: var(--color-ui-grey);
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

@media (max-width: 991px) {
  .banner-section {
    padding: 0;
  }
}

@media (max-width: 767px) {
  .banner-content {
    padding: 10px;
    width: 100%;
  }
}
</style>
