<template>
  <section class="faqs-section">
    <div class="faqs-container">
      <UiTextH2 class="faqs-main-title">FAQs</UiTextH2>

      <div class="faqs-content">
        <!-- FAQ Accordion Column -->
        <div class="faq-column">
          <TheFaqAccordion :items="faqData" />
          <!-- Accordion not working -->
          <!-- <UiAccordion :data="faqData" /> -->
          <div class="help-link">
            <UiTextParagraph class="help-link__text">{{ t("landing.sections.helpSection") }} </UiTextParagraph>
            <a
              href="#"
              class="help-block__link"
              >{{ t("landing.sections.helpLinkText") }}</a
            >
          </div>
        </div>

        <!-- Need Help Form Column -->
        <div class="form-column">
          <div class="help-form">
            <UiTextH3 class="form-title">{{ t("landing.sections.faqs__form_title") }}</UiTextH3>
            <UiTextParagraph class="form-subtitle">{{ t("landing.sections.faqs__form_subtitle") }} </UiTextParagraph>

            <div class="form-fields">
              <UiInput
                v-model="formData.name"
                :placeholder="t('landing.sections.faqs__form_placeholders.name')"
                @input="val => (formData.name = val)" />

              <UiInput
                v-model="formData.email"
                type="email"
                :placeholder="t('landing.sections.faqs__form_placeholders.email')"
                @input="val => (formData.email = val)" />

              <UiTextarea
                v-model="formData.description"
                :placeholder="t('landing.sections.faqs__form_placeholders.description')"
                @input="val => (formData.description = val)" />

              <div class="drag-drop-wrapper">
                <UiDragAndDrop @files="handleFiles" />
              </div>

              <UiButtonDefault
                state="primary"
                class="send-button">
                {{ t("landing.sections.faqs__form_button") }}
              </UiButtonDefault>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import TheFaqAccordion from "~/components/block/TheFaqAccordion.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";
  import UiDragAndDrop from "~/components/ui/UiDragAndDrop.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiTextH2 from "~/components/ui/UiTextH2.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  // Accordion not working
  // import UiAccordion from '~/components/ui/UiAccordion.vue';

  const { t, tm } = useI18n();

  const faqDataRaw = tm("landing.sections.faqs__items") as any[];

  const faqData = ref(
    Array.isArray(faqDataRaw)
      ? faqDataRaw.map((_, index) => ({
          title: t(`landing.sections.faqs__items[${index}].title`),
          description: t(`landing.sections.faqs__items[${index}].description`),
          isActive: index === 0,
        }))
      : []
  );

  const formData = ref({
    name: "",
    email: "",
    description: "",
    files: [] as File[],
  });

  const handleFiles = (files: File[]) => {
    formData.value.files = files;
  };
</script>

<style lang="scss" scoped>
  .faqs-section {
    padding: 80px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .faqs-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .faqs-main-title {
    font-family: Muli, sans-serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    margin-bottom: 60px;
  }

  .faqs-content {
    display: grid;
    grid-template-columns: 1fr 480px;
    gap: 60px;
    align-items: start;
  }

  .faq-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .help-link {
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 10px;

    &__text {
      font-family: Muli, sans-serif;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
      display: inline;
    }
  }

  .help-block__link {
    color: #f75709;
    font-weight: 700;
    font-size: 20px;
    cursor: pointer;
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease-in-out;

    &:hover {
      text-decoration: underline;
    }
  }

  .form-column {
    width: 100%;
  }

  .help-form {
    background: var(--ui-background);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 15px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-title {
    font-family: Muli, sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    margin: 0;
  }

  .form-subtitle {
    font-family: Muli, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 20px 0;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .drag-drop-wrapper {
    position: relative;
    min-height: 99px;
  }

  .send-button {
    width: 100%;
    height: 42px;
    margin-top: 8px;
  }

  @media (max-width: 991px) {
    .faqs-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .faq-column,
    .form-column {
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .faqs-section {
      padding: 60px 20px;
    }

    .faqs-main-title {
      font-size: 28px;
      margin-bottom: 40px;
    }

    .help-form {
      padding: 20px;
    }

    .form-title {
      font-size: 20px;
    }

    .form-subtitle {
      font-size: 16px;
    }
  }
</style>
