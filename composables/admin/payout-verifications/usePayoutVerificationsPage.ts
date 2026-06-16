import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useVerificationRequestsPage } from "~/composables/admin/verifications/useVerificationRequestsPage";

export function usePayoutVerificationsPage() {
  const { t, locale } = useI18n({ useScope: "global" });

  const pageTitle = computed(() => {
    const value = t("admin.verifications.payoutIndex.title");

    if (value !== "admin.verifications.payoutIndex.title") {
      return value;
    }

    if (locale.value === "ru") return "Верификация реквизитов";
    if (locale.value === "uk") return "Верифікація реквізитів";

    return "Payment detail verifications";
  });

  return {
    pageTitle,
    ...useVerificationRequestsPage("payout"),
  };
}
