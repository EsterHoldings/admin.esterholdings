import useValidation from "../../../../../composables/useValidation";

import { formData } from ".";

export const validatorAdminForm: any = useValidation(formData, {
    nickname: ["required"],
    email: ["unique:admins,email", "required", "isEmail", "min:3", "max:20"],
    password: ["required", "min:3", "max:20"],
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
