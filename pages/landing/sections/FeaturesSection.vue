<template>
  <section class="features_section">
    <UiTextH3 class="features_section_title">Why Choose Us?</UiTextH3>
    <div class="features_container">
      <div
        class="feature_item"
        v-for="(feature, index) in features"
        :key="index"
      >
        <div class="feature_icon">
          <UiIconPoligon
            class="feature_icon-bg"
            :background-fill="
              themeStore.currentTheme === 'light' ? '#F9F9F9' : '#031743'
            "
          />

          <div class="img">
            <img :src="feature.icon" alt="Feature Icon" />
          </div>
        </div>
        <h3 class="feature_title" v-html="feature.title"></h3>
        <p class="feature_description">{{ feature.description }}</p>
      </div>
    </div>

    <div class="features_section__running-line-default">
      <RunningLineDefault :items="items" news />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useThemeStore } from "~/stores/themeStore";
import RunningLineDefault from "~/components/block/lines/RunningLineDefault.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

const themeStore = useThemeStore();

const features = ref([
  {
    icon: "/static/F-Wrench & Screwdriver.png",
    // icon: UiIconInstruments,
    title: "Instruments",
    description: "Forex/Spot Shares/Indices",
  },
  {
    // icon: UiIconLiquidity,
    icon: "static/F-Building Library.png",
    title: "Liquidity:<br><strong>200+ Top-Level</strong>",
    description: "Financial institutions",
  },
  {
    // icon: UiIconFloating,
    icon: "/static/F-Money.png",
    title: "Floating Spread",
    description: "from 0 pips",
  },
  {
    // icon: UiIconLimitStopLevels,
    icon: "/static/LIMIT AND STOP LEVELS.png",
    title: "Limit and Stop Levels",
    description: "= 0",
  },
  {
    // icon: UiIconBlueRocket,
    icon: "/static/F-Rocket.png",
    title: "Fastest Server Technologies",
    description: "with high order processing speeds",
  },
  {
    // icon: UiIconSecurity,
    icon: "/static/L-Shield Done.png",
    title: "Bank's Security",
    description: "of trading accounts",
  },
]);

const items = ref([
  {
    title: "Bitcoin crashes 12% after SEC announces ban on stablecoins",
    image:
      "https://render.fineartamerica.com/images/rendered/default/flat/beach-towel/images/artworkimages/medium/1/pixel-bitcoin-concept-allan-swart.jpg?&targetx=0&targety=-76&imagewidth=952&imageheight=628&modelwidth=952&modelheight=476&backgroundcolor=52514D&orientation=1&producttype=beachtowel-32-64",
  },
  {
    title: "Tesla announced a 1:10 stock split – quotes rose by 12%",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4L9_huULFPV-ewqaz3Hpf9iGK0njUL-HvHQ&s",
  },
  {
    title:
      "Dow Jones plummets 1,200 points after unexpected rise in US inflation",
    image:
      "https://d1-invdn-com.investing.com/content/07858a634c1563800bd81d442dfd96cf.png",
  },
  {
    title: "NVIDIA shares soared 15% after the report",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9ecfGnvuktF2LkwRKXrzXlJfAKQ_Os9Vqrw&s",
  },
]);
</script>

<style lang="scss" scoped>
.features_section {
  position: relative;
  padding: 50px 20px;
  margin-top: 138px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 70px;

  &__running-line-default {
    position: absolute;
    top: -100px;
    left: 0;
    right: 0;
  }

  &_title {
    color: var(--ui-text-main);
  }
}

.features_container {
  display: flex;
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

  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature_icon {
  position: relative;
  width: 122px;
  height: 139px;
  display: flex;
  align-items: center;
  justify-content: center;

  .img {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;

    img {
      width: 260px;
      height: 260px;
    }
  }
}

.feature_title {
  margin-top: 15px;
  font-size: 20px;
  font-weight: bold;
  color: var(--ui-text-main);
}

.feature_description {
  margin-top: 5px;
  font-size: 16px;
  color: var(--ui-text-secondary);
}

@media (max-width: 1199px) {
  .features_section {
    margin-top: 50px;
  }
}

@media (max-width: 991px) {
  .feature_title {
    font-size: 16px;
  }

  .feature_description {
    font-size: 13px;
  }
}
</style>
