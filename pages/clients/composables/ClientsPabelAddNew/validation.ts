import useValidation from "../../../../composables/useValidation";

import { formData } from "./index";

export const validatorClientForm: any = useValidation(formData, {
    email: ["unique:users,email", "required", "isEmail"],
    first_name: ["required", "min:2", "max:50"],
    last_name: ["required", "min:2", "max:50"],
    mid_name: ["required", "min:2", "max:50"],
    birthdate: ["required"], // ?
    phone: ["required", "min:9", "max:20"],
    country: ["required"],
    state: ["required"],
    city: ["required"],
    address: ["required", "min:2", "max:50"],
    postal_code: ["required", "min:2", "max:10"],
    password: ["required", "min:6", "max:50"],
    password_confirmation: ["required", "passwordConfirmation"],
});

export const validateClientForm: any = (doSendFormCallback: any): void =>
    validatorClientForm.doValidate() && doSendFormCallback();
export const resetValidationRoleForm: any = (): void =>
    validatorClientForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.value.name = "";
    formData.value.permissions = [];
};
