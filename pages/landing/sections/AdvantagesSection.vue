<template>
  <section class="advantages_section">
    <div class="advantages_container">
      <div
        class="advantage_wrapper"
        v-for="(item, index) in advantages"
        :key="index"
      >
        <div class="advantage_item">
          <UiTextH3 class="bold">{{ item.value.body.static }}</UiTextH3>
          <UiTextH6 class="advantage_item_subtitle">
            {{ item.label.body.static }}
          </UiTextH6>
        </div>

        <div class="divider" v-if="index !== advantages.length - 1"></div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

const { tm } = useI18n();
const advantages = tm("advantages");
</script>

<style lang="scss" scoped>
.advantages_section {
  margin-top: 150px;
  margin-bottom: 150px;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.advantages_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  width: 100%;
}

.advantage_wrapper {
  display: flex;
  align-items: center;
  gap: 100px;
}

.advantage_item {
  text-align: center;
  color: var(--ui-text-main);
  flex: 1;

  &_subtitle {
    color: var(--ui-text-secondary);
  }
}

.advantage_item h2 {
  font-size: 28px;
  font-weight: bold;
}

.advantage_item p {
  font-size: 14px;
  opacity: 0.8;
}

.divider {
  width: 1px;
  height: 50px;
  background: var(--color-stroke-ui);
}

@media (max-width: 991px) {
  .advantages_section {
    margin-top: 50px;
    margin-bottom: 50px;
    padding: 20px;
  }

  .advantages_container {
    flex-direction: column;
  }

  .advantage_wrapper {
    flex-direction: column;
    gap: 24px;
  }

  .divider {
    transform: rotate(90deg);
  }
}

@media (max-width: 767px) {
  .advantage_item {
    h3 {
      font-size: 26px;
    }
  }
}
</style>
