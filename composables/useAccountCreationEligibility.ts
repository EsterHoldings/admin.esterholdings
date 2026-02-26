import { computed, ref } from "vue";
import useAppCore from "~/composables/useAppCore";

type VerificationStatus = "pending" | "approved" | "rejected";

const normalizeStatus = (value: unknown): VerificationStatus => {
  if (typeof value !== "string") return "pending";
  const normalized = value.trim().toLowerCase();
  if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
  if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
  return "pending";
};

export const useAccountCreationEligibility = () => {
  const appCore = useAppCore();

  const isEligibilityLoading = ref(false);
  const isEligibilityLoaded = ref(false);
  const infoStatus = ref<VerificationStatus>("pending");
  const documentsStatus = ref<VerificationStatus>("pending");

  const profileVerified = computed(() => infoStatus.value === "approved");
  const documentsVerified = computed(() => documentsStatus.value === "approved");
  const canCreateAccount = computed(
    () => isEligibilityLoaded.value && profileVerified.value && documentsVerified.value
  );

  const refreshAccountCreationEligibility = async (): Promise<void> => {
    if (isEligibilityLoading.value) return;

    isEligibilityLoading.value = true;
    try {
      const response = await appCore.verifications.get();
      const payload = response?.data?.data ?? {};

      infoStatus.value = normalizeStatus(payload?.info?.verification_status);
      documentsStatus.value = normalizeStatus(payload?.documents?.verification_status);
    } catch {
      infoStatus.value = "pending";
      documentsStatus.value = "pending";
    } finally {
      isEligibilityLoaded.value = true;
      isEligibilityLoading.value = false;
    }
  };

  return {
    infoStatus,
    documentsStatus,
    profileVerified,
    documentsVerified,
    canCreateAccount,
    isEligibilityLoaded,
    isEligibilityLoading,
    refreshAccountCreationEligibility,
  };
};

export default useAccountCreationEligibility;
