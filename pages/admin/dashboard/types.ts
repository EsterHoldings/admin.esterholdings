import type { Component } from "vue";

export type DashboardBucket = "day" | "hour";

export type DashboardPreset = {
  id: string;
  label: string;
  amount: number;
  unit: "days" | "weeks" | "months";
  bucket: DashboardBucket;
};

export type DashboardFilters = {
  preset: string;
  date_from: string;
  date_to: string;
  bucket: DashboardBucket;
};

export type DashboardOnlineFilters = DashboardFilters & {
  device_type: string;
  browser: string;
  os: string;
};

export type DashboardSelectOption = {
  label: string;
  value: string;
};

export type DashboardSummaryCard = {
  id: string;
  label: string;
  value: string;
  icon: Component;
  to: string;
  kind: "primary" | "accent" | "info" | "warning" | "success" | "danger";
};

export type DashboardOnlineClient = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email?: string | null;
  photo_url?: string | null;
  initials?: string | null;
  online_since_at?: string | null;
  current_session_seconds?: number | string | null;
};

export type DashboardStatusTone = "success" | "danger" | "warning" | "muted" | "info";
