<template>
  <div class="user-documents__wrapper">
    <div class="user-documents__left">
      <PanelDefault class="user-documents-uploader">
        Error loading component...
      </PanelDefault>
    </div>
    <div class="user-documents__right">
      <PanelDefault class="user-documents__right__panel">
        ...
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PanelDefault from '~/components/block/panels/PanelDefault.vue'
</script>

<style lang="scss" scoped>
.user-documents {
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

.btn-delete {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  color: #fff;
  height: 30px;
  width: 30px;
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 3;
  border: 1px solid var(--color-stroke-ui-dark);

  &:hover {
    background: #ef4444;
  }

  &::before {
    content: "×";
    display: flex;
    justify-content: center;
    font-size: 18px;
    height: 30px;
    align-items: center;
    margin-top: -2px;
    width: 30px;
    text-align: center;
    color: #fff;
    border-radius: 50%;
    transform: translate(-0.06rem, -0.06rem);
  }
}

.user-photo-uploader {
  margin: 0 auto;
  text-align: center;
  padding: 20px;

  .title {
    margin-bottom: 20px
  }

  .uploader-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center
  }

  .avatar-preview, .avatar-placeholder {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 10px;
    background: var(--color-ui-background);
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      border-radius: 10px;
    }
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover
  }

  .icon {
    font-size: 2.5rem;
    color: #9ca3af
  }

  .actions {
    gap: 20px;
    display: flex;
    flex-direction: column;

    .btn-select {
      cursor: pointer;
    }

    .btn-upload {
      cursor: pointer;
    }
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--color-ui-primary-defalt);
    border-radius: 3px;
    overflow: hidden;

    .progress {
      height: 100%;
      background: #3b82f6;
      transition: width .2s
    }
  }

  .error {
    color: #dc2626;
    margin-top: 8px
  }
}
</style>