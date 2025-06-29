<template>
  <UiIconGoogleOauth @click="loginWithGoogle"/>
</template>

<script setup lang="ts">

import {navigateTo} from "nuxt/app";
import {useAppCore} from "~/composables/useAppCore";
import {useAuthStore} from "~/stores/authStore";
import UiIconGoogleOauth from "~/components/ui/UiIconGoogleOauth.vue";
import {ref} from "vue";

const {public: pub} = useRuntimeConfig()
const {$recaptcha} = useNuxtApp()


const appCore = useAppCore();
const authStore = useAuthStore();


const clientId = `${pub.cliGoogle}`
const redirectUri = `${pub.baseUrl}auth/callback`;
const scope = "openid email profile";
const responseType = "id_token";

async function loginWithGoogle() {
  // if (!(await $recaptcha('registration'))) {
  //   return
  // }
  localStorage.setItem("social_login_type", "google");
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `nonce=${nonce}&` +
      `prompt=select_account`;

  const popup = window.open(authUrl, "googleLogin", "width=500,height=600");

  const popupListener = async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    const {id_token} = event.data;
    if (id_token) {
      await handleGoogleAuth(id_token);
      window.removeEventListener("message", popupListener);
    }
  };

  window.addEventListener("message", popupListener);
}

async function handleGoogleAuth(idToken: string) {
  try {
    const res = await appCore.auth.doSocialLogin({
      type: "google",
      token: idToken,
    });

    const responseData = res.data;

    const accessToken = await responseData.data.access_token;
    const refreshToken = await responseData.data.refresh_token;

    localStorage.setItem("user_access_token", accessToken);
    localStorage.setItem("user_refresh_token", refreshToken);

    authStore.setAccessToken(accessToken);
    authStore.setRefreshToken(refreshToken);

    navigateTo("/dashboard");
  } catch (e: any) {
    console.error("❌ Ошибка входа через Google:", e);
  }
}
</script>
