<template>
  <NuxtLayout>

    <ModalRightSideDefault ref="modalRef">
      <component :is="modalContent" v-bind="modalProps" :key="modalKey"/>
    </ModalRightSideDefault>

    <NuxtPage/>

  </NuxtLayout>
</template>

<script lang="ts" setup>
import {ref, provide, onMounted} from "vue";

import ModalRightSideDefault from "./components/block/modals/ModalRightSideDefault.vue";
import {useThemeStore} from './stores/themeStore'

const modalRef = ref();
const modalContent = ref(null);
const modalProps = ref({});
const modalKey = ref(0);

const openModal = (component: any, props = {}) => {
  modalContent.value = component;
  modalProps.value = props;
  modalKey.value++;
  modalRef.value?.openCloseModal();
};

const closeModal = () => modalRef.value?.closeModal()

provide("modalControl", {openModal, closeModal});

onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
</script>

<style lang="scss" scoped></style>
