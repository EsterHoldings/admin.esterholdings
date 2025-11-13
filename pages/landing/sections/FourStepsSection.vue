<template>
  <section class="four-steps__wrapper">
    <UiContainer>
      <div class="four-steps">
        <UiTextH3 class="four-steps__title">
          {{ t("landing.sections.four_steps_section.title.before") }} <br />
          <span class="highlight">{{ t("landing.sections.four_steps_section.title.highlight") }}</span>
        </UiTextH3>

        <div class="four-steps__container">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="four-steps__item">
            <UiTextH3 class="four-steps__number">{{ index + 1 }}</UiTextH3>
            <div class="four-steps__content">
              <UiTextH4 class="four-steps__heading">{{ step.title }}</UiTextH4>
              <UiTextH5 class="four-steps__description">{{ step.text }} </UiTextH5>
            </div>
          </div>
        </div>

        <NuxtLink to="/auth/registration">
          <UiButtonDefault
            state="primary"
            class="four-steps__button"
            >{{ t("landing.sections.four_steps_section.button") }}
          </UiButtonDefault>
        </NuxtLink>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";

  const { t, tm } = useI18n();

  const stepsRaw = tm("landing.sections.four_steps_section.items");

  const steps = ref(
    Array.isArray(stepsRaw)
      ? stepsRaw.map((_, index) => ({
          title: t(`landing.sections.four_steps_section.items[${index}].title`),
          text: t(`landing.sections.four_steps_section.items[${index}].text`),
        }))
      : []
  );
</script>

<style lang="scss" scoped>
  .four-steps__wrapper {
    padding: 50px 20px;
    display: flex;
    justify-content: center;
    text-align: center;
  }

  .four-steps {
    width: 100%;
  }

  .four-steps__title {
    font-weight: 700;
    color: var(--ui-text-main);
    margin-bottom: 80px;

    br {
      display: none;
    }
  }

  .highlight {
    color: var(--ui-primary-accent);
  }

  .four-steps__container {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 50px;
  }

  .four-steps__item {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    text-align: center;
    gap: 30px;
    min-height: 105px;

    &::before {
      content: "";
      position: absolute;
      left: 35px;
      top: 0;
      width: 1px;
      height: 100%;
      background: #1b63ff;
    }
  }

  .four-steps__number {
    position: relative;
    font-weight: 700;
    font-size: 32px;
    color: #f75709;
  }

  .four-steps__content {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 14px;
  }

  .four-steps__heading {
    font-weight: 700;
    font-size: 24px;
    color: var(--ui-text-main);
  }

  .four-steps__description {
    font-size: 16px;
    color: var(--ui-text-secondary);
    text-align: left;
  }

  .four-steps__button {
    margin: 100px auto;
  }

  @media (max-width: 1023px) {
    .four-steps__container {
      gap: 10px;
    }
  }

  @media (max-width: 991px) {
    .four-steps__title {
      font-size: 26px;

      br {
        display: block;
      }
    }

    .four-steps__container {
      gap: 10px;
      flex-wrap: wrap;
    }

    .four-steps__item {
      min-width: 150px;
    }

    .four-steps__number {
      font-size: 28px;
    }

    .four-steps__heading {
      font-size: 20px;
    }

    .four-steps__description {
      font-size: 13px;
    }

    .four-steps__button {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .four-steps__wrapper {
      padding: 10px;
    }
    .four-steps__container {
      flex-direction: column;
    }
  }
</style>
