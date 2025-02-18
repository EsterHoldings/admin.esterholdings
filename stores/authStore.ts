import { type Ref, computed, ref } from "vue";
import { defineStore } from "pinia";
import { getItem as getItemFromCookieStorage } from "~/utils/storage/cookie";
import {
  COOKIE_STORAGE__ACCESS_TOKEN,
  COOKIE_STORAGE__REFRESH_TOKEN,
} from "~/constants/storage";

export const useAuthStore = defineStore("auth", () => {
  const accessToken: Ref<string> = ref(
    getItemFromCookieStorage(COOKIE_STORAGE__ACCESS_TOKEN) || ""
  );
  const refreshToken: Ref<string> = ref(
    getItemFromCookieStorage(COOKIE_STORAGE__REFRESH_TOKEN) || ""
  );

  const isAuthenticated = computed(() => !!accessToken.value);

  const setAccessToken = (value: string): void => {
    accessToken.value = value;
  };

  const setRefreshToken = (value: string): void => {
    refreshToken.value = value;
  };

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
  };
});
