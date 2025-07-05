import useValidation from "../../../../../composables/useValidation";

import { formData } from ".";

export const validatorClientForm: any = useValidation(formData, {
    roles: ["required"],
});

export const validateClientForm: any = (doSendFormCallback: any): void =>
    validatorClientForm.doValidate() && doSendFormCallback();
export const resetValidationClientForm: any = (): void =>
    validatorClientForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.roles = [];
};
