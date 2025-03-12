import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAdminAuthStore } from '../stores/adminAuthStore'

export default defineNuxtRouteMiddleware((to, from) => {

    if (process.server) {
        console.log('Skip logic');
        return;
    }

    const adminAuthStore = useAdminAuthStore();

    console.log('*DUH@*DUH@#DUH@#*DU&H@#*&DH@*#&HD@*#&HD*@&H');
    console.log(adminAuthStore.accessToken);
    console.log('*DUH@*DUH@#DUH@#*DU&H@#*&DH@*#&HD@*#&HD*@&H');

    if (!!adminAuthStore.accessToken) {
        return navigateTo('/admin/access');
    }
});