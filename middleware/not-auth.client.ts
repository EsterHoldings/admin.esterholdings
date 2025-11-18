import {defineNuxtRouteMiddleware, navigateTo} from "nuxt/app";

export default defineNuxtRouteMiddleware(() => {
  if (!!localStorage.getItem('user_access_token'))
    return navigateTo("/dashboard");
});
