<template>
  <div
      class="input phone-input"
      :class="{
      'is-invalid':   isDirty && isInvalid,
      'is-valid':     isDirty && !isInvalid,
      'disabled':     disabled
    }"
  >
    <div class="input-icon--left country-select" @click="open = !open">
      <span class="flag">{{ selected.flag }}</span>
      <span class="dial">{{ selected.dialCode }}</span>
      <span class="arrow">▾</span>
    </div>

    <ul v-if="open" class="country-dropdown">
      <li
          v-for="c in countries"
          :key="c.code"
          class="country-option"
          @click="selectCountry(c)"
      >
        <span class="flag">{{ c.flag }}</span>
        <span class="name">{{ c.name }}</span>
        <span class="dial">{{ c.dialCode }}</span>
      </li>
    </ul>

    <input
        type="tel"
        class="input-field"
        :class="{ 'no-padding': paddingNone }"
        :placeholder="placeholder"
        :value="localNumber"
        :disabled="disabled"
        @focus="e => emit('focus', e)"
        @input="onNumberInput"
        @blur="e => emit('blur', e)"
    />

    <div v-if="isLoading" class="is-loading">
      <UiIconSpinnerDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'
import { allCountries } from 'country-telephone-data'

// підготовка повного списку
const countries = reactive(
    allCountries.map(({ name, iso2, dialCode }) => ({
      name,
      code: iso2.toUpperCase(),
      dialCode: `+${dialCode}`,
      flag: iso2
          .toUpperCase()
          .split('')
          .map(ch => String.fromCodePoint(0x1F1E6 + ch.charCodeAt(0) - 65))
          .join(''),
    }))
)

// щоб шукати префікс від найдовшого до найкоротшого
const sortedCountries = computed(() =>
    [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
)

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String,  default: ''   },
  isDirty:     { type: Boolean, default: false},
  isInvalid:   { type: Boolean, default: false},
  isLoading:   { type: Boolean, default: false},
  borderNone:  { type: Boolean, default: false},
  paddingNone: { type: Boolean, default: false},
  disabled:    { type: Boolean, default: false}
})

const emit = defineEmits<{
  (e: 'input', v: string): void
  (e: 'focus', v: FocusEvent): void
  (e: 'blur', v: FocusEvent): void
}>()

const open        = ref(false)
const selected    = ref(countries.find(c => c.code === 'UA')!)
const localNumber = ref('')

watch(
    () => props.modelValue,
    (val) => {
      if (!val) {
        localNumber.value = ''
        return
      }
      const country = sortedCountries.value.find(c =>
          val.startsWith(c.dialCode)
      )
      if (country) {
        selected.value = country
        localNumber.value = val.slice(country.dialCode.length)
      } else {
        localNumber.value = val.replace(/\D/g, '')
      }
    },
    { immediate: true }
)

function selectCountry(c: any) {
  selected.value = c
  open.value = false
  updateModel()
}

function onNumberInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  localNumber.value = v.replace(/\D/g, '')
  updateModel()
}

function updateModel() {
  emit('input', selected.value.dialCode + localNumber.value)
}
</script>

<style lang="scss" scoped>
.phone-input {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 10px;
  background: var(--ui-background);
  height: var(--ui-input--height);

  &.no-border {
    border: none;
  }
  &.is-invalid {
    border-color: red;
  }
  &.is-valid {
    border-color: green;
  }
  &.disabled {
    background: #e5e5e5;
  }

  .country-select {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 12px;
    border: none;
    border-radius: 0;
    background: transparent;
    height: 100%;

    .flag { margin-right: 6px; }
    .dial { margin-right: 4px; }
    .arrow { font-size: 0.7em; }
  }

  .country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 20;
    width: 250px;
    max-height: 140px;
    height: 150px;
    overflow-y: auto;
    background: var(--ui-background);
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 4px;
    margin-top: 4px;

    .country-option {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      cursor: pointer;
    }
    .country-option:hover {
      background: rgba(255,255,255,0.05);
    }
    .country-option .flag  { margin-right: 8px; }
    .country-option .name  { flex: 1;      }
    .country-option .dial  { margin-left: auto; }
  }

  .input-field {
    flex: 1;
    padding: 0 12px;
    border: none;
    border-radius: 0;
    outline: none;
    background: transparent;
    color: var(--color-ui-text);
    height: 100%;

    &.no-padding {
      padding: 0;
    }
  }

  .is-loading {
    margin-right: 10px;
  }
}
</style>