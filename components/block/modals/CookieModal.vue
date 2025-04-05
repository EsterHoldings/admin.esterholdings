<template>
  <div>
    <div v-if="showCookieModal" class="cookie-modal">
      <UiTextH5 class="cookie-modal_text">
        This site uses cookies to enhance user experience. By continuing to use
        the site, you agree to our use of cookies.
      </UiTextH5>
      <div class="cookie-modal__actions">
        <UiButtonDefault state="primary" @click="acceptCookies">
          Accept
        </UiButtonDefault>
        <UiButtonDefault state="warning" @click="declineCookies">
          Decline
        </UiButtonDefault>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";

const showCookieModal = ref(false);

const checkScroll = () => {
  if (window.scrollY > 80) {
    showCookieModal.value = true;
    window.removeEventListener("scroll", checkScroll);
  }
};

const acceptCookies = () => {
  showCookieModal.value = false;
  localStorage.setItem("cookiesAccepted", true);
};

const declineCookies = () => {
  showCookieModal.value = false;
};

onMounted(() => {
  if (!localStorage.getItem("cookiesAccepted")) {
    window.addEventListener("scroll", checkScroll);
  }
});
</script>

<style lang="scss" scoped>
.cookie-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px;
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  z-index: 10001;
  transition: transform 0.3s ease-in-out;

  &_text {
    color: var(--ui-text-main);
  }
}

.cookie-modal__actions {
  display: flex;
  gap: 10px;
}
</style>
