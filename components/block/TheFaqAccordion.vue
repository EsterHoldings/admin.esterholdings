<template>
  <div class="faq-accordion">
    <div
      v-for="(item, index) in faqItems"
      :key="index"
      class="faq-item">
      <div
        class="faq-question"
        @click="toggleItem(index)">
        <h3 class="faq-title">{{ item.title }}</h3>
        <UiIconArrowDown :rotate180="item.isActive" />
      </div>

      <transition name="expand">
        <div
          v-if="item.isActive"
          class="faq-answer">
          <p>{{ item.description }}</p>
        </div>
      </transition>

      <div class="faq-divider"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref } from 'vue';
  import UiIconArrowDown from '~/components/ui/UiIconArrowDown.vue';


  interface IFaqItem {
    title: string;
    description: string;
    isActive: boolean;
  }

  const props = defineProps({
    items: {
      type: Array as PropType<IFaqItem[]>,
      required: true,
    },
  });

  const faqItems = ref<IFaqItem[]>(props.items);

  const toggleItem = (index: number) => {
    faqItems.value = faqItems.value.map((item, i) => ({
      ...item,
      isActive: i === index ? !item.isActive : false,
    }));
  };
</script>

<style lang="scss" scoped>
  .faq-accordion {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .faq-item {
    width: 100%;
    max-width: 450px;
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 12px 0;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  .faq-title {
    color: var(--ui-text-main);
    font-family: Muli, sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    flex: 1;
  }

  .faq-answer {
    padding: 0 0 16px 0;
    overflow: hidden;

    p {
      color: var(--ui-text-secondary);
      font-family: Muli, sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
      margin: 0;
    }
  }

  .faq-divider {
    height: 1px;
    width: 100%;
    background: var(--color-stroke-ui-dark);
    margin: 12px 0;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.3s ease;
    max-height: 200px;
  }

  .expand-enter-from,
  .expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding: 0;
  }
</style>
