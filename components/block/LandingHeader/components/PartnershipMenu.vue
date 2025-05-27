<template>
  <UiContainer :class="{ 'menu-wrapper-mobile': props.isMobile }">
    <div
      class="menu-wrapper"
      :class="{ 'menu-wrapper-mobile': props.isMobile }"
    >
      <div class="menu-grid" :class="{ 'menu-mobile': props.isMobile }">
        <HeaderMenuItem
          v-for="(section, index) in headerItems"
          :key="section.section"
          :title="
            t(`landing.header.megaMenu.${props.activeLink}[${index}].section`)
          "
          :items="buildItems(section, index)"
          :isMobile="props.isMobile"
        />
      </div>
    </div>
  </UiContainer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import UiContainer from "~/components/ui/UiContainer.vue";
import HeaderMenuItem from "~/components/block/LandingHeader/components/HeaderMenuItem.vue";
import { tradingMenuRoutes as routes } from "../composables/tradingMenuRoutes";

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },

  activeLink: {
    type: String,
  },
});

const { t, tm } = useI18n();

const headerItems = tm(`landing.header.megaMenu.Partnership`);

console.log("ITEM", headerItems);

function buildItems(section, sectionIndex) {
  return section.items.map((_, itemIndex) => ({
    name: t(
      `landing.header.megaMenu.${props.activeLink}[${sectionIndex}].items[${itemIndex}]`
    ),
    path: routes[section.section]?.[itemIndex] ?? "#",
  }));
}
</script>

<style lang="scss" scoped>
.menu-wrapper {
  width: 225px;
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
