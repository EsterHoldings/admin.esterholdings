import { ref } from "vue";
import Forex from "../components/Forex.vue";

export const tabs = ref([
  { id: "forex", label: "Forex" },
  { id: "metals", label: "Metals" },
  { id: "cryptocurrency CDs", label: "Cryptocurrency CDs" },
  { id: "indices", label: "Indices" },
  { id: "shares", label: "Shares" },
  { id: "energy", label: "Energy" },
  { id: "ETFS", label: "ETFS" },
]);

export const currentTab = ref("forex");

export const currentTabContent = {
  forex: Forex,
};
