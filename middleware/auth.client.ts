import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to, from) => {
  if (!localStorage.getItem("user_access_token")) {
    return navigateTo("/auth/login");
  }
});
