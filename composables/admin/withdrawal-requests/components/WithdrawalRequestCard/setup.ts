import { computed } from "vue";
import {
  WITHDRAWAL_AVATAR_CLASS,
  WITHDRAWAL_REQUEST_CARD_CLASS,
  WITHDRAWAL_STATUS_ACTION_BASE_CLASS,
  WITHDRAWAL_STATUS_ACTION_DANGER_ACTIVE_CLASS,
  WITHDRAWAL_STATUS_ACTION_DANGER_CLASS,
  WITHDRAWAL_STATUS_ACTION_SUCCESS_ACTIVE_CLASS,
  WITHDRAWAL_STATUS_ACTION_SUCCESS_CLASS,
  WITHDRAWAL_STATUS_BADGE_BASE_CLASS,
  WITHDRAWAL_STATUS_BADGE_CLASS_MAP,
  type WithdrawalRequestCardEmit,
  type WithdrawalRequestCardProps,
} from "./index";
import type { WithdrawalStatusAction } from "~/composables/admin/withdrawal-requests";

export function useWithdrawalRequestCardSetup(props: WithdrawalRequestCardProps, emit: WithdrawalRequestCardEmit) {
  const cardClass = computed(() => WITHDRAWAL_REQUEST_CARD_CLASS);

  const avatarClass = computed(() => WITHDRAWAL_AVATAR_CLASS);

  const clientUrl = computed(() => (props.requestItem.user_id ? props.clientLink(props.requestItem.user_id) : ""));

  const isEditing = computed(() => props.editingRequestId === props.requestItem.id);

  const isUpdating = computed(() => props.updatingRequestId === props.requestItem.id);

  const isAuxiliaryLoading = computed(() => props.auxiliaryLoadingUserId === props.requestItem.user_id);

  const canEdit = computed(() => props.canEditRequest(props.requestItem));

  const canChangeStatus = computed(() => props.canRequestStatusChange(props.requestItem));

  const hasDetails = computed(
    () => !props.requestItem.is_internal_transfer && props.hasPaymentDetailData(props.requestItem)
  );

  const paymentDetailExpanded = computed(() => props.isPaymentDetailExpanded(props.requestItem.id));

  const paymentEntries = computed(() => props.paymentDetailEntries(props.requestItem));

  const statusBadgeClass = computed(() => [
    WITHDRAWAL_STATUS_BADGE_BASE_CLASS,
    WITHDRAWAL_STATUS_BADGE_CLASS_MAP[props.statusClass(props.requestItem.status)] ??
      WITHDRAWAL_STATUS_BADGE_CLASS_MAP["is-pending"],
  ]);

  const notifyChecked = computed(() => props.notifyClient !== false);

  const onlineIndicatorClass = computed(() =>
    props.requestItem.owner_is_online ? "bg-[var(--ui-sticker-success)]" : "bg-[var(--ui-text-secondary)]"
  );

  const successfulActionClass = computed(() => [
    WITHDRAWAL_STATUS_ACTION_BASE_CLASS,
    WITHDRAWAL_STATUS_ACTION_SUCCESS_CLASS,
    props.isStatusActive(props.requestItem, "successful") ? WITHDRAWAL_STATUS_ACTION_SUCCESS_ACTIVE_CLASS : "",
  ]);

  const rejectedActionClass = computed(() => [
    WITHDRAWAL_STATUS_ACTION_BASE_CLASS,
    WITHDRAWAL_STATUS_ACTION_DANGER_CLASS,
    props.isStatusActive(props.requestItem, "rejected") ? WITHDRAWAL_STATUS_ACTION_DANGER_ACTIVE_CLASS : "",
  ]);

  const accountText = computed(() => {
    const balance =
      props.requestItem.account_balance === undefined
        ? ""
        : ` · ${props.formatMoney(
            props.requestItem.account_balance,
            props.requestItem.account_currency || props.requestItem.currency || "USD"
          )}`;

    return `${props.requestItem.account_number || "-"}${balance}`;
  });

  const amountText = computed(() =>
    props.formatMoney(
      props.requestItem.amount,
      props.requestItem.currency || props.requestItem.account_currency || "USD"
    )
  );

  const routeOrPaymentDetailText = computed(() =>
    props.requestItem.is_internal_transfer
      ? props.transferRouteValue(props.requestItem)
      : props.requestItem.payment_detail_name || "-"
  );

  const detailTitle = computed(
    () => props.requestItem.payment_detail_name || props.requestItem.payment_detail?.name || "-"
  );

  const documentsCount = computed(() => props.requestItem.payment_detail?.documents?.length || 0);

  const handleToggleEdit = (): void => {
    emit("toggle-edit", props.requestItem);
  };

  const handleSuccessfulStatus = (): void => {
    emit("quick-status-update", props.requestItem, "successful");
  };

  const handleRejectedStatus = (): void => {
    emit("quick-status-update", props.requestItem, "rejected");
  };

  const handleRequestStatusChange = (): void => {
    emit("request-status-change", props.requestItem);
  };

  const handleTogglePaymentDetail = (): void => {
    emit("toggle-payment-detail", props.requestItem.id);
  };

  const handleSaveEdit = (): void => {
    emit("save-edit", props.requestItem);
  };

  const handleEditSelectChange = (key: "accountId" | "paymentDetailId", value: string | null): void => {
    emit("edit-select-change", key, value);
  };

  const handleEditInput = (key: "amount", value: string): void => {
    emit("edit-input", key, value);
  };

  const handleEditTextarea = (key: "comment" | "adminComment", event: Event): void => {
    emit("edit-textarea", key, event);
  };

  const handleNotifyChange = (event: Event): void => {
    emit("notify-client-change", props.requestItem.id, Boolean((event.target as HTMLInputElement)?.checked));
  };

  const statusDisabled = (nextStatus: WithdrawalStatusAction): boolean =>
    props.isStatusDisabled(props.requestItem, nextStatus);

  return {
    accountText,
    amountText,
    avatarClass,
    canChangeStatus,
    canEdit,
    cardClass,
    clientUrl,
    detailTitle,
    documentsCount,
    handleEditInput,
    handleEditSelectChange,
    handleEditTextarea,
    handleNotifyChange,
    handleRejectedStatus,
    handleRequestStatusChange,
    handleSaveEdit,
    handleSuccessfulStatus,
    handleToggleEdit,
    handleTogglePaymentDetail,
    hasDetails,
    isAuxiliaryLoading,
    isEditing,
    isUpdating,
    notifyChecked,
    onlineIndicatorClass,
    paymentDetailExpanded,
    paymentEntries,
    rejectedActionClass,
    routeOrPaymentDetailText,
    statusBadgeClass,
    statusDisabled,
    successfulActionClass,
  };
}
