<template>
  <section class="features_section">
    <div class="features_container">
      <div
        class="feature_item"
        v-for="(feature, index) in features"
        :key="index"
      >
        <div class="feature_icon">
          <img :src="feature.icon" alt="Feature Icon" />
        </div>
        <h3 class="feature_title" v-html="feature.title"></h3>
        <p class="feature_description">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const features = ref([
  {
    icon: "/static/landing/features/wrench.png",
    title: "Instruments",
    description: "Forex/Spot Shares/Indices",
  },
  {
    icon: "/static/landing/features/bank.png",
    title: "Liquidity:<br><strong>200+ Top-Level</strong>",
    description: "Financial institutions",
  },
  {
    icon: "/static/landing/features/chart.png",
    title: "Floating Spread",
    description: "from 0 pips",
  },
  {
    icon: "/static/landing/features/wrench.png",
    title: "Limit and Stop Levels",
    description: "= 0",
  },
  {
    icon: "/static/landing/features/server.png",
    title: "Fastest Server Technologies",
    description: "with high order processing speeds",
  },
  {
    icon: "/static/landing/features/security.png",
    title: "Bank's Security",
    description: "of trading accounts",
  },
]);
</script>

<style lang="scss" scoped>
.features_section {
  margin-top: 150px;
  margin-bottom: 150px;
  padding: 50px 20px;
  display: flex;
  justify-content: center;
}

.features_container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 100%;
  gap: 20px;
}

.feature_item {
  flex: 1;
  max-width: 180px;
  text-align: center;
  color: white;
}

.feature_icon {
  background-color: #0033cc;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  margin: 0 auto 10px;
}

.feature_icon img {
  width: 40px;
  height: 40px;
}

.feature_title {
  font-size: 16px;
  font-weight: bold;
}

.feature_description {
  font-size: 14px;
  opacity: 0.8;
}
</style>
