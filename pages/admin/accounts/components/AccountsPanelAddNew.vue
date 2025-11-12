<template>
  <div class="roles-panel__add-new">
    <div class="roles-panel__add-new__top" v-if="props.title">
      <UiTextH2>{{ props.title }}</UiTextH2>
    </div>

    <div
      class="roles-panel__add-new__content"
      :class="{ 'without-top': !props.title }"
    >

    </div>
  </div>

  <div class="roles-panel__add-new__bottom">
    <UiButtonDefault
      class="roles-panel__add-new__bottom__save-btn"
      state="secondary"
      @click="handleSubmitForm"
    >
      {{
        t("admin.accounts.components.accounts-panel-add-new.submit")
      }}</UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { inject } from "vue";
import { onMounted } from "vue";

import {
  formData,
} from "~/pages/admin/accounts/composables/AccountsPanelEdit";
import { validatorAccountForm } from "~/pages/admin/accounts/composables/AccountsPanelEdit/validation";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiDatePicker from "~/components/ui/UiDatePicker.vue";

const { t } = useI18n({ useScope: "global" });
const app = useAppCore();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const { closeModal } = inject("modalControl") as { closeModal: Function };

const validateThisField = () => {};

const handleUpdateMultiSelectPermissions = (selectedId: string) => {
  const index = formData.permissions.indexOf(selectedId);
  if (index !== -1) {
    formData.permissions.splice(index, 1);
  } else {
    formData.permissions.push(selectedId);
  }
  validateThisField();
};

const handleRemoveMultiSelectPermission = (id: string) => {
  const index = formData.permissions.indexOf(id);
  if (index !== -1) formData.permissions.splice(index, 1);
  validateThisField();
};

const handleChangeSelectCountry = (value: string | null) => {
  console.log("handleChangeSelectCountry", value);
  formData.country = value;
};

const handleChangeSelectCity = (value: string | null) => {
  console.log("handleChangeSelectCity", value);
  formData.city = value;
};

const handleSubmitForm = async () => {};

onMounted(async () => {});
</script>

<style lang="scss" scoped>
.roles-panel__add-new {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid gainsboro;
  }

  &__content {
    height: calc(100vh - 120px);
    overflow-x: scroll;

    &.without-top {
      height: calc(100vh - 50px);
    }

    &__fields {
      padding: 40px;

      .ui-form-control {
        margin-bottom: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  &__bottom {
    height: 70px;

    padding-left: 40px;
    padding-right: 40px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-top: 1px solid gainsboro;

    .btn {
      height: 40px;
    }
  }
}
</style>
