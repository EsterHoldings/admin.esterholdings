import useValidation from "~/composables/useValidation";

import {formData} from "./index";

export const validatorUserDataForm: any = useValidation(formData, {
    email: ["required", "isEmail"],
    first_name: ["required", "max:50"],
    last_name: ["required", "max:50"],
    mid_name: ["max: 50"],
    birthdate: ["required", "max:50"],
    phone: ["required", "min:8", "max:20"],
    country: ["required", "max:50"],
    state: ["required", "max:50"],
    city: ["required", "max:50"],
    address: ["required", "max:200"],
    postal_code: ["required", "max:20"],
});

export const validateUserDataForm = (doSendFormCallback: any): void =>
    validatorUserDataForm.doValidate() && doSendFormCallback();
export const resetValidationUserDataForm = (): void =>
    validatorUserDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
    formData.email = "";
    formData.first_name = "";
    formData.last_name = "";
    formData.mid_name = "";
    formData.birthdate = "";
    formData.phone = "";
    formData.country = "";
    formData.state = "";
    formData.city = "";
    formData.address = "";
    formData.postal_code = "";
};
