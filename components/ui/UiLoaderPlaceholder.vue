<template>
  <div class="placeholder">...</div>
</template>

<script lang="ts" setup>
const props = defineProps({

})
</script>

<style lang="scss" scoped>
.placeholder {
  width: 100%;
  height: 100%;
  background: rgba(200, 200, 200, 0.3);
  border-radius: 4px;
  animation: placeholder-blink 1.5s infinite ease-in-out;

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 10px;
  }
}
</style>