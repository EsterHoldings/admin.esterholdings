<template>
  <UiIconLinkedIn @click="loginWithLinkedIn"/>
</template>

<script setup lang="ts">
import {navigateTo} from "nuxt/app";
import {useAppCore} from "~/composables/useAppCore";
import {useToast} from "vue-toastification";
import {useAuthStore} from "~/stores/authStore";
import UiIconLinkedIn from "~/components/ui/UiIconLinkedIn.vue";

const {public: pub} = useRuntimeConfig()
const {$recaptcha} = useNuxtApp()
const appCore = useAppCore();
const toast = useToast();

function loginWithLinkedIn() {
  localStorage.setItem("social_login_type", "linkedin");

  const clientId = pub.cliLinkIdIn;
  const redirectUri = `${pub.baseUrl}auth/callback`;
  const scope = "openid profile email";
  const state = crypto.randomUUID();


  const authUrl =
      "https://www.linkedin.com/oauth/v2/authorization?" +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

  const popup = window.open(authUrl, "linkedinLogin", "width=500,height=600");

  const popupListener = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(popupListener);
        return;
      }

      const search = popup.location.search;
      if (search.includes("code")) {
        const params = new URLSearchParams(search);
        const code = params.get("code");

        if (code) {
          popup.close();
          clearInterval(popupListener);

          handleLinkedInAuth(code);
        }
      }
    } catch (e) {
      // Ожидаем CORS до редиректа
    }
  }, 500);
}

async function handleLinkedInAuth(code: string) {
  // if (!(await $recaptcha('registration'))) {
  //   return
  // }
  try {
    const res = await appCore.auth.doSocialLogin({
      type: "linkedin",
      token: code,
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
    console.error("❌ Ошибка входа через LinkedIn:", e);
    toast.error("Ошибка входа через LinkedIn");
  }
}
</script>