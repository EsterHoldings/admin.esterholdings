<template>
  <section class="advantages_section">
    <div class="advantages_container">
      <h2 class="advantages_title">
        {{ t("landing.sections.advantages_title_before") }}
        <span class="accent">{{ t("landing.sections.advantages_title_accent") }}</span>
      </h2>

      <div class="advantages_list">
        <div
          class="advantage_wrapper"
          v-for="(item, index) in advantages"
          :key="index">
          <div class="advantage_item">
            <div class="advantage_value">
              {{ t(`landing.sections.advantages[${index}].value`) }}
            </div>

            <div class="advantage_label">
              {{ t(`landing.sections.advantages[${index}].label`) }}
            </div>
          </div>

          <div
            class="divider"
            v-if="index !== advantages.length - 1"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";

  const { tm, t } = useI18n();
  const advantages = tm("landing.sections.advantages");
</script>

<style lang="scss" scoped>
  .advantages_section {
    margin-top: 50px;
    margin-bottom: 150px;
    padding: 0 20px;
    display: flex;
    justify-content: center;
  }

  .advantages_container {
    max-width: 1050px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 92px;
  }

  .advantages_title {
    font-family: "Muli", sans-serif;
    font-weight: 700;
    font-size: 32px;
    line-height: 1.2;
    text-align: center;
    color: var(--ui-text-main);
    margin: 0;

    .accent {
      color: var(--ui-primary-accent);
    }
  }

  .advantages_list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .advantage_wrapper {
    display: flex;
    align-items: center;
    gap: 80px;
  }

  .advantage_item {
    display: flex;
    flex-direction: column;
    gap: 9px;
    text-align: center;
  }

  .advantage_value {
    font-family: "Muli", sans-serif;
    font-weight: 700;
    font-size: 32px;
    line-height: 1.2;
    color: var(--ui-text-main);
    white-space: nowrap;
  }

  .advantage_icon {
    width: 130px;
    height: auto;
    display: block;
    margin: 0 auto;
  }

  .advantage_label {
    font-family: "Muli", sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.2;
    color: var(--ui-text-secondary);
  }

  .divider {
    width: 1px;
    height: 66px;
    background: linear-gradient(138deg, rgba(27, 99, 255, 1) 2%, rgba(1, 22, 68, 1) 100%);
    flex-shrink: 0;
  }

  @media (max-width: 991px) {
    .advantages_section {
      margin-top: 50px;
      margin-bottom: 50px;
    }

    .advantages_container {
      gap: 50px;
    }

    .advantages_list {
      flex-direction: column;
    }

    .advantage_wrapper {
      flex-direction: column;
      gap: 24px;
    }

    .divider {
      width: 66px;
      height: 1px;
    }
  }

  @media (max-width: 767px) {
    .advantages_title {
      font-size: 26px;
    }

    .advantage_value {
      font-size: 26px;
    }

    .advantage_icon {
      width: 100px;
    }

    .advantage_label {
      font-size: 14px;
    }
  }
</style>
