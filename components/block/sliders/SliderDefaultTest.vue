<template>
  <div>
    <div class="slider-default">
      <div class="slider-default__slides">
        <div
          v-for="(Comp, index) in components"
          :key="images[index]?.id || index"
          class="slider-default__item"
          :class="{ active: index === currentSlide }"
        >
          <UiImage
            v-if="images[index] && images[index].src"
            :src="images[index].src"
            :alt="images[index].alt"
            class="slider-default__item_image"
          />

          <component :is="Comp" />
        </div>
      </div>

      <div class="slider-default__dots">
        <span
          v-for="(_, index) in components"
          :key="images[index]?.id || index"
          class="slider-default__dot"
          :class="{ active: index === currentSlide }"
          @click="goToSlide(index)"
        />
      </div>
    </div>

    <div class="welcome__running-line-default">
      <RunningLineDefault :items="items" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import type { PropType, DefineComponent } from "vue";
import UiImage from "~/components/ui/UiImage.vue";
import RunningLineDefault from "~/components/block/lines/RunningLineDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

import useTrackScroll from "~/components/block/LandingHeader/composables/trackScroll";

const { isSlideWithoutPicture, checkPicture } = useTrackScroll();

const props = defineProps({
  images: {
    type: Array as PropType<{ id: string; alt: string; src: string }[]>,
    required: true,
  },
  components: {
    type: Array as PropType<DefineComponent<{}, {}, any>[]>,
    required: true,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
  autoPlayInterval: {
    type: Number,
    default: 3000,
  },
});

const items = ref([
  { name: "EURUSD", price: 1.04282, change: 0.00014 },
  { name: "GBPUSD", price: 1.25267, change: -0.00016 },
  { name: "US30", price: 44674.97, change: 1.28 },
  { name: "ETHUSD", price: 2655.08, change: -6.84 },
  { name: "WTI", price: 71.11, change: 0.21 },
]);

const currentSlide = ref(0);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.components.length;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

let intervalId: ReturnType<typeof setInterval> | null = null;

function startAutoPlay() {
  intervalId = setInterval(nextSlide, props.autoPlayInterval);
}
function stopAutoPlay() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

watch(currentSlide, (newIndex) => {
  checkPicture(props.images, newIndex);
});

onMounted(() => {
  if (props.autoPlay) startAutoPlay();
  checkPicture(props.images, currentSlide.value);
});
onUnmounted(stopAutoPlay);
</script>

<style scoped lang="scss">
.slider-default {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__slides {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &__item {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 3s ease;

    &.active {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__item_image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  &__dots {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 2;
  }

  &__dot {
    width: 30px;
    height: 6px;
    background-color: #aaa;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;

    &.active {
      background-color: #054adf;
    }
  }
}
</style>
