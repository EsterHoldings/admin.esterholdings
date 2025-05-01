<template>
  <div class="slider-default">
    <!-- Слайди -->
    <div class="slider-default__slides">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="slider-default__item"
        :class="{ active: index === currentSlide }"
      >
        <UiImage
          :src="image.src"
          :alt="image.alt"
          class="slider-default__item_image"
        />
      </div>
    </div>

    <div class="slider-default__dots">
      <span
        v-for="(image, index) in images"
        :key="image.id"
        class="slider-default__dot"
        :class="{ active: index === currentSlide }"
        @click="goToSlide(index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { PropType } from "vue";
import UiImage from "~/components/ui/UiImage.vue";

const props = defineProps({
  images: {
    type: Array as PropType<{ id: string; alt: string; src: string }[]>,
    default: () => [
      {
        id: "10da97ee-9b49-44c2-8097-f7bb63dd3991",
        alt: "Image 1",
        src: "/static/welcome-first-slide.webp",
      },
      {
        id: "10da97ee-9b49-44c2-8097-f7bb63dd3992",
        alt: "Image 2",
        src: "/static/welcome-first-slide.webp",
      },
      {
        id: "10da97ee-9b49-44c2-8097-f7bb63dd3993",
        alt: "Image 3",
        src: "/static/welcome-first-slide.webp",
      },
      // {
      //   id: "c244e49e-ef40-4b93-8604-eca0d9615e5b",
      //   alt: "Image 2",
      //   src: "/static/welcome-second-slide.webp",
      // }
    ],
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

const currentSlide = ref(0);

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.images.length;
};
const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + props.images.length) % props.images.length;
};
const goToSlide = (index: number) => {
  currentSlide.value = index;
};

let intervalId: ReturnType<typeof setInterval> | null = null;

function startAutoPlay() {
  intervalId = setInterval(() => {
    nextSlide();
  }, props.autoPlayInterval);
}

function stopAutoPlay() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

onMounted(() => {
  if (props.autoPlay) {
    startAutoPlay();
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped lang="scss">
.slider-default {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &__slides {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__item {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 3s ease;
  }

  &__item.active {
    opacity: 1;
    z-index: 1;
  }

  &__item_image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
    z-index: 1;
  }

  &__dots {
    position: absolute;
    bottom: 40px;
    display: flex;
    justify-content: center;
    gap: 8px;
    z-index: 1;
  }

  &__dot {
    height: 8px;
    background-color: #333333;
    width: 40px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  &__dot.active {
    background-color: #cccccc;
  }
}
</style>
