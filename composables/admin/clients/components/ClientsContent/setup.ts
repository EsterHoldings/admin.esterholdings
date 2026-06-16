import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  AdminClientCardItem,
  ClientsContentEmit,
  ClientsContentProps,
} from "~/composables/admin/clients/components/ClientsContent";

export function useClientsContentSetup(_props: ClientsContentProps, emit: ClientsContentEmit) {
  const { t } = useI18n({ useScope: "global" });
  const activeMenuId = ref<string | null>(null);

  const handleOpenClientPage = (id: string) => emit("click", id);

  const toggleActionMenu = (id?: string) => {
    if (!id) return;
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  const handleFullDelete = (item: AdminClientCardItem) => {
    activeMenuId.value = null;
    emit("fullDelete", item);
  };

  const closeActionMenu = () => {
    activeMenuId.value = null;
  };

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const getTwoCharsByFullName = (firstName?: string, lastName?: string): string => {
    const firstInitial = String(firstName ?? "").charAt(0);
    const lastInitial = String(lastName ?? "").charAt(0);
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const formattedDate = new Date(date);
    return isNaN(formattedDate.getTime()) ? date : formattedDate.toLocaleString();
  };

  const normalizeBadgeValue = (value?: string | null): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    return normalized || "unknown";
  };

  const formatProviderName = (provider?: string | null): string => {
    const normalized = String(provider ?? "").trim();
    if (!normalized) return "";

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const acquisitionSourceLabel = (item: AdminClientCardItem): string => {
    const source = normalizeBadgeValue(item.acquisition_source);
    if (source === "referral") {
      return resolveText("admin.clients.origin.referral", "referral");
    }

    return resolveText("admin.clients.origin.organic", "organic");
  };

  const registrationMethodLabel = (item: AdminClientCardItem): string => {
    const method = normalizeBadgeValue(item.registration_method);
    if (method === "social") {
      const provider = formatProviderName(item.social_provider);
      const social = resolveText("admin.clients.registration.social", "social");

      return provider ? `${social}: ${provider}` : social;
    }

    return resolveText("admin.clients.registration.basic", "basic");
  };

  onMounted(() => {
    document.addEventListener("click", closeActionMenu);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", closeActionMenu);
  });

  return {
    t,
    activeMenuId,
    handleOpenClientPage,
    toggleActionMenu,
    handleFullDelete,
    resolveText,
    getTwoCharsByFullName,
    formatDate,
    normalizeBadgeValue,
    acquisitionSourceLabel,
    registrationMethodLabel,
  };
}
