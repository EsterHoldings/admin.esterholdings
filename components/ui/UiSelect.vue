<!--<template>-->
<!--  <div ref="wrapper" class="relative">-->
<!--    <button-->
<!--        ref="body"-->
<!--        type="button"-->
<!--        class="select outline-none inline-flex h-10 w-full items-center justify-start gap-2 rounded-xl border bg-[var(&#45;&#45;color-stroke-ui-dark)] px-5 text-[var(&#45;&#45;color-ui-text)] transition-->
<!--           border-[var(&#45;&#45;color-stroke-ui-light)]-->
<!--        "-->
<!--        :class="{'!border-none !bg-[transparent]':withoutOverlay}"-->
<!--        :data-open="isOpen || null"-->
<!--        :data-open-up="dropup || null"-->
<!--        :data-invalid="(props.isDirty && props.isInvalid) || null"-->
<!--        :aria-expanded="isOpen ? 'true' : 'false'"-->
<!--        aria-haspopup="listbox"-->
<!--        @click.stop="toggle"-->
<!--    >-->
<!--      <div v-if="slots['icon-left']" class="shrink-0">-->
<!--        <slot name="icon-left"/>-->
<!--      </div>-->

<!--      <UiTextSmall-->
<!--          class="block w-full text-left text-[0.875rem] font-medium"-->
<!--          v-html="displayText"-->
<!--      />-->

<!--      <div class="ml-2 shrink-0">-->
<!--        <UiIconArrowDown :rotate180="isOpen"/>-->
<!--      </div>-->
<!--    </button>-->

<!--    <div-->
<!--        v-if="isOpen"-->
<!--        ref="menu"-->
<!--        class="absolute left-0 z-50 w-full overflow-y-auto rounded border bg-[var(&#45;&#45;color-stroke-ui-dark)] p-2 shadow-lg-->
<!--             border-[var(&#45;&#45;color-stroke-ui-light)]-->
<!--             data-[down=true]:top-full data-[down=true]:mt-2-->
<!--             data-[up=true]:bottom-full data-[up=true]:mb-2"-->
<!--        role="listbox"-->
<!--        :data-down="(!dropup) || null"-->
<!--        :data-up="(dropup) || null"-->
<!--        :style="dropdownInlineStyle"-->
<!--        @click.stop-->
<!--    >-->
<!--      <UiTextSmall-->
<!--          v-if="!withoutNoSelect"-->
<!--          class="select__option block h-10 cursor-pointer rounded px-5 text-[var(&#45;&#45;color-ui-text)] font-semibold text-[0.8125rem] hover:bg-[var(&#45;&#45;color-stroke-ui-light)]"-->
<!--          :class="{ 'opacity-80': internalValue === null }"-->
<!--          role="option"-->
<!--          :aria-selected="internalValue === null ? 'true' : 'false'"-->
<!--          @click="choose(null)"-->
<!--      >{{ t('ui-components.ui-select') }}-->
<!--      </UiTextSmall>-->

<!--      <UiTextSmall-->
<!--          v-for="item in data"-->
<!--          :key="item.value"-->
<!--          class="select__option flex items-center justify-start mb-1 h-10 cursor-pointer rounded px-5 text-[var(&#45;&#45;color-ui-text)] hover:bg-[var(&#45;&#45;color-stroke-ui-light)] last:mb-0"-->
<!--          :class="{ 'font-semibold': internalValue === item.value }"-->
<!--          role="option"-->
<!--          :aria-selected="internalValue === item.value ? 'true' : 'false'"-->
<!--          v-html="item.text"-->
<!--          @click="choose(item)"-->
<!--      />-->
<!--    </div>-->

<!--    <select v-model="internalValue" hidden>-->
<!--      <option v-for="item in data" :key="item.value" :value="item.value" v-html="item.text"></option>-->
<!--    </select>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import {useI18n} from 'vue-i18n'-->
<!--import {useSlots, ref, computed, watch, nextTick, onMounted, onBeforeUnmount} from 'vue'-->
<!--import UiIconArrowDown from '~/components/ui/UiIconArrowDown.vue'-->
<!--import UiTextSmall from '~/components/ui/UiTextSmall.vue'-->

<!--interface Option {-->
<!--  id: string-->
<!--  value: string-->
<!--  text: string-->
<!--}-->

<!--const {t} = useI18n({useScope: 'global'})-->
<!--const slots = useSlots()-->

<!--interface Props {-->
<!--  data: Option[]-->
<!--  value?: string | null-->
<!--  isDirty?: boolean-->
<!--  isInvalid?: boolean-->
<!--  withoutNoSelect?: boolean-->
<!--  withoutOverlay?: boolean-->
<!--}-->

<!--const props = withDefaults(defineProps<Props>(), {-->
<!--  isDirty: false,-->
<!--  isInvalid: false,-->
<!--  withoutNoSelect: false,-->
<!--  withoutOverlay: false,-->
<!--})-->
<!--const emit = defineEmits<{-->
<!--  (e: 'change', v: string | null): void-->
<!--  (e: 'blur', v: string): void-->
<!--}>()-->

<!--const data = props.data-->
<!--const isOpen = ref(false)-->
<!--const dropup = ref(false)-->
<!--const body = ref<HTMLElement | null>(null)-->
<!--const wrapper = ref<HTMLElement | null>(null)-->
<!--const menu = ref<HTMLElement | null>(null)-->

<!--const internalValue = ref<string | null>(props.value ?? null)-->
<!--watch(() => props.value, v => (internalValue.value = v ?? null))-->

<!--const displayText = computed(-->
<!--    () => data.find(i => i.value === internalValue.value)?.text || t('ui-components.ui-select')-->
<!--)-->

<!--const dropdownInlineStyle = ref<Record<string, string>>({})-->

<!--function toggle() {-->
<!--  isOpen.value = !isOpen.value-->
<!--  if (isOpen.value) {-->
<!--    nextTick(() => {-->
<!--      calcPlacement()-->
<!--      addGlobalListeners()-->
<!--    })-->
<!--  } else {-->
<!--    emit('blur', internalValue.value ?? '')-->
<!--    removeGlobalListeners()-->
<!--  }-->
<!--}-->

<!--function calcPlacement() {-->
<!--  if (!body.value) return-->
<!--  const rect = body.value.getBoundingClientRect()-->
<!--  const margin = 8 // відступ від поля-->
<!--  const viewportH = window.innerHeight-->

<!--  const spaceBelow = viewportH - rect.bottom - margin-->
<!--  const spaceAbove = rect.top - margin-->

<!--  // орієнтація: якщо знизу не поміщається — відкриваємо вгору-->
<!--  dropup.value = spaceBelow < 160 && spaceAbove > spaceBelow-->

<!--  // динамічний max-height списку (щоб не “вилазив” за екран)-->
<!--  const maxH = Math.max(120, Math.min(250, dropup.value ? spaceAbove : spaceBelow))-->
<!--  dropdownInlineStyle.value = {-->
<!--    maxHeight: `${Math.floor(maxH)}px`,-->
<!--  }-->
<!--}-->

<!--function choose(item: Option | null) {-->
<!--  isOpen.value = false-->
<!--  internalValue.value = item?.value ?? null-->
<!--  emit('change', internalValue.value)-->
<!--  emit('blur', internalValue.value ?? '')-->
<!--  removeGlobalListeners()-->
<!--}-->

<!--function onClickOutside(e: MouseEvent) {-->
<!--  const el = wrapper.value-->
<!--  if (!el) return-->
<!--  if (!el.contains(e.target as Node)) {-->
<!--    isOpen.value = false-->
<!--    emit('blur', internalValue.value ?? '')-->
<!--    removeGlobalListeners()-->
<!--  }-->
<!--}-->

<!--function onKeydown(e: KeyboardEvent) {-->
<!--  if (!isOpen.value) return-->
<!--  if (e.key === 'Escape') {-->
<!--    isOpen.value = false-->
<!--    emit('blur', internalValue.value ?? '')-->
<!--    removeGlobalListeners()-->
<!--  }-->
<!--}-->

<!--function onWindowChange() {-->
<!--  if (isOpen.value) calcPlacement()-->
<!--}-->

<!--function addGlobalListeners() {-->
<!--  document.addEventListener('click', onClickOutside, true)-->
<!--  window.addEventListener('resize', onWindowChange, {passive: true})-->
<!--  window.addEventListener('scroll', onWindowChange, {passive: true})-->
<!--  document.addEventListener('keydown', onKeydown)-->
<!--}-->

<!--function removeGlobalListeners() {-->
<!--  document.removeEventListener('click', onClickOutside, true)-->
<!--  window.removeEventListener('resize', onWindowChange)-->
<!--  window.removeEventListener('scroll', onWindowChange)-->
<!--  document.removeEventListener('keydown', onKeydown)-->
<!--}-->

<!--onMounted(() => {-->
<!--  calcPlacement()-->
<!--})-->
<!--onBeforeUnmount(removeGlobalListeners)-->
<!--</script>-->

<template>
  <div ref="wrapper" class="relative">
    <button
        ref="body"
        type="button"
        class="select outline-none inline-flex h-10 w-full items-center justify-start gap-2 rounded-xl border bg-[var(--color-stroke-ui-dark)] px-5 text-[var(--color-ui-text)] transition
           border-[var(--color-stroke-ui-light)]
        "
        :class="{ '!border-none !bg-[transparent]': withoutOverlay }"
        :data-open="isOpen || null"
        :data-open-up="dropup || null"
        :data-invalid="(props.isDirty && props.isInvalid) || null"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-haspopup="listbox"
        @click.stop="toggle"
    >
      <div v-if="slots['icon-left']" class="shrink-0">
        <slot name="icon-left" />
      </div>

      <UiTextSmall
          class="block w-full text-left text-[0.875rem] font-medium"
          v-html="displayText"
      />

      <div class="ml-2 shrink-0">
        <UiIconArrowDown :rotate180="isOpen" />
      </div>
    </button>

    <div
        v-if="isOpen"
        ref="menu"
        class="absolute left-0 z-50 w-full overflow-y-auto rounded border bg-[var(--color-stroke-ui-dark)] p-2 shadow-lg
             border-[var(--color-stroke-ui-light)]
             data-[down=true]:top-full data-[down=true]:mt-2
             data-[up=true]:bottom-full data-[up=true]:mb-2"
        role="listbox"
        :data-down="(!dropup) || null"
        :data-up="(dropup) || null"
        :style="dropdownInlineStyle"
        @click.stop
        @scroll.passive="onMenuScroll"
    >
      <UiTextSmall
          v-if="!withoutNoSelect"
          class="select__option block h-10 cursor-pointer rounded px-5 text-[var(--color-ui-text)] font-semibold text-[0.8125rem] hover:bg-[var(--color-stroke-ui-light)]"
          :class="{ 'opacity-80': internalValue === null }"
          role="option"
          :aria-selected="internalValue === null ? 'true' : 'false'"
          @click="choose(null)"
      >
        {{ t('ui-components.ui-select') }}
      </UiTextSmall>

      <UiTextSmall
          v-for="item in data"
          :key="item.value"
          class="select__option flex items-center justify-start mb-1 h-10 cursor-pointer rounded px-5 text-[var(--color-ui-text)] hover:bg-[var(--color-stroke-ui-light)] last:mb-0"
          :class="{ 'font-semibold': internalValue === item.value }"
          role="option"
          :aria-selected="internalValue === item.value ? 'true' : 'false'"
          v-html="item.text"
          @click="choose(item)"
      />
    </div>

    <select v-model="internalValue" hidden>
      <option v-for="item in data" :key="item.value" :value="item.value" v-html="item.text"></option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useSlots, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import UiIconArrowDown from '~/components/ui/UiIconArrowDown.vue'
import UiTextSmall from '~/components/ui/UiTextSmall.vue'

interface Option {
  id: string
  value: string
  text: string
}

const { t } = useI18n({ useScope: 'global' })
const slots = useSlots()

interface Props {
  data: Option[]
  value?: string | null
  isDirty?: boolean
  isInvalid?: boolean
  withoutNoSelect?: boolean
  withoutOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDirty: false,
  isInvalid: false,
  withoutNoSelect: false,
  withoutOverlay: false,
})

const emit = defineEmits<{
  (e: 'change', v: string | null): void
  (e: 'blur', v: string): void
  (e: 'loadMore'): void
}>()

const data = computed<Option[]>(() => props.data)

const isOpen = ref(false)
const dropup = ref(false)
const body = ref<HTMLElement | null>(null)
const wrapper = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)

const internalValue = ref<string | null>(props.value ?? null)
watch(() => props.value, v => (internalValue.value = v ?? null))

const displayText = computed(
    () => data.value.find(i => i.value === internalValue.value)?.text || t('ui-components.ui-select')
)

const dropdownInlineStyle = ref<Record<string, string>>({})

const loadMoreLocked = ref(false)
const canLoadMore = computed(() => data.value.length >= 10)

watch(
    () => data.value.length,
    () => {
      loadMoreLocked.value = false
    }
)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      calcPlacement()
      addGlobalListeners()
    })
  } else {
    emit('blur', internalValue.value ?? '')
    removeGlobalListeners()
  }
}

