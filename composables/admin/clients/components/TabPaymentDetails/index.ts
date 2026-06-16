export type PaymentDetailStatus = "approved" | "pending" | "rejected";
export type ArchiveFilter = "active" | "archived" | "all";

export interface AdminPaymentDetailDocument {
  path: string;
  previewUrl: string;
  name: string;
  mimeType: string;
}

export interface AdminPaymentDetail {
  id: string;
  name: string;
  status: PaymentDetailStatus;
  paymentSystemName: string;
  updatedAt: string;
  adminComment: string;
  data: Record<string, unknown>;
  documents: AdminPaymentDetailDocument[];
}

export interface PaymentDetailField {
  key: string;
  label: string;
  value: string;
}

export interface PaymentDetailSummaryCard {
  id: "total" | PaymentDetailStatus;
  label: string;
  value: string;
  hint: string;
}

export interface PaymentDetailFilterOption {
  value: ArchiveFilter;
  label: string;
}

export interface TabPaymentDetailsProps {
  clientId: string;
}

export interface PaymentDetailsPaginatorEvent {
  page: number;
  rows: number;
}

export const PAYMENT_DETAILS_SKELETON_ROWS = [1, 2, 3, 4];
export const PAYMENT_DETAILS_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
