export type WithdrawalPaymentDetailDocument = {
  name: string;
  path: string;
  mime_type: string;
  size: number | null;
  uploaded_at: string | null;
  preview_url: string | null;
};

export type WithdrawalPaymentDetail = {
  id: string;
  name: string;
  status: string;
  payment_system_id: string;
  payment_system_name: string;
  data: Record<string, unknown>;
  comment: string;
  documents: WithdrawalPaymentDetailDocument[];
};

export type WithdrawalRequestItem = {
  id: string;
  user_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_photo_path: string;
  owner_is_online: boolean;
  account_id: string;
  account_number: string;
  account_balance: number;
  account_currency: string;
  payment_detail_id: string;
  payment_detail_name: string;
  payment_detail_status: string;
  payment_system_name: string;
  amount: number;
  currency: string;
  status: string;
  comment: string;
  admin_comment: string;
  created_at: string;
  is_internal_transfer: boolean;
  from_account_number: string;
  to_account_number: string;
  meta: Record<string, any>;
  payment_detail: WithdrawalPaymentDetail;
};

export type WithdrawalStatusAction = "successful" | "failed" | "cancelled" | "rejected";

export type WithdrawalStats = {
  total: number;
  pending: number;
  processing: number;
  successful: number;
  failed: number;
  cancelled: number;
  rejected: number;
};

export type WithdrawalSelectOption = {
  id: string;
  value: string;
  text: string;
};

export type WithdrawalEditForm = {
  requestId: string;
  accountId: string;
  paymentDetailId: string;
  amount: string;
  comment: string;
  adminComment: string;
};

export type WithdrawalEditErrors = Record<string, string>;

export type WithdrawalPaymentDetailEntry = {
  key: string;
  groupLabel?: string;
  label: string;
  value: string;
};

export type WithdrawalStatCard = {
  id: string;
  status: string;
  label: string;
  value: number;
  cardClass: string;
  isActive: boolean;
};

export type WithdrawalRequestLabels = {
  accountText: string;
  actionsStatusSelector: string;
  adminCommentText: string;
  amountText: string;
  cancelEditText: string;
  changeStatusText: string;
  clientCommentText: string;
  copyValueText: string;
  createdAtText: string;
  documentsText: string;
  editText: string;
  executionText: string;
  notifyClientText: string;
  paymentDetailText: string;
  paymentMethodText: string;
  rejectText: string;
  requisitesCommentText: string;
  saveText: string;
  transferRouteText: string;
};

export type WithdrawalPaginatorEvent = {
  page: number;
  rows: number;
};

export const WITHDRAWAL_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const ADMIN_WITHDRAWAL_NOTIFICATION_TYPES = ["payments.withdrawal.created"];
