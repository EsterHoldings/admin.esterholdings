<template>
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <PanelDefault>
      <div class="flex flex-col items-center gap-2.5 p-5">
        <UiTextH4 class="text-[var(--ui-text-main)]">Referral Link</UiTextH4>

        <UiQRCode link="https://stage.esterholdings.website?ref=w23dhDf73l4fcs1" />

        <a
            :href="`https://t.me/share/url?url=http://esterholdings.com`"
            target="_blank"
            class="inline-flex items-center justify-center"
        >
          <UiIconInfo name="telegram" title="Share via Telegram" />
        </a>

        <UiTextH5 class="relative inline-flex w-full items-center rounded-xl bg-[var(--ui-background-sidebar)] px-3 py-2.5 pr-10">
          <UiTextSmall class="inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ui-text-main)]">
            <span ref="referralText">https://stage.esterholdings.website?ref=w23dhDf73l4fcs1</span>
          </UiTextSmall>
          <span class="absolute right-2.5 flex items-center justify-center text-[var(--ui-text-main)]">
            <UiIconCopy title="Copy" @click="copyReferral" />
          </span>
        </UiTextH5>
      </div>
    </PanelDefault>

    <PanelDefault>
      <div class="flex flex-col justify-between gap-5 p-5">
        <UiTextH4 class="text-[var(--ui-text-main)]">Levels</UiTextH4>

        <div class="mt-6 flex flex-col gap-2.5">
          <div class="flex justify-between text-base text-[var(--ui-text-main)]">
            <span>Level 1</span>
            <span>17</span>
          </div>
          <div class="flex justify-between text-base text-[var(--ui-text-main)]">
            <span>Level 2</span>
            <span>9</span>
          </div>
          <div class="flex justify-between text-base text-[var(--ui-text-main)]">
            <span>Level 3</span>
            <span>3</span>
          </div>
        </div>

        <YourLevelProgress current="150" total="200" />
      </div>
    </PanelDefault>

  </div>

  <PanelDefault class="mt-5">
    <div class="w-full flex flex-col gap-2.5 p-5 mt-5">

      <div>
        <UiInput>
          <template #icon-left>
            <UiIconSearch/>
          </template>
        </UiInput>
      </div>

      <div v-for="referral in referrals" class="flex items-center justify-between rounded-lg bg-[var(--color-stroke-ui-dark)] px-4 py-3">
        <div class="flex items-center gap-3">
          <UiImageCircle src="/images/user1.png" alt="User" size="32" />
          <span class="text-sm text-[var(--ui-text-main)]">{{ referral.name }}</span>
        </div>

        <span class="text-sm font-medium text-[var(--ui-text-main)]">
          <span class="text-sm text-[var(--ui-text-main)]">{{ referral.referralsCount }} referrals</span>
        </span>

        <span class="text-sm font-medium text-[var(--ui-text-main)]">+ ${{ referral.amount }}</span>
      </div>

    </div>

  </PanelDefault>

</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import { useToast } from "vue-toastification";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import YourLevelProgress from "./YourLevelProgress.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiIconInfo from "~/components/ui/UiIconInfo.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";

const toast = useToast();

const referralText = ref<HTMLElement | null>(null);

const referrals = reactive([
  {
    id: '2d1223fr23d23ed',
    name: "Антон Андриенко",
    referralsCount: 3,
    amount: 1249
  },
  {
    id: '32dij239dij239di',
    name: "Виктор Долгий",
    referralsCount: 1,
    amount: 145
  },
  {
    id: '34v3443v23j3dkk3f',
    name: "Николай Науменко",
    referralsCount: 34,
    amount: 45249
  },
  {
    id: '34v3443v23j3dkk3f',
    name: "Анна Абрамовна",
    referralsCount: 8,
    amount: 5541
  },
  {
    id: 'f34f43jg34gg3kk333',
    name: "Игорь Байстрюк",
    referralsCount: 13,
    amount: 5541
  },
])

const copyReferral = async () => {
  const text = referralText.value?.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copy");
  } catch (err) {
    console.error("Ошибка копирования:", err);
  }
};
</script>

