<template>
  <section class="lates_updates">
    <UiContainer>
      <UiTextH3 class="lates_updates_title">Latest updates</UiTextH3>

      <div class="lates_updates_cards">
        <UiCard
          v-for="card in theNews"
          :key="card.src"
          :src="card.src"
          :title="card.title"
          :subTitle="card.subTitle"
          :time="card.time"
        />
      </div>

      <div class="help-block">
        <UiTextH4>
          Need Help? Visit our
          <a href="#" class="help-block__link">Help Section</a>
        </UiTextH4>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiCard from "~/components/ui/UiCard.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const theNews = ref([
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGiL_OXNaefDrdif97UBefC4OW4azk1cyOLQ&s",
    title: "NVIDIA shares soared 15% after the report",
    subTitle:
      "Chipmaker NVIDIA (NVDA) presented a quarterly report that exceeded all Wall Street expectations...",
    time: "15 min",
  },
  {
    src: "https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*",
    title: "Tesla announced a 1:10 stock split – quotes rose by 12%",
    subTitle:
      "The news sent shares up 12%, with Tesla now trading at $1,180 per share.",
    time: "30 min",
  },
  {
    src: "https://www.brookings.edu/wp-content/uploads/2021/06/shutterstock_1708749826_small.jpg?quality=75&w=1500",
    title: "Bitcoin crashes 12% after SEC announces ban on stablecoins",
    subTitle:
      "The US Securities and Exchange Commission (SEC) made a surprise announcement introducing new...",
    time: "1 hour ago",
  },
]);
</script>

<style lang="scss" scoped>
.lates_updates {
  &_title {
    text-align: center;
    color: var(--ui-text-main);
  }

  &_cards {
    margin-top: 50px;
    display: flex;
    align-items: baseline;
    gap: 30px;
  }
}

.help-block {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  background: transparent;
  padding: 10px 20px;
  text-align: center;
  position: relative;
  width: 100%;
  margin-top: 100px;
  transition: all 0.3s ease-in-out;
  border: 1px solid rgb(0, 55, 174);
  border-radius: 15px;

  h4 {
    color: var(--ui-text-main);
    font-weight: 700;
  }

  &:hover {
    border-color: rgba(42, 74, 245, 1);
  }
}

.help-block__link {
  color: #f75709;
  font-weight: 700;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease-in-out;
  font-size: inherit;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 767px) {
  .lates_updates_cards {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .help-block {
    margin-top: 50px;
  }
}
</style>
