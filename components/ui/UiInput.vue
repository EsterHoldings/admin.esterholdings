<template>
  <div class="input">
    <div v-if="slots['icon-left']" class="input-icon--left">
      <slot name="icon-left" />
    </div>
    <input
      :class="{
        border: !borderNone,
        padding: !paddingNone,
        'is-invalid': isDirty && isInvalid,
        'is-valid': isDirty && !isInvalid,
        disabled: props.disabled,
      }"
      :type="props.type"
      :placeholder="props.placeholder"
      :value="props.value"
      :disabled="props.disabled"
      @focus="onFocus"
      @input="onInput"
      @blur="onBlur"
      readonly
      onfocus="this.removeAttribute('readonly');"
    />
    <div v-if="isLoading" class="is-loading"><UiIconSpinnerDefault /></div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from "vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  // Deperecated
  errorObject: {
    type: Object,
    default: {},
  },
  isDirty: {
    type: Boolean,
    default: false,
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  borderNone: {
    type: Boolean,
    default: false,
  },
  paddingNone: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["focus", "input", "blur"]);

const slots = useSlots();

const onFocus = (event: any): void => emit("focus", event);
const onInput = (event: any): void => emit("input", event);
const onBlur = (event: any): void => emit("blur", event);
</script>

<style lang="scss" scoped>
input {
  width: 100%;
  height: 40px;
  border: none;
  outline: none;
  background-color: transparent;
  color: wheat;
}

.input {
  box-sizing: border-box;
  width: 100%;
  height: 40px;
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

  .is-loading {
    height: 10px;
    width: 10px;
    margin-right: 10px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-icon--left {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 40px;
    width: 40px;
  }

  & > .padding {
    padding: 15px;
  }

  & > .border {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 5px;
  }

  &::placeholder {
    // TODO :: Add disable color
    color: var(--color-text-muted);
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    letter-spacing: 0em;
  }

  .is-invalid {
    border-color: red;
  }

  .is-valid {
    border-color: green;
  }

  .disabled {
    background-color: #e5e5e5;
  }
}
</style>
