<template>
  <div class="header-mobile">
    <NuxtLink
      :to="props.path"
      class="header__link"
      :class="{ header__link_active: props.name === props.activeLink }"
    >
      <UiTextH5>{{ props.name }}</UiTextH5>

      <UiIconChevronUp v-if="props.name === props.activeLink" />
      <UiIconChevronDown v-else />
    </NuxtLink>

    <div class="header__underline"></div>

    <HeaderMenu
      v-if="props.headerItems && props.name === props.activeLink"
      :headerItems="props.headerItems"
      isMobile
      class="header-mobile_menu"
    />
  </div>
</template>

<script setup>
import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";

const props = defineProps({
  name: String,
  path: String,
  headerItems: {
    type: Object,
    default: () => ({}),
  },
  activeLink: String,
});
</script>

<style lang="scss" scoped>
.header__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--ui-text-main);
  text-decoration: none;
  padding-bottom: 18px;

  &:hover {
    color: var(--ui-primary-accent);
  }

  &_active {
    color: var(--ui-primary-accent);
  }
}

.header__underline {
  height: 1px;
  width: 100%;
  background: var(--color-stroke-ui);
  margin-bottom: 16px;
}
</style>
