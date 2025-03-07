<template>
  <div class="trading-wrapper" :class="{ 'with-border': hasBorder }">
    <h2>
      {{ props.title }}
    </h2>
    <p>
      {{ props.subTitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: String,
  subTitle: String,
  hasBorder: Boolean,
});
</script>

<style lang="scss" scoped>
.trading-wrapper {
  width: 285px;
  padding: 14px 28px;
  border-radius: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;

  //   &:before {
  //     content: "";
  //     position: absolute;
  //     inset: 0;
  //     border-radius: 12px;
  //     padding: 2px;
  //     background: linear-gradient(to right, rgb(27, 99, 255), rgb(1, 22, 68));
  //     -webkit-mask: linear-gradient(white, white) content-box,
  //       linear-gradient(white, white);
  //     -webkit-mask-composite: xor;
  //     mask-composite: exclude;
  //     pointer-events: none;
  //   }

  &.with-border {
    border: 2px solid transparent;
    background-clip: padding-box;
    background: rgb(1, 22, 68);
  }

  &.with-border::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 2px;
    background: linear-gradient(to right, rgb(27, 99, 255), rgb(1, 22, 68));
    -webkit-mask: linear-gradient(white, white) content-box,
      linear-gradient(white, white);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  h2 {
    color: var(--color-ui-primary-defalt);
    font-size: 24px;
    font-weight: 700;
  }

  p {
    color: var(--color-ui-grey);
    font-size: 14px;
    font-weight: 400;
  }
}
</style>
