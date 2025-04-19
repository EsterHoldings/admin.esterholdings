import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import Forex from "../components/Forex.vue";

export const currentTab = ref("forex");

export const currentTabContent = {
  forex: Forex,
};

export function useTabs() {
  const { tm } = useI18n();

  const raw = tm("wide_range__categories");

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
