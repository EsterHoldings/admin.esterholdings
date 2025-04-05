<template>
  <UiContainer>
    <div class="menu-wrapper">
      <div class="menu-grid">
        <HeaderMenuItem
          v-for="[title, items] in Object.entries(headerItems)"
          :key="title"
          :title="title"
          :items="items"
        />

        <div class="menu-banner">BANNER</div>
      </div>
    </div>
  </UiContainer>
</template>

<script setup>
import UiContainer from "~/components/ui/UiContainer.vue";
import HeaderMenuItem from "~/components/block/LandingHeader/components/HeaderMenuItem.vue";

const headerItems = {
  "Account overview": [
    { name: "Standard", path: "#" },
    { name: "Pro", path: "#" },
    { name: "Islamic", path: "#" },
    { name: "Demo", path: "#" },
  ],

  "Market Instruments": [
    { name: "Forex", path: "#" },
    { name: "Metals", path: "#" },
    { name: "Stock CFDs", path: "#" },
    { name: "Crypto CFDs", path: "#" },
    { name: "Commodities", path: "#" },
    { name: "Indices", path: "#" },
    { name: "ETFs", path: "#" },
  ],
  Platform: [
    { name: "MT4 Desktop", path: "#" },
    { name: "MT 4 Mobile", path: "#" },
  ],

  "Trading conditions": [
    { name: "Account replenishment", path: "#" },
    { name: "Withdrawal of funds", path: "#" },
  ],

  "Trader's HUB": [
    { name: "Trader's blog", path: "#" },
    { name: "Economic calendar", path: "#" },
    { name: "Market news", path: "#" },
  ],
  "TANDEM trading": [
    { name: "For trader", path: "#" },
    { name: "For investor", path: "#" },
  ],
};
</script>

<style lang="scss" scoped>
.menu-wrapper {
  padding: 30px;
  background: var(--ui-background);
  border-radius: 16px;
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
}
</style>
