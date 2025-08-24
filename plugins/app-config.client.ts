import { defineNuxtPlugin } from "nuxt/app"
import { useI18n } from "vue-i18n";
import { useBackendConfig } from "~/composables/useBackendConfig";

export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchConfig, config } = useBackendConfig();

  try {
    await fetchConfig();


    console.log(
      'CONFIGURE___',
      config.value,
      // nuxtApp.$config.public.i18n,
      // i18n.messages.value
    );

    if (!config.value) {
      console.warn('⚠️ No configuration loaded')
      return;
    }

    console.log('✅ Backend configuration loaded successfully');

  } catch (e) {

  }

})