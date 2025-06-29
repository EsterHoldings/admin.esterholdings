<template>
  <UiIconFacebook @click="loginWithFacebook"/>
</template>

<script setup lang="ts">
import {navigateTo} from "nuxt/app";
import {useAppCore} from "~/composables/useAppCore";
import {useToast} from "vue-toastification";
import {useAuthStore} from "~/stores/authStore";
import UiIconFacebook from "~/components/ui/UiIconFacebook.vue";

const {public: pub} = useRuntimeConfig()
const {$recaptcha} = useNuxtApp()


const appCore = useAppCore();
const toast = useToast();

async function loginWithFacebook() {
  // if (!(await $recaptcha('registration'))) {
  //   return
  // }

  localStorage.setItem("social_login_type", "facebook");
  const clientId = `${pub.cliFacebook}`;
  const redirectUri = `${pub.baseUrl}auth/callback`;
  const scope = "email,public_profile";
  const state = crypto.randomUUID();

  const authUrl =
      `https://www.facebook.com/v17.0/dialog/oauth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

  const popup = window.open(authUrl, "facebookLogin", "width=500,height=600");

  const popupListener = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(popupListener);
        return;
      }

      const hash = popup.location.hash;
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          popup.close();
          clearInterval(popupListener);

          handleFacebookAuth(accessToken);
        }
      }
    } catch (e) {
    }
  }, 500);
}

async function handleFacebookAuth(accessToken: string) {
  try {
    const res = await appCore.auth.doSocialLogin({
      type: "facebook",
      token: accessToken,
    });

    const authStore = useAuthStore();
    const responseData = await res.data;

    const accessTokenResult = responseData.data.access_token;
    const refreshToken = responseData.data.refresh_token;

    localStorage.setItem("user_access_token", accessTokenResult);
    localStorage.setItem("user_refresh_token", refreshToken);

    authStore.setAccessToken(accessTokenResult);
    authStore.setRefreshToken(refreshToken);

    navigateTo("/dashboard");
  } catch (e) {
    console.error("❌ Ошибка входа через Facebook:", e);
    toast.error("Ошибка входа через Facebook");
  }
}
</script>
