import useValidation from "../../../../../composables/useValidation";

import {formData} from "./index";

export const validatorUsdtErcDataForm: any = useValidation(formData, {
    amount: ["required", "isDecimal"],
    comment: ["max:254"],
});

export const validateUsdtErcDataForm = (doSendFormCallback: any): void =>
    validatorUsdtErcDataForm.doValidate() && doSendFormCallback();
export const resetValidationUsdtErcDataForm = (): void =>
    validatorUsdtErcDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
    formData.amount = "";
    formData.comment = "";
};
