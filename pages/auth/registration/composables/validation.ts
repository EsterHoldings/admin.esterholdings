import useValidation from "@/composables/useValidation";

import { formData } from ".";

export const validatorRegistrationForm: any = useValidation(formData, {
  email: ["unique:users,email", "required", "isEmail"],
  password: ["required"],
  confirmPassword: ["required"],
});

export const validateRegistrationForm: any = (doSendFormCallback: any): void =>
  validatorRegistrationForm.doValidate() && doSendFormCallback();

export const resetValidationRegistrationForm: any = (): void => {
  validatorRegistrationForm.clearFieldsErrors() && resetFormData();
};

export const resetFormData: any = (): void => {
  formData.email = "";
  formData.password = "";
};
