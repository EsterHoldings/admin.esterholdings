import useValidation from "../../../../../composables/useValidation";

import { formData } from "./index";

export const validatorChangePasswordDataForm: any = useValidation(formData, {
  oldPassword: ["required", "min:6", "max:22"],
  newPassword: ["required", "min:6", "max:22"],
  newPasswordConfirmation: ["required", "min:6", "max:22"],
});

export const validateChangePasswordDataForm = (doSendFormCallback: any): void =>
    validatorChangePasswordDataForm.doValidate() && doSendFormCallback();
export const resetValidationChangePasswordDataForm = (): void =>
    validatorChangePasswordDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
  formData.oldPassword = "";
  formData.newPassword = "";
  formData.newPasswordConfirmation = "";
};
