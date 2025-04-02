import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useUiStore = defineStore('ui', () => {
    const headerScrolled = false
    const showMenu = ref(false);


    return {headerScrolled, showMenu}
});