import { defineNuxtPlugin } from "nuxt/app";
import { clearAdminBootRecoveryFlag, isAdminAssetFailure, recoverAdminBoot } from "~/utils/adminBootRecovery";

export default defineNuxtPlugin(nuxtApp => {
  const recover = async (reason: string) => {
    await recoverAdminBoot(reason);
  };

  window.addEventListener("vite:preloadError", event => {
    event.preventDefault();
    void recover("vite preload error");
  });

  window.addEventListener(
    "error",
    event => {
      const target = event.target as HTMLElement | null;
      const isAssetError =
        target?.tagName === "SCRIPT" || target?.tagName === "LINK" || isAdminAssetFailure(event.message || "");

      if (isAssetError) {
        void recover(event.message || "asset load error");
      }
    },
    true
  );

  window.addEventListener("unhandledrejection", event => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "");

    if (isAdminAssetFailure(reason)) {
      event.preventDefault();
      void recover(reason);
    }
  });

  nuxtApp.hook("app:mounted", clearAdminBootRecoveryFlag);
});
