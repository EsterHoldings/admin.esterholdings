<template>
  <NuxtLink :to="props.path" class="header__link">
    <UiTextH4>{{ props.name }}</UiTextH4>
    <UiIconChevronRight />
  </NuxtLink>
</template>

<script setup>
import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
import UiIconChevronRight from "~/components/ui/UiIconChevronRight.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

const props = defineProps({
  name: String,
  path: String,
});
</script>

<style lang="scss" scoped>
.header__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: white;
  text-decoration: none;

  &:hover {
    color: var(--color-ui-warning);
  }
}
</style>
