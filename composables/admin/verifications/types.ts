export type RequestReviewState = "pending" | "approved" | "rejected";
export type RequestStateFilter = "pending" | "history" | "approved" | "rejected";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationSectionTarget = "profile" | "documents" | "payout";
export type VerificationTabTarget = "client" | "payout" | "requests";
export type RequestScope = "identity" | "payout";
export type VerificationRequestNextState = Exclude<RequestReviewState, "pending">;

export interface VerificationRequestItem {
  id: string;
  user_id: string;
  state: VerificationStatus;
  request_state: RequestReviewState;
  profile_review_required: boolean;
  documents_review_count: number;
  requisites_review_count: number;
  request_viewed_at: string | null;
  request_reviewed_at: string | null;
  updated_at: string | null;
  updated_at_human: string | null;
  user: {
    id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    photo_url: string | null;
    initials: string | null;
    is_online: boolean;
  };
}

export interface AdminVerificationUnreadNotification {
  id: string;
  userId: string;
  section: VerificationSectionTarget;
}

export interface ReviewFocusItem {
  id: VerificationSectionTarget;
  label: string;
  tab: VerificationTabTarget;
  section: VerificationSectionTarget;
  icon: string;
}

export interface VerificationStatCard {
  id: RequestStateFilter;
  filter: RequestStateFilter;
  label: string;
  value: string;
}

export interface VerificationPanelLabels {
  statsAriaLabel: string;
  searchPlaceholder: string;
  refreshAriaLabel: string;
  retryLabel: string;
  emptyList: string;
  noActiveChanges: string;
  approveAll: string;
  rejectAll: string;
  sendNotifications: string;
  cancel: string;
}

export interface VerificationPaginatorEvent {
  page: number;
  rows: number;
}
