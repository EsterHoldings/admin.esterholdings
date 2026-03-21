<template>
  <svg :class="{'rotate-to-right': props.rotateToRight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" viewBox="0 0 20 20">
    <g>
      <path
          d="M19.7609,18.4365C20.0912,18.806,20.0775,19.3734,19.7296,19.726C19.3818,20.0787,18.8222,20.0926,18.4576,19.7577L9.48463,10.6607C9.12536,10.2956,9.12536,9.70454,9.48463,9.33942L18.4576,0.242395C18.8222,-0.0926368,19.3819,-0.0787377,19.7298,0.273985C20.0777,0.626709,20.0914,1.19415,19.7609,1.5637L11.4453,10.0059L19.7609,18.4365ZM10.5342,18.4365C10.8645,18.806,10.8508,19.3734,10.5029,19.726C10.155,20.0787,9.59545,20.0926,9.23091,19.7577L0.269455,10.6724C-0.089818,10.3073,-0.089818,9.71625,0.269455,9.35113L9.24243,0.254097C9.60695,-0.080941,10.1666,-0.0670528,10.5146,0.285663C10.8625,0.638377,10.8762,1.20581,10.5457,1.57538L2.21858,10.0059L10.5342,18.4365Z"
          fill="currentColor" fill-opacity="1"/>
    </g>
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
  rotateToRight: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
svg {
  height: 20px;
  width: 20px;
  fill: currentColor;
  transition: .3s;
}

.rotate-to-right {
  transition: .3s;
  transform: rotate(180deg);
}
</style>
