import useValidation from "../../../../../composables/useValidation";

import {formData} from "./index";

export const validatorUsdtTrcDataForm: any = useValidation(formData, {
    accountId: ["required"],
    amount: ["required", "isDecimal"],
    comment: ["max:254"],
});

export const validateUsdtTrcDataForm = (doSendFormCallback: any): void =>
    validatorUsdtTrcDataForm.doValidate() && doSendFormCallback();
export const resetValidationUsdtTrcDataForm = (): void =>
    validatorUsdtTrcDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
    formData.accountId = "";
    formData.amount = "";
    formData.comment = "";
};
