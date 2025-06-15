<template>
  <p @click="handleClick"><slot/></p>
</template>

<script lang="ts" setup>
const emit = defineEmits(["click"]);
const handleClick = (): void => emit("click");
</script>

<style lang="scss" scoped>
p {
  color: var(--ui-text-main);
  font-weight: 300;
  font-size: 14px;
  line-height: 17px;
}
</style>
