import { ref } from "vue";

import Appearance from "../components/Appearance.vue";
import General from "../components/General.vue";
import Secure from "../components/Secure.vue";

export const tabs:any = ref([
  {
    id: "general",
    label: "General",
    component: General
  },
  {
    id: "appearance",
    label: "Appearance",
    component: Appearance
  },
  {
    id: "secure",
    label: "Secure",
    component: Secure
  },
]);