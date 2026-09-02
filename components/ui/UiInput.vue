<template>
  <div class="input">
    <div
      v-if="slots['icon-left']"
      class="input-icon--left">
      <slot name="icon-left" />
    </div>

    <input
      v-if="props.type !== 'checkbox'"
      :class="{
        padding: !props.paddingNone,
        'is-invalid': props.isDirty && props.isInvalid,
        'is-valid': props.isDirty && !props.isInvalid,
        disabled: props.disabled,
        'input-icon-left': !!slots['icon-left'],
        'input-icon-right': props.clearable && !!props.value,
      }"
      :type="typeInput"
      :placeholder="props.placeholder"
      :value="props.value"
      :disabled="props.disabled"
      @focus="onFocus"
      @input="onInput"
      @blur="onBlur" />

    <button
      v-if="props.clearable && !!props.value && !props.disabled && !props.isLoading"
      type="button"
      class="input-clear"
      aria-label="Clear"
      @mousedown.prevent
      @click="clearInput">
      <i
        class="pi pi-times"
        aria-hidden="true" />
    </button>

    <input
      v-if="props.type === 'checkbox'"
      type="checkbox"
      :checked="!!props.value"
      :disabled="props.disabled"
      @change="onChecked" />

    <div
      v-if="props.isLoading"
      class="is-loading">
      <UiIconSpinnerDefault class="absolute right-[20px] top-[50%] translate-y-[-50%] opacity-15" />
    </div>

    <transition name="fade">
      <UiIconEye
        v-if="props.type === 'password' && isPasswordVisible"
        class="password-eye"
        @click="togglePasswordVisibility" />
    </transition>

    <transition name="fade">
      <UiIconEyeClose
        v-if="props.type === 'password' && !isPasswordVisible"
        class="password-eye"
        @click="togglePasswordVisibility" />
    </transition>
  </div>
</template>

<script lang="ts" setup>
  import { useSlots, computed, ref } from "vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconEye from "~/components/ui/UiIconEye.vue";
  import UiIconEyeClose from "~/components/ui/UiIconEyeClose.vue";

  const props = defineProps({
    value: { type: String, default: "" },
    type: { type: String, default: "text" },
    placeholder: { type: String, default: "" },
    isDirty: { type: Boolean, default: false },
    isInvalid: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    borderNone: { type: Boolean, default: false },
    borderForSearch: { type: Boolean, default: false },
    paddingNone: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
  });

  const emit = defineEmits(["input", "focus", "blur", "checked"]);

  const slots = useSlots();

  const isPasswordVisible = ref(false);
  const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
  };

  const typeInput = computed(() => {
    if (props.type === "password") {
      return isPasswordVisible.value ? "text" : "password";
    }
    return props.type;
  });

  function onFocus(e: Event) {
    emit("focus", e);
  }

  function onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    emit("input", val);
  }

  function onBlur(e: Event) {
    emit("blur", e);
  }

  function clearInput() {
    emit("input", "");
  }

  function onChecked(e: Event) {
    emit("checked", e);
  }
</script>

<style lang="scss" scoped>
  input {
    width: 100%;
    height: var(--ui-input--height);
    background-color: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-stroke-ui-light);
    color: var(--color-ui-text);
    padding: 0 10px;
    outline: none;
    border-radius: 10px;
  }

  .input {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: var(--ui-input--height);
    background: transparent;
    color: var(--ui-text-main);
    font-size: 14px;
    line-height: 17px;
  }

  .input .is-loading {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    overflow: hidden;
    pointer-events: none;

    /* как в .animated из примера */
    background: linear-gradient(
      to right,
      rgba(243, 243, 243, 0.1) 5%,
      rgba(238, 238, 238, 0.15) 20%,
      rgba(243, 243, 243, 0.1) 35%
    );
    background-size: 1000px 100%; /* важно, чтобы было что двигать */

    animation: placeholderShimmer 1.5s linear infinite;
  }

  @keyframes placeholderShimmer {
    0% {
      background-position: -500px 0;
    }
    100% {
      background-position: 500px 0;
    }
  }

  .input-icon--left {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    position: absolute;
  }

  .input > .padding {
    padding: 15px;
  }

  .input > .border {
    border-radius: 10px;
  }

  .input::placeholder {
    color: var(--color-text-muted);
  }

  .input .input-icon-left {
    padding-left: 40px;
  }

  .input .input-icon-right {
    padding-right: 40px;
  }

  .input-clear {
    position: absolute;
    right: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    color: var(--ui-text-secondary);
    border: 0;
    border-radius: 7px;
    background: transparent;
    cursor: pointer;
    transition:
      color 140ms ease,
      background-color 140ms ease;
  }

  .input-clear:hover,
  .input-clear:focus-visible {
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
    outline: none;
  }

  .input .is-invalid {
    border-color: var(--color-danger);
  }

  .input .is-valid {
    border-color: var(--color-success);
  }

  .input .disabled {
    background-color: var(--ui-background-panel);
    border-color: var(--color-stroke-ui-light);
    border-style: dashed;
    color: var(--ui-text-secondary);
    cursor: not-allowed;
  }

  .password-eye {
    position: absolute;
    right: 10px;
    cursor: pointer;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
