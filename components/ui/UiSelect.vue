<template>
  <div
    ref="wrapper"
    class="relative">
    <button
      ref="body"
      type="button"
      class="select outline-none inline-flex h-10 w-full items-center justify-start gap-2 rounded-[8px] border bg-[var(--color-stroke-ui-dark)] px-5 text-[var(--color-ui-text)] transition border-[var(--color-stroke-ui-light)]"
      :class="{
        '!border-none !bg-[transparent]': withoutOverlay,
        'cursor-not-allowed opacity-60 pointer-events-none': props.disabled,
      }"
      :data-open="isOpen || null"
      :data-open-up="dropup || null"
      :data-invalid="(props.isDirty && props.isInvalid) || null"
      :data-valid="(props.isDirty && !props.isInvalid) || null"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="listbox"
      :disabled="props.disabled"
      @click.stop="toggle">
      <div
        v-if="slots['icon-left']"
        class="shrink-0">
        <slot name="icon-left" />
      </div>

      <UiTextSmall
        class="block w-full text-left text-[0.875rem] font-medium"
        v-html="displayText" />

      <div class="ml-2 shrink-0">
        <UiIconArrowDown :rotate180="isOpen" />
      </div>
    </button>

    <div
      v-if="isOpen"
      ref="menu"
      class="absolute left-0 z-50 w-full overflow-y-auto rounded border bg-[var(--color-stroke-ui-dark)] p-2 shadow-lg border-[var(--color-stroke-ui-light)] data-[down=true]:top-full data-[down=true]:mt-2 data-[up=true]:bottom-full data-[up=true]:mb-2"
      role="listbox"
      :data-down="!dropup || null"
      :data-up="dropup || null"
      :style="dropdownInlineStyle"
      @click.stop
      @scroll.passive="onMenuScroll">
      <div
        v-if="searchable"
        class="select__search-wrap mb-2 px-2">
        <input
          ref="searchInputRef"
          type="text"
          class="select__search-input"
          :value="searchQuery"
          :placeholder="searchPlaceholder || 'Search'"
          @input="onSearchInput"
          @click.stop
          @keydown.stop />
      </div>

      <UiTextSmall
        v-if="!withoutNoSelect"
        class="select__option flex items-center justify-start mb-1 h-10 cursor-pointer rounded px-5 text-[var(--color-ui-text)] font-semibold text-[0.8125rem] hover:bg-[var(--color-stroke-ui-light)]"
        :class="{ 'opacity-80': internalValue === null }"
        role="option"
        :aria-selected="internalValue === null ? 'true' : 'false'"
        @click="choose(null)">
        {{ t("ui-components.ui-select") }}
      </UiTextSmall>

      <UiTextSmall
        v-for="item in data"
        :key="item.value"
        class="select__option flex items-center justify-start mb-1 h-10 cursor-pointer rounded px-5 text-[var(--color-ui-text)] hover:bg-[var(--color-stroke-ui-light)] last:mb-0"
        :class="{ 'font-semibold': internalValue === item.value }"
        role="option"
        :aria-selected="internalValue === item.value ? 'true' : 'false'"
        v-html="item.text"
        @click="choose(item)" />
    </div>

    <select
      v-model="internalValue"
      hidden>
      <option
        v-for="item in data"
        :key="item.value"
        :value="item.value"
        v-html="item.text"></option>
    </select>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { useSlots, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
  import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  interface Option {
    id: string;
    value: string;
    text: string;
  }

  const { t } = useI18n({ useScope: "global" });
  const slots = useSlots();

  interface Props {
    data: Option[];
    value?: string | null;
    isDirty?: boolean;
    isInvalid?: boolean;
    withoutNoSelect?: boolean;
    withoutOverlay?: boolean;
    searchable?: boolean;
    searchValue?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isDirty: false,
    isInvalid: false,
    withoutNoSelect: false,
    withoutOverlay: false,
    searchable: false,
    searchValue: "",
    searchPlaceholder: "",
    disabled: false,
  });

  const emit = defineEmits<{
    (e: "change", v: string | null): void;
    (e: "blur", v: string): void;
    (e: "loadMore"): void;
    (e: "search", v: string): void;
    (e: "open"): void;
    (e: "close"): void;
  }>();

  const data = computed<Option[]>(() => props.data);

  const isOpen = ref(false);
  const dropup = ref(false);
  const body = ref<HTMLElement | null>(null);
  const wrapper = ref<HTMLElement | null>(null);
  const menu = ref<HTMLElement | null>(null);
  const searchInputRef = ref<HTMLInputElement | null>(null);
  const searchQuery = ref(props.searchValue);

  watch(
    () => props.searchValue,
    value => {
      searchQuery.value = value;
    }
  );

  const internalValue = ref<string | null>(props.value ?? null);
  watch(
    () => props.value,
    v => (internalValue.value = v ?? null)
  );

  watch(
    () => props.disabled,
    disabled => {
      if (!disabled) {
        return;
      }

      if (isOpen.value) {
        isOpen.value = false;
        emit("blur", internalValue.value ?? "");
        removeGlobalListeners();
      }
    }
  );

  const displayText = computed(
    () => data.value.find(i => i.value === internalValue.value)?.text || t("ui-components.ui-select")
  );

  const dropdownInlineStyle = ref<Record<string, string>>({});

  const loadMoreLocked = ref(false);
  const canLoadMore = computed(() => data.value.length >= 10);

  watch(
    () => data.value.length,
    () => {
      loadMoreLocked.value = false;
    }
  );

  function toggle() {
    if (props.disabled) {
      return;
    }

    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      emit("open");
      nextTick(() => {
        calcPlacement();
        if (props.searchable) {
          searchInputRef.value?.focus();
        }
        addGlobalListeners();
      });
    } else {
      emit("close");
      emit("blur", internalValue.value ?? "");
      removeGlobalListeners();
    }
  }

  function calcPlacement() {
    if (!body.value) return;
    const rect = body.value.getBoundingClientRect();
    const margin = 8;
    const viewportH = window.innerHeight;

    const spaceBelow = viewportH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    dropup.value = spaceBelow < 160 && spaceAbove > spaceBelow;

    const maxH = Math.max(120, Math.min(250, dropup.value ? spaceAbove : spaceBelow));
    dropdownInlineStyle.value = {
      maxHeight: `${Math.floor(maxH)}px`,
    };
  }

  function choose(item: Option | null) {
    isOpen.value = false;
    internalValue.value = item?.value ?? null;
    emit("change", internalValue.value);
    emit("close");
    emit("blur", internalValue.value ?? "");
    removeGlobalListeners();
  }

  function onMenuScroll() {
    if (!isOpen.value || !canLoadMore.value) return;
    const el = menu.value;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) return;

    const threshold = 16;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

    if (atBottom) {
      if (!loadMoreLocked.value) {
        loadMoreLocked.value = true;
        emit("loadMore");
      }
    } else {
      loadMoreLocked.value = false;
    }
  }

  function onSearchInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchQuery.value = value;
    emit("search", value);
  }

  function onClickOutside(e: MouseEvent) {
    const el = wrapper.value;
    if (!el) return;
    if (!el.contains(e.target as Node)) {
      isOpen.value = false;
      emit("close");
      emit("blur", internalValue.value ?? "");
      removeGlobalListeners();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return;
    if (e.key === "Escape") {
      isOpen.value = false;
      emit("close");
      emit("blur", internalValue.value ?? "");
      removeGlobalListeners();
    }
  }

  function onWindowChange() {
    if (isOpen.value) calcPlacement();
  }

  function addGlobalListeners() {
    document.addEventListener("click", onClickOutside, true);
    window.addEventListener("resize", onWindowChange, { passive: true });
    window.addEventListener("scroll", onWindowChange, { passive: true });
    document.addEventListener("keydown", onKeydown);
  }

  function removeGlobalListeners() {
    document.removeEventListener("click", onClickOutside, true);
    window.removeEventListener("resize", onWindowChange);
    window.removeEventListener("scroll", onWindowChange);
    document.removeEventListener("keydown", onKeydown);
  }

  onMounted(() => {
    calcPlacement();
  });

  onBeforeUnmount(removeGlobalListeners);
</script>

<style scoped>
  .select[data-invalid] {
    border-color: var(--color-danger) !important;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-danger) 30%, transparent);
  }

  .select[data-valid] {
    border-color: var(--color-success) !important;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-success) 25%, transparent);
  }

  .select__search-input {
    width: 100%;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    color: var(--color-ui-text);
    padding: 0 10px;
    outline: none;
    font-size: 13px;
  }
</style>
