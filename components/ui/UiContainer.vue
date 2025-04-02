<template>
  <div :class="{ container: !props.fluid, 'container-fluid': props.fluid }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  fluid: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.container {
  padding: 10px;
  margin: auto;
  height: 100%;
  width: 100%;
  z-index: 1;

  @media (min-width: 576px) {
    max-width: 540px;
  }
  @media (min-width: 768px) {
    max-width: 720px;
  }
  @media (min-width: 992px) {
    max-width: 960px;
  }
  @media (min-width: 1200px) {
    max-width: 1140px;
  }
  @media (min-width: 1400px) {
    max-width: 1197px;
  }
}
</style>
