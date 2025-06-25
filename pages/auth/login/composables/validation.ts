import useValidation from "@/composables/useValidation";

import { formData } from "./index";

export const validatorLoginForm: any = useValidation(formData, {
  email: ["required", "isEmail"],
  password: ["required", "min:6", "max:32"],
});

export const validateLoginForm = (doSendFormCallback: any): void =>
  validatorLoginForm.doValidate() && doSendFormCallback();
export const resetValidationLoginForm = (): void =>
  validatorLoginForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
  formData.email = "";
  formData.password = "";
  formData.twoFaCode = "";
};
