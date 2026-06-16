import type { BirthdayItem } from "~/composables/admin/birthdays/useBirthdaysPage";

export interface BirthdayCardLabels {
  history: string;
  noEmails: string;
}

export interface BirthdayCardProps {
  item: BirthdayItem;
  labels: BirthdayCardLabels;
  clientLink: (clientId: string) => string;
  formatDayMonth: (value?: string | null) => string;
  formatDateTime: (value?: string | null) => string;
  initials: (name: string) => string;
  ageLabel: (age: number) => string;
  daysLabel: (days: number) => string;
  recipientLabel: (type: string) => string;
  typeLabel: (type: string) => string;
  statusLabel: (status: string) => string;
}
