<template>
  <UiContainer :class="{ 'menu-wrapper-mobile': props.isMobile }">
    <div
      class="menu-wrapper"
      :class="{ 'menu-wrapper-mobile': props.isMobile }"
    >
      <div class="menu-grid" :class="{ 'menu-mobile': props.isMobile }">
        <HeaderMenuItem
          v-for="[title, items] in Object.entries(props.headerItems)"
          :key="title"
          :title="title"
          :items="items"
          :isMobile="props.isMobile"
        />

        <div
          class="menu-banner"
          :class="{ 'menu-banner_mobile': props.isMobile }"
        >
          BANNER
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script setup>
import UiContainer from "~/components/ui/UiContainer.vue";
import HeaderMenuItem from "~/components/block/LandingHeader/components/HeaderMenuItem.vue";

const props = defineProps({
  headerItems: {
    type: Object,
    default: () => ({}),
  },

  isMobile: {
    type: Boolean,
    default: false,
  },
});

console.log("headerItems", props.headerItems);
</script>

<style lang="scss" scoped>
.menu-wrapper {
  padding: 30px;
  background: var(--ui-background);
  border-radius: 16px;

  &-mobile {
    padding: 0px;
  }
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: auto;
  gap: 40px 32px;
  position: relative;
  align-items: baseline;
}

.menu-banner {
  grid-column: 3 / span 2;
  height: 200px;
  background: var(--color-stroke-ui);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;

  &_mobile {
    display: none;
  }
}

.menu-mobile {
  display: flex;
  flex-direction: column;
}
</style>
