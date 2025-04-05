<template>
  <section class="four-steps__wrapper">
    <UiContainer>
      <div class="four-steps">
        <UiTextH3 class="four-steps__title">
          Open an account in <span class="highlight">4 simple steps</span>
        </UiTextH3>

        <div class="four-steps__container">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="four-steps__item"
          >
            <UiTextH3 class="four-steps__number">{{ index + 1 }}</UiTextH3>
            <div class="four-steps__content">
              <UiTextH4 class="four-steps__heading">{{ step.title }}</UiTextH4>
              <UiTextH5 class="four-steps__description"
                >{{ step.description }}
              </UiTextH5>
            </div>
          </div>
        </div>

        <UiButtonDefault state="primary" class="four-steps__button"
          >Open account
        </UiButtonDefault>
      </div>
    </UiContainer>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const steps = ref([
  {
    title: "Register",
    description:
      "Choose an account type and complete our fast and secure application form",
  },
  {
    title: "Verify",
    description: "Use our digital onboarding system for fast verification",
  },
  {
    title: "Fund",
    description:
      "Fund your trading account using a wide range of funding methods",
  },
  {
    title: "Trade",
    description:
      "Start trading on your live account and access +2,100 instruments",
  },
]);
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
}

.highlight {
  color: var(--ui-primary-accent);
}

.four-steps__container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 50px;
}

.four-steps__item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  text-align: center;
  gap: 30px;

  &::before {
    content: "";
    position: absolute;
    left: 30px;
    top: 0;
    width: 2px;
    height: 100%;
    background: var(--color-stroke-ui);
  }
}

.four-steps__number {
  position: relative;
  font-weight: 700;
  color: var(--ui-primary-accent);
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
  color: var(--ui-text-main);
}

.four-steps__description {
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
  .four-steps__container {
    gap: 10px;
    flex-wrap: wrap;
  }

  .four-steps__item {
    min-width: 150px;
  }

  .four-steps__heading {
    font-size: 20px;
  }

  .four-steps__description {
    font-size: 13px;
  }

  .four-steps__button {
    margin: 50px auto;
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
