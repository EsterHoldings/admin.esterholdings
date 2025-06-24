import { useAdminAuthStore } from "../stores/adminAuthStore";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { ROUTE_ADMIN_AUTH_LOGIN } from "../constants/routes";
export default defineNuxtRouteMiddleware((to, from) => {
  const adminAuthStore = useAdminAuthStore();

  console.log('ADMIN MIDDLEWARE');

  if (!adminAuthStore.isAuthenticated) {
    return navigateTo(ROUTE_ADMIN_AUTH_LOGIN);
  }
});
