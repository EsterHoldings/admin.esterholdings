<template>
  <UiIconGoogleOauth @click="loginWithGoogle" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { navigateTo } from "nuxt/app";
import { useAppCore } from "~/composables/useAppCore";
import { useAuthStore } from "~/stores/authStore";
import { useToast } from "vue-toastification";
import UiIconGoogleOauth from "~/components/ui/UiIconGoogleOauth.vue";

const appCore = useAppCore();
const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);

const clientId =
  "351197430667-flnael7gi4buja9a203e7rgebc6ug5dq.apps.googleusercontent.com";
const redirectUri = "http://localhost:3000/auth/callback";
const scope = "openid email profile";
const responseType = "id_token";

async function loginWithGoogle() {
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

    const { id_token } = event.data;
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
