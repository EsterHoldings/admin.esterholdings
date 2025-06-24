import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) {
    console.log("Skip logic");
    return;
  }

  const adminAuthStore = useAdminAuthStore();

  console.log('ADMIN LOGIN MIDDLEWARE');

  // if (!!adminAuthStore.accessToken) {
  //   return navigateTo("/admin/auth/login");
  // }
});
