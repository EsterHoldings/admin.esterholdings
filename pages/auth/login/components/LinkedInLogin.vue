<template>
  <UiIconLinkedIn @click="loginWithLinkedIn" />
</template>

<script setup lang="ts">
import { useToast } from "vue-toastification";
import { useAuthStore } from "~/stores/authStore";
import { navigateTo } from "nuxt/app";
import { useAppCore } from "~/composables/useAppCore";

const toast = useToast();
const authStore = useAuthStore();
const appCore = useAppCore();

function loginWithLinkedIn() {
  const clientId = "784gmiujlnm9h2";
  const redirectUri = "https://stage.esterholdings.website/auth/callback";
  const state = crypto.randomUUID();
  const scope = "r_liteprofile r_emailaddress";

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=token&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}&` +
    `scope=${encodeURIComponent(scope)}`;

  const popup = window.open(authUrl, "linkedinLogin", "width=500,height=600");

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
          handleLinkedInAuth(accessToken);
        }
      }
    } catch (e) {
      // Ничего не делаем — возможен CORS до момента полной загрузки
    }
  }, 500);
}

async function handleLinkedInAuth(accessToken: string) {
  try {
    const res = await appCore.auth.doSocialLogin({
      type: "linkedin",
      token: accessToken,
    });

    const responseData = await res.data;
    const accessTokenResult = responseData.data.access_token;

    localStorage.setItem("user_access_token", accessTokenResult);

    authStore.setAccessToken(accessTokenResult);

    toast.success("Вы вошли через LinkedIn");
    navigateTo("/dashboard");
  } catch (e) {
    console.error("❌ Ошибка входа через LinkedIn:", e);
    toast.error("Ошибка входа через LinkedIn");
  }
}
</script>
