import useValidation from "~/composables/useValidation";

import { formData } from ".";

export const validatorAdminForm: any = useValidation(formData, {
    nickname: ["required"],
    email: ["unique:admins,email", "required", "isEmail", "min:3", "max:190"],
    password: ["required", "min:8", "max:120"],
    roles: ["required"],
});

export const validateAdminForm: any = (doSendFormCallback: any): void =>
    validatorAdminForm.doValidate() && doSendFormCallback();
export const resetValidationAdminForm: any = (): void =>
    validatorAdminForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.nickname = "";
    formData.email = "";
    formData.password = "";
    formData.roles = [];
};
