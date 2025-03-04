<template>
  <NuxtLink :to="props.path" class="header__link">
    <UiTextH5>{{ props.name }}</UiTextH5>
    <UiIconChevronDown />
  </NuxtLink>
</template>

<script setup>
import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
import UiTextH5Vue from "~/components/ui/UiTextH5.vue";

const props = defineProps({
  name: String,
  path: String,
});
</script>

<style lang="scss" scoped>
.header__link {
  display: flex;
  align-items: center;
  gap: 10px;

  color: white;
  text-decoration: none;

  &:hover {
    color: var(--color-ui-warning);
  }
}
</style>
