import type {
  ArchiveFilter,
  PaymentDetailFilterOption,
} from "~/composables/admin/clients/components/TabPaymentDetails";

export type PaymentDetailsToolbarProps = {
  archiveFilter: ArchiveFilter;
  archiveFilterOptions: PaymentDetailFilterOption[];
  isLoading: boolean;
  refreshLabel: string;
};

export type PaymentDetailsToolbarEmits = {
  "update:archiveFilter": [value: ArchiveFilter];
  refresh: [];
};

export type PaymentDetailsToolbarEmit = {
  (event: "update:archiveFilter", value: ArchiveFilter): void;
  (event: "refresh"): void;
};
