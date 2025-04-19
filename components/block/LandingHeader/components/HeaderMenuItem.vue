<template>
  <div class="menu-category">
    <UiTextH6
      class="menu-category_title"
      :class="{ 'menu-category_title_mobile': props.isMobile }"
    >
      {{ props.title }}
      <div
        class="menu-category_line"
        :class="{ 'menu-category_line_mobile': props.isMobile }"
      ></div>
    </UiTextH6>

    <UiTextH5
      class="menu-category_link"
      :class="{ 'menu-category_link_mobile': props.isMobile }"
      v-for="link in props.items"
      :key="link.name"
    >
      <NuxtLink :to="link.path"> {{ link.name }}, {{ link.path }} </NuxtLink>
    </UiTextH5>
  </div>
</template>

<script setup>
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const props = defineProps({
  title: String,
  items: Array,
  isMobile: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.menu-category {
  &_mobile {
    width: 100%;
  }

  &_title {
    color: #b8b8c3;

    &_mobile {
      color: var(--ui-primary-accent);
      width: 100%;
      padding-top: 18px;
      padding-bottom: 12px;
    }
  }

  &_line {
    margin-top: 10px;
    margin-bottom: 14px;
    width: 180px;
    height: 1px;
    background: var(--color-stroke-ui);

    &_mobile {
      display: none;
    }
  }

  &_link {
    color: var(--ui-text-main);
    margin-bottom: 8px;

    a {
      color: inherit;
    }

    &:hover {
      transition: all 0.2s ease;
      color: var(--ui-primary-accent);
    }

    &_mobile {
      padding-left: 23px;
    }
  }
}
</style>
