<template>
  <svg viewBox="0 0 50 50" xml:space="preserve">
    <circle cx="25" cy="25" r="23"/>
    <polyline points="16,34 25,25 34,16"/>
    <polyline points="16,16 25,25 34,34"/>
</svg>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
svg {
  height: 24px;
  width: 24px;
  overflow: visible;

  circle {
    fill: none;
    stroke: red;
    stroke-width: 4px;
  }

  polyline {
    fill:none;
    stroke: red;
    stroke-width:3;
    stroke-linecap:round;
    stroke-linejoin:round;
    stroke-miterlimit:10;
  }
}
</style>