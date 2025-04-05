<template>
  <UiContainer>
    <footer>
      <div class="footer__content">
        <ul class="logo">
          <li>
            <UiIconLogo
              :class="{ 'svg-invert': themeStore.currentTheme !== 'dark' }"
            />
          </li>

          <li>
            <UiTextH6 class="logo-text"
              >The main goal of Ester is to create the best and most transparent
              conditions for retail and corporate traders.
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

        <FooterItem title="Trading" :items="trading" />
        <FooterItem title="Partnership" :items="partnership" />
        <FooterItem title="Company" :items="company" />
      </div>

      <div class="line"></div>

      <div class="text-wrapper">
        <UiTextSmall class="text"
          >Ester is the official trading name which is regulated by the
          Seychelles Financial Services Authority (FSA) and holds a Securities
          Dealer License No. SD018.
        </UiTextSmall>

        <UiTextSmall class="text">
          <strong> Risk Warning: </strong> and CFD trading carries a high level
          of risk and can result in the loss of capital. You should only invest
          with money you can afford to lose. Trading live instruments cannot be
          stopped under any circumstances, so it is important that you fully
          understand the risks involved and seek independent advice if
          necessary. Please read our risk disclosure and ensure you fully
          understand it.
        </UiTextSmall>

        <UiTextSmall class="text">
          <strong>Restricted Countries:</strong>  Raw Trading Ltd does not
          provide its services to residents of a number of countries, including
          the United States, Canada, Israel, New Zealand, Iran and North Korea
          (Democratic People's Republic of Korea), as well as other
          jurisdictions where such activities are contrary to local law.
        </UiTextSmall>

        <UiTextSmall class="text">
          To register an account with Ester, you must be at least 18 years old
          or have reached the age of majority in accordance with the laws of
          your country. By creating an account, you confirm that you are
          registering on your own initiative, without any solicitation or offer
          from Ester.
        </UiTextSmall>

        <UiTextSmall class="text">
          Ester does not direct its services or website content to users in
          countries where their use is prohibited by local laws. If you access
          this website from a restricted country, you are responsible for
          compliance with local laws. The Company also does not warrant that the
          information provided complies with the requirements of all
          jurisdictions.
        </UiTextSmall>
      </div>

      <UiTextSmall class="text center">
        © 2025 Ester | All rights reserved.
      </UiTextSmall>
    </footer>
  </UiContainer>
</template>

<script setup>
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

const trading = [
  "Account overview",
  "Markets",
  "Platform",
  "Terms of trade",
  "Tandem trading",
];

const partnership = ["Register IB\ Partnership", "How IB generate income"];

const company = [
  "About the company",
  "Documents",
  "Company news",
  "Contacts",
  "Career",
];
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
    margin-top: 0;
  }
  .footer__content {
    flex-wrap: wrap;
    gap: 30px;
  }
}

@media (max-width: 576px) {
  .logo {
    width: 100%;
    align-items: center;
  }
}
</style>
