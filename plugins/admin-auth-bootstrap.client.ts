import { defineNuxtPlugin } from "nuxt/app";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

export default defineNuxtPlugin(async () => {
  const adminAuthStore = useAdminAuthStore();

  if (!adminAuthStore.isAuthenticated) {
    return;
  }

  try {
    await adminAuthStore.initAuth({ force: true });
  } catch (error) {
    console.error("Failed to bootstrap admin auth:", error);
  }
});
