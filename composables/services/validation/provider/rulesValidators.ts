import { isEmailRegEx } from "~/constants/validation";
import { isRequired } from "../rules";

export const isRequiredValidator = (
  fieldName: any,
  errorObject: any,
  value: any
): any => {
  errorObject = [];

  if (isRequired(value)) {
    errorObject = ["qwqwqd", "fdsfsdfsdfsd"];
  }
};

export const isEmailValidator = (
  fieldName: any,
  errorObject: any,
  value: any
): any => isEmailRegEx.test(value);

export const maxLengthValidator = (
  fieldName: any,
  errorObject: any,
  value: any,
  maxLengthValue: Number
): any => value.length >= maxLengthValue;

export const minLengthValidator = (
  fieldName: any,
  errorObject: any,
  value: any,
  minLengthValue: Number
): any => value.length <= minLengthValue;

export const confirmPasswordValidator = (
  fieldName: any,
  errorObject: any,
  value: any,
  password: String
): any => value != password;
