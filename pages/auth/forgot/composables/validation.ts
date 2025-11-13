import useValidation from "@/composables/useValidation";

import { formData } from "../composables";
import { validatorLoginForm } from "~/pages/auth/login/composables/validation";

export const validatorForgotForm: any = useValidation(formData, {
  email: ["required", "isEmail"],
});

export const validateForgotForm: any = (doSendFormCallback: any): void =>
  validatorForgotForm.doValidate() ? doSendFormCallback() : null;

export const resetValidationForgotForm: any = (): void =>
  validatorForgotForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
  formData.email = "";
};
