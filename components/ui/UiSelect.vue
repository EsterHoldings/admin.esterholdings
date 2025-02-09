<template>
  <div class="select">
    <div
        class="select__body"
        :class="{'is-open': isOpen}"
        @click="handleClick"
    >
      {{ currentValueItemText }}
    </div>

    <div class="select__options" v-if="isOpen">
      <div
        class="select__option select__option--no-selected"
        :class="{'is-active': currentValueItem?.value === null}"
        @click="handleOnChange(null)"
      >
        No selected...
      </div>
      <div
        class="select__option"
        :class="{'is-active': currentValueItem?.value === option.value}"
        v-for="option in data"
        @click="handleOnChange(option)"
      >
        {{ option.text }}
      </div>
    </div>

    <select>
      <option
        v-for="option of data"
        :value="option.value"
        :key="option.text"
        :selected="currentValueItem?.value === option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

interface IListOfSelectOptions {
  id: string,
  value: string,
  text: string,
}

const emit = defineEmits(["change"]);
const props = defineProps({
  data: {
    type: Array<IListOfSelectOptions>,
    default: [],
  },
});

const currentValue = ref(null);
const isOpen = ref(false);

const currentValueItemText = computed(() => {
  if (currentValue.value === null) return 'No selected...';
  const item = props.data.filter(x => x.value === currentValue.value)
  return item ? item[0].text : '...';
});

const currentValueItem = computed(() => {
  return props.data[
    currentValue.value as keyof typeof props.data
  ];
});

const handleClick = (): void => {
  isOpen.value = !isOpen.value;
};

const handleOnChange = (option: any): void => {
  currentValue.value = option.value;
  isOpen.value = false;
  emit("change", currentValue?.value);
};
</script>

<style lang="scss" scoped>
.select {
  position: relative;

  &__body {
    padding: 0 20px;
    border: 1px solid #0f0f0f;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    user-select: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;

    &.is-open {
      border-radius: 5px 5px 0 0;
      border-bottom: none;
    }
  }

  &__options {
    z-index: 1;
    position: absolute;
    width: 100%;
    max-height: 250px;
    overflow-x: scroll;
    border: 1px solid #0f0f0f;
    border-radius: 0px 0px 5px 5px;
    box-shadow: 0px 27px 38px -9px rgba(0, 0, 0, 0.75);
  }

  &__option {
    padding: 0 20px;
    border: 1px solid gainsboro;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: gainsboro;
    border-top: 1px solid white;
    user-select: none;

    &--no-selected {
      border: none;
      font-size: 13px;
      font-weight: 600;
      background-color: #a4a1a1;
    }

    &.is-active {
      font-weight: 600;
    }
  }
}

select {
  display: none;
}
</style>
