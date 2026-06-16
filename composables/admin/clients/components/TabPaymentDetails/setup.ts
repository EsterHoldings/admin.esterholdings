import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import useAppCore from "~/composables/useAppCore";
import {
  PAYMENT_DETAILS_ROWS_PER_PAGE_OPTIONS,
  PAYMENT_DETAILS_SKELETON_ROWS,
  type AdminPaymentDetail,
  type AdminPaymentDetailDocument,
  type ArchiveFilter,
  type PaymentDetailField,
  type PaymentDetailsPaginatorEvent,
  type PaymentDetailStatus,
  type TabPaymentDetailsProps,
} from "./index";

export function useTabPaymentDetailsSetup(props: TabPaymentDetailsProps) {
  const appCore = useAppCore();
  const { t, te, locale } = useI18n({ useScope: "global" });

  const paymentDetails = ref<AdminPaymentDetail[]>([]);
  const isLoading = ref(false);
  const page = ref(1);
  const perPage = ref(10);
  const archiveFilter = ref<ArchiveFilter>("active");

  function text(key: string, fallback: string, params: Record<string, unknown> = {}): string {
    return te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));
  }

  const archiveFilterOptions = computed(() => [
    { value: "active" as const, label: text("admin.clients.paymentDetails.filters.active", "Active") },
    { value: "archived" as const, label: text("admin.clients.paymentDetails.filters.archived", "Archived") },
    { value: "all" as const, label: text("admin.clients.paymentDetails.filters.all", "All") },
  ]);

  const summaryCards = computed(() => {
    const approved = paymentDetails.value.filter(item => item.status === "approved").length;
    const pending = paymentDetails.value.filter(item => item.status === "pending").length;
    const rejected = paymentDetails.value.filter(item => item.status === "rejected").length;

    return [
      {
        id: "total" as const,
        label: text("admin.clients.paymentDetails.summary.total", "Total requisites"),
        value: formatCount(paymentDetails.value.length),
        hint: text("admin.clients.paymentDetails.summary.totalHint", "Payment details in selected filter"),
      },
      {
        id: "approved" as const,
        label: text("admin.clients.paymentDetails.summary.approved", "Approved"),
        value: formatCount(approved),
        hint: text("admin.clients.paymentDetails.summary.approvedHint", "Ready for withdrawals"),
      },
      {
        id: "pending" as const,
        label: text("admin.clients.paymentDetails.summary.pending", "Pending"),
        value: formatCount(pending),
        hint: text("admin.clients.paymentDetails.summary.pendingHint", "Waiting for moderation"),
      },
      {
        id: "rejected" as const,
        label: text("admin.clients.paymentDetails.summary.rejected", "Rejected"),
        value: formatCount(rejected),
        hint: text("admin.clients.paymentDetails.summary.rejectedHint", "Rejected by admin"),
      },
    ];
  });

  const pagedPaymentDetails = computed(() => {
    const start = (page.value - 1) * perPage.value;
    return paymentDetails.value.slice(start, start + perPage.value);
  });

  const showSkeleton = computed(() => isLoading.value && pagedPaymentDetails.value.length === 0);
  const showEmpty = computed(() => !isLoading.value && paymentDetails.value.length === 0);
  const showPaginator = computed(() => paymentDetails.value.length > perPage.value);
  const paginatorFirst = computed(() => (page.value - 1) * perPage.value);

  const labels = computed(() => ({
    refresh: text("admin.clients.common.refresh", "Refresh"),
    emptyTitle: text("admin.clients.paymentDetails.emptyTitle", "No payment details yet"),
    emptySubtitle: text(
      "admin.clients.paymentDetails.emptySubtitle",
      "Client payment details will appear here after submission."
    ),
    updatedAt: text("admin.clients.paymentDetails.columns.updatedAt", "Updated at"),
    documentAlt: text("admin.clients.paymentDetails.documentAlt", "Payment detail document"),
    adminComment: text("admin.clients.paymentDetails.adminComment", "Admin comment"),
  }));

  function normalizeStatus(value: unknown): PaymentDetailStatus {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "approved" || normalized === "rejected") {
      return normalized;
    }

    return "pending";
  }

  function normalizeDocuments(documents: unknown): AdminPaymentDetailDocument[] {
    if (!Array.isArray(documents)) {
      return [];
    }

    return documents
      .map((document: any) => ({
        path: String(document?.path ?? ""),
        previewUrl: String(document?.preview_url ?? document?.previewUrl ?? ""),
        name: String(document?.name ?? ""),
        mimeType: String(document?.mime_type ?? document?.mimeType ?? ""),
      }))
      .filter(document => document.path !== "" || document.previewUrl !== "");
  }

  function normalizePaymentDetail(row: any): AdminPaymentDetail {
    return {
      id: String(row?.id ?? ""),
      name: String(row?.name ?? ""),
      status: normalizeStatus(row?.status),
      paymentSystemName: String(
        row?.payment_system?.name ?? row?.paymentSystem?.name ?? row?.payment_system_name ?? ""
      ),
      updatedAt: String(row?.updated_at ?? ""),
      adminComment: String(row?.admin_comment ?? ""),
      data: row?.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data : {},
      documents: normalizeDocuments(row?.documents),
    };
  }

  function normalizeLabel(value: string): string {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();
  }

  function fieldLabel(key: string): string {
    return text(`admin.clients.paymentDetails.fields.${key}`, normalizeLabel(key));
  }

  function formatValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(formatValue).filter(Boolean).join(", ");
    }

    if (value && typeof value === "object") {
      return Object.values(value as Record<string, unknown>)
        .map(formatValue)
        .filter(Boolean)
        .join(", ");
    }

    return String(value ?? "").trim();
  }

  function paymentPrimaryFields(paymentDetail: AdminPaymentDetail): PaymentDetailField[] {
    const fields = paymentDetail.data?.fields;
    const source =
      fields && typeof fields === "object" && !Array.isArray(fields)
        ? (fields as Record<string, unknown>)
        : Object.fromEntries(Object.entries(paymentDetail.data).filter(([key]) => !["fields", "legacy"].includes(key)));

    return Object.entries(source)
      .map(([key, value]) => ({
        key,
        label: fieldLabel(key),
        value: formatValue(value),
      }))
      .filter(field => field.value !== "")
      .slice(0, 6);
  }

  function formatCount(value: number): string {
    return new Intl.NumberFormat(locale.value || "en").format(Number(value || 0));
  }

  function formatDateTime(value: string): string {
    const normalized = String(value || "").trim();
    if (normalized === "") {
      return "-";
    }

    const date = new Date(normalized.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
      return normalized;
    }

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function statusText(status: PaymentDetailStatus): string {
    switch (status) {
      case "approved":
        return text("admin.verifications.status.approved", "Approved");
      case "rejected":
        return text("admin.verifications.status.rejected", "Rejected");
      default:
        return text("admin.verifications.status.pending", "Pending");
    }
  }

  function statusClass(status: PaymentDetailStatus): string {
    if (status === "approved") {
      return "text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border-[color-mix(in_srgb,var(--color-success)_22%,var(--color-stroke-ui-light))]";
    }

    if (status === "rejected") {
      return "text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] border-[color-mix(in_srgb,var(--color-danger)_22%,var(--color-stroke-ui-light))]";
    }

    return "text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] border-[color-mix(in_srgb,var(--color-warning)_22%,var(--color-stroke-ui-light))]";
  }

  function documentLabel(document: AdminPaymentDetailDocument, index: number): string {
    const extension = String(document.path || document.name || "")
      .split("?")[0]
      .split(".")
      .pop()
      ?.toUpperCase();

    return extension && extension.length <= 5 ? extension : `#${index + 1}`;
  }

  function openDocument(document: AdminPaymentDetailDocument): void {
    const url = document.previewUrl || document.path;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  async function loadPaymentDetails(): Promise<void> {
    isLoading.value = true;

    try {
      const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId, {
        archived: archiveFilter.value,
      });

      const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
      paymentDetails.value = rows.map(normalizePaymentDetail);
      page.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  function handlePaginatorPage(event: PaymentDetailsPaginatorEvent): void {
    page.value = Number(event.page || 0) + 1;
    perPage.value = Number(event.rows || perPage.value);
  }

  watch(archiveFilter, () => {
    void loadPaymentDetails();
  });

  onMounted(loadPaymentDetails);

  return {
    archiveFilter,
    archiveFilterOptions,
    documentLabel,
    formatDateTime,
    handlePaginatorPage,
    isLoading,
    labels,
    loadPaymentDetails,
    openDocument,
    page,
    pagedPaymentDetails,
    paginatorFirst,
    paymentDetails,
    paymentPrimaryFields,
    perPage,
    rowsPerPageOptions: PAYMENT_DETAILS_ROWS_PER_PAGE_OPTIONS,
    showEmpty,
    showPaginator,
    showSkeleton,
    skeletonRows: PAYMENT_DETAILS_SKELETON_ROWS,
    statusClass,
    statusText,
    summaryCards,
  };
}
