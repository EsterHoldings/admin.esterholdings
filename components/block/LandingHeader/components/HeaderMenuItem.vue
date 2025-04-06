<template>
  <div class="menu-category">
    <UiTextH6 class="menu-category_title">
      {{ props.title }}
      <div class="menu-category_line"></div>
    </UiTextH6>

    <UiTextH5
      class="menu-category_link"
      v-for="link in props.items"
      :key="link.name"
    >
      <NuxtLink :to="link.path">
        {{ link.name }}
      </NuxtLink>
    </UiTextH5>
  </div>
</template>

<script setup>
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const props = defineProps({
  title: String,
  items: Array,
});
</script>

<style lang="scss" scoped>
.menu-category {
  &_title {
    color: #b8b8c3;
  }

  &_line {
    margin-top: 10px;
    margin-bottom: 14px;
    width: 180px;
    height: 1px;
    background: rgb(184, 184, 195);
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
  }
}
</style>
