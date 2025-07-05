<template>
  <div class="image-circle">
    <span v-if="props.src === null || props.src.length === 0">{{twoChars}}</span>
    <UiImage v-if="props.src?.length > 0" :src="props.src" />
  </div>
</template>

<script lang="ts" setup>
import UiImage from "~/components/ui/UiImage.vue";

const props = defineProps({
  twoChars: {
    type: String,
    default: "AA"
  },
  src: {
    type: String,
    default: ""
  }
});
</script>

<style lang="scss" scoped>
.image-circle {
  border: 1px solid var(--color-stroke-ui-dark);
  background-color: #f4f4f4;
  color: #1a1d20;
  border-radius: 50%;
  height: 50px;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
</style>