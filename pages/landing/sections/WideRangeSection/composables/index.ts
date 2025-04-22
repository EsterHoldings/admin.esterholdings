import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import Forex from "../components/Forex.vue";
import Metals from "../components/Metals.vue";
import CryptocurrencyCDs from "../components/CryptocurrencyCDs.vue";
import Indices from "../components/Indices.vue";
import Shares from "../components/Shares.vue";
import Energy from "../components/Energy.vue";
import ETFS from "../components/ETFS.vue";

export const currentTab = ref("forex");

export const currentTabContent = {
  forex: Forex,
  metals: Metals,
  "cryptocurrency CDs": CryptocurrencyCDs,
  indices: Indices,
  shares: Shares,
  energy: Energy,
  ETFS: ETFS,
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
