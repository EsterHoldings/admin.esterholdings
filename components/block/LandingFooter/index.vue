<template>
  <UiContainer>
    <footer>
      <div class="footer__content">
        <ul class="logo">
          <li>
            <UiIconLogo
              class="logo-svg"
              :class="{ 'svg-invert': themeStore.currentTheme !== 'dark' }"
            />
          </li>

          <li>
            <UiTextH6 class="logo-text"
              >{{ t("footer.description") }}
            </UiTextH6>
          </li>

          <li class="logo-icons">
            <UiIconFacebook
              :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }"
            />
            <UiIconLinkedIn
              :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }"
            />
            <UiIconInstagram
              :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }"
            />
          </li>
        </ul>

        <FooterItem basePath="footer.trading" />
        <FooterItem basePath="footer.partnership" />
        <FooterItem basePath="footer.company" />
      </div>

      <div class="line"></div>

      <div class="text-wrapper">
        <UiTextSmall class="text">
          {{ t("footer.legal.regulated") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          <strong>{{ t("footer.legal.risk").split(":")[0] }}:</strong>
          {{ t("footer.legal.risk").split(":")[1] }}
        </UiTextSmall>

        <UiTextSmall class="text">
          <strong>{{ t("footer.legal.restricted").split(":")[0] }}:</strong>
          {{ t("footer.legal.restricted").split(":")[1] }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("footer.legal.age") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("footer.legal.compliance") }}
        </UiTextSmall>
      </div>

      <UiTextSmall class="text center">
        {{ t("footer.legal.copyrightStart") }} |
        {{ t("footer.legal.copyrightEnd") }}
      </UiTextSmall>
    </footer>
  </UiContainer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiIconFacebook from "~/components/ui/UiIconFacebook.vue";
import UiIconInstagram from "~/components/ui/UiIconInstagram.vue";
import UiIconLinkedIn from "~/components/ui/UiIconLinkedIn.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import FooterItem from "./components/FooterItem.vue";

import { useThemeStore } from "~/stores/themeStore.js";

const themeStore = useThemeStore();
const { t } = useI18n();
</script>

<style lang="scss" scoped>
footer {
  margin-top: 75px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  h3 {
    color: var(--ui-text-main);
    text-align: center;
  }

  .footer__content {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .logo {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &-svg {
      padding-right: 30px;
    }

    &-text {
      width: 206px;
      color: var(--ui-text-secondary);
    }

    &-icons {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 17px;
    }
  }

  .line {
    height: 1px;
    width: 100%;
    background: var(--color-stroke-ui);
  }

  .text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .text {
    color: var(--ui-text-secondary);
  }

  .center {
    text-align: center;
  }
}

.svg-invert {
  filter: invert(1);
}

.svg-fill {
  color: #0d6efd;
  fill: currentColor;
}

@media (max-width: 991px) {
  footer {
    padding: 40px;
    margin-top: 35px;
  }
}

@media (max-width: 767px) {
  footer {
    padding: 15px;
    margin-top: 0;
  }
  .footer__content {
    flex-direction: column;
    gap: 30px;
  }

  .logo {
    .logo-text {
      width: 100%;
    }
  }
}

@media (max-width: 576px) {
  .logo {
    width: 100%;
  }
}
</style>
