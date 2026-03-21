import { defineStore } from "pinia";
import { ref } from "vue";

const normalizeCount = (value: unknown): number => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

export const ADMIN_WITHDRAWAL_NOTIFICATION_TYPES = ["payments.withdrawal.created"];
export const ADMIN_VERIFICATION_NOTIFICATION_TYPES = ["verification.request.created"];
export const ADMIN_SUPPORT_NOTIFICATION_TYPES = ["support.ticket.created", "support.message.created"];

export const useAdminNotificationsStore = defineStore("adminNotifications", () => {
  const unreadCount = ref(0);
  const unreadVerificationRequestsCount = ref(0);
  const unreadWithdrawalRequestsCount = ref(0);
  const unreadSupportNotificationsCount = ref(0);

  const applySummary = (payload?: any) => {
    unreadCount.value = normalizeCount(payload?.unread_count);
    unreadVerificationRequestsCount.value = normalizeCount(payload?.unread_verification_requests_count);
    unreadWithdrawalRequestsCount.value = normalizeCount(payload?.unread_withdrawal_requests_count);
    unreadSupportNotificationsCount.value = normalizeCount(payload?.unread_support_notifications_count);
  };

  const incrementForNotification = (type: string) => {
    unreadCount.value += 1;

    if (ADMIN_VERIFICATION_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadVerificationRequestsCount.value += 1;
    }

    if (ADMIN_WITHDRAWAL_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadWithdrawalRequestsCount.value += 1;
    }

    if (ADMIN_SUPPORT_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadSupportNotificationsCount.value += 1;
    }
  };

  const decrementForNotification = (type: string) => {
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    if (ADMIN_VERIFICATION_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadVerificationRequestsCount.value = Math.max(0, unreadVerificationRequestsCount.value - 1);
    }

    if (ADMIN_WITHDRAWAL_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadWithdrawalRequestsCount.value = Math.max(0, unreadWithdrawalRequestsCount.value - 1);
    }

    if (ADMIN_SUPPORT_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadSupportNotificationsCount.value = Math.max(0, unreadSupportNotificationsCount.value - 1);
    }
  };

  const reset = () => {
    unreadCount.value = 0;
    unreadVerificationRequestsCount.value = 0;
    unreadWithdrawalRequestsCount.value = 0;
    unreadSupportNotificationsCount.value = 0;
  };

  return {
    applySummary,
    decrementForNotification,
    incrementForNotification,
    reset,
    unreadCount,
    unreadVerificationRequestsCount,
    unreadSupportNotificationsCount,
    unreadWithdrawalRequestsCount,
  };
});

export default useAdminNotificationsStore;
