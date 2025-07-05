import useValidation from "~/composables/useValidation";

import { formData } from "./index";

export const validatorRoleForm: any = useValidation(formData, {
    name: ["unique:roles,name", "required", "min:3", "max:20"],
    permissions: ["required"],
});

export const validateRoleForm: any = (doSendFormCallback: any): void =>
    validatorRoleForm.doValidate() && doSendFormCallback();
export const resetValidationRoleForm: any = (): void =>
    validatorRoleForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.name = "";
    formData.permissions = [];
};
