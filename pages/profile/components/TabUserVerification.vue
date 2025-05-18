<template>
  <div class="user-verification__wrapper">
    <div class="user-verification__left">
      <PanelDefault class="user-photo-uploader">
        Verification status
      </PanelDefault>
    </div>
    <div class="user-verification__right">
      <PanelDefault class="user-photo__right__panel">
        Verification history...
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
</script>

<style lang="scss" scoped>
.user-verification {
  &__wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }
  &__left {
    width: 50%;

    &>div {
      padding: 20px;
    }
  }
  &__right {
    width: 50%;

    &>div {
      padding: 20px;
    }

    &__panel {
      padding: 20px;
      height: 100%;
      width: 100%;
    }
  }
}
</style>