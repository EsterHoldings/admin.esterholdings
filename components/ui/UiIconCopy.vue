<template>
  <button
      class="copy-btn"
      type="button"
      :aria-label="done ? 'Скопійовано' : 'Копіювати'"
      :disabled="animating"
      @click="onClick"
  >
    <!-- Ripple -->
    <span class="ripple" :class="{ run: animating }" />

    <!-- Copy icon -->
    <svg
        v-show="!done"
        class="icon copy"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
    >
      <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"
      />
    </svg>

    <!-- Check icon -->
    <svg
        v-show="done"
        class="icon check"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
    >
      <path
          class="tick"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 9l3 3 7-7"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ text: string }>();

const done = ref(false);
const animating = ref(false);

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

const onClick = async () => {
  if (animating.value) return;
  animating.value = true;

  try {
    await copyToClipboard(props.text);
    // Показуємо галочку
    done.value = true;
    // Тривалість відображення "успіху"
    setTimeout(() => {
      done.value = false;
      animating.value = false;
    }, 900);
  } catch {
    // Якщо щось пішло не так — просто знімаємо анімацію
    animating.value = false;
  }
};
</script>

<style lang="scss" scoped>
.copy-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 28px; // трохи більша зона кліку
  height: 28px;

  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  border-radius: 8px;
  outline: none;

  // крихітний ховер-ефект
  &:hover .icon.copy {
    transform: scale(1.06);
  }

  &:active .icon.copy {
    transform: scale(0.94);
  }

  &:disabled {
    cursor: default;
    opacity: 0.8;
  }
}

.icon {
  width: 18px;
  height: 18px;
  transition: transform 140ms ease, opacity 140ms ease;

  &.copy {
    // підстрибування при старті
  }

  &.check {
    // по замовчуванню прихована (плавно з'являється через v-show)
  }
}

/* Ripple */
.ripple {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.8);
  box-shadow: 0 0 0 0 currentColor;
}

.ripple.run {
  animation: ripplePop 420ms ease-out;
}

@keyframes ripplePop {
  0% {
    opacity: 0.18;
    transform: scale(0.9);
    box-shadow: 0 0 0 0 currentColor;
  }
  60% {
    opacity: 0.12;
    transform: scale(1.08);
    box-shadow: 0 0 0 6px color-mix(in srgb, currentColor 30%, transparent);
  }
  100% {
    opacity: 0;
    transform: scale(1.12);
    box-shadow: 0 0 0 10px transparent;
  }
}

/* Анімація галочки — малювання лінії */
.check .tick {
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: draw 420ms ease forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Дрібний pop для копі-іконки у момент кліку */
.copy-btn:active .icon.copy {
  animation: pop 180ms ease;
}

@keyframes pop {
  0% {
    transform: scale(0.94);
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
</style>
