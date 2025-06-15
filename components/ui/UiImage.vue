<template>
  <img @click="handleClick" :id="props.id" :src="props.src" :alt="props.alt" />
</template>

<script lang="ts" setup>
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
