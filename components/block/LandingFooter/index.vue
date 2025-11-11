<template>
  <UiContainer>
    <footer>
      <div class="footer__content">
        <ul class="logo">
          <li>
            <UiIconLogo
              class="logo-svg"
              :class="{ 'svg-invert': themeStore.currentTheme !== 'dark' }" />
          </li>

          <li>
            <UiTextH6 class="logo-text">{{ t("landing.footer.description") }} </UiTextH6>
          </li>

          <li class="logo-icons">
            <UiIconFacebook :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }" />
            <UiIconLinkedIn :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }" />
            <UiIconInstagram :class="{ 'svg-fill': themeStore.currentTheme === 'dark' }" />
          </li>
        </ul>

        <FooterLink basePath="landing.footer.trading" />

        <FooterLink basePath="landing.footer.partnership" />

        <FooterLink basePath="landing.footer.company" />
      </div>

      <div class="line"></div>

      <div class="company-info">
        <div class="company-info__left">
          <UiTextSmall class="text">
            <strong>{{ t("landing.footer.legal.company_name") }}</strong>
          </UiTextSmall>

          <UiTextSmall class="text">
            {{ t("landing.footer.legal.company_address") }}
          </UiTextSmall>
        </div>

        <div class="company-info__right">
          <div class="contact-block">
            <UiTextSmall class="text">
              <strong>{{ t("landing.footer.legal.support_service_label") }}</strong>
            </UiTextSmall>
            <UiTextSmall class="text">
              {{ t("landing.footer.legal.support_service_email") }}
            </UiTextSmall>
          </div>

          <div class="contact-block">
            <UiTextSmall class="text">
              <strong>{{ t("landing.footer.legal.finance_service_label") }}</strong>
            </UiTextSmall>
            <UiTextSmall class="text">
              {{ t("landing.footer.legal.finance_service_email") }}
            </UiTextSmall>
          </div>

          <div class="contact-block">
            <UiTextSmall class="text">
              <strong>{{ t("landing.footer.legal.marketing_service_label") }}</strong>
            </UiTextSmall>
            <UiTextSmall class="text">
              {{ t("landing.footer.legal.marketing_service_email") }}
            </UiTextSmall>
          </div>
        </div>
      </div>

      <div class="line"></div>

      <div class="text-wrapper">
        <UiTextSmall class="text">
          {{ t("landing.footer.legal.risk_warning") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("landing.footer.legal.restricted_info") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("landing.footer.legal.restricted_countries") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("landing.footer.legal.age_requirement") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("landing.footer.legal.compliance") }}
        </UiTextSmall>

        <UiTextSmall class="text">
          {{ t("landing.footer.legal.copyright") }}
        </UiTextSmall>
      </div>
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

  import FooterLink from "./components/FooterLink.vue";

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

    .company-info {
      display: flex;
      justify-content: space-between;
      gap: 40px;

      &__left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      &__right {
        flex: 1;
        display: flex;
        // flex-direction: column;
        gap: 20px;
      }
    }

    .contact-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
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

    .company-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    .company-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  @media (max-width: 576px) {
    .logo {
      width: 100%;
    }
  }
</style>
