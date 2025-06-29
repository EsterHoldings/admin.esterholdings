<template>
  <div class="language-wrapper" ref="wrapperRef">
    <UiIconGlobe
        class="icon"
        @click="toggleDropdown"
        :class="{
        'svg-invert': props.isInvert,
      }"
    />

    <transition name="fade">
      <ul v-if="isOpen" class="dropdown" :class="{ top: props.isSidebar }">
        <li
            v-for="(label, code) in languages"
            :key="code"
            @click="switchLanguage(code)"
            :class="{ active: locale === code }"
        >
          <span class="flag">{{ getFlag(code) }}</span>
          <span class="label">{{ label.toUpperCase() }}</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed} from "vue";
import {useI18n} from "vue-i18n";
import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";

const props = defineProps({
  isInvert: Boolean,
  isSidebar: Boolean,
});

const {locale, setLocale} = useI18n();

const isOpen = ref(false);
const wrapperRef = ref(null);

const languages = {
  en: "English",
  ru: "Русский",
};

const getFlag = (code) => {
  switch (code) {
    case "en":
      return "🇬🇧";
    case "ru":
      return "🇷🇺";
    default:
      return "🌐";
  }
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const switchLanguage = async (code) => {
  await setLocale(code);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (!wrapperRef.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped lang="scss">
.language-wrapper {
  position: relative;

  .icon {
    cursor: pointer;
    font-size: 20px;
  }

  .dropdown {
    position: absolute;
    top: 40px;
    right: 0;
    width: fit-content;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    z-index: 11;

    &.top {
      top: auto;
      bottom: 0;
      left: 0;
    }

    .flag {
      font-size: 16px;
    }

    .label {
      font-weight: 500;
      color: black;
    }

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: rgba(0, 0, 40, 0.15);
        color: var(--ui-primary-accent);

        .label {
          font-weight: 700;
        }
      }

      &.active {
        background: var(--ui-background-hover);

        .label {
          color: var(--ui-primary-accent) !important;
        }

        &:hover {
          background: rgba(0, 0, 40, 0.15);
          color: var(--ui-primary-accent);
        }
      }
    }
  }
}

.svg-invert {
  filter: invert(1);
}
</style>
