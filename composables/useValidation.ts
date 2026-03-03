import { reactive } from "vue";

import IsRequired from "./services/validation/rules/isRequired";
import IsEmail from "./services/validation/rules/isEmail";
import MinLength from "./services/validation/rules/minLength";
import MaxLength from "./services/validation/rules/maxLength";
import isUnique from "./services/validation/rules/isUnique";
import passwordConfirmation from "./services/validation/rules/passwordConfirmation";
import IsDecimal from "~/composables/services/validation/rules/isDecimal";

const rulesBindingsList = {
  required: IsRequired,
  isDecimal: IsDecimal,
  isEmail: IsEmail,
  min: MinLength,
  max: MaxLength,
  unique: isUnique,
  passwordConfirmation: passwordConfirmation,
};

interface IErrorObject {
  isDirty: boolean;
  errors: Array<string>;
}

const defaultErrorObject: IErrorObject = { isDirty: false, errors: [] };

const generateErrorsFormData = (formData: any) => {
  let newErrorsFormData = reactive({ ...formData });

  for (let [key, value] of Object.entries(formData)) {
    if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
      newErrorsFormData[key] = { ...defaultErrorObject };
    }
  }

  return newErrorsFormData;
};

export const useValidation = (formData: Record<string, any>, validationFormRules: any): any => {
  const errorsFormData = generateErrorsFormData({ ...formData });

  const getErrorFieldByKeyName = (fieldName: String | any) => errorsFormData[fieldName as keyof typeof errorsFormData];

  const validateField = (fieldName: String | any, fieldRules: String | Array<any> | any) => {
    const formDataField: Object = Object.fromEntries(Object.entries(formData).filter(([key]) => key === fieldName));
    const fieldValue = formDataField[fieldName as keyof typeof formDataField];
    const errorObject = errorsFormData[fieldName as keyof typeof errorsFormData];
    errorObject.errors = [];

    for (let ruleStr of fieldRules) {
      const splitRuleStr = ruleStr.trim().split(":");
      const paramsForRule = splitRuleStr.length > 1 ? { value: splitRuleStr[1] } : {};

      const validationRuleClass = rulesBindingsList[splitRuleStr[0] as keyof typeof rulesBindingsList];
      if (!validationRuleClass) {
        console.error("CALLBACK RULE ERROR: rule -> " + ruleStr);
        continue;
      }

      const validationRuleObject = new validationRuleClass();

      const result = validationRuleObject.passes(fieldValue, paramsForRule);

      const handleValidationError = () => {
        clearFieldErrors(fieldName);
        errorObject.errors.push(validationRuleObject.message(fieldName, paramsForRule));
      };

      if (result instanceof Promise) {
        result
          .then(isValid => {
            if (!isValid) {
              handleValidationError();
            }
          })
          .catch(error => {
            console.error("Validation error:", error);
          });
      } else {
        if (!result) {
          handleValidationError();
        }
      }
    }
  };

  const doValidateField = (fieldName: String, value: any = null) => {
    if (value !== null) formData[fieldName as keyof typeof formData] = value;
    setIsDirty(fieldName);
    validateField(fieldName, validationFormRules[fieldName as keyof typeof validationFormRules]);
  };

  const setAllFieldsAsIsDirtyAndClearErrors = () => {
    for (let errorObject of Object.values(errorsFormData) as Array<any>) {
      if (
        !errorObject ||
        typeof errorObject !== "object" ||
        !Object.prototype.hasOwnProperty.call(errorObject, "isDirty") ||
        !Array.isArray(errorObject.errors)
      ) {
        continue;
      }
      errorObject.isDirty = true;
      errorObject.errors = [];
    }
  };

  const clearFieldsErrors = () => {
    for (const key in errorsFormData) {
      if (Object.prototype.hasOwnProperty.call(errorsFormData, key)) {
        if (
          !errorsFormData[key] ||
          typeof errorsFormData[key] !== "object" ||
          !Object.prototype.hasOwnProperty.call(errorsFormData[key], "isDirty") ||
          !Array.isArray(errorsFormData[key].errors)
        ) {
          continue;
        }
        errorsFormData[key].isDirty = false;
        errorsFormData[key].errors = [];
      }
    }
  };
  const clearFieldErrors = (fieldName: String) => {
    if (
      !errorsFormData[fieldName as keyof typeof errorsFormData] ||
      typeof errorsFormData[fieldName as keyof typeof errorsFormData] !== "object" ||
      !Array.isArray(errorsFormData[fieldName as keyof typeof errorsFormData].errors)
    ) {
      return;
    }
    errorsFormData[fieldName as keyof typeof errorsFormData].errors = [];
  };

  const setIsDirty = (fieldName: String, isDirtyValue: Boolean = true): void => {
    if (
      !errorsFormData[fieldName as keyof typeof errorsFormData] ||
      typeof errorsFormData[fieldName as keyof typeof errorsFormData] !== "object" ||
      !Object.prototype.hasOwnProperty.call(errorsFormData[fieldName as keyof typeof errorsFormData], "isDirty")
    ) {
      return;
    }
    errorsFormData[fieldName as keyof typeof errorsFormData].isDirty = isDirtyValue;
  };

  const isFormValid = () =>
    !Object.values(errorsFormData).some((e: any) => Array.isArray(e?.errors) && e.errors.length > 0);

  const isFieldDirty = (fieldName: String | any) => getErrorFieldByKeyName(fieldName).isDirty;

  const doValidate = () => {
    setAllFieldsAsIsDirtyAndClearErrors();

    Object.entries(validationFormRules).forEach(([fieldName, fieldRules]) => validateField(fieldName, fieldRules));

    return isFormValid();
  };

  return {
    errorsFormData,
    validateField,
    doValidateField,
    clearFieldErrors,
    clearFieldsErrors,
    setIsDirty,
    doValidate,
  };
};

export default useValidation;
