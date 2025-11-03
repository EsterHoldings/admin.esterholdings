import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const headerScrolled = false;
  const showMenu = ref(false);

  const toggleMenu = () => {
    return (showMenu.value = !showMenu.value);
  };

  return { headerScrolled, showMenu, toggleMenu };
});
