import {reactive} from "vue";
import debounce from 'lodash/debounce';

import type { IFormDataDto } from "~/pages/auth/login/composables"

import IsRequired from "./services/validation/rules/isRequired"
import IsEmail from "./services/validation/rules/isEmail"
import MinLength from "./services/validation/rules/minLength"
import MaxLength from "./services/validation/rules/maxLength"
import isUnique from "./services/validation/rules/isUnique"
import passwordConfirmation from "./services/validation/rules/passwordConfirmation"

const rulesBindingsList = {
  required: IsRequired,
  isEmail: IsEmail,
  min: MinLength,
  max: MaxLength,
  unique: isUnique,
  passwordConfirmation: passwordConfirmation,
}

interface IErrorObject {
  isDirty: boolean
  errors: Array<string>
}

const defaultErrorObject: IErrorObject = { isDirty: false, errors: [] }

const generateErrorsFormData = (formData: any) => {
  let newErrorsFormData = reactive({ ...formData })

  for (let [key, value] of Object.entries(formData)) {
    if (typeof value !== "object") {
      newErrorsFormData[key] = { ...defaultErrorObject }
    }
  }

  return newErrorsFormData
}

export const useValidation = (
    formData: IFormDataDto,
    validationFormRules: any,
): any => {
  const errorsFormData = generateErrorsFormData({ ...formData })

  const getErrorFieldByKeyName = (fieldName: String | any) =>
      errorsFormData[fieldName as keyof typeof errorsFormData]

  const validateField = (
      fieldName: String | any,
      fieldRules: String | Array<any> | any,
  ) => {
    const formDataField: Object = Object.fromEntries(
        Object.entries(formData).filter(([key]) => key === fieldName),
    )
    const fieldValue =
        formDataField[fieldName as keyof typeof formDataField]
    const errorObject =
        errorsFormData[fieldName as keyof typeof errorsFormData]
    errorObject.errors = []

    for (let ruleStr of fieldRules) {
      const splitRuleStr = ruleStr.trim().split(":")
      const paramsForRule =
          splitRuleStr.length > 1 ? { value: splitRuleStr[1] } : {}

      const validationRuleClass =
          rulesBindingsList[
              splitRuleStr[0] as keyof typeof rulesBindingsList
              ]
      if (!validationRuleClass) {
        console.error("CALLBACK RULE ERROR: rule -> " + ruleStr)
        continue
      }

      const validationRuleObject = new validationRuleClass();

      const result = validationRuleObject.passes(fieldValue, paramsForRule);

      const handleValidationError = () => {
        clearFieldErrors(fieldName);
        errorObject.errors.push(validationRuleObject.message(fieldName, paramsForRule));
      }

      if (result instanceof Promise) {
        result.then(isValid => {
          if (!isValid) {
            handleValidationError();
          }
        }).catch(error => {
          console.error('Validation error:', error);
        });
      } else {
        if (!result) {
          handleValidationError();
        }
      }

    }
  }

  const doValidateField = (fieldName: String, value: any = null) => {
    if (value !== null) formData[fieldName as keyof typeof formData] = value
    setIsDirty(fieldName)
    validateField(
        fieldName,
        validationFormRules[fieldName as keyof typeof validationFormRules],
    )
  }

  const setAllFieldsAsIsDirtyAndClearErrors = () => {
    for (let errorEntry of Object.entries(errorsFormData)) {
      let errorObject: any = Object.fromEntries([errorEntry])[
          errorEntry[0]
          ]
      errorObject.isDirty = true
      errorObject.errors = []
    }
  }

  const clearFieldsErrors = () => {
    for (const key in errorsFormData) {
      if (Object.prototype.hasOwnProperty.call(errorsFormData, key)) {
        errorsFormData[key].isDirty = false
        errorsFormData[key].errors = []
      }
    }
  }
  const clearFieldErrors = (fieldName: String) => {
    errorsFormData[fieldName as keyof typeof errorsFormData].errors = []
  }

  const setIsDirty = (
      fieldName: String,
      isDirtyValue: Boolean = true,
  ): void => {
    errorsFormData[fieldName as keyof typeof errorsFormData].isDirty =
        isDirtyValue
  }

  const isFormValid = () =>
      !Object.values(errorsFormData).some((e: any) => e.errors.length > 0)

  const isFieldDirty = (fieldName: String | any) =>
      getErrorFieldByKeyName(fieldName).isDirty

  const doValidate = () => {
    setAllFieldsAsIsDirtyAndClearErrors()

    Object.entries(validationFormRules).forEach(([fieldName, fieldRules]) =>
        validateField(fieldName, fieldRules),
    )

    return isFormValid()
  }

  return {
    errorsFormData,
    validateField,
    doValidateField,
    clearFieldErrors,
    clearFieldsErrors,
    setIsDirty,
    doValidate,
  }
}

export default useValidation
