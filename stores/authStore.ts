import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import useAppCore from "~/composables/useAppCore";
import { navigateTo } from "nuxt/app";
import {ROUTE_ADMIN_AUTH_LOGIN, ROUTE_AUTH_LOGIN} from "~/constants/routes";

export const useAuthStore = defineStore("userAuth", () => {
  const accessToken = ref<string>("");

  const user = ref<any>(null);
  const photoUrl = ref<string>("");

  if (process.client) {
    const storedAccessToken = localStorage.getItem("user_access_token");

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
    }
  }

  const isAuthenticated = computed<boolean>(() => {
    return accessToken.value !== "";
  });

  watch(accessToken, (newValue: string) => {
    if (process.client) {
      localStorage.setItem("user_access_token", newValue);
    }
  });

  function setAccessToken(value: string): void {
    localStorage.setItem("user_access_token", value);
    accessToken.value = value;
  }

  function setUser(userData: any): void {
    user.value = userData;
    photoUrl.value = userData.photo_url || "";
  }

  function setPhotoUrl(url: string): void {
    photoUrl.value = url;
  }

  async function initAuth(): Promise<void> {
    // if (!process.client) {
    //   return;
    // }
    // if (!accessToken.value) {
    //   return;
    // }

    // const appCore = useAppCore();
    // try {
    //   console.log('RUN RUN RUN CHECK IS AUTH')
    //   const response = await appCore.auth.doCheckIsAuth();
    //   setUser(response.data);
    // } catch (error) {
    //   // Якщо токен недійсний — логаут
    //   // - зробити рефреш токен
    //   console.log('REFRESH REFRESH REFRESH')
    //   const response = await appCore.auth.doRefresh();
    //   // - - если не успешно - тогда логаут
    //   console.log('LOGOUT LOGOUT LOGOUT', response)
    //   // await authLogout();
    // }
  }

  // Вихід (очищуємо токени, стан і повертаємо на сторінку логіну)
  async function authLogout(): Promise<void> {
    setAccessToken("");
    user.value = null;
    photoUrl.value = "";
    if (process.client) {
      localStorage.removeItem("user_access_token");
    }
    navigateTo('/ru' + ROUTE_AUTH_LOGIN);
  }

  return {
    accessToken,
    user,
    photoUrl,
    isAuthenticated,
    setAccessToken,
    setUser,
    setPhotoUrl,
    initAuth,
    authLogout,
  };
});
