<template>
  <UiContainer>
    <div class="contacts">
      <UiTextH3 class="contacts_title">{{ t('landing.pages.company.contacts.title') }}</UiTextH3>


      <div class="contacts_wrapper">
        <PanelDefault class="p-5 w-[50%]">
          <div class="contacts_wrapper_address">
            <UiTextH4>{{ t('landing.pages.company.contacts.office_title') }}</UiTextH4>
            <UiTextH6>
              <strong>{{ t('landing.pages.company.contacts.office_name') }}</strong
              >,<br/>
              {{ t('landing.pages.company.contacts.office_address') }}<br/>
              {{ t('landing.pages.company.contacts.office_registration') }}
            </UiTextH6>
          </div>
        </PanelDefault>

        <PanelDefault class="p-5 w-[50%]">
          <div class="contacts_wrapper_conect">
            <div class="contacts_wrapper_conect-item">
              <UiIconLetter/>
              <UiTextH5>
                {{ t('landing.pages.company.contacts.support_label') }}
                <br/>
                <span>{{ t('landing.pages.company.contacts.support_email') }}</span>
              </UiTextH5>
            </div>

            <div class="contacts_wrapper_conect-item">
              <UiIconLetter/>
              <UiTextH5>
                {{ t('landing.pages.company.contacts.finance_label') }}
                <br/>
                <span>{{ t('landing.pages.company.contacts.finance_email') }}</span>
              </UiTextH5>
            </div>

            <div class="contacts_wrapper_conect-item">
              <UiIconLetter/>
              <UiTextH5>
                {{ t('landing.pages.company.contacts.marketing_label') }}<br/>
                <span>{{ t('landing.pages.company.contacts.marketing_email') }}</span>
              </UiTextH5>
            </div>
          </div>
        </PanelDefault>
      </div>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
import {definePageMeta} from '~/.nuxt/imports';
import {useI18n} from 'vue-i18n';
import UiContainer from '~/components/ui/UiContainer.vue';
import UiTextH3 from '~/components/ui/UiTextH3.vue';
import UiTextH4 from '~/components/ui/UiTextH4.vue';
import UiTextH6 from '~/components/ui/UiTextH6.vue';
import UiIconLetter from '~/components/ui/UiIconLetter.vue';
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

definePageMeta({
  layout: 'main',
  alias: '/contacts',
});

const {t} = useI18n();
</script>

<style lang="scss" scoped>
.contacts {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
  }

  &_wrapper {
    display: flex;
    align-items: self-start;
    justify-content: space-between;
    gap: 20px;

    &_address {
      color: var(--ui-text-main);

      h6 {
        margin-top: 15px;
        line-height: 22px;

        strong {
          font-weight: 700;
        }
      }
    }

    &_conect {
      display: flex;
      flex-direction: column;
      gap: 20px;

      &-item {
        display: flex;
        align-items: start;
        gap: 5px;
        color: var(--ui-text-main);

        h5 {
          span {
            line-height: 10px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
