export type VerificationToolbarProps = {
  searchInput: string;
  placeholder: string;
  refreshAriaLabel: string;
  isLoading: boolean;
};

export type VerificationToolbarEmits = {
  "update:searchInput": [value: string];
  refresh: [];
};

export type VerificationToolbarEmit = {
  (event: "update:searchInput", value: string): void;
  (event: "refresh"): void;
};
