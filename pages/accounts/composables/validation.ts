import useValidation from "~/composables/useValidation";

import { formData } from ".";

export const validatorAccountForm: any = useValidation(formData, {
    accountType: ["required"],
    phonePassword: ["required"],
});

export const validateAccountForm: any = (doSendFormCallback: any): void =>
    validatorAccountForm.doValidate() && doSendFormCallback();
export const resetValidationAccountForm: any = (): void =>
    validatorAccountForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.accountType = '';
    formData.phonePassword = '';
};
