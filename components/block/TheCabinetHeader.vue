<script setup lang="ts">
  import { useRoute } from "vue-router";
  import { navigateTo } from "nuxt/app";
  import { computed, reactive, ref, onMounted, onUnmounted } from "vue";

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

  const authStore = useAuthStore();
  const themeStore = useThemeStore();

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
  <header class="h-[60px] flex items-center justify-end border-b border-[--color-stroke-ui-light] ml-[240px] pl-5 pr-5">
    <div
      ref="notificationsRef"
      class="relative flex items-center justify-center">
      <button
        class="relative"
        @click="handleClickNotifications"
        aria-label="Notifications">
        <UiIconBell />
        <span
          class="absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold rounded-full bg-[var(--color-warning)] text-[var(--ui-text-main)] flex items-center justify-center"
          >4</span
        >
      </button>

      <div
        v-if="isOpen"
        class="absolute top-9 right-0 z-50 w-[400px] min-h-[300px] max-h-[600px] rounded-xl !bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)]">
        <div class="flex items-center justify-between p-5">
          <span class="text-[var(--ui-text-main)]">Notifications</span>
          <div>
            <UiTextSmall
              state="info--outline--small"
              class="cursor-pointer"
              >Mark all read</UiTextSmall
            >
          </div>
        </div>

        <UiSpacer :heightNone="true" />

        <div class="p-5 overflow-y-scroll">
          <div
            v-for="notification in notifications"
            :key="notification.message"
            :class="[
              'relative mb-2.5 p-3 rounded-xl bg-[var(--color-stroke-ui-light)] border border-[var(--color-stroke-ui-light)]',
              notification.type === 'info' ? 'text-[var(--ui-text-main)]' : '',
              notification.type === 'success' ? 'text-[var(--color-success)]' : '',
              notification.type === 'warning' ? 'text-[var(--color-warning)]' : '',
              notification.type === 'danger' ? 'text-[var(--color-danger)]' : '',
              notification.wasRead ? 'opacity-30 hover:opacity-100' : '',
            ]">
            <UiIconSuccessFull
              v-if="notification.type === 'success'"
              class="absolute top-3 left-3" />
            <UiIconWarningFull
              v-if="notification.type === 'warning'"
              class="absolute top-3 left-3" />
            <UiIconDangerFull
              v-if="notification.type === 'danger'"
              class="absolute top-3 left-3" />
            <UiIconInfoFull
              v-if="notification.type === 'info'"
              class="absolute top-3 left-3" />
            <div class="ml-10">
              <div>{{ notification.title }}</div>
              <div>{{ notification.message }}</div>
              <div></div>
            </div>
            <UiIconDelete class="absolute top-3 right-3 opacity-50 hover:opacity-100" />
          </div>

          <div
            v-if="!isLoading && notifications.length === 0"
            class="h-[200px] rounded-xl flex flex-col items-center justify-center gap-4">
            <UiIconBell />
            <span>You have no notifications yet</span>
          </div>
        </div>
      </div>
    </div>

    <div class="h-[60px] px-2.5 flex items-center justify-center gap-2.5">
      <LanguageSwitcher
        isSidebar
        :isInvert="isThemeLight"
        class="icon" />
      <transition
        name="fade"
        mode="out-in">
        <button
          :key="themeStore.currentTheme"
          @click="themeStore.toggleTheme()"
          class="icon"
          aria-label="Toggle theme">
          <UiIconMoon v-if="themeStore.currentTheme === 'dark'" />
          <UiIconSun v-else />
        </button>
      </transition>
    </div>

    <div class="flex items-center justify-end gap-4">
      <NuxtLink
        to="/ru/profile"
        aria-label="Profile">
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
      </NuxtLink>

      <div
        ref="profileContainerRef"
        class="text-[var(--ui-text-main)] flex items-center justify-center gap-2 relative">
        <span @click="handleClickProfileMenu">John Connor</span>
        <UiIconArrowDown
          :rotate180="profileMenuIsOpen"
          @click="handleClickProfileMenu" />

        <div
          ref="profileMenuRef"
          class="w-fit absolute top-9 right-0 bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] rounded-md z-10"
          v-if="profileMenuIsOpen">
          <NuxtLink
            to="/ru/profile"
            aria-label="Profile">
            <div
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-3 rounded-md">
              <UiIconSetting />
              <UiTextSmall class="w-full whitespace-nowrap">Account Settings</UiTextSmall>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/ru/profile"
            aria-label="Profile">
            <div
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-3 rounded-md">
              <UiIconMoon />
              <UiTextSmall class="w-full whitespace-nowrap">Switch to Dark</UiTextSmall>
            </div>
          </NuxtLink>

          <UiSpacer :heightNone="true" />

          <NuxtLink
            to="/ru/profile"
            aria-label="Profile">
            <div
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-3 rounded-md">
              <UiIconMoon />
              <UiTextSmall class="w-full whitespace-nowrap">Help Center</UiTextSmall>
            </div>
          </NuxtLink>

          <UiSpacer :heightNone="true" />

          <NuxtLink
            to="/ru/profile"
            aria-label="Profile">
            <div
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-3 rounded-md">
              <UiIconLogout />
              <UiTextSmall class="w-full whitespace-nowrap">Log Out</UiTextSmall>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>
