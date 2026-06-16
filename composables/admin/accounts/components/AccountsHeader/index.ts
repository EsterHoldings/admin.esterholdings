export interface AccountsHeaderProps {
  title: string;
  subtitle: string;
  createLabel: string;
  canCreateAccounts: boolean;
}

export type AccountsHeaderEmit = (event: "create") => void;
