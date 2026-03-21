<template>
  <div class="switch__wrapper">
    <div
        class="switch"
        :class="{ 'active': modelValue, 'is-disabled': disabled }"
        @click="toggle"
    >
      <div class="switch__thumb" :class="{ 'active': modelValue }"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue", "change"]);

const toggle = () => {
  if (props.disabled) {
    return;
  }

  const newValue = !props.modelValue;
  emit("update:modelValue", newValue);
  emit("change", newValue);
};
</script>

<style lang="scss" scoped>
.switch {
  width: 40px;
  min-width: 40px;
  height: 25px;
  background: #ddd;
  border-radius: 17px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7);

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &.active {
    background: #4CAF50;
  }

  &__wrapper {
    padding: 0 10px;
    box-sizing: border-box;
  }
}

.switch__thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease-in-out;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);

  &.active {
    transform: translateX(16px);
  }
}
</style>
