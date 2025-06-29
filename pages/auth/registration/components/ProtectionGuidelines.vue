<template>
  <UiContainer>
    <div class="about-company">
      <UiTextH3 class="about-company_title">Data Protection Guidelines</UiTextH3>

      <div class="about-company_text">
        <UiTextParagraph>
          <span>Policy of non-disclosure of personal information of our clients.</span> Ester Holdings Inc. pays great
          attention to the protection and confidentiality of its clients' personal and financial data.
        </UiTextParagraph>

        <UiTextParagraph>
          We use advanced security technologies to enhance the confidentiality of all information received, ensuring our
          clients can work reliably with our financial tools.
        </UiTextParagraph>

        <UiTextParagraph>
          Personal and contact data are provided directly by the client when applying to open an account or
          participating in programs such as promotions, bonuses, or contests.
        </UiTextParagraph>

        <UiTextParagraph>
          This data is used exclusively for communication with the client and is not disclosed to third parties, except
          as required by law or as outlined below:
        </UiTextParagraph>

        <ul class="about-company_list">
          <li>The company may transfer data to agents or third parties acting under agreement with Ester Holdings Inc.
            to fulfill obligations to the client, including those carried out by partners.
          </li>
          <li>We may use "cookies" which do not contain any confidential information and are not shared with third
            parties.
          </li>
          <li>Information about a client’s IP address is not used to identify individuals, but may be collected and
            stored.
          </li>
          <li>If a client publishes their data on the company's website in a publicly accessible manner, the company
            bears no responsibility.
          </li>
          <li>If a client voluntarily shares their contact information, login, or password with third parties, the
            company is not responsible.
          </li>
        </ul>

        <UiTextParagraph>
          Ester Holdings Inc. uses contact data solely to fulfill its obligations to the client, and for evaluation and
          analysis of its activity and website operations, as well as to identify participants and winners of
          company-run campaigns and contests.
        </UiTextParagraph>

        <UiTextParagraph>
          Using lawfully obtained personal data, Ester Holdings Inc. reserves the right to send clients advertising and
          informational communications.
        </UiTextParagraph>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

definePageMeta({
  layout: "main",
  alias: "/data-protection-guidelines",
});
</script>

<style lang="scss" scoped>
.about-company {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }

  &_text {
    display: flex;
    flex-direction: column;
    gap: 20px;

    p {
      color: var(--ui-text-main);
      line-height: 25px;

      span {
        font-weight: 700;
        color: #138ee7;
      }
    }
  }

  &_list {
    list-style: disc;
    padding-left: 20px;
    color: var(--ui-text-main);
    line-height: 24px;
    font-size: 15px;
  }
}
</style>