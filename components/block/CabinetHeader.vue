<script setup lang="ts">
  import { useRoute } from "vue-router";
  import { navigateTo } from "nuxt/app";
  import { computed, reactive, ref, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";

  import { useThemeStore } from "~/stores/themeStore.js";
  import { useAuthStore } from "~/stores/authStore";

  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import UiIconInfoFull from "~/components/ui/UiIconInfoFull.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";

  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const { t, locale } = useI18n({ useScope: "global" });
  const addCurrentLocaleToPath = (path = "") => `/${locale.value}/${path}`;

  const isOpen = ref(false);
  const isLoading = ref(false);
  const notificationsRef = ref(null);
  const notifications = reactive([
    { type: "info", title: "Email verification was sent!", message: "Please check your mail account!", wasRead: false },
    { type: "warning", title: "Пройдите верификацию!", message: "Вам необходимо пройти верификацию!", wasRead: false },
    { type: "success", title: "Фото профиля!", message: "Вы успешно верифицировали фото профиля!", wasRead: false },
    {
      type: "danger",
      title: "Отказ в верификации =(",
      message: "К сожалению вы не прошли верификацию документов!",
      wasRead: true,
    },
    {
      type: "info",
      title: "Вход с нового устройства!",
      message: "New login detected from Chrome, London.",
      wasRead: true,
    },
    { type: "info", title: "Добро пожаловать!", message: "Приветствую вас! - John Connor", wasRead: true },
  ]);

  if (!authStore.user) authStore.initAuth();

  const handleClickLogout = () => {
    authStore.setAccessToken("");
    navigateTo("/auth/login");
  };

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");
  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

  const route = useRoute();
  const isProfileRoute = computed(() => route.path.split("/").pop() === "profile");
  const profileMenuIsOpen = ref(false);
  const profileMenuRef = ref(null);
  const profileContainerRef = ref(null);

  const handleClickNotifications = () => (isOpen.value = !isOpen.value);

  const handleClickProfileMenu = () => {
    profileMenuIsOpen.value = !profileMenuIsOpen.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (profileContainerRef.value && !profileContainerRef.value.contains(event.target as Node)) {
      profileMenuIsOpen.value = false;
    }
    if (notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<template>
  <header
    class="h-[60px] flex items-center justify-between lg:justify-end border-b border-[--color-stroke-ui-light] lg:ml-[240px] pl-5 pr-5 lg:gap-4">

    <div class="lg:absolute lg:top-[-100px]">
      <NuxtLink to="/">
        <UiIconLogo v-if="!isThemeLight" />
        <UiIconLogoLight v-else />
      </NuxtLink>
    </div>

    <div class="flex items-center justify-end gap-2">
      <div class="h-[60px] flex items-center justify-center">
        <LanguageSwitcher
          isSidebar
          :isInvert="isThemeLight"
          class="icon" />
      </div>

      <div
        ref="notificationsRef"
        class="relative flex items-center justify-center">
        <button
          class="relative"
          @click="handleClickNotifications"
          :aria-label="t('cabinet.header.notifications')">
          <UiIconBell />
          <span
            class="absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold rounded-full bg-[var(--color-warning)] text-[var(--ui-text-main)] flex items-center justify-center"
            >4</span
          >
        </button>

        <div
          v-if="isOpen"
          class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 z-50 sm:w-[320px] md:w-[360px] lg:w-[400px] max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] rounded-xl !bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] flex flex-col">
          <div class="flex items-center justify-between p-3 sm:p-4 lg:p-5 flex-shrink-0">
            <span class="text-[var(--ui-text-main)]">{{ t("cabinet.header.notifications") }}</span>
            <div>
              <UiTextSmall
                state="info--outline--small"
                class="cursor-pointer"
              >{{ t("cabinet.header.markAllRead") }}</UiTextSmall
              >
            </div>
          </div>

          <UiSpacer :heightNone="true" />

          <div class="p-3 sm:p-4 lg:p-5 overflow-y-auto flex-1">
            <div
              v-for="notification in notifications"
              :key="notification.message"
              :class="[
                'relative mb-2.5 p-2 sm:p-3 rounded-xl bg-[var(--color-stroke-ui-light)] border border-[var(--color-stroke-ui-light)]',
                notification.type === 'info' ? 'text-[var(--ui-text-main)]' : '',
                notification.type === 'success' ? 'text-[var(--color-success)]' : '',
                notification.type === 'warning' ? 'text-[var(--color-warning)]' : '',
                notification.type === 'danger' ? 'text-[var(--color-danger)]' : '',
                notification.wasRead ? 'opacity-30 hover:opacity-100' : '',
              ]">
              <UiIconSuccessFull
                v-if="notification.type === 'success'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconWarningFull
                v-if="notification.type === 'warning'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconDangerFull
                v-if="notification.type === 'danger'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconInfoFull
                v-if="notification.type === 'info'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <div class="ml-8 sm:ml-10">
                <div>{{ notification.title }}</div>
                <div>{{ notification.message }}</div>
                <div></div>
              </div>
              <UiIconDelete class="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-50 hover:opacity-100" />
            </div>

            <div
              v-if="!isLoading && notifications.length === 0"
              class="h-[150px] sm:h-[200px] rounded-xl flex flex-col items-center justify-center gap-4">
              <UiIconBell />
              <span>{{ t("cabinet.header.emptyNotifications") }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="profileContainerRef"
        class="flex items-center justify-end gap-4 cursor-pointer ml-5"
        @click="handleClickProfileMenu">
        <div
          :class="[
            'mx-auto h-[32px] w-[32px] rounded-full flex items-center justify-center overflow-hidden',
            isProfileRoute ? 'ring-2 ring-[var(--ui-primary-main)]' : 'ring-2 ring-[var(--ui-text-main)]',
          ]">
          <UiIconUser
            v-if="!authStore.photoUrl"
            class="text-[--ui-text-main]" />
          <img
            v-else
            :src="authStore.photoUrl"
            alt="User Photo"
            class="h-[32px] w-[32px] object-cover rounded-full" />
        </div>

        <div class="text-[var(--ui-text-main)] flex items-center justify-center gap-2 relative">
          <span class="hidden sm:inline">Родіон Максименко</span>
          <UiIconArrowDown
            :class="{ 'rotate-180': profileMenuIsOpen, 'sm:block': true }"
            class="hidden" />

          <div
            ref="profileMenuRef"
            class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 sm:w-fit bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] rounded-md z-10"
            v-if="profileMenuIsOpen">
            <NuxtLink
              :to="addCurrentLocaleToPath('profile')"
              :aria-label="t('cabinet.header.profile')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconSetting />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.accountSettings") }}</UiTextSmall>
              </div>
            </NuxtLink>

            <div
              aria-label="Toggle theme"
              @click.stop="handleToggleTheme"
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md cursor-pointer"
            >
              <transition
                name="fade"
                mode="out-in"
              >
                <UiIconSun
                  v-if="themeStore.currentTheme === 'dark'"
                  :key="'sun'"
                />
                <UiIconMoon
                  v-else
                  :key="'moon'"
                />
              </transition>
              <UiTextSmall class="w-full whitespace-nowrap">
                {{ themeStore.currentTheme === "dark" ? t("cabinet.header.switchToLight") : t("cabinet.header.switchToDark") }}
              </UiTextSmall>
              <div class="shrink-0" @click.stop>
                <UiSwitchToggle
                  :model-value="isThemeLight"
                  @update:modelValue="handleToggleTheme"
                />
              </div>
            </div>

            <UiSpacer :heightNone="true" />

            <NuxtLink
              :to="addCurrentLocaleToPath('support')"
              :aria-label="t('cabinet.header.helpCenter')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconSupport />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.helpCenter") }}</UiTextSmall>
              </div>
            </NuxtLink>

            <UiSpacer :heightNone="true" />

            <NuxtLink
              @click="handleClickLogout()"
              :aria-label="t('cabinet.header.logout')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconLogout />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.logout") }}</UiTextSmall>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
