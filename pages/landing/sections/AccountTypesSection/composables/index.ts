import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

export const currentTab = ref("Standard");

export const currentTabContent = {
  standard: "Standard",
};

export function useTabs() {
  const { tm } = useI18n();

  const raw = tm("account_types__categories");

  const tabs = ref(
    Array.isArray(raw)
      ? raw.map((item: any) => ({
          id: item?.id?.body?.static ?? item?.id,
          label: item?.label?.body?.static ?? item?.label,
        }))
      : []
  );

  return {
    tabs,
  };
}
