<template>
  <div class="input date-input-wrapper">
    <div v-if="$slots['icon-left']" class="input-icon--left">
      <slot name="icon-left"/>
    </div>

    <input
        ref="nativeInput"
        type="date"
        class="native-date-input"
        :value="rawValue"
        :disabled="disabled"
        @input="onNativeInput"
    />

    <input
        type="text"
        class="visible-input"
        :class="{
        border: !borderNone,
        padding: !paddingNone,
        'is-invalid': isDirty && isInvalid,
        'is-valid': isDirty && !isInvalid,
        disabled: disabled
      }"
        :value="displayText"
        :placeholder="placeholderText"
        readonly
        @click="openPicker"
    />

    <div v-if="isLoading" class="is-loading">
      <UiIconSpinnerDefault/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { parse, parseISO, format, isValid } from 'date-fns'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'

const props = defineProps({
  value: { type: String, default: '' },
  inputFormat: { type: String, default: 'yyyy-MM-dd' },
  displayFormat: { type: String, default: 'dd.MM.yyyy' },
  placeholder: { type: String, default: '' },
  isDirty: { type: Boolean, default: false },
  isInvalid: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  borderNone: { type: Boolean, default: false },
  paddingNone: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits<{ (e: 'input', v: string): void }>()

const rawValue = ref<string>(props.value)
const nativeInput = ref<HTMLInputElement|null>(null)

watch(() => props.value, v => {
  rawValue.value = v
})

const displayText = computed(() => {
  if (!rawValue.value) return ''
  let dt = parse(rawValue.value, props.inputFormat, new Date())
  if (!isValid(dt)) dt = parseISO(rawValue.value)
  return isValid(dt) ? format(dt, props.displayFormat) : rawValue.value
})

const placeholderText = computed(() => props.placeholder || props.displayFormat)

// Открыть нативный пикер
function openPicker() {
  if (props.disabled) return
  nextTick(() => nativeInput.value?.showPicker?.())
}

// Обработка выбора даты в пикере
function onNativeInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  rawValue.value = v
  emit('input', v)
}
</script>

<style lang="scss" scoped>
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.native-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--ui-input--height);
  opacity: 0;
  pointer-events: none;
}

.visible-input {
  width: 100%;
  height: var(--ui-input--height);
  outline: none;
  background-color: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
  color: var(--color-ui-text);
  border-radius: 10px;
  padding: 0 20px;
  font-size: 14px;
  cursor: pointer;
}

.input-icon--left {
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-input--height);
  height: var(--ui-input--height);
  z-index: 1;
}

.is-loading {
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visible-input.disabled {
  background-color: #e5e5e5;
  cursor: not-allowed;
}
.visible-input.is-invalid {
  border-color: red;
}
.visible-input.is-valid {
  border-color: green;
}
</style>