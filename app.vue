<template>
  <NuxtLayout>

    <ModalRightSideDefault ref="modalRef">
      <component :is="modalContent" v-bind="modalProps" :key="modalKey"/>
    </ModalRightSideDefault>

    <VitePwaManifest />
    <NuxtPage/>

  </NuxtLayout>
</template>

<script lang="ts" setup>
import {ref, provide, onMounted} from "vue";
import { useHead } from "#imports";

import ModalRightSideDefault from "./components/block/modals/ModalRightSideDefault.vue";
import {useThemeStore} from './stores/themeStore'

import "vue-draggable-resizable/style.css";

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

useHead({
  meta: [
    { name: "theme-color", content: "#000028" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black" },
  ],
});

onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">

</style>
