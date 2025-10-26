<template>

  <UiContainer>
    <div>
      <div class="mb-5 flex items-center justify-between">
        <div class="flex justify-start items-center gap-2">
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.accounts.account.title") }} :
          </UiTextH4>

          <span class="flex justify-start items-center gap-2">
            <UiIconCopy :text="id"/>
            <span class="block truncate">{{ id }}</span>
          </span>
        </div>
      </div>

      <div
          class="grid gap-[20px] grid-cols-[1fr_2fr]"
      >
        <PanelDefault class="text-[var(--ui-text-main)]">
          <div class="flex items-center gap-2 min-w-0 p-2 m-2 bg-[var(--color-stroke-ui-light)] hover:bg-[var(--color-stroke-ui-dark)] rounded-lg">
            <span class="shrink-0">Status : </span>
            <span class="flex items-center gap-2 min-w-0"><UiBadge :outline="true" state="info" class="whitespace-nowrap !p-[14px]">{{ status }}</UiBadge></span>
          </div>

          <div class="flex items-center gap-2 min-w-0 p-2 m-2 bg-[var(--color-stroke-ui-light)] hover:bg-[var(--color-stroke-ui-dark)] rounded-lg">
            <span class="shrink-0">Subject : </span>
            <span class="flex items-center gap-2 min-w-0">
              {{ subject }}
            </span>
          </div>

        </PanelDefault>

        <ChatDefault
            :as-block="true"
            :ticket-id="id"
            :currentUser="currentUser"
            class="
      w-full h-[70vh] md:h-[540px]
      rounded-2xl border border-[var(--ui-primary-main)] dark:border-slate-700
      bg-[var(--ui-background)] shadow-2xl overflow-hidden
    "
        />
      </div>

    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import useAppCore from "~/composables/useAppCore";
import {definePageMeta} from "~/.nuxt/imports";
import {useI18n} from "vue-i18n";
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import ChatDefault from "~/components/block/chats/ChatDefault.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiBadge from "~/components/ui/UiBadge.vue";

definePageMeta({layout: "cabinet", middleware: ["auth-client", "client-check-auth"]});

const {t} = useI18n({useScope: "global"});

const route = useRoute();

const appCore = useAppCore();

const activeTabIndex = ref(0);
const isLoading = ref(false);

const id: string = computed(() => String(route.params.id));

const currentUser = reactive({
  id: null,
  name: null,
})

const lastMessageAt = ref('');
const status = ref('');
const subject = ref('');

const loadData = async () => {
  console.log('run run run run run');
  isLoading.value = true;

  const response = await appCore.tickets.getById(route.params.id);

  console.log('response');
  console.log(response.data);

  lastMessageAt.value = response.data.last_message_at;
  status.value = response.data.status;
  subject.value = response.data.subject;

  isLoading.value = false;
}

onMounted(async () => {
  const response = await appCore.auth.getAuthUser();
  currentUser.id = response.data.id;
  currentUser.name = response.data.first_name;

  await loadData()
})
</script>

<style lang="scss" scoped>
.icon-update {
  height: 14px;
  width: 14px;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    animation: wiggle 0.2s ease;
  }
}

.icon-update.spinning {
  animation: spin 0.5s linear;
}

.balance-sum {
  cursor: pointer;
}

.wiggle:hover {
  animation: wiggle 0.3s ease;
}

/* ========== KEYFRAMES ========== */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}

.accounts {
  &__title {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {

  }
}
</style>