function calcPlacement() {
  if (!body.value) return
  const rect = body.value.getBoundingClientRect()
  const margin = 8
  const viewportH = window.innerHeight

  const spaceBelow = viewportH - rect.bottom - margin
  const spaceAbove = rect.top - margin

  dropup.value = spaceBelow < 160 && spaceAbove > spaceBelow

  const maxH = Math.max(120, Math.min(250, dropup.value ? spaceAbove : spaceBelow))
  dropdownInlineStyle.value = {
    maxHeight: `${Math.floor(maxH)}px`,
  }
}

function choose(item: Option | null) {
  isOpen.value = false
  internalValue.value = item?.value ?? null
  emit('change', internalValue.value)
  emit('blur', internalValue.value ?? '')
  removeGlobalListeners()
}

function onMenuScroll() {
  if (!isOpen.value || !canLoadMore.value) return
  const el = menu.value
  if (!el) return
  if (el.scrollHeight <= el.clientHeight) return

  const threshold = 16
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold

  if (atBottom) {
    if (!loadMoreLocked.value) {
      loadMoreLocked.value = true
      emit('loadMore')
    }
  } else {
    loadMoreLocked.value = false
  }
}

function onClickOutside(e: MouseEvent) {
  const el = wrapper.value
  if (!el) return
  if (!el.contains(e.target as Node)) {
    isOpen.value = false
    emit('blur', internalValue.value ?? '')
    removeGlobalListeners()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') {
    isOpen.value = false
    emit('blur', internalValue.value ?? '')
    removeGlobalListeners()
  }
}

function onWindowChange() {
  if (isOpen.value) calcPlacement()
}

function addGlobalListeners() {
  document.addEventListener('click', onClickOutside, true)
  window.addEventListener('resize', onWindowChange, { passive: true })
  window.addEventListener('scroll', onWindowChange, { passive: true })
  document.addEventListener('keydown', onKeydown)
}

function removeGlobalListeners() {
  document.removeEventListener('click', onClickOutside, true)
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange)
  document.removeEventListener('keydown', onKeydown)
}

onMounted(() => {
  calcPlacement()
})

onBeforeUnmount(removeGlobalListeners)
</script>
