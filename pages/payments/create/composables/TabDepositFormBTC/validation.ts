import useValidation from "../../../../../composables/useValidation";

import {formData} from "./index";

export const validatorBTCDataForm: any = useValidation(formData, {
    amount: ["required", "isDecimal"],
    comment: ["max:254"],
});

export const validateBTCDataForm = (doSendFormCallback: any): void =>
    validatorBTCDataForm.doValidate() && doSendFormCallback();
export const resetValidationBTCDataForm = (): void =>
    validatorBTCDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
    formData.amount = "";
    formData.comment = "";
};
