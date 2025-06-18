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
          :titles="buildTitle(index)"
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
import { companyMenuRoutes as routes } from "../composables/companyMenuRoutes";

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

const headerItems = tm(`landing.header.megaMenu.${props.activeLink}`);
const menuRoutes = routes(props.activeLink, t);

function buildTitle(sectionIndex) {
  const title = t(
    `landing.header.megaMenu.${props.activeLink}[${sectionIndex}].section`
  );
  return {
    name: title,
    path: menuRoutes[title]?.path ?? "#",
  };
}

function buildItems(sections, sectionIndex) {
  const titleList = t(
    `landing.header.megaMenu.${props.activeLink}[${sectionIndex}].section`
  );

  return sections.items.map((_, itemIndex) => ({
    name: t(
      `landing.header.megaMenu.${props.activeLink}[${sectionIndex}].items[${itemIndex}]`
    ),
    path: menuRoutes[titleList]?.list?.[itemIndex] ?? "#",
  }));
}
</script>

<style lang="scss" scoped>
.menu-wrapper {
  width: 225px;
  padding: 30px;
  background: var(--ui-background);
  border-radius: 16px;

  box-shadow: 0 0 40px rgba(0, 0, 0, 0.85), 0 0 60px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 128, 255, 0.2), 0 0 6px rgba(255, 255, 255, 0.08);

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
