<template>
  <div class="input">
    <div v-if="slots['icon-left']" class="input-icon--left">
      <slot name="icon-left" />
    </div>

    <input
      :class="{
        border: !props.borderNone,
        padding: !props.paddingNone,
        'is-invalid': props.isDirty && props.isInvalid,
        'is-valid': props.isDirty && !props.isInvalid,
        disabled: props.disabled
      }"
      :type="typeInput"
      :placeholder="props.placeholder"
      :value="value"
      :disabled="props.disabled"
      @focus="onFocus"
      @input="onInput"
      @blur="onBlur"
      readonly
      onfocus="this.removeAttribute('readonly');"
    />

    <div v-if="props.isLoading" class="is-loading">
      <UiIconSpinnerDefault />
    </div>

    <transition name="fade">
      <UiIconEye
        v-if="props.type === 'password' && isPasswordVisible"
        class="password-eye"
        @click="togglePasswordVisibility"
      />
    </transition>

    <transition name="fade">
      <UiIconEyeClose
        v-if="props.type === 'password' && !isPasswordVisible"
        class="password-eye"
        @click="togglePasswordVisibility"
      />
    </transition>

    <div v-if="isLoading" class="is-loading"><UiIconSpinnerDefault /></div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots, computed, ref } from 'vue'
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconEyeClose from "~/components/ui/UiIconEyeClose.vue";

const props = defineProps({
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  value: { type: String, default: '' },
  errorObject: { type: Object, default: () => ({}) },
  isDirty: { type: Boolean, default: false },
  isInvalid: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  borderNone: { type: Boolean, default: false },
  paddingNone: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const slots = useSlots()
const isPasswordVisible = ref(false);

const togglePasswordVisibility = () => isPasswordVisible.value = !isPasswordVisible.value;

const emit = defineEmits(['input','focus','blur'])
const onFocus = (e: Event) => emit('focus', e)
const onInput = (e: Event) => {
  emit('input', e);
}
const onBlur = (e: Event) => emit('blur', e)

const typeInput = computed(() => {
  if (props.type === "password") {
    return isPasswordVisible.value ? "text" : "password";
  }
  return props.type;
});
</script>

<style lang="scss" scoped>
input {
  width: 100%;
  height: var(--ui-input--height);
  outline: none;
  background-color: var(--ui-background);
  border: 1px solid var(--color-stroke-ui-dark);
  color: var(--color-ui-text);
}

.input {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: var(--ui-input--height);
  margin: 0;
  background-color: transparent;
  outline: none;
  // TODO :: Add disable color
  color: var(--ui-text-main);
  font-size: 14px;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input .is-loading {
  height: 10px;
  width: 10px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon--left {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
}

.input > .padding {
  padding: 15px;
}

.input > .border {
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 10px;
}

.input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0em;
}

.input .is-invalid {
  border-color: red;
}

.input .is-valid {
  border-color: green;
}

.input .disabled {
  background-color: #e5e5e5;
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
