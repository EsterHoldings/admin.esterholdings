import { isEmailRegEx } from "~/constants/validation";

export const isRequired = (value: any): Boolean => {
  return !value;
};

export const isEmail = (value: any): Boolean => {
  return isEmailRegEx.test(value);
};

export const maxLength = (value: any, maxLengthValue: any): Boolean => {
  return value.length > maxLengthValue;
};

export const minLength = (value: any, minLengthValue: any): Boolean => {
  return value.length < minLengthValue;
};

export const confirmPassword = (value: any, password: any): Boolean => {
  return value != password;
};

// DEPRECATED
export const maxValue = (value: any, maxValue: any = 100): Boolean => {
  return value.length > maxValue;
};

// DEPRECATED
export const minValue = (value: any, minValue: any = 3): Boolean => {
  return value.length < minValue;
};
