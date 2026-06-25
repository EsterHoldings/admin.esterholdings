import { defineNuxtPlugin } from "nuxt/app";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

export default defineNuxtPlugin({
  name: "admin-auth-bootstrap",
  enforce: "post",
  setup(nuxtApp) {
    nuxtApp.hook("app:mounted", () => {
      const adminAuthStore = useAdminAuthStore();

      if (!adminAuthStore.isAuthenticated) {
        return;
      }

      void adminAuthStore.initAuth({ force: true }).catch(error => {
        console.error("Failed to bootstrap admin auth:", error);
      });
    });
  },
});
