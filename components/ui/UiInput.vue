<template>
  <div class="input">
    <div v-if="slots['icon-left']" class="input-icon--left">
      <slot name="icon-left"/>
    </div>

    <input
        v-if="props.type !== 'checkbox'"
        :class="{
          border: !props.borderNone,
          padding: !props.paddingNone,
          'is-invalid': props.isDirty && props.isInvalid,
          'is-valid': props.isDirty && !props.isInvalid,
          disabled: props.disabled
        }"
        :type="typeInput"
        :placeholder="props.placeholder"
        :value="props.value"
        :disabled="props.disabled"
        @focus="onFocus"
        @input="onInput"
        @blur="onBlur"
    />

    <input
        v-else
        type="checkbox"
        :checked="!!props.value"
        :disabled="props.disabled"
        @change="onChecked"
    />

    <div v-if="props.isLoading" class="is-loading">
      <UiIconSpinnerDefault/>
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

    <div v-if="isLoading" class="is-loading">
      <UiIconSpinnerDefault/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useSlots, computed, ref} from 'vue'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import UiIconEye from '~/components/ui/UiIconEye.vue'
import UiIconEyeClose from '~/components/ui/UiIconEyeClose.vue'

const props = defineProps({
  value: {type: String, default: ''},
  type: {type: String, default: 'text'},
  placeholder: {type: String, default: ''},
  isDirty: {type: Boolean, default: false},
  isInvalid: {type: Boolean, default: false},
  isLoading: {type: Boolean, default: false},
  borderNone: {type: Boolean, default: false},
  borderForSearch: {type: Boolean, default: false},
  paddingNone: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
})

const emit = defineEmits(['input', 'focus', 'blur', 'checked'])

const slots = useSlots()

const isPasswordVisible = ref(false)
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const typeInput = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

function onFocus(e: Event) {
  emit('focus', e)
}

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('input', val)
}

function onBlur(e: Event) {
  emit('blur', e)
}

function onChecked(e: Event) {
  emit('checked', e)
}
</script>

<style lang="scss" scoped>
input {
  width: 100%;
  height: var(--ui-input--height);
  border: none;
  outline: none;
  background-color: var(--ui-background);
  color: var(--color-ui-text);
  padding: 0 10px;
}

.border {
  border: 1px solid var(--color-stroke-ui-dark);
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
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon--left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
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
