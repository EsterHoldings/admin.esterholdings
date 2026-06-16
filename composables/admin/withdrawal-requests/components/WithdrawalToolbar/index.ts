export type WithdrawalToolbarProps = {
  searchFilter: string;
  searchPlaceholder: string;
  isRefreshing: boolean;
};

export type WithdrawalToolbarEmits = {
  search: [value: string];
  refresh: [];
};

export type WithdrawalToolbarEmit = {
  (event: "search", value: string): void;
  (event: "refresh"): void;
};
