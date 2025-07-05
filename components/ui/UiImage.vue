<template>
  <div class="image-wrapper">
    <div v-if="!loaded" class="image-placeholder">
      <UiLoaderPlaceholder />
    </div>
    <img
        @click="handleClick"
        v-show="loaded"
        @load="onLoad"
        @error="onError"
        :id="id"
        :src="src"
        :alt="alt"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import UiLoaderPlaceholder from '~/components/ui/UiLoaderPlaceholder.vue'

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const loaded = ref(false)
const failed = ref(false)

function onLoad() {
  loaded.value = true
}
function onError() {
  loaded.value = false
  failed.value = true
}

function handleClick() {
  emit('click')
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  position: relative;
  display: block;
  cursor: pointer;
  overflow: hidden;
  background-color: var(--color-stroke-ui-dark);
  width: 100%;
  height: 100%;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity .2s ease-in;
  }

  .image-placeholder {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
