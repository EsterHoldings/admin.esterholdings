import { defineStore } from "pinia";
import { ref } from "vue";

const normalizeCount = (value: unknown): number => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

export const ADMIN_WITHDRAWAL_NOTIFICATION_TYPES = ["payments.withdrawal.created"];

export const useAdminNotificationsStore = defineStore("adminNotifications", () => {
  const unreadCount = ref(0);
  const unreadWithdrawalRequestsCount = ref(0);

  const applySummary = (payload?: any) => {
    unreadCount.value = normalizeCount(payload?.unread_count);
    unreadWithdrawalRequestsCount.value = normalizeCount(payload?.unread_withdrawal_requests_count);
  };

  const incrementForNotification = (type: string) => {
    unreadCount.value += 1;

    if (ADMIN_WITHDRAWAL_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadWithdrawalRequestsCount.value += 1;
    }
  };

  const decrementForNotification = (type: string) => {
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    if (ADMIN_WITHDRAWAL_NOTIFICATION_TYPES.includes(String(type ?? "").trim())) {
      unreadWithdrawalRequestsCount.value = Math.max(0, unreadWithdrawalRequestsCount.value - 1);
    }
  };

  const reset = () => {
    unreadCount.value = 0;
    unreadWithdrawalRequestsCount.value = 0;
  };

  return {
    applySummary,
    decrementForNotification,
    incrementForNotification,
    reset,
    unreadCount,
    unreadWithdrawalRequestsCount,
  };
});

export default useAdminNotificationsStore;
