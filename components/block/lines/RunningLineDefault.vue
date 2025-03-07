<template>
  <div
    class="running-line"
    @mouseenter="stopAnimation"
    @mouseleave="startAnimation"
  >
    <div class="running-line__track" ref="track">
      <div
        v-for="(item, index) in duplicatedItems"
        :key="index"
        class="running-line__item"
      >
        <div class="ticker-block" v-if="props.news">
          <img :src="item.image" alt="news" class="ticker-block__image" />
          <div class="ticker-block__info">
            <span class="ticker-block__title">{{ item.title }}</span>
          </div>
        </div>

        <div class="ticker-block" v-else>
          <div class="ticker-block__info">
            <span class="ticker-block__title">{{ item.name }}</span>
            <span
              class="ticker-block__value"
              :class="{ up: item.change > 0, down: item.change < 0 }"
            >
              {{ item.price }}
              <span v-if="item.change > 0">▲</span>
              <span v-else-if="item.change < 0">▼</span>
              {{ item.change }}
            </span>
          </div>
          <UiButtonDefault state="success--outline"> Trade </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

const props = defineProps({
  items: Array,
  news: Boolean,
});

const duplicatedItems = computed(() => [...props.items, ...props.items]);

const track = ref<HTMLElement | null>(null);
let animationFrameId: number | null = null;
let position = ref(0);
const speed = 0.5; // roll speed

const animate = () => {
  if (track.value) {
    position.value -= speed;
    if (Math.abs(position.value) >= track.value.scrollWidth / 3) {
      position.value = 0;
    }
    track.value.style.transform = `translateX(${position.value}px)`;
    animationFrameId = requestAnimationFrame(animate);
  }
};

const startAnimation = () => {
  if (!animationFrameId) {
    animate();
  }
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

onMounted(startAnimation);
onUnmounted(stopAnimation);
</script>

<style scoped lang="scss">
.running-line {
  width: 100%;
  overflow: hidden;
  background-color: transparent;
  height: 80px;
  position: relative;
  display: flex;
}

.running-line__track {
  display: flex;
  white-space: nowrap;
  width: max-content;
  transition: transform 0.1s linear;
}

.running-line__item {
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.ticker-block {
  display: flex;
  align-items: center;
  background-color: #000d33;
  padding: 10px 15px;
  border-radius: 10px;
  height: 60px;
  //border: 1px solid #00ff00;
}

.ticker-block__info {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.ticker-block__title {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.ticker-block__value {
  font-size: 14px;
  color: #00ff00;
}

.ticker-block__value.up {
  color: #00ff00;
}

.ticker-block__value.down {
  color: #ff0000;
}

.ticker-block__trade {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.ticker-block__trade:hover {
  background: #00ff00;
  color: black;
}

.ticker-block__image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 10px;
}
</style>
