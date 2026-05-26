<template>
  <div
    class="language-wrapper"
    ref="wrapperRef">
    <UiIconGlobe
      class="icon"
      @click="toggleDropdown"
      :class="{
        'svg-invert': props.isInvert,
      }" />

    <transition name="fade">
      <ul
        v-if="isOpen"
        class="dropdown"
        :class="{ top: props.isSidebar }">
        <li
          v-for="(label, code) in languages"
          :key="code"
          @click="switchLanguage(code)"
          :class="{ active: locale === code }">
          <span
            class="flag"
            :class="{ 'flag--monochrome': code === 'ru' }"
            >{{ getFlag(code) }}</span
          >
          <span class="label">{{ label.toUpperCase() }}</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";

  const props = defineProps({
    isInvert: Boolean,
    isSidebar: Boolean,
  });

  const { locale, setLocale } = useI18n();

  const isOpen = ref(false);
  const wrapperRef = ref(null);
  const ADMIN_LOCALE_STORAGE_KEY = "admin_locale";

  const languages = {
    en: "English",
    uk: "Українська",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    pt: "Português",
    ru: "Русский",
    tr: "Türkçe",
    he: "עברית",
    hi: "हिन्दी",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
  };

  const getFlag = code => {
    switch (code) {
      case "en":
        return "🇬🇧";
      case "ru":
        return "🇷🇺";
      case "de":
        return "🇩🇪";
      case "es":
        return "🇪🇸";
      case "fr":
        return "🇫🇷";
      case "it":
        return "🇮🇹";
      case "pt":
        return "🇵🇹";
      case "tr":
        return "🇹🇷";
      case "uk":
        return "🇺🇦";
      case "he":
        return "🇮🇱";
      case "hi":
        return "🇮🇳";
      case "ja":
        return "🇯🇵";
      case "ko":
        return "🇰🇷";
      case "zh":
        return "🇨🇳";
      default:
        return "🌐";
    }
  };

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const persistLanguage = code => {
    if (!Object.prototype.hasOwnProperty.call(languages, code)) return;

    localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, code);
    document.cookie = `admin_locale=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `locale=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `i18n_redirected=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const restorePersistedLanguage = async () => {
    const saved = localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY);
    if (saved && Object.prototype.hasOwnProperty.call(languages, saved) && locale.value !== saved) {
      persistLanguage(saved);
      await setLocale(saved);
      return;
    }

    persistLanguage(locale.value);
  };

  const switchLanguage = async code => {
    persistLanguage(code);
    await setLocale(code);
    isOpen.value = false;
  };

  const handleClickOutside = event => {
    if (!wrapperRef.value?.contains(event.target)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    restorePersistedLanguage().catch(() => {});
    document.addEventListener("click", handleClickOutside);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped lang="scss">
  .language-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    line-height: 1;

    .icon {
      display: block;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 20px;
    }

    .dropdown {
      scrollbar-width: none;
      position: absolute;
      top: 40px;
      right: 0;
      width: fit-content;
      background-color: var(--ui-background);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      padding: 10px;
      z-index: 11;
      max-height: 400px;
      overflow-y: scroll;

      &.top {
        height: max-content;
        top: 30px;
        bottom: 0;
        right: 0;
      }

      .flag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        font-size: 16px;
        padding: 0 10px 0 0;
        color: var(--ui-text-main);
      }

      .flag--monochrome {
        filter: grayscale(1) saturate(0) brightness(1.05);
      }

      .label {
        font-weight: 500;
        color: var(--ui-text-main);
        padding: 0 10px;
      }

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        font-size: 13px;
        cursor: pointer;
        background-color: var(--color-stroke-ui-dark);
        margin-bottom: 5px;
        border-radius: 8px;
        padding: 10px 20px;

        &:hover {
          background-color: var(--color-stroke-ui-dark);
          color: var(--ui-primary-accent);
          opacity: 0.7;
        }

        &.active {
          background-color: var(--color-stroke-ui-light);
          font-weight: 700;

          .label {
            color: var(--ui-primary-accent) !important;
          }

          &:hover {
            opacity: 0.7;
            color: var(--ui-primary-accent);
          }
        }
      }
    }
  }

  .svg-invert {
    filter: invert(1);
  }

  @media (max-width: 640px) {
    .language-wrapper {
      .dropdown.top {
        position: fixed;
        top: 80px;
        right: auto;
        bottom: auto;
        left: 50%;
        width: min(280px, calc(100vw - 40px));
        max-height: min(70vh, 420px);
        transform: translateX(-50%);
      }
    }
  }
</style>
