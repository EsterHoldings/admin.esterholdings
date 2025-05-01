<template>
  <NuxtLink :to="props.path" class="header__link" :class="linkClass">
    <UiTextH5 :class="textClass">{{ props.name }}</UiTextH5>

    <UiIconChevronUp v-if="isActive" :class="iconUpClass" />

    <UiIconChevronDown v-else :class="iconDownClass" />
  </NuxtLink>
</template>

<script setup>
import { computed } from "vue";
import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const props = defineProps({
  name: String,
  path: String,
  activeLink: String,
  isInvertColor: Boolean,
});

const isActive = computed(() => props.name === props.activeLink);

const linkClass = computed(() => ({
  "active-link": isActive.value,
}));

const textClass = computed(() => ({
  "active-link": isActive.value,
  "is-theme-light": props.isInvertColor,
}));

const iconUpClass = computed(() => ({
  "active-link": isActive.value,
  "svg-fill": props.isInvertColor,
}));

const iconDownClass = computed(() => ({
  "svg-fill": props.isInvertColor,
}));
</script>

<style lang="scss" scoped>
.header__link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;

  &:hover {
    color: #f75709;

    svg {
      fill: currentColor;
    }
  }
}

.active-link {
  color: #f75709 !important;

  svg {
    fill: currentColor;
  }
}

.svg-fill {
  color: black;
  fill: currentColor;
}

.is-theme-light {
  color: #151515;
}
</style>
