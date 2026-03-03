import useValidation from "~/composables/useValidation";

import { formData } from ".";

export const validatorTicketForm: any = useValidation(formData, {
  subject: ["required"],
  message: ["required", "maxlength:254"],
});

export const validateTicketForm: any = (doSendFormCallback: any): void =>
  validatorTicketForm.doValidate() && doSendFormCallback();
export const resetValidationTicketForm: any = (): void =>
  validatorTicketForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
  formData.subject = "";
  formData.message = "";
};
