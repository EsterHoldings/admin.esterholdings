<script setup lang="ts">
import {onMounted} from "vue";
import {useRouter, useRoute} from "vue-router";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";


const router = useRouter();


onMounted(async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));

  const code = queryParams.get("code");
  const idToken = hashParams.get("id_token");
  const error = queryParams.get("error") || hashParams.get("error");
  const loginType = localStorage.getItem("social_login_type");


  if (error) {
    console.error("Login error:", error);

    if (window.opener) {
      window.opener.postMessage({error}, window.location.origin);
      window.close();
    }

    return;
  }

  if (loginType === "google") {

    window.opener?.postMessage({id_token: idToken, type: "google"}, window.location.origin);
    window.close();
    return;
  }

  if (code && loginType) {
    try {
      const response = await $fetch("/api/login-via-social", {
        method: "POST",
        body: {
          type: loginType,
          token: code,
        },
      });

      localStorage.removeItem("social_login_type");
      await router.push("/dashboard");
    } catch (e) {
      console.error("Login failed:", e);
    }
  }
});
</script>

<template>
  <div class="loader">
    <UiIconSpinnerDefault/>

  </div>

</template>


<style scoped lang="scss">
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;

  svg {
    width: 75px;
    height: 75px;
  }
}
</style>


